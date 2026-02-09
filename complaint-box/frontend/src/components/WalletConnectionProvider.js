// WalletConnectionProvider Component
// Wraps the app with Solana wallet functionality using Phantom wallet

import React, { useMemo } from 'react';
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
 *
 * IMPORTANT: The `wallets` array MUST be memoized, otherwise
 * WalletProvider re-initializes on every parent re-render,
 * causing connection drops, infinite loops, and crashes on mobile.
 */
export const WalletConnectionProvider = ({ children }) => {
  // Memoize wallet adapters — creating new instances on every render
  // causes WalletProvider to re-initialize and crash, especially on mobile
  const wallets = useMemo(() => {
    try {
      return [new PhantomWalletAdapter()];
    } catch (err) {
      console.warn('Failed to initialize PhantomWalletAdapter:', err);
      return [];
    }
  }, []);

  // Wallet error handler — log but don't crash the app
  const onError = useMemo(
    () => (error) => {
      console.error('[WalletProvider] Error:', error);
    },
    []
  );

  return (
    <ConnectionProvider endpoint={SOLANA_RPC_ENDPOINT}>
      <WalletProvider wallets={wallets} autoConnect onError={onError}>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default WalletConnectionProvider;
