import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  // Create ticket_counters table for atomic ticket allocation
  await sql`
    CREATE TABLE ticket_counters (
      competition_id UUID PRIMARY KEY REFERENCES competitions(id) ON DELETE CASCADE,
      last_ticket_number INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `.execute(db);

  // Add index for performance
  await sql`CREATE INDEX idx_ticket_counters_competition_id ON ticket_counters(competition_id)`.execute(
    db
  );

  // Initialize counters for existing competitions
  await sql`
    INSERT INTO ticket_counters (competition_id, last_ticket_number)
    SELECT id, tickets_sold 
    FROM competitions 
    WHERE status IN ('active', 'draft')
    ON CONFLICT (competition_id) DO NOTHING
  `.execute(db);

  // Add trigger to automatically create counter when competition is created
  await sql`
    CREATE OR REPLACE FUNCTION create_ticket_counter_for_competition()
    RETURNS TRIGGER AS $$
    BEGIN
      INSERT INTO ticket_counters (competition_id, last_ticket_number)
      VALUES (NEW.id, 0)
      ON CONFLICT (competition_id) DO NOTHING;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `.execute(db);

  await sql`
    CREATE TRIGGER trigger_create_ticket_counter
    AFTER INSERT ON competitions
    FOR EACH ROW
    EXECUTE FUNCTION create_ticket_counter_for_competition();
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop trigger and function
  await sql`DROP TRIGGER IF EXISTS trigger_create_ticket_counter ON competitions`.execute(
    db
  );
  await sql`DROP FUNCTION IF EXISTS create_ticket_counter_for_competition()`.execute(
    db
  );

  // Drop indexes
  await sql`DROP INDEX IF EXISTS idx_ticket_counters_competition_id`.execute(
    db
  );

  // Drop table
  await sql`DROP TABLE IF EXISTS ticket_counters`.execute(db);
}
