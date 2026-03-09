'use client';

import * as React from 'react';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    startOfWeek,
    endOfWeek,
    parseISO
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import { SelectTrade } from '@/actions/trade'; // adjust import if needed

export function CalendarPerformance({ trades }: { trades: any[] }) {
    const [currentDate, setCurrentDate] = React.useState(new Date());

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "yyyy-MM-dd";
    const days = eachDayOfInterval({
        start: startDate,
        end: endDate
    });

    // Generate data from real trades
    const dataMap: Record<string, any> = {};
    for (const trade of trades) {
        if (!trade.exitDate && !trade.entryDate) continue;
        const dateKey = format(parseISO(trade.exitDate || trade.entryDate), dateFormat);
        if (!dataMap[dateKey]) {
            dataMap[dateKey] = { pnl: 0, trades: 0, tags: [] };
        }

        const isOption = trade.assetType === 'option';
        const entry = isOption ? (trade.premiumEntry || 0) * (trade.contracts || 0) * 100 : trade.entryPrice * trade.size;
        const exit = trade.exitPrice !== null || trade.premiumExit !== null ?
            (isOption ? (trade.premiumExit || 0) * (trade.contracts || 0) * 100 : (trade.exitPrice || 0) * trade.size) : 0;

        let net = 0;
        if (exit > 0) { // Only count closed trades for PnL
            if (trade.direction === 'long') {
                net = exit - entry - (trade.fees || 0);
            } else {
                net = entry - exit - (trade.fees || 0);
            }
        }

        dataMap[dateKey].pnl += net;
        dataMap[dateKey].trades += 1;
        if (trade.strategy && !dataMap[dateKey].tags.includes(trade.strategy)) {
            dataMap[dateKey].tags.push(trade.strategy.toUpperCase());
        }
    }

    const mockData = dataMap;

    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const goToToday = () => setCurrentDate(new Date());

    // Weekly calculations
    const calculateWeeklyAggregates = (daysArray: Date[]) => {
        const weeks: { days: Date[], pnl: number, trades: number }[] = [];
        for (let i = 0; i < daysArray.length; i += 7) {
            const weekDays = daysArray.slice(i, i + 7);
            let weekPnl = 0;
            let weekTrades = 0;
            weekDays.forEach(day => {
                const dateKey = format(day, dateFormat);
                const dayData = mockData[dateKey];
                if (dayData && isSameMonth(day, monthStart)) {
                    weekPnl += dayData.pnl;
                    weekTrades += dayData.trades;
                }
            });
            weeks.push({ days: weekDays, pnl: weekPnl, trades: weekTrades });
        }
        return weeks;
    };

    const weeks = calculateWeeklyAggregates(days);
    const monthTotalPnl = weeks.reduce((acc, week) => acc + week.pnl, 0);

    return (
        <Card className="bg-zinc-950 border-zinc-800 overflow-hidden flex flex-col col-span-2 shadow-sm rounded-xl">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50">
                <div className="flex items-center space-x-4">
                    <Button variant="outline" size="sm" onClick={goToToday} className="bg-zinc-950 border-zinc-700 hover:bg-zinc-800 hover:text-white text-zinc-300">
                        Today
                    </Button>
                    <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                    <h2 className="text-xl font-semibold text-white ml-2">
                        {format(currentDate, "MMMM yyyy")}
                    </h2>
                    <span className={cn(
                        "ml-4 text-lg font-medium",
                        monthTotalPnl > 0 ? "text-emerald-400" : monthTotalPnl < 0 ? "text-rose-400" : "text-zinc-500"
                    )}>
                        {monthTotalPnl > 0 ? "+" : ""}${monthTotalPnl.toFixed(2)}
                    </span>
                </div>
            </div>

            <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                    {/* Days Header */}
                    <div className="grid grid-cols-8 border-b border-zinc-800 bg-zinc-900/50">
                        {['SUN', 'MON', 'TUE', 'WED', 'THR', 'FRI', 'SAT'].map(day => (
                            <div key={day} className="py-2 text-center text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                                {day}
                            </div>
                        ))}
                        <div className="py-2 text-center text-[10px] font-semibold text-zinc-500 uppercase tracking-wider border-l border-zinc-800/50">
                            WEEKLY SUMMARY
                        </div>
                    </div>

                    {/* Calendar Grid */}
                    <div className="flex flex-col">
                        {weeks.map((week, weekIdx) => (
                            <div key={weekIdx} className="grid grid-cols-8 border-b border-zinc-800 last:border-b-0 h-[140px] md:h-[120px]">
                                {week.days.map((day, dayIdx) => {
                                    const dateKey = format(day, dateFormat);
                                    const isCurrentMonth = isSameMonth(day, monthStart);
                                    const dayData = mockData[dateKey];

                                    let bgColor = "bg-zinc-950/20";
                                    let hoverEffect = "";

                                    if (isCurrentMonth) {
                                        hoverEffect = "hover:brightness-110 cursor-pointer transition-all";
                                        if (dayData) {
                                            bgColor = dayData.pnl > 0 ? "bg-[#1f5f5c]" : "bg-[#9d3b54]"; // Close to provided image colors
                                        } else {
                                            bgColor = "bg-zinc-900/20";
                                        }
                                    }

                                    return (
                                        <div
                                            key={day.toString()}
                                            className={cn(
                                                "p-2 border-r border-zinc-800/50 last:border-r-0 relative",
                                                bgColor,
                                                hoverEffect,
                                                !isCurrentMonth && "opacity-30"
                                            )}
                                        >
                                            <span className="absolute top-2 right-2 text-xs font-medium text-zinc-400">
                                                {format(day, 'd')}
                                            </span>

                                            {isCurrentMonth && dayData && (
                                                <div className="mt-4 flex flex-col space-y-1">
                                                    <span className={cn(
                                                        "text-sm font-bold",
                                                        dayData.pnl > 0 ? "text-emerald-300" : "text-rose-300"
                                                    )}>
                                                        {dayData.pnl > 0 ? "+" : ""}${dayData.pnl.toFixed(2)}
                                                    </span>
                                                    <span className="text-xs text-zinc-300">
                                                        {dayData.trades} {dayData.trades === 1 ? 'Trade' : 'Trades'}
                                                    </span>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {dayData.tags.slice(0, 2).map((tag: string, idx: number) => (
                                                            <Badge key={idx} className={cn(
                                                                "text-[9px] px-1 py-0 h-4 border-0 rounded-sm font-semibold uppercase",
                                                                dayData.pnl > 0 ? "bg-emerald-400/20 text-emerald-300" : "bg-rose-400/20 text-rose-300"
                                                            )}>
                                                                {tag}
                                                            </Badge>
                                                        ))}
                                                        {dayData.tags.length > 2 && (
                                                            <Badge className="text-[9px] px-1 py-0 h-4 bg-zinc-800/80 text-zinc-400 border-0 rounded-sm">
                                                                +{dayData.tags.length - 2} more
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {/* Weekly Summary Column */}
                                <div className="p-3 border-l border-zinc-800 flex flex-col justify-center items-start bg-zinc-950/80">
                                    {week.trades > 0 ? (
                                        <>
                                            <span className={cn(
                                                "text-sm font-bold",
                                                week.pnl > 0 ? "text-indigo-400" : "text-rose-400"
                                            )}>
                                                {week.pnl > 0 ? "+" : ""}${week.pnl.toFixed(2)}
                                            </span>
                                            <span className="text-xs text-zinc-400 mt-1">
                                                {week.trades} Trades
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-sm text-zinc-600 font-medium">
                                            $0
                                            <br />
                                            <span className="text-xs font-normal">0 Trades</span>
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    );
}
