// Next.js configuration for Civic Complaint Box
// Handles webpack config for Solana/Web3 compatibility

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export for Firebase Hosting
  output: 'export',

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
  
  // Image optimization — must be unoptimized for static export
  images: {
    unoptimized: true,
  },

  // Performance optimizations
  productionBrowserSourceMaps: false,
  compress: true,

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
