import { pgTable, text, timestamp, integer, boolean, pgEnum, serial, json } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ===========================
// BETTER AUTH TABLES
// ===========================

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false),
  image: text('image'),
  plan: text('plan').default('FREE'),
  isAdmin: boolean('is_admin').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  expiresAt: timestamp('expires_at'),
  password: text('password'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// ===========================
// APP TABLES (Mote Blaster)
// ===========================

// Enums
export const planEnum = pgEnum('plan', ['FREE', 'PRO'])
export const subscriptionStatusEnum = pgEnum('subscription_status', ['ACTIVE', 'CANCELLED', 'UNPAID', 'EXPIRED'])
export const campaignStatusEnum = pgEnum('campaign_status', ['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'FAILED'])
export const messageStatusEnum = pgEnum('message_status', ['PENDING', 'SENT', 'FAILED', 'QUEUED'])
export const instanceStatusEnum = pgEnum('instance_status', ['CONNECTED', 'DISCONNECTED', 'CONNECTING', 'ERROR'])

// Users table
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  avatarUrl: text('avatar_url'),
  plan: planEnum('plan').default('FREE'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Subscriptions table
export const subscriptions = pgTable('subscriptions', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  xenditSubscriptionId: text('xendit_subscription_id').unique(),
  status: subscriptionStatusEnum('status').notNull(),
  amount: integer('amount'),
  currentPeriodEnd: timestamp('current_period_end'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// WhatsApp Instances table
export const instances = pgTable('instances', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  phoneNumber: text('phone_number'),
  status: instanceStatusEnum('status').default('DISCONNECTED'),
  qrCode: text('qr_code'),
  wppconnectInstanceId: text('wppconnect_instance_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Campaigns table
export const campaigns = pgTable('campaigns', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  instanceId: text('instance_id').references(() => instances.id),
  name: text('name').notNull(),
  status: campaignStatusEnum('status').default('DRAFT'),
  message: text('message'),
  delay: integer('delay').default(10), // Minimum 10 seconds
  totalRecipients: integer('total_recipients').default(0),
  sentCount: integer('sent_count').default(0),
  failedCount: integer('failed_count').default(0),
  scheduledAt: timestamp('scheduled_at'),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Contacts table
export const contacts = pgTable('contacts', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  campaignId: text('campaign_id').references(() => campaigns.id),
  phoneNumber: text('phone_number').notNull(),
  name: text('name'),
  email: text('email'),
  metadata: json('metadata'), // Additional custom fields
  createdAt: timestamp('created_at').defaultNow(),
})

// Message Logs table
export const messageLogs = pgTable('message_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  campaignId: text('campaign_id').references(() => campaigns.id),
  contactId: text('contact_id').references(() => contacts.id),
  instanceId: text('instance_id').references(() => instances.id),
  phoneNumber: text('phone_number').notNull(),
  message: text('message').notNull(),
  status: messageStatusEnum('status').default('PENDING'),
  wppconnectMessageId: text('wppconnect_message_id'),
  errorMessage: text('error_message'),
  sentAt: timestamp('sent_at'),
  createdAt: timestamp('created_at').defaultNow(),
})

// Queue Jobs tracking (optional, for monitoring)
export const queueJobs = pgTable('queue_jobs', {
  id: text('id').primaryKey(),
  jobId: text('job_id').unique().notNull(),
  userId: text('user_id').references(() => users.id),
  campaignId: text('campaign_id').references(() => campaigns.id),
  status: text('status').notNull(), // pending, active, completed, failed
  attempts: integer('attempts').default(0),
  maxAttempts: integer('max_attempts').default(3),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Export all tables
export const schema = {
  // Better Auth tables
  user,
  session,
  account,
  verification,
  // App tables
  users,
  subscriptions,
  instances,
  campaigns,
  contacts,
  messageLogs,
  queueJobs,
}
