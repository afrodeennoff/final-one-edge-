import type { NextConfig } from 'next';
import createMDX from '@next/mdx';

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        hostname: 'rtfknzopyeigfwbbnwxf.supabase.co',
      },
      {
        hostname: 'raw.githubusercontent.com',
      },
    ],
    deviceSizes: [320, 480, 768, 1024, 1200, 1440, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://rtfknzopyeigfwbbnwxf.supabase.co https://api.openai.com https://api.whop.com;"
          }
        ]
      }
    ]
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