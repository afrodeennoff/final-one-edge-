import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    env: {
      ENCRYPTION_KEY: 'test-encryption-key-must-be-32-chars-longg',
      WHOP_WEBHOOK_SECRET: 'test-secret',
      DATABASE_URL: '',
    },
    globals: true,
    environment: 'node',
    setupFiles: ['./lib/__tests__/setup.ts'],
    include: ['**/__tests__/**/*.test.ts'],
    exclude: ['node_modules', 'dist', '.next', 'out'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '.next/',
        'out/',
        '**/__tests__/**',
        '**/*.test.ts',
        '**/*.test.tsx',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      'server-only': path.resolve(__dirname, './lib/__tests__/mocks/server-only.ts'),
      '@/lib/prisma': path.resolve(__dirname, './lib/__tests__/mocks/prismaIndex.ts'),
      '@whop/sdk': path.resolve(__dirname, './lib/__tests__/mocks/whopMock.ts'),
    },
  },
})
