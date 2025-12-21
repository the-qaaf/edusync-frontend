/**
 * System-wide constants for Academic Classes and Sections.
 * These are used across admission, reports, and settings.
 */

export const ACADEMIC_CLASSES = [
  "Pre-KG",
  "LKG",
  "UKG",
  "Class 1",
  "Class 2",
  "Class 3",
  "Class 4",
  "Class 5",
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
  "Class 11",
  "Class 12",
] as const;

export type AcademicClass = (typeof ACADEMIC_CLASSES)[number];

export const ACADEMIC_SECTIONS = ["A", "B", "C", "D"] as const;

export type AcademicSection = (typeof ACADEMIC_SECTIONS)[number];

export const STUDENT_STATUS = ["Active", "Transfer Pending", "Left"] as const;

export type StudentStatus = (typeof STUDENT_STATUS)[number];

// Term Definitions for consistency
export const ACADEMIC_TERMS = ["Term 1", "Term 2", "Term 3"] as const;
export type AcademicTerm = (typeof ACADEMIC_TERMS)[number];
