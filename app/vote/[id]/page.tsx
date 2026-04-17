"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Flame, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/Avatar";

interface DateOption {
  id: string;
  date: string;
  votes: { id: string; available: boolean; member: { user: { name: string } } }[];
}

interface VotePageData {
  id: string;
  name: string;
  location: string | null;
  members: { id: string; userId: string; user: { name: string; city: string } }[];
  dateOptions: DateOption[];
}

export default function PublicVotePage() {
  const params = useParams();
  const id = params.id as string;

  const [data, setData] = useState<VotePageData | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [votes, setVotes] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch(`/api/events/${id}/dates`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        if (d.myMemberId) {
          setSelectedMemberId(d.myMemberId);
          setVotes(d.myVotes ?? {});
        }
      });
  }, [id]);

  async function saveVotes() {
    if (!selectedMemberId) return;
    setSaving(true);
    try {
      // Save votes using the member's identity via query param
      const res = await fetch(`/api/vote/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: selectedMemberId, votes }),
      });
      if (!res.ok) throw new Error();
      toast.success("¡Votos guardados!");
      setDone(true);
    } catch {
      toast.error("No se pudo guardar");
    } finally {
      setSaving(false);
    }
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#12191A" }}>
        <div className="flex flex-col gap-3 w-full max-w-sm px-4">
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "#12191A" }}>
        <div className="text-5xl mb-4">🔥</div>
        <h1 className="text-xl font-bold text-[#F5F8F6] mb-2">¡Gracias!</h1>
        <p className="text-[#B8CCC4] text-sm text-center">Tus disponibilidades fueron guardadas para <strong className="text-[#F5F8F6]">{data.name}</strong>.</p>
      </div>
    );
  }

  const hasAllVoted = data.dateOptions.length > 0 && Object.keys(votes).length === data.dateOptions.length;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#12191A" }}>
      {/* Header */}
      <header className="border-b border-white/5 px-4 py-4 flex items-center gap-2">
        <div className="h-7 w-7 rounded-lg bg-[#1D9E75] flex items-center justify-center flex-shrink-0">
          <Flame size={14} className="text-white" />
        </div>
        <div>
          <p className="text-xs text-[#B8CCC4]">Votá las fechas para</p>
          <p className="text-sm font-bold text-[#F5F8F6]">{data.name}</p>
        </div>
      </header>

      <main className="flex-1 max-w-sm mx-auto w-full px-4 py-5 flex flex-col gap-5">
        {/* Who are you? */}
        {!selectedMemberId && (
          <div className="flex flex-col gap-3 animate-fade-in">
            <p className="text-sm font-medium text-[#B8CCC4]">¿Quién sos?</p>
            <div className="flex flex-col gap-2">
              {data.members.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMemberId(m.id)}
                  className="flex items-center gap-3 bg-[#1A2E2A] border border-white/10 rounded-xl px-4 py-3 hover:border-[#1D9E75]/40 transition-colors text-left"
                >
                  <Avatar name={m.user.name} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-[#F5F8F6]">{m.user.name}</p>
                    <p className="text-xs text-[#B8CCC4]">{m.user.city}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Voting */}
        {selectedMemberId && (
          <div className="flex flex-col gap-4 animate-fade-in">
            <div className="flex items-center gap-2">
              <Avatar
                name={data.members.find((m) => m.id === selectedMemberId)?.user.name ?? ""}
                size="sm"
              />
              <p className="text-sm text-[#B8CCC4]">
                Votando como <strong className="text-[#F5F8F6]">{data.members.find((m) => m.id === selectedMemberId)?.user.name}</strong>
              </p>
              <button onClick={() => { setSelectedMemberId(null); setVotes({}); }} className="ml-auto text-xs text-[#B8CCC4] underline">cambiar</button>
            </div>

            <p className="text-sm text-[#B8CCC4]">¿En qué fechas podés?</p>

            {data.dateOptions.map((opt) => {
              const myVote = votes[opt.id];
              const availCount = opt.votes.filter((v) => v.available).length;
              return (
                <div key={opt.id} className="bg-[#1A2E2A] border border-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <p className="font-semibold text-[#F5F8F6] capitalize text-sm">
                      {format(new Date(opt.date), "EEEE d 'de' MMMM", { locale: es })}
                    </p>
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
                  <div className="flex items-center gap-2">
                    <div className="h-1 bg-white/5 rounded-full flex-1 overflow-hidden">
                      <div
                        className="h-full bg-[#1D9E75] rounded-full"
                        style={{ width: data.members.length ? `${(availCount / data.members.length) * 100}%` : "0%" }}
                      />
                    </div>
                    <span className="text-xs text-[#B8CCC4]">{availCount}/{data.members.length}</span>
                  </div>
                </div>
              );
            })}

            <button
              onClick={saveVotes}
              disabled={!hasAllVoted || saving}
              className="w-full bg-[#1D9E75] hover:bg-[#0F6E56] disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              {saving ? "Guardando..." : hasAllVoted ? "Guardar mis votos" : "Votá todas las fechas"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
