import * as path from "path";
import { promises as fs } from "fs";
import {
  Kysely,
  Migrator,
  PostgresDialect,
  FileMigrationProvider,
} from "kysely";
import { db } from "../index";

async function revertAllMigrations() {
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      // This needs to be an absolute path.
      migrationFolder: path.join(__dirname, "../migrations"),
    }),
  });

  // Keep reverting until no more migrations are left
  let hasMoreMigrations = true;
  while (hasMoreMigrations) {
    const { error, results } = await migrator.migrateDown();

    results?.forEach((it) => {
      if (it.status === "Success") {
        console.log(
          `migration "${it.migrationName}" was reverted successfully`
        );
      } else if (it.status === "Error") {
        console.error(`failed to revert migration "${it.migrationName}"`);
      }
    });

    if (error) {
      console.error("failed to revert migrations");
      console.error(error);
      process.exit(1);
    }

    // If no results, we're done
    if (!results || results.length === 0) {
      hasMoreMigrations = false;
    }
  }

  console.log("All migrations have been reverted");
  await db.destroy();
}

revertAllMigrations();
