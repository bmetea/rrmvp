import { sql } from "kysely";
import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  // Drop the old winners table first (since it depends on tickets)
  await sql`DROP TRIGGER IF EXISTS trigger_update_winners_updated_at ON winners`.execute(
    db
  );
  await sql`DROP FUNCTION IF EXISTS update_winners_updated_at()`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_winners_competition_id`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_winners_user_id`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_winners_prize_id`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_winners_ticket_number`.execute(db);
  await sql`DROP TABLE IF EXISTS winners`.execute(db);

  // Drop the old tickets table and its dependencies
  await sql`DROP TRIGGER IF EXISTS trigger_update_tickets_updated_at ON tickets`.execute(
    db
  );
  await sql`DROP FUNCTION IF EXISTS update_tickets_updated_at()`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_tickets_competition_id`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_tickets_user_id`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_tickets_status`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_tickets_purchase_date`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_tickets_unique_ticket`.execute(db);
  await sql`DROP TABLE IF EXISTS tickets`.execute(db);

  // Add a comment to document the change
  await sql`
    COMMENT ON TABLE competition_entries IS 
    'Replaces the old tickets table - stores competition entries with multiple tickets per entry'
  `.execute(db);

  await sql`
    COMMENT ON TABLE competition_entry_tickets IS 
    'Replaces the old tickets table - stores individual tickets for each competition entry'
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  // Recreate the tickets table first (if needed for rollback)
  await sql`
    CREATE TABLE tickets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE RESTRICT,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      wallet_transaction_id UUID NOT NULL REFERENCES wallet_transactions(id) ON DELETE RESTRICT,
      purchase_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      status VARCHAR(50) NOT NULL CHECK (status IN ('active', 'used', 'expired')),
      ticket_number INTEGER NOT NULL,
      number_of_tickets INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `.execute(db);

  // Recreate the winners table (if needed for rollback)
  await sql`
    CREATE TABLE winners (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE RESTRICT,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      prize_id UUID NOT NULL REFERENCES competition_prizes(id) ON DELETE RESTRICT,
      ticket_id UUID REFERENCES tickets(id) ON DELETE RESTRICT,
      ticket_number INTEGER NOT NULL,
      claimed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `.execute(db);

  // Recreate indexes for tickets
  await sql`CREATE INDEX idx_tickets_competition_id ON tickets(competition_id)`.execute(
    db
  );
  await sql`CREATE INDEX idx_tickets_user_id ON tickets(user_id)`.execute(db);
  await sql`CREATE INDEX idx_tickets_status ON tickets(status)`.execute(db);
  await sql`CREATE INDEX idx_tickets_purchase_date ON tickets(purchase_date)`.execute(
    db
  );
  await sql`CREATE UNIQUE INDEX idx_tickets_unique_ticket ON tickets(competition_id, ticket_number)`.execute(
    db
  );

  // Recreate indexes for winners
  await sql`CREATE INDEX idx_winners_competition_id ON winners(competition_id)`.execute(
    db
  );
  await sql`CREATE INDEX idx_winners_user_id ON winners(user_id)`.execute(db);
  await sql`CREATE INDEX idx_winners_prize_id ON winners(prize_id)`.execute(db);
  await sql`CREATE INDEX idx_winners_ticket_number ON winners(ticket_number)`.execute(
    db
  );

  // Recreate triggers for tickets
  await sql`
    CREATE OR REPLACE FUNCTION update_tickets_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `.execute(db);

  await sql`
    CREATE TRIGGER trigger_update_tickets_updated_at
    BEFORE UPDATE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_tickets_updated_at();
  `.execute(db);

  // Recreate triggers for winners
  await sql`
    CREATE OR REPLACE FUNCTION update_winners_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `.execute(db);

  await sql`
    CREATE TRIGGER trigger_update_winners_updated_at
    BEFORE UPDATE ON winners
    FOR EACH ROW
    EXECUTE FUNCTION update_winners_updated_at();
  `.execute(db);
}
