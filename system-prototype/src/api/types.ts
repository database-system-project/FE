// 백엔드와 주고받는 값의 모양 (Notion API 명세서 기준)

/** DB의 user_account.role 값 그대로 */
export type ApiRole = "PATIENT" | "RECEPTION" | "DOCTOR" | "CASHIER" | "ADMIN";

/** 로그인 응답의 user. 역할에 따라 patientId / doctorId / staffId 중 하나만 온다. */
export type LoginUser = {
  accountId: number;
  name: string;
  role: ApiRole;
  patientId?: number;
  doctorId?: number;
  staffId?: number;
};

export type LoginResponse = {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number; // 초
  user: LoginUser;
};

export type SignupRequest = {
  loginId: string;
  password: string;
  name: string;
  birthDate: string; // YYYY-MM-DD
  gender: "M" | "F";
  phone: string; // 숫자만
  privacyAgreed: true;
};

export type SignupResponse = {
  accountId: number;
  patientId: number;
  role: "PATIENT";
};

export type MeResponse = {
  accountId: number;
  loginId: string;
  name: string;
  role: ApiRole;
  active: boolean;
  profile: Record<string, unknown>;
};

// ── 접수·진료 (원무) ──────────────────────────────

export type AppointmentStatus = "RESERVED" | "CHECKED_IN" | "CANCELLED";
export type VisitStatus = "WAITING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

/** GET /reception/appointments 의 items[] */
export type ReceptionAppointment = {
  appointmentId: number;
  appointmentCode: string;
  patientId: number;
  patientName: string;
  departmentId: number;
  departmentName: string;
  doctorId: number;
  doctorName: string;
  scheduleId: number;
  startsAt: string; // 접수 예정시각 (ISO, +09:00)
  status: AppointmentStatus;
  canReschedule: boolean;
  canCancel: boolean;
  visitId: number | null; // 접수 전이면 null
};

/** GET /visits/queue 의 items[], 접수 응답의 visit */
export type QueueVisit = {
  visitId: number;
  appointmentId: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  departmentName: string;
  receptionNumber: number;
  receptionCode: string;
  status: VisitStatus;
  checkedInAt: string;
  startedAt: string | null;
  completedAt: string | null;
};

export type CheckInResponse = {
  appointmentId: number;
  appointmentStatus: AppointmentStatus;
  visit: QueueVisit;
};

export type VisitCancelResponse = {
  visitId: number;
  status: "CANCELLED";
  appointmentId: number;
  appointmentStatus: "CANCELLED";
  cancelledAt: string;
};

export type ListResponse<T> = { items: T[] };

// ── 의사 (진료·처방) ──────────────────────────────

export type PrescriptionStatus = "ACTIVE" | "CANCELLED";
export type DoseTiming = "BEFORE_MEAL" | "AFTER_MEAL" | "BEDTIME";
export type WarningType = "INTERACTION" | "AGE";

/** GET /me 의 의사 profile */
export type DoctorProfile = {
  doctorId: number;
  departmentId: number;
  departmentName: string;
};

/** GET /doctor/schedules 의 items[] */
export type DoctorSchedule = {
  scheduleId: number;
  doctorId: number;
  doctorName: string;
  date: string; // YYYY-MM-DD
  receptionStart: string; // "09:00"
  closingTime: string;
  lunchStart: string;
  lunchEnd: string;
  closed: boolean;
};

export type VisitPatient = {
  patientId: number;
  name: string;
  birthDate: string;
  gender: "M" | "F";
  phone: string;
};

export type MedicalRecord = {
  recordId: number;
  visitId: number;
  symptoms: string;
  diagnosis: string;
  treatmentNote: string;
  writtenAt: string;
  updatedAt: string;
};

export type MedicalRecordInput = {
  symptoms: string;
  diagnosis: string;
  treatmentNote: string;
};

/** 다른 진료에서 받아 아직 복용 기간이 남은 약 */
export type CurrentMedication = {
  prescriptionId: number;
  medicationId: number;
  prescribedAt: string;
  durationDays: number;
};

export type PrescriptionItem = {
  medicationId: number;
  dosePerIntake: number;
  doseUnit: string;
  timesPerDay: number;
  intervalDays: number;
  durationDays: number;
  timing: DoseTiming;
  instructions: string;
};

