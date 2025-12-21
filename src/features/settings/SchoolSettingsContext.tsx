import React, { createContext, useContext } from "react";
import { SchoolSettings } from "@/services/firebase/settings";
import { useAuth } from "@/features/auth/AuthContext";
import { useSchoolSettingsQuery } from "./hooks/useSettingsQueries";

interface SchoolSettingsContextType {
  settings: SchoolSettings | null;
  loading: boolean;
  refreshSettings: () => Promise<any>;
}

const SchoolSettingsContext = createContext<
  SchoolSettingsContextType | undefined
>(undefined);

export const SchoolSettingsProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { schoolId } = useAuth(); // Get schoolId from auth context

  const {
    data: settings = null,
    isLoading: loading,
    refetch,
  } = useSchoolSettingsQuery(schoolId);

  return (
    <SchoolSettingsContext.Provider
      value={{ settings, loading, refreshSettings: refetch }}
    >
      {children}
    </SchoolSettingsContext.Provider>
  );
};

export const useSchoolSettings = () => {
  const context = useContext(SchoolSettingsContext);
  if (context === undefined) {
    throw new Error(
      "useSchoolSettings must be used within a SchoolSettingsProvider"
    );
  }
  return context;
};
