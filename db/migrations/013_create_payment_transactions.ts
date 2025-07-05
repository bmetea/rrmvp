import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await sql`
    CREATE TABLE payment_transactions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE RESTRICT,
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      checkout_id VARCHAR(64) NOT NULL,
      payment_id VARCHAR(64),
      amount NUMERIC NOT NULL,
      currency VARCHAR(3) NOT NULL,
      status_code VARCHAR(32),
      status_description TEXT,
      brand VARCHAR(32),
      payment_type VARCHAR(16),
      raw_prepare_result JSONB,
      raw_status_result JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `.execute(db);

  await sql`CREATE INDEX idx_payment_transactions_competition_id ON payment_transactions(competition_id)`.execute(
    db
  );
  await sql`CREATE INDEX idx_payment_transactions_user_id ON payment_transactions(user_id)`.execute(
    db
  );
  await sql`CREATE INDEX idx_payment_transactions_checkout_id ON payment_transactions(checkout_id)`.execute(
    db
  );

  // Trigger function for updated_at
  await sql`
    CREATE OR REPLACE FUNCTION update_payment_transactions_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `.execute(db);

  await sql`
    CREATE TRIGGER trigger_update_payment_transactions_updated_at
    BEFORE UPDATE ON payment_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_payment_transactions_updated_at();
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP TRIGGER IF EXISTS trigger_update_payment_transactions_updated_at ON payment_transactions`.execute(
    db
  );
  await sql`DROP FUNCTION IF EXISTS update_payment_transactions_updated_at`.execute(
    db
  );
  await sql`DROP TABLE IF EXISTS payment_transactions`.execute(db);
}
