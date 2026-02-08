// Next.js configuration for Civic Complaint Box
// Handles webpack config for Solana/Web3 compatibility

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };

    // Exclude problematic mobile wallet adapter dependencies (Windows path length issues)
    config.resolve.alias = {
      ...config.resolve.alias,
      '@solana-mobile/wallet-adapter-mobile': false,
      'react-native': false,
    };

    return config;
  },
  reactStrictMode: true,
  experimental: {
    esmExternals: 'loose',
  },
  transpilePackages: [
    '@solana/wallet-adapter-react',
    'antd',
    'rc-util',
    'rc-picker',
    '@ant-design/icons',
    '@ant-design/icons-svg',
    '@ant-design/cssinjs'
  ],
};

module.exports = nextConfig;
