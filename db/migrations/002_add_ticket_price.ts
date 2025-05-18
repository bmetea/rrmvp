import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await sql`
    ALTER TABLE prizes 
    ADD COLUMN ticket_price integer NOT NULL DEFAULT 0 
    CHECK (ticket_price >= 0)
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`
    ALTER TABLE prizes 
    DROP COLUMN ticket_price
  `.execute(db);
}
