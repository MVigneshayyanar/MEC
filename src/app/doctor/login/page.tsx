"use client";

export const dynamic = "force-dynamic";

import React, { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Stethoscope, Lock, User, ArrowRight } from "lucide-react";
import { MedBoshStore } from "@/lib/store";

function DoctorLoginContent() {
  const router = useRouter();
  const [username, setUsername] = useState("doctor1");
  const [password, setPassword] = useState("doctor1");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = MedBoshStore.loginStaff(username);
    if (res.success && res.user?.role === "doctor") {
      router.push("/doctor/dashboard");
    } else {
      setError("Invalid doctor credentials. Try seeded credential: doctor1 / doctor1");
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-medbosh-green/10 text-medbosh-green flex items-center justify-center mx-auto border-2 border-medbosh-green/20">
          <Stethoscope className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-black text-gray-900">
          Doctor Portal Login
        </h1>

        <p className="text-xs text-gray-600">
          Consultation queue management, status updates, future duty scheduling & roster additions.
        </p>
      </div>

      <form onSubmit={handleLogin} className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-5">
        <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs font-bold text-medbosh-green space-y-1">
          <span>Seeded Doctor Credentials:</span>
          <div className="flex justify-between font-mono font-semibold text-gray-700 pt-0.5">
            <span>Username: doctor1</span>
            <span>Password: doctor1</span>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-700 block mb-1">Username</label>
          <div className="relative">
            <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-medbosh-green"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-700 block mb-1">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-medbosh-green"
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
          className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-extrabold text-xs text-white bg-medbosh-green hover:bg-medbosh-green-dark shadow-md transition-all active:scale-95"
        >
          <span>Login to Doctor Portal</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

export default function DoctorLoginPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm font-bold text-gray-500">Loading Portal...</div>}>
      <DoctorLoginContent />
    </Suspense>
  );
}
