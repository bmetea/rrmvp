import { promises as fs } from "fs";
import path from "path";
import { db } from "../index";

async function runMigrations() {
  const migrationsDir = path.join(__dirname, "../migrations");
  const files = await fs.readdir(migrationsDir);
  const migrationFiles = files.filter((f) => f.endsWith(".ts")).sort();

  for (const file of migrationFiles) {
    console.log(`Running migration: ${file}`);
    const migration = await import(path.join(migrationsDir, file));
    await migration.up(db);
  }

  console.log("Migrations completed successfully");
  process.exit(0);
}

runMigrations().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