export type VisitPrescription = {
  prescriptionId: number;
  visitId: number;
  status: PrescriptionStatus;
  prescribedAt: string;
  items: PrescriptionItem[];
};

/** GET /doctor/visits/{visitId} */
export type DoctorVisitDetail = {
  visit: QueueVisit;
  patient: VisitPatient;
  medicalRecord: MedicalRecord | null;
  currentMedications: CurrentMedication[];
  prescriptions: VisitPrescription[];
};

export type VisitStartResponse = { visitId: number; status: "IN_PROGRESS"; startedAt: string };
export type VisitCompleteResponse = {
  visitId: number;
  status: "COMPLETED";
  completedAt: string;
  paymentStatus: "UNPAID";
};

/** GET /doctor/medications 의 items[] */
export type Medication = {
  medicationId: number;
  itemSeq: string;
  name: string;
  companyName: string;
  efficacy: string | null;
  usage: string | null;
  precautions: string | null;
  storage: string | null;
  active: boolean;
};

export type DurWarning = {
  warningId: string; // 서버가 준 값을 그대로 돌려보낸다
  type: WarningType;
  ruleKey: { medicationId?: number; ageSeq?: number; medicationAId?: number; medicationBId?: number };
  medicationIds: number[];
  message: string;
};

export type PrescriptionSaveRequest = {
  items: PrescriptionItem[];
  overrides: { warningId: string; reason: string }[];
};

export type PrescriptionSaveResponse = { prescriptionId: number; status: "ACTIVE"; warningCount: number };

// ── 관리자 ──────────────────────────────

export type StaffRole = "DOCTOR" | "RECEPTION" | "CASHIER" | "ADMIN";
export type FeeType = "FIRST_VISIT" | "FOLLOW_UP";
export type AgeOperator = "LT" | "LTE";

export type StaffAccount = { accountId: number; loginId: string; name: string; role: StaffRole; active: boolean };
export type StaffAccountDetail = StaffAccount & { staffId: number; doctorId: number | null };
export type StaffAccountCreate = { loginId: string; initialPassword: string; name: string; role: StaffRole; active: boolean };

export type Department = { departmentId: number; name: string; active: boolean };

export type AdminDoctor = {
  doctorId: number;
  accountId: number;
  departmentId: number;
  departmentName: string;
  name: string;
  active: boolean;
};
export type AdminDoctorCreate = { accountId: number; departmentId: number; name: string; active: boolean };

export type ConsultationFee = { feeId: number; feeType: FeeType; amount: number; currency: "KRW"; effectiveFrom: string };

export type MedicationInput = {
  itemSeq: string;
  name: string;
  companyName: string;
  efficacy: string | null;
  usage: string | null;
  precautions: string | null;
  storage: string | null;
  active: boolean;
};

export type DrugInteraction = { type: "INTERACTION"; medicationAId: number; medicationBId: number; message: string };
export type AgeContraindication = {
  type: "AGE";
  medicationId: number;
  ageSeq: number;
  ageLimit: number;
  ageOperator: AgeOperator;
  message: string;
};

export type AdminSchedule = DoctorSchedule;

// ── 환자 예약 ──────────────────────────────

/** GET /departments 의 items[] (예약용, 활성 진료과만) */
export type BookingDepartment = { departmentId: number; name: string };
/** GET /departments/{id}/doctors 의 items[] */
export type BookingDoctor = { doctorId: number; name: string; departmentId: number };
/** GET /doctors/{id}/availability */
export type Availability = { doctorId: number; items: { date: string; scheduleId: number; slots: string[] }[] };

/** 환자 본인 예약 (목록·상세·신청 응답) */
export type PatientAppointment = {
  appointmentId: number;
  appointmentCode: string;
  patientId: number;
  departmentId: number;
  departmentName: string;
  doctorId: number;
  doctorName: string;
  scheduleId: number;
  startsAt: string;
  status: AppointmentStatus;
  canReschedule: boolean;
  canCancel: boolean;
};

export type AppointmentSlot = { scheduleId: number; startsAt: string };
export type RescheduleResponse = { previousAppointmentId: number; newAppointment: PatientAppointment };
export type AppointmentCancelResponse = { appointmentId: number; status: "CANCELLED"; cancelledAt: string };
