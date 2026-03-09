import { getTrades } from '@/actions/trade';
import { TradeLogClient } from '@/components/TradeLogClient';

export default async function TradeLogPage() {
    const response = await getTrades();
    const trades = response.data || [];

    return <TradeLogClient initialTrades={trades} />;
}
