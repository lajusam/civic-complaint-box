# Frontend Setup Guide

## Quick Start (Demo Mode - No Configuration Needed!)

```bash
cd complaint-box/frontend
npm install
npm run dev
```

Visit `http://localhost:3000` - Everything works with mock data!

---

## Environment Configuration

### Demo/Development (Default)
Works out of the box with `.env.local` configured for demo mode.
- Mock IPFS uploads (returns fake hashes)
- Devnet Solana network
- Mock complaint data
- No API keys needed

### Production Setup
To use real Pinata IPFS and blockchain:

1. **Get Pinata API Keys:**
   - Sign up at https://www.pinata.cloud/
   - Create API key and secret
   - Update `.env.local`:
     ```env
     NEXT_PUBLIC_PINATA_API_KEY=your_key_here
     NEXT_PUBLIC_PINATA_API_SECRET=your_secret_here
     ```

2. **Deploy Smart Contract:**
   - Go to `complaint-box/programs/complaint-contract/`
   - Follow Anchor deployment guide
   - Get the program ID from `Anchor.toml`
   - Update `.env.local`:
     ```env
     NEXT_PUBLIC_COMPLAINT_PROGRAM_ID=your_program_id
     NEXT_PUBLIC_ADMIN_WALLET=your_wallet_address
     ```

3. **Restart dev server:**
   ```bash
   npm run dev
   ```

---

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Create production build
npm start        # Start production server
npm run lint     # Run ESLint
```

---

## Dependencies

### Core
- **React 18.2.0** - UI framework
- **Next.js 14.0.0** - React framework
- **Ant Design 5.22.2** - UI components
- **Tailwind CSS 3.3.0** - Styling

### Solana
- **@solana/web3.js** - Solana blockchain SDK
- **@solana/wallet-adapter-react** - Wallet integration
- **@solana/wallet-adapter-react-ui** - Wallet UI
- **@solana/wallet-adapter-phantom** - Phantom wallet support
- **@project-serum/anchor** - Anchor framework

### Utilities
- **axios** - HTTP requests
- **postcss** - CSS processing
- **autoprefixer** - CSS compatibility

---

## Troubleshooting

### Port 3000 Already in Use
```bash
# Use different port
npm run dev -- -p 3001
```

### Module Not Found Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

### Environment Variables Not Loading
- Restart dev server after changing `.env.local`
- Prefix new vars with `NEXT_PUBLIC_` for client-side access

### IPFS Upload Fails in Production
- Verify Pinata API keys in `.env.local`
- Check network connectivity to `api.pinata.cloud`
- Review browser console for specific error

---

## Project Structure

```
frontend/
├── src/
│   ├── components/        # React components
│   │   ├── Header.js
│   │   ├── ComplaintForm.js
│   │   ├── ComplaintCard.js
│   │   ├── ComplaintFilter.js
│   │   └── WalletConnectionProvider.js
│   ├── pages/             # Next.js pages
│   │   ├── _app.js
│   │   ├── _document.js
│   │   ├── index.js       # Home page
│   │   └── admin.js       # Admin dashboard
│   ├── utils/             # Helper functions
│   │   ├── constants.js   # Config & constants
│   │   ├── solana.js      # Blockchain utilities
│   │   ├── ipfs.js        # IPFS utilities
│   ├── styles/            # CSS
│   │   ├── globals.css
│   │   └── antd.css
│   └── contracts/         # Contract IDL
│       └── idl.js
├── public/                # Static assets
├── .env.local            # Environment variables (local)
├── .env.example          # Environment template
├── next.config.js        # Next.js config
├── tailwind.config.js    # Tailwind config
├── postcss.config.js     # PostCSS config
└── package.json          # Dependencies
```

---

## Next Steps

1. ✅ Install & run dev server
2. 🔗 Connect Phantom wallet (testnet)
3. 📝 Create test complaint
4. 🎯 Integrate smart contract (see FIXED_ISSUES.md)
5. 🚀 Deploy to production

---

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Solana Docs](https://docs.solana.com/)
- [Anchor Framework](https://www.anchor-lang.com/)
- [Ant Design](https://ant.design/)
- [Pinata IPFS](https://www.pinata.cloud/)

