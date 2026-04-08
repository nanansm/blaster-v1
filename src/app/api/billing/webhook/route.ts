import { NextResponse } from "next/server";
import { getDb, subscriptions, user, eq } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { event, data } = body;

    // Verify webhook signature (optional but recommended)
    const token = process.env.XENDIT_WEBHOOK_TOKEN;
    if (token) {
      const signature = request.headers.get("x-xendit-webhook-token");
      if (signature !== token) {
        return NextResponse.json({ error: "Invalid webhook token" }, { status: 401 });
      }
    }

    const db = getDb();

    if (event === "invoice.paid") {
      const { external_id: externalId, amount, paid_at: paidAt } = data;

      if (externalId) {
        // Find user by external_id (should be user_id stored during checkout)
        const userId = externalId;

        // Update or create subscription
        await db
          .insert(subscriptions)
          .values({
            id: `sub_${Date.now()}`,
            userId,
            xenditSubscriptionId: data.id,
            status: "active",
            amount: amount || 0,
            currentPeriodEnd: paidAt
              ? new Date(new Date(paidAt).getTime() + 30 * 24 * 60 * 60 * 1000)
              : null,
          })
          .onConflictDoUpdate({
            target: [subscriptions.userId],
            set: {
              status: "active",
              amount: amount || 0,
              currentPeriodEnd: paidAt
                ? new Date(new Date(paidAt).getTime() + 30 * 24 * 60 * 60 * 1000)
                : null,
              updatedAt: new Date(),
            },
          });

        // Upgrade user plan to pro
        await db
          .update(user)
          .set({ plan: "pro", updatedAt: new Date() })
          .where(eq(user.id, userId));
      }
    }

    if (event === "invoice.expired" || event === "invoice.failed") {
      // Handle failed payments if needed
    }

    return NextResponse.json({ status: "ok" });
  } catch (error: any) {
    console.error("Xendit webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// Xendit requires GET endpoint for webhook verification
export async function GET() {
  return NextResponse.json({ status: "ok" });
}
