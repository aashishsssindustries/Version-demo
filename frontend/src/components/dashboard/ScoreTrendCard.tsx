import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { profileService } from '../../services/api';
import './ScoreTrendCard.css';

interface ScoreHistoryEntry {
    id: string;
    health_score: number;
    persona_label?: string;
    created_at: string;
}

export const ScoreTrendCard: React.FC = () => {
    const [history, setHistory] = useState<ScoreHistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable');
    const [trendValue, setTrendValue] = useState(0);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const response = await profileService.getScoreHistory(30);
            const data = response.data || [];
            setHistory(data);

            // Calculate trend
            if (data.length >= 2) {
                const latest = data[data.length - 1].health_score;
                const previous = data[data.length - 2].health_score;
                const diff = latest - previous;

                setTrendValue(Math.abs(diff));
                if (diff > 0) setTrend('up');
                else if (diff < 0) setTrend('down');
                else setTrend('stable');
            }
        } catch (err) {
            console.error('Failed to fetch score history', err);
        } finally {
            setLoading(false);
        }
    };

    const chartData = history.map(entry => ({
        date: new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: entry.health_score
    }));

    const latestScore = history.length > 0 ? history[history.length - 1].health_score : 0;

    if (loading) {
        return (
            <div className="score-trend-card">
                <div className="card-header">
                    <h3>Score Trend</h3>
                </div>
                <div className="loading-state">Loading...</div>
            </div>
        );
    }

    if (history.length < 2) {
        return (
            <div className="score-trend-card">
                <div className="card-header">
                    <h3>Score Trend</h3>
                </div>
                <div className="empty-state">
                    <p>Not enough data yet. Update your profile to track your progress!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="score-trend-card">
            <div className="card-header">
                <div>
                    <h3>Score Trend</h3>
                    <p className="subtitle">Last {history.length} updates</p>
                </div>
                <div className={`trend-badge ${trend}`}>
                    {trend === 'up' && <TrendingUp size={18} />}
                    {trend === 'down' && <TrendingDown size={18} />}
                    {trend === 'stable' && <Minus size={18} />}
                    <span>{trendValue > 0 ? `${trend === 'up' ? '+' : '-'}${trendValue}` : 'No change'}</span>
                </div>
            </div>

            <div className="current-score">
                <span className="score-label">Current Score</span>
                <span className="score-value">{latestScore}</span>
            </div>

            <div className="chart-container">
                <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={chartData}>
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 12, fill: '#9ca3af' }}
                            stroke="#e5e7eb"
                        />
                        <YAxis
                            domain={[0, 100]}
                            tick={{ fontSize: 12, fill: '#9ca3af' }}
                            stroke="#e5e7eb"
                        />
                        <Tooltip
                            contentStyle={{
                                background: '#fff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '14px'
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="score"
                            stroke="#667eea"
                            strokeWidth={3}
                            dot={{ fill: '#667eea', r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
