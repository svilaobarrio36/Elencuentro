"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Home, CalendarPlus, User } from "lucide-react";

export function Navbar() {
  const path = usePathname();

  const links = [
    { href: "/dashboard", icon: Home, label: "Inicio" },
    { href: "/events/new", icon: CalendarPlus, label: "Nuevo" },
    { href: "/profile", icon: User, label: "Perfil" },
  ];

  return (
    <>
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#12191A]/90 backdrop-blur-sm">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 h-14">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-[#1D9E75] flex items-center justify-center">
              <Flame size={14} className="text-white" />
            </div>
            <span className="font-bold text-[#F5F8F6] text-base">El Encuentro</span>
          </Link>
        </div>
      </header>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/5 bg-[#12191A]/95 backdrop-blur-sm">
        <div className="max-w-lg mx-auto flex items-center justify-around px-4 h-16">
          {links.map(({ href, icon: Icon, label }) => {
            const active = href === "/dashboard" ? path === "/dashboard" : path.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-0.5 py-1 px-4 rounded-xl transition-colors ${
                  active ? "text-[#1D9E75]" : "text-[#B8CCC4]"
                }`}
              >
                <Icon size={20} />
                <span className="text-xs">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
