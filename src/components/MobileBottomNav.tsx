"use client";

import React from "react";
import Link from "next/link";
import { Phone, Calendar, User, MapPin } from "lucide-react";

export default function MobileBottomNav() {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-lg px-2 py-1.5">
      <div className="grid grid-cols-4 gap-1 items-center max-w-md mx-auto text-center">
        <a
          href="tel:+919118277575"
          className="flex flex-col items-center justify-center py-1 text-slate-600 hover:text-[#007A78] transition-colors"
        >
          <Phone className="w-5 h-5 text-[#007A78] mb-0.5" />
          <span className="text-[10px] font-semibold">Call Now</span>
        </a>

        <Link
          href="/branches"
          className="flex flex-col items-center justify-center py-1 text-slate-600 hover:text-[#007A78] transition-colors"
        >
          <MapPin className="w-5 h-5 text-slate-500 mb-0.5" />
          <span className="text-[10px] font-semibold">Branches</span>
        </Link>

        <Link
          href="/patient/login"
          className="flex flex-col items-center justify-center py-1 text-slate-600 hover:text-[#007A78] transition-colors"
        >
          <User className="w-5 h-5 text-slate-500 mb-0.5" />
          <span className="text-[10px] font-semibold">My Visits</span>
        </Link>

        <Link
          href="/book"
          className="flex flex-col items-center justify-center py-1.5 text-white bg-[#007A78] rounded-lg shadow-sm font-bold text-[10px] uppercase tracking-wider active:scale-95 transition-transform"
        >
          <Calendar className="w-4 h-4 mb-0.5" />
          <span>Book</span>
        </Link>
      </div>
    </div>
  );
}
