import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import { config } from "../config/config";
import { Database } from "./types";

const dialect = new PostgresDialect({
  pool: new Pool({
    database: config.DATABASE_NAME,
    host: config.DATABASE_HOST,
    user: config.DATABASE_USERNAME,
    port: +config.DATABASE_PORT!,
    password: config.DATABASE_PASSWORD,
    ssl: true,
  }),
});

export const db = new Kysely<Database>({
  dialect,
});
