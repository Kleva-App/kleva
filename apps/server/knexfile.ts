import type { Knex } from "knex";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getRequiredEnv } from "./src/lib/env.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const connectionString = getRequiredEnv("DATABASE_URL");
const needsSsl =
  connectionString.includes("neon.tech") ||
  connectionString.includes("sslmode=require");

const shared: Knex.Config = {
  client: "pg",
  connection: {
    connectionString,
    ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
  },
  pool: { min: 0, max: 10 },
  migrations: {
    directory: path.resolve(__dirname, "migrations"),
    extension: "ts",
    loadExtensions: [".ts"],
  },
};

export default {
  development: shared,
  production: shared,
};
