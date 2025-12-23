import { Student } from "@/types";

export interface PaginatedStudents {
  students: Student[];
  lastDoc: any | null; // Changed from QueryDocumentSnapshot to any to disconnect from Firestore type if possible, or keep usage minimal
  totalCount: number;
}

const getBackendUrl = () =>
  import.meta.env.VITE_BACKEND_URL || "http://localhost:8000/api";

/**
 * Fetches parent contacts for all students via Backend.
 */
export const getAllParentContacts = async (
  schoolId: string
): Promise<
  {
    email: string;
    phone: string;
    name: string;
    studentId: string;
    studentName: string;
    class: string;
    section: string;
  }[]
> => {
  try {
    const response = await fetch(
      `${getBackendUrl()}/students/contacts?schoolId=${schoolId}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch contacts from server");
    }

    const data = await response.json();
    return data.contacts || [];
  } catch (e) {
    console.error("Error getting parent contacts:", e);
    return [];
  }
};

/**
 * Fetches a list of students from Backend.
 * Note: Infinite scroll pagination (startAfter) is currently limited by Backend implementation.
 * It currently fetches standard Limit.
 */
export const getStudents = async (
  schoolId: string,
  pageSize: number = 10,
  lastDoc: any | null = null,
  filters: { classGrade?: string; section?: string; search?: string } = {}
): Promise<PaginatedStudents> => {
  try {
    let url = `${getBackendUrl()}/students?schoolId=${schoolId}&limit=${pageSize}`;
    if (filters.classGrade) url += `&classGrade=${filters.classGrade}`;
    if (filters.section) url += `&section=${filters.section}`;
    if (filters.search) url += `&search=${filters.search}`;

    const response = await fetch(url);
    if (!response.ok) return { students: [], lastDoc: null, totalCount: 0 };

    const data = await response.json();
    return {
      students: data.students || [],
      lastDoc: null, // Cursor pagination disabled in migration
      totalCount: data.totalCount || 0,
    };
  } catch (e) {
    console.error("Error fetching students:", e);
    return { students: [], lastDoc: null, totalCount: 0 };
  }
};

/**
 * Adds a new student via Backend.
 */
export const addStudent = async (
  schoolId: string,
  student: Omit<Student, "id">
): Promise<string | null> => {
  try {
    const response = await fetch(
      `${getBackendUrl()}/students/add?schoolId=${schoolId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(student),
      }
    );

    if (!response.ok) throw new Error("Failed to add student");
    const data = await response.json();
    return data.id;
  } catch (e) {
    console.error("Error adding student: ", e);
    throw e;
  }
};

/**
 * Updates an existing student record via Backend.
 */
export const updateStudent = async (
  schoolId: string,
  id: string,
  data: Partial<Student>
) => {
  try {
    const response = await fetch(
      `${getBackendUrl()}/students/update?schoolId=${schoolId}&studentId=${id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );
    if (!response.ok) throw new Error("Failed to update student");
  } catch (e) {
    console.error("Error updating student: ", e);
    throw e;
  }
};

/**
 * Batch adds multiple students via Backend.
 */
export const batchAddStudents = async (
  schoolId: string,
  students: Omit<Student, "id">[]
) => {
  try {
    // We define a chunk size if backend has limit (500), but let's assume valid size or simple chunking here
    // For now just 1 call
    const response = await fetch(
      `${getBackendUrl()}/students/batch?schoolId=${schoolId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ students }),
      }
    );
    if (!response.ok) throw new Error("Failed to batch add students");
  } catch (e) {
    console.error("Error batch adding students: ", e);
    throw e;
  }
};
