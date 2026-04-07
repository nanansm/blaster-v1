# Mote Blaster - WhatsApp Bulk Messaging Platform

A modern SaaS platform for sending bulk WhatsApp messages using WPPConnect engine. Built with Next.js 14+ for high scalability and easy deployment.

## 🚀 Features

### User Features
- **Campaign Management**: Create, manage, and monitor WhatsApp blast campaigns
- **Contact Management**: Import contacts via CSV or Google Sheets
- **WhatsApp Instances**: Manage multiple WhatsApp instances (based on plan)
- **Message Logs**: Track all sent messages and their delivery status
- **Subscription Management**: Upgrade to Pro plan via Xendit

### Admin Features
- **Financial Metrics**: Monitor MRR, pending invoices, and subscription status
- **User Analytics**: Track total users, Pro vs Free ratio
- **System Health**: Monitor queue status and WPPConnect server status

### Technical Features
- **Modern Stack**: Next.js 14+, TypeScript, Tailwind CSS, shadcn/ui
- **Authentication**: NextAuth.js with Google OAuth
- **Database**: PostgreSQL with Drizzle ORM
- **Queue System**: BullMQ + Redis for background job processing
- **State Management**: Zustand (client) + React Query (data fetching)

## 📋 Prerequisites

- Node.js 18+ or 20+
- PostgreSQL 15+
- Redis 6+
- Google OAuth credentials
- WPPConnect server
- Xendit account (for payment processing)

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd blaster-v1
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
# Database
DATABASE_URL=postgres://postgres:password@localhost:5432/mote

# Redis
REDIS_URL=redis://localhost:6379

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key_here

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# WPPConnect
WPPCONNECT_BASE_URL=http://localhost:21465
WPPCONNECT_SECRET_KEY=your_wppconnect_secret

# Xendit
XENDIT_SECRET_KEY=your_xendit_secret_key

# Admin Emails (comma-separated)
ADMIN_EMAILS=your@email.com,admin@email.com
```

4. **Set up the database**
```bash
npm run db:generate
npm run db:migrate
```

5. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 📁 Project Structure

```
mote-blaster/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication pages
│   │   ├── (dashboard)/       # User dashboard pages
│   │   ├── (admin)/           # Admin dashboard pages
│   │   └── api/               # API routes
│   ├── components/            # React components
│   │   ├── ui/                # shadcn/ui components
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── DashboardLayout.tsx
│   │   └── Providers.tsx
│   ├── lib/                   # Utilities and services
│   │   ├── auth/              # NextAuth configuration
│   │   ├── services/          # External service integrations
│   │   │   ├── wppconnect.ts
│   │   │   ├── xendit.ts
│   │   │   └── googleSheets.ts
│   │   └── utils.ts
│   ├── db/                    # Database configuration
│   │   ├── index.ts           # Drizzle setup
│   │   └── schema.ts          # Database schema
│   └── worker/                # Background job workers
│       └── blastWorker.ts     # BullMQ worker
├── drizzle.config.ts
├── next.config.mjs
├── tailwind.config.ts
└── package.json
```

## 🗄️ Database Schema

The application uses the following tables:
- **users**: User accounts and subscription plans
- **subscriptions**: Xendit subscription records
- **instances**: WhatsApp instance connections
- **campaigns**: Blast campaign definitions
- **contacts**: Contact lists for campaigns
- **message_logs**: Message delivery logs
- **queue_jobs**: Background job tracking

## 🚢 Deployment

### EasyPanel Deployment

The application is designed for easy deployment on EasyPanel with two services:

#### Service 1: `mote-web` (Main Next.js App)
- **Type**: App
- **Build Method**: Nixpacks
- **Start Command**: `npm run start`

#### Service 2: `mote-worker` (Background Job Worker)
- **Type**: App
- **Build Method**: Nixpacks
- **Start Command**: `npx tsx src/worker/blastWorker.ts`

### Environment Variables
Make sure to set all required environment variables (see `.env.example`)

## 📊 Business Rules

| Rule | Free Plan | Pro Plan |
|------|-----------|----------|
| Daily blast limit | 50 messages/day | Unlimited |
| Minimum delay | 10 seconds | 10 seconds (mandatory) |
| WA instances | 1 | 5 |
| Active campaigns | 2 | Unlimited |
| Price | Rp 0 | Subscription (via Xendit) |

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Drizzle migration files
- `npm run db:migrate` - Run database migrations
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Drizzle Studio

## 🔐 Authentication

The application uses NextAuth.js with Google OAuth. To set up:

1. Create a project in Google Cloud Console
2. Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
5. Add the credentials to your `.env.local`

## 👨‍💼 Admin Access

Admin dashboard is accessible only to emails specified in `ADMIN_EMAILS` environment variable (comma-separated).

## 📝 License

This project is proprietary software. All rights reserved.

## 🤝 Support

For support, contact: nanan@motekreatif.com

---

Built with ❤️ by Mote Kreatif Team
