import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react';
import { PetraWallet } from 'petra-plugin-wallet-adapter';

const wallets = [new PetraWallet()];

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AptosWalletAdapterProvider plugins={wallets} autoConnect={true}>
      <App />
    </AptosWalletAdapterProvider>
  </React.StrictMode>
);