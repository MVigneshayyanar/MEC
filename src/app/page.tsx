"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import {
  Search,
  Stethoscope,
  Calendar,
  Phone,
  ShieldCheck,
  ArrowRight,
  Brain,
  Activity,
  Bone,
  Scan,
  Zap,
  Crosshair,
  Star,
  ChevronDown,
  Clock,
  Building2,
  CheckCircle2,
} from "lucide-react";
import BranchCard from "@/components/BranchCard";
import DoctorCard from "@/components/DoctorCard";
import { subscribeBranches, subscribeDoctors } from "@/lib/firebaseServices";
import { Branch, Doctor } from "@/lib/types";
import { SPECIALTIES } from "@/lib/seedData";

const FAQS = [
  {
    q: "How do I book an appointment at Med Bosh Selaiyur or BOSH Guduvanchery?",
    a: "Select your preferred branch or doctor, pick an available date and time slot, enter patient details, verify via SMS OTP, and pay the ₹500 fee online or choose cash payment on-site at the clinic counter."
  },
  {
    q: "Can I pay cash at the hospital counter instead of online?",
    a: "Yes! At BOSH Guduvanchery (NGO Colony), cash payments are accepted at the reception desk. Walk-in patients can also register directly at the counter."
  },
  {
    q: "Is the ₹500 booking fee adjusted against consultation?",
    a: "Yes, the ₹500 fee locks your consultation slot and is fully credited toward your consultation bill upon visit."
  },
  {
    q: "What conditions are treated at Med Bosh Clinic & Hospital?",
    a: "We specialize in endoscopic brain tumor surgery, keyhole spine discectomy, cervical spondylosis, sciatica, stroke management, scoliosis correction, and chronic nerve pain management."
  }
];

const TESTIMONIALS = [
  {
    name: "Senthil Nathan",
    role: "Spine Surgery Patient",
    location: "Selaiyur, Chennai",
    text: "Dr. Bosh performed microscopic lumbar discectomy. I suffered severe leg pain for 6 months, and within 24 hours of surgery I was back on my feet pain-free. Outstanding care!",
    rating: 5
  },
  {
    name: "Priya Venkatesh",
    role: "Neurology Patient",
    location: "Guduvanchery, Chennai",
    text: "Booking via phone OTP took less than 2 minutes. The reception team at BOSH Guduvanchery was extremely prompt and organized. Zero wait time!",
    rating: 5
  }
];

