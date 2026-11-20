import { api } from "./client";
import type {
  AppointmentCancelResponse,
  AppointmentSlot,
  Availability,
  BookingDepartment,
  BookingDoctor,
  ListResponse,
  MedGuide,
  PatientAppointment,
  PatientProfile,
  PatientVisit,
  PatientVisitDetail,
  Receipt,
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

  /** 내 기본정보 수정. 바꾼 칸(name, phone)만 보낸다 */
  updateProfile: (body: { name?: string; phone?: string }) => api.patch<PatientProfile>("/me/profile", body),

  /** 비밀번호 변경. 성공하면 기존 토큰이 무효가 되어 다시 로그인해야 한다 */
  changePassword: (currentPassword: string, newPassword: string) =>
    api.patch<{ changed: true }>("/me/password", { currentPassword, newPassword }),

  /** 내 진료 이용내역 (진료 완료만, 최신순) */
  visits: () => api.get<ListResponse<PatientVisit>>("/me/visits"),

  /** 내 진료기록 상세 */
  visit: (visitId: number) => api.get<PatientVisitDetail>(`/me/visits/${visitId}`),

  /** 처방·복약 안내 */
  medGuide: (prescriptionId: number) => api.get<MedGuide>(`/me/prescriptions/${prescriptionId}`),

  /** 전자영수증 (환자 본인 것만) */
  receipt: (paymentId: number) => api.get<Receipt>(`/payments/${paymentId}/receipt`),
};
