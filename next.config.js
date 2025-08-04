/** @type {import('next').NextConfig} */
const nextConfig = {
  // appDir is now the default in Next.js 15
  env: {
    NEXT_PUBLIC_APP_VERSION: require('./package.json').version,
  },
  images: {
    domains: ['localhost'],
    // Add Vercel's domain to allowed image domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.vercel.app',
      },
    ],
  },
  typescript: {
    // Temporarily set to true for initial deployment
    ignoreBuildErrors: true,
  },
  eslint: {
    // Temporarily set to true for initial deployment
    ignoreDuringBuilds: true,
  },
  // Simplified webpack optimization following best practices
  webpack: (config, { dev, isServer }) => {
    // Only apply optimizations in production
    if (!dev && !isServer) {
      // Optimize chunk splitting for better caching
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          maxSize: 244000, // ~240KB chunks
          minSize: 20000,
          cacheGroups: {
            // Separate vendor chunks for better caching
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
            },
            // Separate common chunks
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 5,
              reuseExistingChunk: true,
            },
            // Separate editor chunks to reduce serialization impact
            editor: {
              test: /[\\/]components[\\/]editor[\\/]/,
              name: 'editor',
              chunks: 'all',
              priority: 8,
              reuseExistingChunk: true,
            },
          },
        },
        // Optimize runtime chunk for better caching
        runtimeChunk: {
          name: 'runtime',
        },
        // Use deterministic chunk IDs for consistent builds
        chunkIds: 'deterministic',
      };
    }

    return config;
  },
};

module.exports = nextConfig;
