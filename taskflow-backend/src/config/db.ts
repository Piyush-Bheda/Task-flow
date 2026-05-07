import { Pool, type PoolClient } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
});

pool.connect(
  (
    err: Error | undefined,
    client: PoolClient | undefined,
    release: (release?: unknown) => void,
  ) => {
  if (err) {
    console.error("Database connection failed:", err.message);
    const pgError = err as NodeJS.ErrnoException;

    if (pgError.code === "28P01") {
      console.error("-> Make sure your database password is correct!");
    } else if (pgError.code === "3D000") {
      console.error('-> Make sure the "taskflow" database exists!');
    }
    return;
  }

  console.log("Successfully connected to PostgreSQL database!");
  release();
},
);

pool.on("error", (err: Error) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

export default pool;
