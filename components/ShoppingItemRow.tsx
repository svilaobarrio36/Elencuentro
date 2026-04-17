"use client";

import { Leaf, Wheat } from "lucide-react";

interface ShoppingItemRowProps {
  name: string;
  quantity: string;
  price?: number | null;
  category: string;
  isVegan: boolean;
  isGlutenFree: boolean;
}

const categoryColors: Record<string, string> = {
  carnes: "text-rose-400",
  vegetales: "text-emerald-400",
  bebidas: "text-blue-400",
  condimentos: "text-amber-400",
  panadería: "text-orange-400",
};

export function ShoppingItemRow({ name, quantity, price, category, isVegan, isGlutenFree }: ShoppingItemRowProps) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/5 last:border-b-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[#F5F8F6] text-sm font-medium">{name}</span>
          {isVegan && (
            <span className="flex items-center gap-0.5 text-xs text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded-full">
              <Leaf size={10} /> vegano
            </span>
          )}
          {isGlutenFree && (
            <span className="flex items-center gap-0.5 text-xs text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded-full">
              <Wheat size={10} /> sin TACC
            </span>
          )}
        </div>
        <span className={`text-xs ${categoryColors[category] ?? "text-[#B8CCC4]"}`}>{category}</span>
      </div>
      <span className="text-[#B8CCC4] text-sm flex-shrink-0">{quantity}</span>
      {price != null && (
        <span className="text-[#1D9E75] text-sm font-medium flex-shrink-0 font-mono">
          ${price.toLocaleString("es-AR")}
        </span>
      )}
    </div>
  );
}
