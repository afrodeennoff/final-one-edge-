import type { NextConfig } from 'next';
import createMDX from '@next/mdx';

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        hostname: 'fhvmtnvjiotzztimdxbi.supabase.co',
      },
      {
        hostname: 'raw.githubusercontent.com',
      },
    ],
    deviceSizes: [320, 480, 768, 1024, 1200, 1440, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  pageExtensions: ['mdx', 'ts', 'tsx'],
  experimental: {
    useCache: true,
    mdxRs: true,
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      'framer-motion',
      'd3',
    ],
  },
  compress: true,
  outputFileTracingIncludes: {
    '/*': [
      '**/node_modules/@prisma/engines/libquery_engine-rhel-openssl-3.0.x.so.node',
      '**/node_modules/.prisma/client/libquery_engine-rhel-openssl-3.0.x.so.node',
    ],
    '/app/api/**': [
      '**/node_modules/.prisma/client/**',
    ],
  },
}

const withMDX = createMDX({
  extension: /\.mdx?$/,
});

export default withMDX(nextConfig);