"use client";

interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const COLORS = [
  "bg-teal-600",
  "bg-emerald-600",
  "bg-cyan-600",
  "bg-sky-600",
  "bg-indigo-600",
  "bg-violet-600",
  "bg-rose-600",
  "bg-amber-600",
];

function getColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

const sizes = { sm: "h-7 w-7 text-xs", md: "h-9 w-9 text-sm", lg: "h-12 w-12 text-base" };

export function Avatar({ name, size = "md", className = "" }: AvatarProps) {
  return (
    <div
      className={`${sizes[size]} ${getColor(name)} rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0 ${className}`}
    >
      {getInitials(name)}
    </div>
  );
}
