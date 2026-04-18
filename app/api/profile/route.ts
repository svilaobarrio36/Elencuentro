export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    ...user,
    dietaryRestrictions: (() => {
      try { return JSON.parse(user.dietaryRestrictions) as string[]; } catch { return []; }
    })(),
  });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, city, dietaryRestrictions } = await req.json();

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: name?.trim() || undefined,
      city: city?.trim() || null,
      dietaryRestrictions: JSON.stringify(dietaryRestrictions ?? []),
    },
  });

  return NextResponse.json({
    ...updated,
    dietaryRestrictions: (() => {
      try { return JSON.parse(updated.dietaryRestrictions) as string[]; } catch { return []; }
    })(),
  });
}
