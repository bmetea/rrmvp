import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  // First drop the foreign key constraint
  await sql`
    ALTER TABLE users 
    DROP CONSTRAINT IF EXISTS fk_users_wallet
  `.execute(db);

  // Then drop the wallet_id column
  await sql`
    ALTER TABLE users 
    DROP COLUMN IF EXISTS wallet_id
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  // Add the wallet_id column back
  await sql`
    ALTER TABLE users 
    ADD COLUMN wallet_id UUID
  `.execute(db);

  // Recreate the foreign key constraint
  await sql`
    ALTER TABLE users 
    ADD CONSTRAINT fk_users_wallet 
    FOREIGN KEY (wallet_id) 
    REFERENCES wallets(id) 
    ON DELETE RESTRICT
  `.execute(db);
}
