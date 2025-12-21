import { db } from "./config";
import {
  collection,
  query,
  where,
  orderBy,
  startAfter,
  limit,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  writeBatch,
  QueryDocumentSnapshot,
  QueryConstraint,
  getCountFromServer,
} from "firebase/firestore";
import { Student } from "@/types";

export interface PaginatedStudents {
  students: Student[];
  lastDoc: QueryDocumentSnapshot | null;
  totalCount: number;
}

/**
 * Fetches parent contacts for all students.
 * @param schoolId The school ID
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
  if (!db) return [];
  try {
    const studentsCollection = collection(db, "tenants", schoolId, "students");
    const q = query(studentsCollection); // Fetch all students. Optimization: could select specific fields if Firestore allowed easy projection on client SDK, but it doesn't really save read costs, only bandwidth.
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          email: data.parentEmail || "",
          phone: data.parentPhone || "",
          alternatePhone: data.alternateParentPhone || "",
          name: data.fatherName || data.motherName || "Parent",
          studentId: doc.id,
          studentName: data.name,
          class: data.class,
          section: data.section,
        };
      })
      .filter((c) => c.email || c.phone);
  } catch (e) {
    console.error("Error getting parent contacts:", e);
    return [];
  }
};

/**
 * Fetches a paginated list of students with optional filtering.
 * @param schoolId The school ID
 * @param pageSize Number of records to fetch
 * @param lastDoc The last document from the previous page (for cursor-based pagination)
 * @param filters Optional filters for Class, Section, or Name search
 */
export const getStudents = async (
  schoolId: string,
  pageSize: number = 10,
  lastDoc: QueryDocumentSnapshot | null = null,
  filters: { classGrade?: string; section?: string; search?: string } = {}
): Promise<PaginatedStudents> => {
  // ... existing getStudents implementation
  if (!db) return { students: [], lastDoc: null, totalCount: 0 };
  try {
    const baseConstraints: QueryConstraint[] = [];

    // Apply Filters
    if (filters.classGrade)
      baseConstraints.push(where("class", "==", filters.classGrade));
    if (filters.section)
      baseConstraints.push(where("section", "==", filters.section));

    // Handle Search
    if (filters.search) {
      // Search implies sorting by name due to range filter
      baseConstraints.push(where("name", ">=", filters.search));
      baseConstraints.push(where("name", "<=", filters.search + "\uf8ff"));
      baseConstraints.push(orderBy("name"));
    } else {
      // Default Sort: Always A-Z
      baseConstraints.push(orderBy("name"));
    }

    const studentsCollection = collection(db, "tenants", schoolId, "students");

    // 1. Get Total Count (Separate Query for pagination metadata)
    // Note: Count also respects filters, so might need index.
    let totalCount = 0;
    try {
      const countQuery = query(studentsCollection, ...baseConstraints);
      const countSnapshot = await getCountFromServer(countQuery);
      totalCount = countSnapshot.data().count;
    } catch (countError) {
      console.warn("Count query failed (likely index), skipping count.");
    }

    // 2. Get Paginated Data
    const constraints = [...baseConstraints];
    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }
    constraints.push(limit(pageSize));

    const q = query(studentsCollection, ...constraints);

    try {
      const querySnapshot = await getDocs(q);
      const students = querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Student)
      );
      const newLastDoc =
        querySnapshot.docs.length > 0
          ? querySnapshot.docs[querySnapshot.docs.length - 1]
          : null;

      return { students, lastDoc: newLastDoc, totalCount };
    } catch (queryError: any) {
      console.warn(
        "Strict student query failed, using client-side fallback.",
        queryError
      );

      // Fallback: Fetch by Class/Section ONLY (no sort/search in DB)
      // If that fails, fetch ALL (limited).
      const fallbackConstraints: QueryConstraint[] = [];
      if (filters.classGrade)
        fallbackConstraints.push(where("class", "==", filters.classGrade));
      if (filters.section)
        fallbackConstraints.push(where("section", "==", filters.section));

      fallbackConstraints.push(limit(100)); // Hard limit for safety

      const fallbackQ = query(studentsCollection, ...fallbackConstraints);
      const fallbackSnap = await getDocs(fallbackQ);

      let allDocs = fallbackSnap.docs.map(
        (d) => ({ id: d.id, ...d.data() } as Student)
      );

      // Client-side Filter & Sort
      if (filters.search) {
        const s = filters.search.toLowerCase();
        allDocs = allDocs.filter((st) => st.name.toLowerCase().includes(s));
      }

      allDocs.sort((a, b) => a.name.localeCompare(b.name));

      return { students: allDocs, lastDoc: null, totalCount: allDocs.length };
    }
  } catch (e) {
    console.error("Error getting students: ", e);
    throw e;
  }
};

/**
 * Adds a new student to the database.
 * @param schoolId The school ID
 * @param student The student object (without ID)
 * @returns The new Student ID
 */
export const addStudent = async (
  schoolId: string,
  student: Omit<Student, "id">
): Promise<string | null> => {
  if (!db) throw new Error("Database not connected");
  try {
    const docRef = await addDoc(
      collection(db, "tenants", schoolId, "students"),
      student
    );
    return docRef.id;
  } catch (e) {
    console.error("Error adding student: ", e);
    throw e;
  }
};

/**
 * Updates an existing student record.
 * @param schoolId The school ID
 * @param id The student ID
 * @param data Partial student data to update
 */
export const updateStudent = async (
  schoolId: string,
  id: string,
  data: Partial<Student>
) => {
  if (!db) throw new Error("Database not connected");
  try {
    const studentRef = doc(db, "tenants", schoolId, "students", id);
    await updateDoc(studentRef, data);
  } catch (e) {
    console.error("Error updating student: ", e);
    throw e;
  }
};

/**
 * Batch adds multiple students. Useful for bulk import.
 * @param schoolId The school ID
 * @param students Array of student objects
 */
export const batchAddStudents = async (
  schoolId: string,
  students: Omit<Student, "id">[]
) => {
  if (!db) throw new Error("Database not connected");
  try {
    const batchSize = 500;
    for (let i = 0; i < students.length; i += batchSize) {
      const batch = writeBatch(db);
      const chunk = students.slice(i, i + batchSize);

      chunk.forEach((student) => {
        const docRef = doc(collection(db, "tenants", schoolId, "students"));
        batch.set(docRef, student);
      });
      await batch.commit();
    }
  } catch (e) {
    console.error("Error batch adding students: ", e);
    throw e;
  }
};
