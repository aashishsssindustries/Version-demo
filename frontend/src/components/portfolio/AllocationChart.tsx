import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend
} from 'recharts';

interface Holding {
    id: string;
    name: string;
    type: 'EQUITY' | 'MUTUAL_FUND';
    quantity: number;
    last_valuation?: number;
}

interface AllocationChartProps {
    holdings: Holding[];
}

const COLORS = ['#10b981', '#6366f1', '#34d399', '#818cf8', '#6ee7b7', '#a5b4fc', '#059669', '#4f46e5'];

const AllocationChart: React.FC<AllocationChartProps> = ({ holdings }) => {
    // Group by asset type
    const typeData = holdings.reduce((acc, h) => {
        const key = h.type === 'MUTUAL_FUND' ? 'Mutual Funds' : 'Equities';
        const val = h.last_valuation || 0;
        acc[key] = (acc[key] || 0) + val;
        return acc;
    }, {} as Record<string, number>);

    const chartData = Object.entries(typeData).map(([name, value]) => ({
        name,
        value: Math.round(value)
    }));

    if (chartData.length === 0 || chartData.every(d => d.value === 0)) {
        return (
            <div className="chart-empty">
                <p>No valuation data available</p>
            </div>
        );
    }

    const total = chartData.reduce((sum, d) => sum + d.value, 0);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const percent = ((data.value / total) * 100).toFixed(1);
            const color = payload[0].fill;

            return (
                <div className="chart-tooltip" style={{ background: '#1e293b', color: '#f8fafc', border: 'none' }}>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></div>
                        <p className="tooltip-label mb-0" style={{ color: '#e2e8f0', fontFamily: 'Inter' }}>{data.name}</p>
                    </div>
                    <p className="tooltip-value" style={{ fontFamily: 'Roboto Mono' }}>₹{data.value.toLocaleString('en-IN')}</p>
                    <p className="tooltip-percent" style={{ color: '#94a3b8' }}>{percent}% of Portfolio</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="chart-container">
            <div className="flex justify-between items-start mb-4">
                <h3 className="chart-title mb-0">Asset Allocation</h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                    >
                        {chartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} cursor={false} />
                    <Legend
                        verticalAlign="middle"
                        align="right"
                        layout="vertical"
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: '11px', fontWeight: 500, fontFamily: 'Inter' }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default AllocationChart;
