import { PrismaClient } from "@prisma/client";
import { subDays, addDays } from "date-fns";

function createClient() {
  if (process.env.TURSO_DATABASE_URL) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaLibSQL } = require("@prisma/adapter-libsql");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createClient } = require("@libsql/client");
    const turso = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN ?? "",
    });
    return new PrismaClient({ adapter: new PrismaLibSQL(turso) } as any);
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const path = require("path");
  const adapter = new PrismaBetterSqlite3({ url: path.resolve(process.cwd(), "dev.db") });
  return new PrismaClient({ adapter } as any);
}

const prisma = createClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.dateVote.deleteMany();
  await prisma.dateOption.deleteMany();
  await prisma.shoppingItem.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.eventMember.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const juan = await prisma.user.create({
    data: {
      name: "Juan",
      email: "juan@encuentro.app",
      city: "Berazategui",
      dietaryRestrictions: "[]",
    },
  });

  const mariano = await prisma.user.create({
    data: {
      name: "Mariano",
      email: "mariano@encuentro.app",
      city: "San Isidro",
      dietaryRestrictions: "[]",
    },
  });

  const nicolasR = await prisma.user.create({
    data: {
      name: "Nicolás R.",
      email: "nicolas.r@encuentro.app",
      city: "Recoleta",
      dietaryRestrictions: '["vegan"]',
    },
  });

  const rafael = await prisma.user.create({
    data: {
      name: "Rafael",
      email: "rafael@encuentro.app",
      city: "Córdoba",
      dietaryRestrictions: "[]",
    },
  });

  const diego = await prisma.user.create({
    data: {
      name: "Diego",
      email: "diego@encuentro.app",
      city: "Banfield",
      dietaryRestrictions: "[]",
    },
  });

  const blas = await prisma.user.create({
    data: {
      name: "Blas",
      email: "blas@encuentro.app",
      city: "Villa Crespo",
      dietaryRestrictions: "[]",
    },
  });

  const nicolasF = await prisma.user.create({
    data: {
      name: "Nicolás F.",
      email: "nicolas.f@encuentro.app",
      city: "La Plata",
      dietaryRestrictions: "[]",
    },
  });

  console.log("✅ Users created");

  // Event 1: Asado de enero — COMPLETED, 92 days ago
  const enero = await prisma.event.create({
    data: {
      name: "Asado de enero",
      hostId: juan.id,
      location: "Casa de Juan – Berazategui",
      date: subDays(new Date(), 92),
      status: "COMPLETED",
      createdAt: subDays(new Date(), 95),
    },
  });

  const allUsers = [juan, mariano, nicolasR, rafael, diego, blas, nicolasF];
  for (const u of allUsers) {
    await prisma.eventMember.create({
      data: {
        userId: u.id,
        eventId: enero.id,
        role: u.id === juan.id ? "ORGANIZER" : "GUEST",
        status: "CONFIRMED",
      },
    });
  }

  // Shopping items for enero
  await prisma.shoppingItem.createMany({
    data: [
      { eventId: enero.id, name: "Asado de tira", quantity: "2.8 kg", price: 6500, category: "carnes", isVegan: false, isGlutenFree: true },
      { eventId: enero.id, name: "Chorizo", quantity: "1.4 kg", price: 2800, category: "carnes", isVegan: false, isGlutenFree: true },
      { eventId: enero.id, name: "Hamburguesa de garbanzo", quantity: "4 u.", price: 1200, category: "carnes", isVegan: true, isGlutenFree: true },
      { eventId: enero.id, name: "Pan de mesa", quantity: "2 u.", price: 800, category: "panadería", isVegan: true, isGlutenFree: false },
      { eventId: enero.id, name: "Cerveza", quantity: "12 u.", price: 3600, category: "bebidas", isVegan: true, isGlutenFree: true },
      { eventId: enero.id, name: "Agua mineral", quantity: "3 x 1.5L", price: 900, category: "bebidas", isVegan: true, isGlutenFree: true },
      { eventId: enero.id, name: "Chimichurri", quantity: "1 frasco", price: 650, category: "condimentos", isVegan: true, isGlutenFree: true },
      { eventId: enero.id, name: "Sal parrillera", quantity: "1 kg", price: 400, category: "condimentos", isVegan: true, isGlutenFree: true },
    ],
  });

  // Purchases for enero
  await prisma.purchase.create({ data: { eventId: enero.id, userId: juan.id, amount: 9300, note: "Carnes y condimentos" } });
  await prisma.purchase.create({ data: { eventId: enero.id, userId: mariano.id, amount: 4500, note: "Bebidas" } });
  await prisma.purchase.create({ data: { eventId: enero.id, userId: diego.id, amount: 2000, note: "Pan y extras" } });

  console.log("✅ Evento Asado de enero (COMPLETED) creado");

  // Event 2: Asado de mayo — PENDING_DATES
  const mayo = await prisma.event.create({
    data: {
      name: "Asado de mayo",
      hostId: juan.id,
      location: "Casa de Mariano – San Isidro",
      status: "PENDING_DATES",
      createdAt: subDays(new Date(), 2),
    },
  });

  // Add members
  const mayoMembers: Record<string, string> = {};
  for (const u of allUsers) {
    const m = await prisma.eventMember.create({
      data: {
        userId: u.id,
        eventId: mayo.id,
        role: u.id === juan.id ? "ORGANIZER" : "GUEST",
        status: u.id === juan.id ? "CONFIRMED" : "PENDING",
      },
    });
    mayoMembers[u.id] = m.id;
  }

  // Date options for mayo
  const dateOpts = [
    addDays(new Date(), 10),
    addDays(new Date(), 17),
    addDays(new Date(), 24),
  ];

  const createdOpts: string[] = [];
  for (const d of dateOpts) {
    const opt = await prisma.dateOption.create({
      data: { eventId: mayo.id, date: d },
    });
    createdOpts.push(opt.id);
  }

  // Vote data: simulate some members voted
  const voteMatrix: Record<string, boolean[]> = {
    [juan.id]: [true, false, true],
    [mariano.id]: [true, true, false],
    [nicolasR.id]: [false, true, true],
    [diego.id]: [true, true, true],
    [blas.id]: [false, false, true],
  };

  for (const [userId, votes] of Object.entries(voteMatrix)) {
    const memberId = mayoMembers[userId];
    for (let i = 0; i < createdOpts.length; i++) {
      await prisma.dateVote.create({
        data: {
          memberId,
          dateOptionId: createdOpts[i],
          available: votes[i],
        },
      });
    }
  }

  console.log("✅ Evento Asado de mayo (PENDING_DATES) creado");
  console.log("🎉 Seed completo. Han pasado 92 días desde el último asado.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
