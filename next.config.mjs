/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use webpack for production builds (lighter than turbopack)
  // Turbopack only enabled in dev mode via --turbopack flag
  
  // Optimize for deployment - creates minimal standalone output
  output: 'standalone',
  
  // Environment-specific image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
  },
  
  // Build optimization
  poweredByHeader: false,
  reactStrictMode: true,
  
  // Silences workspace root warning (only affects turbopack dev mode)
  // The parent lockfile at /Users/nanansomanan/package-lock.json is unrelated to this project
  turbopack: {
    root: '/Users/nanansomanan/Documents/GitHub/blaster-v1',
  },
}

export default nextConfig
