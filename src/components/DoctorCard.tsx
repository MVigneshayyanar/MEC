"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Stethoscope, Calendar, MapPin, Award, CheckCircle2, ShieldCheck } from "lucide-react";
import { Doctor, Branch } from "@/lib/types";

interface DoctorCardProps {
  doctor: Doctor;
  branches: Branch[];
  selectedBranchId?: string;
  onBook?: (doctorId: string) => void;
}

export default function DoctorCard({ doctor, branches, selectedBranchId, onBook }: DoctorCardProps) {
  const [imgError, setImgError] = useState(false);
  const availableBranches = branches.filter((b) => doctor.branchIds.includes(b.id));

  const getInitials = (name: string) => {
    const parts = name.replace(/^Dr\.\s*/i, "").trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between space-y-4">
      <div className="space-y-4">
        {/* Profile Header */}
        <div className="flex gap-3.5 items-start">
          <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100 flex items-center justify-center">
            {imgError || !doctor.photoUrl ? (
              <div className="w-full h-full bg-[#007A78] text-white flex items-center justify-center font-bold text-xl">
                {getInitials(doctor.name)}
              </div>
            ) : (
              <img
                src={doctor.photoUrl}
                alt={doctor.name}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <span className="bg-[#E6F4F4] text-[#007A78] text-[10px] font-bold px-2 py-0.5 rounded border border-[#007A78]/20 uppercase tracking-wider inline-block">
              {doctor.specialty}
            </span>
            <h3 className="text-base font-bold text-slate-900 leading-snug truncate">
              {doctor.name}
            </h3>
            <p className="text-xs text-slate-500 font-medium truncate">
              {doctor.qualifications}
            </p>
            <div className="flex items-center gap-3 pt-1 text-xs text-slate-600 font-medium">
              <span className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-600" />
                {doctor.experienceYears}+ Yrs
              </span>
              <span className="flex items-center gap-1 font-bold text-[#007A78]">
                Fee: ₹{doctor.consultationFee}
              </span>
            </div>
          </div>
        </div>

        {/* Bio */}
        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 bg-slate-50 p-3 rounded-lg border border-slate-100 font-normal">
          {doctor.bio}
        </p>

        {/* Branches */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
            Available Locations
          </span>
          <div className="flex flex-wrap gap-1.5">
            {availableBranches.map((b) => (
              <span
                key={b.id}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-md flex items-center gap-1 border transition-colors ${
                  selectedBranchId === b.id
                    ? "bg-[#007A78] text-white border-[#007A78]"
                    : "bg-slate-50 text-slate-700 border-slate-200"
                }`}
              >
                <MapPin className="w-3 h-3" />
                {b.shortName}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="pt-2 border-t border-slate-100">
        {onBook ? (
          <button
            onClick={() => onBook(doctor.id)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-xs text-white bg-[#007A78] hover:bg-[#005E5C] transition-all shadow-sm"
          >
            <Calendar className="w-4 h-4" />
            <span>Select Date &amp; Book Slot</span>
          </button>
        ) : (
          <Link
            href={`/book?doctorId=${doctor.id}`}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-xs text-white bg-[#007A78] hover:bg-[#005E5C] transition-all shadow-sm text-center"
          >
            <Calendar className="w-4 h-4" />
            <span>Select Date &amp; Book Slot</span>
          </Link>
        )}
      </div>
    </div>
  );
}
