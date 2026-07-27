"use client";

export const dynamic = "force-dynamic";

import React, { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { UserCheck, Lock, User, ArrowRight } from "lucide-react";
import { MedBoshStore } from "@/lib/store";

function ReceptionLoginContent() {
  const router = useRouter();
  const [username, setUsername] = useState("receptionist1");
  const [password, setPassword] = useState("receptionist1");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = MedBoshStore.loginStaff(username);
    if (res.success && res.user?.role === "receptionist") {
      router.push("/reception/dashboard");
    } else {
      setError("Invalid credentials. Try seeded credential: receptionist1 / receptionist1");
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-medbosh-blue/10 text-medbosh-blue flex items-center justify-center mx-auto border-2 border-medbosh-blue/20">
          <UserCheck className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-black text-gray-900">
          Reception Portal Login
        </h1>

        <p className="text-xs text-gray-600">
          Live master slot matrix, walk-in/phone booking, cash counter fee entry & appointment management.
        </p>
      </div>

      <form onSubmit={handleLogin} className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-5">
        <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 text-xs font-bold text-medbosh-blue space-y-1">
          <span>Seeded Receptionist Credentials:</span>
          <div className="flex justify-between font-mono font-semibold text-gray-700 pt-0.5">
            <span>Username: receptionist1</span>
            <span>Password: receptionist1</span>
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
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-medbosh-blue"
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
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-medbosh-blue"
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
          className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-extrabold text-xs text-white bg-medbosh-blue hover:bg-medbosh-blue-dark shadow-md transition-all active:scale-95"
        >
          <span>Login to Reception Desk</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

export default function ReceptionLoginPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm font-bold text-gray-500">Loading Portal...</div>}>
      <ReceptionLoginContent />
    </Suspense>
  );
}
