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
import { BroadcastLog } from "@/types";

export interface CreateBroadcastParams {
  message: string;
  channels: ("SMS" | "Email" | "WhatsApp")[];
  template?: string;
  recipientsCount?: number; // Optional: we might not calculate this accurately yet
  status: "Delivered" | "Failed" | "Pending"; // For now we assume success
}

/**
 * Adds a new broadcast to the database log.
 */
export const addBroadcast = async (
  schoolId: string,
  params: CreateBroadcastParams
): Promise<string> => {
  if (!db) throw new Error("Database not connected");

  try {
    const payload = {
      message: params.message,
      channels: params.channels,
      template: params.template || "custom",
      recipients: params.recipientsCount || 0,
      status: params.status,
      date: new Date().toISOString(), // Use string to match existing patterns/types or use serverTimestamp and convert
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(
      collection(db, "tenants", schoolId, "broadcasts"),
      payload
    );
    return docRef.id;
  } catch (e) {
    console.error("Error adding broadcast log: ", e);
    throw e;
  }
};

/**
 * Fetches recent broadcast logs.
 */
export const getBroadcastLogs = async (
  schoolId: string,
  limitCount: number = 20
): Promise<BroadcastLog[]> => {
  if (!db) return [];
  try {
    const q = query(
      collection(db, "tenants", schoolId, "broadcasts"),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as BroadcastLog)
    );
  } catch (e: any) {
    console.warn("Index missing for sort, fetching unsorted fallback.", e);
    try {
      const qFallback = query(
        collection(db, "tenants", schoolId, "broadcasts"),
        limit(limitCount)
      );
      const snap = await getDocs(qFallback);
      // Fallback sort client-side
      const docs = snap.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as BroadcastLog)
      );
      return docs.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    } catch (innerE) {
      console.error(innerE);
      return [];
    }
  }
};
