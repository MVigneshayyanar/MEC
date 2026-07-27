"use client";

export const dynamic = "force-dynamic";

import React, { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import OTPModal from "@/components/OTPModal";
import { Phone, ShieldCheck, UserCheck, ArrowRight } from "lucide-react";
import { MedBoshStore } from "@/lib/store";

function PatientLoginContent() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const [error, setError] = useState("");

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.replace(/\D/g, "").length < 10) {
      setError("Please enter a valid 10-digit mobile phone number");
      return;
    }
    setError("");
    setShowOTP(true);
  };

  const handleOTPVerified = (verifiedPhone: string) => {
    MedBoshStore.loginPatient(verifiedPhone);
    router.push("/patient/dashboard");
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-[#E6F4F3] text-[#0B8A82] flex items-center justify-center mx-auto border-2 border-[#B2DADA]">
          <UserCheck className="w-8 h-8 text-[#0B8A82]" />
        </div>

        <h1 className="text-2xl font-black text-[#2D3748]">
          Patient Login
        </h1>

        <p className="text-xs text-[#718096]">
          Enter your registered mobile phone number. No password required — we will verify via instant SMS OTP.
        </p>
      </div>

      <form onSubmit={handleSendOTP} className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E2E8EE] shadow-sm space-y-5">
        <div>
          <label className="text-xs font-bold text-[#4A5568] block mb-1.5">
            Mobile Phone Number
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-[#A0AEC0] absolute left-3.5 top-3.5" />
            <input
              type="tel"
              required
              placeholder="e.g. 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#F7F8FA] border border-[#E2E8EE] rounded-xl text-xs font-bold text-[#2D3748] focus:outline-none focus:ring-2 focus:ring-[#2C7A7B]/30"
            />
          </div>
        </div>

        {error && (
          <p className="text-xs font-bold text-red-600 bg-red-50 p-2.5 rounded-lg text-center">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-extrabold text-xs text-white bg-[#2C7A7B] hover:bg-[#215F60] shadow-md transition-all active:scale-95"
        >
          <span>Send Verification OTP</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <OTPModal
        phone={phone}
        isOpen={showOTP}
        onClose={() => setShowOTP(false)}
        onVerified={handleOTPVerified}
      />
    </div>
  );
}

export default function PatientLoginPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm font-bold text-gray-500">Loading Patient Login...</div>}>
      <PatientLoginContent />
    </Suspense>
  );
}
