"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Plus } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { toast } from "sonner";

interface Purchase {
  id: string;
  amount: number;
  note: string | null;
  user: { id: string; name: string };
}

interface SplitDebt {
  from: string;
  fromName: string;
  to: string;
  toName: string;
  amount: number;
}

interface SummaryData {
  eventName: string;
  members: { id: string; userId: string; user: { name: string } }[];
  purchases: Purchase[];
  total: number;
  perPerson: number;
  debts: SplitDebt[];
  myUserId: string;
}

export default function SummaryPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [data, setData] = useState<SummaryData | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newAmount, setNewAmount] = useState("");
  const [newNote, setNewNote] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetch(`/api/events/${id}/summary`)
      .then((r) => r.json())
      .then(setData);
  }, [id]);

  async function addPurchase() {
    const amount = parseFloat(newAmount.replace(/\./g, "").replace(",", "."));
    if (!amount || isNaN(amount)) { toast.error("Ingresá un monto válido"); return; }
    setAdding(true);
    try {
      const res = await fetch(`/api/events/${id}/summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, note: newNote }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setData(updated);
      setShowAdd(false);
      setNewAmount("");
      setNewNote("");
      toast.success("Gasto registrado");
    } catch {
      toast.error("No se pudo guardar");
    } finally {
      setAdding(false);
    }
  }

  if (!data) {
    return (
      <div className="flex flex-col gap-3">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-[#B8CCC4] hover:text-[#F5F8F6] p-1">
          <ChevronLeft size={22} />
        </button>
        <div>
          <h1 className="text-lg font-bold text-[#F5F8F6]">Gastos y split</h1>
          <p className="text-sm text-[#B8CCC4]">{data.eventName}</p>
        </div>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-[#1A2E2A] border border-white/10 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-[#F5F8F6] font-mono">${data.total.toLocaleString("es-AR")}</p>
          <p className="text-xs text-[#B8CCC4]">total gastado</p>
        </div>
        <div className="bg-[#1A2E2A] border border-white/10 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-[#1D9E75] font-mono">${Math.round(data.perPerson).toLocaleString("es-AR")}</p>
          <p className="text-xs text-[#B8CCC4]">por persona</p>
        </div>
      </div>

      {/* Purchases */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-[#B8CCC4]">Compras registradas</h2>
          <button
            onClick={() => setShowAdd((s) => !s)}
            className="flex items-center gap-1 text-xs text-[#1D9E75] font-medium"
          >
            <Plus size={13} /> Agregar
          </button>
        </div>

        {showAdd && (
          <div className="bg-[#1A2E2A] border border-[#1D9E75]/30 rounded-xl p-4 mb-3 flex flex-col gap-3 animate-fade-in">
            <input
              type="number"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              placeholder="Monto en $"
              className="bg-[#12191A] border border-white/10 rounded-xl px-3 py-2 text-sm text-[#F5F8F6] placeholder-[#B8CCC4]/50 outline-none focus:border-[#1D9E75]"
            />
            <input
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Descripción (opcional)"
              className="bg-[#12191A] border border-white/10 rounded-xl px-3 py-2 text-sm text-[#F5F8F6] placeholder-[#B8CCC4]/50 outline-none focus:border-[#1D9E75]"
            />
            <div className="flex gap-2">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2 rounded-xl border border-white/10 text-[#B8CCC4] text-sm">Cancelar</button>
              <button onClick={addPurchase} disabled={adding} className="flex-1 py-2 rounded-xl bg-[#1D9E75] text-white text-sm font-medium disabled:opacity-50">
                {adding ? "..." : "Guardar"}
              </button>
            </div>
          </div>
        )}

        {data.purchases.length === 0 ? (
          <div className="bg-[#1A2E2A] border border-dashed border-white/10 rounded-xl p-5 text-center">
            <p className="text-[#B8CCC4] text-sm">Nadie registró gastos todavía.</p>
          </div>
        ) : (
          <div className="bg-[#1A2E2A] border border-white/10 rounded-xl divide-y divide-white/5">
            {data.purchases.map((p) => (
              <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                <Avatar name={p.user.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#F5F8F6]">{p.user.name}</p>
                  {p.note && <p className="text-xs text-[#B8CCC4] truncate">{p.note}</p>}
                </div>
                <span className="text-sm font-semibold text-[#F5F8F6] font-mono">${p.amount.toLocaleString("es-AR")}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Debts */}
      {data.debts.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-[#B8CCC4] mb-2">¿Quién le debe a quién?</h2>
          <div className="flex flex-col gap-2">
            {data.debts.map((debt, i) => (
              <div key={i} className="bg-[#1A2E2A] border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
                <Avatar name={debt.fromName} size="sm" />
                <div className="flex-1">
                  <p className="text-sm text-[#F5F8F6]">
                    <span className="font-medium">{debt.fromName}</span>
                    <span className="text-[#B8CCC4]"> le debe a </span>
                    <span className="font-medium">{debt.toName}</span>
                  </p>
                </div>
                <span className="text-sm font-bold text-[#F2A65A] font-mono">${debt.amount.toLocaleString("es-AR")}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.purchases.length > 0 && data.debts.length === 0 && (
        <div className="bg-[#1D9E75]/10 border border-[#1D9E75]/20 rounded-xl p-4 text-center">
          <p className="text-2xl mb-1">🎉</p>
          <p className="text-sm text-[#1D9E75] font-medium">¡Todos están al día! No hay deudas pendientes.</p>
        </div>
      )}
    </div>
  );
}
