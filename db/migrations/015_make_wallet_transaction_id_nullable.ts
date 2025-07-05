import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  // Make wallet_transaction_id nullable in competition_entries
  await sql`
    ALTER TABLE competition_entries
    ALTER COLUMN wallet_transaction_id DROP NOT NULL
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  // Make wallet_transaction_id NOT NULL again (this might fail if there are null values)
  await sql`
    ALTER TABLE competition_entries
    ALTER COLUMN wallet_transaction_id SET NOT NULL
  `.execute(db);
}
