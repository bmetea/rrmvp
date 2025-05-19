import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await sql`
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      clerk_id VARCHAR(255) NOT NULL UNIQUE,
      email VARCHAR(255) NOT NULL UNIQUE,
      first_name VARCHAR(255),
      last_name VARCHAR(255),
      image_url TEXT,
      username VARCHAR(255) UNIQUE,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP TABLE IF EXISTS users`.execute(db);
}
