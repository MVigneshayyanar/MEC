"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { MedBoshStore, generateStandardTimeSlots } from "@/lib/store";
import { 
  subscribeAppointments, 
  subscribeDoctors, 
  subscribeBranches,
  bookAppointmentFirestoreTransaction,
  updateAppointmentStatusFirestore,
  markFeePaidFirestore
} from "@/lib/firebaseServices";
import { Appointment, Doctor, Branch, StaffUser } from "@/lib/types";
import {
  UserCheck,
  Calendar,
  Clock,
  User,
  Phone,
  Search,
  PlusCircle,
  LogOut,
  CheckCircle2,
  XCircle,
  CreditCard,
  Building2,
  DollarSign,
  AlertCircle
} from "lucide-react";

function ReceptionDashboardContent() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [staffUser, setStaffUser] = useState<StaffUser | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  // Filter & Search states
  const [selectedBranchId, setSelectedBranchId] = useState<string>("selaiyur");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Walk-in booking modal state
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [walkInDocId, setWalkInDocId] = useState("");
  const [walkInTime, setWalkInTime] = useState("");
  const [walkInName, setWalkInName] = useState("");
  const [walkInPhone, setWalkInPhone] = useState("");
  const [walkInAge, setWalkInAge] = useState<number | "">("");
  const [walkInGender, setWalkInGender] = useState("Male");
  const [walkInReason, setWalkInReason] = useState("");
  const [walkInFeePaid, setWalkInFeePaid] = useState(true);
  const [bookingMessage, setBookingMessage] = useState("");

  useEffect(() => {
    setMounted(true);
    const user = MedBoshStore.getStaffUser();
    if (!user || user.role !== "receptionist") {
      router.push("/reception/login");
      return;
    }
    setStaffUser(user);
    const unsubBranches = subscribeBranches(setBranches);
    const unsubDoctors = subscribeDoctors(setDoctors);
    const unsubAppts = subscribeAppointments(setAppointments);

    return () => {
      unsubBranches();
      unsubDoctors();
      unsubAppts();
    };
  }, [router]);

  const handleLogout = () => {
    MedBoshStore.logoutStaff();
    router.push("/");
  };

  const handleWalkInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingMessage("");

    if (!walkInDocId || !walkInTime || !walkInName || !walkInPhone) {
      setBookingMessage("Please fill all required fields.");
      return;
    }

    const currentBranch = branches.find((b) => b.id === selectedBranchId);
    const currentDoc = doctors.find((d) => d.id === walkInDocId);

    const res = await bookAppointmentFirestoreTransaction({
      patientPhone: walkInPhone.replace(/\D/g, ""),
      patientName: walkInName,
      patientAge: walkInAge ? Number(walkInAge) : undefined,
      patientGender: walkInGender,
      doctorId: walkInDocId,
      doctorName: currentDoc?.name || "",
      branchId: selectedBranchId,
      branchName: currentBranch?.name || "",
      date: selectedDate,
      time: walkInTime,
      reason: walkInReason || "Walk-in consultation",
      createdBy: "reception",
      feePaid: walkInFeePaid,
      paymentId: walkInFeePaid ? `pay_CASH_COUNTER_${Date.now()}` : undefined
    });

    if (res.success) {
      setShowWalkInModal(false);
      setWalkInName("");
      setWalkInPhone("");
      setWalkInReason("");
    } else {
      setBookingMessage(res.message || "Booking failed.");
    }
  };

  const handleMarkPaid = async (aptId: string) => {
    await markFeePaidFirestore(aptId, `pay_CASH_COUNTER_${Date.now()}`, staffUser?.name || "receptionist1");
  };

  const handleCancel = async (aptId: string) => {
    await updateAppointmentStatusFirestore(aptId, "cancelled", staffUser?.name || "receptionist1");
  };

  const filteredAppointments = appointments.filter((apt) => {
    const matchesBranch = !selectedBranchId || apt.branchId === selectedBranchId;
    const matchesQuery =
      apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.patientPhone.includes(searchQuery) ||
      apt.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBranch && matchesQuery;
  });

  const branchDoctors = doctors.filter((d) => d.branchIds?.includes(selectedBranchId));
  const timeSlots = generateStandardTimeSlots(selectedBranchId, selectedDate);

  if (!mounted || !staffUser) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-gray-200 text-center space-y-3 shadow-sm">
        <div className="w-10 h-10 border-4 border-[#0F1B2D] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-extrabold text-gray-700">Verifying Reception Session...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Top Header Bar */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#0F1B2D] text-white flex items-center justify-center font-extrabold text-2xl shadow-md">
            <UserCheck className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900">
              Reception Master Desk — {staffUser.name}
            </h1>
            <p className="text-xs text-gray-500 font-semibold">
              Live Multi-Doctor Availability & Walk-In Booking
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowWalkInModal(true)}
            className="flex items-center gap-1.5 bg-[#C9A84C] hover:bg-[#C9A84C]-hover text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Book Walk-In / Phone Patient</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs px-3.5 py-2.5 rounded-xl"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Branch & Date & Search */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-extrabold text-gray-700 block mb-1">Select Active Branch Desk</label>
          <select
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900"
          >
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-extrabold text-gray-700 block mb-1">Date Calendar View</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900"
          />
        </div>

        <div>
          <label className="text-xs font-extrabold text-gray-700 block mb-1">Search Patient / Phone / Ref ID</label>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900"
            />
          </div>
        </div>
      </div>

      {/* Live Master Slot Matrix Across Doctors */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
          <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#0F1B2D]" />
            <span>Master Doctor Availability Matrix ({selectedDate})</span>
          </h2>
          <span className="text-xs text-teal-700 font-bold bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
            Live Concurrency Locking Active
          </span>
        </div>

        <div className="space-y-6">
          {(() => {
            const availableDoctors = branchDoctors.filter((doc) => {
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
                <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200">
                  <p className="text-gray-500 font-bold text-sm">No doctors have scheduled duty on this date at this location. (OFF DUTY)</p>
                </div>
              );
            }

            return availableDoctors.map((doc) => {
            const docAppts = appointments.filter(
              (a) => a.doctorId === doc.id && a.date === selectedDate && a.status !== "cancelled"
            );
            const bookedTimes = docAppts.map((a) => a.time);

            return (
              <div key={doc.id} className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-extrabold text-xs text-gray-900">{doc.name}</h3>
                    <p className="text-[11px] text-[#0B8A82] font-bold">{doc.specialty}</p>
                  </div>
                  <span className="text-xs font-bold text-gray-600">
                    Booked: {bookedTimes.length} / {timeSlots.length} slots
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-8 gap-2 pt-1">
                  {timeSlots.map((slot) => {
                    const isBooked = bookedTimes.includes(slot);
                    const matchingApt = docAppts.find((a) => a.time === slot);

                    return (
                      <button
                        key={slot}
                        onClick={() => {
                          if (!isBooked) {
                            setWalkInDocId(doc.id);
                            setWalkInTime(slot);
                            setShowWalkInModal(true);
                          }
                        }}
                        className={`p-2 rounded-xl text-[11px] font-extrabold border text-center transition-all ${
                          isBooked
                            ? "bg-blue-100 border-blue-300 text-[#0F1B2D]"
                            : "bg-white border-gray-200 text-[#0B8A82] hover:bg-[#0B8A82] hover:text-white"
                        }`}
                        title={matchingApt ? `Booked by ${matchingApt.patientName}` : "Click to book walk-in"}
                      >
                        <div>{slot}</div>
                        <div className="text-[9px] font-normal truncate mt-0.5">
                          {matchingApt ? matchingApt.patientName.split(" ")[0] : "Available"}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
            });
          })()}
        </div>
      </div>

      {/* Appointments Management Table */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-4">
        <h2 className="text-base font-black text-gray-900">
          Recent Appointments List ({filteredAppointments.length})
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-slate-50 text-gray-500 font-extrabold uppercase text-[10px]">
                <th className="p-3">Ref ID</th>
                <th className="p-3">Patient Info</th>
                <th className="p-3">Doctor</th>
                <th className="p-3">Date & Time</th>
                <th className="p-3">Status</th>
                <th className="p-3">Fee Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-800">
              {filteredAppointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-mono font-bold text-[#0F1B2D]">{apt.id}</td>
                  <td className="p-3">
                    <p className="font-extrabold text-gray-900">{apt.patientName}</p>
                    <p className="text-[11px] text-gray-500">{apt.patientPhone}</p>
                  </td>
                  <td className="p-3 font-semibold text-gray-700">{apt.doctorName}</td>
                  <td className="p-3 font-bold text-[#C9A84C]">{apt.date} @ {apt.time}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      apt.status === "confirmed" ? "bg-teal-100 text-teal-800" : "bg-gray-100 text-gray-600"
                    }`}>
                      {apt.status}
                    </span>
                  </td>
                  <td className="p-3">
                    {apt.feePaid ? (
                      <span className="text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        Fee Paid
                      </span>
                    ) : (
                      <button
                        onClick={() => handleMarkPaid(apt.id)}
                        className="text-xs font-bold text-white bg-[#C9A84C] hover:bg-[#C9A84C]-hover px-2.5 py-1 rounded shadow-sm"
                      >
                        Mark Cash Paid
                      </button>
                    )}
                  </td>
                  <td className="p-3 text-right space-x-2">
                    {apt.status === "confirmed" && (
                      <button
                        onClick={() => handleCancel(apt.id)}
                        className="text-red-600 hover:text-red-800 font-bold text-xs"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Book Walk-in / Phone-in Modal */}
      {showWalkInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowWalkInModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>

            <h3 className="text-lg font-black text-gray-900">
              Book Walk-In / Phone Patient
            </h3>

            {bookingMessage && (
              <p className="text-xs font-bold text-red-600 bg-red-50 p-2 rounded-lg">
                {bookingMessage}
              </p>
            )}

            <form onSubmit={handleWalkInSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block">Select Doctor *</label>
                <select
                  value={walkInDocId}
                  onChange={(e) => setWalkInDocId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-gray-200 rounded-xl font-bold"
                >
                  <option value="">Choose Doctor...</option>
                  {branchDoctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.specialty})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block">Time Slot *</label>
                <select
                  value={walkInTime}
                  onChange={(e) => setWalkInTime(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-gray-200 rounded-xl font-bold"
                >
                  <option value="">Choose Time Slot...</option>
                  {timeSlots.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block">Patient Name *</label>
                <input
                  type="text"
                  required
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-gray-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={walkInPhone}
                  onChange={(e) => setWalkInPhone(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-gray-200 rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-gray-700 block">Age</label>
                  <input
                    type="number"
                    value={walkInAge}
                    onChange={(e) => setWalkInAge(e.target.value ? Number(e.target.value) : "")}
                    className="w-full p-2.5 bg-slate-50 border border-gray-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block">Gender</label>
                  <select
                    value={walkInGender}
                    onChange={(e) => setWalkInGender(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-gray-200 rounded-xl font-bold"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block">Reason for Visit</label>
                <input
                  type="text"
                  value={walkInReason}
                  onChange={(e) => setWalkInReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-gray-200 rounded-xl font-bold"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="walkin-fee"
                  checked={walkInFeePaid}
                  onChange={(e) => setWalkInFeePaid(e.target.checked)}
                  className="w-4 h-4 text-[#0B8A82] rounded"
                />
                <label htmlFor="walkin-fee" className="font-extrabold text-gray-800">
                  Mark Consultation Fee Paid in Cash at Counter
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-[#0B8A82] text-white font-extrabold rounded-xl shadow-md text-xs mt-2"
              >
                Confirm & Lock Booking
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReceptionDashboardPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm font-bold text-gray-500">Loading Reception Desk...</div>}>
      <ReceptionDashboardContent />
    </Suspense>
  );
}
