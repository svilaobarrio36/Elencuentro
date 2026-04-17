import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { MapPin, Calendar, Users } from "lucide-react";
import { StatusBadge } from "./StatusBadge";

interface EventCardProps {
  id: string;
  name: string;
  status: string;
  location?: string | null;
  date?: Date | null;
  memberCount: number;
}

export function EventCard({ id, name, status, location, date, memberCount }: EventCardProps) {
  return (
    <Link href={`/events/${id}`}>
      <div className="bg-[#1A2E2A] border border-white/10 rounded-xl p-4 hover:border-[#1D9E75]/40 transition-all duration-150 cursor-pointer">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-semibold text-[#F5F8F6] text-base leading-tight">{name}</h3>
          <StatusBadge status={status} />
        </div>
        <div className="flex flex-col gap-1.5">
          {location && (
            <div className="flex items-center gap-1.5 text-sm text-[#B8CCC4]">
              <MapPin size={13} className="text-[#1D9E75] flex-shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          )}
          {date && (
            <div className="flex items-center gap-1.5 text-sm text-[#B8CCC4]">
              <Calendar size={13} className="text-[#1D9E75] flex-shrink-0" />
              <span>{format(new Date(date), "d 'de' MMMM", { locale: es })}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-sm text-[#B8CCC4]">
            <Users size={13} className="text-[#1D9E75] flex-shrink-0" />
            <span>{memberCount} personas</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
