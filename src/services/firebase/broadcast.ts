import { BroadcastLog } from "@/types";

export interface CreateBroadcastParams {
  message: string;
  channels: ("SMS" | "Email" | "WhatsApp")[];
  template?: string;
  recipientsCount?: number; // Optional: we might not calculate this accurately yet
  status: "Delivered" | "Failed" | "Pending"; // For now we assume success
}

const getBackendUrl = () =>
  import.meta.env.VITE_BACKEND_URL || "http://localhost:8000/api";

/**
 * Adds a new broadcast to the database log via Backend.
 */
export const addBroadcast = async (
  schoolId: string,
  params: CreateBroadcastParams
): Promise<string> => {
  try {
    const response = await fetch(
      `${getBackendUrl()}/broadcast/create?schoolId=${schoolId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      }
    );

    if (!response.ok) throw new Error("Failed to create broadcast");
    const data = await response.json();
    return data.id;
  } catch (e) {
    console.error("Error adding broadcast log: ", e);
    throw e;
  }
};

/**
 * Fetches recent broadcast logs from Backend.
 */
export const getBroadcastLogs = async (
  schoolId: string,
  limitCount: number = 20
): Promise<BroadcastLog[]> => {
  try {
    const response = await fetch(
      `${getBackendUrl()}/broadcast/history?schoolId=${schoolId}&limit=${limitCount}`
    );
    if (!response.ok) return [];

    const data = await response.json();
    // Ensure sorting or processing if needed, but backend does sort.
    return data || [];
  } catch (e) {
    console.warn("Failed to fetch broadcast history", e);
    return [];
  }
};
