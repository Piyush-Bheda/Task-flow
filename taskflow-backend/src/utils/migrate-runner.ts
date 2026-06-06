import "dotenv/config";
import { runMigrations } from "./migrate.js";
import pool from "../config/db.js";

runMigrations()
  .then(() => {
    console.log("Migrations finished.");
    return pool.end();
  })
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
