import sharp from "sharp";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { buildConfig } from "payload";
import { Resource } from "sst";
import { Users } from "./collections/Users";

const connectionString = `postgres://${Resource.rrdb.username}:${Resource.rrdb.password}@${Resource.rrdb.host}:${Resource.rrdb.port}/${Resource.rrdb.database}`;
console.log("Database connection string:", connectionString);

export default buildConfig({
  // If you'd like to use Rich Text, pass your editor here
  editor: lexicalEditor(),

  // Define and configure your collections in this array
  collections: [Users],

  // Your Payload secret - should be a complex and secure string, unguessable
  secret: process.env.PAYLOAD_SECRET || "RunningLocally",

  // Using Postgres adapter with SST Resource interpolation
  db: postgresAdapter({
    pool: {
      connectionString,
    },
  }),

  // If you want to resize images, crop, set focal point, etc.
  // make sure to install it and pass it to the config.
  // sharp,
});
