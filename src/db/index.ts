import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

const sqlite = new Database('C:/Users/admin/Desktop/tradejournal.db');
export const db = drizzle(sqlite, { schema });
