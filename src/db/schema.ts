import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';

export const trades = sqliteTable('trades', {
    id: text('id').primaryKey(),
    ticker: text('ticker').notNull(),
    entryPrice: real('entry_price').notNull(),
    exitPrice: real('exit_price'),
    entryDate: text('entry_date').notNull(),
    exitDate: text('exit_date'),
    size: real('size').notNull(),
    direction: text('direction').notNull(), // 'long' | 'short'
    assetType: text('asset_type').notNull(), // 'stock' | 'option'
    tradeType: text('trade_type'), // 'day_trade' | 'swing_trade'
    fees: real('fees').default(0),
    strategy: text('strategy'),
    notes: text('notes'),
    screenshotUrl: text('screenshot_url'),
    isDraft: integer('is_draft', { mode: 'boolean' }).default(false),

    // Options specific fields
    optionType: text('option_type'), // 'call' | 'put'
    strike: real('strike'),
    expirationDate: text('expiration_date'),
    contracts: integer('contracts'),
    premiumEntry: real('premium_entry'),
    premiumExit: real('premium_exit'),

    // Timestamps
    createdAt: text('created_at').notNull().default(new Date().toISOString()),
    updatedAt: text('updated_at').notNull().default(new Date().toISOString()),
});
