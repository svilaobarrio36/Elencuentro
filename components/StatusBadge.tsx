interface StatusBadgeProps {
  status: string;
}

const statusMap: Record<string, { label: string; className: string }> = {
  DRAFT:           { label: "Borrador",        className: "bg-white/10 text-[#B8CCC4]" },
  PENDING_DATES:   { label: "Votando fechas",  className: "bg-[#F2A65A]/20 text-[#F2A65A]" },
  DATE_CONFIRMED:  { label: "Fecha lista",     className: "bg-[#1D9E75]/20 text-[#1D9E75]" },
  CONFIRMED:       { label: "Confirmado",      className: "bg-[#1D9E75]/30 text-[#1D9E75]" },
  COMPLETED:       { label: "Completado",      className: "bg-white/10 text-[#B8CCC4]" },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const s = statusMap[status] ?? { label: status, className: "bg-white/10 text-[#B8CCC4]" };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.className}`}>
      {s.label}
    </span>
  );
}