function HomePageContent() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    const unsubBranches = subscribeBranches(setBranches);
    const unsubDoctors = subscribeDoctors(setDoctors);
    return () => {
      unsubBranches();
      unsubDoctors();
    };
  }, []);

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSpec = selectedSpecialty === "all" || doc.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase());
    const matchesQuery = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || doc.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSpec && matchesQuery;
  });

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Brain": return <Brain className="w-5 h-5 text-[#007A78]" />;
      case "Activity": return <Activity className="w-5 h-5 text-[#007A78]" />;
      case "Bone": return <Bone className="w-5 h-5 text-[#007A78]" />;
      case "Crosshair": return <Crosshair className="w-5 h-5 text-[#007A78]" />;
      case "Scan": return <Scan className="w-5 h-5 text-[#007A78]" />;
      default: return <Zap className="w-5 h-5 text-[#007A78]" />;
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section — Clean Medical Design */}
      <section className="bg-white border-b border-slate-200 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 bg-[#E6F4F4] px-3.5 py-1.5 rounded-md text-xs font-semibold text-[#007A78] border border-[#007A78]/20">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Super Speciality Brain, Neuro &amp; Spine Care</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight">
                Advanced Neuro &amp; Spine Surgery in Chennai
              </h1>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl font-normal">
                Expert surgical care in disc prolapse, cervical spondylosis, stroke, brain tumors &amp; spine deformities across{" "}
                <strong className="text-slate-900">Med Bosh Selaiyur</strong> &amp;{" "}
                <strong className="text-slate-900">BOSH Hospital Guduvanchery</strong>.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a
                  href="tel:+919118277575"
                  className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3.5 px-5 rounded-lg shadow-sm transition-all"
                >
                  <Phone className="w-4 h-4 text-[#007A78]" />
                  <span>Emergency: +91 9118-27-7575</span>
                </a>

                <Link
                  href="/book"
                  className="flex items-center justify-center gap-2 bg-[#007A78] hover:bg-[#005E5C] text-white font-bold text-xs py-3.5 px-5 rounded-lg shadow-sm transition-all"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Appointment (₹500)</span>
                </Link>
              </div>
            </div>

            {/* Right Booking Console Card */}
            <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#007A78] block">
                  Quick Doctor Search
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Find Doctor &amp; Book Slot
                </h3>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Search doctor by name or specialty..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#007A78]/30"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Select Treatment Specialty:</label>
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="w-full py-2.5 px-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#007A78]/30"
                >
                  <option value="all">All Specialties (6 Available)</option>
                  {SPECIALTIES.map((s) => (
                    <option key={s.id} value={s.title}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>

              <Link
                href={`/book${selectedSpecialty !== "all" ? `?specialty=${encodeURIComponent(selectedSpecialty)}` : ""}`}
                className="w-full flex items-center justify-center gap-2 bg-[#007A78] hover:bg-[#005E5C] text-white font-bold text-xs py-3 rounded-lg shadow-sm transition-all"
              >
                <Stethoscope className="w-4 h-4" />
                <span>Check Available Slots</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Clinical Performance Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#007A78]">18+</span>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Years Excellence</p>
          </div>
          <div className="space-y-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">15,000+</span>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Surgeries Done</p>
          </div>
          <div className="space-y-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#007A78]">2</span>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Chennai Centers</p>
          </div>
          <div className="space-y-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700">99.4%</span>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Satisfaction</p>
          </div>
        </div>
      </section>

      {/* Hospital Branches */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 border-b border-slate-200 pb-3">
          <div>
            <span className="text-xs font-bold uppercase text-[#007A78] tracking-wider">
              2 Locations in Chennai
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Clinic &amp; Hospital Locations
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Walk-in consultation or online slot booking
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {branches.map((branch) => (
            <BranchCard key={branch.id} branch={branch} />
          ))}
        </div>
      </section>

      {/* Specialties */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 border-b border-slate-200 pb-3">
          <div>
            <span className="text-xs font-bold uppercase text-[#007A78] tracking-wider">
              Super Speciality Treatments
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Key Specialties
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SPECIALTIES.map((spec) => (
            <Link
              key={spec.id}
              href={`/doctors?specialty=${encodeURIComponent(spec.title)}`}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-[#007A78] transition-all group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-[#E6F4F4] flex items-center justify-center">
                  {getIcon(spec.icon)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#007A78] transition-colors">
                    {spec.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">
                    {spec.desc}
                  </p>
                </div>
              </div>
              <div className="pt-4 flex items-center gap-1.5 text-xs font-semibold text-[#007A78]">
                <span>Browse Specialists</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Doctors */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 border-b border-slate-200 pb-3">
          <div>
            <span className="text-xs font-bold uppercase text-[#007A78] tracking-wider">
              Consulting Specialists
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Expert Doctors
            </h2>
          </div>
          <Link
            href="/doctors"
            className="text-xs font-bold text-[#007A78] hover:underline flex items-center gap-1"
          >
            <span>View All Doctors</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doc) => (
            <DoctorCard key={doc.id} doctor={doc} branches={branches} />
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="border-b border-slate-200 pb-3">
          <span className="text-xs font-bold uppercase text-[#007A78] tracking-wider">
            Patient Feedback
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Verified Patient Reviews
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex gap-1 text-amber-500">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed italic">
                "{t.text}"
              </p>
              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-slate-900">{t.name}</p>
                  <p className="text-[11px] text-slate-500">{t.role}</p>
                </div>
                <span className="text-[10px] font-semibold text-[#007A78] bg-[#E6F4F4] px-2.5 py-1 rounded border border-[#007A78]/20">
                  {t.location}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQs */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 space-y-4">
        <div className="text-center space-y-1">
          <span className="text-xs font-bold uppercase text-[#007A78] tracking-wider">
            Patient Assistance
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex justify-between items-center gap-4 font-bold text-xs sm:text-sm text-slate-900 hover:text-[#007A78] transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm font-semibold text-slate-500">Loading Med Bosh Clinic...</div>}>
      <HomePageContent />
    </Suspense>
  );
}
