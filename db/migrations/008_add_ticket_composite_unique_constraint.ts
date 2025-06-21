import { sql } from "kysely";
import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  // First, drop the existing unique constraint on ticket_number alone
  await sql`ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_ticket_number_key`.execute(
    db
  );

  // Add composite unique constraint on competition_id and ticket_number
  await sql`
    ALTER TABLE tickets 
    ADD CONSTRAINT tickets_competition_ticket_unique 
    UNIQUE (competition_id, ticket_number)
  `.execute(db);

  // Add a comment to explain the constraint
  await sql`
    COMMENT ON CONSTRAINT tickets_competition_ticket_unique ON tickets IS 
    'Ensures that each ticket number is unique within a competition'
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop the composite unique constraint
  await sql`ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_competition_ticket_unique`.execute(
    db
  );

  // Add back the original unique constraint on ticket_number alone
  await sql`ALTER TABLE tickets ADD CONSTRAINT tickets_ticket_number_key UNIQUE (ticket_number)`.execute(
    db
  );
}
