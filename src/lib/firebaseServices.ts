import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  runTransaction,
  query,
  where,
  serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase";
import { Branch, Doctor, StaffUser, Appointment, TimeSlot, AppointmentAudit } from "./types";
import { SEED_BRANCHES, SEED_DOCTORS, SEED_STAFF, SEED_APPOINTMENTS } from "./seedData";

// Collection Names
export const COLLECTIONS = {
  BRANCHES: "branches",
  DOCTORS: "doctors",
  STAFF: "staff",
  APPOINTMENTS: "appointments",
  SLOTS: "slots",
  PATIENTS: "patients",
  AUDIT: "appointmentAudit"
};

// Auto-seed Firestore on initial app launch if empty
export const seedFirestoreIfEmpty = async (): Promise<void> => {
  try {
    const branchSnap = await getDocs(collection(db, COLLECTIONS.BRANCHES));
    if (branchSnap.empty) {
      console.log("Firestore empty. Initializing Med Bosh seed data...");
      
      // Seed Branches
      for (const b of SEED_BRANCHES) {
        await setDoc(doc(db, COLLECTIONS.BRANCHES, b.id), b);
      }

      // Seed Staff Accounts
      for (const s of SEED_STAFF) {
        await setDoc(doc(db, COLLECTIONS.STAFF, s.id), s);
      }

      // Seed Appointments & Slots
      for (const a of SEED_APPOINTMENTS) {
        await setDoc(doc(db, COLLECTIONS.APPOINTMENTS, a.id), a);
        const slotId = `${a.doctorId}_${a.date}_${a.time.replace(/\s+/g, "")}`;
        await setDoc(doc(db, COLLECTIONS.SLOTS, slotId), {
          doctorId: a.doctorId,
          branchId: a.branchId,
          date: a.date,
          time: a.time,
          capacity: 1,
          bookedCount: 1,
          status: "full"
        });
      }
      console.log("Firestore successfully seeded with Med Bosh clinic data!");
    }

    const doctorSnap = await getDocs(collection(db, COLLECTIONS.DOCTORS));
    if (doctorSnap.empty) {
      console.log("Doctors collection empty. Seeding doctors...");
      for (const d of SEED_DOCTORS) {
        await setDoc(doc(db, COLLECTIONS.DOCTORS, d.id), d);
      }
      console.log("Doctors successfully seeded!");
    }
  } catch (err) {
    console.warn("Firestore seed check warning (operating with local state backup):", err);
  }
};

// Firestore Realtime Subscriptions
export const subscribeBranches = (callback: (branches: Branch[]) => void) => {
  return onSnapshot(collection(db, COLLECTIONS.BRANCHES), (snap) => {
    if (snap.empty) {
      callback(SEED_BRANCHES);
    } else {
      const data = snap.docs.map((d) => d.data() as Branch);
      callback(data);
    }
  }, (err) => {
    callback(SEED_BRANCHES);
  });
};

export const subscribeDoctors = (callback: (doctors: Doctor[]) => void) => {
  return onSnapshot(collection(db, COLLECTIONS.DOCTORS), (snap) => {
    if (snap.empty) {
      callback(SEED_DOCTORS);
    } else {
      const data = snap.docs.map((d) => d.data() as Doctor);
      callback(data);
    }
  }, (err) => {
    callback(SEED_DOCTORS);
  });
};

export const subscribeAppointments = (callback: (appointments: Appointment[]) => void) => {
  return onSnapshot(collection(db, COLLECTIONS.APPOINTMENTS), (snap) => {
    if (snap.empty) {
      callback(SEED_APPOINTMENTS);
    } else {
      const data = snap.docs.map((d) => d.data() as Appointment);
      callback(data);
    }
  }, (err) => {
    callback(SEED_APPOINTMENTS);
  });
};

