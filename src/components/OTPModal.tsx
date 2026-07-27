"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Phone, ArrowRight, RefreshCw, CheckCircle2, Lock } from "lucide-react";

interface OTPModalProps {
  phone: string;
  isOpen: boolean;
  onClose: () => void;
  onVerified: (verifiedPhone: string) => void;
}

export default function OTPModal({ phone, isOpen, onClose, onVerified }: OTPModalProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let interval: any = null;
    if (isOpen && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, timer]);

  if (!isOpen) return null;

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) {
      setError("Please enter the complete 6-digit OTP");
      return;
    }
    setLoading(true);
    setError("");

    // Simulate OTP verification (or match demo code 123456)
    setTimeout(() => {
      setLoading(false);
      onVerified(phone);
    }, 600);
  };

  const handleUseDemoOtp = () => {
    setOtp(["1", "2", "3", "4", "5", "6"]);
    setError("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
        >
          ✕
        </button>

        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-medbosh-green/10 text-medbosh-green rounded-full flex items-center justify-center mx-auto border-2 border-medbosh-green/20">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <h3 className="text-xl font-extrabold text-gray-900">
            Verify Phone Number
          </h3>

          <p className="text-xs text-gray-600">
            We sent a 6-digit OTP code to{" "}
            <span className="font-bold text-gray-900">+91 {phone}</span>
          </p>

          <button
            onClick={handleUseDemoOtp}
            type="button"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-medbosh-blue bg-blue-50 px-3 py-1 rounded-full border border-blue-200 hover:bg-blue-100 transition-colors"
          >
            <Lock className="w-3.5 h-3.5" />
            Auto-fill Test OTP: 123456
          </button>
        </div>

        <form onSubmit={handleVerify} className="mt-6 space-y-6">
          <div className="flex justify-center gap-2">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                id={`otp-input-${idx}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-11 h-12 text-center text-lg font-bold text-gray-900 border-2 border-gray-200 rounded-xl focus:border-medbosh-green focus:outline-none focus:ring-2 focus:ring-medbosh-green/20"
              />
            ))}
          </div>

          {error && (
            <p className="text-xs font-bold text-red-600 text-center bg-red-50 py-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-extrabold text-sm text-white bg-medbosh-green hover:bg-medbosh-green-dark shadow-md transition-all disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>Verify OTP & Proceed</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="flex justify-between items-center text-xs text-gray-500 pt-2">
            <span>Didn't get code?</span>
            {timer > 0 ? (
              <span className="font-semibold text-gray-700">Resend in {timer}s</span>
            ) : (
              <button
                type="button"
                onClick={() => setTimer(30)}
                className="font-bold text-medbosh-orange hover:underline"
              >
                Resend OTP
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
