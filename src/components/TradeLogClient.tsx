'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Search, Filter, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Link from 'next/link';

export function TradeLogClient({ initialTrades }: { initialTrades: any[] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [assetFilter, setAssetFilter] = useState('all');

    const filteredTrades = initialTrades.filter((trade) => {
        const matchesSearch = trade.ticker.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesAsset = assetFilter === 'all' || trade.assetType === assetFilter;
        return matchesSearch && matchesAsset;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Trade Log</h2>
                    <p className="text-zinc-500">Record, analyze, and review your trading history.</p>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline" className="bg-zinc-900 border-zinc-800 text-zinc-300">
                        <Filter className="w-4 h-4 mr-2" />
                        Filters
                    </Button>
                    <Link href="/import">
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Trade
                        </Button>
                    </Link>
                </div>
            </div>

            <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="pb-4">
                    <div className="flex items-center space-x-2">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                            <Input
                                placeholder="Search ticker..."
                                className="pl-9 bg-zinc-950 border-zinc-800 focus-visible:ring-indigo-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select value={assetFilter} onValueChange={(val) => setAssetFilter(val || 'all')}>
                            <SelectTrigger className="w-[140px] bg-zinc-950 border-zinc-800">
                                <SelectValue placeholder="Asset Type" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-950 border-zinc-800">
                                <SelectItem value="all">All Assets</SelectItem>
                                <SelectItem value="stock">Stocks</SelectItem>
                                <SelectItem value="option">Options</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select defaultValue="all">
                            <SelectTrigger className="w-[140px] bg-zinc-950 border-zinc-800">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-950 border-zinc-800">
                                <SelectItem value="all">All Trades</SelectItem>
                                <SelectItem value="open">Open</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border border-zinc-800 overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-zinc-950">
                                <TableRow className="border-b border-zinc-800 hover:bg-transparent">
                                    <TableHead className="font-medium text-zinc-400">Date</TableHead>
                                    <TableHead className="font-medium text-zinc-400">Asset</TableHead>
                                    <TableHead className="font-medium text-zinc-400">Direction</TableHead>
                                    <TableHead className="font-medium text-zinc-400 text-right">Size</TableHead>
                                    <TableHead className="font-medium text-zinc-400 text-right">Entry</TableHead>
                                    <TableHead className="font-medium text-zinc-400 text-right">Exit</TableHead>
                                    <TableHead className="font-medium text-zinc-400 text-right">P&L</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTrades.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8 text-zinc-500">
                                            No trades found.
                                        </TableCell>
                                    </TableRow>
                                ) : filteredTrades.map((trade) => {
                                    const isClosed = !!trade.exitPrice;
                                    let netPnl = 0;
                                    let pnlPercent = 0;

                                    if (isClosed) {
                                        const entryValue = trade.assetType === 'stock' ? trade.entryPrice * trade.size : (trade.premiumEntry || 0) * trade.contracts * 100;
                                        const exitValue = trade.assetType === 'stock' ? trade.exitPrice * trade.size : (trade.premiumExit || 0) * trade.contracts * 100;

                                        if (trade.direction === 'long') {
                                            netPnl = exitValue - entryValue - trade.fees;
                                            pnlPercent = (netPnl / entryValue) * 100;
                                        } else {
                                            netPnl = entryValue - exitValue - trade.fees;
                                            pnlPercent = (netPnl / entryValue) * 100;
                                        }
                                    }

                                    return (
                                        <TableRow key={trade.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors group">
                                            <TableCell className="py-3">
                                                <div className="font-medium text-zinc-300">{format(new Date(trade.entryDate), 'MMM d, yyyy')}</div>
                                                <div className="text-xs text-zinc-500">{format(new Date(trade.entryDate), 'HH:mm')}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Link href={`/trades/${trade.id}`} className="block">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="font-bold text-zinc-100 hover:text-indigo-400 transition-colors">{trade.ticker}</span>
                                                        {trade.assetType === 'option' && (
                                                            <Badge variant="secondary" className="text-[10px] bg-zinc-800 text-zinc-300">
                                                                {trade.optionType?.toUpperCase()}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                <span className={trade.direction === 'long' ? 'text-emerald-400' : 'text-rose-400'}>
                                                    {trade.direction.charAt(0).toUpperCase() + trade.direction.slice(1)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right text-zinc-300">
                                                {trade.assetType === 'stock' ? trade.size : trade.contracts}
                                            </TableCell>
                                            <TableCell className="text-right text-zinc-300">
                                                ${trade.assetType === 'stock' ? trade.entryPrice.toFixed(2) : (trade.premiumEntry || 0).toFixed(2)}
                                            </TableCell>
                                            <TableCell className="text-right text-zinc-300">
                                                {isClosed ? `$${trade.assetType === 'stock' ? trade.exitPrice.toFixed(2) : (trade.premiumExit || 0).toFixed(2)}` : <span className="text-zinc-600">-</span>}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {isClosed ? (
                                                    <div>
                                                        <div className={`font-semibold ${netPnl > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                            {netPnl > 0 ? '+' : ''}${Math.abs(netPnl).toFixed(2)}
                                                        </div>
                                                        <div className={`text-[10px] ${pnlPercent > 0 ? 'text-emerald-500/70' : 'text-rose-500/70'}`}>
                                                            {pnlPercent > 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 bg-indigo-500/10">Open</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger>
                                                        <div className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 hover:bg-zinc-800 rounded-md flex items-center justify-center cursor-pointer transition-opacity">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4 text-zinc-400" />
                                                        </div>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800">
                                                        <Link href={`/trades/${trade.id}`}>
                                                            <DropdownMenuItem className="text-zinc-300 focus:bg-zinc-800 focus:text-zinc-100 cursor-pointer">View / Edit</DropdownMenuItem>
                                                        </Link>
                                                        <DropdownMenuItem className="text-rose-400 focus:bg-rose-500/10 focus:text-rose-400 cursor-pointer">Delete</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
