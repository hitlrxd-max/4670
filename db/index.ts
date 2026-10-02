import { drizzle } from "drizzle-orm/neon-http"
import { neon } from "@neondatabase/serverless"
import * as schema from "./schema"

// Keep module evaluation safe during static builds. Any database operation still
// requires DATABASE_URL and will fail at runtime if production is misconfigured.
const databaseUrl = process.env.DATABASE_URL ?? "postgresql://build:build@localhost:5432/build"
const sql = neon(databaseUrl)

export const db = drizzle(sql, { schema })
