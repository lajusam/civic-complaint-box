import { useState, useEffect } from 'react';
import { ConfigProvider } from 'antd';
import '../styles/globals.css';
import WalletConnectionProvider from '../components/WalletConnectionProvider';
import { LanguageProvider } from '../context/LanguageContext';

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
    <ConfigProvider theme={antdTheme}>
      <WalletConnectionProvider>
        <LanguageProvider>
          <Component {...pageProps} />
        </LanguageProvider>
      </WalletConnectionProvider>
    </ConfigProvider>
  );
}

export default MyApp;
