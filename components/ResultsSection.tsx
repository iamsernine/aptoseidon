import React, { useState } from 'react';
import { RiskReport, PreCheckData } from '../types';
import { postReputationRate } from '../services/api';
import { ShieldAlert, ShieldCheck, ThumbsUp, ThumbsDown, Activity, Users, Clock, Lock, TrendingUp } from 'lucide-react';
import { Button } from './Button';
import { AdvancedRealTimeChart } from "react-ts-tradingview-widgets";

interface ResultsSectionProps {
  preCheckData: PreCheckData;
  report: RiskReport | null;
  jobId: string | null;
  onUnlock: () => void;
  isUnlocking: boolean;
  hasPaid: boolean;
  isEvidenceOnly?: boolean;
}

export const ResultsSection: React.FC<ResultsSectionProps> = ({
  preCheckData,
  report,
  jobId,
  onUnlock,
  isUnlocking,
  hasPaid,
  isEvidenceOnly = false
}) => {
  const [rating, setRating] = useState<'up' | 'down' | null>(null);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  const handleRating = async (value: 'up' | 'down') => {
    if (!jobId) return;
    setRatingSubmitting(true);
    try {
      await postReputationRate(jobId, value);
      setRating(value);
    } catch (e) {
      console.error('Failed to submit rating:', e);
    } finally {
      setRatingSubmitting(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score < 30) return 'text-green-400';
    if (score < 70) return 'text-yellow-400';
    return 'text-red-500';
  };

  return (
    <div className="w-full space-y-6 animate-fade-in">
      {/* Free Pre-Check Module */}
      <div className="border border-neutral-800 bg-neutral-900/50 backdrop-blur-sm p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-500" />
          Pre-Check Analysis
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-black/40 p-4 border border-neutral-800">
            <div className="text-neutral-400 text-xs uppercase mb-1 flex items-center gap-1">
              <Clock size={12} /> Project Age
            </div>
            <div className="text-xl font-mono">{preCheckData.age}</div>
          </div>
          <div className="bg-black/40 p-4 border border-neutral-800">
            <div className="text-neutral-400 text-xs uppercase mb-1 flex items-center gap-1">
              <Lock size={12} /> Liquidity
            </div>
            <div className="text-xl font-mono">{preCheckData.liquidity}</div>
          </div>
          <div className="bg-black/40 p-4 border border-neutral-800">
            <div className="text-neutral-400 text-xs uppercase mb-1 flex items-center gap-1">
              <Users size={12} /> Social Pulse
            </div>
            <div className="text-xl font-mono">{preCheckData.socialMentions}</div>
          </div>
        </div>
      </div>

      {/* AI Report Section - Hidden if Evidence Only */}
      {!isEvidenceOnly && (
        <div className={`border ${hasPaid ? 'border-neutral-700 bg-black' : 'border-neutral-800 bg-neutral-900/30'} p-6 relative transition-all duration-500`}>
          {!hasPaid ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <ShieldAlert className="w-12 h-12 text-neutral-600 mb-2" />
              <h3 className="text-xl font-bold">Deep Risk Analysis Locked</h3>
              <p className="text-neutral-400 max-w-md">
                Unlock the comprehensive AI-driven security report, including smart contract audit summary and investment risk scoring.
              </p>
              <div className="pt-4">
                <Button onClick={onUnlock} isLoading={isUnlocking} variant="primary">
                  Unlock Report (0.01 USDC)
                </Button>
                <p className="text-xs text-neutral-500 mt-2">Powered by Aptos & x402</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Market Intelligence */}
              {report && report.marketData && (
                <div className="mb-8 border border-neutral-800 bg-neutral-900/50 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <Activity className="w-5 h-5 text-blue-500" />
                      Market Intelligence
                    </h3>
                    <span className="text-xs font-mono text-neutral-500 uppercase">Live via CoinGecko</span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-black border border-neutral-800">
                      <div className="text-neutral-500 text-xs uppercase mb-1">Price (USD)</div>
                      <div className="text-xl font-mono text-white">
                        ${report.marketData.price_usd.toLocaleString()}
                      </div>
                    </div>

                    <div className="p-3 bg-black border border-neutral-800">
                      <div className="text-neutral-500 text-xs uppercase mb-1">24h Change</div>
                      <div className={`text-xl font-mono flex items-center gap-1 ${report.marketData.change_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {report.marketData.change_24h >= 0 ? '▲' : '▼'}
                        {Math.abs(report.marketData.change_24h).toFixed(2)}%
                      </div>
                    </div>

                    <div className="p-3 bg-black border border-neutral-800">
                      <div className="text-neutral-500 text-xs uppercase mb-1">Market Cap</div>
                      <div className="text-xl font-mono text-white">
                        ${(report.marketData.market_cap / 1_000_000_000).toFixed(2)}B
                      </div>
                    </div>

                    <div className="p-3 bg-black border border-neutral-800">
                      <div className="text-neutral-500 text-xs uppercase mb-1">24h Volume</div>
                      <div className="text-xl font-mono text-white">
                        ${(report.marketData.vol_24h / 1_000_000).toFixed(2)}M
                      </div>
                    </div>
                  </div>

                  {/* TradingView Chart */}
                  <div className="mt-4 h-[400px] w-full border border-neutral-800">
                    <AdvancedRealTimeChart
                      symbol={`BINANCE:${report.marketData.symbol}USD`}
                      theme="dark"
                      autosize
                      hide_side_toolbar={false}
                    />
                  </div>
                </div>
              )}

              {/* Deterministic Trust Layer (Rules) */}
              {report && report.ruleResults && report.ruleResults.length > 0 && (
                <div className="mb-8 border border-neutral-800 bg-neutral-900/50 p-6">
                  <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                    <Lock className="w-5 h-5 text-neutral-400" />
                    Trust Layer Validation
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {report.ruleResults.map((rule, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-black border border-neutral-800 rounded">
                        <div>
                          <span className="text-xs font-mono text-neutral-500 uppercase block">{rule.source}</span>
                          <span className="text-sm font-medium text-neutral-300">{rule.reason}</span>
                        </div>
                        <div className={`text-xs font-bold px-2 py-1 rounded ${rule.status === 'PASS' ? 'bg-green-500/20 text-green-500' :
                          rule.status === 'FAIL' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'
                          }`}>
                          {rule.status}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Structure Analysis (Compliant) */}
              {report && report.financialAnalysis && (
                <div className="mb-8 border border-neutral-800 bg-gradient-to-r from-neutral-900 to-black p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <TrendingUp size={100} />
                  </div>

                  <div className="flex items-center gap-4 mb-6">
                    <div className={`text-3xl font-black px-4 py-2 rounded border ${report.financialAnalysis.structure_score === 'STRONG' ? 'border-green-500 text-green-500 bg-green-500/10' :
                      report.financialAnalysis.structure_score === 'WEAK' || report.financialAnalysis.structure_score === 'CRITICAL' ? 'border-red-500 text-red-500 bg-red-500/10' :
                        'border-yellow-500 text-yellow-500 bg-yellow-500/10'
                      }`}>
                      {report.financialAnalysis.structure_score}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Market Structure Analysis</h3>
                      <p className="text-neutral-400 text-sm max-w-xl">{report.financialAnalysis.reasoning}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {report.financialAnalysis.features.map((feature, idx) => (
                      <div key={idx} className="bg-neutral-800/50 border border-neutral-700 p-3 rounded text-center">
                        <span className="text-xs font-mono text-neutral-300 uppercase tracking-wider">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-green-500" />
                  AI Security Report
                </h3>
                <span className="text-xs font-mono text-neutral-500">BACKEND AI (GPT-4o-mini)</span>
              </div>

              {report ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Score Column */}
                  <div className="col-span-1 flex flex-col items-center justify-center border-r border-neutral-800 pr-4">
                    <div className="relative w-32 h-32 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="64" cy="64" r="60" stroke="#333" strokeWidth="8" fill="none" />
                        <circle
                          cx="64" cy="64" r="60"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={377}
                          strokeDashoffset={377 - (377 * report.riskScore) / 100}
                          className={`${getScoreColor(report.riskScore)} transition-all duration-1000 ease-out`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-3xl font-bold ${getScoreColor(report.riskScore)}`}>{report.riskScore}</span>
                        <span className="text-xs text-neutral-500 uppercase">Risk Score</span>
                      </div>
                    </div>
                    <div className="mt-4 px-3 py-1 bg-neutral-900 rounded text-xs font-bold tracking-widest uppercase text-neutral-300">
                      {report.riskLevel} Risk
                    </div>
                  </div>

                  {/* Details Column */}
                  <div className="col-span-1 md:col-span-2 space-y-4">
                    <div>
                      {/* Item #10: Disagreement Detection */}
                      {report.agentConflict && report.agentConflict.has_conflict && (
                        <div className="mb-4 p-4 border border-red-500 bg-red-500/10 rounded flex items-start gap-3">
                          <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-bold text-red-500 uppercase">Agent Misalignment Detected</h4>
                            <p className="text-xs text-red-400">{report.agentConflict.reason}</p>
                          </div>
                        </div>
                      )}

                      {/* Item #6: Narrative Agent Output */}
                      {report.narrative && (
                        <div className="mb-6 border-l-2 border-blue-500 pl-4 py-1 italic">
                          <h4 className="text-xs font-bold text-blue-400 uppercase mb-1 flex items-center gap-1">
                            <Users size={12} /> Narrative Analysis
                          </h4>
                          <p className="text-sm text-neutral-300 leading-relaxed uppercase tracking-tight">
                            "{report.narrative}"
                          </p>
                        </div>
                      )}

                      <h4 className="text-sm font-bold text-neutral-300 mb-1 uppercase tracking-wide">Executive Summary</h4>
                      <p className="text-sm text-neutral-400 leading-relaxed">{report.summary}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-neutral-300 mb-2 uppercase tracking-wide">Key Findings</h4>
                      <div className="space-y-3">
                        {/* Risk Flags */}
                        {report.riskFlags && report.riskFlags.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-xs text-red-400 font-bold uppercase mb-1 block">Risk Flags</span>
                            <ul className="space-y-1">
                              {report.riskFlags.map((flag, idx) => (
                                <li key={`risk-${idx}`} className="text-sm text-neutral-400 flex items-start gap-2">
                                  <span className="text-red-500 mt-0.5">⚠</span>
                                  {flag}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Positive Signals */}
                        {report.positiveSignals && report.positiveSignals.length > 0 && (
                          <div className="space-y-1 mt-3">
                            <span className="text-xs text-green-400 font-bold uppercase mb-1 block">Positive Signals</span>
                            <ul className="space-y-1">
                              {report.positiveSignals.map((signal, idx) => (
                                <li key={`pos-${idx}`} className="text-sm text-neutral-400 flex items-start gap-2">
                                  <span className="text-green-500 mt-0.5">✓</span>
                                  {signal}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Fallback for old/empty data */}
                        {(!report.riskFlags || report.riskFlags.length === 0) && (!report.positiveSignals || report.positiveSignals.length === 0) && report.auditDetails.length > 0 && (
                          <ul className="space-y-2">
                            {report.auditDetails.map((detail, idx) => (
                              <li key={idx} className="text-sm text-neutral-400 flex items-start gap-2">
                                <span className="text-neutral-500 mt-1">•</span>
                                {detail}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-neutral-300 mb-1 uppercase tracking-wide">Advisory</h4>
                      <p className="text-sm text-white italic border-l-2 border-neutral-700 pl-3">
                        "{report.investmentAdvice}"
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center text-neutral-500 animate-pulse">
                  Analyzing smart contract patterns...
                </div>
              )}

              {/* ERC-8004 Rating */}
              <div className="pt-6 border-t border-neutral-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-neutral-500 block mb-1">ERC-8004 SIGNALING</span>
                  <span className="text-sm text-white">{jobId ? 'Submit your rating (saved to backend)' : 'Unlock report to rate'}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRating('up')}
                    disabled={!jobId || ratingSubmitting}
                    className={`p-2 border ${rating === 'up' ? 'bg-green-500/20 border-green-500 text-green-500' : 'border-neutral-700 hover:border-neutral-500'} transition-colors disabled:opacity-50`}
                  >
                    <ThumbsUp size={18} />
                  </button>
                  <button
                    onClick={() => handleRating('down')}
                    disabled={!jobId || ratingSubmitting}
                    className={`p-2 border ${rating === 'down' ? 'bg-red-500/20 border-red-500 text-red-500' : 'border-neutral-700 hover:border-neutral-500'} transition-colors disabled:opacity-50`}
                  >
                    <ThumbsDown size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};