// 백엔드와 주고받는 값의 모양 (Notion API 명세서 기준)

/** DB의 user_account.role 값 그대로 */
export type ApiRole = "PATIENT" | "RECEPTION" | "DOCTOR" | "CASHIER" | "ADMIN";

/** 로그인 응답의 user. 역할에 따라 patientId / doctorId / staffId 중 하나만 온다. */
export type LoginUser = {
  accountId: number;
  name: string;
  role: ApiRole;
  patientId?: number;
  doctorId?: number;
  staffId?: number;
};

export type LoginResponse = {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number; // 초
  user: LoginUser;
};

export type SignupRequest = {
  loginId: string;
  password: string;
  name: string;
  birthDate: string; // YYYY-MM-DD
  gender: "M" | "F";
  phone: string; // 숫자만
  privacyAgreed: true;
};

export type SignupResponse = {
  accountId: number;
  patientId: number;
  role: "PATIENT";
};

export type MeResponse = {
  accountId: number;
  loginId: string;
  name: string;
  role: ApiRole;
  active: boolean;
  profile: Record<string, unknown>;
};
