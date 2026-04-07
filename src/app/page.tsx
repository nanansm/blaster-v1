import Link from 'next/link'

export default function Home() {
  return (
    <main className="homepage-container">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          Mote Blaster
        </h1>
        <p className="text-center text-lg mb-8">
          WhatsApp Bulk Messaging Platform
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/signin" className="btn btn-primary btn-lg">
            Get Started
          </Link>
          <Link href="/dashboard" className="btn btn-outline btn-lg">
            Dashboard
          </Link>
        </div>
      </div>
    </main>
  )
}
