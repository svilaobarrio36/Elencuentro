"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronDown, Home, MapPin, Check } from "lucide-react";
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isBefore, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { FriendChip } from "@/components/FriendChip";
import { FormField } from "@/components/FormField";
import { Avatar } from "@/components/Avatar";
import { toast } from "sonner";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const KNOWN_LOCATIONS = [
  { name: "Casa de Juan", city: "Berazategui", owner: "Juan" },
  { name: "Casa de Mariano", city: "San Isidro", owner: "Mariano" },
  { name: "Casa de Diego", city: "Banfield", owner: "Diego" },
  { name: "Casa de Blas", city: "Villa Crespo", owner: "Blas" },
];

type StepState = {
  name: string;
  location: string;
  selectedMembers: string[];
  selectedDates: Date[];
  dietaryNotes: string;
};

export default function NewEventPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState<StepState>({
    name: "",
    location: "",
    selectedMembers: [],
    selectedDates: [],
    dietaryNotes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [locationOpen, setLocationOpen] = useState(false);
  const locationRef = useRef<HTMLDivElement>(null);

  // Calendar state
  const [calMonth, setCalMonth] = useState(new Date());

  // Fetch all users for member selection
  const { data: users } = useSWR<{ id: string; name: string; city: string; dietaryRestrictions: string }[]>("/api/users", fetcher);

  // Close location dropdown on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setLocationOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  function validate1() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "El nombre del evento es obligatorio";
    if (!form.location.trim()) e.location = "Elegí un lugar";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validate2() {
    const e: Record<string, string> = {};
    if (form.selectedMembers.length === 0) e.members = "Invitá al menos a una persona";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validate3() {
    const e: Record<string, string> = {};
    if (form.selectedDates.length < 1) e.dates = "Proponé al menos una fecha";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function nextStep() {
    if (step === 1 && !validate1()) return;
    if (step === 2 && !validate2()) return;
    if (step === 3 && !validate3()) return;
    setStep((s) => s + 1);
    setErrors({});
  }

  function prevStep() {
    setStep((s) => Math.max(1, s - 1));
    setErrors({});
  }

  function toggleDate(date: Date) {
    setForm((f) => {
      const already = f.selectedDates.some((d) => isSameDay(d, date));
      return {
        ...f,
        selectedDates: already
          ? f.selectedDates.filter((d) => !isSameDay(d, date))
          : [...f.selectedDates, date],
      };
    });
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          location: form.location,
          memberIds: form.selectedMembers,
          dates: form.selectedDates.map((d) => d.toISOString()),
          dietaryNotes: form.dietaryNotes,
        }),
      });
      if (!res.ok) throw new Error("Error al crear el evento");
      const event = await res.json();
      toast.success("¡Asado creado! Ahora votá las fechas.");
      router.push(`/events/${event.id}`);
    } catch {
      toast.error("No se pudo crear el evento.");
    } finally {
      setSubmitting(false);
    }
  }

  // Detect group dietary restrictions from selected members
  const selectedUsers = (users ?? []).filter((u) => form.selectedMembers.includes(u.id));
  const groupRestrictions = new Set(
    selectedUsers.flatMap((u) => {
      try { return JSON.parse(u.dietaryRestrictions) as string[]; } catch { return []; }
    })
  );

  // Calendar days
  const calDays = eachDayOfInterval({ start: startOfMonth(calMonth), end: endOfMonth(calMonth) });
  const firstDayOffset = (getDay(startOfMonth(calMonth)) + 6) % 7; // Mon=0
  const today = startOfDay(new Date());

  const steps = ["Detalles", "Amigos", "Fechas", "Restricciones"];

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={step > 1 ? prevStep : () => router.back()} className="text-[#B8CCC4] hover:text-[#F5F8F6] transition-colors p-1">
          <ChevronLeft size={22} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-[#F5F8F6]">Nuevo asado</h1>
          <p className="text-xs text-[#B8CCC4]">Paso {step} de 4 — {steps[step - 1]}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#1D9E75] transition-all duration-300 rounded-full"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>

      {/* Step 1: Name + Location */}
      {step === 1 && (
        <div className="flex flex-col gap-4 animate-fade-in">
          <FormField label="Nombre del evento" error={errors.name} valid={!errors.name && form.name.trim().length > 0}>
            <input
              value={form.name}
              onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setErrors((er) => ({ ...er, name: "" })); }}
              placeholder="Asado de cumpleaños, Juntada de invierno…"
              className={`w-full bg-[#12191A] border rounded-xl px-3 py-2.5 pr-10 text-sm text-[#F5F8F6] placeholder-[#B8CCC4]/50 outline-none transition-colors
                ${errors.name ? "border-[#E24B4A]" : form.name.trim() ? "border-[#1D9E75]" : "border-white/10 focus:border-[#1D9E75]"}`}
            />
          </FormField>

          <FormField label="Lugar" error={errors.location} valid={!errors.location && form.location.trim().length > 0}>
            <div ref={locationRef} className="relative">
              <button
                type="button"
                onClick={() => setLocationOpen((o) => !o)}
                className={`w-full bg-[#12191A] border rounded-xl px-3 py-2.5 text-sm text-left flex items-center justify-between transition-colors
                  ${errors.location ? "border-[#E24B4A]" : form.location ? "border-[#1D9E75]" : "border-white/10 focus:border-[#1D9E75]"}`}
              >
                <span className={form.location ? "text-[#F5F8F6]" : "text-[#B8CCC4]/50"}>
                  {form.location || "Seleccioná un lugar"}
                </span>
                <ChevronDown size={16} className={`text-[#B8CCC4] transition-transform ${locationOpen ? "rotate-180" : ""}`} />
              </button>

              {locationOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#1A2E2A] border border-white/10 rounded-xl overflow-hidden z-50 animate-slide-down">
                  {KNOWN_LOCATIONS.map((loc) => (
                    <button
                      key={loc.name}
                      type="button"
                      onClick={() => {
                        setForm((f) => ({ ...f, location: `${loc.name} – ${loc.city}` }));
                        setErrors((er) => ({ ...er, location: "" }));
                        setLocationOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
                    >
                      <Home size={16} className="text-[#1D9E75] flex-shrink-0" />
                      <div>
                        <p className="text-sm text-[#F5F8F6] font-medium">{loc.name}</p>
                        <p className="text-xs text-[#B8CCC4]">{loc.city} · de {loc.owner}</p>
                      </div>
                    </button>
                  ))}
                  <div className="border-t border-white/5">
                    <div className="flex items-center gap-3 px-4 py-2">
                      <MapPin size={14} className="text-[#B8CCC4] flex-shrink-0" />
                      <input
                        placeholder="Otro lugar..."
                        className="flex-1 bg-transparent text-sm text-[#F5F8F6] placeholder-[#B8CCC4]/50 outline-none py-1"
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </FormField>
        </div>
      )}

      {/* Step 2: Invite members */}
      {step === 2 && (
        <div className="flex flex-col gap-3 animate-fade-in">
          <p className="text-sm text-[#B8CCC4]">¿A quién invitás?</p>
          {errors.members && <p className="text-xs text-[#E24B4A] animate-fade-in">{errors.members}</p>}
          {!users ? (
            <div className="flex flex-col gap-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton h-14 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {users.map((u) => (
                <FriendChip
                  key={u.id}
                  name={u.name}
                  city={u.city}
                  selected={form.selectedMembers.includes(u.id)}
                  onToggle={() => {
                    setForm((f) => ({
                      ...f,
                      selectedMembers: f.selectedMembers.includes(u.id)
                        ? f.selectedMembers.filter((id) => id !== u.id)
                        : [...f.selectedMembers, u.id],
                    }));
                    setErrors((er) => ({ ...er, members: "" }));
                  }}
                />
              ))}
            </div>
          )}
          {form.selectedMembers.length > 0 && (
            <p className="text-xs text-[#1D9E75]">{form.selectedMembers.length} persona{form.selectedMembers.length > 1 ? "s" : ""} invitada{form.selectedMembers.length > 1 ? "s" : ""}</p>
          )}
        </div>
      )}

      {/* Step 3: Date selection calendar */}
      {step === 3 && (
        <div className="flex flex-col gap-3 animate-fade-in">
          <p className="text-sm text-[#B8CCC4]">Proponé al menos 3 fechas para que el grupo vote.</p>
          {errors.dates && <p className="text-xs text-[#E24B4A] animate-fade-in">{errors.dates}</p>}

          <div className="bg-[#1A2E2A] border border-white/10 rounded-xl p-4">
            {/* Month nav */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setCalMonth((m) => addDays(startOfMonth(m), -1))} className="text-[#B8CCC4] hover:text-[#F5F8F6] p-1">
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm font-semibold text-[#F5F8F6] capitalize">
                {format(calMonth, "MMMM yyyy", { locale: es })}
              </span>
              <button onClick={() => setCalMonth((m) => addDays(endOfMonth(m), 1))} className="text-[#B8CCC4] hover:text-[#F5F8F6] p-1">
                <ChevronDown size={18} className="-rotate-90" />
              </button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-1">
              {["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"].map((d) => (
                <div key={d} className="text-center text-xs text-[#B8CCC4] font-medium py-1">{d}</div>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-0.5">
              {Array.from({ length: firstDayOffset }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {calDays.map((day) => {
                const isPast = isBefore(day, today);
                const isSelected = form.selectedDates.some((d) => isSameDay(d, day));
                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    disabled={isPast}
                    onClick={() => toggleDate(day)}
                    className={`relative aspect-square flex flex-col items-center justify-center rounded-lg text-sm font-medium transition-all duration-150
                      ${isPast ? "opacity-20 cursor-not-allowed" : "cursor-pointer"}
                      ${isSelected ? "bg-[#1D9E75] text-white scale-105" : "hover:bg-white/5 text-[#F5F8F6]"}`}
                  >
                    {format(day, "d")}
                    {isSelected && (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {form.selectedDates.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {form.selectedDates
                .sort((a, b) => a.getTime() - b.getTime())
                .map((d) => (
                  <span key={d.toISOString()} className="text-xs bg-[#1D9E75]/20 text-[#1D9E75] px-2 py-1 rounded-lg">
                    {format(d, "d MMM", { locale: es })}
                  </span>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Step 4: Dietary restrictions summary */}
      {step === 4 && (
        <div className="flex flex-col gap-4 animate-fade-in">
          <p className="text-sm text-[#B8CCC4]">Restricciones del grupo detectadas automáticamente.</p>

          {groupRestrictions.size > 0 ? (
            <div className="flex flex-col gap-2">
              {Array.from(groupRestrictions).map((r) => {
                const member = selectedUsers.find((u) => {
                  try { return (JSON.parse(u.dietaryRestrictions) as string[]).includes(r); } catch { return false; }
                });
                return (
                  <div key={r} className="flex items-center gap-3 bg-[#F2A65A]/10 border border-[#F2A65A]/20 rounded-xl p-3">
                    <span className="text-xl">{r === "vegan" ? "🌱" : r === "gluten-free" ? "🌾" : "⚠️"}</span>
                    <div>
                      <p className="text-sm font-medium text-[#F5F8F6]">{r === "vegan" ? "Vegano" : r === "gluten-free" ? "Sin TACC" : r}</p>
                      {member && <p className="text-xs text-[#B8CCC4]">{member.name} lo necesita</p>}
                    </div>
                    <Check size={16} className="ml-auto text-[#1D9E75]" />
                  </div>
                );
              })}
              <p className="text-xs text-[#B8CCC4]">La lista de compras se adaptará automáticamente.</p>
            </div>
          ) : (
            <div className="bg-[#1A2E2A] border border-white/10 rounded-xl p-4 text-center">
              <p className="text-2xl mb-2">🥩</p>
              <p className="text-sm text-[#B8CCC4]">Sin restricciones en el grupo. ¡Todo en orden para el asado clásico!</p>
            </div>
          )}

          <FormField label="Notas adicionales (opcional)">
            <textarea
              value={form.dietaryNotes}
              onChange={(e) => setForm((f) => ({ ...f, dietaryNotes: e.target.value }))}
              placeholder="Algún invitado tiene alergia a las nueces, Diego no come cerdo..."
              rows={3}
              className="w-full bg-[#12191A] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-[#F5F8F6] placeholder-[#B8CCC4]/50 outline-none focus:border-[#1D9E75] transition-colors resize-none"
            />
          </FormField>

          {/* Summary */}
          <div className="bg-[#1A2E2A] border border-white/10 rounded-xl p-4 flex flex-col gap-2.5">
            <h3 className="text-sm font-semibold text-[#F5F8F6]">Resumen</h3>
            <div className="text-sm text-[#B8CCC4] flex flex-col gap-1">
              <p><span className="text-[#F5F8F6]">📋 </span>{form.name}</p>
              <p><span className="text-[#F5F8F6]">📍 </span>{form.location}</p>
              <p><span className="text-[#F5F8F6]">👥 </span>{form.selectedMembers.length} invitados</p>
              <p><span className="text-[#F5F8F6]">📅 </span>{form.selectedDates.length} fechas propuestas</p>
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="pt-2">
        {step < 4 ? (
          <button
            type="button"
            onClick={nextStep}
            className="w-full bg-[#1D9E75] hover:bg-[#0F6E56] text-white font-semibold py-3 rounded-xl transition-colors text-sm"
          >
            Siguiente →
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-[#1D9E75] hover:bg-[#0F6E56] disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
          >
            {submitting ? "Creando..." : "Crear asado 🔥"}
          </button>
        )}
      </div>
    </div>
  );
}
