// _app.js
// Next.js app wrapper with Solana wallet provider and global styles

import '../styles/globals.css';
import WalletConnectionProvider from '../components/WalletConnectionProvider';

/**
 * _app.js
 * Initialize app-wide providers and styles
 */
function MyApp({ Component, pageProps }) {
  return (
    <WalletConnectionProvider>
      <Component {...pageProps} />
    </WalletConnectionProvider>
  );
}

export default MyApp;
