import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import path from 'path';
import fs from 'fs';

const isVercel = process.env.VERCEL === '1';
const defaultPath = isVercel
    ? '/tmp/tradejournal.db'
    : path.join(process.cwd(), 'tradejournal.db');

const dbPath = process.env.DATABASE_URL || defaultPath;
const sqlite = new Database(dbPath);

// Ensure simple tables exist when running in-memory or ephemeral environments
// so that the build doesn't fail with "no such table: trades" during static generation
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS "trades" (
    "id" text PRIMARY KEY NOT NULL,
    "ticker" text NOT NULL,
    "entry_price" real NOT NULL,
    "exit_price" real,
    "entry_date" text NOT NULL,
    "exit_date" text,
    "size" real NOT NULL,
    "direction" text NOT NULL,
    "asset_type" text NOT NULL,
    "trade_type" text,
    "fees" real DEFAULT 0,
    "strategy" text,
    "notes" text,
    "screenshot_url" text,
    "is_draft" integer DEFAULT 0,
    "option_type" text,
    "strike" real,
    "expiration_date" text,
    "contracts" integer,
    "premium_entry" real,
    "premium_exit" real,
    "created_at" text DEFAULT (datetime('now')) NOT NULL,
    "updated_at" text DEFAULT (datetime('now')) NOT NULL
  )
`);

export const db = drizzle(sqlite, { schema });
