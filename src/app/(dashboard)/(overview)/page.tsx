import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EquityCurveChart } from '@/components/EquityCurveChart';
import { getTrades } from '@/actions/trade';
import { format } from 'date-fns';

export default async function Dashboard(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
    const searchParams = await props.searchParams;
    const result = await getTrades();
    const allTrades = result.success && result.data ? result.data : [];

    // Filter trades based on searchParams
    const trades = allTrades.filter(trade => {
        // if (searchParams.account && searchParams.account !== 'all') return false; // Not in schema yet
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
    let closedCount = 0;
    let openCount = 0;

    // Filter and sort for timeline
    const sortedTrades = [...trades].sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime());

    const equityCurveData = [];
    let currentBalance = 0;
    const recentClosed: any[] = [];

    for (const trade of sortedTrades) {
        if (trade.exitPrice || trade.premiumExit) {
            closedCount++;

            const isOption = trade.assetType === 'option';
            const entry = isOption ? (trade.premiumEntry || 0) * (trade.contracts || 0) * 100 : trade.entryPrice * trade.size;
            const exit = isOption ? (trade.premiumExit || 0) * (trade.contracts || 0) * 100 : (trade.exitPrice || 0) * trade.size;
            let net = 0;

            if (trade.direction === 'long') {
                net = exit - entry - (trade.fees || 0);
            } else {
                net = entry - exit - (trade.fees || 0);
            }

            totalNetPnl += net;
            currentBalance += net;

            if (net > 0) {
                winCount++;
                grossProfit += net;
            } else if (net < 0) {
                lossCount++;
                grossLoss += Math.abs(net);
            }

            equityCurveData.push({
                date: format(new Date(trade.exitDate || trade.entryDate), 'MMM d'),
                balance: parseFloat(currentBalance.toFixed(2))
            });

            recentClosed.push({
                ticker: trade.ticker,
                PnL: net,
                type: `${trade.direction.charAt(0).toUpperCase() + trade.direction.slice(1)} ${trade.assetType === 'stock' ? 'Stock' : (trade.optionType || 'Option')}`,
                date: format(new Date(trade.exitDate || trade.entryDate), 'MMM d')
            });

        } else {
            openCount++;
        }
    }

    const winRate = closedCount > 0 ? (winCount / closedCount) * 100 : 0;
    const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss) : (grossProfit > 0 ? 999 : 0);
    const avgWin = winCount > 0 ? grossProfit / winCount : 0;
    const avgLoss = lossCount > 0 ? grossLoss / lossCount : 0;

    // Last 5 closed trades
    const recentActivity = recentClosed.reverse().slice(0, 5);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
                <p className="text-zinc-500">Your trading performance at a glance.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="Net P&L"
                    value={`${totalNetPnl >= 0 ? '+' : ''}$${Math.abs(totalNetPnl).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    subValue="All time"
                    positive={totalNetPnl >= 0}
                />
                <MetricCard
                    title="Win Rate"
                    value={`${winRate.toFixed(1)}%`}
                    subValue={`${winCount}W - ${lossCount}L`}
                    positive={winRate > 50}
                />
                <MetricCard
                    title="Profit Factor"
                    value={profitFactor === 999 ? 'MAX' : profitFactor.toFixed(2)}
                    subValue={`Avg Win $${avgWin.toFixed(0)} | Avg Loss $${avgLoss.toFixed(0)}`}
                    positive={profitFactor > 1}
                />
                <MetricCard
                    title="Total Trades"
                    value={(closedCount + openCount).toString()}
                    subValue={`${openCount} active open positions`}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-7 ">
                <Card className="col-span-full xl:col-span-5 bg-zinc-900 border-zinc-800">
                    <CardHeader>
                        <CardTitle>Equity Curve</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-0">
                        <div className="h-[300px]">
                            <EquityCurveChart data={equityCurveData} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-full xl:col-span-2 bg-zinc-900 border-zinc-800">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentActivity.length === 0 ? (
                                <p className="text-sm text-zinc-500">No recent closed trades.</p>
                            ) : (
                                recentActivity.map((trade, i) => (
                                    <RecentTrade key={i} ticker={trade.ticker} PnL={trade.PnL} type={trade.type} date={trade.date} />
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function MetricCard({ title, value, subValue, positive }: { title: string, value: string, subValue: string, positive?: boolean }) {
    return (
        <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-zinc-100">{value}</div>
                <p className={`text-xs ${positive === undefined ? 'text-zinc-500' : (positive ? 'text-emerald-400' : 'text-rose-400')}`}>
                    {subValue}
                </p>
            </CardContent>
        </Card>
    );
}

function RecentTrade({ ticker, PnL, type, date }: { ticker: string, PnL: number, type: string, date: string }) {
    const isPositive = PnL > 0;
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-[10px] ${isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                    {ticker}
                </div>
                <div>
                    <p className="text-sm font-medium text-zinc-200">{type}</p>
                    <p className="text-xs text-zinc-500">{date}</p>
                </div>
            </div>
            <div className={`text-sm font-medium ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isPositive ? '+' : ''}${Math.abs(PnL).toFixed(2)}
            </div>
        </div>
    );
}
