import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "@/styles/globals.css";
import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";

const font = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400","500","600","700","800"], variable: "--font-pjs", display: "swap" });

export const metadata: Metadata = {
  title: "Med Bosh Clinic & BOSH Hospital | Brain, Neuro & Spine Care Chennai",
  description: "Book appointment with expert Neurosurgeons, Neurologists & Spine Specialists at Med Bosh Selaiyur & BOSH Guduvanchery Chennai.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${font.variable} scroll-smooth`}>
      <body className={`${font.className} font-sans antialiased min-h-screen flex flex-col bg-slate-50 text-gray-900 pb-16 lg:pb-0`}>
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
        </div>

        {/* Footer — clean, editorial, professional */}
        <footer className="bg-slate-900 text-white mt-20">
          {/* Top teal accent line */}
          <div className="h-1 bg-gradient-to-r from-[#0B8A82] via-[#0B8A82] to-[#C9A84C]" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
              {/* Brand */}
              <div className="md:col-span-1 space-y-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-[#0B8A82] flex items-center justify-center font-black text-white text-sm">MB</div>
                  <div>
                    <span className="text-[15px] font-extrabold text-white leading-none block">Med Bosh Clinic</span>
                    <span className="text-[10px] text-[#0B8A82] font-bold uppercase tracking-widest">Brain · Neuro · Spine</span>
                  </div>
                </div>
                <p className="text-[12px] text-white/50 leading-relaxed">
                  Pioneering endoscopic brain surgery, keyhole spine repair, and advanced neurological care across Chennai.
                </p>
                <a href="tel:+919118277575"
                  className="inline-flex items-center gap-2 text-[12px] font-bold text-slate-900 bg-[#C9A84C] hover:bg-[#b8933e] px-4 py-2.5 rounded-lg transition-colors">
                  Emergency: +91 9118-27-7575
                </a>
              </div>

              {/* Selaiyur */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-extrabold text-[#0B8A82] uppercase tracking-widest pb-2 border-b border-white/10">Selaiyur Branch</h4>
                <p className="text-[12px] text-white/60 leading-snug">No.210/912, Velachery Main Road,<br />Selaiyur, Chennai – 600073</p>
                <p className="text-[11px] text-white/40">Near Camp Road Bus Stop</p>
                <p className="text-[12px] text-[#0B8A82] font-semibold">Mon–Sat · 5:00 PM – 9:00 PM</p>
              </div>

              {/* Guduvanchery */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-extrabold text-[#C9A84C] uppercase tracking-widest pb-2 border-b border-white/10">Guduvanchery Branch</h4>
                <p className="text-[12px] text-white/60 leading-snug">No 7 Kambar Street, NGO Colony,<br />Guduvanchery, Chennai</p>
                <p className="text-[11px] text-white/40">Near Marry Brown</p>
                <p className="text-[12px] text-[#C9A84C] font-semibold">Mon–Sat · 5:00 PM – 9:00 PM · Cash Accepted</p>
              </div>

              {/* Access */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-extrabold text-white/40 uppercase tracking-widest pb-2 border-b border-white/10">Quick Access</h4>
                <div className="space-y-2 text-[12px] font-medium">
                  <a href="/doctor/login" className="block text-white/60 hover:text-[#0B8A82] transition-colors">Doctor Portal (doctor1)</a>
                  <a href="/reception/login" className="block text-white/60 hover:text-[#0B8A82] transition-colors">Reception Portal (receptionist1)</a>
                  <a href="/patient/login" className="block text-white/60 hover:text-[#0B8A82] transition-colors">Patient Account (OTP Login)</a>
                  <a href="/book" className="block text-[#C9A84C] font-bold hover:underline pt-1">Book Appointment Online · ₹500</a>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center text-[11px] text-white/30 gap-3">
              <span>© {new Date().getFullYear()} Med Bosh Clinic & BOSH Hospital. All rights reserved.</span>
              <div className="flex gap-5">
                <span>NABH Standard Ready</span>
                <span>ACID Concurrency Locking Active</span>
              </div>
            </div>
          </div>
        </footer>

        <MobileBottomNav />
      </body>
    </html>
  );
}
