import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import path from 'path';

let sqlite: any;

// Next.js build phase on Vercel fails if we try to instantiate better-sqlite3
if (process.env.VERCEL === '1') {
  // Use memory DB during Vercel build/serverless to avoid directory errors
  sqlite = new Database(':memory:');

  // Mock the trades table for build phase data collection
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
} else {
  // Local development
  const dbPath = process.env.DATABASE_URL || path.join(process.cwd(), 'tradejournal.db');
  sqlite = new Database(dbPath);

  // Ensure tables exist locally just in case migrations haven't run
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
}

export const db = drizzle(sqlite, { schema });
