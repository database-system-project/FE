import { api } from "./client";
import type {
  AppointmentStatus,
  CheckInResponse,
  ListResponse,
  PatientProfile,
  QueueVisit,
  ReceptionAppointment,
  StaffPatientSummary,
  VisitCancelResponse,
  VisitStatus,
} from "./types";

// 원무(RECEPTION) 화면에서 쓰는 API. 대기열은 의사 화면도 같이 쓴다.

export const receptionApi = {
  /** 오늘 예약 목록. keyword는 환자명 또는 환자번호 */
  appointments: (params: { keyword?: string; status?: AppointmentStatus } = {}) =>
    api.get<ListResponse<ReceptionAppointment>>("/reception/appointments", params),

  /** 예약 환자 도착 접수 */
  checkIn: (appointmentId: number) =>
    api.post<CheckInResponse>(`/reception/appointments/${appointmentId}/check-in`),

  /** 대기 중인 접수 취소 (사유 필수, 200자 이내) */
  cancelVisit: (visitId: number, reason: string) =>
    api.post<VisitCancelResponse>(`/reception/visits/${visitId}/cancel`, { reason }),

  /** 오늘 대기열. status를 안 주면 WAITING·IN_PROGRESS만 온다 */
  queue: (params: { doctorId?: number; status?: VisitStatus } = {}) =>
    api.get<ListResponse<QueueVisit>>("/visits/queue", params),

  /** 정정할 환자 찾기. 이름·생년월일·전화번호 중 하나 이상 */
  searchPatients: (params: { name?: string; birthDate?: string; phone?: string }) =>
    api.get<ListResponse<StaffPatientSummary>>("/staff/patients", params),

  /** 정정 대상 환자 상세 */
  patient: (patientId: number) => api.get<PatientProfile>(`/staff/patients/${patientId}`),

  /** 생년월일·성별 정정. 바꾸기 전 값은 서버가 patient_demographic_audit에 남긴다 */
  correctDemographics: (patientId: number, body: { birthDate?: string; gender?: "M" | "F" }) =>
    api.patch<PatientProfile>(`/staff/patients/${patientId}/demographics`, body),
};
