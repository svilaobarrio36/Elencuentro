export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const memberships = await prisma.eventMember.findMany({
    where: { userId: session.user.id },
    include: {
      event: {
        include: { members: true },
      },
    },
    orderBy: { event: { createdAt: "desc" } },
  });

  return NextResponse.json(memberships.map((m) => m.event));
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, location, memberIds, dates, dietaryNotes } = await req.json();

  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const event = await prisma.event.create({
    data: {
      name: name.trim(),
      hostId: session.user.id,
      location: location?.trim() || null,
      status: "PENDING_DATES",
      dietaryNotes: dietaryNotes?.trim() || null,
      members: {
        create: [
          { userId: session.user.id, role: "ORGANIZER", status: "CONFIRMED" },
          ...(memberIds ?? []).map((uid: string) => ({
            userId: uid,
            role: "GUEST",
            status: "PENDING",
          })),
        ],
      },
      dateOptions: {
        create: (dates ?? []).map((d: string) => ({ date: new Date(d) })),
      },
    },
  });

  return NextResponse.json(event, { status: 201 });
}
