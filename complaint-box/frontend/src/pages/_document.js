import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#DC143C" />
        <meta name="description" content="Decentralized Civic Complaint Box — File and track community complaints on Solana" />
        {/* Inter font — professional, clean, modern */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body className="antialiased">
        {/*
          Inline polyfill script that runs BEFORE React bundles.
          Ensures global.Buffer, process, and crypto.getRandomValues exist
          on mobile browsers and older WebViews where they are missing.
          Without this, @solana/web3.js crashes with "Buffer is not defined"
          or "crypto.getRandomValues is not a function" on many phones.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (typeof globalThis !== 'undefined' && !globalThis.process) {
                  globalThis.process = { env: {}, browser: true, version: '' };
                }
                // Preserve native crypto.getRandomValues — crypto-browserify
                // does NOT implement it, so if the webpack polyfill overwrites
                // window.crypto, Solana web3.js crashes on mobile.
                if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
                  window.__nativeCryptoGetRandomValues = window.crypto.getRandomValues.bind(window.crypto);
                }
              } catch(e) {}
            `,
          }}
        />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
