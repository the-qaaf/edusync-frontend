import { createContext } from "react";
import { User } from "firebase/auth";

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  schoolId: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<User | null>;
  loginAnonymously: () => Promise<void>;
  logout: () => Promise<void>;
  updateDisplayProfile: (name: string, photo?: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  setTenantId: (id: string) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);
