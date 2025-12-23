export interface DashboardStats {
  totalStudents: number;
  totalUpdates: number;
  totalBroadcasts: number;
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
  try {
    const BACKEND_URL =
      import.meta.env.VITE_BACKEND_URL || "http://localhost:8000/api";
    const response = await fetch(
      `${BACKEND_URL}/dashboard/stats?schoolId=${schoolId}`
    );

    if (!response.ok) {
      // If server fails, we could fallback to Firestore, but for now let's return zeros
      console.warn("Server stats failed, returning empty.");
      return {
        totalStudents: 0,
        totalUpdates: 0,
        totalBroadcasts: 0,
        recentActivity: [],
      };
    }

    const data = await response.json();

    // Convert timestamps back to Date objects
    const recentActivity = (data.recentActivity || []).map((item: any) => ({
      ...item,
      timestamp: new Date(item.timestamp),
    }));

    return {
      totalStudents: data.totalStudents || 0,
      totalUpdates: data.totalUpdates || 0,
      totalBroadcasts: data.totalBroadcasts || 0,
      recentActivity,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      totalStudents: 0,
      totalUpdates: 0,
      totalBroadcasts: 0,
      recentActivity: [],
    };
  }
};
