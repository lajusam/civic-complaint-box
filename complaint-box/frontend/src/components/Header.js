// Header Component
// Navigation bar with wallet connection button and branding

import React from 'react';
import { Layout, Button, Row, Col, Badge } from 'antd';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { getWalletBalance } from '../utils/solana';
import { useState, useEffect } from 'react';

/**
 * Header Component
 * Displays application header with logo, title, and wallet connection
 */
const Header = () => {
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState(0);

  // Fetch wallet balance when connected
  useEffect(() => {
    if (publicKey) {
      getWalletBalance(publicKey).then(setBalance);
      // Poll balance every 10 seconds
      const interval = setInterval(() => {
        getWalletBalance(publicKey).then(setBalance);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [publicKey]);

  return (
    <Layout.Header className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 flex items-center justify-between sticky top-0 z-50 shadow-lg">
      {/* Left: Logo and Title */}
      <Row align="middle" gutter={16}>
        <Col>
          <h1 className="text-2xl font-bold text-white m-0">
            🏛️ Civic Complaint Box
          </h1>
        </Col>
        <Col>
          <p className="text-gray-200 text-sm m-0">Decentralized Complaints on Solana</p>
        </Col>
      </Row>

      {/* Right: Wallet Connection and Balance */}
      <Row align="middle" gutter={16}>
        {publicKey && (
          <Col>
            <Badge
              count={`${balance.toFixed(2)} SOL`}
              style={{
                backgroundColor: '#52c41a',
                color: '#fff',
                fontSize: '12px',
                padding: '2px 8px',
              }}
            />
          </Col>
        )}
        <Col>
          <WalletMultiButton />
        </Col>
      </Row>
    </Layout.Header>
  );
};

export default Header;
