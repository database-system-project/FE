import { api } from "./client";
import type {
  AdminDoctor,
  AdminDoctorCreate,
  AdminSchedule,
  AgeContraindication,
  AgeOperator,
  ConsultationFee,
  Department,
  DrugInteraction,
  FeeType,
  ListResponse,
  Medication,
  MedicationInput,
  StaffAccount,
  StaffAccountCreate,
  StaffAccountDetail,
  StaffRole,
} from "./types";

// 관리자(ADMIN) 화면에서 쓰는 API. 삭제 대신 active=false로 사용을 중지한다 (일정만 DELETE 가능).
// PATCH에는 바뀐 필드만 보낸다 (최소 1개).

export const adminApi = {
  // 직원 계정 (환자 계정은 관리 대상이 아니다)
  staffAccounts: (params: { role?: StaffRole; active?: boolean } = {}) =>
    api.get<ListResponse<StaffAccount>>("/admin/staff-accounts", params),
  staffAccount: (accountId: number) => api.get<StaffAccountDetail>(`/admin/staff-accounts/${accountId}`),
  createStaffAccount: (body: StaffAccountCreate) => api.post<StaffAccount>("/admin/staff-accounts", body),
  updateStaffAccount: (accountId: number, body: Partial<Pick<StaffAccount, "name" | "role" | "active">>) =>
    api.patch<StaffAccount>(`/admin/staff-accounts/${accountId}`, body),

  // 진료과
  departments: (params: { keyword?: string; active?: boolean } = {}) =>
    api.get<ListResponse<Department>>("/admin/departments", params),
  createDepartment: (body: { name: string; active: boolean }) => api.post<Department>("/admin/departments", body),
  updateDepartment: (departmentId: number, body: Partial<Pick<Department, "name" | "active">>) =>
    api.patch<Department>(`/admin/departments/${departmentId}`, body),

  // 의사 (DOCTOR 역할 직원 계정에 의사 프로필을 연결한다)
  doctors: (params: { departmentId?: number; keyword?: string; active?: boolean } = {}) =>
    api.get<ListResponse<AdminDoctor>>("/admin/doctors", params),
  createDoctor: (body: AdminDoctorCreate) => api.post<AdminDoctor>("/admin/doctors", body),
  updateDoctor: (doctorId: number, body: Partial<Pick<AdminDoctor, "departmentId" | "name" | "active">>) =>
    api.patch<AdminDoctor>(`/admin/doctors/${doctorId}`, body),

  // 의사 일정 (운영시간은 고정값이라 보낼 수 없다)
  schedules: (params: { doctorId?: number; from?: string; to?: string } = {}) =>
    api.get<ListResponse<AdminSchedule>>("/admin/schedules", params),
  createSchedule: (body: { doctorId: number; date: string; closed: boolean }) =>
    api.post<AdminSchedule>("/admin/schedules", body),
  updateSchedule: (scheduleId: number, body: Partial<{ doctorId: number; date: string; closed: boolean }>) =>
    api.patch<AdminSchedule>(`/admin/schedules/${scheduleId}`, body),
  deleteSchedule: (scheduleId: number) => api.delete<null>(`/admin/schedules/${scheduleId}`),

  // 약품
  medications: (params: { keyword?: string; active?: boolean } = {}) =>
    api.get<ListResponse<Medication>>("/admin/medications", params),
  createMedication: (body: MedicationInput) => api.post<Medication>("/admin/medications", body),
  updateMedication: (medicationId: number, body: Partial<Omit<MedicationInput, "itemSeq">>) =>
    api.patch<Medication>(`/admin/medications/${medicationId}`, body),

  // 병용금기 (A < B로 서버가 정규화)
  interactions: (params: { medicationId?: number } = {}) =>
    api.get<ListResponse<DrugInteraction>>("/admin/drug-interactions", params),
  createInteraction: (body: { medicationAId: number; medicationBId: number; message: string }) =>
    api.post<DrugInteraction>("/admin/drug-interactions", body),
  updateInteraction: (a: number, b: number, message: string) =>
    api.patch<DrugInteraction>(`/admin/drug-interactions/${a}/${b}`, { message }),

  // 연령금기 (ageSeq는 서버가 발급)
  ageRules: (params: { medicationId?: number } = {}) =>
    api.get<ListResponse<AgeContraindication>>("/admin/age-contraindications", params),
  createAgeRule: (body: { medicationId: number; ageLimit: number; ageOperator: AgeOperator; message: string }) =>
    api.post<AgeContraindication>("/admin/age-contraindications", body),
  updateAgeRule: (
    medicationId: number,
    ageSeq: number,
    body: Partial<{ ageLimit: number; ageOperator: AgeOperator; message: string }>,
  ) => api.patch<AgeContraindication>(`/admin/age-contraindications/${medicationId}/${ageSeq}`, body),

  // 진찰료 (변경은 새 이력 행 추가)
  fees: () => api.get<ListResponse<ConsultationFee>>("/admin/consultation-fee"),
  changeFee: (body: { feeType: FeeType; amount: number; effectiveFrom: string }) =>
    api.patch<ConsultationFee>("/admin/consultation-fee", body),
};
