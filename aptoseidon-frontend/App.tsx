import React, { useState, useEffect } from 'react';
import { ProjectType, PreCheckData, RiskReport } from './types';
import { connectWallet, mockPaymentTransaction, WalletName } from './services/walletService';
import { generateRiskReport } from './services/geminiService';
import { Button } from './components/Button';
import { ResultsSection } from './components/ResultsSection';
import { Terminal, Search, Wallet, ArrowRight } from 'lucide-react';

const App: React.FC = () => {
  // State
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<WalletName | null>(null);
  
  const [projectType, setProjectType] = useState<ProjectType>(ProjectType.TOKEN);
  const [inputUrl, setInputUrl] = useState('');
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [preCheckData, setPreCheckData] = useState<PreCheckData | null>(null);
  
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [riskReport, setRiskReport] = useState<RiskReport | null>(null);

  // Handlers
  const handleConnect = async (name: WalletName) => {
    try {
      const address = await connectWallet(name);
      if (address) {
        setWalletAddress(address);
        setSelectedWallet(name);
      }
    } catch (e) {
      alert("Failed to connect wallet. Please ensure extension is installed.");
    }
  };

  const handlePreCheck = () => {
    if (!inputUrl) return;
    setIsAnalyzing(true);
    
    // Simulate API fetch delay
    setTimeout(() => {
      setPreCheckData({
        age: "24 Days",
        liquidity: "$12,450 (Low)",
        socialMentions: "Low Activity",
        contractVerified: false
      });
      setIsAnalyzing(false);
    }, 1200);
  };

  const handleUnlock = async () => {
    if (!walletAddress || !selectedWallet) {
      alert("Please connect your wallet first.");
      return;
    }

    setIsUnlocking(true);
    try {
      // 1. Process Payment
      await mockPaymentTransaction(selectedWallet, 0.01);
      setHasPaid(true);

      // 2. Generate AI Report
      // In a real app, this would happen on the backend after verifying the txn hash
      const report = await generateRiskReport(projectType, inputUrl);
      setRiskReport(report);
    } catch (e) {
      console.error(e);
      alert("Transaction failed or cancelled.");
    } finally {
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
            {!walletAddress ? (
              <div className="flex gap-2">
                <Button onClick={() => handleConnect('Pontem')} variant="outline" className="text-xs px-3 py-1.5 hidden md:flex">Pontem</Button>
                <Button onClick={() => handleConnect('Martian')} variant="outline" className="text-xs px-3 py-1.5 hidden md:flex">Martian</Button>
                <Button onClick={() => handleConnect('Petra')} variant="primary" className="text-xs px-4">
                  <Wallet className="w-4 h-4" /> Connect
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 border border-neutral-800 rounded bg-neutral-900">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs font-mono text-neutral-400">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
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
            <span className="text-xs uppercase tracking-widest text-neutral-400">Hackathon Build v0.1</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Dive deep into <br/>on-chain risks.</h2>
          <p className="text-neutral-400 max-w-lg mx-auto">
            AI-powered due diligence for the Aptos ecosystem. Paste a contract address or URL to generate an instant risk profile.
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
                placeholder="Paste URL, Contract Address, or Project Name..."
                className="w-full h-full bg-neutral-900 text-white px-4 py-3 outline-none placeholder:text-neutral-600 font-mono text-sm"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
              />
            </div>
            
            <Button 
              onClick={handlePreCheck} 
              disabled={!inputUrl || isAnalyzing}
              className="md:w-auto w-full rounded-none"
            >
              {isAnalyzing ? 'Scanning...' : (
                <>Analyze <ArrowRight size={16}/></>
              )}
            </Button>
          </div>
        </div>

        {/* Results Area */}
        {preCheckData && (
          <ResultsSection 
            preCheckData={preCheckData}
            report={riskReport}
            onUnlock={handleUnlock}
            isUnlocking={isUnlocking}
            hasPaid={hasPaid}
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
          <p>© 2024 Aptoseidon Labs. Built for the Hackathon.</p>
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