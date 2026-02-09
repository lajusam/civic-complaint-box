// WalletConnectionProvider Component
// Wraps the app with Solana wallet functionality using Phantom wallet
// Detects mobile browsers without wallet extensions and shows a friendly fallback

import React, { useMemo, useState, useEffect } from 'react';
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
 * Detect whether we are on a mobile device.
 * Uses User-Agent + touch capability + screen size heuristics.
 */
function getIsMobile() {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const mobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const smallScreen = window.innerWidth <= 768;
  return mobileUA || (hasTouch && smallScreen);
}

/**
 * Detect whether the Phantom wallet extension / in-app browser is present.
 * On desktop Phantom injects window.solana / window.phantom.solana.
 * On mobile, Phantom's in-app browser also injects it.
 * Regular mobile browsers (Chrome, Safari) will NOT have it.
 */
function getHasWalletExtension() {
  if (typeof window === 'undefined') return false;
  return !!(
    window.phantom?.solana?.isPhantom ||
    window.solana?.isPhantom ||
    window.solflare
  );
}

/**
 * MobileWalletBanner
 * Shown on mobile when no wallet extension is detected.
 * Explains that the user can still browse complaints but needs
 * Phantom's mobile app to connect a wallet.
 */
const MobileWalletBanner = () => (
  <div
    style={{
      background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
      border: '1px solid #fbbf24',
      borderRadius: 12,
      padding: '14px 18px',
      margin: '12px 16px',
      display: 'flex',
      gap: 12,
      alignItems: 'flex-start',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    }}
  >
    <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0 }}>📱</span>
    <div style={{ flex: 1 }}>
      <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 600, color: '#92400e' }}>
        Mobile Browser Detected
      </p>
      <p style={{ margin: '0 0 8px', fontSize: 12, lineHeight: 1.5, color: '#a16207' }}>
        You can browse all complaints without a wallet. To submit or upvote,
        open this site inside the{' '}
        <strong>Phantom</strong> app&#39;s built-in browser.
      </p>
      <a
        href="https://phantom.app/download"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-block',
          fontSize: 12,
          fontWeight: 600,
          color: '#7c3aed',
          textDecoration: 'none',
        }}
      >
        Get Phantom App →
      </a>
    </div>
  </div>
);

/**
 * WalletConnectionProvider Component
 * Provides wallet connection context to all child components.
 *
 * On mobile WITHOUT the Phantom in-app browser:
 *   - Renders the Solana providers with an empty wallets array
 *     (so useWallet() hook still works — publicKey will be null)
 *   - Shows a friendly banner instead of crashing
 *   - autoConnect is disabled
 *
 * On desktop or inside Phantom mobile browser:
 *   - Full wallet functionality with autoConnect
 */
export const WalletConnectionProvider = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [hasExtension, setHasExtension] = useState(true); // optimistic default

  useEffect(() => {
    // Detect after mount so window is available
    setIsMobile(getIsMobile());
    setHasExtension(getHasWalletExtension());
  }, []);

  const showMobileBanner = isMobile && !hasExtension;

  // Memoize wallet adapters
  // On mobile without extension → empty array (no wallet adapter, no crash)
  // On desktop or Phantom in-app → PhantomWalletAdapter
  const wallets = useMemo(() => {
    if (typeof window === 'undefined') return [];
    if (showMobileBanner) return []; // No wallet extension on mobile
    try {
      return [new PhantomWalletAdapter()];
    } catch (err) {
      console.warn('Failed to initialize PhantomWalletAdapter:', err);
      return [];
    }
  }, [showMobileBanner]);

  // Wallet error handler — log but don't crash the app
  const onError = useMemo(
    () => (error) => {
      console.error('[WalletProvider] Error:', error);
    },
    []
  );

  return (
    <ConnectionProvider endpoint={SOLANA_RPC_ENDPOINT}>
      <WalletProvider
        wallets={wallets}
        autoConnect={!showMobileBanner}
        onError={onError}
      >
        <WalletModalProvider>
          {showMobileBanner && <MobileWalletBanner />}
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default WalletConnectionProvider;
