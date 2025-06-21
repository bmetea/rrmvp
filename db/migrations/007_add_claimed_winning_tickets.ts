import { sql } from "kysely";
import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  // Add claimed_winning_tickets column to track which winning tickets have been claimed
  await sql`
    ALTER TABLE competition_prizes 
    ADD COLUMN claimed_winning_tickets INTEGER[] DEFAULT '{}'
  `.execute(db);

  // Add a comment to explain the column
  await sql`
    COMMENT ON COLUMN competition_prizes.claimed_winning_tickets IS 
    'Array of winning ticket numbers that have been claimed by users. These numbers are moved from winning_ticket_numbers when a ticket is won.'
  `.execute(db);

  // Add a check constraint to ensure claimed tickets are valid
  await sql`
    ALTER TABLE competition_prizes 
    ADD CONSTRAINT competition_prizes_claimed_tickets_check 
    CHECK (
      claimed_winning_tickets IS NULL OR 
      array_length(claimed_winning_tickets, 1) IS NULL OR
      array_length(claimed_winning_tickets, 1) >= 0
    )
  `.execute(db);

  // Add an index for better performance when querying claimed tickets
  await sql`
    CREATE INDEX idx_competition_prizes_claimed_tickets 
    ON competition_prizes USING GIN (claimed_winning_tickets)
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop the index
  await sql`DROP INDEX IF EXISTS idx_competition_prizes_claimed_tickets`.execute(
    db
  );

  // Drop the check constraint
  await sql`ALTER TABLE competition_prizes DROP CONSTRAINT IF EXISTS competition_prizes_claimed_tickets_check`.execute(
    db
  );

  // Drop the claimed_winning_tickets column
  await sql`ALTER TABLE competition_prizes DROP COLUMN IF EXISTS claimed_winning_tickets`.execute(
    db
  );
}
