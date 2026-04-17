import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DaysSinceCard } from "@/components/DaysSinceCard";
import { EventCard } from "@/components/EventCard";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  // Get user's events
  const memberships = await prisma.eventMember.findMany({
    where: { userId },
    include: {
      event: {
        include: {
          members: true,
        },
      },
    },
    orderBy: { event: { createdAt: "desc" } },
  });

  const events = memberships.map((m) => m.event);

  // Last completed event for emotional trigger
  const lastCompleted = events.find((e) => e.status === "COMPLETED");

  const activeEvents = events.filter((e) => e.status !== "COMPLETED");
  const pastEvents = events.filter((e) => e.status === "COMPLETED");

  return (
    <div className="flex flex-col gap-5">
      {/* Greeting */}
      <div>
        <h1 className="text-xl font-bold text-[#F5F8F6]">
          Hola, {session!.user!.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-sm text-[#B8CCC4] mt-0.5">¿Cuándo es el próximo asado?</p>
      </div>

      {/* Emotional trigger */}
      <DaysSinceCard lastEventDate={lastCompleted?.date ?? null} />

      {/* Active events */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[#B8CCC4] uppercase tracking-wider">En progreso</h2>
          <Link
            href="/events/new"
            className="flex items-center gap-1 text-xs text-[#1D9E75] hover:text-[#0F6E56] transition-colors font-medium"
          >
            <Plus size={14} /> Crear asado
          </Link>
        </div>

        {activeEvents.length === 0 ? (
          <div className="bg-[#1A2E2A] border border-dashed border-white/10 rounded-xl p-6 text-center">
            <p className="text-[#B8CCC4] text-sm mb-3">No hay asados en progreso.</p>
            <Link
              href="/events/new"
              className="inline-flex items-center gap-1.5 bg-[#1D9E75] text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-[#0F6E56] transition-colors"
            >
              <Plus size={14} /> Organizar uno
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {activeEvents.map((e) => (
              <EventCard
                key={e.id}
                id={e.id}
                name={e.name}
                status={e.status}
                location={e.location}
                date={e.date}
                memberCount={e.members.length}
              />
            ))}
          </div>
        )}
      </section>

      {/* Past events */}
      {pastEvents.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-[#B8CCC4] uppercase tracking-wider mb-3">Historial</h2>
          <div className="flex flex-col gap-3">
            {pastEvents.map((e) => (
              <EventCard
                key={e.id}
                id={e.id}
                name={e.name}
                status={e.status}
                location={e.location}
                date={e.date}
                memberCount={e.members.length}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
