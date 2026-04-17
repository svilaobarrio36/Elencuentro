// ── Best Date Algorithm ──────────────────────────────────────────────────────

export interface DateOptionWithVotes {
  id: string;
  date: Date;
  votes: { available: boolean }[];
}

export function getBestDate(dateOptions: DateOptionWithVotes[]): DateOptionWithVotes | null {
  if (!dateOptions.length) return null;
  return [...dateOptions].sort(
    (a, b) =>
      b.votes.filter((v) => v.available).length -
      a.votes.filter((v) => v.available).length
  )[0];
}

// ── Shopping List Generator ──────────────────────────────────────────────────

export interface GeneratedShoppingItem {
  name: string;
  quantity: string;
  price: number;
  category: string;
  isVegan: boolean;
  isGlutenFree: boolean;
}

export function generateShoppingList(
  attendeeCount: number,
  hasVegan: boolean,
  hasGlutenFree: boolean,
  veganCount: number = 0
): GeneratedShoppingItem[] {
  const items: GeneratedShoppingItem[] = [];

  // Carnes — 400g por persona no vegano
  const meatEaters = attendeeCount - veganCount;
  if (meatEaters > 0) {
    const meatKg = (meatEaters * 0.4).toFixed(1);
    items.push({ name: "Asado de tira", quantity: `${meatKg} kg`, price: Math.round(meatEaters * 0.4 * 3800), category: "carnes", isVegan: false, isGlutenFree: true });
    items.push({ name: "Chorizo", quantity: `${meatEaters} u.`, price: meatEaters * 600, category: "carnes", isVegan: false, isGlutenFree: true });
  }

  // Veganos
  if (hasVegan && veganCount > 0) {
    items.push({ name: "Hamburguesa de garbanzo", quantity: `${veganCount * 2} u.`, price: veganCount * 800, category: "carnes", isVegan: true, isGlutenFree: true });
    items.push({ name: "Verduras para asar", quantity: "1 kg", price: 1200, category: "vegetales", isVegan: true, isGlutenFree: true });
  }

  // Pan
  if (hasGlutenFree) {
    items.push({ name: "Pan sin TACC", quantity: `${Math.ceil(attendeeCount / 4)} u.`, price: Math.ceil(attendeeCount / 4) * 900, category: "panadería", isVegan: true, isGlutenFree: true });
    if (meatEaters > 0) {
      items.push({ name: "Pan común", quantity: `${Math.ceil(meatEaters / 4)} u.`, price: Math.ceil(meatEaters / 4) * 600, category: "panadería", isVegan: true, isGlutenFree: false });
    }
  } else {
    items.push({ name: "Pan de mesa", quantity: `${Math.ceil(attendeeCount / 4)} u.`, price: Math.ceil(attendeeCount / 4) * 600, category: "panadería", isVegan: true, isGlutenFree: false });
  }

  // Bebidas — 1 cerveza + 0.5L agua por persona
  items.push({ name: "Cerveza", quantity: `${attendeeCount} u.`, price: attendeeCount * 500, category: "bebidas", isVegan: true, isGlutenFree: true });
  items.push({ name: "Agua mineral 1.5L", quantity: `${Math.ceil(attendeeCount * 0.5 / 1.5)} u.`, price: Math.ceil(attendeeCount * 0.5 / 1.5) * 450, category: "bebidas", isVegan: true, isGlutenFree: true });
  items.push({ name: "Gaseosa 2.25L", quantity: `${Math.ceil(attendeeCount / 4)} u.`, price: Math.ceil(attendeeCount / 4) * 800, category: "bebidas", isVegan: true, isGlutenFree: true });

  // Condimentos
  items.push({ name: "Sal parrillera", quantity: "500g", price: 400, category: "condimentos", isVegan: true, isGlutenFree: true });
  items.push({ name: "Chimichurri", quantity: "1 frasco", price: 700, category: "condimentos", isVegan: true, isGlutenFree: true });
  items.push({ name: "Limones", quantity: "6 u.", price: 300, category: "condimentos", isVegan: true, isGlutenFree: true });

  return items;
}

// ── Split Calculator ─────────────────────────────────────────────────────────

export interface Purchase {
  userId: string;
  amount: number;
  user: { name: string };
}

export interface Debt {
  from: string;
  fromName: string;
  to: string;
  toName: string;
  amount: number;
}

export function calculateSplit(purchases: Purchase[], memberIds: string[], memberNames: Record<string, string>): {
  total: number;
  perPerson: number;
  paid: Record<string, number>;
  debts: Debt[];
} {
  const total = purchases.reduce((s, p) => s + p.amount, 0);
  const perPerson = memberIds.length > 0 ? total / memberIds.length : 0;

  const paid: Record<string, number> = {};
  for (const id of memberIds) paid[id] = 0;
  for (const p of purchases) {
    paid[p.userId] = (paid[p.userId] ?? 0) + p.amount;
  }

  // balances: positive = owed money, negative = owes money
  const balance: Record<string, number> = {};
  for (const id of memberIds) balance[id] = (paid[id] ?? 0) - perPerson;

  // Greedy debt simplification
  const creditors = Object.entries(balance).filter(([, b]) => b > 0.01).sort((a, b) => b[1] - a[1]);
  const debtors  = Object.entries(balance).filter(([, b]) => b < -0.01).sort((a, b) => a[1] - b[1]);

  const debts: Debt[] = [];
  let ci = 0, di = 0;
  const cBal = creditors.map(([id, b]) => ({ id, b }));
  const dBal = debtors.map(([id, b]) => ({ id, b: Math.abs(b) }));

  while (ci < cBal.length && di < dBal.length) {
    const settle = Math.min(cBal[ci].b, dBal[di].b);
    if (settle > 0.01) {
      debts.push({
        from: dBal[di].id,
        fromName: memberNames[dBal[di].id] ?? dBal[di].id,
        to: cBal[ci].id,
        toName: memberNames[cBal[ci].id] ?? cBal[ci].id,
        amount: Math.round(settle),
      });
    }
    cBal[ci].b -= settle;
    dBal[di].b -= settle;
    if (cBal[ci].b < 0.01) ci++;
    if (dBal[di].b < 0.01) di++;
  }

  return { total, perPerson, paid, debts };
}
