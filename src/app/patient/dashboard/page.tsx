"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MedBoshStore } from "@/lib/store";
import { subscribeAppointments } from "@/lib/firebaseServices";
import { Appointment } from "@/lib/types";
import { UserCheck, Calendar, MapPin, Clock, Phone, LogOut, CheckCircle2, AlertCircle, PlusCircle } from "lucide-react";

function PatientDashboardContent() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [patientAuth, setPatientAuth] = useState<{ phone: string; name?: string } | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    setMounted(true);
    const auth = MedBoshStore.getPatientAuth();
    if (!auth) {
      router.push("/patient/login");
      return;
    }
    setPatientAuth(auth);

    const unsubAppts = subscribeAppointments((all) => {
      const myVisits = all.filter((a) => a.patientPhone === auth.phone);
      setAppointments(myVisits);
    });

    return () => {
      unsubAppts();
    };
  }, [router]);

  if (!mounted || !patientAuth) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-gray-200 text-center space-y-3 shadow-sm">
        <div className="w-10 h-10 border-4 border-[#0B8A82] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-extrabold text-gray-700">Verifying Patient Session...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Account Profile Bar */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#0F1B2D] text-white flex items-center justify-center font-extrabold text-xl shadow-md">
            {patientAuth.name ? patientAuth.name[0] : "P"}
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900">
              Welcome, {patientAuth.name || "Patient"}
            </h1>
            <p className="text-xs text-gray-500 font-semibold">
              Registered Phone: +91 {patientAuth.phone}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            href="/book"
            className="flex items-center gap-1.5 bg-[#C9A84C] text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Book New Appointment</span>
          </Link>

          <button
            onClick={() => {
              MedBoshStore.logoutPatient();
              router.push("/");
            }}
            className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs px-3.5 py-2.5 rounded-xl"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#0B8A82]" />
          <span>My Appointment Visits ({appointments.length})</span>
        </h2>

        {appointments.length > 0 ? (
          <div className="space-y-4">
            {appointments.map((apt) => (
              <div
                key={apt.id}
                className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4 hover:border-[#0B8A82] transition-colors"
              >
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-teal-100 text-teal-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                      {apt.status}
                    </span>
                    <span className="text-xs font-mono text-gray-500 font-bold">
                      Ref: {apt.id}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-gray-500">
                    Booked on {new Date(apt.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400 font-bold uppercase text-[10px]">Consulting Doctor</span>
                    <p className="font-extrabold text-gray-900 text-sm">{apt.doctorName}</p>
                  </div>

                  <div>
                    <span className="text-gray-400 font-bold uppercase text-[10px]">Hospital Location</span>
                    <p className="font-extrabold text-[#0F1B2D] text-sm">{apt.branchName}</p>
                  </div>

                  <div>
                    <span className="text-gray-400 font-bold uppercase text-[10px]">Date & Time</span>
                    <p className="font-extrabold text-[#C9A84C] text-sm">{apt.date} at {apt.time}</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl text-xs text-gray-700 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-gray-500">Reason: </span>
                    <span>{apt.reason}</span>
                  </div>
                  <span className="font-extrabold text-teal-700 bg-teal-50 px-2.5 py-1 rounded border border-teal-200">
                    Fee Paid
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center space-y-3">
            <p className="text-sm font-bold text-gray-600">No appointments found for this phone number.</p>
            <Link
              href="/book"
              className="inline-flex items-center gap-2 text-xs font-extrabold text-white bg-[#C9A84C] px-5 py-2.5 rounded-xl shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Book First Appointment Now</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PatientDashboardPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm font-bold text-gray-500">Loading Patient Dashboard...</div>}>
      <PatientDashboardContent />
    </Suspense>
  );
}
