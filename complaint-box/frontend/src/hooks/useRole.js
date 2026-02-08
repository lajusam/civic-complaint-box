// useRole — React hook for Role-Based Access Control (RBAC)
//
// Determines the connected wallet's role by comparing its public key
// against the ADMIN_WALLET constant.
//
// IMPORTANT: This hook is a frontend convenience for UI rendering.
// The real security is enforced ON-CHAIN in the smart contract.
// Even if someone modifies the frontend to show admin controls,
// the Solana program will reject unauthorized transactions with
// the CustomError::UnauthorizedAdmin error.
//
// Usage:
//   const { role, isAdmin, isUser, walletAddress } = useRole();
//   if (isAdmin) { /* show admin controls */ }

import { useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { ADMIN_WALLET, ROLES, getWalletRole, isAdminWallet } from '../utils/constants';

/**
 * Hook that returns the current wallet's role and helper booleans.
 *
 * @returns {{
 *   role: 'admin' | 'user',
 *   isAdmin: boolean,
 *   isUser: boolean,
 *   isConnected: boolean,
 *   walletAddress: string | null,
 *   adminWallet: string
 * }}
 */
export const useRole = () => {
  const { publicKey, connected } = useWallet();

  const walletAddress = useMemo(
    () => (publicKey ? publicKey.toString() : null),
    [publicKey]
  );

  const role = useMemo(() => getWalletRole(walletAddress), [walletAddress]);
  const isAdmin = useMemo(() => isAdminWallet(walletAddress), [walletAddress]);

  return {
    /** Current role: 'admin' or 'user' */
    role,
    /** True if the connected wallet is the admin */
    isAdmin,
    /** True if the connected wallet is a regular user (not admin) */
    isUser: !isAdmin,
    /** True if any wallet is connected */
    isConnected: connected && !!publicKey,
    /** The connected wallet's public key as a string, or null */
    walletAddress,
    /** The admin wallet address for display purposes */
    adminWallet: ADMIN_WALLET,
  };
};

export default useRole;
