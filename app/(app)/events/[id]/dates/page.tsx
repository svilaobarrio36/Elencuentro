"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/Avatar";

interface DateOption {
  id: string;
  date: string;
  votes: { id: string; available: boolean; member: { user: { name: string } } }[];
}

interface EventData {
  id: string;
  name: string;
  members: { id: string; userId: string; user: { name: string; city: string } }[];
  dateOptions: DateOption[];
  status: string;
  myMemberId?: string;
  myVotes?: Record<string, boolean>;
}

export default function DatesPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [data, setData] = useState<EventData | null>(null);
  const [votes, setVotes] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`/api/events/${id}/dates`)
      .then((r) => r.json())
      .then((d: EventData) => {
        setData(d);
        setVotes(d.myVotes ?? {});
      });
  }, [id]);

  async function saveVotes() {
    setSaving(true);
    try {
      const res = await fetch(`/api/events/${id}/dates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ votes }),
      });
      if (!res.ok) throw new Error();
      toast.success("Votos guardados");
      setSaved(true);
    } catch {
      toast.error("No se pudo guardar");
    } finally {
      setSaving(false);
    }
  }

  if (!data) {
    return (
      <div className="flex flex-col gap-3">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
      </div>
    );
  }

  const hasAllVoted = data.dateOptions.length > 0 && Object.keys(votes).length === data.dateOptions.length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-[#B8CCC4] hover:text-[#F5F8F6] p-1">
          <ChevronLeft size={22} />
        </button>
        <div>
          <h1 className="text-lg font-bold text-[#F5F8F6]">Votá las fechas</h1>
          <p className="text-sm text-[#B8CCC4]">{data.name}</p>
        </div>
      </div>

      <p className="text-sm text-[#B8CCC4]">Marcá en cuáles fechas podés venir.</p>

      {data.dateOptions.map((opt) => {
        const myVote = votes[opt.id];
        const availCount = opt.votes.filter((v) => v.available).length;
        const totalMembers = data.members.length;

        return (
          <div key={opt.id} className="bg-[#1A2E2A] border border-white/10 rounded-xl overflow-hidden">
            <div className="flex items-center gap-3 p-4">
              <div className="flex-1">
                <p className="font-semibold text-[#F5F8F6] capitalize">
                  {format(new Date(opt.date), "EEEE d 'de' MMMM", { locale: es })}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-1.5 bg-white/5 rounded-full flex-1 overflow-hidden">
                    <div
                      className="h-full bg-[#1D9E75] rounded-full transition-all duration-300"
                      style={{ width: totalMembers ? `${(availCount / totalMembers) * 100}%` : "0%" }}
                    />
                  </div>
                  <span className="text-xs text-[#B8CCC4]">{availCount}/{totalMembers} pueden</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setVotes((v) => ({ ...v, [opt.id]: false }))}
                  className={`h-9 w-9 rounded-xl flex items-center justify-center transition-all ${myVote === false ? "bg-[#E24B4A] text-white" : "bg-white/5 text-[#B8CCC4] hover:bg-white/10"}`}
                >
                  <X size={16} />
                </button>
                <button
                  onClick={() => setVotes((v) => ({ ...v, [opt.id]: true }))}
                  className={`h-9 w-9 rounded-xl flex items-center justify-center transition-all ${myVote === true ? "bg-[#1D9E75] text-white" : "bg-white/5 text-[#B8CCC4] hover:bg-white/10"}`}
                >
                  <Check size={16} />
                </button>
              </div>
            </div>

            {/* Who voted available */}
            {opt.votes.filter((v) => v.available).length > 0 && (
              <div className="px-4 pb-3 flex items-center gap-1.5">
                <div className="flex -space-x-1.5">
                  {opt.votes.filter((v) => v.available).map((v) => (
                    <Avatar key={v.id} name={v.member.user.name} size="sm" className="ring-2 ring-[#1A2E2A]" />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}

      <button
        onClick={saveVotes}
        disabled={!hasAllVoted || saving || saved}
        className="w-full bg-[#1D9E75] hover:bg-[#0F6E56] disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
      >
        {saved ? "✓ Votos guardados" : saving ? "Guardando..." : hasAllVoted ? "Guardar mis votos" : "Votá todas las fechas para continuar"}
      </button>
    </div>
  );
}
