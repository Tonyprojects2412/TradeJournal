/** @type { import("drizzle-kit").Config } */
export default {
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'sqlite',
  dbCredentials: {
    url: 'file:C:/Users/admin/Desktop/tradejournal.db',
  },
};
