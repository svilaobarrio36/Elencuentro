"use client";

import { Avatar } from "./Avatar";

interface FriendChipProps {
  name: string;
  city?: string;
  selected: boolean;
  onToggle: () => void;
}

export function FriendChip({ name, city, selected, onToggle }: FriendChipProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-150 text-left cursor-pointer
        ${selected
          ? "border-[#1D9E75] bg-[#1D9E75]/20 text-[#F5F8F6]"
          : "border-white/10 bg-[#1A2E2A] text-[#B8CCC4] hover:border-white/20"
        }`}
    >
      <Avatar name={name} size="sm" />
      <div className="flex flex-col leading-tight">
        <span className="text-sm font-medium text-[#F5F8F6]">{name}</span>
        {city && <span className="text-xs text-[#B8CCC4]">{city}</span>}
      </div>
      {selected && (
        <span className="ml-auto text-[#1D9E75] text-sm">✓</span>
      )}
    </button>
  );
}
