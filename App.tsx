import React, { useState } from 'react';
import { ProjectType, PreCheckData, RiskReport } from './types';
import { submitPayment, WalletName } from './services/walletService';
import { postAudit, postReputationRate, getReputationRatings, PaymentRequiredError, fetchHistory, HistoryItem } from './services/api';
import { Button } from './components/Button';
import { ResultsSection } from './components/ResultsSection';
import { HistorySidebar } from './components/HistorySidebar';
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

  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Load history on connection
  React.useEffect(() => {
    if (connected && account?.address) {
      loadHistory(account.address.toString());
    } else {
      setHistory([]);
    }
  }, [connected, account?.address]);

  const loadHistory = async (address: string) => {
    setIsHistoryLoading(true);
    try {
      const res = await fetchHistory(address);
      if (res.status === 'ok') {
        setHistory(res.history);
      }
    } catch (e) {
      console.error("Failed to load history:", e);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  // Handlers
  const handleConnect = (name: WalletName) => {
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
        } catch (e) {
          if (e instanceof PaymentRequiredError) {
            console.log("402 Payment Required:", e.message);
            const txHash = await submitPayment(
              signAndSubmitTransaction,
              e.recipient,
              e.amount
            );
            currentHash = txHash;
          } else {
            throw e;
          }
        }
      }

      // 3. Request Analysis
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

        // Refresh history
        if (connected && account?.address) {
          loadHistory(account.address.toString());
        }
      }

    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Analysis failed';
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

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setPreCheckData(item.report.preCheck);
    setRiskReport(item.report.report);
    setJobId(item.job_id);
    setHasPaid(true);
    setIsHistoryOpen(false);

    // Smooth scroll to results
    setTimeout(() => {
      document.getElementById('results-view')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const getPlaceholder = () => {
    if (projectType === ProjectType.SMART_CONTRACT) return "https://explorer.aptoslabs.com/account/0x1...";
    return "https://coin-project-website.com";
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none opacity-20 z-0"></div>

      {/* Header */}
      <header className="w-full border-b border-neutral-800 bg-black/80 backdrop-blur-md z-50 sticky top-0">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 relative">
              <img
                src="/logo.png"
                alt="Aptoseidon"
                className="w-full h-full object-contain"
                style={{ filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.4))' }}
              />
            </div>
            <h1 className="text-xl font-bold tracking-tighter">APTOSEIDON</h1>
          </div>

          <div className="flex items-center gap-4">
            {!connected || !account ? (
              <Button onClick={() => handleConnect('Petra' as WalletName)} variant="outline" size="sm">
                Connect Wallet
              </Button>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end hidden md:flex">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase">Testnet Mode</span>
                  <span className="text-xs font-mono text-blue-400">
                    {account.address.toString().slice(0, 6)}...{account.address.toString().slice(-4)}
                  </span>
                </div>
                <button onClick={handleDisconnect} className="p-1 hover:text-red-500 transition-colors">
                  <Wallet size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero / Input Section */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-6 pt-16 pb-24 relative z-10">
        <div className="mb-12">
          <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter uppercase italic">
            Trust & Worthiness <br />
            <span className="text-blue-500">Intelligence v1.0</span>
          </h2>
          <p className="text-neutral-500 max-w-2xl text-lg font-medium leading-relaxed">
            Verify the true credibility of any Aptos project.
            Autonomous agentic forensics for Coins, NFTs, and Smart Contracts.
          </p>
        </div>

        {/* Input Card */}
        <div className="border border-neutral-800 bg-neutral-900/30 backdrop-blur-md mb-12">
          <div className="flex flex-col md:flex-row border-b border-neutral-800">
            {Object.values(ProjectType).map((t) => (
              <button
                key={t}
                onClick={() => setProjectType(t)}
                className={`px-6 py-4 text-xs font-mono uppercase tracking-widest transition-all ${projectType === t ? 'bg-blue-600 text-white' : 'text-neutral-500 hover:bg-neutral-800'
                  }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="p-1 flex flex-col md:flex-row items-center gap-1">
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder={getPlaceholder()}
              className="flex-1 bg-transparent border-none focus:ring-0 p-4 font-mono text-sm placeholder:text-neutral-700"
            />
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

        <div id="results-view">
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
        </div>

        {!preCheckData && (
          <div className="border border-dashed border-neutral-800 p-8 text-center">
            <Terminal className="w-8 h-8 text-neutral-700 mx-auto mb-3" />
            <p className="text-neutral-600 text-sm font-mono text-center w-full block">
              Waiting for input stream...
            </p>
          </div>
        )}
      </main>

      <footer className="w-full border-t border-neutral-900 py-8 bg-black z-10">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-xs text-neutral-600">
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-tighter">APTOSEIDON</span>
            <span className="font-mono border border-neutral-800 px-1 rounded">v1.0.0</span>
          </div>
          <p className="mt-4 md:mt-0 font-mono text-neutral-500 uppercase tracking-widest">
            Non-Investment Grade Assessment
          </p>
        </div>
      </footer>

      {/* History Sidebar */}
      <HistorySidebar
        history={history}
        isLoading={isHistoryLoading}
        isOpen={isHistoryOpen}
        onToggle={() => setIsHistoryOpen(!isHistoryOpen)}
        onSelect={handleSelectHistoryItem}
      />
    </div>
  );
};

export default App;