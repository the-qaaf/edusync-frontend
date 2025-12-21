import { db } from "@/services/firebase/config";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";
import { Student, DailyUpdate, BroadcastLog } from "@/types";

export interface PortalData {
  student: Student;
  updates: DailyUpdate[];
  broadcasts: BroadcastLog[];
}

/**
 * Fetches all students associated with a parent's phone number.
 * Searches across ALL schools (since phone could be in multiple).
 * Optimization: Requires Collection Group Index on 'students' -> 'parentPhone' if across multiple schools,
 * OR if single school context is known, we can search that school.
 * For this implementation, we'll search top-level collectionGroup 'students' if possible, or assume we know schoolId?
 * Issue: We don't know schoolId from just phone number easily without a global lookup.
 * WORKAROUND: For this V1, we will query `schools` then subcollection `students`. But that's expensive.
 * BETTER: We'll assume the URL param might eventually have schoolId or we do a collectionGroup query.
 * PROPOSED: collectionGroup('students').where('parentPhone', '==', phone)
 */
export const getStudentsByParentPhone = async (
  schoolId: string,
  phone: string
): Promise<Student[]> => {
  if (!db || !schoolId || !phone) return [];
  try {
    // Scoped query to specific tenant (Security & Performance)
    const q = query(
      collection(db, "tenants", schoolId, "students"),
      where("parentPhone", "==", phone)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) => ({ id: doc.id, schoolId: schoolId, ...doc.data() } as Student)
    );
  } catch (e) {
    console.error("Error fetching students by phone:", e);
    return [];
  }
};

export const getStudentUpdates = async (
  schoolId: string,
  classGrade: string,
  section: string,
  date: string // ISO string YYYY-MM-DD
): Promise<DailyUpdate[]> => {
  if (!db) return [];
  try {
    // Query "daily_updates" for this school, filtered by class/section/date
    const q = query(
      collection(db, "tenants", schoolId, "daily_updates"),
      where("classGrade", "==", `Class ${classGrade}`),
      where("section", "==", section),
      orderBy("date", "desc"),
      limit(10)
    );
    const snap = await getDocs(q);
    return snap.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as DailyUpdate)
    );
  } catch (e: any) {
    console.warn(
      "Portal Updates: strict query failed (likely missing index), using fallback.",
      e
    );
    // Fallback: Query by class/section only, then sort in memory
    try {
      const qFallback = query(
        collection(db, "tenants", schoolId, "daily_updates"),
        where("classGrade", "==", classGrade),
        where("section", "==", section),
        limit(20)
      );
      const snap = await getDocs(qFallback);
      const updates = snap.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as DailyUpdate)
      );
      // Sort in memory
      return updates.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    } catch (innerE) {
      console.error("Portal Updates: Fallback failed", innerE);
      return [];
    }
  }
};

export const getStudentBroadcasts = async (
  schoolId: string
): Promise<BroadcastLog[]> => {
  if (!db) return [];
  try {
    const q = query(
      collection(db, "tenants", schoolId, "broadcasts"),
      orderBy("createdAt", "desc"),
      limit(5)
    );
    const snap = await getDocs(q);
    return snap.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as BroadcastLog)
    );
  } catch (e) {
    console.error(e);
    return [];
  }
};
