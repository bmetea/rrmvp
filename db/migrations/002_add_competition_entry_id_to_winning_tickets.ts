import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  // Add competition_entry_id column to winning_tickets table
  await sql`
    ALTER TABLE winning_tickets
    ADD COLUMN competition_entry_id UUID REFERENCES competition_entries(id) ON DELETE SET NULL
  `.execute(db);

  // Add index for the new column
  await sql`
    CREATE INDEX idx_winning_tickets_competition_entry_id ON winning_tickets(competition_entry_id)
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop the index first
  await sql`
    DROP INDEX IF EXISTS idx_winning_tickets_competition_entry_id
  `.execute(db);

  // Drop the column
  await sql`
    ALTER TABLE winning_tickets
    DROP COLUMN IF EXISTS competition_entry_id
  `.execute(db);
}
