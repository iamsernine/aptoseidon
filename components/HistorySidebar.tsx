import React from 'react';
import { HistoryItem } from '../services/api';
import { History, ExternalLink, ShieldCheck, ShieldAlert, Clock } from 'lucide-react';

interface HistorySidebarProps {
    history: HistoryItem[];
    onSelect: (item: HistoryItem) => void;
    isLoading: boolean;
    isOpen: boolean;
    onToggle: () => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
    history,
    onSelect,
    isLoading,
    isOpen,
    onToggle
}) => {
    return (
        <>
            {/* Drawer Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
                    onClick={onToggle}
                />
            )}

            {/* Sidebar Container */}
            <aside className={`fixed right-0 top-16 bottom-0 w-80 bg-neutral-900/95 backdrop-blur-xl border-l border-neutral-800 z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
                        <h3 className="font-bold flex items-center gap-2">
                            <History size={18} className="text-blue-500" />
                            Search History
                        </h3>
                        <button
                            onClick={onToggle}
                            className="p-1 hover:bg-neutral-800 rounded transition-colors"
                        >
                            <ExternalLink size={16} className="text-neutral-500 rotate-180" />
                        </button>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-20 text-neutral-500">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-2"></div>
                                Loading history...
                            </div>
                        ) : history.length === 0 ? (
                            <div className="text-center py-10">
                                <History size={32} className="mx-auto text-neutral-700 mb-2 opacity-50" />
                                <p className="text-neutral-500 text-sm">No history found for this wallet.</p>
                            </div>
                        ) : (
                            history.map((item) => (
                                <button
                                    key={item.job_id}
                                    onClick={() => onSelect(item)}
                                    className="w-full text-left p-3 border border-neutral-800 bg-black/40 hover:border-blue-500/50 hover:bg-neutral-800/50 transition-all group"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                                            {item.project_type}
                                        </span>
                                        <span className="text-[9px] text-neutral-600 flex items-center gap-1">
                                            <Clock size={8} />
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <h4 className="text-sm font-bold truncate text-neutral-200 group-hover:text-white transition-colors mb-2">
                                        {item.project_url.replace(/^https?:\/\//, '')}
                                    </h4>

                                    <div className="flex items-center gap-2">
                                        <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${item.report.report.riskScore < 30 ? 'bg-green-500/10 text-green-500' :
                                                item.report.report.riskScore < 70 ? 'bg-yellow-500/10 text-yellow-500' :
                                                    'bg-red-500/10 text-red-500'
                                            }`}>
                                            {item.report.report.riskScore < 30 ? <ShieldCheck size={10} /> : <ShieldAlert size={10} />}
                                            SCORE: {item.report.report.riskScore}
                                        </div>
                                        <span className="text-[10px] text-neutral-500 uppercase">
                                            {item.report.report.riskLevel}
                                        </span>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>

                    {/* Footer Notification */}
                    <div className="p-4 bg-blue-500/5 border-t border-neutral-800">
                        <p className="text-[10px] text-neutral-400 leading-tight">
                            Stored history is limited to the last 50 reports per wallet for optimal performance.
                        </p>
                    </div>
                </div>
            </aside>

            {/* Trigger Button (Floating) */}
            {!isOpen && (
                <button
                    onClick={onToggle}
                    className="fixed right-6 bottom-24 p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg shadow-blue-500/20 z-40 transition-all hover:scale-110 active:scale-95"
                    title="Search History"
                >
                    <History size={24} />
                </button>
            )}
        </>
    );
};
