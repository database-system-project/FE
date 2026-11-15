import { api } from "./client";
import type {
  AppointmentCancelResponse,
  AppointmentSlot,
  Availability,
  BookingDepartment,
  BookingDoctor,
  ListResponse,
  PatientAppointment,
  RescheduleResponse,
} from "./types";

// 환자(PATIENT) 화면에서 쓰는 API

export const patientApi = {
  /** 예약할 수 있는 진료과 */
  departments: () => api.get<ListResponse<BookingDepartment>>("/departments"),

  /** 진료과별 의사 */
  doctors: (departmentId: number) => api.get<ListResponse<BookingDoctor>>(`/departments/${departmentId}/doctors`),

  /** 기간 안의 예약 가능 시각 (from·to는 YYYY-MM-DD, 둘 다 포함) */
  availability: (doctorId: number, from: string, to: string) =>
    api.get<Availability>(`/doctors/${doctorId}/availability`, { from, to }),

  /** 내 예약 목록. period: UPCOMING(앞으로 남은 예약완료) / PAST(나머지) */
  appointments: (params: { period?: "UPCOMING" | "PAST" } = {}) =>
    api.get<ListResponse<PatientAppointment>>("/appointments", params),

  /** 예약 신청 */
  book: (slot: AppointmentSlot) => api.post<PatientAppointment>("/appointments", slot),

  /** 예약 시간 변경: 기존 예약은 취소되고 새 예약이 생긴다 */
  reschedule: (appointmentId: number, slot: AppointmentSlot) =>
    api.post<RescheduleResponse>(`/appointments/${appointmentId}/reschedule`, slot),

  /** 예약 취소 */
  cancel: (appointmentId: number) => api.post<AppointmentCancelResponse>(`/appointments/${appointmentId}/cancel`),
};
