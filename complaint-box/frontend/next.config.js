// Next.js configuration for Civic Complaint Box
// Handles webpack config for Solana/Web3 compatibility

const webpack = require('webpack');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // NOTE: `output: 'export'` removed — Vercel needs SSR mode to support API routes.
  // If you need static export for Firebase Hosting, re-add it and deploy the
  // Express backend separately.

  // Enable SWC minification for faster builds
  swcMinify: true,

  // Skip ESLint during build (already handled separately)
  eslint: {
    ignoreDuringBuilds: true,
    dirs: ['src'],
  },

  // Skip TypeScript type checking (project is pure JS, no .ts files)
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Image optimization
  images: {
    unoptimized: true,
  },

  // Performance optimizations
  productionBrowserSourceMaps: false,
  compress: true,

  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Browser polyfills for Solana / Web3 packages
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer'),
        process: require.resolve('process/browser'),
      };

      // Inject Buffer and process globally so @solana/web3.js works in the browser
      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser',
        })
      );
    }

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
    esmExternals: false,
    // Enable optimized package imports
    optimizePackageImports: [
      'antd',
      '@ant-design/icons',
    ],
  },
  
  transpilePackages: [
    '@solana/wallet-adapter-react',
    'antd',
    '@ant-design/icons',
    '@ant-design/icons-svg',
    '@ant-design/cssinjs',
    'rc-cascader',
    'rc-checkbox',
    'rc-collapse',
    'rc-dialog',
    'rc-drawer',
    'rc-dropdown',
    'rc-field-form',
    'rc-image',
    'rc-input',
    'rc-input-number',
    'rc-mentions',
    'rc-menu',
    'rc-motion',
    'rc-notification',
    'rc-overflow',
    'rc-pagination',
    'rc-picker',
    'rc-progress',
    'rc-rate',
    'rc-resize-observer',
    'rc-segmented',
    'rc-select',
    'rc-slider',
    'rc-steps',
    'rc-switch',
    'rc-table',
    'rc-tabs',
    'rc-textarea',
    'rc-tooltip',
    'rc-tree',
    'rc-tree-select',
    'rc-upload',
    'rc-util',
    'rc-virtual-list',
  ],
};

module.exports = nextConfig;
