import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  // First drop the foreign key constraint
  await sql`
    ALTER TABLE wallets 
    DROP CONSTRAINT IF EXISTS wallets_user_id_fkey
  `.execute(db);

  // Then drop the index if it exists
  await sql`
    DROP INDEX IF EXISTS idx_wallets_user_id
  `.execute(db);

  // Recreate the index without the foreign key constraint
  await sql`
    CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id)
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  // Recreate the foreign key constraint
  await sql`
    ALTER TABLE wallets 
    ADD CONSTRAINT wallets_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE
  `.execute(db);
}
