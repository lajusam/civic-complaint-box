# Project Setup Instructions

## Quick Start Guide for Civic Complaint Box

### Prerequisites Installation

#### 1. Install Node.js and npm
- Download from https://nodejs.org (LTS version recommended)
- Verify installation:
  ```bash
  node --version
  npm --version
  ```

#### 2. Install Rust and Anchor
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Add Rust to PATH
source $HOME/.cargo/env

# Install Anchor
npm install -g @project-serum/anchor-cli

# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/v1.17.0/install)"

# Add Solana to PATH
export PATH="/home/YOUR_USER/.local/share/solana/install/active_release/bin:$PATH"

# Verify installation
solana --version
anchor --version
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local with your values:
# - NEXT_PUBLIC_PINATA_API_KEY
# - NEXT_PUBLIC_PINATA_API_SECRET
# - NEXT_PUBLIC_COMPLAINT_PROGRAM_ID (after contract deployment)
# - NEXT_PUBLIC_ADMIN_WALLET

# Run development server
npm run dev

# Open http://localhost:3000
```

### Smart Contract Setup

```bash
cd programs/complaint-contract

# Build contract
anchor build

# View build output
ls target/deploy/

# Deploy to devnet
anchor deploy

# Save the Program ID from deployment output
# Update frontend/src/utils/constants.js with this ID
```

### Getting Devnet SOL

```bash
# Set to devnet
solana config set --url devnet

# Request airdrop (requires valid wallet)
solana airdrop 2
```

### Pinata Setup

1. Sign up at https://www.pinata.cloud
2. Go to API Keys section
3. Create new API key
4. Copy to .env.local:
   - NEXT_PUBLIC_PINATA_API_KEY
   - NEXT_PUBLIC_PINATA_API_SECRET

---

## Key File Descriptions

### Smart Contract (Rust)
- **lib.rs** - Main contract with three instructions:
  - `create_complaint` - Submit new complaint
  - `upvote_complaint` - Upvote existing complaint
  - `update_status` - Admin function to update status

### Frontend Components
- **WalletConnectionProvider.js** - Solana wallet setup (Phantom)
- **Header.js** - Navigation with wallet button
- **ComplaintForm.js** - Form to submit complaints
- **ComplaintCard.js** - Display individual complaint
- **ComplaintFilter.js** - Sidebar filters
- **index.js** - Main feed page
- **admin.js** - Admin dashboard

### Utilities
- **constants.js** - App configuration
- **solana.js** - Blockchain interactions
- **ipfs.js** - IPFS/Pinata operations

---

## Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Production build
npm run lint            # Run linter

# Solana
solana airdrop 2        # Get devnet SOL
solana config set --url devnet  # Switch to devnet
solana account [pubkey] # Check account
solana balance          # Check wallet balance

# Anchor
anchor build            # Build contract
anchor deploy           # Deploy contract
anchor test            # Run tests (if exists)
```

---

## Deployment Checklist

- [ ] Deploy contract to devnet/mainnet
- [ ] Update COMPLAINT_PROGRAM_ID
- [ ] Setup Pinata account and keys
- [ ] Update ADMIN_WALLET address
- [ ] Test on devnet first
- [ ] Build frontend: `npm run build`
- [ ] Deploy to Vercel/Netlify
- [ ] Test all features on production
