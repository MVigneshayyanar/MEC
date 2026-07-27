"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { MedBoshStore, generateStandardTimeSlots } from "@/lib/store";
import { subscribeDoctors, subscribeBranches, subscribeAppointments, seedFirestoreIfEmpty, bookAppointmentFirestoreTransaction } from "@/lib/firebaseServices";
import { Appointment, Branch, Doctor } from "@/lib/types";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import OTPModal from "@/components/OTPModal";
import PaymentModal from "@/components/PaymentModal";
import {
  Building2,
  Calendar,
  Clock,
  User,
  Phone,
  CheckCircle2,
  AlertCircle,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Download,
  Sparkles,
  Stethoscope,
  Check
} from "lucide-react";

function DoctorAvatar({ doc, size = "md" }: { doc: Doctor; size?: "sm" | "md" | "lg" }) {
  const [imgError, setImgError] = useState(false);
  const sizeClasses = size === "sm" ? "w-9 h-9 text-xs" : size === "lg" ? "w-16 h-16 text-lg" : "w-11 h-11 text-xs";

  const getInitials = (name: string) => {
    const parts = name.replace(/^Dr\.\s*/i, "").trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  if (imgError || !doc.photoUrl) {
    return (
      <div className={`${sizeClasses} rounded-xl bg-[#0F1B2D] text-white flex items-center justify-center font-black shrink-0 border border-[#0F1B2D]/20 shadow-sm`}>
        {getInitials(doc.name)}
      </div>
    );
  }

  return (
    <div className={`relative ${sizeClasses} rounded-xl overflow-hidden shrink-0 border border-gray-200 shadow-sm bg-slate-100`}>
      <img
        src={doc.photoUrl}
        alt={doc.name}
        onError={() => setImgError(true)}
        className="w-full h-full object-cover"
      />
    </div>
  );
}

function BookingWizardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const queryBranchId = searchParams.get("branchId") || "selaiyur";
  const queryDoctorId = searchParams.get("doctorId") || "";

  const [branches, setBranches] = useState<Branch[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [existingAppointments, setExistingAppointments] = useState<Appointment[]>([]);

  // Selection states: Clinic -> Doctor -> Date -> Slot
  const [selectedBranchId, setSelectedBranchId] = useState<string>(queryBranchId);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(queryDoctorId);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");

  // Patient Form state
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [patientAge, setPatientAge] = useState<number | "">("");
  const [patientGender, setPatientGender] = useState<string>("Male");
  const [reason, setReason] = useState("");


  // Modals & Confirmation state
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Appointment | null>(null);
  const [bookingError, setBookingError] = useState("");

  // Subscribe directly to Firestore backend in real-time
  useEffect(() => {
    import("@/lib/firebaseServices").then((mod) => {
      mod.seedFirestoreIfEmpty();
    });

    const unsubBranches = subscribeBranches(setBranches);
    const unsubDoctors = subscribeDoctors((docs) => {
      setDoctors(docs);
      if (!selectedDoctorId && docs.length > 0) {
        setSelectedDoctorId(docs[0].id);
      }
    });
    const unsubAppts = subscribeAppointments(setExistingAppointments);

    const auth = MedBoshStore.getPatientAuth();
    if (auth?.phone) {
      setPatientPhone(auth.phone);
      if (auth.name) setPatientName(auth.name);
    }

    return () => {
      unsubBranches();
      unsubDoctors();
      unsubAppts();
    };
  }, []);

  const currentBranch = branches.find((b) => b.id === selectedBranchId);
  const currentDoctor = doctors.find((d) => d.id === selectedDoctorId);

  // Doctors available at selected clinic (irrespective of today's duty, since they can book future dates)
  const doctorsAtClinic = doctors.filter((d) => {
    if (!selectedBranchId) return true;
    return d.branchIds?.includes(selectedBranchId);
  });

  const timeSlots = selectedBranchId ? generateStandardTimeSlots(selectedBranchId, selectedDate) : [];



  const getNext7Days = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      const label = i === 0 ? "Today" : i === 1 ? "Tomorrow" : d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
      days.push({ dateStr, label, dayName: d.toLocaleDateString("en-US", { weekday: "short" }) });
    }
    return days;
  };

  const handleStartVerification = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError("");

    if (!selectedBranchId) {
      setBookingError("Please select a clinic location first.");
      return;
    }
    if (!selectedDoctorId) {
      setBookingError("Please select your consulting doctor.");
      return;
    }
    if (!selectedTimeSlot) {
      setBookingError("Please select an available time slot.");
      return;
    }
    if (!patientName.trim()) {
      setBookingError("Please enter patient name.");
      return;
    }
    if (!patientPhone.trim() || patientPhone.replace(/\D/g, "").length < 10) {
      setBookingError("Please enter a valid 10-digit phone number.");
      return;
    }
    if (!reason.trim()) {
      setBookingError("Please describe your symptom/reason for visit.");
      return;
    }

    if (!phoneVerified) {
      setShowOTPModal(true);
    } else {
      setShowPaymentModal(true);
    }
  };

  const handleOTPVerified = (verifiedPhone: string) => {
    setPhoneVerified(true);
    setShowOTPModal(false);
    MedBoshStore.loginPatient(verifiedPhone, patientName);
    setShowPaymentModal(true);
  };

  const handlePaymentCompleted = async (paymentId: string) => {
    setShowPaymentModal(false);

    const result = await bookAppointmentFirestoreTransaction({
      patientPhone: patientPhone.replace(/\D/g, ""),
      patientName,
      patientAge: patientAge ? Number(patientAge) : undefined,
      patientGender,

      doctorId: selectedDoctorId,
      doctorName: currentDoctor?.name || "",
      branchId: selectedBranchId,
      branchName: currentBranch?.name || "",
      date: selectedDate,
      time: selectedTimeSlot,
      reason,
      createdBy: "patient",
      feePaid: true,
      paymentId
    });

    if (result.success && result.appointment) {
      setConfirmedBooking(result.appointment);
    } else {
      setBookingError(result.message || "Booking failed due to slot conflict.");
    }
  };

  const handleDownloadPass = async () => {
    if (!confirmedBooking) return;
    
    const element = document.getElementById("appointment-pass-card");
    if (!element) return;
    
    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 15; // 15mm margin on both sides
      const pdfWidth = pageWidth - (margin * 2);
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", margin, 20, pdfWidth, pdfHeight);
      pdf.save(`MedBosh_Pass_${confirmedBooking.id}.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF", err);
    }
  };

  if (confirmedBooking && currentBranch && currentDoctor) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
        <div id="appointment-pass-card" className="bg-white rounded-3xl border-2 border-teal-500 shadow-2xl p-6 sm:p-10 space-y-6 text-center relative overflow-hidden">
          <div className="bg-[#0B8A82] text-white py-3 px-6 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2 font-extrabold text-sm">
              <CheckCircle2 className="w-5 h-5 text-teal-300" />
              <span>APPOINTMENT CONFIRMED</span>
            </div>
            <span className="text-xs font-mono bg-white/20 px-3 py-1 rounded-full font-bold">
              ID: {confirmedBooking.id}
            </span>
          </div>

          <div className="py-4 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
              Appointment&nbsp;Locked&nbsp;&&nbsp;Fee&nbsp;Paid!
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              A confirmation SMS & WhatsApp pass has been dispatched to{" "}
              <strong className="text-gray-900">+91 {confirmedBooking.patientPhone}</strong>.
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-left space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-gray-200 pb-4">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase">Patient Name</span>
                <p className="font-extrabold text-sm text-gray-900">{confirmedBooking.patientName}</p>
                <p className="text-gray-500 text-[11px]">{confirmedBooking.patientGender}, {confirmedBooking.patientAge || 30} yrs</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase">Assigned Consulting Specialist</span>
                <p className="font-extrabold text-sm text-[#0F1B2D]">{confirmedBooking.doctorName}</p>
                <p className="text-teal-700 text-[11px] font-semibold">{currentDoctor.specialty}</p>
              </div>
            </div>

            <div className="space-y-2 bg-teal-50/70 p-4 rounded-xl border border-teal-200">
              <span className="text-[10px] font-extrabold text-[#0B8A82] uppercase tracking-wider block">
                Selected Hospital Location & Directions
              </span>
              <p className="font-black text-sm text-gray-900">{currentBranch.name}</p>
              <p className="text-gray-700 font-medium">{currentBranch.address}</p>
              <p className="text-[#0B8A82] font-bold">Landmark: {currentBranch.landmark}</p>
              <p className="text-gray-900 font-bold">Phone: +91 {currentBranch.phone}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase">Date & Time</span>
                <p className="font-extrabold text-sm text-gray-900">
                  {confirmedBooking.date} at {confirmedBooking.time}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase">Consultation Fee</span>
                <p className="font-extrabold text-sm text-teal-700">
                  ₹500 PAID ({confirmedBooking.paymentId})
                </p>
              </div>
            </div>
          </div>

          <div data-html2canvas-ignore="true" className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <button
              onClick={handleDownloadPass}
              className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-extrabold text-xs text-gray-800 bg-gray-100 hover:bg-gray-200 border border-gray-300"
            >
              <Download className="w-4 h-4" />
              <span>Download Appointment Pass</span>
            </button>

            <button
              onClick={() => router.push("/patient/dashboard")}
              className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-extrabold text-xs text-white bg-[#0B8A82] hover:bg-[#076F68] shadow-md"
            >
              <User className="w-4 h-4" />
              <span>Go to My Patient Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-extrabold uppercase text-[#C9A84C] tracking-wider">
          Doctor & Time Slot Booking Console
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-gray-900">
          Book Appointment
        </h1>
        <p className="text-xs sm:text-sm text-gray-600">
          Select Clinic & Doctor — View available 20-minute consultation slots for your chosen doctor!
        </p>
      </div>

      {bookingError && (
        <div className="bg-red-50 border-2 border-red-200 p-4 rounded-2xl flex items-center gap-3 text-xs font-bold text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{bookingError}</span>
        </div>
      )}

      <form onSubmit={handleStartVerification} className="space-y-8">
        {/* STEP 1: Select Clinic Location */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2 text-[#0B8A82]">
              <Building2 className="w-5 h-5" />
              <h3 className="text-base font-extrabold text-gray-900">
                1. Select Clinic / Hospital Location
              </h3>
            </div>
            <span className="text-[10px] font-extrabold uppercase bg-teal-100 text-teal-800 px-2.5 py-0.5 rounded-full">
              Step 1
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {branches.map((branch) => {
              const isSelected = selectedBranchId === branch.id;
              const activeDocsCount = doctors.filter(
                (d) => d.branchIds?.includes(branch.id) && d.isAvailableToday !== false
              ).length;

              return (
                <div
                  key={branch.id}
                  onClick={() => {
                    setSelectedBranchId(branch.id);
                    setSelectedTimeSlot("");
                  }}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? "border-[#0B8A82] bg-teal-50/60 shadow-md ring-2 ring-[#0B8A82]/20"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-[#0B8A82] text-white">
                      {branch.type} Location
                    </span>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-[#0B8A82]" />}
                  </div>

                  <h4 className="font-extrabold text-sm text-gray-900 mt-2.5">{branch.name}</h4>
                  <p className="text-xs text-gray-600 mt-1">{branch.address}</p>
                  <p className="text-[11px] text-[#0B8A82] font-bold mt-1">Landmark: {branch.landmark}</p>
                  <p className="text-[11px] text-gray-500 font-medium mt-1">Hours: {branch.timings}</p>

                  <div className="mt-3 pt-2 border-t border-gray-200 flex justify-between items-center text-[11px]">
                    <span className="font-bold text-[#0F1B2D] flex items-center gap-1">
                      <Stethoscope className="w-3.5 h-3.5" />
                      {activeDocsCount} Doctors Active
                    </span>
                    <span className="text-gray-400 font-semibold">Click to Select</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>



        {/* STEP 2: Pick Date */}
        {selectedBranchId && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Calendar className="w-5 h-5 text-[#007A78]" />
              <h3 className="text-base font-bold text-slate-900">
                2. Select Consultation Date
              </h3>
            </div>

            <div className="flex gap-2.5 overflow-x-auto pb-2 min-h-[70px] items-center">
              {getNext7Days().map((day) => {
                const isSelected = selectedDate === day.dateStr;
                return (
                  <button
                    key={day.dateStr}
                    type="button"
                    onClick={() => {
                      setSelectedDate(day.dateStr);
                      setSelectedTimeSlot("");
                    }}
                    className={`flex flex-col items-center justify-center px-4 py-2.5 rounded-lg border text-xs font-semibold shrink-0 transition-all min-w-[100px] ${
                      isSelected
                        ? "bg-[#007A78] text-white border-[#007A78] shadow-sm font-bold"
                        : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <span className="font-bold text-xs">{day.label}</span>
                    <span className={`text-[10px] mt-0.5 ${isSelected ? "text-white/90 font-medium" : "text-slate-500"}`}>{day.dateStr}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: Time Slots for Available Doctors */}
        {selectedBranchId && selectedDate && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900">
                <Clock className="w-5 h-5 text-[#007A78]" />
                <h3 className="text-base font-bold text-slate-900">
                  3. Available Consultation Time Slots ({selectedDate})
                </h3>
              </div>
            </div>

            {(() => {
              // Get doctors actually available on selectedDate at this branch
              const availableDoctors = doctorsAtClinic.filter((doc) => {
                const dateDuty = doc.dateSchedule?.[selectedDate];
                if (dateDuty) {
                  return dateDuty.isAvailable && dateDuty.branchId === selectedBranchId;
                }
                // Strictly enforce scheduling: default availability applies to TODAY ONLY
                const todayStr = new Date().toISOString().split("T")[0];
                if (selectedDate === todayStr) {
                  const belongsToBranch = doc.branchIds?.includes(selectedBranchId);
                  const isOnDutyAtBranch = doc.activeDutyBranchId ? doc.activeDutyBranchId === selectedBranchId : true;
                  return belongsToBranch && doc.isAvailableToday !== false && isOnDutyAtBranch;
                }
                return false;
              });

              if (availableDoctors.length === 0) {
                return (
                  <div className="bg-slate-50 text-slate-700 p-6 rounded-xl border border-slate-200 text-center space-y-1">
                    <p className="font-bold text-sm text-slate-900">No Doctors Scheduled</p>
                    <p className="text-xs text-slate-500">
                      There are no doctors scheduled for consultation at {currentBranch?.shortName} on {selectedDate}. Please select another date or clinic location.
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-6">
                  {availableDoctors.map((doc) => (
                    <div key={doc.id} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                          <DoctorAvatar doc={doc} size="sm" />
                          <div>
                            <h4 className="font-bold text-sm text-slate-900">{doc.name}</h4>
                            <p className="text-xs font-semibold text-[#007A78]">{doc.specialty}</p>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-slate-600 bg-white px-3 py-1 rounded border border-slate-200">
                          Fee: ₹{doc.consultationFee}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                        {timeSlots.map((timeStr) => {
                          const isBooked = existingAppointments.some(
                            (a) =>
                              a.branchId === selectedBranchId &&
                              a.doctorId === doc.id &&
                              a.date === selectedDate &&
                              a.time === timeStr &&
                              a.status !== "cancelled"
                          );

                          const isSelected = selectedTimeSlot === timeStr && selectedDoctorId === doc.id;

                          return (
                            <button
                              key={`${doc.id}-${timeStr}`}
                              type="button"
                              disabled={isBooked}
                              onClick={() => {
                                if (!isBooked) {
                                  setSelectedDoctorId(doc.id);
                                  setSelectedTimeSlot(timeStr);
                                }
                              }}
                              className={`p-3 rounded-lg border text-xs font-semibold transition-all flex items-center justify-between ${
                                isBooked
                                  ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through"
                                  : isSelected
                                  ? "border-[#007A78] bg-[#007A78] text-white shadow-sm"
                                  : "border-slate-200 bg-white text-slate-800 hover:border-[#007A78]"
                              }`}
                            >
                              <div className="flex items-center gap-1.5 font-bold">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{timeStr}</span>
                              </div>
                              {isBooked ? (
                                <span className="text-[10px] uppercase font-bold text-slate-400">
                                  Booked
                                </span>
                              ) : isSelected ? (
                                <Check className="w-4 h-4 text-white" />
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* STEP 4: Patient Details & Medical Reason */}
        {selectedTimeSlot && selectedDoctorId && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-gray-900 border-b border-gray-100 pb-3">
              <User className="w-5 h-5 text-[#0B8A82]" />
              <h3 className="text-base font-extrabold text-gray-900">
                4. Patient Information for {currentDoctor?.name} ({selectedTimeSlot})
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Full Patient Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Kumar"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0B8A82]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Mobile Phone Number (OTP Verified) *</label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile number"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0B8A82]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Age (Years)</label>
                <input
                  type="number"
                  placeholder="e.g. 42"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value ? Number(e.target.value) : "")}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0B8A82]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Gender</label>
                <select
                  value={patientGender}
                  onChange={(e) => setPatientGender(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0B8A82]"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Chief Medical Complaint / Reason for Visit *</label>
              <textarea
                rows={2}
                required
                placeholder="e.g. Severe lower back pain, disc stiffness, or neck numbness..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0B8A82]"
              />
            </div>


          </div>
        )}

        {/* Submit Action Bar */}
        {selectedTimeSlot && selectedDoctorId && (
          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-black text-sm text-white bg-[#C9A84C] hover:bg-[#C9A84C]-hover shadow-xl transition-all active:scale-95"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>Verify Phone & Lock Slot for {currentDoctor?.name} (₹500)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </form>

      {/* OTP Verification Modal */}
      <OTPModal
        phone={patientPhone}
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        onVerified={handleOTPVerified}
      />

      {/* Payment Gateway Modal */}
      <PaymentModal
        amount={500}
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentSuccess={handlePaymentCompleted}
      />
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm font-bold text-gray-500">Initializing Booking Wizard...</div>}>
      <BookingWizardContent />
    </Suspense>
  );
}
