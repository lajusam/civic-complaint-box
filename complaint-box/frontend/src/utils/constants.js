// Constants for the Civic Complaint Box dApp
// Includes network, contract addresses, IPFS configuration, and RBAC

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

// ============= ROLE-BASED ACCESS CONTROL =============

// Admin Wallet Address — the single source of truth for admin authorization.
// This MUST match the ADMIN_PUBKEY constant in the smart contract (lib.rs).
// Only this wallet can: update complaint status, delete complaints, access admin dashboard.
// All other wallets are automatically treated as "user" role.
export const ADMIN_WALLET = process.env.NEXT_PUBLIC_ADMIN_WALLET || '4MMhsQ2odgEdAowV3Si6L44jRhTZAepuFjPeWGSgA3h2';

// Role constants
export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
};

/**
 * Determine the role of a wallet address.
 * Compares the wallet's public key string against the ADMIN_WALLET constant.
 * This is a frontend convenience — the real security is enforced on-chain.
 *
 * @param {string|null} walletAddress - The connected wallet's public key as a string
 * @returns {'admin'|'user'} The role of the wallet
 */
export const getWalletRole = (walletAddress) => {
  if (!walletAddress) return ROLES.USER;
  return walletAddress === ADMIN_WALLET ? ROLES.ADMIN : ROLES.USER;
};

/**
 * Check if a wallet address is the admin.
 * Shorthand for getWalletRole() === ROLES.ADMIN.
 *
 * @param {string|null} walletAddress - The connected wallet's public key as a string
 * @returns {boolean} True if the wallet is the admin
 */
export const isAdminWallet = (walletAddress) => {
  return getWalletRole(walletAddress) === ROLES.ADMIN;
};

// Transaction confirmation timeout (in ms)
export const TX_CONFIRMATION_TIMEOUT = 30000;

// Pagination
export const ITEMS_PER_PAGE = 10;
