"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Phone, Calendar, UserCheck, Stethoscope, Building2, Menu, X } from "lucide-react";
import { MedBoshStore } from "@/lib/store";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [patientAuth, setPatientAuth] = useState<{ phone: string; name?: string } | null>(null);

  useEffect(() => {
    setPatientAuth(MedBoshStore.getPatientAuth());
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      {/* Announcement & Emergency Hotline Bar */}
      <div className="bg-slate-900 text-white text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-2 font-medium">
            <span className="bg-[#007A78] text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded">
              24/7 Hotline
            </span>
            <span className="text-slate-300 text-xs">Selaiyur &amp; Guduvanchery, Chennai</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <a
              href="tel:+919118277575"
              className="flex items-center gap-1.5 hover:text-[#007A78] transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#007A78]" />
              <span>Emergency / WhatsApp: +91 9118-27-7575</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#007A78] text-white flex items-center justify-center font-bold text-lg shadow-sm">
              MB
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold tracking-tight text-slate-900">
                  MED BOSH
                </span>
                <span className="text-[10px] bg-slate-100 text-[#007A78] font-bold px-1.5 py-0.5 rounded border border-slate-200">
                  CLINIC
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide">
                Brain • Neuro • Spine Health
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-semibold text-slate-700 hover:text-[#007A78] transition-colors"
            >
              Home
            </Link>
            <Link
              href="/branches"
              className="text-sm font-semibold text-slate-700 hover:text-[#007A78] transition-colors flex items-center gap-1.5"
            >
              <Building2 className="w-4 h-4 text-[#007A78]" />
              Hospital Locations
            </Link>
            <Link
              href="/doctors"
              className="text-sm font-semibold text-slate-700 hover:text-[#007A78] transition-colors flex items-center gap-1.5"
            >
              <Stethoscope className="w-4 h-4 text-[#007A78]" />
              Doctors &amp; Specialties
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href={patientAuth ? "/patient/dashboard" : "/patient/login"}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-lg border border-slate-200 transition-colors"
            >
              <UserCheck className="w-4 h-4 text-[#007A78]" />
              {patientAuth ? <span>My Appointments</span> : <span>Patient Login</span>}
            </Link>

            <Link
              href="/book"
              className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#007A78] hover:bg-[#005E5C] px-4 py-2 rounded-lg shadow-sm transition-all"
            >
              <Calendar className="w-4 h-4" />
              Book Appointment
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <Link
              href="/book"
              className="text-xs font-bold text-white bg-[#007A78] px-3 py-1.5 rounded-md"
            >
              Book
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-[#007A78] focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-800 hover:text-[#007A78]"
          >
            Home
          </Link>
          <Link
            href="/branches"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-800 hover:text-[#007A78]"
          >
            Hospital Locations
          </Link>
          <Link
            href="/doctors"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-800 hover:text-[#007A78]"
          >
            Find Doctor by Specialty
          </Link>
          <hr className="my-2 border-slate-200" />
          <div className="space-y-2">
            <Link
              href="/patient/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-100 py-2.5 px-4 rounded-lg border border-slate-200"
            >
              <UserCheck className="w-4 h-4 text-[#007A78]" />
              Patient Login (Phone + OTP)
            </Link>
            <Link
              href="/doctor/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-xs font-medium text-slate-600 hover:text-[#007A78] px-4 py-1.5"
            >
              Doctor Portal Login
            </Link>
            <Link
              href="/reception/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-xs font-medium text-slate-600 hover:text-[#007A78] px-4 py-1.5"
            >
              Receptionist Portal Login
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
