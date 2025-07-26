import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  // Drop the index that includes reference_id
  await sql`DROP INDEX IF EXISTS idx_wallet_transactions_reference`.execute(db);

  // Drop the reference_id column
  await sql`ALTER TABLE wallet_transactions DROP COLUMN IF EXISTS reference_id`.execute(
    db
  );

  // Create new index on reference_type only (since we're keeping that)
  await sql`CREATE INDEX idx_wallet_transactions_reference_type ON wallet_transactions(reference_type)`.execute(
    db
  );
}

export async function down(db: Kysely<any>): Promise<void> {
  // Add back the reference_id column
  await sql`ALTER TABLE wallet_transactions ADD COLUMN reference_id UUID`.execute(
    db
  );

  // Drop the single-column index
  await sql`DROP INDEX IF EXISTS idx_wallet_transactions_reference_type`.execute(
    db
  );

  // Recreate the original compound index
  await sql`CREATE INDEX idx_wallet_transactions_reference ON wallet_transactions(reference_type, reference_id)`.execute(
    db
  );
}
