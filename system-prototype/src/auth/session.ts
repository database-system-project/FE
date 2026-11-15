import type { LoginUser } from "../api/types";

// 로그인 정보를 브라우저(localStorage)에 저장해서 새로고침해도 로그인이 유지되게 한다.
// 시크릿 창 등에서 저장소를 못 쓰면 저장만 안 될 뿐 앱은 그대로 동작한다.

export type Session = {
  accessToken: string;
  expiresAt: number; // 만료 시각 (ms)
  user: LoginUser;
};

const KEY = "oncare.session";

export function saveSession(session: Session) {
  try {
    localStorage.setItem(KEY, JSON.stringify(session));
  } catch {
    /* 저장소를 못 쓰는 환경 */
  }
}

/** 저장된 로그인 정보. 없거나 만료됐으면 null */
export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as Session;
    if (!session.accessToken || !session.user || Date.now() >= session.expiresAt) {
      localStorage.removeItem(KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* 저장소를 못 쓰는 환경 */
  }
}
