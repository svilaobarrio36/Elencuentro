import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const dateOptionId = body?.dateOptionId;

  if (!dateOptionId) return NextResponse.json({ error: "dateOptionId required" }, { status: 400 });

  // Check organizer
  const member = await prisma.eventMember.findFirst({
    where: { eventId: id, userId: session.user.id, role: "ORGANIZER" },
  });
  if (!member) return NextResponse.json({ error: "Not organizer" }, { status: 403 });

  const dateOption = await prisma.dateOption.findUnique({ where: { id: dateOptionId } });
  if (!dateOption) return NextResponse.json({ error: "Date option not found" }, { status: 404 });

  await prisma.event.update({
    where: { id },
    data: { date: dateOption.date, status: "DATE_CONFIRMED" },
  });

  return NextResponse.json({ ok: true });
}
