import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CalendarPerformance } from '@/components/CalendarPerformance';
import { CumulativeChart, WinLossChart } from '@/components/AnalyticsCharts';
import { getTrades } from '@/actions/trade';

export default async function AnalyticsPage(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
    const searchParams = await props.searchParams;
    const result = await getTrades();
    const allTrades = result.success && result.data ? result.data : [];

    // Filter trades based on searchParams
    const trades = allTrades.filter(trade => {
        if (searchParams.asset && searchParams.asset !== 'all' && trade.assetType !== searchParams.asset) return false;
        if (searchParams.direction && searchParams.direction !== 'all' && trade.direction !== searchParams.direction) return false;
        if (searchParams.strategy && searchParams.strategy !== 'all' && trade.strategy !== searchParams.strategy) return false;
        if (searchParams.duration && searchParams.duration !== 'all') {
            const isDayTrade = trade.tradeType === 'day_trade' || trade.tradeType === 'day';
            const isSwingTrade = trade.tradeType === 'swing_trade' || trade.tradeType === 'swing';
            if (searchParams.duration === 'day' && !isDayTrade) return false;
            if (searchParams.duration === 'swing' && !isSwingTrade) return false;
        }

        const entryDate = new Date(trade.entryDate);
        if (searchParams.from) {
            const fromDate = new Date(searchParams.from);
            if (entryDate < fromDate) return false;
        }
        if (searchParams.to) {
            const toDate = new Date(searchParams.to);
            if (entryDate > toDate) return false;
        }

        return true;
    });

    let totalNetPnl = 0;
    let winCount = 0;
    let lossCount = 0;
    let grossProfit = 0;
    let grossLoss = 0;
    let maxDrawdown = 0;
    let peakCumulative = 0;
    let totalFees = 0;

    const sortedTrades = [...trades].sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime());
    const cumulativeData = [];
    let currentBalance = 0;

    let tradeIdx = 1;
    for (const trade of sortedTrades) {
        if (trade.exitPrice || trade.premiumExit) {
            const isOption = trade.assetType === 'option';
            const entry = isOption ? (trade.premiumEntry || 0) * (trade.contracts || 0) * 100 : trade.entryPrice * trade.size;
            const exit = isOption ? (trade.premiumExit || 0) * (trade.contracts || 0) * 100 : (trade.exitPrice || 0) * trade.size;
            let net = 0;

            if (trade.direction === 'long') {
                net = exit - entry - (trade.fees || 0);
            } else {
                net = entry - exit - (trade.fees || 0);
            }

            totalFees += trade.fees || 0;
            totalNetPnl += net;
            currentBalance += net;

            if (net > 0) {
                winCount++;
                grossProfit += net;
            } else if (net < 0) {
                lossCount++;
                grossLoss += Math.abs(net);
            }

            if (currentBalance > peakCumulative) {
                peakCumulative = currentBalance;
            }

            const currentDrawdown = peakCumulative - currentBalance;
            if (currentDrawdown > maxDrawdown) {
                maxDrawdown = currentDrawdown;
            }

            cumulativeData.push({
                trade: tradeIdx++,
                pnl: net,
                cumulative: parseFloat(currentBalance.toFixed(2))
            });
        }
    }

    const riskReward = (winCount > 0 && lossCount > 0) ? (grossProfit / winCount) / (grossLoss / lossCount) : 0;
    const isProfitable = totalNetPnl >= 0;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
                <p className="text-zinc-500">Deep dive into your trading performance metrics.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-4">
                    <MetricCard
                        title="Gross P&L"
                        value={`${isProfitable ? '+' : ''}$${Math.abs(totalNetPnl).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        positive={isProfitable}
                    />
                    <MetricCard title="Total Fees" value={`$${totalFees.toFixed(2)}`} />
                </div>
                <div className="space-y-4">
                    <MetricCard title="Risk/Reward" value={riskReward > 0 ? `1:${riskReward.toFixed(2)}` : 'N/A'} positive={riskReward > 1} />
                    <MetricCard title="Max Drawdown" value={`-$${maxDrawdown.toFixed(2)}`} />
                </div>
                <div className="col-span-2">
                    <Card className="bg-zinc-900 border-zinc-800 h-full">
                        <CardHeader>
                            <CardTitle>Cumulative P&L</CardTitle>
                            <CardDescription className="text-zinc-400">Total net profit over time</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[200px] flex items-center justify-center">
                            <CumulativeChart data={cumulativeData} />
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {/* Win/Loss Ratio Card */}
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Win/Loss Ratio</CardTitle>
                                <CardDescription className="text-zinc-400">Total trade accuracy</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center">
                        <WinLossChart winCount={winCount} lossCount={lossCount} />
                    </CardContent>
                </Card>
            </div>

            {/* Calendar Performance View */}
            <CalendarPerformance trades={trades} />

        </div>
    );
}

function MetricCard({ title, value, positive }: { title: string, value: string, positive?: boolean }) {
    return (
        <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="py-4">
                <CardTitle className="text-sm font-medium text-zinc-400">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className={`text-2xl font-bold ${positive === undefined ? 'text-zinc-100' : (positive ? 'text-emerald-400' : 'text-rose-400')}`}>
                    {value}
                </div>
            </CardContent>
        </Card>
    );
}
