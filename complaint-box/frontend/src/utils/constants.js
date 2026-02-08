// Constants for the Civic Complaint Box dApp
// Includes network, contract addresses, and IPFS configuration

import { clusterApiUrl } from '@solana/web3.js';

// Solana Network Configuration
export const SOLANA_NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';
export const SOLANA_RPC_ENDPOINT = process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || clusterApiUrl(SOLANA_NETWORK);

// Smart Contract Configuration
// TODO: Replace with your deployed program ID on Solana
export const COMPLAINT_PROGRAM_ID = process.env.NEXT_PUBLIC_COMPLAINT_PROGRAM_ID || '11111111111111111111111111111111';

// IPFS Configuration (using Pinata)
export const IPFS_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY || 'demo_key';
export const IPFS_API_SECRET = process.env.NEXT_PUBLIC_PINATA_API_SECRET || 'demo_secret';
export const IPFS_GATEWAY = process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/';

// Complaint Categories
export const COMPLAINT_CATEGORIES = [
  'infrastructure',
  'safety',
  'water_quality',
  'sanitation',
  'traffic',
  'noise_pollution',
  'other',
];

// Status Options
export const COMPLAINT_STATUS = ['pending', 'in_progress', 'resolved', 'rejected'];

// Admin Wallet (Replace with your actual admin address)
export const ADMIN_WALLET = process.env.NEXT_PUBLIC_ADMIN_WALLET || '11111111111111111111111111111111';

// Transaction confirmation timeout (in ms)
export const TX_CONFIRMATION_TIMEOUT = 30000;

// Pagination
export const ITEMS_PER_PAGE = 10;
