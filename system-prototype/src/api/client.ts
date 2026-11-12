import { clearSession, loadSession } from "../auth/session";

// 개발 중에는 "/api/v1"로 부르면 Vite가 백엔드(localhost:8080)로 넘겨준다 (vite.config.ts의 proxy).
// 배포 등 다른 서버를 쓸 때는 .env의 VITE_API_BASE_URL에 전체 주소를 넣는다.
const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api/v1").replace(/\/$/, "");

/** 서버가 보낸 오류. 화면에서는 message 문구가 아니라 code로 분기한다. */
export class ApiError extends Error {
  status: number;
  code: string;
  details?: Record<string, unknown>;

  constructor(status: number, code: string, message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/** 토큰이 만료돼 다시 로그인해야 할 때 AuthContext가 듣는 이벤트 이름 */
export const AUTH_EXPIRED_EVENT = "auth:expired";

type Query = Record<string, string | number | boolean | undefined | null>;

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Query;
  /** 로그인·회원가입처럼 토큰 없이 부르는 API는 false */
  auth?: boolean;
};

function buildUrl(path: string, query?: Query) {
  const url = `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  if (!query) return url;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") params.append(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

/** 모든 API 호출이 거치는 함수. 토큰을 붙이고, 오류 응답을 ApiError로 바꾼다. */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, query, auth = true } = options;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const session = loadSession();
    if (session) headers.Authorization = `Bearer ${session.accessToken}`;
  }

  let res: Response;
  try {
    res = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", "서버에 연결할 수 없습니다. 백엔드가 켜져 있는지 확인해 주세요.");
  }

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    const err = (data ?? {}) as { code?: string; message?: string; details?: Record<string, unknown> };
    const error = new ApiError(
      res.status,
      err.code ?? `HTTP_${res.status}`,
      err.message ?? "요청을 처리하지 못했습니다.",
      err.details,
    );
    // 토큰이 없거나 만료된 경우: 저장된 로그인 정보를 지우고 로그인 화면으로 돌아가게 한다.
    if (res.status === 401 && auth) {
      clearSession();
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    }
    throw error;
  }

  return data as T;
}

export const api = {
  get: <T>(path: string, query?: Query) => request<T>(path, { query }),
  post: <T>(path: string, body?: unknown, auth = true) => request<T>(path, { method: "POST", body, auth }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: "PATCH", body }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
