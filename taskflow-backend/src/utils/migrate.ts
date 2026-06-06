import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { type PoolClient } from "pg";
import pool from "../config/db.js";
import { getErrorMessage } from "../types/app.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MIGRATIONS_DIR = join(__dirname, "..", "..", "sql", "migrations");

const TRACKING_TABLE = "_migrations_applied";

async function ensureTrackingTable(client: PoolClient): Promise<void> {
  await client.query(`
    CREATE TABLE IF NOT EXISTS ${TRACKING_TABLE} (
      name TEXT PRIMARY KEY,
      applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function getAppliedMigrations(client: PoolClient): Promise<Set<string>> {
  const result = await client.query<{ name: string }>(`SELECT name FROM ${TRACKING_TABLE}`);
  return new Set(result.rows.map((row) => row.name));
}

function getMigrationFiles(): string[] {
  try {
    const files = readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith(".sql"))
      .sort();
    return files;
  } catch (err) {
    console.error("Could not read migrations directory:", MIGRATIONS_DIR);
    return [];
  }
}

export async function runMigrations(): Promise<void> {
  console.log("Running database migrations...");
  const files = getMigrationFiles();

  if (files.length === 0) {
    console.log("No migration files found.");
    return;
  }

  const client = await pool.connect();
  try {
    await ensureTrackingTable(client);
    const applied = await getAppliedMigrations(client);

    let ran = 0;
    for (const file of files) {
      if (applied.has(file)) {
        console.log(`  [skip] ${file} (already applied)`);
        continue;
      }

      const sqlPath = join(MIGRATIONS_DIR, file);
      const sql = readFileSync(sqlPath, "utf-8");

      console.log(`  [run]  ${file}`);
      try {
        await client.query("BEGIN");
        await client.query(sql);
        await client.query(`INSERT INTO ${TRACKING_TABLE} (name) VALUES ($1)`, [file]);
        await client.query("COMMIT");
        ran++;
      } catch (err) {
        await client.query("ROLLBACK");
        console.error(`  [fail] ${file}:`, getErrorMessage(err));
        throw err;
      }
    }

    console.log(`Migrations complete. ${ran} new migration(s) applied, ${files.length - ran} already up to date.`);
  } finally {
    client.release();
  }
}
