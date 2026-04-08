import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-helpers";
import { getDb, instances, eq } from "@/lib/db";
import { baileysManager } from "@/lib/whatsapp/baileys";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireUser();
    const { id } = await params;
    const db = getDb();

    // Find instance
    const instance = await db
      .select()
      .from(instances)
      .where(eq(instances.id, id))
      .limit(1);

    if (instance.length === 0) {
      return NextResponse.json(
        { error: "Instance not found" },
        { status: 404 }
      );
    }

    const inst = instance[0];

    // Verify ownership
    if (inst.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Create WhatsApp session
    const result = await baileysManager.createSession(inst.sessionName);

    // Update instance status in DB
    await db
      .update(instances)
      .set({
        status: result.status === "qr_code" ? "qr_code" : inst.status,
        updatedAt: new Date(),
      })
      .where(eq(instances.id, inst.id));

    return NextResponse.json({
      status: result.status,
      qr: result.qr || null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to connect instance" },
      { status: 500 }
    );
  }
}
