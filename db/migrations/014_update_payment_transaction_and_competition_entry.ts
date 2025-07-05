import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  // Remove competition_id from payment_transactions
  await sql`ALTER TABLE payment_transactions DROP COLUMN IF EXISTS competition_id`.execute(
    db
  );

  // Add payment_transaction_id to competition_entries
  await sql`
    ALTER TABLE competition_entries
    ADD COLUMN payment_transaction_id UUID REFERENCES payment_transactions(id) ON DELETE SET NULL
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  // Remove payment_transaction_id from competition_entries
  await sql`ALTER TABLE competition_entries DROP COLUMN IF EXISTS payment_transaction_id`.execute(
    db
  );

  // Add competition_id back to payment_transactions (as nullable, you may want to adjust this)
  await sql`ALTER TABLE payment_transactions ADD COLUMN competition_id UUID`.execute(
    db
  );
}
