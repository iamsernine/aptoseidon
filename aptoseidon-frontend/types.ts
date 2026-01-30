export enum ProjectType {
  TOKEN = 'Token',
  SMART_CONTRACT = 'Smart Contract',
  ICO_IDO = 'ICO/IDO',
  NFT = 'NFT Collection'
}

export interface RiskReport {
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  summary: string;
  investmentAdvice: string;
  auditDetails: string[];
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