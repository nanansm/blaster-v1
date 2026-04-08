import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  // Create minimal standalone output for Easypanel deployment
  output: 'standalone',

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
  },

  // Security & correctness
  poweredByHeader: false,
  reactStrictMode: true,

  // Explicitly set the project root to avoid lockfile confusion
  outputFileTracingRoot: path.join(__dirname, './'),
}

export default nextConfig
