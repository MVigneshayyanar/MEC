"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MedBoshStore } from "@/lib/store";
import { 
  subscribeAppointments, 
  subscribeDoctors, 
  subscribeBranches, 
  updateDoctorDateDutyFirestore, 
  deleteDoctorDateDutyFirestore,
  addDoctorFirestore,
  updateAppointmentStatusFirestore
} from "@/lib/firebaseServices";
import { Appointment, Doctor, Branch, StaffUser } from "@/lib/types";
import { SPECIALTIES } from "@/lib/seedData";
import {
  Stethoscope,
  Calendar,
  Clock,
  User,
  Phone,
  CheckCircle2,
  XCircle,
  PlusCircle,
  LogOut,
  Sliders,
  Building2,
  AlertCircle
} from "lucide-react";

function DoctorDashboardContent() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [staffUser, setStaffUser] = useState<StaffUser | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  const [activeTab, setActiveTab] = useState<"queue" | "duty-status" | "availability" | "add-doctor">("queue");

  // Future Date duty state
  const [selectedDoctorIdForDuty, setSelectedDoctorIdForDuty] = useState<string>("");
  const [targetDutyDate, setTargetDutyDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [isAvailableOnDate, setIsAvailableOnDate] = useState(true);
  const [activeBranchId, setActiveBranchId] = useState("selaiyur");
  const [dutySavedMsg, setDutySavedMsg] = useState("");

  // Add Doctor Form state
  const [newDocName, setNewDocName] = useState("");
  const [newDocQual, setNewDocQual] = useState("");
  const [newDocSpec, setNewDocSpec] = useState("Neuro Surgery");
  const [newDocPhoto, setNewDocPhoto] = useState("https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=600&auto=format&fit=crop");
  const [newDocBio, setNewDocBio] = useState("");
  const [newDocBranch, setNewDocBranch] = useState("selaiyur");
  const [addSuccess, setAddSuccess] = useState("");

  // Availability state
  const [slotDuration, setSlotDuration] = useState(20);
  const [overrideDate, setOverrideDate] = useState("");
  const [overrideMessage, setOverrideMessage] = useState("");

  // Subscribe directly to Firestore backend in real-time
  useEffect(() => {
    setMounted(true);
    const user = MedBoshStore.getStaffUser();
    if (!user || user.role !== "doctor") {
      router.push("/doctor/login");
      return;
    }
    setStaffUser(user);

    const unsubBranches = subscribeBranches(setBranches);
    const unsubDoctors = subscribeDoctors((dList) => {
      setDoctors(dList);
    });

    const unsubAppts = subscribeAppointments((allAppts) => {
      // Filter appointments assigned to this doctor or all today's queue
      const myAppts = allAppts.filter((a) => a.doctorId === user.doctorId);
      setAppointments(myAppts.length > 0 ? myAppts : allAppts);
    });

    return () => {
      unsubBranches();
      unsubDoctors();
      unsubAppts();
    };
  }, [router]);

  // Initialize selectedDoctorIdForDuty
  useEffect(() => {
    if (doctors.length > 0 && !selectedDoctorIdForDuty && staffUser) {
      setSelectedDoctorIdForDuty(staffUser.doctorId || doctors[0].id);
    }
  }, [doctors, staffUser, selectedDoctorIdForDuty]);

  // Update schedule toggles when doctor or date changes
  useEffect(() => {
    const doc = doctors.find(d => d.id === selectedDoctorIdForDuty);
    if (doc) {
      const existing = doc.dateSchedule?.[targetDutyDate];
      if (existing) {
        setIsAvailableOnDate(existing.isAvailable);
        setActiveBranchId(existing.branchId);
      } else {
        setIsAvailableOnDate(doc.isAvailableToday !== false);
        setActiveBranchId(doc.activeDutyBranchId || doc.branchIds?.[0] || "selaiyur");
      }
    }
  }, [selectedDoctorIdForDuty, targetDutyDate, doctors]);

  const handleLogout = () => {
    MedBoshStore.logoutStaff();
    router.push("/");
  };

  const handleStatusUpdate = async (aptId: string, newStatus: Appointment["status"]) => {
    await updateAppointmentStatusFirestore(aptId, newStatus, staffUser?.name || "doctor1");
  };

  const handleSaveDutyStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorIdForDuty) return;

    await updateDoctorDateDutyFirestore(selectedDoctorIdForDuty, targetDutyDate, isAvailableOnDate, activeBranchId);

    const doc = doctors.find(d => d.id === selectedDoctorIdForDuty);
    const branchObj = branches.find((b) => b.id === activeBranchId);
    setDutySavedMsg(
      isAvailableOnDate
        ? `Schedule saved & synced for Dr. ${doc?.name || ""} on ${targetDutyDate}: ON DUTY & AVAILABLE at ${branchObj?.shortName || activeBranchId}.`
        : `Schedule saved & synced for Dr. ${doc?.name || ""} on ${targetDutyDate}: Marked OFF DUTY / HOLIDAY.`
    );
  };

  const handleDeleteOverride = async (doctorId: string, targetDate: string) => {
    await deleteDoctorDateDutyFirestore(doctorId, targetDate);
    setDutySavedMsg(`Schedule override deleted for ${targetDate}. Doctor reverted to default availability.`);
  };

  const getNext7Days = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      const label = i === 0 ? "Today" : i === 1 ? "Tomorrow" : d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
      days.push({ dateStr, label });
    }
    return days;
  };

  const handleAddDoctorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim() || !newDocQual.trim()) return;

    const created = await addDoctorFirestore({
      name: newDocName,
      qualifications: newDocQual,
      specialty: newDocSpec,
      photoUrl: newDocPhoto,
      branchIds: [newDocBranch],
      active: true,
      isAvailableToday: true,
      activeDutyBranchId: newDocBranch,
      bio: newDocBio || `Specialist in ${newDocSpec}`,
      experienceYears: 10,
      consultationFee: 500
    });

    setAddSuccess(`Doctor "${created.name}" successfully added to roster and available for patient bookings!`);

    setNewDocName("");
    setNewDocQual("");
    setNewDocBio("");
  };

  const handleAddOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideDate) return;
    setOverrideMessage(`Date ${overrideDate} successfully marked as HOLIDAY / OFF. Slots disabled.`);
    setOverrideDate("");
  };

  if (!mounted || !staffUser) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-gray-200 text-center space-y-3 shadow-sm">
        <div className="w-10 h-10 border-4 border-[#0B8A82] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-extrabold text-gray-700">Verifying Doctor Session...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header Bar */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#0B8A82] text-white flex items-center justify-center font-extrabold text-2xl shadow-md">
            <Stethoscope className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900">
              Doctor Portal — {staffUser.name}
            </h1>
            <p className="text-xs text-gray-500 font-semibold">
              Live Backend Synced • Future Date Duty Scheduler & Consultation Manager
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout Portal</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 gap-4 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab("queue")}
          className={`pb-3 px-2 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "queue"
              ? "border-[#0B8A82] text-[#0B8A82]"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Live Patient Appointments ({appointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("duty-status")}
          className={`pb-3 px-2 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "duty-status"
              ? "border-[#0B8A82] text-[#0B8A82]"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Set Future Date Duty & Clinic Availability</span>
        </button>

        <button
          onClick={() => setActiveTab("availability")}
          className={`pb-3 px-2 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "availability"
              ? "border-[#0B8A82] text-[#0B8A82]"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Slot Duration & Overrides</span>
        </button>

        <button
          onClick={() => setActiveTab("add-doctor")}
          className={`pb-3 px-2 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "add-doctor"
              ? "border-[#0B8A82] text-[#0B8A82]"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Doctor to Roster</span>
        </button>
      </div>

      {/* TAB 1: Patient Queue */}
      {activeTab === "queue" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-black text-gray-900">
              Patient Consultations List (Real-time Firestore Backend Synced)
            </h2>
            <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Live Updates Active
            </span>
          </div>

          {appointments.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between gap-6"
                >
                  <div className="flex items-start gap-4">
                    {apt.patientPhoto ? (
                      <img
                        src={apt.patientPhoto}
                        alt={apt.patientName}
                        className="w-14 h-14 rounded-xl object-cover border border-gray-200 shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-slate-100 text-gray-500 flex items-center justify-center font-bold text-lg shrink-0">
                        {apt.patientName[0]}
                      </div>
                    )}

                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-sm text-gray-900">{apt.patientName}</h3>
                        <span className="bg-teal-100 text-teal-800 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">
                          {apt.status}
                        </span>
                      </div>
                      <p className="text-gray-600 font-semibold">
                        Phone: <a href={`tel:${apt.patientPhone}`} className="text-[#0F1B2D] hover:underline">{apt.patientPhone}</a> • Gender: {apt.patientGender || "N/A"} • Age: {apt.patientAge || "N/A"}
                      </p>
                      <p className="text-[#0B8A82] font-bold">
                        Hospital: {apt.branchName} ({apt.date} at {apt.time})
                      </p>
                      <p className="text-gray-700 bg-slate-50 p-2 rounded-lg font-medium">
                        Reason: {apt.reason}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-row md:flex-col gap-2 justify-end items-center md:items-end border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
                    <span className="text-[10px] font-mono text-gray-400 font-bold">Ref: {apt.id}</span>

                    {apt.status === "confirmed" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStatusUpdate(apt.id, "completed")}
                          className="flex items-center gap-1 bg-[#0B8A82] text-white font-extrabold text-xs px-3 py-1.5 rounded-lg shadow-sm hover:bg-[#076F68]"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Completed</span>
                        </button>

                        <button
                          onClick={() => handleStatusUpdate(apt.id, "no-show")}
                          className="flex items-center gap-1 bg-red-100 text-red-700 font-extrabold text-xs px-3 py-1.5 rounded-lg hover:bg-red-200"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>No-Show</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-3xl text-center text-sm font-bold text-gray-500">
              No patient appointments booked for today yet.
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Future Date Duty & Availability Switcher */}
      {activeTab === "duty-status" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-black text-gray-900">
              Set Future Date Duty & Clinic Availability
            </h2>
            <p className="text-xs text-gray-500">
              Select any future date to mark yourself ON DUTY or OFF DUTY and choose your active clinic duty location for that date.
            </p>
          </div>

          {dutySavedMsg && (
            <div className="bg-teal-50 border border-teal-300 p-4 rounded-2xl flex items-center gap-3 text-xs font-extrabold text-teal-800">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{dutySavedMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveDutyStatus} className="space-y-6 max-w-xl">
            {/* Step A: Select Future Target Date & Doctor */}
            <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <div>
                <label className="text-xs font-extrabold text-gray-800 block mb-1">1. Select Doctor</label>
                <select
                  value={selectedDoctorIdForDuty}
                  onChange={(e) => setSelectedDoctorIdForDuty(e.target.value)}
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-900"
                >
                  <option value="">-- Choose Doctor to Manage --</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.specialty})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-extrabold text-gray-800 block mb-2">2. Select Target Date for Duty Schedule</label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {getNext7Days().map((day) => {
                  const isSelected = targetDutyDate === day.dateStr;
                  return (
                    <button
                      key={day.dateStr}
                      type="button"
                      onClick={() => setTargetDutyDate(day.dateStr)}
                      className={`flex flex-col items-center justify-center px-3.5 py-2 rounded-xl text-xs font-extrabold shrink-0 border transition-all ${
                        isSelected
                          ? "bg-[#C9A84C] text-white border-[#C9A84C] shadow-md"
                          : "bg-white text-gray-700 border-gray-200 hover:bg-slate-100"
                      }`}
                    >
                      <span>{day.label}</span>
                      <span className="text-[10px] opacity-80">{day.dateStr}</span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2">
                <label className="text-[11px] font-bold text-gray-500 block mb-1">Or Pick Any Specific Future Date:</label>
                <input
                  type="date"
                  value={targetDutyDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setTargetDutyDate(e.target.value)}
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-900"
                />
              </div>
            </div>
            </div>

            {/* Step B: Toggle Duty Status for Target Date */}
            <div className="space-y-2 bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <label className="text-xs font-extrabold text-gray-800 block">3. Duty Status for {targetDutyDate}</label>
              <div className="flex gap-4 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAvailableOnDate(true)}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-extrabold border transition-all flex items-center justify-center gap-2 ${
                    isAvailableOnDate
                      ? "bg-[#0B8A82] text-white border-[#0B8A82] shadow-md"
                      : "bg-white text-gray-700 border-gray-200"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ON DUTY / AVAILABLE</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAvailableOnDate(false)}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-extrabold border transition-all flex items-center justify-center gap-2 ${
                    !isAvailableOnDate
                      ? "bg-red-600 text-white border-red-600 shadow-md"
                      : "bg-white text-gray-700 border-gray-200"
                  }`}
                >
                  <XCircle className="w-4 h-4" />
                  <span>OFF DUTY / LEAVE</span>
                </button>
              </div>
            </div>

            {/* Step C: Select Active Clinic Duty Branch for Target Date */}
            {isAvailableOnDate && (
              <div className="space-y-2 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <label className="text-xs font-extrabold text-gray-800 block">4. Clinic / Hospital Location for {targetDutyDate}</label>
                <div className="space-y-2 pt-1">
                  {branches.map((b) => (
                    <label
                      key={b.id}
                      className={`flex items-center justify-between p-3.5 rounded-xl border text-xs font-extrabold cursor-pointer transition-all ${
                        activeBranchId === b.id
                          ? "border-[#0B8A82] bg-teal-50 text-[#0B8A82] ring-1 ring-[#0B8A82]"
                          : "border-gray-200 bg-white text-gray-800"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="activeBranch"
                          value={b.id}
                          checked={activeBranchId === b.id}
                          onChange={() => setActiveBranchId(b.id)}
                          className="w-4 h-4 text-[#0B8A82] focus:ring-[#0B8A82]"
                        />
                        <div>
                          <span className="block font-black">{b.name}</span>
                          <span className="text-[10px] font-normal text-gray-500">{b.timings}</span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 px-6 bg-[#C9A84C] hover:bg-[#C9A84C]-hover text-white font-black text-xs rounded-xl shadow-lg transition-all"
            >
              Save Schedule for {targetDutyDate}
            </button>
          </form>

          {/* Schedule History Table */}
          {selectedDoctorIdForDuty && (
            <div className="mt-8 border-t border-gray-200 pt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black text-gray-900">
                  Upcoming Schedule & Availability History
                </h3>
                <span className="text-[10px] font-extrabold text-gray-500 uppercase">
                  Explicit Overrides Only
                </span>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-gray-600 font-extrabold uppercase text-[10px] border-b border-gray-200">
                      <tr>
                        <th className="p-3">Date</th>
                        <th className="p-3">Duty Status</th>
                        <th className="p-3">Clinic Location</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-bold">
                      {(() => {
                        const doc = doctors.find(d => d.id === selectedDoctorIdForDuty);
                        const scheduleEntries = Object.entries(doc?.dateSchedule || {})
                          .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime());

                        if (scheduleEntries.length === 0) {
                          return (
                            <tr>
                              <td colSpan={4} className="p-6 text-center text-gray-400">
                                No custom duty schedules set. Doctor is operating on default availability.
                              </td>
                            </tr>
                          );
                        }

                        return scheduleEntries.map(([date, data]) => {
                          const branchName = branches.find(b => b.id === data.branchId)?.shortName || data.branchId;
                          return (
                            <tr key={date} className="hover:bg-slate-50 transition-colors">
                              <td className="p-3 font-mono text-gray-900">{date}</td>
                              <td className="p-3">
                                {data.isAvailable ? (
                                  <span className="bg-teal-100 text-teal-800 px-2 py-0.5 rounded text-[10px] uppercase flex w-fit items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> ON DUTY
                                  </span>
                                ) : (
                                  <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-[10px] uppercase flex w-fit items-center gap-1">
                                    <XCircle className="w-3 h-3" /> OFF DUTY
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-gray-600">
                                {data.isAvailable ? branchName : "-"}
                              </td>
                              <td className="p-3 text-right">
                                <button
                                  onClick={() => handleDeleteOverride(selectedDoctorIdForDuty, date)}
                                  className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition-colors text-[10px] uppercase"
                                >
                                  Delete / Reset
                                </button>
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Availability & Overrides */}
      {activeTab === "availability" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-black text-gray-900">
              Availability & Holiday Override Manager
            </h2>
            <p className="text-xs text-gray-500">
              Define consultation slot duration and block specific dates for leave/holidays.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <label className="text-xs font-extrabold text-gray-800 block">Default Slot Duration (Minutes)</label>
              <select
                value={slotDuration}
                onChange={(e) => setSlotDuration(Number(e.target.value))}
                className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs font-bold"
              >
                <option value={15}>15 Minutes per Slot</option>
                <option value={20}>20 Minutes per Slot (Default)</option>
                <option value={30}>30 Minutes per Slot</option>
              </select>
              <p className="text-[11px] text-gray-500">
                Changing slot duration updates real-time patient booking grids automatically.
              </p>
            </div>

            <form onSubmit={handleAddOverride} className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <label className="text-xs font-extrabold text-gray-800 block">Mark Day OFF / Leave Override</label>
              <input
                type="date"
                required
                value={overrideDate}
                onChange={(e) => setOverrideDate(e.target.value)}
                className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs font-bold"
              />
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-[#C9A84C] text-white text-xs font-extrabold rounded-xl shadow-sm"
              >
                Block Date & Mark Holiday
              </button>

              {overrideMessage && (
                <p className="text-xs font-bold text-[#0B8A82] bg-teal-50 p-2 rounded-lg">
                  {overrideMessage}
                </p>
              )}
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: Add Doctor to Roster */}
      {activeTab === "add-doctor" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-black text-gray-900">
              Add New Doctor to Hospital Roster
            </h2>
            <p className="text-xs text-gray-500">
              Expanding clinic roster: New doctors immediately get their availability calendar and appear under their assigned clinic.
            </p>
          </div>

          {addSuccess && (
            <div className="bg-teal-50 border border-teal-300 p-4 rounded-2xl flex items-center gap-3 text-xs font-extrabold text-teal-800">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{addSuccess}</span>
            </div>
          )}

          <form onSubmit={handleAddDoctorSubmit} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Doctor Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. M. Karthik, M.S."
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Qualifications *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. M.B.B.S, M.S. (Ortho), F.N.B"
                  value={newDocQual}
                  onChange={(e) => setNewDocQual(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Specialty</label>
                <select
                  value={newDocSpec}
                  onChange={(e) => setNewDocSpec(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900"
                >
                  {SPECIALTIES.map((s) => (
                    <option key={s.id} value={s.title}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Primary Hospital Branch</label>
                <select
                  value={newDocBranch}
                  onChange={(e) => setNewDocBranch(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Doctor Photo Image URL</label>
              <input
                type="url"
                value={newDocPhoto}
                onChange={(e) => setNewDocPhoto(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Doctor Biography / Clinical Summary</label>
              <textarea
                rows={3}
                placeholder="Summary of experience and surgical specializations..."
                value={newDocBio}
                onChange={(e) => setNewDocBio(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900"
              />
            </div>

            <button
              type="submit"
              className="py-3.5 px-6 bg-[#0B8A82] hover:bg-[#076F68] text-white font-extrabold text-xs rounded-xl shadow-md transition-all"
            >
              Add Doctor to Roster
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default function DoctorDashboardPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm font-bold text-gray-500">Loading Doctor Dashboard...</div>}>
      <DoctorDashboardContent />
    </Suspense>
  );
}
