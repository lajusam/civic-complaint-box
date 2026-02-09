// Solana utility functions
// Handles wallet connections, transaction signing, and blockchain interactions

// Fix crypto.getRandomValues on mobile: crypto-browserify (the webpack polyfill)
// does NOT implement getRandomValues, so if it overwrites window.crypto,
// @solana/web3.js crashes. Restore the native implementation here.
if (typeof window !== 'undefined') {
  try {
    if (
      window.crypto &&
      !window.crypto.getRandomValues &&
      window.__nativeCryptoGetRandomValues
    ) {
      window.crypto.getRandomValues = window.__nativeCryptoGetRandomValues;
    }
  } catch (e) {
    console.warn('Could not restore crypto.getRandomValues:', e);
  }
}

import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { Program, AnchorProvider } from '@project-serum/anchor';
import { SOLANA_RPC_ENDPOINT, COMPLAINT_PROGRAM_ID, TX_CONFIRMATION_TIMEOUT } from './constants';

let connection = null;
let program = null;

/**
 * Initialize Solana connection
 * @returns {Connection} Solana RPC connection
 */
export const initializeConnection = () => {
  if (!connection) {
    connection = new Connection(SOLANA_RPC_ENDPOINT, 'processed');
  }
  return connection;
};

/**
 * Get program instance for contract interactions
 * @param {Object} wallet - Phantom wallet object
 * @param {string} programId - Contract program ID
 * @param {string} idl - Contract IDL (Interface Definition Language)
 * @returns {Program} Anchor program instance
 */
export const getProgram = (wallet, idl) => {
  if (!connection) {
    initializeConnection();
  }

  if (!wallet || !wallet.publicKey) {
    throw new Error('Wallet not connected');
  }

  try {
    const provider = new AnchorProvider(connection, wallet, {
      commitment: 'processed',
    });
    const program = new Program(idl, COMPLAINT_PROGRAM_ID, provider);
    return program;
  } catch (error) {
    console.error('Error initializing program:', error);
    throw error;
  }
};

/**
 * Get wallet balance
 * @param {PublicKey} walletAddress - User's wallet address
 * @returns {Promise<number>} Balance in SOL
 */
export const getWalletBalance = async (walletAddress) => {
  try {
    const conn = initializeConnection();
    const lamports = await conn.getBalance(walletAddress);
    return lamports / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Error fetching balance:', error);
    return 0;
  }
};

/**
 * Check if transaction was confirmed
 * @param {string} txHash - Transaction signature
 * @returns {Promise<boolean>} True if confirmed
 */
export const confirmTransaction = async (txHash) => {
  try {
    const conn = initializeConnection();
    const startTime = Date.now();

    while (Date.now() - startTime < TX_CONFIRMATION_TIMEOUT) {
      const status = await conn.getSignatureStatus(txHash);
      if (status.value?.confirmationStatus === 'confirmed' || status.value?.confirmationStatus === 'finalized') {
        return true;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return false;
  } catch (error) {
    console.error('Error confirming transaction:', error);
    return false;
  }
};

/**
 * Get latest blockhash for transaction
 * @returns {Promise<string>} Blockhash
 */
export const getLatestBlockhash = async () => {
  try {
    const conn = initializeConnection();
    const { blockhash } = await conn.getLatestBlockhash('confirmed');
    return blockhash;
  } catch (error) {
    console.error('Error fetching blockhash:', error);
    throw error;
  }
};
