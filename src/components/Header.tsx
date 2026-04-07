'use client'

import { User } from 'next-auth'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { UserCircle, LogOut } from 'lucide-react'

interface HeaderProps {
  user?: User | null
}

export function Header({ user }: HeaderProps) {
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
                onClick={() => signOut({ callbackUrl: '/' })}
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
