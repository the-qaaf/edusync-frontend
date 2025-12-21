import { db } from "./config";
import {
  collection,
  query,
  getDocs,
  where,
  orderBy,
  limit,
  getCountFromServer,
} from "firebase/firestore";
import { DailyUpdate } from "@/types";

export interface DashboardStats {
  totalStudents: number;
  totalUpdates: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: Date; // or string representation
  type: "update" | "student" | "system";
}

export const getDashboardStats = async (
  schoolId: string
): Promise<DashboardStats> => {
  if (!db) {
    return {
      totalStudents: 0,
      totalUpdates: 0,
      recentActivity: [],
    };
  }

  try {
    // 1. Total Students
    const studentsColl = collection(db, "tenants", schoolId, "students");
    const studentCountSnap = await getCountFromServer(studentsColl);
    const totalStudents = studentCountSnap.data().count;

    // 2. Total Daily Updates
    const updatesColl = collection(db, "tenants", schoolId, "daily_updates");
    const updatesCountSnap = await getCountFromServer(updatesColl);
    const totalUpdates = updatesCountSnap.data().count;

    // 3. Recent Activity (Derived from Daily Updates AND Broadcasts)
    const recentUpdatesQuery = query(
      updatesColl,
      orderBy("date", "desc"),
      limit(5)
    );
    const updatesSnap = await getDocs(recentUpdatesQuery);

    const broadcastsColl = collection(db, "tenants", schoolId, "broadcasts");
    const recentBroadcastsQuery = query(
      broadcastsColl,
      orderBy("createdAt", "desc"),
      limit(5)
    );
    const broadcastsSnap = await getDocs(recentBroadcastsQuery);

    // Process Updates
    const updateActivities: ActivityItem[] = updatesSnap.docs.map((doc) => {
      const data = doc.data() as DailyUpdate;
      return {
        id: doc.id,
        title: `Daily Update: ${data.subject}`,
        description: `${data.teacherName} posted homework for Class ${data.classGrade}-${data.section}`,
        timestamp: new Date(data.date), // Assuming ISO string
        type: "update",
      };
    });

    // Process Broadcasts
    const broadcastActivities: ActivityItem[] = broadcastsSnap.docs.map(
      (doc) => {
        const data = doc.data() as any; // Using any to bypass strict type if BroadcastLog mismatch, but we know structure
        return {
          id: doc.id,
          title:
            data.template === "custom"
              ? "Broadcast Announcement"
              : "Emergency Alert",
          description: `Sent to ${data.recipients} recipients via ${
            data.channels?.join(" & ") || "System"
          }`,
          timestamp: data.createdAt?.toDate
            ? data.createdAt.toDate()
            : new Date(data.date || Date.now()),
          type: "system",
        };
      }
    );

    // Merge and Sort
    const recentActivity = [...updateActivities, ...broadcastActivities]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 5); // Keep top 5

    return {
      totalStudents,
      totalUpdates,
      recentActivity,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      totalStudents: 0,
      totalUpdates: 0,
      recentActivity: [],
    };
  }
};
