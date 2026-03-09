'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    ArrowLeft, Save, Trash2, Calendar, Target, Activity, DollarSign, Percent, Copy,
    TrendingUp, TrendingDown, BookOpen, BarChart2, Clock
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { getTradeById } from '@/actions/trade';
import { notFound } from 'next/navigation';
import { TradeDetailActions, TradeDetailNotes } from '@/components/TradeDetailClient';

export default async function TradeDetailPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const result = await getTradeById(id);

    if (!result.success || !result.data) {
        notFound();
    }

    const trade = result.data;

    const isClosed = !!trade.exitPrice || !!trade.premiumExit;
    let netPnl = 0;
    let pnlPercent = 0;

    if (isClosed) {
        const entryValue = trade.assetType === 'stock' ? trade.entryPrice * trade.size : (trade.premiumEntry || 0) * (trade.contracts || 0) * 100;
        const exitValue = trade.assetType === 'stock' ? (trade.exitPrice || 0) * trade.size : (trade.premiumExit || 0) * (trade.contracts || 0) * 100;

        if (trade.direction === 'long') {
            netPnl = exitValue - entryValue - (trade.fees || 0);
            pnlPercent = entryValue > 0 ? (netPnl / entryValue) * 100 : 0;
        } else {
            netPnl = entryValue - exitValue - (trade.fees || 0);
            pnlPercent = entryValue > 0 ? (netPnl / entryValue) * 100 : 0;
        }
    }

    const isWin = isClosed && netPnl > 0;

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header actions */}
            <div className="flex justify-between items-center">
                <Link href="/trades">
                    <Button variant="ghost" className="text-zinc-400 hover:text-white pl-0">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Trade Log
                    </Button>
                </Link>
                <TradeDetailActions trade={trade} />
            </div>

            {/* Top overview card */}
            <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden relative">
                <div className={`absolute top-0 left-0 w-1.5 h-full ${isClosed ? (isWin ? 'bg-emerald-500' : 'bg-rose-500') : 'bg-indigo-500'}`}></div>
                <CardContent className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <div className="flex items-center space-x-3 mb-2">
                                <h1 className="text-3xl font-bold tracking-tight text-white">{trade.ticker}</h1>
                                <Badge variant="outline" className={`border-${isClosed ? (isWin ? 'emerald' : 'rose') : 'indigo'}-500/30 text-${isClosed ? (isWin ? 'emerald' : 'rose') : 'indigo'}-400 bg-${isClosed ? (isWin ? 'emerald' : 'rose') : 'indigo'}-500/10`}>
                                    {trade.direction.toUpperCase()}
                                </Badge>
                                <Badge variant="secondary" className="bg-zinc-800 text-zinc-300">{trade.assetType.toUpperCase()} {trade.assetType === 'option' ? trade.optionType?.toUpperCase() : ''}</Badge>
                                {!isClosed && <Badge variant="secondary" className="bg-indigo-500/20 text-indigo-300">OPEN</Badge>}
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-zinc-400">
                                <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1" /> {format(new Date(trade.entryDate), 'MMM d, yyyy HH:mm')}</span>
                                {trade.exitDate && (
                                    <>
                                        <span>&rarr;</span>
                                        <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> {format(new Date(trade.exitDate), 'MMM d, yyyy HH:mm')}</span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="text-left md:text-right">
                            <div className="text-sm font-medium text-zinc-500 mb-1">Total P&L</div>
                            {isClosed ? (
                                <div className={`text-4xl font-bold ${isWin ? 'text-emerald-400' : 'text-rose-400'} flex items-center`}>
                                    {isWin ? <TrendingUp className="w-6 h-6 mr-2" /> : <TrendingDown className="w-6 h-6 mr-2" />}
                                    {isWin ? '+' : ''}${Math.abs(netPnl).toFixed(2)}
                                </div>
                            ) : (
                                <div className="text-4xl font-bold text-zinc-400 flex items-center">
                                    -
                                </div>
                            )}
                            {isClosed && (
                                <div className={`text-sm ${isWin ? 'text-emerald-500/70' : 'text-rose-500/70'}`}>
                                    {isWin ? '+' : ''}{pnlPercent.toFixed(2)}% Return
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Tabs defaultValue="details" className="w-full">
                        <TabsList className="bg-zinc-900 border border-zinc-800 rounded-md p-1 mb-4 hidden">
                            {/* Hidden tabslist if taking out charts for MVP */}
                        </TabsList>

                        <TabsContent value="details" className="space-y-6 mt-0">
                            {/* Execution Details */}
                            <Card className="bg-zinc-900 border-zinc-800">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg flex items-center">
                                        <Activity className="w-4 h-4 mr-2 text-indigo-400" />
                                        Execution Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4">
                                        <div>
                                            <div className="text-sm font-medium text-zinc-500 mb-1">Entry Price</div>
                                            <div className="text-lg font-semibold text-zinc-200">${trade.assetType === 'stock' ? trade.entryPrice.toFixed(2) : (trade.premiumEntry || 0).toFixed(2)}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-zinc-500 mb-1">Exit Price</div>
                                            <div className="text-lg font-semibold text-zinc-200">{isClosed ? `$${trade.assetType === 'stock' ? (trade.exitPrice || 0).toFixed(2) : (trade.premiumExit || 0).toFixed(2)}` : '-'}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-zinc-500 mb-1">{trade.assetType === 'stock' ? 'Shares' : 'Contracts'}</div>
                                            <div className="text-lg font-semibold text-zinc-200">{trade.assetType === 'stock' ? trade.size : (trade.contracts || 0)}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-zinc-500 mb-1">Fees</div>
                                            <div className="text-lg font-semibold text-zinc-200">${(trade.fees || 0).toFixed(2)}</div>
                                        </div>

                                        {trade.assetType === 'option' && (
                                            <>
                                                <div>
                                                    <div className="text-sm font-medium text-zinc-500 mb-1">Strike</div>
                                                    <div className="text-lg font-semibold text-zinc-200">${trade.strike}</div>
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-zinc-500 mb-1">Expiration</div>
                                                    <div className="text-lg font-semibold text-zinc-200">{trade.expirationDate}</div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Performance Breakdown */}
                            <Card className="bg-zinc-900 border-zinc-800">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg flex items-center">
                                        <BarChart2 className="w-4 h-4 mr-2 text-indigo-400" />
                                        Performance Factors
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4">
                                        <div>
                                            <div className="text-sm font-medium text-zinc-500 mb-1">Gross P&L</div>
                                            <div className="text-lg font-semibold text-zinc-200">{isClosed ? `$${(netPnl + (trade.fees || 0)).toFixed(2)}` : '-'}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-zinc-500 mb-1">Net P&L</div>
                                            <div className={`text-lg font-semibold ${isClosed ? (isWin ? 'text-emerald-400' : 'text-rose-400') : 'text-zinc-200'}`}>
                                                {isClosed ? `${isWin ? '+' : ''}${(netPnl).toFixed(2)}` : '-'}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-zinc-500 mb-1">Holding Time</div>
                                            <div className="text-lg font-semibold text-zinc-200">
                                                {trade.exitDate ? `${Math.round((new Date(trade.exitDate).getTime() - new Date(trade.entryDate).getTime()) / 60000)} mins` : '-'}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Right Column: Journal & Context */}
                <div className="space-y-6">
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader className="pb-3 border-b border-zinc-800/50">
                            <CardTitle className="text-sm font-medium flex items-center text-zinc-300">
                                <BookOpen className="w-4 h-4 mr-2 text-indigo-400" />
                                Journal Notes
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <TradeDetailNotes trade={trade} />
                        </CardContent>
                    </Card>

                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader className="pb-3 border-b border-zinc-800/50">
                            <CardTitle className="text-sm font-medium flex items-center text-zinc-300">
                                <Target className="w-4 h-4 mr-2 text-indigo-400" />
                                Chart Screenshot
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 min-h-32 flex flex-col items-center justify-center text-zinc-500 text-sm">
                            {trade.screenshotUrl ? (
                                <img src={trade.screenshotUrl} alt="Trade Screenshot" className="rounded-md border border-zinc-800" />
                            ) : (
                                <>
                                    <div className="p-3 bg-zinc-950 rounded-full border border-zinc-800/50 border-dashed mb-2">
                                        <Target className="w-5 h-5 text-zinc-600" />
                                    </div>
                                    No screenshot attached
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
