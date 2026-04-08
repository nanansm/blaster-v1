# 🚀 Easypanel Deployment Guide — Mote Blaster

## Overview
Mote Blaster is a WhatsApp Blast SaaS built with:
- **Next.js 15** (App Router) with `output: 'standalone'`
- **Better Auth** (Google OAuth + Email/Password)
- **PostgreSQL** + Drizzle ORM
- **Redis** + BullMQ (Queue System)
- **Baileys** (WhatsApp Engine — no Chromium needed)

---

## 📋 Prerequisites

1. **VPS** with Docker (Easypanel installed)
2. **PostgreSQL** database (can be a Docker container)
3. **Redis** server (can be a Docker container)
4. **Domain name** pointed to your VPS IP
5. **Google OAuth** credentials

---

## 🔧 Easypanel Setup

### Step 1: Create Application

1. In Easypanel, create a new application
2. Select **Nixpacks** as the build method
3. Point to your Git repository

### Step 2: Build Configuration

| Setting | Value |
|---------|-------|
| Build Method | **Nixpacks** |
| Build Command | `yarn install --ignore-engines && yarn build` |
| Start Command | `node .next/standalone/server.js` |
| Port | `3000` |

### Step 3: Environment Variables

Add these environment variables in Easypanel:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@db-host:5432/mote_blaster` |
| `REDIS_URL` | Redis connection string | `redis://redis-host:6379` |
| `BETTER_AUTH_SECRET` | Random secret for session signing | `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | Your application URL | `https://blaster.example.com` |
| `NEXT_PUBLIC_APP_URL` | Same as BETTER_AUTH_URL | `https://blaster.example.com` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | `xxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | `GOCSPX-xxx` |
| `XENDIT_SECRET_KEY` | Xendit payment gateway key | `xnd_production_xxx` |
| `XENDIT_WEBHOOK_TOKEN` | Xendit webhook verification | `your-webhook-token` |
| `WA_SESSION_DIR` | WhatsApp session storage directory | `./wa_sessions` |

### Step 4: Persistent Storage

Add a **Persistent Volume** in Easypanel:

| Mount Path | Purpose |
|------------|---------|
| `/app/wa_sessions` | WhatsApp auth sessions (QR code data) |

This ensures WhatsApp sessions persist across restarts.

---

## 🔐 Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Set **Authorized JavaScript Origins**:
   ```
   https://blaster.example.com
   ```
6. Set **Authorized Redirect URIs**:
   ```
   https://blaster.example.com/api/auth/callback/google
   ```
7. Copy the **Client ID** and **Client Secret** to Easypanel env vars

---

## 🗄️ Database Setup

### PostgreSQL (Docker Container)

```yaml
# Add as a service in Easypanel
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: mote_blaster
      POSTGRES_USER: blaster_user
      POSTGRES_PASSWORD: your_secure_password
    volumes:
      - pg_data:/var/lib/postgresql/data
```

### Run Migrations

After the first deployment, run migrations:

```bash
# SSH into your container or use Easypanel console
cd /app
npx drizzle-kit push
```

Or add as a pre-deploy hook:
```bash
yarn install --ignore-engines && npx drizzle-kit push && yarn build
```

---

## 🔴 Redis Setup

### Redis (Docker Container)

```yaml
services:
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
```

---

## 🚀 Start Command

The standalone output means you run:

```bash
node .next/standalone/server.js
```

This includes:
- Next.js server
- API routes
- Background worker (via `instrumentation.ts`)
- WhatsApp Baileys sessions

All in **one process** — no separate workers needed!

---

## 📁 File Structure (Production)

```
/app
├── .next/standalone/
│   ├── server.js          # Main entry point
│   ├── package.json
│   └── node_modules/
├── .next/static/           # Static assets
├── wa_sessions/            # WhatsApp auth (persistent)
│   ├── session_1/
│   ├── session_2/
│   └── ...
└── public/
```

---

## ⚠️ Important Notes

### Memory Management
- Baileys runs **purely in Node.js** — no Chrome/Chromium needed
- Each WhatsApp session uses ~50-100MB RAM
- Recommended: Minimum **1GB RAM** for 1-2 sessions
- The singleton pattern ensures DB/Redis connections are shared

### Auto-Reconnect
- On server restart, existing sessions in `wa_sessions/` are automatically reconnected
- Baileys handles reconnection with exponential backoff (max 5 attempts)

### Daily Limits
- Free plan: 50 messages/day
- Pro plan: Unlimited (set via Xendit subscription)

### Scaling
For higher scale:
- Use multiple Redis workers (increase concurrency)
- Consider external WhatsApp API (Evolution API) for 10+ sessions

---

## 🐛 Troubleshooting

### "Session not connected"
- Check if `wa_sessions/` folder has correct permissions
- Verify Redis is running and accessible
- Check logs: `docker logs <container>`

### "Database connection refused"
- Verify `DATABASE_URL` format
- Ensure PostgreSQL is running and accepting connections
- Check network policies between containers

### "Google OAuth callback URL mismatch"
- Verify redirect URI in Google Cloud Console matches:
  `https://<your-domain>/api/auth/callback/google`

### Build fails on deployment
- Ensure `yarn.lock` is committed
- Check Node version (requires Node 20+)
- Run `yarn install --ignore-engines && yarn build` locally to test

---

## 📊 Health Check

```bash
curl https://blaster.example.com/api/health
# Expected: {"status":"ok","timestamp":"...","uptime":...}
```

---

## 🔄 Updating

1. Push new code to Git
2. Easypanel auto-deploys (if webhook configured)
3. Or manually trigger redeploy in Easypanel dashboard

---

*Last updated: April 8, 2026*
