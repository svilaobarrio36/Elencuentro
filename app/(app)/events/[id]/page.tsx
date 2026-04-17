import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format, differenceInHours } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, MapPin, Calendar, ShoppingCart, Receipt, Users, ExternalLink } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { Avatar } from "@/components/Avatar";
import { getBestDate } from "@/lib/business";

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      members: { include: { user: true } },
      dateOptions: { include: { votes: true } },
      shoppingList: true,
      purchases: { include: { user: true } },
    },
  });

  if (!event) notFound();

  const bestDate = getBestDate(event.dateOptions.map((d) => ({ ...d, date: new Date(d.date), votes: d.votes })));
  const totalSpent = event.purchases.reduce((s, p) => s + p.amount, 0);
  const confirmedCount = event.members.filter((m) => m.status === "CONFIRMED").length;

  const isOrganizer = event.members.some(
    (m) => m.userId === session?.user?.id && m.role === "ORGANIZER"
  );

  const hoursUntil = event.date ? differenceInHours(new Date(event.date), new Date()) : null;
  const showBanner = hoursUntil !== null && hoursUntil > 0 && hoursUntil <= 24;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link href="/dashboard" className="text-[#B8CCC4] hover:text-[#F5F8F6] mt-0.5 p-1">
          <ChevronLeft size={22} />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-[#F5F8F6] truncate">{event.name}</h1>
            <StatusBadge status={event.status} />
          </div>
          {event.location && (
            <div className="flex items-center gap-1.5 mt-1 text-sm text-[#B8CCC4]">
              <MapPin size={13} className="text-[#1D9E75]" />
              <span>{event.location}</span>
            </div>
          )}
        </div>
      </div>

      {/* 24h banner */}
      {showBanner && (
        <div className="bg-[#F2A65A]/15 border border-[#F2A65A]/30 rounded-xl p-3 flex items-center gap-2 animate-fade-in">
          <span className="text-xl">⏰</span>
          <p className="text-sm text-[#F5F8F6]">
            <span className="font-semibold text-[#F2A65A]">¡Faltan menos de 24 horas!</span> El asado es mañana.
          </p>
        </div>
      )}

      {/* Date section */}
      <div className="bg-[#1A2E2A] border border-white/10 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[#F5F8F6] flex items-center gap-1.5">
            <Calendar size={15} className="text-[#1D9E75]" /> Fechas
          </h2>
          <Link href={`/events/${id}/dates`} className="text-xs text-[#1D9E75] hover:text-[#0F6E56]">
            {event.status === "PENDING_DATES" ? "Votar" : "Ver"}
          </Link>
        </div>

        {event.date ? (
          <p className="text-[#F5F8F6] font-semibold">
            {format(new Date(event.date), "EEEE d 'de' MMMM", { locale: es })}
          </p>
        ) : bestDate ? (
          <div>
            <p className="text-xs text-[#B8CCC4] mb-1">Mejor opción según votos</p>
            <p className="text-[#F5F8F6] font-medium">
              {format(new Date(bestDate.date), "EEEE d 'de' MMMM", { locale: es })}
              <span className="text-xs text-[#1D9E75] ml-2">
                {bestDate.votes.filter((v) => v.available).length} disponibles
              </span>
            </p>
          </div>
        ) : (
          <p className="text-[#B8CCC4] text-sm">Sin fechas propuestas aún.</p>
        )}

        {event.dateOptions.length > 0 && !event.date && (
          <div className="mt-3 flex flex-col gap-1">
            {event.dateOptions.map((opt) => {
              const avail = opt.votes.filter((v) => v.available).length;
              const isBest = bestDate?.id === opt.id;
              return (
                <div key={opt.id} className={`flex items-center justify-between text-sm py-1 px-2 rounded-lg ${isBest ? "bg-[#1D9E75]/10" : ""}`}>
                  <span className="text-[#F5F8F6]">{format(new Date(opt.date), "d MMM", { locale: es })}</span>
                  <div className="flex items-center gap-1">
                    <div className="h-1.5 bg-white/5 rounded-full w-16 overflow-hidden">
                      <div
                        className="h-full bg-[#1D9E75] rounded-full"
                        style={{ width: `${event.members.length ? (avail / event.members.length) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-[#B8CCC4] text-xs w-12 text-right">{avail}/{event.members.length}</span>
                    {isBest && <span className="text-[#1D9E75] text-xs">★</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Members */}
      <div className="bg-[#1A2E2A] border border-white/10 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-[#F5F8F6] flex items-center gap-1.5 mb-3">
          <Users size={15} className="text-[#1D9E75]" /> Invitados ({confirmedCount}/{event.members.length})
        </h2>
        <div className="flex flex-wrap gap-2">
          {event.members.map((m) => (
            <div key={m.id} className="flex items-center gap-1.5" title={`${m.user.name} — ${m.status}`}>
              <Avatar name={m.user.name} size="sm" />
              <div>
                <p className="text-xs font-medium text-[#F5F8F6] leading-none">{m.user.name}</p>
                <p className="text-xs text-[#B8CCC4]">{m.user.city ?? "—"}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Share link */}
        <div className="mt-3 pt-3 border-t border-white/5">
          <p className="text-xs text-[#B8CCC4] mb-1">Link para votar (sin login)</p>
          <div className="flex items-center gap-2 bg-[#12191A] rounded-lg px-3 py-2">
            <span className="text-xs text-[#1D9E75] flex-1 truncate font-mono">
              /vote/{id}
            </span>
            <ExternalLink size={13} className="text-[#B8CCC4]" />
          </div>
        </div>
      </div>

      {/* Shopping list quicklink */}
      <Link href={`/events/${id}/shopping`} className="bg-[#1A2E2A] border border-white/10 rounded-xl p-4 flex items-center gap-3 hover:border-[#1D9E75]/40 transition-colors">
        <div className="h-9 w-9 rounded-xl bg-[#1D9E75]/10 flex items-center justify-center flex-shrink-0">
          <ShoppingCart size={16} className="text-[#1D9E75]" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-[#F5F8F6]">Lista de compras</p>
          <p className="text-xs text-[#B8CCC4]">
            {event.shoppingList.length > 0 ? `${event.shoppingList.length} ítems` : "Generá la lista automáticamente"}
          </p>
        </div>
        <ChevronLeft size={16} className="text-[#B8CCC4] rotate-180" />
      </Link>

      {/* Split */}
      <Link href={`/events/${id}/summary`} className="bg-[#1A2E2A] border border-white/10 rounded-xl p-4 flex items-center gap-3 hover:border-[#1D9E75]/40 transition-colors">
        <div className="h-9 w-9 rounded-xl bg-[#F2A65A]/10 flex items-center justify-center flex-shrink-0">
          <Receipt size={16} className="text-[#F2A65A]" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-[#F5F8F6]">Gastos y split</p>
          <p className="text-xs text-[#B8CCC4]">
            {totalSpent > 0 ? `$${totalSpent.toLocaleString("es-AR")} registrados` : "Registrá lo que gastó cada uno"}
          </p>
        </div>
        <ChevronLeft size={16} className="text-[#B8CCC4] rotate-180" />
      </Link>

      {/* Confirm date (organizer) */}
      {isOrganizer && event.status === "PENDING_DATES" && bestDate && (
        <form action={`/api/events/${id}/confirm-date`} method="POST">
          <input type="hidden" name="dateOptionId" value={bestDate.id} />
          <button
            type="submit"
            className="w-full bg-[#1D9E75] hover:bg-[#0F6E56] text-white font-semibold py-3 rounded-xl transition-colors text-sm"
          >
            Confirmar mejor fecha ({format(new Date(bestDate.date), "d MMM", { locale: es })})
          </button>
        </form>
      )}
    </div>
  );
}
