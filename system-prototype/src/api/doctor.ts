import { api } from "./client";
import type {
  DoctorSchedule,
  DoctorVisitDetail,
  DurWarning,
  ListResponse,
  MedicalRecord,
  MedicalRecordInput,
  Medication,
  PrescriptionSaveRequest,
  PrescriptionSaveResponse,
  QueueVisit,
  VisitCompleteResponse,
  VisitStartResponse,
  VisitStatus,
} from "./types";

// 의사(DOCTOR) 화면에서 쓰는 API. 서버가 토큰으로 본인 담당 범위를 확인한다.

export const doctorApi = {
  /** 오늘 내 대기열. status를 안 주면 WAITING·IN_PROGRESS만 온다 */
  queue: (status?: VisitStatus) => api.get<ListResponse<QueueVisit>>("/visits/queue", { status }),

  /** 내 진료 일정 (from·to 포함, YYYY-MM-DD) */
  schedules: (from: string, to: string) => api.get<ListResponse<DoctorSchedule>>("/doctor/schedules", { from, to }),

  /** 담당 진료 상세: 환자·진료기록·현재 복용약·이번 진료 처방 */
  visit: (visitId: number) => api.get<DoctorVisitDetail>(`/doctor/visits/${visitId}`),

  /** 진료 시작. 내 대기열의 맨 앞 환자만 가능 */
  start: (visitId: number) => api.post<VisitStartResponse>(`/doctor/visits/${visitId}/start`),

  /** 진료 완료. 진료기록이 저장돼 있어야 한다 */
  complete: (visitId: number) => api.post<VisitCompleteResponse>(`/doctor/visits/${visitId}/complete`),

  /** 진료기록 최초 작성 */
  createRecord: (visitId: number, body: MedicalRecordInput) =>
    api.post<MedicalRecord>(`/doctor/visits/${visitId}/medical-record`, body),

  /** 진료기록 수정. 바뀐 필드만 보낸다 (최소 1개) */
  updateRecord: (visitId: number, body: Partial<MedicalRecordInput>) =>
    api.patch<MedicalRecord>(`/doctor/visits/${visitId}/medical-record`, body),

  /** 처방할 수 있는 활성 약품 검색 (제품명 또는 품목기준코드) */
  medications: (keyword: string) => api.get<ListResponse<Medication>>("/doctor/medications", { keyword }),

  /** 처방 전 금기 확인. 경고가 없으면 warnings가 빈 배열 */
  checkPrescription: (visitId: number, medicationIds: number[]) =>
    api.post<{ warnings: DurWarning[] }>(`/doctor/visits/${visitId}/prescription-checks`, { medicationIds }),

  /** 처방 저장. 경고마다 사유가 있어야 하며, 경고가 바뀌면 409 DUR_OVERRIDE_REQUIRED */
  savePrescription: (visitId: number, body: PrescriptionSaveRequest) =>
    api.post<PrescriptionSaveResponse>(`/doctor/visits/${visitId}/prescriptions`, body),

  /** 진료 중인 건의 처방 취소 */
  cancelPrescription: (prescriptionId: number) =>
    api.post<{ prescriptionId: number; status: "CANCELLED" }>(`/doctor/prescriptions/${prescriptionId}/cancel`),
};

// 진료 상세·금기 경고에는 약품 ID만 온다 (BE에 약품명 필드 추가 요청 예정).
// 그때까지는 ID로 표시한다.
/** 약품명이 있으면 이름, 없으면 번호로 표시한다 */
export function medicationLabel(id: number, name?: string | null) {
  return name || `약품 #${id}`;
}
