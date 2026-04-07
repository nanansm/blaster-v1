# 📋 PRODUCT REQUIREMENTS DOCUMENT (PRD)
# Mote Blaster — WhatsApp Blast Web Application (Next.js Edition)

**Version:** 2.0.0
**Last Updated:** 2026
**Status:** Ready for Development

---

## 1. PROJECT OVERVIEW

**App Name:** Mote Blaster
**Type:** WhatsApp Bulk Messaging (Blasting) SaaS
**Description:** Platform SaaS untuk pengiriman pesan WhatsApp massal menggunakan mesin WPPConnect. Dibangun dengan arsitektur modern (Next.js) untuk skalabilitas tinggi dan kemudahan *deployment*.

### 1.1 Business Rules
| Rule | Free Plan | Pro Plan |
|---|---|---|
| Daily blast limit | 50 messages/day | Unlimited |
| Minimum delay | 10 seconds | 10 seconds (mandatory) |
| WA instances | 1 | 5 |
| Active campaigns | 2 | Unlimited |
| Price | Rp 0 | Subscription (via Xendit) |

---

## 2. TECH STACK (MODERNIZED)

### 2.1 Core Application (Fullstack)
* **Framework:** **Next.js 14+ (App Router)**
* **Language:** TypeScript
* **Styling:** **Tailwind CSS + shadcn/ui**
* **State Management:** Zustand (Client) + React Query v5 (Data Fetching)
* **Database ORM:** **Drizzle ORM** (Pengganti Prisma, lebih ringan & tanpa error OpenSSL)
* **Database:** PostgreSQL 15
* **Authentication:** NextAuth.js (Auth.js) dengan Google Provider

### 2.2 Background Services & Integrations
* **Message Queue:** **BullMQ + Redis** (Dijalankan sebagai *worker* terpisah yang sangat ringan)
* **WA Integration:** WPPConnect REST API
* **Payment Gateway:** Xendit SDK (Recurring Subscriptions)
* **File Handling:** Papaparse (untuk CSV di sisi *client/server*)
* **Google Sheets:** Google Sheets API v4

---

## 3. NEW PROJECT STRUCTURE (SIMPLIFIED)

Arsitektur tidak lagi Monorepo terpisah, melainkan menyatu dalam satu fondasi Next.js yang rapi.

```text
mote-blaster/
├── src/
│   ├── app/                    # Next.js App Router (Pages & API Routes)
│   │   ├── (auth)/             # Login, OAuth Callback
│   │   ├── (dashboard)/        # User Dashboard Pages
│   │   ├── (admin)/            # Owner/Admin Dashboard
│   │   └── api/                # Backend API Handlers (Xendit Webhook, WPPConnect Auth)
│   ├── components/             # React Components (Tailwind + shadcn/ui)
│   ├── lib/                    # Utils, Xendit Service, Google Sheets Service
│   ├── db/                     # Drizzle ORM Setup
│   │   ├── schema.ts           # Database tables definition (Drizzle)
│   │   └── migrate.ts          # Migration script
│   └── worker/                 # BACKGROUND QUEUE WORKER
│       └── blastWorker.ts      # BullMQ Worker (Runs independently)
├── drizzle.config.ts
├── next.config.mjs
├── tailwind.config.ts
└── package.json
```

---

## 4. NEW FEATURE: OWNER / ADMIN DASHBOARD

Untuk memudahkan Kang Ryan (dan tim Mote) memantau kesehatan bisnis dan operasional.

* **Route:** `/admin` (Hanya bisa diakses oleh email spesifik yang diatur di Environment Variable, misal: `admin_emails="nanan@motekreatif.com"`).
* **Financial Metrics:**
    * **Total Revenue (MRR):** Total pemasukan aktif dari langganan Pro bulan ini (terintegrasi dengan data Xendit).
    * **Pending Invoices:** Jumlah tagihan Pro yang belum dibayar.
* **User Metrics:**
    * Total Users terdaftar.
    * Rasio Pengguna Pro vs Free.
    * Daftar pengguna terbaru yang mendaftar.
* **System Health:**
    * **Queue Status:** Memantau berapa banyak pesan yang sedang antre (Pending), diproses (Active), dan gagal (Failed) di dalam Redis/BullMQ secara *real-time*.
    * **WPPConnect Status:** Indikator apakah *server* WPPConnect sedang *online* atau *down*.

---

## 5. REWRITTEN DATABASE SCHEMA (DRIZZLE ORM)

Contoh struktur tabel pengguna dan langganan menggunakan sintaks Drizzle (Sangat terhindar dari *error* sinkronisasi di Easypanel).

```typescript
// src/db/schema.ts
import { pgTable, text, timestamp, integer, boolean, pgEnum } from 'drizzle-orm/pg-core';

export const planEnum = pgEnum('plan', ['FREE', 'PRO']);

export const users = pgTable('users', {
  id: text('id').primaryKey(), // Menggunakan cuid/uuid
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  avatarUrl: text('avatar_url'),
  plan: planEnum('plan').default('FREE'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const subscriptions = pgTable('subscriptions', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  xenditSubscriptionId: text('xendit_subscription_id').unique(),
  status: text('status'), // ACTIVE, CANCELLED, UNPAID
  amount: integer('amount'),
  currentPeriodEnd: timestamp('current_period_end'),
});

// ... tabel instances, campaigns, contacts, messageLogs mengikuti struktur yang sama.
```

---

## 6. EASYPANEL DEPLOYMENT PLAN (THE EASY WAY)

Karena menggunakan Next.js dan Drizzle, proses *deployment* menjadi sangat damai. Kita hanya butuh **2 Service** untuk aplikasi utama (selain *database* dan WPPConnect).

### Service 1: `mote-web` (Aplikasi Next.js Utama)
* **Type:** App
* **Build Method:** **Nixpacks** (Pilih Nixpacks, Easypanel akan otomatis mengurus Next.js tanpa butuh Dockerfile sama sekali).
* **Start Command:** `npm run start` (Bawaan Nixpacks).
* **Tugas:** Melayani *website*, halaman *dashboard*, mencatat pengguna ke PostgreSQL, dan menaruh pekerjaan (*job*) ke Redis.

### Service 2: `mote-worker` (Background Job BullMQ)
* **Type:** App
* **Build Method:** Nixpacks
* **Start Command (Override):** `npx tsx src/worker/blastWorker.ts`
* **Tugas:** Murni membaca dari Redis dan menembak API WPPConnect setiap 10 detik. Jika *service* ini di-*restart*, *website* utama tidak akan terganggu.

### Environment Variables Wajib:
```env
DATABASE_URL=postgres://postgres:password@mote-db:5432/mote
REDIS_URL=redis://default:password@mote-redis:6379
NEXTAUTH_URL=https://blaster.motekreatif.com
NEXTAUTH_SECRET=rahasia_super_aman
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
WPPCONNECT_BASE_URL=http://wppconnect:21465
WPPCONNECT_SECRET_KEY=...
XENDIT_SECRET_KEY=...
ADMIN_EMAILS=nanan@motekreatif.com,admin@mote.com
```