# 🚀 Easypanel Deployment Guide — Mote Blaster

## Overview

This guide provides step-by-step instructions to deploy Mote Blaster to Easypanel using Nixpacks with a standalone Next.js build.

---

## 📋 Prerequisites

- Easypanel account & project
- PostgreSQL database (Easypanel managed or self-hosted)
- Redis instance (for future BullMQ worker)
- Google Cloud Console project (for OAuth)
- Domain name (optional, for custom domain setup)

---

## 🔧 Service Configuration

### Service: `mote-web` (Main Next.js Application)

| Setting | Value |
|---|---|
| **Build Method** | `Nixpacks` |
| **Start Command** | `node .next/standalone/server.js` |
| **Port** | `3000` (default) |
| **Branch** | `main` (or your deploy branch) |

> **⚠️ IMPORTANT:** The Start Command MUST be `node .next/standalone/server.js` — NOT `npm run start`. The standalone output creates an optimized self-contained server.

---

## 📝 Environment Variables

Add ALL of the following environment variables in Easypanel:

| Variable | Description | Example Value |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgres://postgres:password@mote-db:5432/mote` |
| `REDIS_URL` | Redis connection string | `redis://default:password@mote-redis:6379` |
| `BETTER_AUTH_URL` | Your app's public URL (NO trailing slash) | `https://blaster.motekreatif.com` |
| `BETTER_AUTH_SECRET` | Random secret for session encryption | `generate-a-long-random-string-here` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | `abc123.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | `GOCSPX-abcdef123456` |
| `WPPCONNECT_BASE_URL` | WPPConnect server URL | `http://wppconnect:21465` |
| `WPPCONNECT_SECRET_KEY` | WPPConnect secret key | `your-wppconnect-secret` |
| `XENDIT_SECRET_KEY` | Xendit API key | `xndp_abcdef123456` |
| `ADMIN_EMAILS` | Comma-separated admin emails | `nanan@motekreatif.com,admin@mote.com` |
| `NEXT_PUBLIC_MOCK_MODE` | Set `true` to skip external API calls | `true` (or `false`) |
| `NODE_ENV` | Node environment | `production` |
| `NEXT_TELEMETRY_DISABLED` | Disable Next.js telemetry | `1` |

### How to Generate a Secret

Run this in your terminal:
```bash
openssl rand -base64 32
```
Or use any strong random string generator. Minimum 32 characters recommended.

---

## 🔐 Google OAuth Setup

1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Create an **OAuth 2.0 Client ID** (Application type: Web application)
3. Set **Authorized JavaScript Origins**:
   - `https://blaster.motekreatif.com` (your domain)
4. Set **Authorized Redirect URIs**:
   - `https://blaster.motekreatif.com/api/auth/callback/google`
   - `https://mote-blaster.85c4o8.easypanel.host/api/auth/callback/google` (if using Easypanel subdomain)
5. Copy the **Client ID** and **Client Secret** to your Easypanel env vars

---

## 🗄️ Database Setup

After deploying the service and setting env vars, run the database migrations:

### Option 1: Easypanel Console (Recommended)
1. Open the Easypanel console for your `mote-web` service
2. Run: `npx drizzle-kit push`

### Option 2: Local Migration
If you have database access from your local machine:
```bash
DATABASE_URL=your_production_db_url npx drizzle-kit push
```

> **Note:** `drizzle-kit push` will create all tables including Better Auth tables (`user`, `session`, `account`, `verification`) and app tables (`users`, `subscriptions`, `instances`, `campaigns`, `contacts`, `messageLogs`, `queueJobs`).

---

## 🚨 Troubleshooting

### Error: `UntrustedHost` or `Invalid origin`

**Cause:** The `trustedOrigins` in `auth.ts` doesn't include your domain.

**Fix:**
1. Make sure `BETTER_AUTH_URL` env var is set correctly (no trailing slash)
2. The `trustedOrigins` array in `src/lib/auth.ts` already includes common Easypanel domains. If you use a custom domain, add it to the array:
   ```ts
   trustedOrigins: [
     process.env.BETTER_AUTH_URL || 'http://localhost:3000',
     'http://localhost:3000',
     'http://localhost:3001',
     'https://mote-blaster.85c4o8.easypanel.host',
     'https://blaster.motekreatif.com',
     'https://your-custom-domain.com', // ← Add here
   ],
   ```
3. Rebuild and redeploy

### Error: `Cannot find module '.next/standalone/server.js'`

**Cause:** The build didn't produce standalone output, or the start command is wrong.

**Fix:**
1. Verify `next.config.ts` has `output: 'standalone'`
2. Run `npm run build` locally and confirm `.next/standalone/server.js` exists
3. In Easypanel, ensure Start Command is exactly: `node .next/standalone/server.js`

### Error: `Database not configured` warnings

**Cause:** `DATABASE_URL` env var is not set or unreachable.

**Fix:**
1. Set `DATABASE_URL` in Easypanel env vars
2. Ensure the database service is accessible from your app service (same network/VPC)
3. Test connection: `echo $DATABASE_URL` in Easypanel console

### Error: Google OAuth redirect mismatch

**Cause:** The redirect URI registered in Google Cloud Console doesn't match `BETTER_AUTH_URL/api/auth/callback/google`.

**Fix:**
1. In Google Cloud Console, add BOTH your Easypanel subdomain and custom domain as Authorized Redirect URIs
2. Example: `https://mote-blaster.85c4o8.easypanel.host/api/auth/callback/google`

### Error: Build fails with missing env vars

**Cause:** Next.js tries to read env vars at build time.

**Fix:** Set dummy values in Easypanel's build environment:
```
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=dummy-secret-for-build
DATABASE_URL=postgres://dummy:dummy@localhost:5432/dummy
```
The actual values will be used at runtime.

### Error: `better-auth.session_token` cookie not set

**Cause:** CORS/cookie issues with your domain.

**Fix:**
1. Ensure `BETTER_AUTH_URL` matches your actual deployed domain
2. Check that `trustedOrigins` includes your domain
3. Make sure your browser accepts cookies from your domain

---

## 📦 Build & Deploy Checklist

- [ ] PostgreSQL database is running
- [ ] Redis is running (optional for now)
- [ ] All environment variables are set in Easypanel
- [ ] Google OAuth redirect URIs are configured
- [ ] `BETTER_AUTH_URL` matches your Easypanel domain
- [ ] Start command is: `node .next/standalone/server.js`
- [ ] Build method is: `Nixpacks`
- [ ] Database migrations are run (`npx drizzle-kit push`)
- [ ] Test sign-in with Google works
- [ ] Test admin dashboard is accessible (with admin email)

---

## 🔄 Deployment Workflow

1. **Push code to GitHub** (main branch)
2. **Easypanel auto-deploys** (if connected to repo)
3. **Run migrations** via Easypanel console: `npx drizzle-kit push`
4. **Verify** the app is accessible and sign-in works

### Manual Deploy (if needed)
```bash
# Build locally
npm run build

# Test standalone output
node .next/standalone/server.js
```

---

## 📚 Architecture Notes

- **Next.js 16** with `output: 'standalone'` — creates minimal deployable bundle
- **Better Auth** — authentication via Google OAuth + Drizzle PostgreSQL adapter
- **Drizzle ORM** — type-safe database queries, easy migrations
- **Tailwind CSS + shadcn/ui** — component styling
- **Mock Mode** — set `NEXT_PUBLIC_MOCK_MODE=true` to bypass WPPConnect/Xendit during testing
