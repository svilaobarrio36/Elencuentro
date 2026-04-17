"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Flame } from "lucide-react";
import { FormField } from "@/components/FormField";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) {
      setError("Ingresá un email válido");
      return;
    }
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { email, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("No se pudo iniciar sesión. Intentá de nuevo.");
    } else {
      router.push("/");
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "#12191A" }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="h-9 w-9 rounded-xl bg-[#1D9E75] flex items-center justify-center">
            <Flame size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold text-[#F5F8F6]">El Encuentro</span>
        </div>

        <div className="bg-[#1A2E2A] border border-white/10 rounded-2xl p-6">
          <h1 className="text-lg font-semibold text-[#F5F8F6] mb-1">Ingresá al grupo</h1>
          <p className="text-sm text-[#B8CCC4] mb-6">
            Usá tu email para entrar. No necesitás contraseña.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <FormField label="Tu email" error={error} valid={valid && email.length > 0}>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="juan@ejemplo.com"
                className={`w-full bg-[#12191A] border rounded-xl px-3 py-2.5 text-sm text-[#F5F8F6] placeholder-[#B8CCC4]/50 outline-none transition-colors
                  ${error ? "border-[#E24B4A] focus:border-[#E24B4A]" : valid && email ? "border-[#1D9E75] focus:border-[#1D9E75]" : "border-white/10 focus:border-[#1D9E75]"}`}
                autoFocus
              />
            </FormField>

            <button
              type="submit"
              disabled={!valid || loading}
              className="w-full bg-[#1D9E75] hover:bg-[#0F6E56] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
            >
              {loading ? "Ingresando..." : "Entrar"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#B8CCC4]/60 mt-4">
          Emails demo disponibles: juan@encuentro.app, mariano@encuentro.app...
        </p>
      </div>
    </main>
  );
}
