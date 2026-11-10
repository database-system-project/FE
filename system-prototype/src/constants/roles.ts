import { type Role } from "../types";

export const roleLabel: Record<Role, string> = {
  patient: "환자",
  desk: "원무 직원",
  doctor: "의사",
  cashier: "수납 담당자",
  admin: "관리자",
};
