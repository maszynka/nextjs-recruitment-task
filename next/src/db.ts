import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// Use environment variables for DB connection
const pool = new Pool({
  host: process.env.POSTGRES_HOST || "localhost",
  port: Number(process.env.POSTGRES_PORT) || 5432,
  user: process.env.POSTGRES_USER || "myuser",
  password: process.env.POSTGRES_PASSWORD || "mypassword",
  database: process.env.POSTGRES_DB || "mydatabase",
});

export const db = drizzle(pool);
