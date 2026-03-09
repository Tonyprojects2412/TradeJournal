'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bot, FileText, CheckCircle2, Upload, ChevronRight, Save } from 'lucide-react';
import { createTrade } from '@/actions/trade';
import { useRouter } from 'next/navigation';
import { SmartImportClient } from '@/components/SmartImportClient';

export default function ImportTradePage() {
    const [importMode, setImportMode] = useState<'smart' | 'manual'>('smart');
    const [assetType, setAssetType] = useState('stock');
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    async function handleManualSubmit(formData: FormData) {
        const rawEntryPrice = formData.get('entryPrice')?.toString() || '0';
        const rawSize = formData.get('size')?.toString() || '0';
        const entryDate = formData.get('entryDate')?.toString() || new Date().toISOString();

        // Core info
        const ticker = formData.get('ticker')?.toString() || 'UNKNOWN';
        const direction = formData.get('direction')?.toString() || 'long';
        const strategy = formData.get('strategy')?.toString() || '';

        // Prepare base trade
        const baseTrade = {
            ticker: ticker.toUpperCase(),
            entryDate,
            direction,
            assetType,
            strategy,
            size: 0,
            entryPrice: 0,
        };

        startTransition(async () => {
            let result;
            if (assetType === 'option') {
                // Handle Option specifics
                const contracts = parseInt(formData.get('contracts')?.toString() || '0', 10);
                const premiumEntry = parseFloat(formData.get('premiumEntry')?.toString() || '0');
                result = await createTrade({
                    ...baseTrade,
                    size: contracts, // Options usually use size for display but we store contracts directly
                    entryPrice: premiumEntry, // We will use premiumEntry as the theoretical entry point
                    contracts,
                    premiumEntry,
                    optionType: formData.get('optionType')?.toString() || 'call',
                    strike: parseFloat(formData.get('strike')?.toString() || '0'),
                    expirationDate: formData.get('expirationDate')?.toString() || '',
                });
            } else {
                // Handle Stock specifics
                result = await createTrade({
                    ...baseTrade,
                    size: parseFloat(rawSize),
                    entryPrice: parseFloat(rawEntryPrice),
                });
            }

            if (result?.success) {
                router.push('/trades');
            } else {
                alert("Error creating trade.");
            }
        });
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Import Trades</h2>
                <p className="text-zinc-500">Log new trades manually or paste screenshot data to let AI parse it for you.</p>
            </div>

            <div className="flex space-x-2 p-1 bg-zinc-900/50 rounded-lg w-fit border border-zinc-800">
                <Button
                    variant={importMode === 'smart' ? 'default' : 'ghost'}
                    onClick={() => setImportMode('smart')}
                    className={importMode === 'smart' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'}
                    size="sm"
                >
                    <Bot className="w-4 h-4 mr-2" />
                    Smart Import
                </Button>
                <Button
                    variant={importMode === 'manual' ? 'default' : 'ghost'}
                    onClick={() => setImportMode('manual')}
                    className={importMode === 'manual' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'}
                    size="sm"
                >
                    <FileText className="w-4 h-4 mr-2" />
                    Manual Entry
                </Button>
            </div>

            {importMode === 'smart' ? (
                <SmartImportClient />
            ) : (
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader>
                        <CardTitle>Manual Trade Entry</CardTitle>
                    </CardHeader>
                    <form action={handleManualSubmit}>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="assetType">Asset Type</Label>
                                    <input type="hidden" name="assetType" value={assetType} />
                                    <Select value={assetType} onValueChange={(val) => setAssetType(val as string)}>
                                        <SelectTrigger id="assetType" className="bg-zinc-950 border-zinc-800">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-950 border-zinc-800">
                                            <SelectItem value="stock">Stock</SelectItem>
                                            <SelectItem value="option">Option</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="ticker">Ticker</Label>
                                    <Input id="ticker" name="ticker" required placeholder="e.g. AAPL" className="bg-zinc-950 border-zinc-800 uppercase" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="direction">Direction</Label>
                                    <Select defaultValue="long" name="direction">
                                        <SelectTrigger id="direction" className="bg-zinc-950 border-zinc-800">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-950 border-zinc-800">
                                            <SelectItem value="long">Long</SelectItem>
                                            <SelectItem value="short">Short</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="strategy">Strategy</Label>
                                    <Select defaultValue="breakout" name="strategy">
                                        <SelectTrigger id="strategy" className="bg-zinc-950 border-zinc-800">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-950 border-zinc-800">
                                            <SelectItem value="breakout">Break and Retest</SelectItem>
                                            <SelectItem value="pullback">Key Level Pullback</SelectItem>
                                            <SelectItem value="reversal">Trend Reversal</SelectItem>
                                            <SelectItem value="dip">Dip Buy</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="h-px bg-zinc-800 w-full" />

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {assetType === 'stock' ? (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="size">Share Size</Label>
                                            <Input id="size" name="size" type="number" step="0.01" required placeholder="100" className="bg-zinc-950 border-zinc-800" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="entryPrice">Entry Price</Label>
                                            <Input id="entryPrice" name="entryPrice" type="number" step="0.01" required placeholder="150.00" className="bg-zinc-950 border-zinc-800" />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="optionType">Option Type</Label>
                                            <Select defaultValue="call" name="optionType">
                                                <SelectTrigger id="optionType" className="bg-zinc-950 border-zinc-800">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-zinc-950 border-zinc-800">
                                                    <SelectItem value="call">Call</SelectItem>
                                                    <SelectItem value="put">Put</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="strike">Strike</Label>
                                            <Input id="strike" name="strike" type="number" step="0.5" required placeholder="500" className="bg-zinc-950 border-zinc-800" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="contracts">Contracts</Label>
                                            <Input id="contracts" name="contracts" type="number" step="1" required placeholder="10" className="bg-zinc-950 border-zinc-800" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="premiumEntry">Premium Entry</Label>
                                            <Input id="premiumEntry" name="premiumEntry" type="number" step="0.01" required placeholder="2.50" className="bg-zinc-950 border-zinc-800" />
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Trade Notes / Logic</Label>
                                <textarea
                                    id="notes"
                                    name="notes"
                                    className="w-full h-24 bg-zinc-950 border border-zinc-800 rounded-md p-3 text-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                    placeholder="What was the setup? Did you follow your rules?"
                                ></textarea>
                            </div>

                        </CardContent>
                        <CardFooter className="flex justify-between border-t border-zinc-800 pt-6">
                            <Button variant="outline" type="button" className="bg-transparent border-zinc-700 text-zinc-400 hover:text-zinc-200">
                                <Save className="w-4 h-4 mr-2" />
                                Save Draft
                            </Button>
                            <Button type="submit" disabled={isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                {isPending ? 'Logging...' : 'Log Trade'}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            )}
        </div>
    );
}
