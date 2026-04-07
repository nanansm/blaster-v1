'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Megaphone,
  Users,
  MessageSquare,
  Smartphone,
  Settings,
  Shield,
} from 'lucide-react'

const dashboardNavItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Campaigns',
    href: '/dashboard/campaigns',
    icon: Megaphone,
  },
  {
    title: 'Contacts',
    href: '/dashboard/contacts',
    icon: Users,
  },
  {
    title: 'Message Logs',
    href: '/dashboard/logs',
    icon: MessageSquare,
  },
  {
    title: 'Instances',
    href: '/dashboard/instances',
    icon: Smartphone,
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
]

const adminNavItems = [
  {
    title: 'Admin Overview',
    href: '/admin',
    icon: Shield,
  },
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
]

interface SidebarProps {
  isAdmin?: boolean
}

export function Sidebar({ isAdmin = false }: SidebarProps) {
  const pathname = usePathname()
  const navItems = isAdmin ? adminNavItems : dashboardNavItems

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Link href={isAdmin ? '/admin' : '/dashboard'} className="sidebar-logo">
          <Megaphone className="icon-lg" />
          <span className="sidebar-logo-text">Mote Blaster</span>
        </Link>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${
                isActive
                  ? 'sidebar-link-active'
                  : 'sidebar-link-inactive'
              }`}
            >
              <Icon className="icon-md" />
              {item.title}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
