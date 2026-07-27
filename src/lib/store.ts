import { Branch, Doctor, StaffUser, Appointment, TimeSlot, AvailabilityRule, AppointmentAudit } from "./types";
import { SEED_BRANCHES, SEED_DOCTORS, SEED_STAFF, SEED_APPOINTMENTS } from "./seedData";
import {
  seedFirestoreIfEmpty,
  bookAppointmentFirestoreTransaction,
  addDoctorFirestore,
  updateAppointmentStatusFirestore,
  markFeePaidFirestore
} from "./firebaseServices";

const STORAGE_KEYS = {
  BRANCHES: "medbosh_branches_v1",
  DOCTORS: "medbosh_doctors_v1",
  STAFF: "medbosh_staff_v1",
  APPOINTMENTS: "medbosh_appointments_v1",
  PATIENT_AUTH: "medbosh_patient_auth_v1",
  STAFF_AUTH: "medbosh_staff_auth_v1",
  AUDIT: "medbosh_audit_v1"
};

const getItem = <T>(key: string, defaultVal: T): T => {
  if (typeof window === "undefined") return defaultVal;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
};

const setItem = <T>(key: string, val: T): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error("Storage save error", e);
  }
};

if (typeof window !== "undefined") {
  seedFirestoreIfEmpty().catch(console.error);
}

// 5:00 PM to 9:00 PM consultation slots for both clinic branches
export const generateStandardTimeSlots = (branchId: string, date: string): string[] => {
  return [
    "05:00 PM", "05:20 PM", "05:40 PM", 
    "06:00 PM", "06:20 PM", "06:40 PM", 
    "07:00 PM", "07:20 PM", "07:40 PM", 
    "08:00 PM", "08:20 PM", "08:40 PM"
  ];
};

export class MedBoshStore {

  static getStaffUser(): StaffUser | null {
    return getItem<StaffUser | null>(STORAGE_KEYS.STAFF_AUTH, null);
  }

  static loginStaff(username: string): { success: boolean; user?: StaffUser; message?: string } {
    const staffList = getItem<StaffUser[]>(STORAGE_KEYS.STAFF, SEED_STAFF);
    const cleanUsername = username.trim().toLowerCase();
    const user = staffList.find((s) => s.username.toLowerCase() === cleanUsername);

    if (user) {
      setItem(STORAGE_KEYS.STAFF_AUTH, user);
      return { success: true, user };
    }
    return { success: false, message: "Invalid credentials. Try doctor1 or receptionist1." };
  }

  static logoutStaff(): void {
    setItem(STORAGE_KEYS.STAFF_AUTH, null);
  }

  static getPatientAuth(): { phone: string; name?: string } | null {
    return getItem<{ phone: string; name?: string } | null>(STORAGE_KEYS.PATIENT_AUTH, null);
  }

  static loginPatient(phone: string, name?: string): void {
    const cleanPhone = phone.replace(/\D/g, "");
    setItem(STORAGE_KEYS.PATIENT_AUTH, { phone: cleanPhone, name });
  }

  static logoutPatient(): void {
    setItem(STORAGE_KEYS.PATIENT_AUTH, null);
  }
}
