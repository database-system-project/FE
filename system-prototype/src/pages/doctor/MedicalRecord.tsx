import { useEffect, useState } from "react";
import { Icon } from "../../components/Icon";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { EmptyAvatar } from "../../components/EmptyAvatar";
import { PageHeader } from "../../components/PageHeader";
import { TableState } from "../../components/TableState";
import { ApiError } from "../../api/client";
import { doctorApi } from "../../api/doctor";
import type { DoctorVisitDetail, MedicalRecordInput } from "../../api/types";
import { ageOf, formatDate, formatPhone, formatTime, genderLabel } from "../../utils/format";
import { CurrentMedicationList } from "./CurrentMedicationList";
import { NoCurrentVisit } from "./NoCurrentVisit";
import { useCurrentVisit } from "./useCurrentVisit";

const emptyForm: MedicalRecordInput = { symptoms: "", diagnosis: "", treatmentNote: "" };
const fields: (keyof MedicalRecordInput)[] = ["symptoms", "diagnosis", "treatmentNote"];

export function MedicalRecord({ navigate }: { navigate: (s: string) => void }) {
  const { data, loading, error, reload } = useCurrentVisit();
  if (loading && !data) return <TableState loading error="" empty emptyText="" />;
  if (error) return <TableState loading={false} error={error} empty emptyText="" />;
  if (!data) return <NoCurrentVisit navigate={navigate} />;
  return <RecordForm key={data.visit.visitId} detail={data} reload={reload} navigate={navigate} />;
}

