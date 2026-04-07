'use client'

import { Button } from '@/components/ui/button'
import { UserCircle, LogOut } from 'lucide-react'

interface User {
  id?: string | null
  name?: string | null
  email?: string | null
  image?: string | null
  plan?: string | null
  isAdmin?: boolean | null
}

interface HeaderProps {
  user?: User | null
}

export function Header({ user }: HeaderProps) {
  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/sign-out', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      window.location.href = '/signin'
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <header className="header">
      <div className="header-content">
        <div className="flex items-center gap-4">
          <h1 className="header-title">
            Welcome back, {user?.name || 'User'}!
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <>
              <div className="flex items-center gap-2">
                <UserCircle className="icon-md text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{user.email}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
              >
                <LogOut className="icon-sm" />
                Logout
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
