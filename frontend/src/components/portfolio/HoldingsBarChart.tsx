import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

interface Holding {
    id: string;
    name: string;
    type: 'EQUITY' | 'MUTUAL_FUND';
    quantity: number;
    last_valuation?: number;
}

interface HoldingsBarChartProps {
    holdings: Holding[];
    maxItems?: number;
}

const COLORS = {
    EQUITY: '#10b981', // Emerald 500
    MUTUAL_FUND: '#6366f1' // Indigo 500
};

const HoldingsBarChart: React.FC<HoldingsBarChartProps> = ({ holdings, maxItems = 8 }) => {
    // Sort by valuation and take top items
    const sortedHoldings = [...holdings]
        .filter(h => h.last_valuation && h.last_valuation > 0)
        .sort((a, b) => (b.last_valuation || 0) - (a.last_valuation || 0))
        .slice(0, maxItems);

    const chartData = sortedHoldings.map(h => ({
        name: h.name.length > 15 ? h.name.substring(0, 12) + '...' : h.name,
        fullName: h.name,
        value: Math.round(h.last_valuation || 0),
        type: h.type
    }));

    if (chartData.length === 0) {
        return (
            <div className="chart-empty">
                <p>No valuation data available</p>
            </div>
        );
    }

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const color = COLORS[data.type as keyof typeof COLORS];
            return (
                <div className="chart-tooltip" style={{ background: '#1e293b', color: '#f8fafc', border: 'none' }}>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></div>
                        <p className="tooltip-label mb-0" style={{ color: '#e2e8f0' }}>{data.fullName}</p>
                    </div>
                    <p className="tooltip-value" style={{ fontFamily: 'Roboto Mono' }}>₹{data.value.toLocaleString('en-IN')}</p>
                    <p className="tooltip-type mt-1 text-xs text-slate-400">{data.type === 'MUTUAL_FUND' ? 'Mutual Fund' : 'Equity'}</p>
                </div>
            );
        }
        return null;
    };

    const formatYAxis = (value: number) => {
        if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
        if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
        if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
        return `₹${value}`;
    };

    return (
        <div className="chart-container">
            <h3 className="chart-title mb-4">Top Holdings by Value</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                    <XAxis
                        type="number"
                        tickFormatter={formatYAxis}
                        stroke="#94a3b8"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        fontFamily="Roboto Mono"
                    />
                    <YAxis
                        type="category"
                        dataKey="name"
                        stroke="#64748b"
                        width={100}
                        fontSize={11}
                        fontWeight={500}
                        tickLine={false}
                        axisLine={false}
                        fontFamily="Inter"
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9', opacity: 0.5 }} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={12}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[entry.type]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default HoldingsBarChart;