function RecordForm({
  detail,
  reload,
  navigate,
}: {
  detail: DoctorVisitDetail;
  reload: () => Promise<void>;
  navigate: (s: string) => void;
}) {
  const { visit, patient, medicalRecord, currentMedications, prescriptions } = detail;
  const saved: MedicalRecordInput = medicalRecord
    ? { symptoms: medicalRecord.symptoms, diagnosis: medicalRecord.diagnosis, treatmentNote: medicalRecord.treatmentNote }
    : emptyForm;
  const [form, setForm] = useState<MedicalRecordInput>(saved);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [confirmComplete, setConfirmComplete] = useState(false);

  // 서버에서 기록을 다시 받으면 입력란도 맞춘다
  useEffect(() => setForm(saved), [medicalRecord?.updatedAt]); // eslint-disable-line react-hooks/exhaustive-deps

  const changed = fields.filter((f) => form[f].trim() !== saved[f]);
  const dirty = !medicalRecord || changed.length > 0;
  const complete = fields.every((f) => form[f].trim() !== "");
  const activeRx = prescriptions.filter((p) => p.status === "ACTIVE").length;

  /** 진료기록 저장. 처음이면 작성, 있으면 바뀐 필드만 수정. 성공하면 true */
  const save = async () => {
    if (!complete) {
      setNotice({ ok: false, text: "증상·진단·진료 내용을 모두 입력해 주세요." });
      return false;
    }
    if (!dirty) return true;
    setBusy(true);
    setNotice(null);
    try {
      if (!medicalRecord) {
        await doctorApi.createRecord(visit.visitId, {
          symptoms: form.symptoms.trim(),
          diagnosis: form.diagnosis.trim(),
          treatmentNote: form.treatmentNote.trim(),
        });
      } else {
        await doctorApi.updateRecord(visit.visitId, Object.fromEntries(changed.map((f) => [f, form[f].trim()])));
      }
      setNotice({ ok: true, text: "진료기록을 저장했습니다." });
      await reload();
      return true;
    } catch (e) {
      setNotice({ ok: false, text: recordErrorText(e) });
      if (e instanceof ApiError && e.code === "MEDICAL_RECORD_EXISTS") void reload();
      return false;
    } finally {
      setBusy(false);
    }
  };

  const saveAndPrescribe = async () => {
    if (await save()) navigate("prescription");
  };

  const completeVisit = async () => {
    setBusy(true);
    setNotice(null);
    try {
      await doctorApi.complete(visit.visitId);
      setConfirmComplete(false);
      navigate("doctor-home");
    } catch (e) {
      setConfirmComplete(false);
      if (e instanceof ApiError && e.code === "MEDICAL_RECORD_REQUIRED")
        setNotice({ ok: false, text: "진료기록을 저장한 뒤 완료해 주세요." });
      else if (e instanceof ApiError && e.code === "INVALID_VISIT_STATE")
        setNotice({ ok: false, text: "진료 중인 건만 완료할 수 있습니다. 대시보드에서 상태를 확인해 주세요." });
      else setNotice({ ok: false, text: e instanceof ApiError ? e.message : "진료 완료 중 문제가 발생했습니다." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        title="환자 진료기록"
        description="진료기록을 작성한 후 처방 단계로 진행하세요. 처방은 선택이며, 마지막에 진료를 완료합니다."
        actions={<Badge tone="mint">진료 중 · {formatTime(visit.startedAt)} 시작</Badge>}
      />
      {notice && (
        <p className={notice.ok ? "form-notice" : "form-error"} role="status">
          {notice.text}
        </p>
      )}
      <div className="clinical-layout">
        <aside className="patient-panel">
          <div className="patient-profile">
            <EmptyAvatar name={patient.name} />
            <div>
              <h2>{patient.name}</h2>
              <p>환자번호 {patient.patientId}</p>
            </div>
          </div>
          <dl>
            <div>
              <dt>생년월일</dt>
              <dd>{formatDate(patient.birthDate)}</dd>
            </div>
            <div>
              <dt>나이 / 성별</dt>
              <dd>
                만 {ageOf(patient.birthDate)}세 / {genderLabel[patient.gender]}
              </dd>
            </div>
            <div>
              <dt>전화번호</dt>
              <dd>{formatPhone(patient.phone)}</dd>
            </div>
            <div>
              <dt>접수번호</dt>
              <dd>{visit.receptionCode}</dd>
            </div>
          </dl>
          <div className="history-section">
            <h3>현재 복용 중인 약</h3>
            <CurrentMedicationList items={currentMedications} />
          </div>
          <div className="history-section">
            <h3>이번 진료 처방</h3>
            <div>
              <b>{activeRx ? `유효 처방 ${activeRx}건` : "아직 처방이 없습니다"}</b>
              <small>처방 작성 화면에서 추가·취소할 수 있습니다.</small>
            </div>
          </div>
        </aside>
        <section className="clinical-form">
          <div className="card-title">
            <div>
              <h2>진료기록 입력</h2>
              <p>
                {medicalRecord
                  ? `최종 저장 ${formatDate(medicalRecord.updatedAt)} ${formatTime(medicalRecord.updatedAt)}`
                  : "담당 의사만 작성 및 수정할 수 있습니다."}
              </p>
            </div>
            {medicalRecord && !dirty && <Badge tone="green">저장됨</Badge>}
          </div>
          <label className="field">
            <span>
              증상 <i>*</i>
            </span>
            <textarea value={form.symptoms} onChange={(e) => setForm({ ...form, symptoms: e.target.value })} />
          </label>
          <label className="field">
            <span>
              진단 <i>*</i>
            </span>
            <input value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} />
          </label>
          <label className="field">
            <span>
              진료 내용 <i>*</i>
            </span>
            <textarea
              className="large"
              value={form.treatmentNote}
              onChange={(e) => setForm({ ...form, treatmentNote: e.target.value })}
            />
          </label>
          <div className="clinical-actions">
            <Button variant="outline" disabled={busy || !dirty} onClick={() => void save()}>
              {busy ? "저장 중…" : "진료기록 저장"}
            </Button>
            <Button icon="pill" disabled={busy} onClick={() => void saveAndPrescribe()}>
              저장 후 처방 작성
            </Button>
            <Button
              icon="check"
              variant="success"
              disabled={busy || !medicalRecord || dirty}
              onClick={() => setConfirmComplete(true)}
            >
              진료 완료
            </Button>
          </div>
          {(!medicalRecord || dirty) && (
            <small className="subtext">진료기록을 저장해야 진료를 완료할 수 있습니다.</small>
          )}
        </section>
      </div>
      {confirmComplete && (
        <div className="modal-layer">
          <div className="modal small-modal">
            <button className="modal-close" onClick={() => setConfirmComplete(false)}>
              <Icon name="close" />
            </button>
            <span className="section-kicker">COMPLETE VISIT</span>
            <h2>진료를 완료할까요?</h2>
            <p>
              {patient.name}님의 진료를 완료하면 수납 대기로 넘어가고, 진료기록과 처방은 더 이상 수정할 수 없습니다.
            </p>
            <dl className="confirm-list">
              <div>
                <dt>진료기록</dt>
                <dd>저장됨</dd>
              </div>
              <div>
                <dt>유효 처방</dt>
                <dd>{activeRx ? `${activeRx}건` : "없음"}</dd>
              </div>
            </dl>
            <div className="modal-actions">
              <Button variant="outline" onClick={() => setConfirmComplete(false)} disabled={busy}>
                취소
              </Button>
              <Button onClick={() => void completeVisit()} disabled={busy}>
                {busy ? "처리 중…" : "진료 완료"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function recordErrorText(e: unknown) {
  if (e instanceof ApiError) {
    if (e.code === "INVALID_VISIT_STATE") return "진료 중인 건만 기록할 수 있습니다. 이미 완료된 진료인지 확인해 주세요.";
    if (e.code === "MEDICAL_RECORD_EXISTS") return "이미 저장된 진료기록이 있습니다. 최신 내용을 불러왔으니 다시 수정해 주세요.";
    if (e.code === "INVALID_REQUEST") return "입력값을 확인해 주세요.";
    return e.message;
  }
  return "진료기록 저장 중 문제가 발생했습니다.";
}
