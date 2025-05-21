import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import { Resource } from "sst";
import { DB } from "./types";

// Create a database instance
export const db = new Kysely<DB>({
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
