import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  // Drop old indexes
  await sql`DROP INDEX IF EXISTS idx_competition_entries_wallet_transaction_id`.execute(
    db
  );

  // Drop old columns
  await sql`ALTER TABLE competition_entries DROP COLUMN IF EXISTS wallet_transaction_id`.execute(
    db
  );
  await sql`ALTER TABLE competition_entries DROP COLUMN IF EXISTS payment_transaction_id`.execute(
    db
  );
}

export async function down(db: Kysely<any>): Promise<void> {
  // Add columns back
  await sql`ALTER TABLE competition_entries ADD COLUMN wallet_transaction_id UUID REFERENCES wallet_transactions(id) ON DELETE RESTRICT`.execute(
    db
  );
  await sql`ALTER TABLE competition_entries ADD COLUMN payment_transaction_id UUID REFERENCES payment_transactions(id) ON DELETE SET NULL`.execute(
    db
  );

  // Recreate index
  await sql`CREATE INDEX idx_competition_entries_wallet_transaction_id ON competition_entries(wallet_transaction_id)`.execute(
    db
  );
}
