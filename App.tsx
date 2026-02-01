
import React, { useState } from 'react';
import { ProjectType, PreCheckData, RiskReport } from './types';
import { submitPayment, WalletName } from './services/walletService';
import { postAudit, postReputationRate, getReputationRatings, PaymentRequiredError } from './services/api';
import { Button } from './components/Button';
import { ResultsSection } from './components/ResultsSection';
import { Terminal, Wallet, ArrowRight } from 'lucide-react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';

const App: React.FC = () => {
  // Adapter Hook
  const { account, connected, connect, disconnect, signAndSubmitTransaction, wallet, network } = useWallet();

  // State
  const [projectType, setProjectType] = useState<ProjectType>(ProjectType.COIN);
  const [inputUrl, setInputUrl] = useState('');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [preCheckData, setPreCheckData] = useState<PreCheckData | null>(null);

  const [isUnlocking, setIsUnlocking] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [riskReport, setRiskReport] = useState<RiskReport | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [evidenceOnly, setEvidenceOnly] = useState(false);

  // Handlers
  const handleConnect = (name: WalletName) => {
    // Adapter uses specific wallet names. Petra is usually "Petra"
    connect(name as any);
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const handleAnalyze = async () => {
    if (!inputUrl) return;
    if (!connected || !account) {
      alert("Please connect your wallet first.");
      return;
    }

    // Strict Network Check
    if (network && network.name.toLowerCase() !== 'testnet') {
      alert(`You are currently on ${network.name}. Please switch your wallet to Aptos Testnet to proceed.`);
      return;
    }

    setIsAnalyzing(true);
    setAuditError(null);
    setPreCheckData(null); // Reset UI

    try {
      // 1. Check if we need to pay
      let currentHash = null;

      if (!evidenceOnly) {
        try {
          await postAudit({
            project_url: inputUrl.trim(),
            project_type: projectType,
            wallet_address: account.address.toString(),
            payment_tx_hash: null,
            request_mode: "full",
            evidence_only: false
          });
          // If success immediately (already paid or free?), fine
        } catch (e) {
          if (e instanceof PaymentRequiredError) {
            console.log("402 Payment Required:", e.message);
            // 2. Prompt Wallet to Pay using Adapter
            const txHash = await submitPayment(
              signAndSubmitTransaction,
              e.recipient,
              e.amount
            );
            currentHash = txHash;
          } else {
            throw e; // Other error
          }
        }
      }

      // 3. Request Analysis (with hash if paid, or without if evidence_only)
      const res = await postAudit({
        project_url: inputUrl.trim(),
        project_type: projectType,
        wallet_address: account.address.toString(),
        payment_tx_hash: currentHash,
        request_mode: "full",
        evidence_only: evidenceOnly
      });

      if (res.status === 'ok' || res.status === 'pre_check_ok') {
        setPreCheckData(res.preCheck);
        if ('report' in res) {
          setRiskReport(res.report);
          setJobId(res.jobId);
        }
        setHasPaid(!evidenceOnly || !!currentHash);
      }

    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Analysis failed';
      // User rejected is common
      if (typeof msg === 'string' && msg.includes('User rejected')) {
        setAuditError('Transaction cancelled.');
      } else {
        setAuditError(msg);
      }
    } finally {
      setIsAnalyzing(false);
      setIsUnlocking(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none opacity-20 z-0"></div>

      {/* Header */}
      <header className="w-full border-b border-neutral-800 bg-black/80 backdrop-blur-md z-50 sticky top-0">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo Container with visual crop for text */}
            <div className="w-10 h-10 relative overflow-hidden">
              <img
                src="logo.png"
                alt="Aptoseidon"
                className="w-full h-[140%] object-cover object-top absolute top-0 left-0 max-w-none"
                style={{ filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))' }}
              />
            </div>
            <h1 className="text-xl font-bold tracking-tighter">APTOSEIDON</h1>
          </div>

          <div className="flex items-center gap-4">
            {!connected || !account ? (
              <div className="flex gap-2">
                <Button onClick={() => handleConnect('Pontem')} variant="outline" className="text-xs px-3 py-1.5 hidden md:flex">Pontem</Button>
                <Button onClick={() => handleConnect('Martian')} variant="outline" className="text-xs px-3 py-1.5 hidden md:flex">Martian</Button>
                <Button onClick={() => handleConnect('Petra')} variant="primary" className="text-xs px-4">
                  <Wallet className="w-4 h-4" /> Connect
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 border border-neutral-800 rounded bg-neutral-900 cursor-pointer" onClick={handleDisconnect}>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs font-mono text-neutral-400">
                  {account.address.toString().slice(0, 6)}...{account.address.toString().slice(-4)}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-12 z-10">

        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-neutral-800 rounded-full mb-4 bg-neutral-900/50">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
            <span className="text-xs uppercase tracking-widest text-neutral-400">Security Suite v1.0</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Dive deep into <br />on-chain risks.</h2>
          <p className="text-neutral-400 max-w-lg mx-auto">
            Professional-grade due diligence for the Aptos ecosystem. Paste a contract address or name to generate an instant risk profile.
          </p>
        </div>

        {/* Input Form */}
        <div className="bg-black border border-neutral-800 p-1 mb-8 shadow-2xl shadow-neutral-900/50">
          <div className="flex flex-col md:flex-row gap-0 md:gap-1 bg-neutral-900/30 p-1">
            <select
              value={projectType}
              onChange={(e) => setProjectType(e.target.value as ProjectType)}
              className="bg-neutral-900 text-white text-sm px-4 py-3 outline-none border-b md:border-b-0 md:border-r border-neutral-800 md:w-48 appearance-none font-mono"
            >
              {Object.values(ProjectType).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <div className="flex-1 relative">
              <input
                type="text"
                placeholder={
                  projectType === ProjectType.COIN ? "Enter coin name (e.g. Solana)..." :
                    projectType === ProjectType.SMART_CONTRACT ? "Enter Aptos contract address (0x...)..." :
                      "Enter project name or URL..."
                }
                className="w-full h-full bg-neutral-900 text-white px-4 py-3 outline-none placeholder:text-neutral-600 font-mono text-sm"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
              />
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={!inputUrl || isAnalyzing}
              className="md:w-auto w-full rounded-none"
            >
              {isAnalyzing ? 'Scanning...' : (
                <>Analyze <ArrowRight size={16} /></>
              )}
            </Button>
          </div>

          {/* Item #8: Evidence Only Mode Toggle */}
          <div className="flex items-center gap-2 px-4 py-2 border-t border-neutral-800 bg-black/40">
            <input
              type="checkbox"
              id="evidence-only"
              checked={evidenceOnly}
              onChange={(e) => setEvidenceOnly(e.target.checked)}
              className="w-3 h-3 rounded bg-neutral-900 border-neutral-700"
            />
            <label htmlFor="evidence-only" className="text-[10px] font-mono text-neutral-500 uppercase cursor-pointer hover:text-neutral-300 transition-colors">
              Evidence Only Mode (No AI Opinions / Faster / Verifiable Only)
            </label>
          </div>
        </div>

        {/* Results Area */}
        {auditError && (
          <div className="mb-4 p-3 border border-red-900/50 bg-red-950/30 text-red-400 text-sm font-mono rounded">
            {auditError}
          </div>
        )}
        {preCheckData && (
          <ResultsSection
            preCheckData={preCheckData}
            report={riskReport}
            jobId={jobId}
            onUnlock={handleAnalyze}
            isUnlocking={isUnlocking}
            hasPaid={hasPaid}
            isEvidenceOnly={evidenceOnly}
          />
        )}

        {/* Empty State / Decor */}
        {!preCheckData && (
          <div className="border border-dashed border-neutral-800 p-8 text-center">
            <Terminal className="w-8 h-8 text-neutral-700 mx-auto mb-3" />
            <p className="text-neutral-600 text-sm font-mono">
              Waiting for input stream...
            </p>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-neutral-900 py-8 bg-black z-10">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-xs text-neutral-600">
          <p>© 2024 Aptoseidon Labs. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0 font-mono">
            <span>v1.0.0</span>
            <span>Status: <span className="text-green-900">Operational</span></span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;