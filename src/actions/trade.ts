'use server';

import { db } from '@/db';
import { trades } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';

export type InsertTrade = typeof trades.$inferInsert;
export type SelectTrade = typeof trades.$inferSelect;

export async function createTrade(data: Omit<InsertTrade, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
        const id = uuidv4();
        const now = new Date().toISOString();

        await db.insert(trades).values({
            ...data,
            id,
            createdAt: now,
            updatedAt: now,
        });

        revalidatePath('/trades');
        revalidatePath('/dashboard');
        revalidatePath('/analytics');

        return { success: true, id };
    } catch (error) {
        console.error('Failed to create trade:', error);
        return { success: false, error: 'Failed to create trade' };
    }
}

export async function getTrades() {
    try {
        const allTrades = await db.query.trades.findMany({
            orderBy: [desc(trades.entryDate)],
        });
        return { success: true, data: allTrades };
    } catch (error) {
        console.error('Failed to fetch trades:', error);
        return { success: false, error: 'Failed to fetch trades', data: [] };
    }
}

export async function getTradeById(id: string) {
    try {
        const trade = await db.query.trades.findFirst({
            where: eq(trades.id, id),
        });

        if (!trade) {
            return { success: false, error: 'Trade not found' };
        }

        return { success: true, data: trade };
    } catch (error) {
        console.error('Failed to fetch trade:', error);
        return { success: false, error: 'Failed to fetch trade' };
    }
}

export async function updateTrade(id: string, data: Partial<Omit<InsertTrade, 'id' | 'createdAt'>>) {
    try {
        await db.update(trades)
            .set({
                ...data,
                updatedAt: new Date().toISOString(),
            })
            .where(eq(trades.id, id));

        revalidatePath('/trades');
        revalidatePath(`/trades/${id}`);
        revalidatePath('/dashboard');
        revalidatePath('/analytics');

        return { success: true };
    } catch (error) {
        console.error('Failed to update trade:', error);
        return { success: false, error: 'Failed to update trade' };
    }
}

export async function deleteTrade(id: string) {
    try {
        await db.delete(trades).where(eq(trades.id, id));

        revalidatePath('/trades');
        revalidatePath('/dashboard');
        revalidatePath('/analytics');

        return { success: true };
    } catch (error) {
        console.error('Failed to delete trade:', error);
        return { success: false, error: 'Failed to delete trade' };
    }
}
