import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  // Add media_info column to competitions table
  await sql`
    ALTER TABLE competitions
    ADD COLUMN media_info JSONB
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  // Remove media_info column from competitions table
  await sql`
    ALTER TABLE competitions
    DROP COLUMN IF EXISTS media_info
  `.execute(db);
}
