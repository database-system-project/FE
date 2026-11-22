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
  medicationName: string;
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
  items: (PrescriptionItem & { medicationName: string })[];
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
  medicationNames: string[]; // medicationIds와 같은 순서
  message: string;
};

export type PrescriptionSaveRequest = {
  items: PrescriptionItem[];
  overrides: { warningId: string; reason: string }[];
};

export type PrescriptionSaveResponse = { prescriptionId: number; status: "ACTIVE"; warningCount: number };

// ── 관리자 ──────────────────────────────

/** 직원 계정 역할. 의사 계정은 의사 관리(/admin/doctors)에서 따로 만든다 */
export type StaffRole = "RECEPTION" | "CASHIER" | "ADMIN";
export type FeeType = "FIRST_VISIT" | "FOLLOW_UP";
export type AgeOperator = "LT" | "LTE";

export type StaffAccount = { accountId: number; loginId: string; name: string; role: StaffRole; active: boolean };
export type StaffAccountDetail = StaffAccount & { staffId: number };
export type StaffAccountCreate = { loginId: string; initialPassword: string; name: string; role: StaffRole; active: boolean };

export type Department = { departmentId: number; name: string; active: boolean };

export type AdminDoctor = {
  doctorId: number;
  accountId: number;
  departmentId: number;
  departmentName: string;
  name: string;
  active: boolean; // 신규 예약 허용
  loginId: string;
  accountActive: boolean; // 로그인 허용
};
/** 의사 등록: 로그인 계정과 의사 정보를 한 번에 만든다 */
export type AdminDoctorCreate = {
  loginId: string;
  initialPassword: string;
  departmentId: number;
  name: string;
  active: boolean;
  accountActive?: boolean;
};

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

// ── 환자 내 정보·이용내역 ──────────────────────────────

/** GET /me 의 profile (환자) · PATCH /me/profile 응답 */
export type PatientProfile = {
  patientId: number;
  name: string;
  birthDate: string;
  gender: "M" | "F";
  phone: string;
};

export type PaymentStatus = "UNPAID" | "PAID";

/** GET /me/visits 의 items[] (진료 완료만, 최신순) */
export type PatientVisit = {
  visitId: number;
  visitDate: string;
  departmentName: string;
  doctorName: string;
  status: "COMPLETED";
  paymentStatus: PaymentStatus;
  paymentId: number | null;
};

/** GET /me/visits/{visitId} */
export type PatientVisitDetail = {
  visit: QueueVisit;
  medicalRecord: MedicalRecord | null;
  prescriptions: { prescriptionId: number; status: PrescriptionStatus; prescribedAt: string }[];
  paymentStatus: PaymentStatus;
  paymentId: number | null;
};

/** GET /me/prescriptions/{prescriptionId} 의 items[]: 처방 품목 + 약품 안내 */
export type MedGuideItem = PrescriptionItem & {
  name: string;
  efficacy: string | null;
  usage: string | null;
  precautions: string | null;
  storage: string | null;
};

/** GET /me/prescriptions/{prescriptionId} */
export type MedGuide = {
  prescriptionId: number;
  status: PrescriptionStatus;
  prescribedAt: string;
  items: MedGuideItem[];
};

/** GET /payments/{paymentId}/receipt */
export type Receipt = {
  receiptNumber: number;
  paymentId: number;
  feeId: number;
  feeType: FeeType;
  amount: number;
  currency: "KRW";
  paidAt: string;
  patientId: number;
  patientName: string;
  visitDate: string;
  departmentName: string;
  doctorName: string;
};

// ── 수납 ──────────────────────────────

/** 수납 금액 정보. 결제 전에는 지금 적용될 진찰료, 결제 후에는 결제한 금액이 온다 */
export type BillingQuote = {
  visitId: number;
  paymentStatus: PaymentStatus;
  paymentId: number | null;
  feeId: number;
  feeType: FeeType;
  amount: number;
  currency: "KRW";
  paidAt?: string; // 결제 후에만
};

/** GET /billing/visits 의 items[] (진료 완료된 접수) */
export type BillingVisit = BillingQuote & {
  patientId: number;
  patientName: string;
  doctorName: string;
  departmentName: string;
  completedAt: string;
};

/** POST /billing/visits/{visitId}/payments 응답 */
export type PaymentResult = BillingQuote & { paymentStatus: "PAID"; paymentId: number; paidAt: string };

/** 처방전 품목. 백엔드가 약품 이름을 주면 medicationName으로 받는다 */
export type PrintItem = PrescriptionItem & { medicationName?: string };

/** GET /billing/visits/{visitId}/prescription-print */
export type PrescriptionPrint = {
  visitId: number;
  paymentId: number;
  patient: { patientId: number; name: string; birthDate: string; gender: "M" | "F"; phone: string };
  doctor: { doctorId: number; name: string; departmentName: string };
  prescriptions: { prescriptionId: number; visitId: number; status: PrescriptionStatus; prescribedAt: string; items: PrintItem[] }[];
  canPrint: boolean;
};

// ── 원무: 환자 정보 정정 ──────────────────
/** GET /staff/patients 의 items[] (전화번호는 가운데를 가려서 온다) */
export type StaffPatientSummary = {
  patientId: number;
  name: string;
  birthDate: string;
  gender: "M" | "F";
  displayPhone: string;
};
