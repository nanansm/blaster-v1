import { auth } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Megaphone, Users, MessageSquare, Smartphone } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default async function DashboardPage() {
  const session = await auth()

  // Mock data for testing
  const mockStats = {
    totalCampaigns: 12,
    activeCampaigns: 3,
    totalContacts: 2450,
    messagesSent: 8934,
    connectedInstances: 2,
  }

  const mockRecentActivity = [
    { id: 1, type: 'Campaign', name: 'Product Launch Blast', status: 'Active', sent: 1250, total: 2000, date: '2026-04-05' },
    { id: 2, type: 'Campaign', name: 'Weekly Promo', status: 'Completed', sent: 500, total: 500, date: '2026-04-04' },
    { id: 3, type: 'Campaign', name: 'Event Reminder', status: 'Draft', sent: 0, total: 800, date: '2026-04-03' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of your WhatsApp blasting campaigns
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="stat-card-header">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Megaphone className="icon-sm text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="stat-value">{mockStats.totalCampaigns}</div>
            <p className="stat-description">
              {mockStats.activeCampaigns} active campaigns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="stat-card-header">
            <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
            <Users className="icon-sm text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="stat-value">{mockStats.totalContacts.toLocaleString()}</div>
            <p className="stat-description">
              Contacts in your database
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="stat-card-header">
            <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
            <MessageSquare className="icon-sm text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="stat-value">{mockStats.messagesSent.toLocaleString()}</div>
            <p className="stat-description">
              Total messages delivered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="stat-card-header">
            <CardTitle className="text-sm font-medium">WA Instances</CardTitle>
            <Smartphone className="icon-sm text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="stat-value">{mockStats.connectedInstances}</div>
            <p className="stat-description">
              Connected WhatsApp instances
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Your latest campaigns and message activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockRecentActivity.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-info">
                  <h4 className="font-semibold">{activity.name}</h4>
                  <p className="text-sm text-muted-foreground">{activity.date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">{activity.sent} / {activity.total}</p>
                    <p className="text-xs text-muted-foreground">messages sent</p>
                  </div>
                  <Badge
                    variant={activity.status === 'Active' ? 'default' : activity.status === 'Completed' ? 'secondary' : 'outline'}
                  >
                    {activity.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
