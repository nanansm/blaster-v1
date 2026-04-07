import { Metadata } from 'next'
import { signIn } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Sign In - Mote Blaster',
  description: 'Sign in to your Mote Blaster account',
}

export default function SignInPage() {
  return (
    <div className="signin-container">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Mote Blaster
          </CardTitle>
          <CardDescription className="text-center">
            WhatsApp Bulk Messaging Platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground mb-4">
            Click below to sign in with a test account
          </div>
          <form
            action={async () => {
              'use server'
              await signIn('credentials', { callbackUrl: '/dashboard' })
            }}
          >
            <Button type="submit" className="w-full" size="lg">
              Sign in as Test User (Admin)
            </Button>
          </form>
          <div className="text-center text-xs text-muted-foreground mt-4">
            This will sign you in with mock data for local testing
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
