export enum ProjectType {
  COIN = 'Coin',
  SMART_CONTRACT = 'Smart Contract',
  ICO_IDO = 'ICO/IDO',
  NFT = 'NFT Collection'
}

export interface MarketData {
  coingecko_id: string;
  price_usd: number;
  market_cap: number;
  vol_24h: number;
  change_24h: number;
  symbol: string;
}

export interface FinancialAnalysis {
  structure_score: string; // Was trade_call
  reasoning: string;
  features: string[];
}

export interface RuleResult {
  rule_id: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  reason: string;
  source: string;
}

export interface RiskReport {
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  summary: string;
  investmentAdvice: string;
  auditDetails: string[];
  riskFlags: string[];
  positiveSignals: string[];
  marketData?: MarketData;
  financialAnalysis?: FinancialAnalysis;
  ruleResults?: RuleResult[];
  agentConflict?: { has_conflict: boolean; reason: string };
  narrative?: string;
}

export interface WalletProvider {
  connect: () => Promise<{ address: string; publicKey?: string }>;
  account: () => Promise<{ address: string }>;
  isConnected: () => Promise<boolean>;
  signAndSubmitTransaction: (transaction: any) => Promise<any>;
}

// Extend window interface to include wallet providers
declare global {
  interface Window {
    aptos?: WalletProvider; // Petra
    martian?: WalletProvider; // Martian
    pontem?: WalletProvider; // Pontem
  }
}

export interface PreCheckData {
  age: string;
  liquidity: string;
  socialMentions: string;
  contractVerified: boolean;
}