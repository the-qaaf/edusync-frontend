export interface ReportCard {
  id?: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  class: string;
  section: string;
  term: string;
  academicYear: string;
  subjects: {
    name: string;
    obtained: number;
    maxMarks: number;
    grade: string;
  }[];
  totalMax: number;
  totalObtained: number;
  percentage: number;
  overallGrade: string;
  classTeacher: string;
  principal: string;
  createdAt?: any;
}

const getBackendUrl = () =>
  import.meta.env.VITE_BACKEND_URL || "http://localhost:8000/api";

export const saveReportCards = async (
  schoolId: string,
  reports: ReportCard[]
) => {
  try {
    const response = await fetch(
      `${getBackendUrl()}/reports/batch?schoolId=${schoolId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reports }),
      }
    );

    if (!response.ok) throw new Error("Failed to save reports");
  } catch (error) {
    console.error("Error saving reports:", error);
    throw error;
  }
};

export const getReportsByClassAndTerm = async (
  schoolId: string,
  className: string,
  section: string,
  term: string,
  pageSize: number = 20,
  lastDoc: any = null // Pagination likely handled differently on server for now (offset/limit)
) => {
  try {
    // Note: Server currently supports simple limit, not cursor-based pagination yet.
    // We pass basic params.
    const response = await fetch(
      `${getBackendUrl()}/reports?schoolId=${schoolId}&className=${className}&section=${section}&term=${term}&limit=${pageSize}`
    );

    if (!response.ok) return { reports: [], lastVisible: null };

    const data = await response.json();
    // Convert timestamps if necessary? Server sends JSON (string dates mostly), UI might handle strings.
    // If strict Date objects needed:
    const reports = (data.reports || []).map((r: any) => ({
      ...r,
      // Convert createdAt if exists (it's likely an ISO string from JSON)
      createdAt: r.createdAt
        ? { toMillis: () => new Date(r.createdAt).getTime() }
        : undefined, // Mocking Firestore timestamp behavior for UI compatibility?
    }));

    return { reports, lastVisible: null };
  } catch (error) {
    console.error("Error fetching reports:", error);
    return { reports: [], lastVisible: null };
  }
};

export const deleteReportCard = async (schoolId: string, reportId: string) => {
  try {
    const response = await fetch(
      `${getBackendUrl()}/reports/${reportId}?schoolId=${schoolId}`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) throw new Error("Failed to delete report");
  } catch (error) {
    console.error("Error deleting report:", error);
    throw error;
  }
};
