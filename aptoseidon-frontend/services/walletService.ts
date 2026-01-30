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
    // Different wallets might return slightly different objects, but usually have address
    return response.address || (await provider.account()).address;
  } catch (error) {
    console.error("Wallet connection failed:", error);
    throw error;
  }
};

export const mockPaymentTransaction = async (walletName: WalletName, amount: number) => {
    const provider = getProvider(walletName);
    if (!provider) throw new Error("Wallet not connected");

    // In a real app, you would build a payload for the specific Move contract here.
    // example:
    // const payload = {
    //   type: "entry_function_payload",
    //   function: "0x1::coin::transfer",
    //   type_arguments: ["0x1::aptos_coin::AptosCoin"],
    //   arguments: ["RECEIVER_ADDRESS", amount * 100000000]
    // };
    // return await provider.signAndSubmitTransaction(payload);
    
    // Simulating network delay for hackathon demo
    return new Promise((resolve) => setTimeout(resolve, 1500));
}