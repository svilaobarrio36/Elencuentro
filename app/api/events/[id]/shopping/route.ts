import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { generateShoppingList } from "@/lib/business";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      members: { include: { user: true } },
      shoppingList: true,
    },
  });

  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const confirmedCount = event.members.filter((m) => m.status === "CONFIRMED").length || event.members.length;

  const restrictions = event.members.flatMap((m) => {
    try { return JSON.parse(m.user.dietaryRestrictions) as string[]; } catch { return []; }
  });

  const hasVegan = restrictions.includes("vegan");
  const hasGlutenFree = restrictions.includes("gluten-free");
  const veganCount = event.members.filter((m) => {
    try { return (JSON.parse(m.user.dietaryRestrictions) as string[]).includes("vegan"); } catch { return false; }
  }).length;

  const totalPrice = event.shoppingList.reduce((s, i) => s + (i.price ?? 0), 0);
  const pricePerPerson = confirmedCount > 0 ? totalPrice / confirmedCount : 0;

  return NextResponse.json({
    eventName: event.name,
    confirmedCount,
    hasVegan,
    hasGlutenFree,
    veganCount,
    items: event.shoppingList,
    totalPrice,
    pricePerPerson,
  });
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const event = await prisma.event.findUnique({
    where: { id },
    include: { members: { include: { user: true } } },
  });

  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const confirmedCount = event.members.filter((m) => m.status === "CONFIRMED").length || event.members.length;

  const restrictions = event.members.flatMap((m) => {
    try { return JSON.parse(m.user.dietaryRestrictions) as string[]; } catch { return []; }
  });

  const hasVegan = restrictions.includes("vegan");
  const hasGlutenFree = restrictions.includes("gluten-free");
  const veganCount = event.members.filter((m) => {
    try { return (JSON.parse(m.user.dietaryRestrictions) as string[]).includes("vegan"); } catch { return false; }
  }).length;

  const generated = generateShoppingList(confirmedCount, hasVegan, hasGlutenFree, veganCount);

  // Clear existing and insert new
  await prisma.shoppingItem.deleteMany({ where: { eventId: id } });
  await prisma.shoppingItem.createMany({
    data: generated.map((item) => ({ ...item, eventId: id })),
  });

  const items = await prisma.shoppingItem.findMany({ where: { eventId: id } });
  const totalPrice = items.reduce((s, i) => s + (i.price ?? 0), 0);
  const pricePerPerson = confirmedCount > 0 ? totalPrice / confirmedCount : 0;

  return NextResponse.json({
    eventName: event.name,
    confirmedCount,
    hasVegan,
    hasGlutenFree,
    veganCount,
    items,
    totalPrice,
    pricePerPerson,
  });
}
