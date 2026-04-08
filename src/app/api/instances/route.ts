import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-helpers";
import { getDb, instances, eq, createId } from "@/lib/db";

export async function GET() {
  try {
    const session = await requireUser();
    const db = getDb();

    const userInstances = await db
      .select()
      .from(instances)
      .where(eq(instances.userId, session.user.id))
      .orderBy(instances.createdAt);

    return NextResponse.json({ instances: userInstances });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch instances" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireUser();
    const db = getDb();

    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Instance name is required" },
        { status: 400 }
      );
    }

    // Generate unique session name
    const sessionName = `${session.user.id}_${createId().slice(0, 8)}`.toLowerCase();

    const newInstance = await db
      .insert(instances)
      .values({
        id: `inst_${createId()}`,
        userId: session.user.id,
        name,
        sessionName,
        status: "disconnected",
      })
      .returning();

    return NextResponse.json({ instance: newInstance[0] }, { status: 201 });
  } catch (error: any) {
    if (error.message?.includes("unique")) {
      return NextResponse.json(
        { error: "Instance with this name already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to create instance" },
      { status: 500 }
    );
  }
}
