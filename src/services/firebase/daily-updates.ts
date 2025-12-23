import { DailyUpdate } from "@/types";

const getBackendUrl = () =>
  import.meta.env.VITE_BACKEND_URL || "http://localhost:8000/api";

/**
 * Adds a new daily update (homework/classwork log) via Backend.
 * @param schoolId The school ID
 * @param update The update object
 * @returns Dictionary ID of the created update
 */
export const addDailyUpdate = async (
  schoolId: string,
  update: Omit<DailyUpdate, "id">
): Promise<string> => {
  try {
    const response = await fetch(
      `${getBackendUrl()}/daily-updates?schoolId=${schoolId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(update),
      }
    );

    if (!response.ok) throw new Error("Failed to add update");
    const data = await response.json();
    return data.id;
  } catch (e) {
    console.error("Error adding daily update: ", e);
    throw e;
  }
};

/**
 * Fetches recent daily updates from Backend.
 * @param schoolId The school ID
 * @param limitCount Maximum number of updates to fetch
 * @returns Array of DailyUpdate objects
 */
export const getDailyUpdates = async (
  schoolId: string,
  limitCount: number = 20
): Promise<DailyUpdate[]> => {
  try {
    const response = await fetch(
      `${getBackendUrl()}/daily-updates?schoolId=${schoolId}&limit=${limitCount}`
    );
    if (!response.ok) return [];

    const data = await response.json();
    // Map or validate if needed.
    return data || [];
  } catch (e) {
    console.error("Error fetching daily updates:", e);
    return [];
  }
};
