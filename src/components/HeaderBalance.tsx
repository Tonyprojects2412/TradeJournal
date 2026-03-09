'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Edit2, Check, X } from 'lucide-react';

export function HeaderBalance() {
    const [isEditing, setIsEditing] = useState(false);
    const [balance, setBalance] = useState<string>('25450.00');
    const [draftBalance, setDraftBalance] = useState<string>('25450.00');

    // Load from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem('trade_journal_balance');
        if (saved) {
            setBalance(saved);
            setDraftBalance(saved);
        }
    }, []);

    const handleSave = () => {
        setBalance(draftBalance);
        setIsEditing(false);
        localStorage.setItem('trade_journal_balance', draftBalance);
    };

    const handleCancel = () => {
        setDraftBalance(balance);
        setIsEditing(false);
    };

    return (
        <div className="flex items-center space-x-4">
            <div className="text-sm text-zinc-400 flex items-center h-8">
                <span className="font-semibold text-zinc-200 mr-2">Balance:</span>
                {isEditing ? (
                    <div className="flex items-center space-x-1">
                        <span className="text-zinc-400">$</span>
                        <Input
                            type="number"
                            value={draftBalance}
                            onChange={(e) => setDraftBalance(e.target.value)}
                            className="h-7 w-24 bg-zinc-900 border-zinc-700 text-xs px-2"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSave();
                                if (e.key === 'Escape') handleCancel();
                            }}
                        />
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-400 hover:text-emerald-300 hover:bg-zinc-800" onClick={handleSave}>
                            <Check className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-rose-400 hover:text-rose-300 hover:bg-zinc-800" onClick={handleCancel}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <div className="flex items-center group cursor-pointer" onClick={() => setIsEditing(true)}>
                        <span className="tabular-nums">${parseFloat(balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        <Edit2 className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500" />
                    </div>
                )}
            </div>
            {/* Keeping the Today hardcoded string as MVP filler or hide it if we want it fully manual */}
            {/* The user only specified balance, so we can leave or change the Today metric. Let's make it manual as well for consistency, or just hide it until later. */}
        </div>
    );
}
