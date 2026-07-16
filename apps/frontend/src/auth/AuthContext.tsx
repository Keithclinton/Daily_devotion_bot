import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { authApi } from "../api/auth";
import { LoginInput } from "@devotion/shared";

interface AuthState {
  isAuthenticated: boolean;
  adminEmail: string | null;
  login: (input: LoginInput) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [adminEmail, setAdminEmail] = useState<string | null>(
    () => localStorage.getItem("adminEmail"),
  );

  const value = useMemo<AuthState>(
    () => ({
      isAuthenticated: !!adminEmail && !!localStorage.getItem("accessToken"),
      adminEmail,
      login: async (input) => {
        const response = await authApi.login(input);
        localStorage.setItem("accessToken", response.accessToken);
        localStorage.setItem("adminEmail", response.admin.email);
        setAdminEmail(response.admin.email);
      },
      logout: () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("adminEmail");
        setAdminEmail(null);
      },
    }),
    [adminEmail],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
