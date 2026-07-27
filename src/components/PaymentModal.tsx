"use client";

import React, { useState } from "react";
import { CreditCard, ShieldCheck, CheckCircle2, Lock, Smartphone, Landmark, RefreshCw } from "lucide-react";

interface PaymentModalProps {
  amount: number;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (paymentId: string) => void;
  allowCashOption?: boolean;
}

export default function PaymentModal({
  amount,
  isOpen,
  onClose,
  onPaymentSuccess,
  allowCashOption = false
}: PaymentModalProps) {
  const [method, setMethod] = useState<"upi" | "card" | "netbanking" | "cash">("upi");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handlePayNow = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const mockPayId = method === "cash" ? `pay_CASH_${Date.now()}` : `pay_RZP_${Math.floor(100000 + Math.random() * 900000)}`;
      onPaymentSuccess(mockPayId);
    }, 1000);
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

        {/* Razorpay Brand Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider block">
                Razorpay Secure Checkout
              </span>
              <h3 className="text-lg font-extrabold text-gray-900">
                Slot Confirmation Fee
              </h3>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-medbosh-green">₹{amount}</span>
              <span className="text-[10px] text-gray-500 block font-semibold">100% Refundable per policy</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-gray-700 block">Select Payment Method:</span>

            <button
              type="button"
              onClick={() => setMethod("upi")}
              className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-xs font-bold transition-all ${
                method === "upi"
                  ? "border-medbosh-green bg-emerald-50/50 text-medbosh-green ring-1 ring-medbosh-green"
                  : "border-gray-200 hover:bg-gray-50 text-gray-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-medbosh-green" />
                <div className="text-left">
                  <span className="block font-extrabold">UPI / GPay / PhonePe / Paytm</span>
                  <span className="text-[10px] font-normal text-gray-500">Instant slot confirmation</span>
                </div>
              </div>
              {method === "upi" && <CheckCircle2 className="w-5 h-5 text-medbosh-green" />}
            </button>

            <button
              type="button"
              onClick={() => setMethod("card")}
              className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-xs font-bold transition-all ${
                method === "card"
                  ? "border-medbosh-green bg-emerald-50/50 text-medbosh-green ring-1 ring-medbosh-green"
                  : "border-gray-200 hover:bg-gray-50 text-gray-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-medbosh-blue" />
                <div className="text-left">
                  <span className="block font-extrabold">Credit / Debit Card</span>
                  <span className="text-[10px] font-normal text-gray-500">Visa, MasterCard, RuPay</span>
                </div>
              </div>
              {method === "card" && <CheckCircle2 className="w-5 h-5 text-medbosh-green" />}
            </button>

            <button
              type="button"
              onClick={() => setMethod("netbanking")}
              className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-xs font-bold transition-all ${
                method === "netbanking"
                  ? "border-medbosh-green bg-emerald-50/50 text-medbosh-green ring-1 ring-medbosh-green"
                  : "border-gray-200 hover:bg-gray-50 text-gray-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <Landmark className="w-5 h-5 text-medbosh-blue" />
                <div className="text-left">
                  <span className="block font-extrabold">Net Banking</span>
                  <span className="text-[10px] font-normal text-gray-500">SBI, HDFC, ICICI, Axis & All Banks</span>
                </div>
              </div>
              {method === "netbanking" && <CheckCircle2 className="w-5 h-5 text-medbosh-green" />}
            </button>

            {allowCashOption && (
              <button
                type="button"
                onClick={() => setMethod("cash")}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-xs font-bold transition-all ${
                  method === "cash"
                    ? "border-medbosh-orange bg-orange-50/50 text-medbosh-orange ring-1 ring-medbosh-orange"
                    : "border-gray-200 hover:bg-gray-50 text-gray-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-sm text-medbosh-orange">₹ CASH</span>
                  <div className="text-left">
                    <span className="block font-extrabold">Pay Cash On-Site at Counter</span>
                    <span className="text-[10px] font-normal text-gray-500">Reception walk-in verification</span>
                  </div>
                </div>
                {method === "cash" && <CheckCircle2 className="w-5 h-5 text-medbosh-orange" />}
              </button>
            )}
          </div>

          <div className="pt-4 space-y-3">
            <button
              onClick={handlePayNow}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-extrabold text-sm text-white bg-medbosh-orange hover:bg-medbosh-orange-hover shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>
                    {method === "cash" ? "Confirm Booking & Pay Cash Later" : `Pay ₹${amount} & Lock Slot`}
                  </span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>256-bit Bank Grade Encrypted Payment</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
