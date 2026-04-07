import { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { User } from 'next-auth'

interface DashboardLayoutProps {
  children: ReactNode
  user?: User | null
  isAdmin?: boolean
}

export function DashboardLayout({ children, user, isAdmin = false }: DashboardLayoutProps) {
  return (
    <div className="dashboard-layout">
      <Sidebar isAdmin={isAdmin} />
      <div className="dashboard-main">
        <Header user={user} />
        <main className="dashboard-content">
          {children}
        </main>
      </div>
    </div>
  )
}
