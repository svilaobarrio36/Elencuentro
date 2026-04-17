"use client";

import { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  error?: string;
  valid?: boolean;
  children: ReactNode;
}

export function FormField({ label, error, valid, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-[#B8CCC4]">{label}</label>
      <div className="relative">
        {children}
        {valid && !error && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1D9E75] text-sm pointer-events-none">
            ✓
          </span>
        )}
      </div>
      {error && (
        <p className="text-xs text-[#E24B4A] animate-fade-in">{error}</p>
      )}
    </div>
  );
}
