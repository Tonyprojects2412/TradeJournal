'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Filter, SlidersHorizontal } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export function GlobalFilterBar() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Initialize state from URL params
    const initialFrom = searchParams.get('from') ? new Date(searchParams.get('from')!) : undefined;
    const initialTo = searchParams.get('to') ? new Date(searchParams.get('to')!) : undefined;

    const [date, setDate] = useState<DateRange | undefined>({
        from: initialFrom,
        to: initialTo,
    });

    const [account, setAccount] = useState(searchParams.get('account') || 'all');
    const [asset, setAsset] = useState(searchParams.get('asset') || 'all');
    const [direction, setDirection] = useState(searchParams.get('direction') || 'all');
    const [duration, setDuration] = useState(searchParams.get('duration') || 'all');
    const [strategy, setStrategy] = useState(searchParams.get('strategy') || 'all');

    const handleApply = () => {
        const params = new URLSearchParams(searchParams.toString());

        if (date?.from) params.set('from', date.from.toISOString());
        else params.delete('from');

        if (date?.to) params.set('to', date.to.toISOString());
        else params.delete('to');

        if (account !== 'all') params.set('account', account);
        else params.delete('account');

        if (asset !== 'all') params.set('asset', asset);
        else params.delete('asset');

        if (direction !== 'all') params.set('direction', direction);
        else params.delete('direction');

        if (strategy !== 'all') params.set('strategy', strategy);
        else params.delete('strategy');

        router.push(`${pathname}?${params.toString()}`);
    };

    const handleClear = () => {
        setDate(undefined);
        setAccount('all');
        setAsset('all');
        setDirection('all');
        setDuration('all');
        setStrategy('all');
        router.push(pathname); // Clear all params
    };

    return (
        <div className="w-full bg-zinc-900 border-b border-zinc-800 p-4 shrink-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sticky top-0 z-20 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center text-sm font-medium text-zinc-400 mr-2">
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Filters
                </div>

                {/* Date Picker */}
                <Popover>
                    <PopoverTrigger>
                        <div
                            className={cn(
                                "flex h-8 items-center rounded-md border border-zinc-800 bg-zinc-950 px-3 text-xs font-normal hover:bg-zinc-800/50 hover:text-zinc-100 cursor-pointer",
                                !date && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                            {date?.from ? (
                                date.to ? (
                                    <>
                                        {format(date.from, "LLL dd, y")} -{" "}
                                        {format(date.to, "LLL dd, y")}
                                    </>
                                ) : (
                                    format(date.from, "LLL dd, y")
                                )
                            ) : (
                                <span>Pick a date range</span>
                            )}
                        </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-zinc-950 border-zinc-800" align="start">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={date?.from}
                            selected={date}
                            onSelect={setDate}
                            numberOfMonths={2}
                        />
                    </PopoverContent>
                </Popover>

                {/* Account Selector */}
                <Select value={account} onValueChange={(v) => setAccount(v || 'all')}>
                    <SelectTrigger className="h-8 w-[130px] bg-zinc-950 border-zinc-800 text-xs">
                        <SelectValue placeholder="Account" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-zinc-800">
                        <SelectItem value="all">All Accounts</SelectItem>
                        <SelectItem value="margin">Margin A</SelectItem>
                        <SelectItem value="ira">IRA</SelectItem>
                        <SelectItem value="cash">Cash B</SelectItem>
                    </SelectContent>
                </Select>

                {/* Asset Type */}
                <Select value={asset} onValueChange={(v) => setAsset(v || 'all')}>
                    <SelectTrigger className="h-8 w-[110px] bg-zinc-950 border-zinc-800 text-xs">
                        <SelectValue placeholder="Asset" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-zinc-800">
                        <SelectItem value="all">All Assets</SelectItem>
                        <SelectItem value="stock">Stocks</SelectItem>
                        <SelectItem value="option">Options</SelectItem>
                    </SelectContent>
                </Select>

                {/* Direction */}
                <Select value={direction} onValueChange={(v) => setDirection(v || 'all')}>
                    <SelectTrigger className="h-8 w-[110px] bg-zinc-950 border-zinc-800 text-xs">
                        <SelectValue placeholder="Direction" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-zinc-800">
                        <SelectItem value="all">Any Dir.</SelectItem>
                        <SelectItem value="long">Long</SelectItem>
                        <SelectItem value="short">Short</SelectItem>
                    </SelectContent>
                </Select>

                {/* Strategy */}
                <Select value={strategy} onValueChange={(v) => setStrategy(v || 'all')}>
                    <SelectTrigger className="h-8 w-[140px] bg-zinc-950 border-zinc-800 text-xs">
                        <SelectValue placeholder="Strategy" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-zinc-800">
                        <SelectItem value="all">All Strategies</SelectItem>
                        <SelectItem value="breakout">Breakout</SelectItem>
                        <SelectItem value="pullback">Pullback</SelectItem>
                        <SelectItem value="reversal">Reversal</SelectItem>
                        <SelectItem value="dip">Dip Buy</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
                <Button variant="ghost" size="sm" onClick={handleClear} className="h-8 text-xs text-zinc-400 hover:text-white">
                    Clear
                </Button>
                <Button size="sm" onClick={handleApply} className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
                    Apply Filters
                </Button>
            </div>
        </div>
    );
}
