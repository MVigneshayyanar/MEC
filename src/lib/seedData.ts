import { Branch, Doctor, StaffUser, Appointment } from "./types";

export const SEED_BRANCHES: Branch[] = [
  {
    id: "selaiyur",
    name: "Med Bosh Clinic (Brain Ortho Spine Health)",
    shortName: "Med Bosh Selaiyur",
    tagline: "Specialist Brain, Neuro & Spine Care Center",
    address: "No.210/912, Velachery Main Road, Selaiyur, Chennai-600073",
    landmark: "Near Camp Road Bus Stop",
    phone: "9118277575",
    whatsapp: "9118277575",
    timings: "Mon–Sat: 05:00 PM – 09:00 PM",
    type: "Clinic"
  },
  {
    id: "guduvanchery",
    name: "BOSH - Brain Orthopaedic Spine Hospital",
    shortName: "BOSH Guduvanchery",
    tagline: "Multi-Speciality Hospital & Advanced Surgery Center",
    address: "No 7 Kambar Street, NGO Colony, Guduvanchery, Chennai",
    landmark: "Near Marry Brown",
    phone: "9118277575",
    whatsapp: "9118277575",
    timings: "Mon–Sat: 05:00 PM – 09:00 PM (Cash Accepted On-Site)",
    type: "Hospital"
  }
];

export const SPECIALTIES = [
  { id: "neuro-surgery", title: "Neuro Surgery", desc: "Complex brain tumor & vascular surgeries", icon: "Brain" },
  { id: "neurology", title: "Neurology", desc: "Stroke, epilepsy, headache & nerve disorders", icon: "Activity" },
  { id: "neuro-spine", title: "Neuro Spine", desc: "Microscopic & minimally invasive spinal surgery", icon: "Bone" },
  { id: "ortho-spine", title: "Ortho Spine", desc: "Deformity correction & disc herniation repair", icon: "Crosshair" },
  { id: "endoscopy-surgery", title: "Endoscopy Brain & Spine Surgery", desc: "Keyhole brain & endoscopic disc procedures", icon: "Scan" },
  { id: "pain-management", title: "Pain Management Clinic", desc: "Targeted nerve blocks & chronic spine pain relief", icon: "Zap" }
];

export const SEED_DOCTORS: Doctor[] = [
  {
    id: "dr-ar-baskar",
    name: "Dr. A.R. Baskar",
    qualifications: "M.B.B.S., M.S., D.Ortho., M.Ch. (Neurosurgery)",
    specialty: "Neuro Surgery & Neuro Spine",
    photoUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=600&auto=format&fit=crop",
    branchIds: ["selaiyur", "guduvanchery"],
    active: true,
    isAvailableToday: true,
    activeDutyBranchId: "selaiyur",
    bio: "Chief Consultant Neurosurgeon & Spine Specialist with 25 Years of Healthcare excellence. Pioneer in endoscopic brain surgery, micro-discectomy, and complex spinal reconstruction.",
    experienceYears: 25,
    consultationFee: 500
  },
  {
    id: "dr-s-madhan",
    name: "Dr. S. Madhan",
    qualifications: "M.B.B.S., D.A., M.Ch. (Neurosurgery)",
    specialty: "Neuro Surgery & Endoscopy Brain & Spine Surgery",
    photoUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=600&auto=format&fit=crop",
    branchIds: ["selaiyur", "guduvanchery"],
    active: true,
    isAvailableToday: true,
    activeDutyBranchId: "guduvanchery",
    bio: "Consultant Neurosurgeon specializing in keyhole brain surgery, cervical spine stabilization, neuro-trauma care, and endoscopic spinal decompression.",
    experienceYears: 16,
    consultationFee: 500
  },
  {
    id: "dr-n-arunkumar",
    name: "Dr. N. Arun Kumar",
    qualifications: "M.B.B.S., M.D., D.M. (Neurology)",
    specialty: "Neurology & Pain Management Clinic",
    photoUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=600&auto=format&fit=crop",
    branchIds: ["selaiyur"],
    active: true,
    isAvailableToday: true,
    activeDutyBranchId: "selaiyur",
    bio: "Consultant Neurologist specializing in stroke management, epilepsy, Parkinson's disease, peripheral neuropathy, and targeted nerve block pain management.",
    experienceYears: 14,
    consultationFee: 500
  }
];

export const SEED_STAFF: StaffUser[] = [
  {
    id: "staff-doc-1",
    username: "doctor1",
    role: "doctor",
    name: "Dr. A.R. Baskar",
    doctorId: "dr-ar-baskar",
    branchId: "selaiyur"
  },
  {
    id: "staff-rec-1",
    username: "receptionist1",
    role: "receptionist",
    name: "Med Bosh Desk",
    branchId: "selaiyur"
  }
];

// Zero fake appointments — clean database
export const SEED_APPOINTMENTS: Appointment[] = [];
