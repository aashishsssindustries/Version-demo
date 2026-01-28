import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Trophy, Zap, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ActionItem {
    id: string;
    title: string;
    description: string;
    category: string;
    priority: 'High' | 'Medium' | 'Low';
    gap_amount?: number;
    estimated_score_impact?: number;
    action?: string;
    linked_tool?: string;
    persona_context?: string;
    risk_type?: string;
}

interface ActionChecklistCardProps {
    actionItems: ActionItem[];
    hasProfile: boolean;
}

export const ActionChecklistCard: React.FC<ActionChecklistCardProps> = ({ actionItems, hasProfile }) => {

    const getToolLink = (item: ActionItem) => {
        if (!item.linked_tool) return '/calculators';

        const tool = item.linked_tool.toLowerCase();
        let toolId = '';

        if (tool.includes('sip')) toolId = 'sip';
        else if (tool.includes('retire')) toolId = 'retirement';
        else if (tool.includes('insurance') || tool.includes('life')) toolId = 'life-insurance';
        else if (tool.includes('emi')) toolId = 'emi';
        else if (tool.includes('education')) toolId = 'education';

        // Build URL with context parameters
        const params = new URLSearchParams({
            tool: toolId,
            context: 'action',
            title: item.title,
            ...(item.gap_amount && { gap: item.gap_amount.toString() })
        });

        return `/calculators?${params.toString()}`;
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                        <Trophy size={20} className="text-amber-500 fill-amber-500/20" />
                        Action Plan
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 pl-1">Top priorities to improve your score</p>
                </div>
                {actionItems.length > 0 && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full uppercase tracking-wide">
                        {actionItems.length} Pending
                    </span>
                )}
            </div>

            <div className="space-y-4 flex-1 overflow-visible">
                <AnimatePresence>
                    {actionItems && actionItems.length > 0 ? (
                        actionItems.map((item, index) => (
                            <motion.div
                                key={item.id || index}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col gap-3 group relative overflow-hidden"
                            >
                                <div className="flex items-start gap-4 z-10">
                                    <div className={`p-2.5 rounded-xl shrink-0 ${item.priority === 'High' ? 'bg-red-50 text-red-500' :
                                            item.priority === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                                        }`}>
                                        <AlertTriangle size={20} className={item.priority === 'High' ? 'fill-red-500/20' : ''} />
                                    </div>

                                    <div className="flex-1 min-w-0 pt-0.5">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-bold text-slate-800 text-sm leading-tight truncate pr-2" title={item.title}>
                                                {item.title}
                                            </h4>
                                            {item.priority === 'High' && (
                                                <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full uppercase tracking-wider">High</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed h-8">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-slate-50 mt-1">
                                    <div className="flex items-center gap-2">
                                        {item.estimated_score_impact && (
                                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg flex items-center gap-1.5 ring-1 ring-emerald-100">
                                                <Zap size={10} className="fill-emerald-600" /> +{item.estimated_score_impact} pts
                                            </span>
                                        )}
                                    </div>
                                    <Link
                                        to={getToolLink(item)}
                                        className="text-xs font-bold text-white bg-slate-900 hover:bg-blue-600 px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow-sm group-hover:shadow-md"
                                    >
                                        Fix Now <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                                    </Link>
                                </div>

                                {/* Decorative gradient blob */}
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-slate-50 to-transparent rounded-bl-full -z-0 opacity-50"></div>
                            </motion.div>
                        ))
                    ) : hasProfile ? (
                        <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl p-8 text-center border border-emerald-100 shadow-sm flex flex-col items-center justify-center h-48">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                                <CheckCircle2 size={24} className="text-emerald-500 fill-emerald-100" />
                            </div>
                            <h3 className="font-bold text-emerald-800 text-sm mb-1">All Clear!</h3>
                            <p className="text-xs text-emerald-600 max-w-[200px]">Your financial health is looking great. Keep analyzing to maintain your score.</p>
                        </div>
                    ) : (
                        <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                            <p className="text-sm font-medium text-slate-500 mb-2">Start your journey</p>
                            <p className="text-xs text-slate-400">Complete your profile to unlock personalized action items.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
