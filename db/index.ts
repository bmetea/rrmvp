import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import { Resource } from "sst";

// Define your database schema types
interface Database {
  prizes: {
    id: number;
    document_id: string;
    slug: string;
    title: string;
    subtitle: string | null;
    tickets_total: number;
    tickets_sold: number;
    live: boolean | null;
    created_at: Date;
    updated_at: Date;
    published_at: Date | null;
  };
  users: {
    id: number;
    clerk_id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    image_url: string | null;
    username: string | null;
    created_at: Date;
    updated_at: Date;
  };
}

// Create a database instance
export const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool({
      database: Resource.rrdb.database,
      host: Resource.rrdb.host,
      user: Resource.rrdb.username,
      password: Resource.rrdb.password,
      port: Resource.rrdb.port,
      max: 10,
    }),
  }),
});
