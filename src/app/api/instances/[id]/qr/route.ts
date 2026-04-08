import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-helpers";
import { getDb, instances, eq } from "@/lib/db";
import { baileysManager } from "@/lib/whatsapp/baileys";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireUser();
    const { id } = await params;
    const db = getDb();

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
    if (inst.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const status = baileysManager.getSessionStatus(inst.sessionName);

    return NextResponse.json({
      status: status.status,
      qr: status.qr || null,
      phoneNumber: status.phoneNumber,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to get QR code" },
      { status: 500 }
    );
  }
}
