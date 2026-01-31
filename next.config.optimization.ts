import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      'framer-motion',
      'd3',
    ],
    optimizeCss: true,
  },

  // Split chunks for better caching
  webpack: (config, { isServer }) => {
    // Improve chunk splitting
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,

            // Framework chunk
            framework: {
              name: 'framework',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              priority: 40,
              enforce: true,
            },

            // Libraries chunk
            lib: {
              test: /[\\/]node_modules[\\/]/,
              name(module: any) {
                const match = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)
                if (match) {
                  const packageName = match[1]
                  if (packageName === '@radix-ui') {
                    return 'radix-ui'
                  }
                  if (packageName.startsWith('d3')) {
                    return 'd3'
                  }
                  return 'vendor'
                }
                return 'vendor'
              },
              priority: 30,
              minChunks: 1,
              reuseExistingChunk: true,
            },

            // Common shared modules
            common: {
              name: 'common',
              minChunks: 2,
              priority: 20,
              reuseExistingChunk: true,
              enforce: true,
            },
          },
        },
      }
    }

    return config
  },

  // Compress output
  compress: true,

  // Remove console in production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
}

export default nextConfig
