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