// Firestore ACID Slot Booking Transaction
export const bookAppointmentFirestoreTransaction = async (data: {
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
  reason: string;
  createdBy: "patient" | "reception";
  feePaid: boolean;
  paymentId?: string;
}): Promise<{ success: boolean; appointment?: Appointment; message?: string }> => {
  const slotDocId = `${data.doctorId}_${data.date}_${data.time.replace(/\s+/g, "")}`;
  const slotRef = doc(db, COLLECTIONS.SLOTS, slotDocId);
  const appointmentId = `BOSH-${Math.floor(100000 + Math.random() * 900000)}`;
  const appointmentRef = doc(db, COLLECTIONS.APPOINTMENTS, appointmentId);

  try {
    const result = await runTransaction(db, async (transaction) => {
      const slotDoc = await transaction.get(slotRef);

      if (slotDoc.exists()) {
        const slotData = slotDoc.data();
        if (slotData.bookedCount >= (slotData.capacity || 1) || slotData.status === "full") {
          throw new Error("This slot was just taken by another patient. Please pick a different time slot.");
        }
      }

      const newAppointment = {
        id: appointmentId,
        ...data,
        status: "confirmed" as const,
        createdAt: new Date().toISOString()
      };

      // Firestore throws on undefined. Remove any undefined fields.
      Object.keys(newAppointment).forEach(key => {
        if ((newAppointment as any)[key] === undefined) {
          delete (newAppointment as any)[key];
        }
      });

      // Atomic writes: increment slot count & create appointment
      transaction.set(slotRef, {
        doctorId: data.doctorId,
        branchId: data.branchId,
        date: data.date,
        time: data.time,
        capacity: 1,
        bookedCount: 1,
        status: "full"
      });

      transaction.set(appointmentRef, newAppointment);

      // Audit trail
      const auditRef = doc(collection(db, COLLECTIONS.AUDIT));
      transaction.set(auditRef, {
        appointmentId,
        action: "booked",
        performedBy: data.createdBy,
        timestamp: new Date().toISOString(),
        details: `Booked for ${data.patientName} (${data.time})`
      });

      return newAppointment;
    });

    return { success: true, appointment: result };
  } catch (err: any) {
    console.error("Firestore Transaction Error:", err);
    return {
      success: false,
      message: err.message || "Slot booking transaction failed."
    };
  }
};

// Add new doctor to Firestore
export const addDoctorFirestore = async (newDocData: Omit<Doctor, "id">): Promise<Doctor> => {
  const doctorId = `dr-bosh-${Date.now()}`;
  const created: Doctor = {
    ...newDocData,
    id: doctorId
  };

  await setDoc(doc(db, COLLECTIONS.DOCTORS, doctorId), created);

  // Add staff account
  const username = created.name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8) || `doc${Date.now()}`;
  const staffId = `staff-${Date.now()}`;
  const staffUser: StaffUser = {
    id: staffId,
    username,
    role: "doctor",
    name: created.name,
    doctorId,
    branchId: created.branchIds[0]
  };

  await setDoc(doc(db, COLLECTIONS.STAFF, staffId), staffUser);
  return created;
};

// Update Appointment Status in Firestore
export const updateAppointmentStatusFirestore = async (
  appointmentId: string,
  status: Appointment["status"],
  performedBy: string
) => {
  const aptRef = doc(db, COLLECTIONS.APPOINTMENTS, appointmentId);
  await updateDoc(aptRef, { status });

  // Audit
  const auditRef = doc(collection(db, COLLECTIONS.AUDIT));
  await setDoc(auditRef, {
    appointmentId,
    action: status === "completed" ? "completed" : status === "no-show" ? "no-show" : "cancelled",
    performedBy,
    timestamp: new Date().toISOString()
  });
};

// Mark Fee Paid in Firestore
export const markFeePaidFirestore = async (
  appointmentId: string,
  paymentId: string,
  performedBy: string
) => {
  const aptRef = doc(db, COLLECTIONS.APPOINTMENTS, appointmentId);
  await updateDoc(aptRef, { feePaid: true, paymentId });

  // Audit
  const auditRef = doc(collection(db, COLLECTIONS.AUDIT));
  await setDoc(auditRef, {
    appointmentId,
    action: "fee_paid",
    performedBy,
    timestamp: new Date().toISOString(),
    details: `Payment recorded: ${paymentId}`
  });
};

// Update Doctor Duty Schedule in Firestore
export const updateDoctorDateDutyFirestore = async (
  doctorId: string,
  targetDate: string,
  isAvailable: boolean,
  branchId: string
) => {
  const docRef = doc(db, COLLECTIONS.DOCTORS, doctorId);
  const doctorSnap = await getDoc(docRef);

  if (doctorSnap.exists()) {
    const doctorData = doctorSnap.data() as Doctor;
    const existingSchedule = doctorData.dateSchedule || {};
    const updatedSchedule = {
      ...existingSchedule,
      [targetDate]: { isAvailable, branchId }
    };

    const isToday = targetDate === new Date().toISOString().split("T")[0];
    
    const updates: Partial<Doctor> = {
      dateSchedule: updatedSchedule,
    };
    
    if (isToday) {
      updates.isAvailableToday = isAvailable;
      updates.activeDutyBranchId = branchId;
    }

    await updateDoc(docRef, updates);
  }
};

// Delete Doctor Duty Schedule from Firestore
export const deleteDoctorDateDutyFirestore = async (
  doctorId: string,
  targetDate: string
) => {
  const docRef = doc(db, COLLECTIONS.DOCTORS, doctorId);
  const doctorSnap = await getDoc(docRef);

  if (doctorSnap.exists()) {
    const doctorData = doctorSnap.data() as Doctor;
    const existingSchedule = doctorData.dateSchedule || {};
    
    const { [targetDate]: removed, ...updatedSchedule } = existingSchedule;

    await updateDoc(docRef, {
      dateSchedule: updatedSchedule
    });
  }
};
