import { db } from "./config";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  doc,
  writeBatch,
  orderBy,
  limit,
  startAfter,
  QueryConstraint,
  deleteDoc,
} from "firebase/firestore";

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

export const saveReportCards = async (
  schoolId: string,
  reports: ReportCard[]
) => {
  if (!db) throw new Error("Firestore is not initialized");

  const batch = writeBatch(db);
  const reportsRef = collection(db, "tenants", schoolId, "reports");

  reports.forEach((report) => {
    const docRef = doc(reportsRef); // Create new doc ref with auto ID
    batch.set(docRef, {
      ...report,
      createdAt: serverTimestamp(),
    });
  });

  await batch.commit();
};

export const getReportsByClassAndTerm = async (
  schoolId: string,
  className: string,
  section: string,
  term: string,
  pageSize: number = 20,
  lastDoc: any = null
) => {
  if (!db) return { reports: [], lastVisible: null };

  let constraints: QueryConstraint[] = [
    where("class", "==", className),
    where("section", "==", section),
    where("term", "==", term),
    orderBy("createdAt", "desc"), // Ensure consistent ordering
    limit(pageSize),
  ];

  if (lastDoc) {
    constraints.push(startAfter(lastDoc));
  }

  try {
    const q = query(
      collection(db, "tenants", schoolId, "reports"),
      ...constraints
    );

    const snapshot = await getDocs(q);
    const reports = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as ReportCard)
    );
    const lastVisible = snapshot.docs[snapshot.docs.length - 1];
    return { reports, lastVisible };
  } catch (error) {
    console.warn("Report query failed (index?), using fallback.", error);
    // Fallback: No sort in DB
    const fallbackConstraints: QueryConstraint[] = [
      where("class", "==", className),
      where("section", "==", section),
      where("term", "==", term),
      limit(pageSize), // Note: Pagination breaks if we don't sort, so we just return first page or simple limit
    ];

    const q = query(
      collection(db, "tenants", schoolId, "reports"),
      ...fallbackConstraints
    );

    try {
      const snapshot = await getDocs(q);
      const reports = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as ReportCard)
      );
      // In-memory sort
      reports.sort((a, b) => {
        const tA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const tB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return tB - tA;
      });

      return { reports, lastVisible: null }; // Cursor pagination disabled in fallback
    } catch (innerE) {
      console.error("Report fallback failed", innerE);
      return { reports: [], lastVisible: null };
    }
  }
};

export const deleteReportCard = async (schoolId: string, reportId: string) => {
  if (!db) throw new Error("Firestore is not initialized");
  await deleteDoc(doc(db, "tenants", schoolId, "reports", reportId));
};
