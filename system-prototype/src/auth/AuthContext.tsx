import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { authApi } from "../api/auth";
import { AUTH_EXPIRED_EVENT } from "../api/client";
import type { ApiRole, LoginUser } from "../api/types";
import { type Role } from "../types";
import { clearSession, loadSession, saveSession, type Session } from "./session";

/** 백엔드 역할 코드 → 화면에서 쓰는 역할 이름 */
export const roleFromApi: Record<ApiRole, Role> = {
  PATIENT: "patient",
  RECEPTION: "desk",
  DOCTOR: "doctor",
  CASHIER: "cashier",
  ADMIN: "admin",
};

type AuthValue = {
  /** 로그인한 사용자. 로그인 전이면 null */
  user: LoginUser | null;
  /** 화면용 역할 (patient, desk, doctor, cashier, admin). 로그인 전이면 null */
  role: Role | null;
  /** 실패하면 ApiError를 던진다 (예: code가 INVALID_CREDENTIALS) */
  login: (loginId: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => loadSession());

  const logout = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  const login = useCallback(async (loginId: string, password: string) => {
    const res = await authApi.login(loginId, password);
    const next: Session = {
      accessToken: res.accessToken,
      expiresAt: Date.now() + res.expiresIn * 1000,
      user: res.user,
    };
    saveSession(next);
    setSession(next);
  }, []);

  // API가 401을 받으면 (토큰 만료 등) 자동으로 로그아웃
  useEffect(() => {
    window.addEventListener(AUTH_EXPIRED_EVENT, logout);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, logout);
  }, [logout]);

  // 토큰 만료 시각이 되면 자동으로 로그아웃
  useEffect(() => {
    if (!session) return;
    const timer = window.setTimeout(logout, Math.max(0, session.expiresAt - Date.now()));
    return () => window.clearTimeout(timer);
  }, [session, logout]);

  const value = useMemo<AuthValue>(
    () => ({
      user: session?.user ?? null,
      role: session ? roleFromApi[session.user.role] : null,
      login,
      logout,
    }),
    [session, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** 어느 화면에서든 const { user, role, logout } = useAuth(); 로 꺼내 쓴다. */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth는 AuthProvider 안에서만 쓸 수 있습니다.");
  return ctx;
}
