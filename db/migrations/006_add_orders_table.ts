import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  // Create orders table
  await sql`
    CREATE TABLE orders (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      currency VARCHAR(3) NOT NULL DEFAULT 'GBP',
      status VARCHAR(50) NOT NULL DEFAULT 'pending',
      total_tickets INTEGER NOT NULL DEFAULT 0,
      wallet_amount INTEGER DEFAULT 0,
      payment_amount INTEGER DEFAULT 0,
      total_amount INTEGER NOT NULL,
      order_summary JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `.execute(db);

  // Add indexes
  await sql`CREATE INDEX orders_user_id_idx ON orders(user_id)`.execute(db);
  await sql`CREATE INDEX orders_status_idx ON orders(status)`.execute(db);
  await sql`CREATE INDEX orders_created_at_idx ON orders(created_at)`.execute(
    db
  );

  // Add order_id column to competition_entries
  await sql`ALTER TABLE competition_entries ADD COLUMN order_id UUID REFERENCES orders(id) ON DELETE SET NULL`.execute(
    db
  );

  // Add order_id column to wallet_transactions
  await sql`ALTER TABLE wallet_transactions ADD COLUMN order_id UUID REFERENCES orders(id) ON DELETE SET NULL`.execute(
    db
  );

  // Add order_id column to payment_transactions
  await sql`ALTER TABLE payment_transactions ADD COLUMN order_id UUID REFERENCES orders(id) ON DELETE SET NULL`.execute(
    db
  );

  // Add indexes for order_id foreign keys
  await sql`CREATE INDEX competition_entries_order_id_idx ON competition_entries(order_id)`.execute(
    db
  );
  await sql`CREATE INDEX wallet_transactions_order_id_idx ON wallet_transactions(order_id)`.execute(
    db
  );
  await sql`CREATE INDEX payment_transactions_order_id_idx ON payment_transactions(order_id)`.execute(
    db
  );
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop indexes
  await sql`DROP INDEX IF EXISTS payment_transactions_order_id_idx`.execute(db);
  await sql`DROP INDEX IF EXISTS wallet_transactions_order_id_idx`.execute(db);
  await sql`DROP INDEX IF EXISTS competition_entries_order_id_idx`.execute(db);
  await sql`DROP INDEX IF EXISTS orders_created_at_idx`.execute(db);
  await sql`DROP INDEX IF EXISTS orders_status_idx`.execute(db);
  await sql`DROP INDEX IF EXISTS orders_user_id_idx`.execute(db);

  // Drop order_id columns
  await sql`ALTER TABLE payment_transactions DROP COLUMN IF EXISTS order_id`.execute(
    db
  );
  await sql`ALTER TABLE wallet_transactions DROP COLUMN IF EXISTS order_id`.execute(
    db
  );
  await sql`ALTER TABLE competition_entries DROP COLUMN IF EXISTS order_id`.execute(
    db
  );

  // Drop orders table
  await sql`DROP TABLE IF EXISTS orders`.execute(db);
}
