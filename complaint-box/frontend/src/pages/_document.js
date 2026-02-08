// _document.js
// Next.js document wrapper for HTML structure

import { Html, Head, Main, NextScript } from 'next/document';

/**
 * _document.js
 * Custom HTML document for Next.js
 */
export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#000000" />
        <meta name="description" content="Decentralized Civic Complaint Box on Solana" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
