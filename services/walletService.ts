import { WalletProvider } from '../types';

export type WalletName = 'Petra' | 'Martian' | 'Pontem';

export const getProvider = (name: WalletName): WalletProvider | undefined => {
  if (name === 'Petra') return window.aptos;
  if (name === 'Martian') return window.martian;
  if (name === 'Pontem') return window.pontem;
  return undefined;
};

export const connectWallet = async (name: WalletName): Promise<string | null> => {
  const provider = getProvider(name);
  if (!provider) {
    window.open(`https://www.google.com/search?q=${name}+wallet+extension`, '_blank');
    throw new Error(`${name} wallet not found`);
  }

  try {
    const response = await provider.connect();

    // Network Check (Petra specific, others might vary)
    if (name === 'Petra' && (window.aptos as any).getNetwork) {
      const network = await (window.aptos as any).getNetwork();
      // Petra returns { chainId: string, name: string }
      // Testnet chainId is '2'
      if (network.chainId !== '2' && network.name.toLowerCase() !== 'testnet') {
        alert(`⚠️ Warning: You seem to be on ${network.name}. Please switch your Petra wallet to Aptos Testnet.`);
      }
    }

    // Different wallets might return slightly different objects, but usually have address
    return response.address || (await provider.account()).address;
  } catch (error) {
    console.error("Wallet connection failed:", error);
    throw error;
  }
};

// Amount is in APT (e.g. 0.01)
export const submitPayment = async (
  signAndSubmitTransaction: (transaction: any) => Promise<any>,
  recipient: string,
  amountApt: number
): Promise<string> => {
  const amountOctas = Math.floor(amountApt * 100_000_000).toString();

  // Payload for AptosCoin transfer
  // Payload for AptosCoin transfer (v2 Adapter Format)
  const payload = {
    data: {
      function: "0x1::coin::transfer",
      typeArguments: ["0x1::aptos_coin::AptosCoin"],
      functionArguments: [recipient, amountOctas]
    }
  };

  try {
    // Adapter handles connection internally
    const response = await signAndSubmitTransaction(payload);
    const hash = (typeof response === 'string') ? response : response.hash;

    console.log("Payment tx submitted:", hash);
    return hash;
  } catch (e) {
    console.error("Payment failed", e);
    throw new Error("Transaction rejected or failed.");
  }
}
