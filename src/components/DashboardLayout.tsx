import { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

interface User {
  id?: string | null
  name?: string | null
  email?: string | null
  image?: string | null
  plan?: string | null
  isAdmin?: boolean | null
}

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
