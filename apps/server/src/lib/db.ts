import knex, { type Knex } from "knex";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getRequiredEnv } from "./env.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function connection() {
  const connectionString = getRequiredEnv("DATABASE_URL");
  const needsSsl =
    connectionString.includes("neon.tech") ||
    connectionString.includes("sslmode=require");
  return {
    connectionString,
    ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
  };
}

export const db: Knex = knex({
  client: "pg",
  connection: connection(),
  pool: { min: 0, max: 10 },
  migrations: {
    directory: path.resolve(__dirname, "../../migrations"),
    extension: "ts",
    loadExtensions: [".ts"],
  },
});
