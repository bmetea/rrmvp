import { sql } from "kysely";
import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  // Remove min_ticket_percentage and max_ticket_percentage columns from competition_prizes
  await sql`ALTER TABLE competition_prizes DROP COLUMN IF EXISTS min_ticket_percentage`.execute(
    db
  );
  await sql`ALTER TABLE competition_prizes DROP COLUMN IF EXISTS max_ticket_percentage`.execute(
    db
  );

  // Clear any non-numeric ticket_number data before conversion
  await sql`DELETE FROM tickets WHERE ticket_number !~ '^[0-9]+$'`.execute(db);

  // Change tickets.ticket_number from VARCHAR to INTEGER
  // First drop the unique constraint
  await sql`ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_ticket_number_key`.execute(
    db
  );

  // Change the column type
  await sql`
    ALTER TABLE tickets 
    ALTER COLUMN ticket_number TYPE INTEGER 
    USING ticket_number::INTEGER
  `.execute(db);

  // Add unique constraint back
  await sql`ALTER TABLE tickets ADD CONSTRAINT tickets_ticket_number_key UNIQUE (ticket_number)`.execute(
    db
  );

  // Remove competition_prize_id and wallet_transaction_id columns from winners
  await sql`ALTER TABLE winners DROP COLUMN IF EXISTS competition_prize_id`.execute(
    db
  );
  await sql`ALTER TABLE winners DROP COLUMN IF EXISTS wallet_transaction_id`.execute(
    db
  );

  // Drop foreign key constraints for the removed columns
  await sql`ALTER TABLE winners DROP CONSTRAINT IF EXISTS winners_competition_prize_id_fkey`.execute(
    db
  );
  await sql`ALTER TABLE winners DROP CONSTRAINT IF EXISTS winners_wallet_transaction_id_fkey`.execute(
    db
  );

  // Change winning_ticket_numbers column from TEXT[] to INTEGER[]
  // First, we need to handle the conversion by creating a temporary column
  await sql`ALTER TABLE competition_prizes ADD COLUMN winning_ticket_numbers_new INTEGER[]`.execute(
    db
  );

  // Copy and convert data - handle only numeric values
  await sql`
    UPDATE competition_prizes 
    SET winning_ticket_numbers_new = (
      CASE 
        WHEN winning_ticket_numbers IS NULL THEN NULL
        ELSE array(
          SELECT (unnest::TEXT)::INTEGER 
          FROM unnest(winning_ticket_numbers)
          WHERE unnest::TEXT ~ '^[0-9]+$'
        )
      END
    )
  `.execute(db);

  // Drop the old column and rename the new one
  await sql`ALTER TABLE competition_prizes DROP COLUMN winning_ticket_numbers`.execute(
    db
  );
  await sql`ALTER TABLE competition_prizes RENAME COLUMN winning_ticket_numbers_new TO winning_ticket_numbers`.execute(
    db
  );
}

export async function down(db: Kysely<any>): Promise<void> {
  // Revert winning_ticket_numbers column back to TEXT[]
  await sql`ALTER TABLE competition_prizes ADD COLUMN winning_ticket_numbers_old TEXT[]`.execute(
    db
  );

  await sql`
    UPDATE competition_prizes 
    SET winning_ticket_numbers_old = (
      CASE 
        WHEN winning_ticket_numbers IS NULL THEN NULL
        ELSE array(
          SELECT (unnest::INTEGER)::TEXT 
          FROM unnest(winning_ticket_numbers)
        )
      END
    )
  `.execute(db);

  await sql`ALTER TABLE competition_prizes DROP COLUMN winning_ticket_numbers`.execute(
    db
  );
  await sql`ALTER TABLE competition_prizes RENAME COLUMN winning_ticket_numbers_old TO winning_ticket_numbers`.execute(
    db
  );

  // Add back min_ticket_percentage and max_ticket_percentage columns to competition_prizes
  await sql`
    ALTER TABLE competition_prizes 
    ADD COLUMN min_ticket_percentage DECIMAL(5,2) CHECK (min_ticket_percentage >= 0 AND min_ticket_percentage <= 100)
  `.execute(db);

  await sql`
    ALTER TABLE competition_prizes 
    ADD COLUMN max_ticket_percentage DECIMAL(5,2) CHECK (max_ticket_percentage >= 0 AND max_ticket_percentage <= 100)
  `.execute(db);

  // Change tickets.ticket_number back to VARCHAR
  await sql`ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_ticket_number_key`.execute(
    db
  );

  await sql`
    ALTER TABLE tickets 
    ALTER COLUMN ticket_number TYPE VARCHAR(50) 
    USING ticket_number::VARCHAR(50)
  `.execute(db);

  await sql`ALTER TABLE tickets ADD CONSTRAINT tickets_ticket_number_key UNIQUE (ticket_number)`.execute(
    db
  );

  // Add back competition_prize_id and wallet_transaction_id columns to winners
  await sql`
    ALTER TABLE winners 
    ADD COLUMN competition_prize_id UUID REFERENCES competition_prizes(id) ON DELETE RESTRICT
  `.execute(db);

  await sql`
    ALTER TABLE winners 
    ADD COLUMN wallet_transaction_id UUID REFERENCES wallet_transactions(id) ON DELETE RESTRICT
  `.execute(db);
}
