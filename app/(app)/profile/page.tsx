"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Avatar } from "@/components/Avatar";
import { LogOut, Save } from "lucide-react";
import { toast } from "sonner";
import { FormField } from "@/components/FormField";

const DIETARY_OPTIONS = [
  { value: "vegan", label: "Vegano", emoji: "🌱" },
  { value: "vegetarian", label: "Vegetariano", emoji: "🥦" },
  { value: "gluten-free", label: "Sin TACC", emoji: "🌾" },
  { value: "no-pork", label: "Sin cerdo", emoji: "🐷" },
  { value: "lactose-free", label: "Sin lactosa", emoji: "🥛" },
];

interface Profile {
  name: string;
  email: string;
  city: string;
  dietaryRestrictions: string[];
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);
  const [cityError, setCityError] = useState("");

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => setProfile({ ...d, dietaryRestrictions: d.dietaryRestrictions ?? [] }));
  }, []);

  function toggleDiet(v: string) {
    setProfile((p) => {
      if (!p) return p;
      const has = p.dietaryRestrictions.includes(v);
      return {
        ...p,
        dietaryRestrictions: has ? p.dietaryRestrictions.filter((x) => x !== v) : [...p.dietaryRestrictions, v],
      };
    });
  }

  async function save() {
    if (!profile) return;
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          city: profile.city,
          dietaryRestrictions: profile.dietaryRestrictions,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Perfil actualizado");
    } catch {
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  if (!profile) {
    return (
      <div className="flex flex-col gap-3">
        <div className="skeleton h-24 rounded-xl" />
        <div className="skeleton h-12 rounded-xl" />
        <div className="skeleton h-12 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-bold text-[#F5F8F6]">Mi perfil</h1>

      {/* Avatar */}
      <div className="bg-[#1A2E2A] border border-white/10 rounded-xl p-4 flex items-center gap-4">
        <Avatar name={profile.name} size="lg" />
        <div>
          <p className="font-semibold text-[#F5F8F6]">{profile.name}</p>
          <p className="text-sm text-[#B8CCC4]">{profile.email}</p>
        </div>
      </div>

      {/* Name */}
      <FormField label="Nombre" valid={profile.name.trim().length > 0}>
        <input
          value={profile.name}
          onChange={(e) => setProfile((p) => p ? { ...p, name: e.target.value } : p)}
          className="w-full bg-[#12191A] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-[#F5F8F6] outline-none focus:border-[#1D9E75] transition-colors"
        />
      </FormField>

      {/* City */}
      <FormField label="Ciudad" error={cityError} valid={!cityError && profile.city?.trim().length > 0}>
        <input
          value={profile.city ?? ""}
          onChange={(e) => {
            setProfile((p) => p ? { ...p, city: e.target.value } : p);
            setCityError("");
          }}
          placeholder="Buenos Aires, Córdoba..."
          className={`w-full bg-[#12191A] border rounded-xl px-3 py-2.5 text-sm text-[#F5F8F6] placeholder-[#B8CCC4]/50 outline-none focus:border-[#1D9E75] transition-colors
            ${cityError ? "border-[#E24B4A]" : profile.city?.trim() ? "border-[#1D9E75]" : "border-white/10"}`}
        />
      </FormField>

      {/* Dietary restrictions */}
      <div>
        <p className="text-sm font-medium text-[#B8CCC4] mb-2">Restricciones alimentarias</p>
        <div className="flex flex-col gap-2">
          {DIETARY_OPTIONS.map((opt) => {
            const active = profile.dietaryRestrictions.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleDiet(opt.value)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left
                  ${active ? "border-[#1D9E75] bg-[#1D9E75]/10" : "border-white/10 bg-[#1A2E2A] hover:border-white/20"}`}
              >
                <span className="text-xl">{opt.emoji}</span>
                <span className="text-sm font-medium text-[#F5F8F6]">{opt.label}</span>
                {active && <span className="ml-auto text-[#1D9E75]">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Save */}
      <button
        onClick={save}
        disabled={saving}
        className="flex items-center justify-center gap-2 w-full bg-[#1D9E75] hover:bg-[#0F6E56] disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
      >
        <Save size={15} />
        {saving ? "Guardando..." : "Guardar cambios"}
      </button>

      {/* Sign out */}
      <button
        onClick={() => signOut({ callbackUrl: "/auth/signin" })}
        className="flex items-center justify-center gap-2 text-sm text-[#B8CCC4] hover:text-[#F5F8F6] transition-colors py-2"
      >
        <LogOut size={15} />
        Cerrar sesión
      </button>
    </div>
  );
}
