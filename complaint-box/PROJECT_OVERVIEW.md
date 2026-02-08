# Civic Complaint Box - Decentralized Complaint Management

## 🌍 Project Overview

A blockchain-based complaint management system where citizens can file civic complaints, vote on issues, and track resolution status transparently.

## ⚡ Key Features

✅ **Decentralized** - Built on Solana blockchain  
✅ **IPFS Storage** - Complaint data stored on IPFS  
✅ **Vote System** - One wallet = one vote per complaint  
✅ **Admin Controls** - Real-time status updates  
✅ **Phantom Integration** - Easy wallet connection  
✅ **Public Feed** - Transparent complaint tracking  

## 📂 Project Structure

```
complaint-box/
├── programs/complaint-contract/    # Smart contract (Rust)
├── frontend/                       # Next.js React app
├── README.md                       # Full documentation
└── SETUP.md                        # Installation guide
```

## 🚀 Quick Start

### 1. Setup Environment
```bash
# Install prerequisites
# - Node.js v16+
# - Rust & Cargo
# - Solana CLI
# - Anchor CLI
# See SETUP.md for details
```

### 2. Deploy Contract
```bash
cd programs/complaint-contract
anchor build
anchor deploy  # For devnet
```

### 3. Setup Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your values
npm run dev
```

### 4. Access Application
Open http://localhost:3000 in your browser

## 🔗 Tech Stack

- **Blockchain**: Solana (devnet/mainnet)
- **Smart Contract**: Rust + Anchor Framework
- **Frontend**: Next.js + React 18
- **Styling**: Tailwind CSS + Ant Design
- **Wallet**: Phantom Wallet
- **Storage**: IPFS (Pinata)
- **Web3**: @solana/web3.js + Anchor Client

## 📋 Core Functionality

### User Features
- 📝 **File Complaints** - Submit with text/images
- 👍 **Upvote** - Support important issues
- 🔍 **Search & Filter** - By category/location/status
- 📊 **Public Feed** - View all complaints

### Admin Features
- 🔧 **Update Status** - Mark as pending/in-progress/resolved
- 📈 **View Analytics** - Complaint statistics
- 🛡️ **Access Control** - Admin-only operations

## 💰 Costs & Requirements

- **Solana Devnet SOL**: Free (use airdrop)
- **Pinata Account**: Free tier available
- **Phantom Wallet**: Free browser extension
- **Hosting**: Free (Vercel/Netlify)

## 🔐 Security

- ✅ Wallet-based authentication
- ✅ On-chain voter tracking (prevent double voting)
- ✅ Admin authorization checks
- ✅ Immutable complaint records
- ✅ Distributed storage (IPFS)

## 📚 Documentation

- **Full Setup Guide**: [SETUP.md](SETUP.md)
- **Detailed README**: [README.md](README.md)
- **API Reference**: See README.md
- **Smart Contract**: [lib.rs](programs/complaint-contract/src/lib.rs)

## 🧪 Testing

```bash
# Deploy to devnet
solana config set --url devnet
solana airdrop 2  # Get free SOL

# Build and deploy
cd programs/complaint-contract
anchor build
anchor deploy
```

## 🚢 Deployment

### Mainnet Deployment
1. Get mainnet SOL
2. Update network to mainnet-beta
3. Redeploy contract
4. Update frontend env variables
5. Deploy frontend (Vercel/Netlify)

### Frontend Hosting
- **Vercel**: `vercel` command
- **Netlify**: Drag and drop build folder
- **Traditional**: `npm run build && npm start`

## 🐛 Support

For issues:
- Check [SETUP.md](SETUP.md) troubleshooting section
- Review smart contract for errors
- Verify Pinata API credentials
- Ensure correct program ID

## 📄 License

MIT - Open source and free to use

## 🎯 Next Steps

1. Read [SETUP.md](SETUP.md) for installation
2. Deploy contract to devnet
3. Configure environment variables
4. Start frontend development server
5. Test all features
6. Deploy to production

---

**Building transparent civic systems on blockchain! 🏛️**
