"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, RefreshCw, Plus } from "lucide-react";
import { ShoppingItemRow } from "@/components/ShoppingItemRow";
import { toast } from "sonner";

interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  price: number | null;
  category: string;
  isVegan: boolean;
  isGlutenFree: boolean;
}

interface ShoppingData {
  eventName: string;
  confirmedCount: number;
  hasVegan: boolean;
  hasGlutenFree: boolean;
  veganCount: number;
  items: ShoppingItem[];
  totalPrice: number;
  pricePerPerson: number;
}

const CATEGORIES = ["carnes", "vegetales", "panadería", "bebidas", "condimentos"];

export default function ShoppingPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [data, setData] = useState<ShoppingData | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetch(`/api/events/${id}/shopping`)
      .then((r) => r.json())
      .then(setData);
  }, [id]);

  async function generate() {
    setGenerating(true);
    try {
      const res = await fetch(`/api/events/${id}/shopping`, { method: "POST" });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setData(updated);
      toast.success("Lista generada");
    } catch {
      toast.error("No se pudo generar la lista");
    } finally {
      setGenerating(false);
    }
  }

  if (!data) {
    return (
      <div className="flex flex-col gap-3">
        {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)}
      </div>
    );
  }

  const byCategory = CATEGORIES.reduce<Record<string, ShoppingItem[]>>((acc, cat) => {
    const items = data.items.filter((i) => i.category === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-[#B8CCC4] hover:text-[#F5F8F6] p-1">
          <ChevronLeft size={22} />
        </button>
        <div>
          <h1 className="text-lg font-bold text-[#F5F8F6]">Lista de compras</h1>
          <p className="text-sm text-[#B8CCC4]">{data.eventName}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-[#1A2E2A] border border-white/10 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-[#1D9E75]">{data.confirmedCount}</p>
          <p className="text-xs text-[#B8CCC4]">personas</p>
        </div>
        <div className="bg-[#1A2E2A] border border-white/10 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-[#F5F8F6] font-mono">${Math.round(data.totalPrice / 1000)}K</p>
          <p className="text-xs text-[#B8CCC4]">total est.</p>
        </div>
        <div className="bg-[#1A2E2A] border border-white/10 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-[#F2A65A] font-mono">${Math.round(data.pricePerPerson / 1000)}K</p>
          <p className="text-xs text-[#B8CCC4]">por persona</p>
        </div>
      </div>

      {/* Dietary flags */}
      <div className="flex gap-2 flex-wrap">
        {data.hasVegan && (
          <span className="text-xs bg-emerald-400/10 text-emerald-400 px-2 py-1 rounded-full">🌱 Opción vegana incluida</span>
        )}
        {data.hasGlutenFree && (
          <span className="text-xs bg-amber-400/10 text-amber-400 px-2 py-1 rounded-full">🌾 Sin TACC incluido</span>
        )}
      </div>

      {/* Items */}
      {data.items.length === 0 ? (
        <div className="bg-[#1A2E2A] border border-dashed border-white/10 rounded-xl p-8 text-center">
          <p className="text-3xl mb-3">🛒</p>
          <p className="text-[#B8CCC4] text-sm mb-4">
            Generá la lista automáticamente según las restricciones del grupo.
          </p>
          <button
            onClick={generate}
            disabled={generating}
            className="inline-flex items-center gap-2 bg-[#1D9E75] hover:bg-[#0F6E56] text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={generating ? "animate-spin" : ""} />
            {generating ? "Generando..." : "Generar lista"}
          </button>
        </div>
      ) : (
        <>
          {Object.entries(byCategory).map(([cat, items]) => (
            <div key={cat}>
              <h3 className="text-xs font-semibold text-[#B8CCC4] uppercase tracking-wider mb-1 capitalize">{cat}</h3>
              <div className="bg-[#1A2E2A] border border-white/10 rounded-xl px-4">
                {items.map((item) => (
                  <ShoppingItemRow key={item.id} {...item} />
                ))}
              </div>
            </div>
          ))}

          {/* Totals */}
          <div className="bg-[#1A2E2A] border border-[#1D9E75]/20 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-[#B8CCC4]">Total estimado</p>
              <p className="text-xl font-bold text-[#F5F8F6] font-mono">${data.totalPrice.toLocaleString("es-AR")}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-[#B8CCC4]">Por persona</p>
              <p className="text-xl font-bold text-[#1D9E75] font-mono">${Math.round(data.pricePerPerson).toLocaleString("es-AR")}</p>
            </div>
          </div>

          <button
            onClick={generate}
            disabled={generating}
            className="flex items-center justify-center gap-2 text-sm text-[#B8CCC4] hover:text-[#F5F8F6] transition-colors py-2"
          >
            <RefreshCw size={14} className={generating ? "animate-spin" : ""} />
            Regenerar lista
          </button>
        </>
      )}
    </div>
  );
}
