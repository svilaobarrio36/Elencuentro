import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { calculateSplit } from "@/lib/business";

async function getSummaryData(id: string, userId: string) {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      members: { include: { user: true } },
      purchases: { include: { user: true } },
    },
  });
  if (!event) return null;

  const memberIds = event.members.map((m) => m.userId);
  const memberNames: Record<string, string> = {};
  for (const m of event.members) memberNames[m.userId] = m.user.name;

  const { total, perPerson, debts } = calculateSplit(event.purchases, memberIds, memberNames);

  return {
    eventName: event.name,
    members: event.members,
    purchases: event.purchases,
    total,
    perPerson,
    debts,
    myUserId: userId,
  };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await getSummaryData(id, session.user.id);
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(data);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { amount, note } = await req.json();
  if (!amount || isNaN(Number(amount))) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  await prisma.purchase.create({
    data: {
      eventId: id,
      userId: session.user.id,
      amount: Number(amount),
      note: note?.trim() || null,
    },
  });

  const data = await getSummaryData(id, session.user.id);
  return NextResponse.json(data);
}
