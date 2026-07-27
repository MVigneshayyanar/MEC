"use client";

import React, { useState, useEffect, Suspense } from "react";
import BranchCard from "@/components/BranchCard";
import { subscribeBranches } from "@/lib/firebaseServices";
import { Branch } from "@/lib/types";
import { Building2, Navigation, Phone, Calendar } from "lucide-react";

function BranchesContent() {
  const [branches, setBranches] = useState<Branch[]>([]);

  useEffect(() => {
    const unsub = subscribeBranches(setBranches);
    return () => unsub();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-[#0B8A82]/10 text-[#0B8A82] px-3.5 py-1 rounded-full text-xs font-extrabold">
          <Building2 className="w-4 h-4" />
          <span>Multi-Branch Hospital Group</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900">
          Med Bosh Hospital Locations & Timings
        </h1>
        <p className="text-xs sm:text-sm text-gray-600">
          Both branches are centrally managed. Choose your nearest location to call directly or reserve your specialist appointment.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {branches.map((branch) => (
          <BranchCard key={branch.id} branch={branch} />
        ))}
      </div>

      <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 space-y-4 text-center max-w-3xl mx-auto">
        <h3 className="text-lg font-extrabold text-gray-900">
          Need Assistance Finding a Hospital Branch?
        </h3>
        <p className="text-xs text-gray-600 leading-relaxed">
          Our reception team is available daily on telephone and WhatsApp to assist with directions, doctor schedules, and emergency neuro-spine admissions.
        </p>
        <div className="flex justify-center gap-4 pt-2">
          <a
            href="tel:+919118277575"
            className="flex items-center gap-2 bg-[#0B8A82] text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-md"
          >
            <Phone className="w-4 h-4" />
            <span>Call Hotline: +91 9118-27-7575</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default function BranchesPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm font-bold text-gray-500">Loading Locations...</div>}>
      <BranchesContent />
    </Suspense>
  );
}
