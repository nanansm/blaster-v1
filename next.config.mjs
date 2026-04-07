/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ Optimize for deployment - creates minimal standalone output
  output: 'standalone',
  
  // ✅ Disable Turbopack for production (Webpack is stable)
  // Turbopack only for local dev via --turbopack flag
  turbo: {
    // Empty config disables it for build
  },
  
  // ✅ Ensure distDir is relative (default is fine)
  // DO NOT set distDir to absolute path
  
  // Environment-specific image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
  },
  
  // Build optimization
  poweredByHeader: false,
  reactStrictMode: true,
  
  // Fix workspace warning (only affects turbopack dev mode)
  turbopack: {
    root: process.cwd(), // Use dynamic path, not hardcoded
  },
}

export default nextConfig