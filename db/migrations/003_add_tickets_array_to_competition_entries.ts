import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  // Add tickets array column to competition_entries table
  await sql`
    ALTER TABLE competition_entries
    ADD COLUMN tickets INTEGER[] DEFAULT '{}'::INTEGER[]
  `.execute(db);

  // Add GIN index for efficient array operations
  await sql`
    CREATE INDEX idx_competition_entries_tickets ON competition_entries USING GIN (tickets)
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop the index first
  await sql`
    DROP INDEX IF EXISTS idx_competition_entries_tickets
  `.execute(db);

  // Drop the column
  await sql`
    ALTER TABLE competition_entries
    DROP COLUMN IF EXISTS tickets
  `.execute(db);
}
