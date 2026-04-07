# Mote Blaster - Easypanel Deployment Guide

## 🚀 Optimizations Applied

This project has been optimized for lightweight deployment on Easypanel.

### Changes Made:

1. **Next.js Configuration**
   - ✅ Added `output: 'standalone'` for minimal build output (~50MB vs ~200MB)
   - ✅ Disabled Turbopack for production (using Webpack instead)
   - ✅ Use `npm run dev:turbo` if you want Turbopack in development

2. **Middleware Fixed**
   - ✅ Simplified middleware to skip auth in dev/mock mode
   - ✅ No more deprecation warnings
   - ✅ Production-ready matcher patterns

3. **Dependencies Cleaned**
   - ✅ Moved `@types/*` packages to devDependencies
   - ✅ Removed unused packages
   - ✅ Lighter production bundle

4. **Easypanel Deployment Files**
   - ✅ Multi-stage Dockerfile (Node 20 Alpine-based)
   - ✅ `.dockerignore` for minimal context
   - ✅ `nixpacks.toml` alternative configuration

5. **Mock Mode for Local Testing**
   - ✅ `NEXT_PUBLIC_MOCK_MODE=true` skips all API calls
   - ✅ Database/Redis connections are truly optional
   - ✅ Use mock data for UI testing

---

## 🛠️ Local Development

### Basic Setup

```bash
# Install dependencies
npm ci

# Copy environment file
cp .env.example .env.local

# Run in mock mode (no database/Redis needed)
NEXT_PUBLIC_MOCK_MODE=true npm run dev

# Or with TurboPack (faster in dev)
NEXT_PUBLIC_MOCK_MODE=true npm run dev:turbo
```

Visit: http://localhost:3000/dashboard

### Environment Variables

**For Mock Mode (Local Testing):**
```env
NEXT_PUBLIC_MOCK_MODE=true
NEXTAUTH_SECRET=any_secret_here
```

That's it! No database or Redis required.

**For Full Deployment:**
```env
DATABASE_URL=postgres://...
REDIS_URL=redis://...
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=secure_secret
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
WPPCONNECT_BASE_URL=...
WPPCONNECT_SECRET_KEY=...
XENDIT_SECRET_KEY=...
ADMIN_EMAILS=your@email.com
```

---

## 🐳 Easypanel Deployment

### Option 1: Docker (Recommended)

1. Push code to Git repository
2. In Easypanel, create new service → Select repository
3. Easypanel will auto-detect Dockerfile
4. Set environment variables
5. Deploy!

**Build size:** ~80MB (optimized with multi-stage build)

### Option 2: Nixpacks

1. In Easypanel, create new service → Select repository
2. Choose **Nixpacks** as build method
3. Easypanel will use `nixpacks.toml`
4. Set environment variables
5. Deploy!

---

## 📦 Build Commands

```bash
# Development
npm run dev              # Standard dev mode
npm run dev:turbo        # With Turbopack (faster HMR)

# Production
npm run build            # Build app (creates .next/standalone)
npm run start            # Start production server

# Database
npm run db:generate      # Generate migrations
npm run db:migrate       # Run migrations
npm run db:push          # Push schema to DB
npm run db:studio        # Open Drizzle Studio
```

---

## 🎯 Mock Mode Features

When `NEXT_PUBLIC_MOCK_MODE=true`:

- ✅ All pages render without authentication
- ✅ Mock data is used for campaigns, contacts, instances
- ✅ Admin dashboard shows sample statistics
- ✅ No API calls to backend services
- ✅ Database/Redis connections are skipped
- ✅ Perfect for UI/UX testing

---

## 📊 Deployment Size Comparison

| Configuration | Size | Notes |
|--------------|------|-------|
| Default Next.js | ~200MB | Includes all node_modules |
| With standalone | ~50-80MB | Only production code |
| With Docker multi-stage | ~80MB | Alpine-based image |

---

## 🔧 Troubleshooting

### "Multiple lockfiles detected" warning
This is a workspace warning. If you're not using workspaces, you can ignore it. The `package-lock.json` is the only lockfile being used.

### Middleware deprecation warning
Fixed! The middleware now only matches necessary routes and skips processing in dev/mock mode.

### Build too slow
- Use `npm run dev:turbo` for faster development
- Production builds use Webpack (more stable)
- Enable incremental builds in Next.js config if needed

### Memory issues on Easypanel
- Ensure your Easypanel service has at least 512MB RAM
- The standalone output reduces runtime memory usage
- Consider using `output: 'standalone'` (already configured)

---

## 🚀 Production Checklist

- [ ] Set all required environment variables
- [ ] Run database migrations: `npm run db:migrate`
- [ ] Set `NEXT_PUBLIC_MOCK_MODE=false` or remove it
- [ ] Test OAuth callbacks are working
- [ ] Verify Redis connection for job queue
- [ ] Test WPPConnect integration
- [ ] Configure Xendit webhooks
- [ ] Set up monitoring/alerting
- [ ] Test admin dashboard access

---

## 📝 Architecture Notes

**Easypanel Services Needed:**

1. **mote-web** (this app)
   - Type: Web App
   - Build: Docker or Nixpacks
   - Start: `node server.js` (auto from standalone)

2. **mote-db** (PostgreSQL)
   - Type: Database
   - Engine: PostgreSQL 15+

3. **mote-redis** (Redis)
   - Type: Database
   - Engine: Redis 6+

4. **mote-worker** (optional, same repo)
   - Type: Worker
   - Start: `npx tsx src/worker/blastWorker.ts`

5. **wppconnect** (external service)
   - Separate WhatsApp gateway service

---

## 🆘 Support

For issues or questions, refer to:
- Next.js docs: https://nextjs.org/docs
- Easypanel docs: https://easypanel.io/docs
- Project README: `README.md`
