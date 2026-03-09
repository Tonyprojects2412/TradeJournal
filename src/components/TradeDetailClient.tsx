'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Save, Trash2, Copy } from 'lucide-react';
import { SelectTrade, updateTrade, deleteTrade, createTrade } from '@/actions/trade';

export function TradeDetailActions({ trade }: { trade: SelectTrade }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // Notes state
    const [notes, setNotes] = useState(trade.notes || '');

    const handleUpdateNotes = () => {
        startTransition(async () => {
            await updateTrade(trade.id, { notes });
        });
    };

    const handleDelete = () => {
        if (!confirm('Are you sure you want to delete this trade?')) return;

        startTransition(async () => {
            const res = await deleteTrade(trade.id);
            if (res.success) {
                router.push('/trades');
            } else {
                alert(res.error);
            }
        });
    };

    const handleDuplicate = () => {
        startTransition(async () => {
            // Remove specific details that shouldn't be duplicated exactly like id and dates (or maybe keep dates for identical setups)
            // For MVP let's duplicate precisely but allow User to edit later
            const { id, createdAt, updatedAt, ...rest } = trade;
            const res = await createTrade(rest);

            if (res.success && res.id) {
                router.push(`/trades/${res.id}`);
            } else {
                alert(res.error);
            }
        });
    };

    return (
        <>
            <div className="flex space-x-2">
                <Button
                    variant="outline"
                    className="bg-zinc-900 border-zinc-800 text-zinc-300"
                    onClick={handleDuplicate}
                    disabled={isPending}
                >
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                </Button>
                <Button
                    variant="destructive"
                    className="bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/20"
                    onClick={handleDelete}
                    disabled={isPending}
                >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                </Button>
            </div>
        </>
    );
}

export function TradeDetailNotes({ trade }: { trade: SelectTrade }) {
    const [isPending, startTransition] = useTransition();
    const [notes, setNotes] = useState(trade.notes || '');

    const handleUpdateNotes = () => {
        startTransition(async () => {
            await updateTrade(trade.id, { notes });
        });
    };

    return (
        <div className="pt-4 space-y-4">
            <div>
                <Label className="text-xs text-zinc-500 mb-2 block">Strategy / Setup</Label>
                <Badge variant="outline" className="bg-zinc-800/50 text-zinc-300 border-zinc-700">{trade.strategy || 'None'}</Badge>
            </div>

            <div>
                <Label className="text-xs text-zinc-500 mb-2 block">Trade Logic</Label>
                <textarea
                    className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-md p-3 text-zinc-300 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={isPending}
                    placeholder="Document your setup, emotions, and management..."
                />
            </div>

            <Button
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 mt-2"
                onClick={handleUpdateNotes}
                disabled={isPending}
            >
                <Save className="w-4 h-4 mr-2" />
                {isPending ? "Saving..." : "Update Notes"}
            </Button>
        </div>
    );
}
