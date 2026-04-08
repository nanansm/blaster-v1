import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-helpers";
import { getDb, campaigns, contacts, instances, eq } from "@/lib/db";
import { getBlastQueue } from "@/lib/queue";
import { baileysManager } from "@/lib/whatsapp/baileys";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireUser();
    const { id } = await params;
    const db = getDb();

    // Find campaign
    const campaignResult = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.id, id))
      .limit(1);

    if (campaignResult.length === 0) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    const campaign = campaignResult[0];

    // Verify ownership
    if (campaign.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Verify campaign is in draft status
    if (campaign.status !== "draft") {
      return NextResponse.json(
        { error: "Campaign can only be started from draft status" },
        { status: 400 }
      );
    }

    // Find instance
    const instanceResult = await db
      .select()
      .from(instances)
      .where(eq(instances.id, campaign.instanceId))
      .limit(1);

    if (instanceResult.length === 0) {
      return NextResponse.json(
        { error: "Instance not found" },
        { status: 404 }
      );
    }

    const instance = instanceResult[0];

    // Check if WhatsApp session is connected
    if (!baileysManager.isConnected(instance.sessionName)) {
      return NextResponse.json(
        { error: "WhatsApp session is not connected. Please scan QR code first." },
        { status: 400 }
      );
    }

    // Get contacts for this campaign
    const contactsList = await db
      .select()
      .from(contacts)
      .where(eq(contacts.campaignId, campaign.id));

    if (contactsList.length === 0) {
      return NextResponse.json(
        { error: "No contacts found for this campaign" },
        { status: 400 }
      );
    }

    // Update campaign status
    await db
      .update(campaigns)
      .set({
        status: "running",
        updatedAt: new Date(),
      })
      .where(eq(campaigns.id, campaign.id));

    // Add jobs to queue
    const queue = getBlastQueue();
    const jobPromises = contactsList.map((contact, index) => {
      return queue.add(
        `blast_${campaign.id}_${contact.id}`,
        {
          sessionName: instance.sessionName,
          contactId: contact.id,
          phone: contact.phone,
          name: contact.name,
          variables: contact.variables || {},
          messageTemplate: campaign.messageTemplate,
          campaignId: campaign.id,
          userId: campaign.userId,
          delayMs: campaign.delayMs || 1000,
        },
        {
          delay: index * (campaign.delayMs || 1000),
        }
      );
    });

    await Promise.all(jobPromises);

    return NextResponse.json({
      message: `Campaign started with ${contactsList.length} contacts`,
      contactsCount: contactsList.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to start campaign" },
      { status: 500 }
    );
  }
}
