import { getSession } from "@/lib/auth-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, Send, CheckCircle, XCircle } from "lucide-react";

export default async function DashboardPage() {
  const session = await getSession();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome, {session?.user?.name}</h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s an overview of your WhatsApp blast activity.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Connections"
          value="0"
          description="Active instances"
          icon={Smartphone}
        />
        <StatCard
          title="Campaigns"
          value="0"
          description="Total campaigns"
          icon={Send}
        />
        <StatCard
          title="Messages Sent"
          value="0"
          description="Successfully delivered"
          icon={CheckCircle}
        />
        <StatCard
          title="Messages Failed"
          value="0"
          description="Failed to deliver"
          icon={XCircle}
        />
      </div>

      {/* Plan Info */}
      <Card>
        <CardHeader>
          <CardTitle>Your Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold capitalize">
                {session?.user?.plan || "free"}
              </p>
              <p className="text-sm text-muted-foreground">
                Daily limit: {session?.user?.plan === "pro" ? "Unlimited" : "50 messages/day"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
