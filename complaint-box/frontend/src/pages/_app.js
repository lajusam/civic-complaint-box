import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ConfigProvider } from 'antd';
import '../styles/globals.css';
import { LanguageProvider } from '../context/LanguageContext';
import ErrorBoundary from '../components/ErrorBoundary';

// Ensure Buffer and process are globally available BEFORE any Solana code runs.
// Mobile browsers (especially WebViews) often lack these Node.js globals,
// causing @solana/web3.js to throw "Buffer is not defined" or similar crashes.
if (typeof window !== 'undefined') {
  try {
    if (typeof window.Buffer === 'undefined') {
      const { Buffer } = require('buffer');
      window.Buffer = Buffer;
    }
  } catch (e) {
    console.warn('Buffer polyfill failed:', e);
  }

  try {
    if (typeof window.process === 'undefined') {
      window.process = require('process/browser');
    }
  } catch (e) {
    console.warn('process polyfill failed:', e);
  }

  // Ensure TextEncoder/TextDecoder exist (missing on some older mobile WebViews)
  try {
    if (typeof window.TextEncoder === 'undefined') {
      const { TextEncoder, TextDecoder } = require('util');
      window.TextEncoder = TextEncoder;
      window.TextDecoder = TextDecoder;
    }
  } catch (e) {
    console.warn('TextEncoder polyfill failed:', e);
  }
}

// Dynamic import with SSR disabled — PhantomWalletAdapter and @solana packages
// access browser globals (window, crypto) which crash during server-side rendering.
const WalletConnectionProvider = dynamic(
  () => import('../components/WalletConnectionProvider'),
  { ssr: false }
);

const antdTheme = {
  token: {
    colorPrimary: '#DC143C',
    borderRadius: 8,
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
    colorBgContainer: '#ffffff',
    colorBorder: '#e5e7eb',
    controlHeight: 40,
    colorSuccess: '#059669',
    colorWarning: '#f59e0b',
    colorError: '#dc2626',
    colorInfo: '#003893',
  },
};

function MyApp({ Component, pageProps }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch flash
  if (!mounted) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc' }} />
    );
  }

  return (
    <ErrorBoundary>
      <ConfigProvider theme={antdTheme}>
        <WalletConnectionProvider>
          <LanguageProvider>
            <Component {...pageProps} />
          </LanguageProvider>
        </WalletConnectionProvider>
      </ConfigProvider>
    </ErrorBoundary>
  );
}

export default MyApp;
