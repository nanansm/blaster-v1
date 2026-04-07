import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'

const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []

// For local testing without database
export const { handlers, auth, signIn, signOut } = NextAuth({
  // Skip adapter for now (no database required)
  providers: [
    // Dummy credentials provider for local testing
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Always return a mock user for testing
        return {
          id: "test-user-1",
          name: "Test User",
          email: "test@example.com",
          plan: "PRO",
          isAdmin: true,
        }
      }
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || 'dummy',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy',
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || "test-user-1"
        session.user.plan = (token.plan as string) || "PRO"
        session.user.isAdmin = (token.isAdmin as boolean) || true
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.plan = (user as any).plan || "PRO"
        token.isAdmin = adminEmails.includes(user.email || '') || true
      }
      return token
    },
  },
  pages: {
    signIn: '/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
})

// Extend the session type
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      plan?: string | null
      isAdmin?: boolean
    }
  }

  interface User {
    plan?: string | null
    isAdmin?: boolean
  }
}
