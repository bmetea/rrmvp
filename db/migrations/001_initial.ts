import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  // Enable UUID extension
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`.execute(db);

  await sql`
    CREATE TABLE prizes (
      id SERIAL PRIMARY KEY,
      document_id UUID NOT NULL DEFAULT uuid_generate_v4(),
      slug VARCHAR(255) NOT NULL UNIQUE,
      title VARCHAR(255) NOT NULL,
      subtitle TEXT,
      tickets_total INTEGER NOT NULL,
      tickets_sold INTEGER NOT NULL DEFAULT 0,
      live BOOLEAN,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      published_at TIMESTAMP
    )
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP TABLE IF EXISTS prizes`.execute(db);
  await sql`DROP EXTENSION IF EXISTS "uuid-ossp"`.execute(db);
}
