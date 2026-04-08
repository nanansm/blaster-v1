import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-helpers";
import { getDb, instances, eq } from "@/lib/db";
import { baileysManager } from "@/lib/whatsapp/baileys";

export async function DELETE(
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

    // Logout WhatsApp session
    await baileysManager.logoutSession(inst.sessionName);

    // Delete from DB
    await db.delete(instances).where(eq(instances.id, inst.id));

    return NextResponse.json({ message: "Instance deleted" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete instance" },
      { status: 500 }
    );
  }
}
