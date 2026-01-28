import React, { useEffect, useState } from 'react';
import { portfolioService } from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AlertCircle, CheckCircle, TrendingUp, Info, ArrowUpRight } from 'lucide-react';
import PersonaAllocationChart from './PersonaAllocationChart'; // Assuming same directory or adjust import
import './PortfolioHealthWidget.css'; // Will create this

interface PortfolioHealthWidgetProps {
    className?: string; // Standard prop for styling
}

const PortfolioHealthWidget: React.FC<PortfolioHealthWidgetProps> = ({ className }) => {
    const [loading, setLoading] = useState(true);
    const [alignmentData, setAlignmentData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchAlignmentData();
    }, []);

    const fetchAlignmentData = async () => {
        try {
            setLoading(true);
            const data = await portfolioService.getPortfolioAlignment();

            // The API interceptor unwraps the response if success is true.
            // So if we get the data object directly, it's a success.
            // We check for a known property to verify.
            if (data && data.alignmentScore !== undefined) {
                setAlignmentData(data);
            } else {
                // If success was false, the interceptor returns the original response body
                setError('Failed to load portfolio health data');
            }
        } catch (err) {
            console.error(err);
            setError('Unable to fetch portfolio alignment');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Card className={`portfolio-health-widget loading ${className || ''} border border-slate-200 shadow-sm`}>
                <CardContent className="p-6">
                    <div className="skeleton-pulse" style={{ height: '300px', background: '#f8fafc', borderRadius: '12px' }}></div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className={`portfolio-health-widget error ${className || ''} border border-red-100 shadow-sm`}>
                <CardContent className="p-6">
                    <div className="error-state">
                        <AlertCircle className="text-red-500 mb-2" />
                        <p>{error}</p>
                        <button onClick={fetchAlignmentData} className="retry-btn">Retry</button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!alignmentData || !alignmentData.actualAllocation) {
        return null; // Or empty state
    }

    const { alignmentScore, actualAllocation, advisoryFlags, persona } = alignmentData;

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
        if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-100';
        return 'text-red-500 bg-red-50 border-red-100';
    };

    const scoreColorClass = getScoreColor(alignmentScore);

    return (
        <Card className={`portfolio-health-widget ${className || ''} border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300`}>
            <CardHeader className="pb-4 pt-6 px-6 border-b border-slate-100">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            Portfolio Alignment
                        </CardTitle>
                        <p className="text-xs text-slate-500 mt-1 font-medium">Benchmark: <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{persona}</span></p>
                    </div>
                    <div className={`flex flex-col items-end px-3 py-1.5 rounded-lg border ${scoreColorClass}`}>
                        <span className="text-2xl font-bold leading-none">
                            {alignmentScore}/100
                        </span>
                        <span className="text-[10px] font-semibold uppercase tracking-wider opacity-90">Score</span>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100">
                    {/* Left: Visualization */}
                    <div className="chart-section flex flex-col items-center justify-center p-6 md:w-5/12 bg-slate-50/50">
                        <div className="relative">
                            <PersonaAllocationChart size={160} interactive />
                            {/* Overlay Label for Context */}
                            <div className="absolute -bottom-6 left-0 right-0 text-center">
                                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Ideal Mix</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Stats & Flags */}
                    <div className="stats-section p-6 md:w-7/12">
                        {/* Actual vs Ideal (Portfolio Specific) */}
                        <div className="mb-6 space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-bold text-slate-700">Current Allocation</h4>
                            </div>

                            {/* Equity */}
                            <div className="group">
                                <div className="flex justify-between text-xs mb-1.5 font-medium">
                                    <span className="text-slate-600 flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-blue-600"></div> Equity
                                    </span>
                                    <span className="text-slate-400">Target: {alignmentData.idealAllocation.equity}%</span>
                                </div>
                                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                                    <div
                                        className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out group-hover:bg-blue-500"
                                        style={{ width: `${Math.min(actualAllocation.equity, 100)}%` }}
                                    />
                                </div>
                                <div className="text-right text-xs mt-1 font-bold text-slate-700">{actualAllocation.equity.toFixed(1)}%</div>
                            </div>

                            {/* Mutual Funds / Debt */}
                            <div className="group">
                                <div className="flex justify-between text-xs mb-1.5 font-medium">
                                    <span className="text-slate-600 flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div> Debt / MF
                                    </span>
                                    <span className="text-slate-400">Target: {alignmentData.idealAllocation.mutualFund}%</span>
                                </div>
                                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                                    <div
                                        className="h-full bg-indigo-500 rounded-full transition-all duration-1000 ease-out group-hover:bg-indigo-400"
                                        style={{ width: `${Math.min(actualAllocation.mutualFund, 100)}%` }}
                                    />
                                </div>
                                <div className="text-right text-xs mt-1 font-bold text-slate-700">{actualAllocation.mutualFund.toFixed(1)}%</div>
                            </div>
                        </div>

                        {/* Advisory Flags */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Advisor Notes</h4>

                            {advisoryFlags.length === 0 && (
                                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 flex items-start gap-3">
                                    <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-semibold text-emerald-800">Perfect Alignment</p>
                                        <p className="text-[11px] text-emerald-600">Your portfolio matches your risk profile.</p>
                                    </div>
                                </div>
                            )}

                            {advisoryFlags.slice(0, 2).map((flag: any) => (
                                <div
                                    key={flag.id}
                                    className={`p-3 rounded-lg border-l-4 flex items-start gap-3 shadow-sm ${flag.type === 'warning' ? 'bg-white border-l-amber-500 border border-slate-100' :
                                            flag.type === 'suggestion' ? 'bg-white border-l-blue-500 border border-slate-100' :
                                                'bg-white border-l-slate-400 border border-slate-100'
                                        }`}
                                >
                                    {flag.type === 'warning' ? <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" /> :
                                        flag.type === 'suggestion' ? <TrendingUp className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" /> :
                                            <Info className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />}
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-slate-800 mb-0.5 truncate">
                                            {flag.title}
                                        </p>
                                        <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                                            {flag.message}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {advisoryFlags.length > 2 && (
                                <button className="w-full text-center text-xs text-blue-600 font-medium hover:underline flex items-center justify-center gap-1 mt-2">
                                    View {advisoryFlags.length - 2} more <ArrowUpRight size={12} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default PortfolioHealthWidget;
