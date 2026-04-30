"use client";

import { MapPin } from "lucide-react";

export function Header() {
  return (
    <header className="absolute top-0 left-0 right-0 z-20 p-4">
      <div className="flex items-center justify-between bg-card/95 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">R</span>
          </div>
          <span className="font-bold text-xl text-foreground tracking-tight">RUSH</span>
        </div>

      </div>
    </header>
  );
}
