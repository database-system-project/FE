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

// ── 접수·진료 (원무) ──────────────────────────────

export type AppointmentStatus = "RESERVED" | "CHECKED_IN" | "CANCELLED";
export type VisitStatus = "WAITING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

/** GET /reception/appointments 의 items[] */
export type ReceptionAppointment = {
  appointmentId: number;
  appointmentCode: string;
  patientId: number;
  patientName: string;
  departmentId: number;
  departmentName: string;
  doctorId: number;
  doctorName: string;
  scheduleId: number;
  startsAt: string; // 접수 예정시각 (ISO, +09:00)
  status: AppointmentStatus;
  canReschedule: boolean;
  canCancel: boolean;
  visitId: number | null; // 접수 전이면 null
};

/** GET /visits/queue 의 items[], 접수 응답의 visit */
export type QueueVisit = {
  visitId: number;
  appointmentId: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  departmentName: string;
  receptionNumber: number;
  receptionCode: string;
  status: VisitStatus;
  checkedInAt: string;
  startedAt: string | null;
  completedAt: string | null;
};

export type CheckInResponse = {
  appointmentId: number;
  appointmentStatus: AppointmentStatus;
  visit: QueueVisit;
};

export type VisitCancelResponse = {
  visitId: number;
  status: "CANCELLED";
  appointmentId: number;
  appointmentStatus: "CANCELLED";
  cancelledAt: string;
};

export type ListResponse<T> = { items: T[] };
