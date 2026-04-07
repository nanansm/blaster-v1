import { auth } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DollarSign, Users, TrendingUp, Activity, Server } from 'lucide-react'

export default async function AdminPage() {
  const session = await auth()

  // Mock data for testing
  const mockFinancialData = {
    mrr: 2500000,
    pendingInvoices: 5,
    totalUsers: 156,
    proUsers: 12,
    freeUsers: 144,
  }

  const mockQueueStatus = {
    pending: 23,
    active: 5,
    failed: 2,
  }

  const mockRecentUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', plan: 'PRO', date: '2026-04-05' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', plan: 'FREE', date: '2026-04-04' },
    { id: 3, name: 'Bob Wilson', email: 'bob@example.com', plan: 'PRO', date: '2026-04-03' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', plan: 'FREE', date: '2026-04-02' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
        <p className="text-muted-foreground">
          Monitor system health and business metrics
        </p>
      </div>

      {/* Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="stat-card-header">
            <CardTitle className="text-sm font-medium">Monthly Revenue (MRR)</CardTitle>
            <DollarSign className="icon-sm text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="stat-value">Rp {mockFinancialData.mrr.toLocaleString()}</div>
            <p className="stat-description">
              Active subscriptions this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="stat-card-header">
            <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
            <TrendingUp className="icon-sm text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="stat-value">{mockFinancialData.pendingInvoices}</div>
            <p className="stat-description">
              Unpaid Pro subscriptions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="stat-card-header">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="icon-sm text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="stat-value">{mockFinancialData.totalUsers}</div>
            <p className="stat-description">
              Registered users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="stat-card-header">
            <CardTitle className="text-sm font-medium">Pro vs Free Ratio</CardTitle>
            <Activity className="icon-sm text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="stat-value">{mockFinancialData.proUsers}:{mockFinancialData.freeUsers}</div>
            <p className="stat-description">
              Pro to Free users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Queue Status</CardTitle>
            <CardDescription>BullMQ message queue status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="queue-status">
              <span className="text-sm">Pending Jobs</span>
              <Badge variant="secondary">{mockQueueStatus.pending}</Badge>
            </div>
            <div className="queue-status">
              <span className="text-sm">Active Jobs</span>
              <Badge variant="default">{mockQueueStatus.active}</Badge>
            </div>
            <div className="queue-status">
              <span className="text-sm">Failed Jobs</span>
              <Badge variant="destructive">{mockQueueStatus.failed}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>WPPConnect Status</CardTitle>
            <CardDescription>WhatsApp API connection status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="wppconnect-status">
              <div className="text-center">
                <Server className="icon-lg text-green-500 mx-auto mb-2" />
                <div className="text-lg font-semibold text-green-600">Online</div>
                <p className="text-sm text-muted-foreground">
                  WPPConnect server is connected
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Users */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Users</CardTitle>
          <CardDescription>Latest registered users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockRecentUsers.map((user) => (
              <div key={user.id} className="activity-item">
                <div className="activity-info">
                  <h4 className="font-semibold">{user.name}</h4>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={user.plan === 'PRO' ? 'default' : 'outline'}>
                    {user.plan}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{user.date}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
