export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      members: { include: { user: true } },
      dateOptions: {
        include: {
          votes: { include: { member: { include: { user: true } } } },
        },
      },
    },
  });

  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Find the current user's member record
  const myMember = session?.user?.id
    ? event.members.find((m) => m.userId === session.user!.id)
    : null;

  // Collect my existing votes
  const myVotes: Record<string, boolean> = {};
  if (myMember) {
    for (const opt of event.dateOptions) {
      const vote = opt.votes.find((v) => v.memberId === myMember.id);
      if (vote) myVotes[opt.id] = vote.available;
    }
  }

  return NextResponse.json({
    id: event.id,
    name: event.name,
    status: event.status,
    members: event.members,
    dateOptions: event.dateOptions,
    myMemberId: myMember?.id ?? null,
    myVotes,
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { votes } = await req.json() as { votes: Record<string, boolean> };

  const member = await prisma.eventMember.findFirst({
    where: { eventId: id, userId: session.user.id },
  });
  if (!member) return NextResponse.json({ error: "Not a member" }, { status: 403 });

  // Upsert votes
  for (const [dateOptionId, available] of Object.entries(votes)) {
    const existing = await prisma.dateVote.findFirst({
      where: { memberId: member.id, dateOptionId },
    });
    if (existing) {
      await prisma.dateVote.update({ where: { id: existing.id }, data: { available } });
    } else {
      await prisma.dateVote.create({ data: { memberId: member.id, dateOptionId, available } });
    }
  }

  // Update member status
  await prisma.eventMember.update({
    where: { id: member.id },
    data: { status: "CONFIRMED" },
  });

  return NextResponse.json({ ok: true });
}
