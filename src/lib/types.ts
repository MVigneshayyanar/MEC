export interface Branch {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  address: string;
  landmark: string;
  phone: string;
  whatsapp: string;
  timings: string;
  type: 'Clinic' | 'Hospital';
}

export interface DateDutyStatus {
  isAvailable: boolean;
  branchId: string;
}

export interface Doctor {
  id: string;
  name: string;
  qualifications: string;
  specialty: string;
  photoUrl: string;
  branchIds: string[];
  active: boolean;
  isAvailableToday?: boolean; // Default today fallback
  activeDutyBranchId?: string; // Default branch fallback
  dateSchedule?: Record<string, DateDutyStatus>; // Date-wise future duty status (e.g. "2026-07-28": { isAvailable: true, branchId: "guduvanchery" })
  bio: string;
  experienceYears: number;
  consultationFee: number;
}

export interface WeeklySchedule {
  [day: string]: { start: string; end: string }[];
}

export interface AvailabilityRule {
  doctorId: string;
  weeklyPattern: WeeklySchedule;
  slotDurationMins: number;
  maxCapacityPerSlot: number;
  overrides: Record<string, 'off' | { customSlots?: string[] }>;
}

export interface TimeSlot {
  id: string;
  doctorId: string;
  branchId: string;
  date: string;
  time: string;
  capacity: number;
  bookedCount: number;
  status: 'open' | 'full' | 'blocked';
}

export interface Patient {
  phone: string;
  name: string;
  age?: number;
  gender?: 'Male' | 'Female' | 'Other';
  photoUrl?: string;
  createdAt: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';

export interface Appointment {
  id: string;
  patientPhone: string;
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  patientPhoto?: string;
  doctorId: string;
  doctorName: string;
  branchId: string;
  branchName: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  reason: string;
  feePaid: boolean;
  paymentId?: string;
  createdBy: 'patient' | 'reception';
  createdAt: string;
}

export interface AppointmentAudit {
  id: string;
  appointmentId: string;
  action: 'booked' | 'confirmed' | 'cancelled' | 'rescheduled' | 'completed' | 'no-show' | 'fee_paid';
  performedBy: string;
  timestamp: string;
  details?: string;
}

export interface StaffUser {
  id: string;
  username: string;
  role: 'doctor' | 'receptionist';
  name: string;
  doctorId?: string;
  branchId?: string;
}
