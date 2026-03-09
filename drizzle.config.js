/** @type { import("drizzle-kit").Config } */
export default {
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'file:tradejournal.db',
  },
};
