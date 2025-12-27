import React, { useState, useEffect } from "react";
import {
  User,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import {
  auth,
  isFirebaseConfigured,
  updateUserProfile,
  signInAnonymouslyUser,
  db,
} from "@/services/firebase";
import { AuthContext } from "./AuthContextRef";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setTenantId = (id: string) => {
    setSchoolId(id);
  };

  const fetchUserData = async (currentUser: User) => {
    if (!db) return;
    try {
      // Use Collection Group Query to find user across all tenants
      // This is necessary because users are now scoped under /tenants/{tid}/users/{uid}
      const { collectionGroup, query, where, getDocs } = await import(
        "firebase/firestore"
      );

      const q = query(
        collectionGroup(db, "users"),
        where("uid", "==", currentUser.uid)
      );

      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const userDoc = snapshot.docs[0];
        const data = userDoc.data();
        // Map tenantId to schoolId for app compatibility
        if (data.tenantId) {
          setSchoolId(data.tenantId);
        } else if (data.schoolId) {
          // Legacy support
          setSchoolId(data.schoolId);
        }
      } else {
        setSchoolId(null);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    // If config isn't set or auth failed to init, we fallback to a mock mode
    if (!isFirebaseConfigured() || !auth) {
      console.warn(
        "Firebase is not configured or auth service is unavailable. Authentication defaults to mock mode."
      );
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser && !currentUser.isAnonymous) {
        await fetchUserData(currentUser);
      } else {
        setSchoolId(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (
    email: string,
    password: string,
    remember: boolean = false
  ) => {
    if (!isFirebaseConfigured() || !auth) {
      // Fallback mock login for demo when no config exists
      if (email.includes("@")) {
        setIsLoading(true);
        // Fake user object
        setUser({
          email,
          uid: "mock-uid",
          displayName: "Demo Admin",
          photoURL: null,
          emailVerified: true,
          isAnonymous: false,
          metadata: {},
          providerData: [],
          refreshToken: "",
          tenantId: null,
          delete: async () => {},
          getIdToken: async () => "",
          getIdTokenResult: async () => ({} as any),
          reload: async () => {},
          toJSON: () => ({}),
          phoneNumber: null,
          providerId: "firebase",
        } as unknown as User);
        setSchoolId("demo-school-id");
        // Short timeout to simulate async to match behavior
        setTimeout(() => setIsLoading(false), 500);
        return;
      } else {
        throw new Error("Invalid mock credentials");
      }
    }
    try {
      setIsLoading(true);
      await setPersistence(
        auth,
        remember ? browserLocalPersistence : browserSessionPersistence
      );
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const signup = async (
    email: string,
    password: string
  ): Promise<User | null> => {
    if (!isFirebaseConfigured() || !auth) {
      // Mock Signup
      const mockUser = {
        email,
        uid: "mock-new-uid",
        displayName: "New Admin",
        isAnonymous: false,
      } as User;
      setUser(mockUser);
      setSchoolId("mock-new-school");
      return mockUser;
    }
    const { createUserWithEmailAndPassword } = await import("firebase/auth");
    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    return credential.user;
  };

  const loginAnonymously = async () => {
    if (!isFirebaseConfigured() || !auth) {
      // Mock anonymous login
      setUser({ uid: "anon-mock", isAnonymous: true } as User);
      setSchoolId(null);
      return;
    }
    await signInAnonymouslyUser();
  };

  const logout = async () => {
    if (!isFirebaseConfigured() || !auth) {
      setUser(null);
      setSchoolId(null);
      return;
    }
    await signOut(auth);
  };

  const updateDisplayProfile = async (name: string, photo?: string) => {
    if (user && auth && !user.isAnonymous) {
      // Update in Firebase
      await updateUserProfile(user, name, photo);
      // Force local state update because onAuthStateChanged doesn't trigger on profile updates immediately
      setUser({ ...user, displayName: name, photoURL: photo || user.photoURL });
    }
  };

  const refreshUser = async () => {
    if (user) {
      await fetchUserData(user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        // Only consider authenticated if user exists AND IS NOT ANONYMOUS
        isAuthenticated: !!user && !user.isAnonymous,
        isLoading,
        schoolId,
        login,
        signup,
        loginAnonymously,
        logout,
        updateDisplayProfile,
        refreshUser,
        setTenantId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
