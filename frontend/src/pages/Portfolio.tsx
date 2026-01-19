import React, { useEffect, useState } from 'react';
import { Briefcase, Trash2, TrendingUp, AlertCircle } from 'lucide-react';
import ManualEntry from '../components/portfolio/ManualEntry';
import CsvUpload from '../components/portfolio/CsvUpload';
import { portfolioService } from '../services/api';
import './Portfolio.css';

interface Holding {
    id: string;
    isin: string;
    name: string;
    type: 'EQUITY' | 'MUTUAL_FUND';
    ticker?: string;
    quantity: number;
    current_nav?: number;
    last_valuation?: number;
}

interface PortfolioSummary {
    totalValuation: number;
    holdingsCount: number;
}

const Portfolio: React.FC = () => {
    const [holdings, setHoldings] = useState<Holding[]>([]);
    const [summary, setSummary] = useState<PortfolioSummary>({ totalValuation: 0, holdingsCount: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

    const fetchHoldings = async () => {
        try {
            setLoading(true);
            const response = await portfolioService.getHoldings();
            setHoldings(response.holdings || []);
            setSummary(response.summary || { totalValuation: 0, holdingsCount: 0 });
        } catch (err: any) {
            console.error('Failed to fetch holdings', err);
            setError('Failed to load portfolio holdings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHoldings();
    }, []);

    const handleManualAdd = async (isin: string, assetType: string, quantity: number) => {
        const result = await portfolioService.addManualHolding(isin, assetType, quantity);
        if (result.success) {
            fetchHoldings();
        }
        return result;
    };

    const handleCsvUpload = async (csv: string) => {
        const result = await portfolioService.uploadCSV(csv);
        if (result.success || result.imported > 0) {
            fetchHoldings();
        }
        return result;
    };

    const handleDelete = async (holdingId: string) => {
        if (!confirm('Are you sure you want to delete this holding?')) return;

        setDeleteLoading(holdingId);
        try {
            const result = await portfolioService.deleteHolding(holdingId);
            if (result.success) {
                fetchHoldings();
            }
        } catch (err: any) {
            console.error('Failed to delete holding', err);
            setError('Failed to delete holding');
        } finally {
            setDeleteLoading(null);
        }
    };

    const formatCurrency = (value: number | undefined) => {
        if (!value) return '—';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(value);
    };

    const formatQuantity = (value: number) => {
        // Round to 4 decimal places to avoid floating-point precision issues
        const rounded = Math.round(value * 10000) / 10000;
        // If it's a whole number, show without decimals
        if (Number.isInteger(rounded)) {
            return rounded.toString();
        }
        return rounded.toFixed(4).replace(/\.?0+$/, '');
    };

    return (
        <div className="portfolio-container">
            {/* Header */}
            <div className="portfolio-header">
                <div className="header-content">
                    <Briefcase size={28} className="header-icon" />
                    <div>
                        <h1>My Portfolio</h1>
                        <p className="subtitle">Track your investments in one place (read-only)</p>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="portfolio-stats">
                    <div className="stat-card">
                        <span className="stat-label">Total Holdings</span>
                        <span className="stat-value">{summary.holdingsCount}</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">Total Valuation</span>
                        <span className="stat-value">{formatCurrency(summary.totalValuation)}</span>
                    </div>
                </div>
            </div>

            {/* Import Section */}
            <div className="import-section">
                <h2>Import Holdings</h2>
                <div className="import-grid">
                    <ManualEntry onAdd={handleManualAdd} />
                    <CsvUpload onUpload={handleCsvUpload} />
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="alert alert-error">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                    <button onClick={() => setError('')}>×</button>
                </div>
            )}

            {/* Holdings Table */}
            <div className="holdings-section">
                <h2>
                    <TrendingUp size={20} />
                    Your Holdings
                </h2>

                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading holdings...</p>
                    </div>
                ) : holdings.length === 0 ? (
                    <div className="empty-state">
                        <Briefcase size={48} className="empty-icon" />
                        <h3>No Holdings Yet</h3>
                        <p>Add your first holding using the form above or upload a CSV file.</p>
                    </div>
                ) : (
                    <div className="holdings-table-wrapper">
                        <table className="holdings-table">
                            <thead>
                                <tr>
                                    <th>Name / ISIN</th>
                                    <th>Type</th>
                                    <th>Quantity</th>
                                    <th>NAV</th>
                                    <th>Valuation</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {holdings.map((holding) => (
                                    <tr key={holding.id}>
                                        <td>
                                            <div className="holding-name">
                                                <span className="name">{holding.name}</span>
                                                <span className="isin">{holding.isin}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`type-badge ${holding.type.toLowerCase()}`}>
                                                {holding.type === 'MUTUAL_FUND' ? 'MF' : 'EQ'}
                                            </span>
                                        </td>
                                        <td className="quantity">{formatQuantity(holding.quantity)}</td>
                                        <td>{formatCurrency(holding.current_nav)}</td>
                                        <td className="valuation">{formatCurrency(holding.last_valuation)}</td>
                                        <td>
                                            <button
                                                className="btn-icon btn-delete"
                                                onClick={() => handleDelete(holding.id)}
                                                disabled={deleteLoading === holding.id}
                                                title="Delete holding"
                                            >
                                                {deleteLoading === holding.id ? (
                                                    <div className="spinner-small"></div>
                                                ) : (
                                                    <Trash2 size={16} />
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Portfolio;
