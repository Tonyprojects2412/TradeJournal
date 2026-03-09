'use client';

import {
    PieChart, Pie, Cell, Legend, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';

export function CumulativeChart({ data }: { data: any[] }) {
    if (!data || data.length === 0) {
        return (
            <div className="flex bg-zinc-950 items-center justify-center h-full w-full rounded-md border border-zinc-800">
                <p className="text-zinc-500">No closed trades to plot.</p>
            </div>
        );
    }
    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <XAxis dataKey="trade" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <RechartsTooltip
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                    itemStyle={{ color: '#e4e4e7' }}
                    formatter={(value) => [`$${value}`, 'Net P&L']}
                />
                <Area
                    type="step"
                    dataKey="cumulative"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorCumulative)"
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}

export function WinLossChart({ winCount, lossCount }: { winCount: number, lossCount: number }) {
    const data = [
        { name: 'Wins', value: winCount, color: '#10b981' },
        { name: 'Losses', value: lossCount, color: '#f43f5e' },
    ];

    if (winCount === 0 && lossCount === 0) {
        return (
            <div className="flex bg-zinc-950 items-center justify-center h-full w-full rounded-md border border-zinc-800">
                <p className="text-zinc-500">No closed trades yet.</p>
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <RechartsTooltip
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                    itemStyle={{ color: '#e4e4e7' }}
                />
                <Legend verticalAlign="bottom" height={36} />
            </PieChart>
        </ResponsiveContainer>
    );
}
