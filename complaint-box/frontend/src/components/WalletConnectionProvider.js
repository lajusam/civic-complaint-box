// WalletConnectionProvider Component
// Wraps the app with Solana wallet functionality using Phantom wallet

import React from 'react';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SOLANA_RPC_ENDPOINT } from '../utils/constants';

// Import Solana wallet styles
import '@solana/wallet-adapter-react-ui/styles.css';

/**
 * WalletConnectionProvider Component
 * Provides wallet connection context to all child components
 * Enables Phantom wallet integration for user transactions
 */
export const WalletConnectionProvider = ({ children }) => {
  // Configure wallet adapters (only Phantom for this iteration)
  const wallets = [new PhantomWalletAdapter()];

  return (
    <ConnectionProvider endpoint={SOLANA_RPC_ENDPOINT}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default WalletConnectionProvider;
