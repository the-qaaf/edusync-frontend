import { db, storage } from "./config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export interface SchoolSettings {
  schoolName: string;
  contactEmail: string;
  address: string;
  logoUrl?: string;
  academicYear: string;
  currentTerm: string;
  terms: string[];
  website?: string;
  phone?: string;
}

const SETTINGS_COLLECTION = "settings";
const GENERAL_DOC_ID = "general";

/**
 * Fetches the school settings from Firestore.
 * @param schoolId The ID of the school
 * @returns SchoolSettings object or null if not found
 */
export const getSchoolSettings = async (
  schoolId: string
): Promise<SchoolSettings | null> => {
  if (!db) return null;
  try {
    const docRef = doc(
      db,
      "tenants",
      schoolId,
      SETTINGS_COLLECTION,
      GENERAL_DOC_ID
    );
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as SchoolSettings) : null;
  } catch (e) {
    console.error("Error fetching settings:", e);
    return null;
  }
};

/**
 * Updates the school settings.
 * Creates the document if it doesn't exist (merge strategy).
 * @param schoolId The ID of the school
 * @param settings Partial settings object to update
 */
export const updateSchoolSettings = async (
  schoolId: string,
  settings: Partial<SchoolSettings>
) => {
  if (!db) throw new Error("Database not connected");
  try {
    const docRef = doc(
      db,
      "tenants",
      schoolId,
      SETTINGS_COLLECTION,
      GENERAL_DOC_ID
    );
    await setDoc(docRef, settings, { merge: true });
  } catch (e) {
    console.error("Error saving settings:", e);
    throw e;
  }
};

/**
 * Uploads a school logo file to Firebase Storage.
 * @param schoolId The ID of the school
 * @param file The file object to upload
 * @returns Promise resolving to the download URL
 */
export const uploadSchoolLogo = async (
  schoolId: string,
  file: File
): Promise<string> => {
  if (!storage) throw new Error("Storage not connected");
  try {
    const fileName = `logo_${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `tenants/${schoolId}/assets/${fileName}`);

    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (e) {
    console.error("Error uploading logo:", e);
    throw e;
  }
};
