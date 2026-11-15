import { api } from "./client";
import type {
  AppointmentStatus,
  CheckInResponse,
  ListResponse,
  QueueVisit,
  ReceptionAppointment,
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
};
