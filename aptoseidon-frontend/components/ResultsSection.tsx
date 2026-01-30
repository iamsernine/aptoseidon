import React, { useState } from 'react';
import { RiskReport, PreCheckData } from '../types';
import { ShieldAlert, ShieldCheck, ThumbsUp, ThumbsDown, Activity, Users, Clock, Lock } from 'lucide-react';
import { Button } from './Button';

interface ResultsSectionProps {
  preCheckData: PreCheckData;
  report: RiskReport | null;
  onUnlock: () => void;
  isUnlocking: boolean;
  hasPaid: boolean;
}

export const ResultsSection: React.FC<ResultsSectionProps> = ({ 
  preCheckData, 
  report, 
  onUnlock, 
  isUnlocking,
  hasPaid
}) => {
  const [rating, setRating] = useState<'up' | 'down' | null>(null);

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
              <Clock size={12}/> Project Age
            </div>
            <div className="text-xl font-mono">{preCheckData.age}</div>
          </div>
          <div className="bg-black/40 p-4 border border-neutral-800">
            <div className="text-neutral-400 text-xs uppercase mb-1 flex items-center gap-1">
              <Lock size={12}/> Liquidity
            </div>
            <div className="text-xl font-mono">{preCheckData.liquidity}</div>
          </div>
          <div className="bg-black/40 p-4 border border-neutral-800">
             <div className="text-neutral-400 text-xs uppercase mb-1 flex items-center gap-1">
              <Users size={12}/> Social Pulse
            </div>
            <div className="text-xl font-mono">{preCheckData.socialMentions}</div>
          </div>
        </div>
      </div>

      {/* AI Report Section */}
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
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-500" />
                AI Security Report
              </h3>
              <span className="text-xs font-mono text-neutral-500">GENERATED VIA GEMINI 2.5</span>
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
                    <h4 className="text-sm font-bold text-neutral-300 mb-1 uppercase tracking-wide">Executive Summary</h4>
                    <p className="text-sm text-neutral-400 leading-relaxed">{report.summary}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-bold text-neutral-300 mb-1 uppercase tracking-wide">Key Findings</h4>
                    <ul className="space-y-2">
                      {report.auditDetails.map((detail, idx) => (
                        <li key={idx} className="text-sm text-neutral-400 flex items-start gap-2">
                          <span className="text-red-500 mt-1">⚠</span>
                          {detail}
                        </li>
                      ))}
                    </ul>
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
                <span className="text-sm text-white">Submit your rating on-chain</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setRating('up')}
                  className={`p-2 border ${rating === 'up' ? 'bg-green-500/20 border-green-500 text-green-500' : 'border-neutral-700 hover:border-neutral-500'} transition-colors`}
                >
                  <ThumbsUp size={18} />
                </button>
                <button 
                  onClick={() => setRating('down')}
                  className={`p-2 border ${rating === 'down' ? 'bg-red-500/20 border-red-500 text-red-500' : 'border-neutral-700 hover:border-neutral-500'} transition-colors`}
                >
                  <ThumbsDown size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};