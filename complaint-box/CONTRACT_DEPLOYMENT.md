// Contract deployment and interaction guide
// This file explains how to deploy and interact with the smart contract

/**
 * SMART CONTRACT DEPLOYMENT GUIDE
 * 
 * Step 1: Build the contract
 * ============================
 * cd programs/complaint-contract
 * anchor build
 * 
 * Output: target/idl/complaint_contract.json (IDL file)
 *         target/deploy/complaint_contract.so (compiled binary)
 * 
 * Step 2: Configure Solana CLI
 * =============================
 * # Set to devnet for testing
 * solana config set --url devnet
 * 
 * # Set keypair (wallet)
 * solana config set --keypair ~/.config/solana/id.json
 * 
 * # Check balance
 * solana balance
 * 
 * # Get airdrop if needed
 * solana airdrop 2
 * 
 * Step 3: Deploy contract
 * =======================
 * anchor deploy
 * 
 * Output: Program deployed at: [PROGRAM_ID]
 * 
 * SAVE THIS PROGRAM ID! Use in frontend/src/utils/constants.js
 * 
 * Step 4: Update Frontend Configuration
 * =====================================
 * // frontend/src/utils/constants.js
 * export const COMPLAINT_PROGRAM_ID = '[PROGRAM_ID_FROM_DEPLOYMENT]';
 * 
 * Step 5: Verify Deployment
 * ==========================
 * solana program show [PROGRAM_ID]
 * solana program dump [PROGRAM_ID] program.so
 * 
 * MAINNET DEPLOYMENT
 * ==================
 * 1. Get mainnet SOL (costs money)
 * 2. solana config set --url mainnet-beta
 * 3. anchor deploy
 * 4. Update frontend environment
 * 5. Redeploy frontend
 * 
 * TESTING INSTRUCTIONS
 * == == == == == == == == == == ==
 * 
 * 1. Create complaint:
 *    - Connect wallet in frontend
 *    - Click "File New Complaint"
 *    - Fill details and upload images to IPFS
 *    - Submit (creates on-chain record)
 * 
 * 2. Verify complaint created:
 *    solana transaction-count [transaction_id]
 * 
 * 3. Upvote complaint:
 *    - Click heart icon
 *    - Verify upvote count increases
 *    - Try again (should fail - already voted)
 * 
 * 4. Admin update status:
 *    - Navigate to /admin
 *    - Select new status
 *    - Submit (admin wallet only)
 * 
 * DEBUGGING COMMANDS
 * == == == == == == == == == == ==
 * 
 * # View recent transactions
 * solana confirm -v [tx_signature]
 * 
 * # View account data
 * solana account [complaint_pda_address]
 * 
 * # View program logs
 * solana logs [PROGRAM_ID]
 * 
 * # Check program size
 * solana program show [PROGRAM_ID]
 * 
 * COMMON DEPLOYMENT ISSUES
 * == == == == == == == == == == == == ==
 * 
 * Issue: "Account does not exist"
 * Solution: Ensure wallet has SOL, use airdrop
 * 
 * Issue: "Program not found"
 * Solution: Correct program ID, check correct network
 * 
 * Issue: "Insufficient lamports"
 * Solution: Deploy fee too high, split contract or get more SOL
 * 
 * Issue: "Invalid IDL"
 * Solution: Rebuild contract, check syntax errors
 * 
 * UPDATING THE IDL IN FRONTEND
 * == == == == == == == == == == == == == ==
 * 
 * After deploying contract:
 * 
 * 1. Copy generated IDL:
 *    cp target/idl/complaint_contract.json frontend/src/contracts/idl.json
 * 
 * 2. Update COMPLAINT_IDL in frontend/src/contracts/idl.js:
 *    - Match structure with generated IDL
 *    - Update accounts, instructions, events
 *    - Ensure all fields match exactly
 * 
 * 3. Test in frontend:
 *    - Connect wallet
 *    - Call program methods
 *    - Watch for errors in console
 * 
 * PRODUCTION CHECKLIST
 * == == == == == == == == == == == == ==
 * 
 * Contract:
 * ☐ Audit smart contract code
 * ☐ Test all instructions thoroughly
 * ☐ Deploy to mainnet
 * ☐ Save program ID and keypairs safely
 * 
 * Frontend:
 * ☐ Update NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
 * ☐ Update NEXT_PUBLIC_COMPLAINT_PROGRAM_ID
 * ☐ Remove console.log statements
 * ☐ Build: npm run build
 * ☐ Test production build locally
 * ☐ Deploy to Vercel/Netlify
 * 
 * Security:
 * ☐ Don't commit .env.local
 * ☐ Verify admin wallet
 * ☐ Test authorization checks
 * ☐ Monitor transaction logs
 * 
 */

// Example: Calling contract from frontend
/*
import { Program } from '@project-serum/anchor';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { getProgram } from '../utils/solana';
import { COMPLAINT_IDL } from './idl';

// In your component:
const createComplaintOnChain = async (ipfsHash, category, location) => {
  try {
    const program = getProgram(wallet, COMPLAINT_IDL);
    
    // Generate PDA (Program Derived Address) for complaint account
    const [complaintPDA] = await PublicKey.findProgramAddress(
      [Buffer.from('complaint'), wallet.publicKey.toBuffer()],
      program.programId
    );
    
    // Execute transaction
    const tx = await program.methods
      .createComplaint(ipfsHash, category, location)
      .accounts({
        complaint: complaintPDA,
        author: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    
    console.log('Transaction:', tx);
    return tx;
  } catch (error) {
    console.error('Contract error:', error);
    throw error;
  }
};
*/
