# Civic Complaint Box - Decentralized Complaint Management on Solana

## 🌐 Overview

**Civic Complaint Box** is a decentralized, blockchain-based complaint management system built on Solana. It enables citizens to file complaints about civic issues (infrastructure, safety, water quality, etc.), with full transparency, immutability, and community engagement through upvoting and status tracking.

### Key Features:
✅ **File Complaints** - Submit detailed complaints with images  
✅ **IPFS Storage** - Full complaint text and images stored on IPFS  
✅ **On-Chain Metadata** - Complaint metadata stored on Solana blockchain  
✅ **Community Upvoting** - One vote per wallet per complaint  
✅ **Admin Status Updates** - Admins can update complaint resolution status  
✅ **Public Feed** - View all complaints with filtering by category/location/status  
✅ **Phantom Wallet Integration** - Secure wallet authentication  

---

## 🏗️ Project Structure

```
complaint-box/
├── programs/
│   └── complaint-contract/          # Solana Smart Contract (Rust)
│       ├── Cargo.toml
│       └── src/
│           └── lib.rs               # Main contract logic
│
├── frontend/                         # Next.js React Application
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── components/              # Reusable React components
│   │   │   ├── WalletConnectionProvider.js   # Wallet setup
│   │   │   ├── Header.js            # Navigation header
│   │   │   ├── ComplaintForm.js     # Form to submit complaints
│   │   │   ├── ComplaintCard.js     # Single complaint display
│   │   │   └── ComplaintFilter.js   # Filter sidebar
│   │   │
│   │   ├── pages/                   # Next.js pages
│   │   │   ├── _app.js              # App wrapper
│   │   │   ├── _document.js         # HTML document
│   │   │   └── index.js             # Home page
│   │   │
│   │   ├── utils/                   # Utility functions
│   │   │   ├── constants.js         # App constants
│   │   │   ├── solana.js            # Solana interactions
│   │   │   └── ipfs.js              # IPFS operations
│   │   │
│   │   ├── contracts/               # Contract interfaces
│   │   │   └── idl.js               # Anchor IDL
│   │   │
│   │   └── styles/                  # CSS styles
│   │       └── globals.css          # Global styles
│   │
│   ├── package.json                 # Dependencies
│   ├── next.config.js               # Next.js config
│   ├── tailwind.config.js           # Tailwind CSS config
│   ├── postcss.config.js            # PostCSS config
│   └── .env.example                 # Environment variables template
│
└── README.md                         # This file
```

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with SSR support
- **React 18** - UI library
- **Tailwind CSS** - Utility-based styling
- **Ant Design** - UI component library
- **@solana/web3.js** - Solana blockchain interaction
- **@solana/wallet-adapter-react** - Wallet integration
- **Anchor** - Solana framework client

### Backend
- **Solana** - Blockchain (devnet for testing)
- **Anchor Framework** - Smart contract development (Rust)
- **IPFS/Pinata** - Decentralized file storage

---

## 📋 Prerequisites

Before you begin, ensure you have installed:

