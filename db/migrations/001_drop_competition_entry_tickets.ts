import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  // Drop the trigger first
  await sql`DROP TRIGGER IF EXISTS trigger_update_competition_entry_tickets_updated_at ON competition_entry_tickets`.execute(
    db
  );

  // Drop the trigger function
  await sql`DROP FUNCTION IF EXISTS update_competition_entry_tickets_updated_at()`.execute(
    db
  );

  // Drop the unique index
  await sql`DROP INDEX IF EXISTS idx_competition_entry_tickets_unique_ticket`.execute(
    db
  );

  // Drop other indexes related to this table
  await sql`DROP INDEX IF EXISTS idx_competition_entry_tickets_competition_entry_id`.execute(
    db
  );
  await sql`DROP INDEX IF EXISTS idx_competition_entry_tickets_competition_id`.execute(
    db
  );
  await sql`DROP INDEX IF EXISTS idx_competition_entry_tickets_ticket_number`.execute(
    db
  );
  await sql`DROP INDEX IF EXISTS idx_competition_entry_tickets_winning_ticket`.execute(
    db
  );

  // Finally drop the table
  await sql`DROP TABLE IF EXISTS competition_entry_tickets`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  // Recreate the competition_entry_tickets table
  await sql`
    CREATE TABLE competition_entry_tickets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      competition_entry_id UUID NOT NULL REFERENCES competition_entries(id) ON DELETE CASCADE,
      competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE RESTRICT,
      ticket_number INTEGER NOT NULL,
      winning_ticket BOOLEAN NOT NULL DEFAULT FALSE,
      prize_id UUID REFERENCES competition_prizes(id) ON DELETE SET NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `.execute(db);

  // Recreate indexes
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

  // Recreate unique constraint
  await sql`CREATE UNIQUE INDEX idx_competition_entry_tickets_unique_ticket ON competition_entry_tickets(competition_id, ticket_number)`.execute(
    db
  );

  // Recreate trigger function
  await sql`
    CREATE OR REPLACE FUNCTION update_competition_entry_tickets_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `.execute(db);

  // Recreate trigger
  await sql`
    CREATE TRIGGER trigger_update_competition_entry_tickets_updated_at
    BEFORE UPDATE ON competition_entry_tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_competition_entry_tickets_updated_at();
  `.execute(db);

  // Add table comment
  await sql`
    COMMENT ON TABLE competition_entry_tickets IS 
    'Stores individual tickets for each competition entry'
  `.execute(db);
}
