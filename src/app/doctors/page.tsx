"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import DoctorCard from "@/components/DoctorCard";
import { MedBoshStore } from "@/lib/store";
import { subscribeDoctors, subscribeBranches } from "@/lib/firebaseServices";
import { Doctor, Branch } from "@/lib/types";
import { SPECIALTIES } from "@/lib/seedData";
import { Stethoscope, Filter, Search } from "lucide-react";

function DoctorListContent() {
  const searchParams = useSearchParams();
  const initialSpec = searchParams.get("specialty") || "all";
  const initialBranch = searchParams.get("branchId") || "all";

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>(initialSpec);
  const [selectedBranch, setSelectedBranch] = useState<string>(initialBranch);
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    const unsubDocs = subscribeDoctors(setDoctors);
    const unsubBranches = subscribeBranches(setBranches);
    return () => {
      unsubDocs();
      unsubBranches();
    };
  }, []);

  const filtered = doctors.filter((doc) => {
    const matchesSpec = selectedSpecialty === "all" || doc.specialty?.toLowerCase().includes(selectedSpecialty.toLowerCase());
    const matchesBranch = selectedBranch === "all" || doc.branchIds?.includes(selectedBranch);
    const matchesSearch = doc.name?.toLowerCase().includes(search.toLowerCase()) || doc.qualifications?.toLowerCase().includes(search.toLowerCase());
    return matchesSpec && matchesBranch && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-slate-900/10 text-slate-900 px-3.5 py-1 rounded-full text-xs font-extrabold">
          <Stethoscope className="w-4 h-4" />
          <span>Doctor Roster & Specialists (Live Backend Synced)</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900">
          Find Specialist Doctors & Schedule
        </h1>
        <p className="text-xs sm:text-sm text-gray-600">
          Select a specialist to view real-time date & time slot availability across Med Bosh Selaiyur & BOSH Guduvanchery.
        </p>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search by name or qualification..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="w-full py-2.5 px-3 bg-slate-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="all">All Hospital Locations (2)</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            className="w-full py-2.5 px-3 bg-slate-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="all">All Specialties (6)</option>
            {SPECIALTIES.map((s) => (
              <option key={s.id} value={s.title}>
                {s.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Doctor Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((doc) => (
            <DoctorCard
              key={doc.id}
              doctor={doc}
              branches={branches}
              selectedBranchId={selectedBranch !== "all" ? selectedBranch : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 space-y-3">
          <p className="text-base font-extrabold text-gray-800">
            No doctors found matching your filter criteria.
          </p>
          <button
            onClick={() => {
              setSelectedBranch("all");
              setSelectedSpecialty("all");
              setSearch("");
            }}
            className="text-xs font-bold text-slate-900 hover:underline"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}

export default function DoctorsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm font-bold text-gray-500">Loading Doctor Roster...</div>}>
      <DoctorListContent />
    </Suspense>
  );
}
