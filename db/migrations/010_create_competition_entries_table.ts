import { sql } from "kysely";
import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  // Create competition_entries table
  await sql`
    CREATE TABLE competition_entries (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE RESTRICT,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      wallet_transaction_id UUID NOT NULL REFERENCES wallet_transactions(id) ON DELETE RESTRICT,
      purchase_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      status VARCHAR(50) NOT NULL CHECK (status IN ('active', 'used', 'expired')),
      ticket_numbers INTEGER[] NOT NULL DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `.execute(db);

  // Add a comment to explain the table
  await sql`
    COMMENT ON TABLE competition_entries IS 
    'Stores competition entries with multiple ticket numbers per entry, more efficient for bulk purchases'
  `.execute(db);

  // Add a comment to explain the ticket_numbers column
  await sql`
    COMMENT ON COLUMN competition_entries.ticket_numbers IS 
    'Array of ticket numbers for this entry. Each number should be unique within the competition.'
  `.execute(db);

  // Add a check constraint to ensure ticket_numbers array is not empty
  await sql`
    ALTER TABLE competition_entries 
    ADD CONSTRAINT competition_entries_ticket_numbers_check 
    CHECK (array_length(ticket_numbers, 1) > 0)
  `.execute(db);

  // Add a GIN index for efficient array operations (without unique constraint)
  await sql`
    CREATE INDEX idx_competition_entries_ticket_numbers 
    ON competition_entries USING GIN (ticket_numbers)
  `.execute(db);

  // Add indexes for better query performance
  await sql`CREATE INDEX idx_competition_entries_competition_id ON competition_entries(competition_id)`.execute(
    db
  );
  await sql`CREATE INDEX idx_competition_entries_user_id ON competition_entries(user_id)`.execute(
    db
  );
  await sql`CREATE INDEX idx_competition_entries_status ON competition_entries(status)`.execute(
    db
  );
  await sql`CREATE INDEX idx_competition_entries_purchase_date ON competition_entries(purchase_date)`.execute(
    db
  );

  // Create a function to check for duplicate ticket numbers within a competition
  await sql`
    CREATE OR REPLACE FUNCTION check_competition_ticket_uniqueness()
    RETURNS TRIGGER AS $$
    DECLARE
      existing_ticket INTEGER;
    BEGIN
      -- Check for duplicates within the same entry
      IF EXISTS (
        SELECT 1 FROM unnest(NEW.ticket_numbers) AS ticket_num
        GROUP BY ticket_num
        HAVING COUNT(*) > 1
      ) THEN
        RAISE EXCEPTION 'Duplicate ticket numbers within the same entry are not allowed';
      END IF;

      -- Check for duplicates across all entries in the same competition
      SELECT ticket_num INTO existing_ticket
      FROM (
        SELECT unnest(ticket_numbers) AS ticket_num
        FROM competition_entries
        WHERE competition_id = NEW.competition_id
          AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)
        UNION ALL
        SELECT unnest(NEW.ticket_numbers) AS ticket_num
      ) all_tickets
      GROUP BY ticket_num
      HAVING COUNT(*) > 1
      LIMIT 1;

      IF existing_ticket IS NOT NULL THEN
        RAISE EXCEPTION 'Ticket number % already exists in competition %', existing_ticket, NEW.competition_id;
      END IF;

      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `.execute(db);

  // Create trigger to enforce ticket number uniqueness
  await sql`
    CREATE TRIGGER trigger_check_competition_ticket_uniqueness
    BEFORE INSERT OR UPDATE ON competition_entries
    FOR EACH ROW
    EXECUTE FUNCTION check_competition_ticket_uniqueness();
  `.execute(db);

  // Add a trigger to update the updated_at column
  await sql`
    CREATE OR REPLACE FUNCTION update_competition_entries_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `.execute(db);

  await sql`
    CREATE TRIGGER trigger_update_competition_entries_updated_at
    BEFORE UPDATE ON competition_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_competition_entries_updated_at();
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop the triggers
  await sql`DROP TRIGGER IF EXISTS trigger_update_competition_entries_updated_at ON competition_entries`.execute(
    db
  );
  await sql`DROP TRIGGER IF EXISTS trigger_check_competition_ticket_uniqueness ON competition_entries`.execute(
    db
  );

  // Drop the trigger functions
  await sql`DROP FUNCTION IF EXISTS update_competition_entries_updated_at()`.execute(
    db
  );
  await sql`DROP FUNCTION IF EXISTS check_competition_ticket_uniqueness()`.execute(
    db
  );

  // Drop indexes
  await sql`DROP INDEX IF EXISTS idx_competition_entries_purchase_date`.execute(
    db
  );
  await sql`DROP INDEX IF EXISTS idx_competition_entries_status`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_competition_entries_user_id`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_competition_entries_competition_id`.execute(
    db
  );
  await sql`DROP INDEX IF EXISTS idx_competition_entries_ticket_numbers`.execute(
    db
  );

  // Drop the table
  await sql`DROP TABLE IF EXISTS competition_entries`.execute(db);
}
