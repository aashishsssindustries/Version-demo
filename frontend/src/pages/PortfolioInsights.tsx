import React, { useEffect, useState } from 'react';
import { analyticsService, marketplaceService } from '../services/api';
import './PortfolioInsights.css';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { DownloadReportButton } from '../components/reports/DownloadReportButton';

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement
);

interface SnapshotData {
    summary: {
        totalValue: number;
        invested: number;
        returns: number;
        returnsPercentage: number;
        xirr: number | null;
        holdingsCount: number;
    };
    allocation: {
        byAssetType: Array<{ type: string; value: number; percentage: number }>;
        byCategory: Array<{ category: string; value: number; percentage: number }>;
        topHoldings: Array<{ name: string; value: number; weight: number }>;
    };
    performance: {
        portfolioXIRR: { xirr: number } | null;
        benchmarkComparison: {
            portfolioXIRR: number;
            benchmarkXIRR: number;
            outperformance: number;
            relativePerformance: string;
            explanation: string;
        } | null;
    };
    risk: {
        concentrationRisk: {
            hasRisk: boolean;
            severity: string;
            explanation: string;
        };
        riskReturnMatrix: Array<{
            isin: string;
            name: string;
            quadrant: string;
            weight: number;
        }>;
    };
    metadata: {
        asOf: string;
    };
}

