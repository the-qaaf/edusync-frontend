import { auth } from "./config";
import { updateProfile, User, signInAnonymously } from "firebase/auth";

/**
 * Updates the user's profile display name and/or photo URL.
 * @param user The current Firebase User object
 * @param displayName The new display name
 * @param photoURL (Optional) The new photo URL
 */
export const updateUserProfile = async (
  user: User,
  displayName: string,
  photoURL?: string
) => {
  await updateProfile(user, { displayName, photoURL });
};

/**
 * Signs in the user anonymously.
 * Useful for demo modes or limited access.
 * @returns UserCredential
 */
export const signInAnonymouslyUser = async () => {
  if (!auth) throw new Error("Auth not initialized");
  return await signInAnonymously(auth);
};
