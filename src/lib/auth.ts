import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from 'better-auth/next-js'
import { db } from '@/db'
import * as schema from '@/db/schema'

const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []

// Check if database is available
const isDbAvailable = db !== null

export const auth = betterAuth({
  // Base URL - from env or fallback
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',

  // Secret - from env or generate a safe fallback
  secret: process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET || 'super-secret-key-change-in-production',

  // Database - only attach if available
  ...(isDbAvailable ? {
    database: drizzleAdapter(db!, {
      provider: 'pg',
      schema: {
        ...schema,
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
      },
    }),
  } : {}),

  // Social Providers
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
  },

  // Trusted Origins (FIX FOR EASYPANEL)
  trustedOrigins: [
    process.env.BETTER_AUTH_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'http://localhost:3001',
    'https://mote-blaster.85c4o8.easypanel.host',
    'https://blaster.motekreatif.com',
  ],

  // Session
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },

  // User account
  user: {
    additionalFields: {
      plan: {
        type: 'string',
        required: false,
        defaultValue: 'FREE',
      },
      isAdmin: {
        type: 'boolean',
        required: false,
        defaultValue: false,
      },
    },
  },

  // Plugins
  plugins: [nextCookies()],
})