const PortfolioInsights: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<SnapshotData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [recommendations, setRecommendations] = useState<any[]>([]);

    useEffect(() => {
        fetchSnapshot();
        fetchRecommendations();
    }, []);

    const fetchSnapshot = async () => {
        try {
            const response = await analyticsService.getPortfolioSnapshot();
            setData(response);
        } catch (err) {
            console.error('Failed to fetch portfolio snapshot:', err);
            setError('Failed to load portfolio analytics.');
        } finally {
            setLoading(false);
        }
    };

    const fetchRecommendations = async () => {
        try {
            const recs = await marketplaceService.getRecommendations();
            if (recs && recs.success) {
                setRecommendations(recs.data.slice(0, 3)); // Top 3
            }
        } catch (err) {
            console.error('Failed to fetch marketplace recommendations:', err);
        }
    };

    if (loading) {
        return (
            <div className="loading-state">
                <div className="spinner"></div>
                <p>Generating Portfolio Insights...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-state">
                <p>{error}</p>
                <button onClick={fetchSnapshot} className="retry-btn">Retry</button>
            </div>
        );
    }

    if (!data || data.summary.totalValue === 0) {
        return (
            <div className="empty-state">
                <h2>No Portfolio Data Found</h2>
                <p>Please upload your CAS or add holdings manually to view insights.</p>
            </div>
        );
    }

    // Chart Data Preparation
    const assetChartData = {
        labels: data.allocation.byAssetType.map((d) => d.type.replace('_', ' ')),
        datasets: [
            {
                data: data.allocation.byAssetType.map((d) => d.value),
                backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
                borderWidth: 0,
            },
        ],
    };

    const categoryChartData = {
        labels: data.allocation.byCategory.map((d) => d.category),
        datasets: [
            {
                data: data.allocation.byCategory.map((d) => d.value),
                backgroundColor: ['#6366f1', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316'],
                borderWidth: 0,
            },
        ],
    };

    // Risk Matrix Grouping
    const riskMatrixCounts = {
        'HighReturn-LowRisk': 0,
        'HighReturn-HighRisk': 0,
        'LowReturn-LowRisk': 0,
        'LowReturn-HighRisk': 0
    };

    data.risk.riskReturnMatrix.forEach(item => {
        if (riskMatrixCounts[item.quadrant as keyof typeof riskMatrixCounts] !== undefined) {
            riskMatrixCounts[item.quadrant as keyof typeof riskMatrixCounts]++;
        }
    });

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(val);
    };

    return (
        <div className="insights-container">
            <header className="insights-header">
                <div>
                    <h1>Portfolio Insights</h1>
                    <p>Comprehensive analytics & performance review</p>
                </div>
                <div className="header-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div className="last-updated">
                        As of {new Date(data.metadata.asOf).toLocaleDateString()}
                    </div>
                    <DownloadReportButton
                        flowStatus={{
                            canDownloadReport: true,
                            message: 'Download comprehensive PDF report'
                        }}
                    />
                </div>
            </header>

            {/* Executive Summary */}
            <section className="summary-section">
                <div className="summary-grid">
                    <div className="summary-card">
                        <h3>Net Worth</h3>
                        <div className="summary-value">{formatCurrency(data.summary.totalValue)}</div>
                        <div className="summary-subtext">
                            Across {data.summary.holdingsCount} holdings
                        </div>
                    </div>

                    <div className="summary-card">
                        <h3>Total Returns</h3>
                        <div className={`summary-value ${data.summary.returns >= 0 ? 'positive' : 'negative'}`}>
                            {data.summary.returns >= 0 ? '+' : ''}{formatCurrency(data.summary.returns)}
                        </div>
                        <div className={`summary-subtext ${data.summary.returnsPercentage >= 0 ? 'positive' : 'negative'}`}>
                            {data.summary.returnsPercentage.toFixed(2)}% absolute return
                        </div>
                    </div>

                    <div className="summary-card">
                        <h3>Portfolio XIRR</h3>
                        <div className="summary-value">
                            {data.performance.portfolioXIRR?.xirr
                                ? `${data.performance.portfolioXIRR.xirr.toFixed(2)}%`
                                : 'N/A'}
                        </div>
                        {data.performance.benchmarkComparison && (
                            <div className="summary-subtext neutral">
                                vs {data.performance.benchmarkComparison.benchmarkXIRR.toFixed(2)}% Benchmark
                            </div>
                        )}
                    </div>

                    {/* Concentration Risk Card */}
                    <div className="summary-card" style={{ borderColor: data.risk.concentrationRisk.hasRisk ? '#ef4444' : '#10b981' }}>
                        <h3>Risk Check</h3>
                        <div className="summary-value" style={{ fontSize: '1.5rem' }}>
                            {data.risk.concentrationRisk.hasRisk ? 'Attention Needed' : 'Healthy'}
                        </div>
                        <div className="summary-subtext neutral" style={{ fontSize: '0.8rem' }}>
                            {data.risk.concentrationRisk.explanation}
                        </div>
                    </div>
                </div>
            </section>

            {/* Allocation Charts */}
            <section className="charts-grid">
                <div className="chart-card">
                    <h2>Asset Allocation</h2>
                    <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
                        <Doughnut
                            data={assetChartData}
                            options={{
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: { position: 'bottom', labels: { color: '#e0e0e0' } }
                                }
                            }}
                        />
                    </div>
                </div>

                <div className="chart-card">
                    <h2>Category Exposure</h2>
                    <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
                        <Doughnut
                            data={categoryChartData}
                            options={{
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: { position: 'bottom', labels: { color: '#e0e0e0' } }
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Risk Matrix Visualization */}
                <div className="chart-card">
                    <h2>Risk-Return Matrix</h2>
                    <div className="risk-matrix">
                        <div className="risk-quadrant" style={{ borderRight: '1px dashed #4b5563', borderBottom: '1px dashed #4b5563' }}>
                            <div className="quadrant-label">Low Risk / High Return</div>
                            <div className="quadrant-value" style={{ color: '#10b981' }}>{riskMatrixCounts['HighReturn-LowRisk']}</div>
                            <div className="quadrant-schemes">Schemes</div>
                        </div>
                        <div className="risk-quadrant" style={{ borderBottom: '1px dashed #4b5563' }}>
                            <div className="quadrant-label">High Risk / High Return</div>
                            <div className="quadrant-value" style={{ color: '#f59e0b' }}>{riskMatrixCounts['HighReturn-HighRisk']}</div>
                            <div className="quadrant-schemes">Schemes</div>
                        </div>
                        <div className="risk-quadrant" style={{ borderRight: '1px dashed #4b5563' }}>
                            <div className="quadrant-label">Low Risk / Low Return</div>
                            <div className="quadrant-value" style={{ color: '#6366f1' }}>{riskMatrixCounts['LowReturn-LowRisk']}</div>
                            <div className="quadrant-schemes">Schemes</div>
                        </div>
                        <div className="risk-quadrant">
                            <div className="quadrant-label">High Risk / Low Return</div>
                            <div className="quadrant-value" style={{ color: '#ef4444' }}>{riskMatrixCounts['LowReturn-HighRisk']}</div>
                            <div className="quadrant-schemes">Schemes</div>
                        </div>
                    </div>
                    <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#9ca3af', textAlign: 'center' }}>
                        Breakdown of your holdings by risk-return profile.
                    </p>
                </div>
            </section>

            {/* Marketplace Recommendations (Read-Only) */}
            {recommendations.length > 0 && (
                <section className="recommendations-section">
                    <h2>Recommended for You</h2>
                    <div className="recommendations-grid">
                        {recommendations.map((rec, index) => (
                            <div key={index} className="rec-card">
                                <div className="rec-header">
                                    <span className="rec-category">{rec.category || 'Investment'}</span>
                                    {rec.riskLevel && (
                                        <span className="rec-category" style={{ background: '#374151', color: '#d1d5db' }}>
                                            {rec.riskLevel}
                                        </span>
                                    )}
                                </div>
                                <h3>{rec.name}</h3>
                                <p className="rec-desc">{rec.description || rec.justification}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

export default PortfolioInsights;
