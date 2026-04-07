import { auth } from './auth'
import { headers } from 'next/headers'

export async function getCurrentUser() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })
    return session?.user || null
  } catch (error) {
    return null
  }
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

export async function isAdmin() {
  const user = await getCurrentUser()
  if (!user) return false
  
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []
  return adminEmails.includes(user.email || '')
}

export async function getServerSession() {
  try {
    return await auth.api.getSession({
      headers: await headers(),
    })
  } catch (error) {
    return null
  }
}