1. **Node.js** (v16 or higher) - [Download](https://nodejs.org)
2. **npm** or **yarn** - Package manager
3. **Rust & Cargo** - For smart contract development
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```
4. **Anchor CLI** - Solana framework
   `
   ``bash
   npm install -g @project-serum/anchor-cli
   ```
5. **Solana CLI** - Command-line tools
   ```bash
   sh -c "$(curl -sSfL https://release.solana.com/v1.17.0/install)"
   ```
6. **Phantom Wallet** - Browser extension for Solana
7. **Pinata Account** - For IPFS storage ([Sign up](https://www.pinata.cloud))

---

## 🚀 Getting Started

### 1. Clone or Extract Project

```bash
cd complaint-box
```

### 2. Setup Smart Contract

```bash
cd programs/complaint-contract

# Build the smart contract
anchor build

# Deploy to devnet (requires devnet SOL)
anchor deploy
```

After deployment, you'll get a `Program ID`. Save this!

### 3. Update Contract Configuration

Edit `frontend/src/utils/constants.js`:

```javascript
export const COMPLAINT_PROGRAM_ID = 'YOUR_DEPLOYED_PROGRAM_ID';
export const ADMIN_WALLET = 'YOUR_ADMIN_WALLET_ADDRESS';
```

Also update `.env.local`:

```javascript
NEXT_PUBLIC_COMPLAINT_PROGRAM_ID=YOUR_PROGRAM_ID_HERE
NEXT_PUBLIC_ADMIN_WALLET=YOUR_ADMIN_WALLET_ADDRESS
```

### 4. Setup Pinata (IPFS)

1. Sign up at [pinata.cloud](https://www.pinata.cloud)
2. Generate API keys in your dashboard
3. Add to `.env.local`:

```bash
NEXT_PUBLIC_PINATA_API_KEY=your_api_key
NEXT_PUBLIC_PINATA_API_SECRET=your_api_secret
```

### 5. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 6. Create Environment Configuration

```bash
cp .env.example .env.local
# Edit .env.local with your values
```

### 7. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 💰 Getting Devnet SOL

To test on Solana devnet, you need free SOL:

```bash
solana config set --url devnet
solana airdrop 2  # Request 2 SOL
```

Or use the [Solana Faucet](https://faucet.solana.com/)

---

## 📱 Usage Guide

### Filing a Complaint

1. **Connect Wallet** - Click "Connect Wallet" button and approve Phantom popup
2. **Click "File New Complaint"** - Opens the complaint form
3. **Fill Details**:
   - Title: Brief summary
   - Description: Detailed explanation
   - Category: Select from dropdown
   - Location: Specific location/area
   - Images: Optional. Upload evidence photos
4. **Submit** - Complaint stored on IPFS + metadata on Solana blockchain

### Viewing Complaints

1. **Feed** - Main page shows all complaints
2. **Filters** - Use sidebar to filter by:
   - Category (Infrastructure, Safety, etc.)
   - Status (Pending, In Progress, Resolved)
   - Location search
3. **Upvote** - Click heart icon to upvote (one per wallet)
4. **Details** - View author, date, images linked from IPFS

### Admin Functions

If you're the admin wallet:
- **Update Status** - Change complaint status on any complaint
- **Statuses**: Pending → In Progress → Resolved/Rejected

---

## 🔐 Security & Architecture

### Data Flow

```
User Files Complaint
       ↓
Complaint Text + Images → IPFS (get hash)
       ↓
Metadata (hash, category, location) → Solana Blockchain
       ↓
Update Smart Contract State (on-chain)
       ↓
Store Voter Addresses (prevent double voting)
```

### Key Security Features

✅ **Wallet-based Authentication** - Only Solana wallets can interact  
✅ **Double Vote Prevention** - Voter addresses stored on-chain  
✅ **Admin Authorization** - Only authorized wallet can update status  
✅ **Immutable Records** - Complaint hashes cannot be altered  
✅ **IPFS Persistence** - Data survives independently  

---

## 🧪 Testing

### Test on Devnet

```bash
# Build contract
cd programs/complaint-contract
anchor build

# View build artifacts
ls target/deploy/

# Deploy
anchor deploy

# Run tests (if tests/integration.ts exists)
anchor test
```

### Manual Testing Checklist

- [ ] Connect Phantom wallet
- [ ] View wallet balance
- [ ] File a complaint (check IPFS hash in console)
- [ ] See complaint appear in feed
- [ ] Filter by category/location
- [ ] Upvote a complaint (only once per wallet)
- [ ] Admin: Update complaint status

---

## 📦 Building for Production

### 1. Optimize Building

```bash
cd frontend
npm run build
```

### 2. Deploy Mainnet Smart Contract

```bash
cd programs/complaint-contract

# Change cluster to mainnet
anchor cluster mainnet

# Ensure you have mainnet SOL for deployment fees
anchor deploy
```

### 3. Frontend Deployment Options

#### Option A: Vercel (Recommended)

```bash
npm install -g vercel
vercel
# Follow the prompts
```

#### Option B: Netlify

```bash
npm run build
# Deploy the .next folder to Netlify
```

#### Option C: Traditional Server

```bash
npm run build
npm start
# Runs on port 3000
```

### 4. Update Environment Variables

Set production values in your hosting platform:
- `NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta`
- `NEXT_PUBLIC_COMPLAINT_PROGRAM_ID=<mainnet_program_id>`
- `NEXT_PUBLIC_PINATA_API_KEY=<your_key>`

---

## 🐛 Troubleshooting

### Issue: "Anchor not found"

```bash
npm install -g @project-serum/anchor-cli
```

### Issue: "Program not found"

Make sure you:
1. Deployed the contract (check target/idl/)
2. Updated `COMPLAINT_PROGRAM_ID` in `constants.js`
3. On correct network (devnet/mainnet)

### Issue: "Wallet not connecting"

- Use Phantom wallet (other wallets not configured yet)
- Ensure Phantom is installed as browser extension
- Refresh page and try again

### Issue: "IPFS upload fails"

- Check Pinata API credentials in `.env.local`
- Verify Pinata account is active
- Check file size (keep under 5MB)

### Issue: Transaction failed

- Ensure wallet has enough SOL for fees (~0.1 SOL)
- Check RPC endpoint is working
- Verify program ID is correct for network

---

## 📚 Smart Contract Functions

### `create_complaint(ipfs_hash, category, location)`

Creates a new complaint on-chain.

**Parameters:**
- `ipfs_hash` (String): Hash of complaint data on IPFS
- `category` (String): Complaint category
- `location` (String): Physical location

**Returns:** Complaint account, emits `ComplaintCreated` event

### `upvote_complaint()`

Upvotes a complaint (one per wallet).

**Checks:** Prevents double voting by wallet

**Returns:** Updated upvote count, emits `ComplaintUpvoted` event

### `update_status(new_status)`

Updates complaint status (admin only).

**Parameters:**
- `new_status` (String): New status value

**Checks:** Only admin wallet can call

**Returns:** Updated status, emits `StatusUpdated` event

---

## 🤝 API Reference

### Frontend Utilities

#### `solana.js`

```javascript
// Get Solana connection
const connection = initializeConnection();

// Get wallet balance
const balance = await getWalletBalance(walletAddress);

// Get program instance
const program = getProgram(wallet, idl);

// Confirm transaction
const confirmed = await confirmTransaction(txHash);
```

#### `ipfs.js`

```javascript
// Upload complaint to IPFS
const hash = await uploadComplaintToIPFS(complaintData);

// Get complaint from IPFS
const data = await getComplaintFromIPFS(ipfsHash);

// Upload image
const imageHash = await uploadImageToIPFS(imageFile);
```

---

## 📄 License

MIT License - Open source and free to use

---

## 🎓 Learning Resources

- [Solana Docs](https://docs.solana.com)
- [Anchor Framework](https://www.anchor-lang.com/)
- [Phantom Wallet](https://phantom.app)
- [IPFS Documentation](https://docs.ipfs.io)
- [Next.js](https://nextjs.org/docs)

---

## 💬 Support & Contribution

For issues, questions, or contributions:

1. Check existing GitHub issues
2. Create detailed bug reports with reproduction steps
3. Submit pull requests with improvements
4. Join community discussions

---

## 🚨 Important Notes

⚠️ **This is a beta application** - Use at your own risk  
⚠️ **Always test on devnet first** before mainnet deployment  
⚠️ **Keep private keys safe** - Never commit `.env.local`  
⚠️ **Verify contract before production** - Audit smart contracts  

---

**Happy complaining! 🎉** Let's build a more transparent and responsive civic system together.
