import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  // Enable UUID extension
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`.execute(db);

  await db.schema
    .createTable("prizes")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("document_id", "uuid", (col) =>
      col.notNull().defaultTo(sql`uuid_generate_v4()`)
    )
    .addColumn("slug", "varchar(255)", (col) => col.notNull().unique())
    .addColumn("title", "varchar(255)", (col) => col.notNull())
    .addColumn("subtitle", "text")
    .addColumn("tickets_total", "integer", (col) => col.notNull())
    .addColumn("tickets_sold", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("live", "boolean")
    .addColumn("created_at", "timestamp", (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .addColumn("updated_at", "timestamp", (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .addColumn("published_at", "timestamp")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("prizes").execute();
  await sql`DROP EXTENSION IF EXISTS "uuid-ossp"`.execute(db);
}
