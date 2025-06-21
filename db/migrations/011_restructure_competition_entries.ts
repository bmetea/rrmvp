import { sql } from "kysely";
import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  // Drop the existing competition_entries table and its dependencies
  await sql`DROP TRIGGER IF EXISTS trigger_update_competition_entries_updated_at ON competition_entries`.execute(
    db
  );
  await sql`DROP TRIGGER IF EXISTS trigger_check_competition_ticket_uniqueness ON competition_entries`.execute(
    db
  );
  await sql`DROP FUNCTION IF EXISTS update_competition_entries_updated_at()`.execute(
    db
  );
  await sql`DROP FUNCTION IF EXISTS check_competition_ticket_uniqueness()`.execute(
    db
  );
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
  await sql`DROP TABLE IF EXISTS competition_entries`.execute(db);

  // Create simplified competition_entries table
  await sql`
    CREATE TABLE competition_entries (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE RESTRICT,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      wallet_transaction_id UUID NOT NULL REFERENCES wallet_transactions(id) ON DELETE RESTRICT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `.execute(db);

  // Create competition_entry_tickets table
  await sql`
    CREATE TABLE competition_entry_tickets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      competition_entry_id UUID NOT NULL REFERENCES competition_entries(id) ON DELETE CASCADE,
      competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE RESTRICT,
      ticket_number INTEGER NOT NULL,
      winning_ticket BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `.execute(db);

  // Add comments
  await sql`
    COMMENT ON TABLE competition_entries IS 
    'Stores competition entries - one entry per purchase transaction'
  `.execute(db);

  await sql`
    COMMENT ON TABLE competition_entry_tickets IS 
    'Stores individual tickets for each competition entry'
  `.execute(db);

  // Add indexes for competition_entries
  await sql`CREATE INDEX idx_competition_entries_competition_id ON competition_entries(competition_id)`.execute(
    db
  );
  await sql`CREATE INDEX idx_competition_entries_user_id ON competition_entries(user_id)`.execute(
    db
  );
  await sql`CREATE INDEX idx_competition_entries_wallet_transaction_id ON competition_entries(wallet_transaction_id)`.execute(
    db
  );

  // Add indexes for competition_entry_tickets
  await sql`CREATE INDEX idx_competition_entry_tickets_competition_entry_id ON competition_entry_tickets(competition_entry_id)`.execute(
    db
  );
  await sql`CREATE INDEX idx_competition_entry_tickets_competition_id ON competition_entry_tickets(competition_id)`.execute(
    db
  );
  await sql`CREATE INDEX idx_competition_entry_tickets_ticket_number ON competition_entry_tickets(ticket_number)`.execute(
    db
  );
  await sql`CREATE INDEX idx_competition_entry_tickets_winning_ticket ON competition_entry_tickets(winning_ticket)`.execute(
    db
  );

  // Add unique constraint to ensure ticket numbers are unique within a competition
  await sql`
    CREATE UNIQUE INDEX idx_competition_entry_tickets_unique_ticket 
    ON competition_entry_tickets(competition_id, ticket_number)
  `.execute(db);

  // Add trigger to update updated_at for competition_entries
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

  // Add trigger to update updated_at for competition_entry_tickets
  await sql`
    CREATE OR REPLACE FUNCTION update_competition_entry_tickets_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `.execute(db);

  await sql`
    CREATE TRIGGER trigger_update_competition_entry_tickets_updated_at
    BEFORE UPDATE ON competition_entry_tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_competition_entry_tickets_updated_at();
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop triggers
  await sql`DROP TRIGGER IF EXISTS trigger_update_competition_entry_tickets_updated_at ON competition_entry_tickets`.execute(
    db
  );
  await sql`DROP TRIGGER IF EXISTS trigger_update_competition_entries_updated_at ON competition_entries`.execute(
    db
  );

  // Drop trigger functions
  await sql`DROP FUNCTION IF EXISTS update_competition_entry_tickets_updated_at()`.execute(
    db
  );
  await sql`DROP FUNCTION IF EXISTS update_competition_entries_updated_at()`.execute(
    db
  );

  // Drop indexes
  await sql`DROP INDEX IF EXISTS idx_competition_entry_tickets_unique_ticket`.execute(
    db
  );
  await sql`DROP INDEX IF EXISTS idx_competition_entry_tickets_winning_ticket`.execute(
    db
  );
  await sql`DROP INDEX IF EXISTS idx_competition_entry_tickets_ticket_number`.execute(
    db
  );
  await sql`DROP INDEX IF EXISTS idx_competition_entry_tickets_competition_id`.execute(
    db
  );
  await sql`DROP INDEX IF EXISTS idx_competition_entry_tickets_competition_entry_id`.execute(
    db
  );
  await sql`DROP INDEX IF EXISTS idx_competition_entries_wallet_transaction_id`.execute(
    db
  );
  await sql`DROP INDEX IF EXISTS idx_competition_entries_user_id`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_competition_entries_competition_id`.execute(
    db
  );

  // Drop tables
  await sql`DROP TABLE IF EXISTS competition_entry_tickets`.execute(db);
  await sql`DROP TABLE IF EXISTS competition_entries`.execute(db);
}
