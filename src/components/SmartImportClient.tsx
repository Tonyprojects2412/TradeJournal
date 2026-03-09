'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { parseTradeText } from '@/actions/ai';
import { createTrade, InsertTrade } from '@/actions/trade';
import { useRouter } from 'next/navigation';

export function SmartImportClient() {
    const [rawText, setRawText] = useState('');
    const [isParsing, startTransitionParsing] = useTransition();
    const [isSaving, startTransitionSaving] = useTransition();
    const [parsedTrade, setParsedTrade] = useState<Partial<InsertTrade> | null>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleParse = () => {
        if (!rawText.trim()) return;
        setError(null);
        setParsedTrade(null);

        startTransitionParsing(async () => {
            const res = await parseTradeText(rawText);
            if (res.success && res.data) {
                setParsedTrade(res.data);
            } else {
                setError(res.error || "Failed to parse trade. Please check your text and try again.");
            }
        });
    };

    const handleConfirm = () => {
        if (!parsedTrade) return;

        startTransitionSaving(async () => {
            const res = await createTrade(parsedTrade as Omit<InsertTrade, 'id' | 'createdAt' | 'updatedAt'>);
            if (res.success) {
                router.push('/trades');
            } else {
                setError(res.error || "Failed to save trade.");
            }
        });
    };

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                    <CardTitle>Broker Data Input</CardTitle>
                    <CardDescription className="text-zinc-400">Paste your raw trade text.</CardDescription>
                </CardHeader>
                <CardContent>
                    <textarea
                        className="w-full h-48 bg-zinc-950 border border-zinc-800 rounded-md p-4 text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono text-sm"
                        placeholder="e.g. BOUGHT 10 NFLX @ 125.50 on 10/12/2026..."
                        value={rawText}
                        onChange={(e) => setRawText(e.target.value)}
                        disabled={isParsing || isSaving}
                    ></textarea>
                    {error && (
                        <div className="mt-2 text-sm text-rose-500">{error}</div>
                    )}
                </CardContent>
                <CardFooter>
                    <Button
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                        onClick={handleParse}
                        disabled={!rawText.trim() || isParsing || isSaving}
                    >
                        {isParsing ? "Parsing..." : "Parse Trade Data"}
                    </Button>
                </CardFooter>
            </Card>

            <Card className={`bg-zinc-900 border-zinc-800 ${!parsedTrade ? 'opacity-60 pointer-events-none' : ''}`}>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>Parsed Result</CardTitle>
                            <CardDescription className="text-zinc-400">Review AI interpretation</CardDescription>
                        </div>
                        <Badge variant="outline" className={`bg-zinc-800/50 ${parsedTrade ? 'text-indigo-400 border-indigo-500/30' : 'text-zinc-500'}`}>
                            {parsedTrade ? 'Confidence: High' : 'Confidence: N/A'}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {!parsedTrade ? (
                        <div className="flex items-center justify-center h-32 border border-dashed border-zinc-800 rounded-md">
                            <p className="text-sm text-zinc-500">Submit data to see parsed fields</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <pre className="p-4 bg-zinc-950 border border-zinc-800 rounded-md text-xs text-indigo-200 overflow-auto max-h-48">
                                {JSON.stringify(parsedTrade, null, 2)}
                            </pre>
                            <div className="text-sm text-zinc-400">
                                Verify the extracted information above. If it looks correct, save to your journal.
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    <Button
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={handleConfirm}
                        disabled={!parsedTrade || isSaving || isParsing}
                    >
                        {isSaving ? "Saving..." : "Confirm & Save Trade"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
