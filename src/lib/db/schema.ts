import { createId } from "@paralleldrive/cuid2";
import {
  pgTable,
  text,
  timestamp,
  integer,
  json,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export { createId };

// ==================== AUTH TABLES (Better Auth) ====================

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified").notNull().default(0),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  // Additional fields for Mote Blaster
  plan: varchar("plan", { length: 20 }).notNull().default("free"), // 'free' | 'pro'
  role: varchar("role", { length: 20 }).notNull().default("user"), // 'user' | 'owner'
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ==================== APP TABLES ====================

export const instances = pgTable("instances", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  sessionName: text("session_name").notNull().unique(),
  phoneNumber: text("phone_number"),
  status: varchar("status", { length: 20 }).notNull().default("disconnected"), // 'disconnected' | 'qr_code' | 'connected'
  lastConnected: timestamp("last_connected"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const campaigns = pgTable("campaigns", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  instanceId: text("instance_id")
    .notNull()
    .references(() => instances.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  messageTemplate: text("message_template").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("draft"), // 'draft' | 'running' | 'paused' | 'completed'
  contactSource: varchar("contact_source", { length: 20 }).notNull().default("csv"), // 'csv' | 'sheets'
  contactsCount: integer("contacts_count").notNull().default(0),
  sentCount: integer("sent_count").notNull().default(0),
  failedCount: integer("failed_count").notNull().default(0),
  delayMs: integer("delay_ms").notNull().default(1000),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const contacts = pgTable("contacts", {
  id: text("id").primaryKey(),
  campaignId: text("campaign_id")
    .notNull()
    .references(() => campaigns.id, { onDelete: "cascade" }),
  phone: text("phone").notNull(),
  name: text("name").notNull().default(""),
  variables: json("variables").default("{}"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const messageLogs = pgTable("message_logs", {
  id: text("id").primaryKey(),
  campaignId: text("campaign_id")
    .notNull()
    .references(() => campaigns.id, { onDelete: "cascade" }),
  contactPhone: text("contact_phone").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // 'pending' | 'sent' | 'failed'
  error: text("error"),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const dailyUsage = pgTable(
  "daily_usage",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    date: text("date").notNull(), // YYYY-MM-DD format
    sentCount: integer("sent_count").notNull().default(0),
  },
  (table) => ({
    uniqueUserDate: uniqueIndex("unique_user_date").on(
      table.userId,
      table.date
    ),
  })
);

export const subscriptions = pgTable("subscriptions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  xenditSubscriptionId: text("xendit_subscription_id"),
  status: varchar("status", { length: 20 }).notNull().default("inactive"), // 'inactive' | 'active' | 'cancelled' | 'expired'
  amount: integer("amount").notNull().default(0),
  currentPeriodEnd: timestamp("current_period_end"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Export all tables for Drizzle
export const tables = {
  user,
  session,
  account,
  verification,
  instances,
  campaigns,
  contacts,
  messageLogs,
  dailyUsage,
  subscriptions,
};
