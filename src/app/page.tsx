import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Hero */}
      <header className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
          Mote Blaster
        </h1>
        <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
          WhatsApp Blast SaaS — Send messages at scale, track delivery, and
          manage campaigns from one dashboard.
        </p>
        <div className="mt-10 flex gap-4 justify-center">
          <Link href="/login">
            <Button size="lg">Get Started</Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="outline">
              Dashboard
            </Button>
          </Link>
        </div>
      </header>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          <div className="rounded-lg border bg-card p-6 text-card-foreground">
            <h3 className="text-xl font-semibold">📱 WhatsApp Connection</h3>
            <p className="mt-2 text-muted-foreground">
              Connect via QR code scan. No API keys or phone needed.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6 text-card-foreground">
            <h3 className="text-xl font-semibold">🚀 Blast Campaigns</h3>
            <p className="mt-2 text-muted-foreground">
              Upload CSV or Google Sheets. Send personalized messages with delays.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6 text-card-foreground">
            <h3 className="text-xl font-semibold">📊 Track & Monitor</h3>
            <p className="mt-2 text-muted-foreground">
              Real-time delivery status, sent/failed counts, and daily usage limits.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Mote Blaster. All rights reserved.
      </footer>
    </div>
  );
}
