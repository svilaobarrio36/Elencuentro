import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { memberId, votes } = await req.json() as {
    memberId: string;
    votes: Record<string, boolean>;
  };

  // Verify member belongs to this event
  const member = await prisma.eventMember.findFirst({
    where: { id: memberId, eventId: id },
  });
  if (!member) return NextResponse.json({ error: "Invalid member" }, { status: 403 });

  for (const [dateOptionId, available] of Object.entries(votes)) {
    const existing = await prisma.dateVote.findFirst({
      where: { memberId, dateOptionId },
    });
    if (existing) {
      await prisma.dateVote.update({ where: { id: existing.id }, data: { available } });
    } else {
      await prisma.dateVote.create({ data: { memberId, dateOptionId, available } });
    }
  }

  await prisma.eventMember.update({
    where: { id: memberId },
    data: { status: "CONFIRMED" },
  });

  return NextResponse.json({ ok: true });
}
