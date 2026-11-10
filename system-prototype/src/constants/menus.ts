import { type Role } from "../types";

export const menus: Record<Role, { id: string; label: string; icon: string }[]> = {
  patient: [
    { id: "patient-home", label: "홈", icon: "home" },
    { id: "booking", label: "진료 예약", icon: "calendar" },
    { id: "reservations", label: "예약 조회", icon: "list" },
    { id: "records", label: "진료 내역", icon: "file" },
    { id: "med-guide", label: "처방·복약 안내", icon: "pill" },
    { id: "receipts", label: "전자영수증", icon: "receipt" },
    { id: "patient-info", label: "내 정보", icon: "users" },
  ],
  desk: [
    { id: "desk-home", label: "원무 대시보드", icon: "home" },
    { id: "desk-reservations", label: "오늘 예약", icon: "calendar" },
    { id: "waiting", label: "접수·대기 관리", icon: "users" },
  ],
  doctor: [
    { id: "doctor-home", label: "진료 대시보드", icon: "home" },
    { id: "doctor-home", label: "오늘의 대기 환자", icon: "users" },
    { id: "doctor-records", label: "진료 기록", icon: "file" },
    { id: "doctor-schedule", label: "진료 일정 조회", icon: "calendar" },
  ],
  cashier: [
    { id: "cashier-home", label: "수납 대시보드", icon: "home" },
    { id: "cashier-home", label: "결제 대기", icon: "receipt" },
    { id: "cashier-history", label: "결제 내역", icon: "list" },
  ],
  admin: [
    { id: "admin-home", label: "관리자 대시보드", icon: "home" },
    { id: "departments", label: "진료과 관리", icon: "file" },
    { id: "doctors", label: "의사·일정 관리", icon: "users" },
    { id: "accounts", label: "사용자 계정", icon: "shield" },
    { id: "medicines", label: "약품 관리", icon: "pill" },
    { id: "interactions", label: "병용금기 관리", icon: "warning" },
    { id: "age-rules", label: "연령금기 관리", icon: "warning" },
    { id: "fees", label: "진찰료 관리", icon: "receipt" },
  ],
};
