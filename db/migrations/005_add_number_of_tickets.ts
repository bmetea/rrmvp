import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  // Add number_of_tickets to wallet_transactions table
  await sql`
    ALTER TABLE wallet_transactions 
    ADD COLUMN number_of_tickets INTEGER DEFAULT 1
  `.execute(db);

  // Add number_of_tickets to tickets table
  await sql`
    ALTER TABLE tickets 
    ADD COLUMN number_of_tickets INTEGER DEFAULT 1
  `.execute(db);

  // Add a check constraint to ensure number_of_tickets is positive
  await sql`
    ALTER TABLE wallet_transactions 
    ADD CONSTRAINT check_positive_tickets 
    CHECK (number_of_tickets > 0)
  `.execute(db);

  await sql`
    ALTER TABLE tickets 
    ADD CONSTRAINT check_positive_tickets 
    CHECK (number_of_tickets > 0)
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop the check constraints first
  await sql`
    ALTER TABLE wallet_transactions 
    DROP CONSTRAINT IF EXISTS check_positive_tickets
  `.execute(db);

  await sql`
    ALTER TABLE tickets 
    DROP CONSTRAINT IF EXISTS check_positive_tickets
  `.execute(db);

  // Drop the columns
  await sql`
    ALTER TABLE wallet_transactions 
    DROP COLUMN IF EXISTS number_of_tickets
  `.execute(db);

  await sql`
    ALTER TABLE tickets 
    DROP COLUMN IF EXISTS number_of_tickets
  `.execute(db);
}
