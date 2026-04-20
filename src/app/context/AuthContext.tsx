import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";

export type UserRole = "admin" | "hr" | "employee";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  hrId?: string;
  employeeId?: string;
}

interface AuthContextType {
  role: UserRole | null;
  user: User | null;
  setUser: (user: User) => void;
  clearRole: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(() => {
    const stored = sessionStorage.getItem("ems-user");
    return stored ? JSON.parse(stored) : null;
  });

  const role = user?.role || null;

  const setUser = useCallback((u: User) => {
    sessionStorage.setItem("ems-user", JSON.stringify(u));
    setUserState(u);
  }, []);

  const clearRole = useCallback(() => {
    sessionStorage.removeItem("ems-user");
    setUserState(null);
  }, []);

  return (
    <AuthContext.Provider value={{ role, user, setUser, clearRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

/**
 * Route protection component.
 * Wraps a route's element — if user role doesn't match the allowed role,
 * redirects to login.
 */
export function RoleGuard({ allowedRole, children }: { allowedRole: UserRole; children: React.ReactNode }) {
  const { role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!role) {
      navigate("/", { replace: true });
    } else if (role !== allowedRole) {
      navigate(`/${role}/dashboard`, { replace: true });
    }
  }, [role, allowedRole, navigate, location]);

  if (!role || role !== allowedRole) {
    return null;
  }

  return <>{children}</>;
}
