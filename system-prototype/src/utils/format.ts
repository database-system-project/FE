import type { AppointmentStatus, VisitStatus } from "../api/types";

// 서버 시각(ISO 문자열)을 병원 기준(한국 시간)으로 보여주는 함수들

const TZ = "Asia/Seoul";

/** "2026-11-10T09:30:00+09:00" → "09:30" */
export function formatTime(iso: string | null | undefined) {
  if (!iso) return "-";
  return new Intl.DateTimeFormat("ko-KR", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false }).format(
    new Date(iso),
  );
}

/** 오늘 날짜 문구. 예: "2026년 11월 13일 금요일" */
export function todayLabel(date = new Date()) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: TZ,
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(date);
}

/** 한국 시간 기준 시(0~23) */
export function hourOf(iso: string) {
  return Number(
    new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", hour12: false }).format(new Date(iso)),
  );
}

// 상태 코드 → 화면 문구와 배지 색 (서버 값은 대문자 코드 그대로 받는다)

export const appointmentStatusLabel: Record<AppointmentStatus, string> = {
  RESERVED: "예약완료",
  CHECKED_IN: "접수완료",
  CANCELLED: "취소",
};
export const appointmentStatusTone: Record<AppointmentStatus, string> = {
  RESERVED: "blue",
  CHECKED_IN: "green",
  CANCELLED: "red",
};

export const visitStatusLabel: Record<VisitStatus, string> = {
  WAITING: "대기",
  IN_PROGRESS: "진료 중",
  COMPLETED: "진료 완료",
  CANCELLED: "취소",
};
export const visitStatusTone: Record<VisitStatus, string> = {
  WAITING: "orange",
  IN_PROGRESS: "mint",
  COMPLETED: "green",
  CANCELLED: "red",
};

/** "2026-11-10" 또는 ISO 일시 → "2026.11.10" (한국 날짜 기준) */
export function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value.replace(/-/g, ".");
  return dateKey(new Date(value)).replace(/-/g, ".");
}

/** 한국 날짜 "YYYY-MM-DD" */
export function dateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
  return parts; // en-CA는 YYYY-MM-DD 형식
}

/** "YYYY-MM-DD"에 일수를 더한 날짜 */
export function addDays(key: string, days: number) {
  const d = new Date(`${key}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** 오늘(한국) 기준 만 나이 */
export function ageOf(birthDate: string, today = dateKey()) {
  const [by, bm, bd] = birthDate.split("-").map(Number);
  const [ty, tm, td] = today.split("-").map(Number);
  return ty - by - (tm < bm || (tm === bm && td < bd) ? 1 : 0);
}

export const genderLabel: Record<"M" | "F", string> = { M: "남성", F: "여성" };

/** "01012345678" → "010-1234-5678" */
export function formatPhone(phone: string) {
  const d = phone.replace(/\D/g, "");
  if (d.length === 11) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return phone;
}

/** 처방일 + 투약일수 → 복용 마지막 날 (처방일 포함, 처방일+일수 미만) */
export function medicationEndDate(prescribedAt: string, durationDays: number) {
  return addDays(dateKey(new Date(prescribedAt)), durationDays - 1);
}

export const timingLabel: Record<"BEFORE_MEAL" | "AFTER_MEAL" | "BEDTIME", string> = {
  BEFORE_MEAL: "식전",
  AFTER_MEAL: "식후",
  BEDTIME: "취침 전",
};
