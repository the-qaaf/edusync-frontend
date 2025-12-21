import { db } from "./config";
import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { DailyUpdate } from "@/types";

/**
 * Adds a new daily update (homework/classwork log).
 * @param schoolId The school ID
 * @param update The update object
 * @returns Dictionary ID of the created update
 */
export const addDailyUpdate = async (
  schoolId: string,
  update: Omit<DailyUpdate, "id">
): Promise<string> => {
  if (!db) throw new Error("Database not connected");
  try {
    const payload = {
      ...update,
      createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(
      collection(db, "tenants", schoolId, "daily_updates"),
      payload
    );
    return docRef.id;
  } catch (e) {
    console.error("Error adding daily update: ", e);
    throw e;
  }
};

/**
 * Fetches recent daily updates.
 * @param schoolId The school ID
 * @param limitCount Maximum number of updates to fetch
 * @returns Array of DailyUpdate objects
 */
export const getDailyUpdates = async (
  schoolId: string,
  limitCount: number = 20
): Promise<DailyUpdate[]> => {
  if (!db) return [];
  try {
    const q = query(
      collection(db, "tenants", schoolId, "daily_updates"),
      orderBy("date", "desc"),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as DailyUpdate)
    );
  } catch (e: any) {
    console.warn("Index missing for sort, fetching unsorted fallback.", e);
    try {
      const qFallback = query(
        collection(db, "tenants", schoolId, "daily_updates"),
        limit(limitCount)
      );
      const snap = await getDocs(qFallback);
      return snap.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as DailyUpdate)
      );
    } catch (innerE) {
      console.error(innerE);
      return [];
    }
  }
};
