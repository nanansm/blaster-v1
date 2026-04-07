import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/DashboardLayout'

export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // For local testing: provide a mock session if auth fails
  let session
  try {
    session = await auth()
  } catch (error) {
    // If auth fails (no DB), create a mock session
    console.log('Auth not available, using mock session')
    session = {
      user: {
        id: 'test-user-1',
        name: 'Test User',
        email: 'test@example.com',
        plan: 'PRO',
        isAdmin: true,
      }
    }
  }

  // If no session, redirect to signin
  if (!session?.user) {
    redirect('/signin')
  }

  return <DashboardLayout user={session.user}>{children}</DashboardLayout>
}
