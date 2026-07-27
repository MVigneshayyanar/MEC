"use client";

import React from "react";
import Link from "next/link";
import { Phone, Calendar, MapPin, Clock, CheckCircle2, MessageSquare } from "lucide-react";
import { Branch } from "@/lib/types";

interface BranchCardProps {
  branch: Branch;
  onSelectBook?: (branchId: string) => void;
}

export default function BranchCard({ branch, onSelectBook }: BranchCardProps) {
  const telHref = `tel:+91${branch.phone.replace(/\D/g, "")}`;
  const whatsappHref = `https://wa.me/91${branch.whatsapp.replace(/\D/g, "")}?text=Hello%20${encodeURIComponent(branch.shortName)},%20I%20would%20like%20to%20inquire%20about%20doctor%20availability.`;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between space-y-5">
      <div className="space-y-4">
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2.5 py-1 rounded">
            {branch.type} • Chennai
          </span>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded flex items-center gap-1 border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Open Today
          </span>
        </div>

        {/* Title & Tagline */}
        <div>
          <h3 className="text-lg font-bold text-slate-900 leading-snug">
            {branch.name}
          </h3>
          <p className="text-xs font-medium text-[#007A78] mt-0.5">
            {branch.tagline}
          </p>
        </div>

        {/* Details List */}
        <div className="space-y-3 text-xs text-slate-600">
          <div className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-[#007A78] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-800 leading-snug">{branch.address}</p>
              <p className="text-slate-500 text-[11px] mt-0.5">Landmark: {branch.landmark}</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-lg border border-slate-100">
            <Clock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">OPD Consultation Hours</span>
              <span className="font-semibold text-slate-900">{branch.timings}</span>
            </div>
          </div>

          {branch.id === "guduvanchery" && (
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-800 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Multi-Speciality Facility &amp; Cash Counter Payments Accepted</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5 pt-2 border-t border-slate-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <a
            href={telHref}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-xs text-white bg-[#007A78] hover:bg-[#005E5C] transition-all shadow-sm"
          >
            <Phone className="w-4 h-4" />
            <span>Call Now</span>
          </a>

          {onSelectBook ? (
            <button
              onClick={() => onSelectBook(branch.id)}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-xs text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-sm"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Slot</span>
            </button>
          ) : (
            <Link
              href={`/book?branchId=${branch.id}`}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-xs text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-sm text-center"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Slot</span>
            </Link>
          )}
        </div>

        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-100 transition-colors"
        >
          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
          <span>WhatsApp: +91 {branch.phone}</span>
        </a>
      </div>
    </div>
  );
}
