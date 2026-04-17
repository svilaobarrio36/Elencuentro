import { differenceInDays } from "date-fns";
import { Flame } from "lucide-react";

interface DaysSinceCardProps {
  lastEventDate: Date | null;
}

export function DaysSinceCard({ lastEventDate }: DaysSinceCardProps) {
  if (!lastEventDate) {
    return (
      <div className="bg-[#1A2E2A] border border-white/10 rounded-xl p-4">
        <p className="text-[#B8CCC4] text-sm">Todavía no hay asados registrados. ¡Creá el primero!</p>
      </div>
    );
  }

  const days = differenceInDays(new Date(), new Date(lastEventDate));
  const isUrgent = days > 60;
  const isWarning = days > 30 && !isUrgent;

  const color = isUrgent ? "#E24B4A" : isWarning ? "#F2A65A" : "#1D9E75";
  const bgColor = isUrgent ? "bg-[#E24B4A]/10 border-[#E24B4A]/20" : isWarning ? "bg-[#F2A65A]/10 border-[#F2A65A]/20" : "bg-[#1D9E75]/10 border-[#1D9E75]/20";

  return (
    <div className={`${bgColor} border rounded-xl p-4 flex items-center gap-3`}>
      <Flame size={24} style={{ color }} className="flex-shrink-0" />
      <div>
        <p className="text-[#F5F8F6] font-semibold text-base leading-tight">
          Han pasado{" "}
          <span style={{ color }} className="font-bold">
            {days} días
          </span>{" "}
          desde tu último asado
        </p>
        <p className="text-[#B8CCC4] text-xs mt-0.5">
          {isUrgent ? "¡Ya es demasiado tiempo!" : isWarning ? "Ya va siendo hora..." : "Buen ritmo, sigan así."}
        </p>
      </div>
    </div>
  );
}
