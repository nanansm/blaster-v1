import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-helpers";
import { getDb, campaigns, eq, desc } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await requireUser();
    const db = getDb();
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    const userCampaigns = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.userId, session.user.id))
      .orderBy(desc(campaigns.createdAt))
      .limit(limit)
      .offset(offset);

    const totalCount = await db
      .select({ count: campaigns.id })
      .from(campaigns)
      .where(eq(campaigns.userId, session.user.id));

    return NextResponse.json({
      campaigns: userCampaigns,
      pagination: {
        page,
        limit,
        total: totalCount.length,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch campaigns" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireUser();
    const db = getDb();
    const body = await request.json();

    const { name, instanceId, messageTemplate, contactSource, contacts, delayMs } =
      body;

    if (!name || !instanceId || !messageTemplate) {
      return NextResponse.json(
        { error: "Name, instanceId, and messageTemplate are required" },
        { status: 400 }
      );
    }

    const contactsList = contacts || [];
    const contactsCount = contactsList.length;

    const campaign = await db
      .insert(campaigns)
      .values({
        id: `camp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        userId: session.user.id,
        instanceId,
        name,
        messageTemplate,
        status: "draft",
        contactSource: contactSource || "csv",
        contactsCount,
        delayMs: delayMs || 1000,
      })
      .returning();

    return NextResponse.json({ campaign: campaign[0] }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create campaign" },
      { status: 500 }
    );
  }
}
