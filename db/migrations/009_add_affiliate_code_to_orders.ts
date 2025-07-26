import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  // Add affiliate_code column to orders table
  await sql`ALTER TABLE orders ADD COLUMN affiliate_code VARCHAR(100)`.execute(
    db
  );

  // Add index for affiliate_code for reporting queries
  await sql`CREATE INDEX orders_affiliate_code_idx ON orders(affiliate_code)`.execute(
    db
  );
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop index and column
  await sql`DROP INDEX IF EXISTS orders_affiliate_code_idx`.execute(db);
  await sql`ALTER TABLE orders DROP COLUMN IF EXISTS affiliate_code`.execute(
    db
  );
}
