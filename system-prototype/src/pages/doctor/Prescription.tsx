import { useState, type FormEvent } from "react";
import { Icon } from "../../components/Icon";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { PageHeader } from "../../components/PageHeader";
import { TableState } from "../../components/TableState";
import { ApiError } from "../../api/client";
import { doctorApi, medicationLabel } from "../../api/doctor";
import type { DoctorVisitDetail, DoseTiming, DurWarning, Medication, PrescriptionItem } from "../../api/types";
import { ageOf, formatDate, formatTime, medicationEndDate, timingLabel } from "../../utils/format";
import { NoCurrentVisit } from "./NoCurrentVisit";
import { useCurrentVisit } from "./useCurrentVisit";

/** 입력 중인 처방 항목. 숫자 칸은 입력 그대로 문자열로 들고 있다가 저장할 때 검사한다 */
type Draft = {
  medicationId: number;
  name: string;
  companyName: string;
  dosePerIntake: string;
  doseUnit: string;
  timesPerDay: number;
  intervalDays: number;
  durationDays: string;
  timing: DoseTiming;
  instructions: string;
};

const newDraft = (m: Medication): Draft => ({
  medicationId: m.medicationId,
  name: m.name,
  companyName: m.companyName,
  dosePerIntake: "1",
  doseUnit: "정",
  timesPerDay: 3,
  intervalDays: 1,
  durationDays: "3",
  timing: "AFTER_MEAL",
  instructions: "충분한 물과 함께 복용하세요.",
});

/** 입력값을 API 형식으로 바꾼다. 문제가 있으면 문구를 돌려준다 */
function toItems(drafts: Draft[]): PrescriptionItem[] | string {
  const items: PrescriptionItem[] = [];
  for (const d of drafts) {
    const dose = Number(d.dosePerIntake);
    const days = Number(d.durationDays);
    if (!/^\d{1,4}(\.\d{1,2})?$/.test(d.dosePerIntake.trim()) || !(dose > 0))
      return `${d.name}: 1회 투약량은 0보다 크고 소수 둘째 자리까지 입력해 주세요.`;
    if (!d.doseUnit.trim() || d.doseUnit.trim().length > 10) return `${d.name}: 투약 단위를 10자 이내로 입력해 주세요.`;
    if (!Number.isInteger(days) || days < 1 || days > 32767) return `${d.name}: 총 투약일수를 1 이상의 정수로 입력해 주세요.`;
    if (!d.instructions.trim() || d.instructions.trim().length > 200)
      return `${d.name}: 복용 방법을 200자 이내로 입력해 주세요.`;
    items.push({
      medicationId: d.medicationId,
      dosePerIntake: dose,
      doseUnit: d.doseUnit.trim(),
      timesPerDay: d.timesPerDay,
      intervalDays: d.intervalDays,
      durationDays: days,
      timing: d.timing,
      instructions: d.instructions.trim(),
    });
  }
  return items;
}

export function Prescription({ navigate }: { navigate: (s: string) => void }) {
  const { data, loading, error, reload } = useCurrentVisit();
  if (loading && !data) return <TableState loading error="" empty emptyText="" />;
  if (error) return <TableState loading={false} error={error} empty emptyText="" />;
  if (!data) return <NoCurrentVisit navigate={navigate} />;
  return <PrescriptionForm key={data.visit.visitId} detail={data} reload={reload} navigate={navigate} />;
}

function PrescriptionForm({
  detail,
  reload,
  navigate,
}: {
  detail: DoctorVisitDetail;
  reload: () => Promise<void>;
  navigate: (s: string) => void;
}) {
  const { visit, patient, currentMedications, prescriptions } = detail;
  const age = ageOf(patient.birthDate);

  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<Medication[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [warnings, setWarnings] = useState<DurWarning[] | null>(null);
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [modalNotice, setModalNotice] = useState("");
  const [done, setDone] = useState<{ prescriptionId: number; itemCount: number; warningCount: number } | null>(null);

  const search = async (e?: FormEvent) => {
    e?.preventDefault();
    const term = keyword.trim();
    if (!term) {
      setSearchError("약품명이나 품목기준코드를 입력해 주세요.");
      return;
    }
    setSearching(true);
    setSearchError("");
    try {
      const res = await doctorApi.medications(term);
      setResults(res.items);
    } catch (err) {
      setSearchError(err instanceof ApiError ? err.message : "약품 검색 중 문제가 발생했습니다.");
    } finally {
      setSearching(false);
    }
  };

  const update = (id: number, patch: Partial<Draft>) =>
    setDrafts((list) => list.map((d) => (d.medicationId === id ? { ...d, ...patch } : d)));

  /** 저장 요청. 서버가 재검사해 경고가 달라졌으면 최신 경고로 모달을 다시 띄운다 */
  const save = async (items: PrescriptionItem[], current: DurWarning[]) => {
    const overrides = current.map((w) => ({ warningId: w.warningId, reason: (reasons[w.warningId] ?? "").trim() }));
    try {
      const res = await doctorApi.savePrescription(visit.visitId, { items, overrides });
      setWarnings(null);
      setDone({ prescriptionId: res.prescriptionId, itemCount: items.length, warningCount: res.warningCount });
      setDrafts([]);
      void reload();
    } catch (e) {
      if (e instanceof ApiError && e.code === "DUR_OVERRIDE_REQUIRED") {
        const latest = (e.details?.warnings as DurWarning[] | undefined) ?? [];
        if (latest.length === 0) return save(items, []); // 그사이 금기 기준이 지워진 경우
        setWarnings(latest);
        setModalNotice("저장 직전에 금기를 다시 확인했더니 경고가 달라졌습니다. 아래 경고를 확인하고 사유를 입력해 주세요.");
        return;
      }
      setWarnings(null);
      setNotice({ ok: false, text: saveErrorText(e) });
    }
  };

  /** 금기 확인 후 처방 저장 */
  const checkAndSave = async () => {
    const items = toItems(drafts);
    if (typeof items === "string") {
      setNotice({ ok: false, text: items });
      return;
    }
    setBusy(true);
    setNotice(null);
    setModalNotice("");
    try {
      const { warnings: found } = await doctorApi.checkPrescription(
        visit.visitId,
        items.map((i) => i.medicationId),
      );
      if (found.length === 0) await save(items, []);
      else {
        setReasons({});
        setWarnings(found);
      }
    } catch (e) {
      setNotice({ ok: false, text: saveErrorText(e) });
    } finally {
      setBusy(false);
    }
  };

  const confirmOverride = async () => {
    const items = toItems(drafts);
    if (typeof items === "string" || !warnings) return;
    setBusy(true);
    setModalNotice("");
    try {
      await save(items, warnings);
    } finally {
      setBusy(false);
    }
  };

  const cancelPrescription = async (prescriptionId: number) => {
    setBusy(true);
    setNotice(null);
    try {
      await doctorApi.cancelPrescription(prescriptionId);
      setNotice({ ok: true, text: `처방 #${prescriptionId}을(를) 취소했습니다.` });
    } catch (e) {
      if (e instanceof ApiError && e.code === "INVALID_PRESCRIPTION_STATE")
        setNotice({ ok: false, text: "이미 취소됐거나 진료가 끝난 처방은 취소할 수 없습니다." });
      else setNotice({ ok: false, text: e instanceof ApiError ? e.message : "처방 취소 중 문제가 발생했습니다." });
    } finally {
      setBusy(false);
      void reload();
    }
  };

  if (done)
    return (
      <div className="completion">
        <div className="success-icon">
          <Icon name="check" size={34} />
        </div>
        <h1>처방이 완료되었습니다</h1>
        <p>
          {done.warningCount
            ? "금기 예외 사유와 함께 처방이 저장되었습니다."
            : "금기 확인을 마치고 처방이 저장되었습니다."}{" "}
          진료기록 화면에서 진료를 완료해 주세요.
        </p>
        <div className="confirm-ticket mini">
          <div>
            <small>처방번호</small>
            <b>#{done.prescriptionId}</b>
          </div>
          <Badge tone="green">처방완료</Badge>
          <hr />
          <dl>
            <div>
              <dt>환자</dt>
              <dd>
                {patient.name} ({patient.patientId})
              </dd>
            </div>
            <div>
              <dt>처방 약품</dt>
              <dd>{done.itemCount}개 품목</dd>
            </div>
            <div>
              <dt>금기 기록</dt>
              <dd>{done.warningCount ? `예외 처방 ${done.warningCount}건` : "없음"}</dd>
            </div>
          </dl>
        </div>
        <div className="completion-actions">
          <Button variant="outline" onClick={() => setDone(null)}>
            처방 추가 작성
          </Button>
          <Button onClick={() => navigate("medical-record")}>진료기록으로 (진료 완료)</Button>
        </div>
      </div>
    );

  const inDraft = (id: number) => drafts.some((d) => d.medicationId === id);
  // 경고창에 띄울 약품명: 이번 처방 약 → 복용 중인 약 → 이번 진료의 기존 처방 순서로 찾는다
  const knownNames = new Map<number, string>();
  prescriptions.forEach((p) => p.items.forEach((it) => it.medicationName && knownNames.set(it.medicationId, it.medicationName)));
  currentMedications.forEach((m) => m.medicationName && knownNames.set(m.medicationId, m.medicationName));
  drafts.forEach((d) => knownNames.set(d.medicationId, d.name));
  const draftName = (id: number) => medicationLabel(id, knownNames.get(id));

  return (
    <>
      <PageHeader
        title="처방 작성"
        description={`${patient.name} · 만 ${age}세 · 현재 복용약과 처방약의 금기를 자동 확인합니다.`}
        actions={
          <Button variant="outline" onClick={() => navigate("medical-record")}>
            진료기록으로
          </Button>
        }
      />
      <div className="rx-alert">
        <Icon name="shield" />
        <span>
          <b>DUR 금기 자동 확인</b>
          <small>처방 저장 전에 병용금기(복용 중인 약 포함)와 처방일 기준 만 나이의 연령금기를 확인합니다.</small>
        </span>
      </div>
      {notice && (
        <p className={notice.ok ? "form-notice" : "form-error"} role="status">
          {notice.text}
        </p>
      )}
      <div className="prescription-layout">
        <section className="drug-search">
          <h2>약품 검색</h2>
          <form className="search" onSubmit={search}>
            <Icon name="search" />
            <input
              placeholder="약품명 또는 품목기준코드"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              aria-label="약품 검색어"
            />
          </form>
          {searchError && <p className="form-error">{searchError}</p>}
          {results && (
            <div className="search-count">
              검색 결과 <b>{results.length}건</b>
            </div>
          )}
          {searching && <p className="table-state">검색 중…</p>}
          {results?.map((m) => (
            <div className="drug-result" key={m.medicationId}>
              <div>
                <Badge tone="green">사용중</Badge>
                <h3>{m.name}</h3>
                <small>{m.companyName}</small>
                {m.efficacy && <p>{m.efficacy}</p>}
              </div>
              <Button
                variant={inDraft(m.medicationId) ? "disabled" : "outline"}
                disabled={inDraft(m.medicationId)}
                onClick={() => setDrafts([...drafts, newDraft(m)])}
              >
                {inDraft(m.medicationId) ? (
                  <>
                    <Icon name="check" size={15} /> 추가됨
                  </>
                ) : (
                  <>
                    <Icon name="plus" size={15} /> 처방에 추가
                  </>
                )}
              </Button>
            </div>
          ))}
          {results && results.length === 0 && <p className="table-state">검색된 활성 약품이 없습니다.</p>}
        </section>
        <section className="rx-list">
          <div className="card-title">
            <div>
              <h2>현재 처방 약</h2>
              <p>약품별 복용 방법을 입력하세요.</p>
            </div>
            <Badge>{drafts.length}개 품목</Badge>
          </div>
          {drafts.length === 0 && <p className="table-state">왼쪽에서 약품을 검색해 처방에 추가하세요.</p>}
          {drafts.map((d, i) => (
            <article className="rx-item" key={d.medicationId}>
              <div className="rx-item-head">
                <span>{i + 1}</span>
                <div>
                  <h3>{d.name}</h3>
                  <small>{d.companyName}</small>
                </div>
                <button
                  onClick={() => setDrafts(drafts.filter((x) => x.medicationId !== d.medicationId))}
                  aria-label={`${d.name} 처방에서 제거`}
                >
                  <Icon name="close" size={17} />
                </button>
              </div>
              <div className="dose-grid">
                <label>
                  <span>1회 투약량</span>
                  <div>
                    <input
                      inputMode="decimal"
                      value={d.dosePerIntake}
                      onChange={(e) => update(d.medicationId, { dosePerIntake: e.target.value })}
                    />
                    <input
                      className="unit-input"
                      value={d.doseUnit}
                      maxLength={10}
                      onChange={(e) => update(d.medicationId, { doseUnit: e.target.value })}
                      aria-label="투약 단위"
                    />
                  </div>
                </label>
                <label>
                  <span>하루 횟수</span>
                  <select
                    value={d.timesPerDay}
                    onChange={(e) => update(d.medicationId, { timesPerDay: Number(e.target.value) })}
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>
                        {n}회
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>투여 간격</span>
                  <select
                    value={d.intervalDays}
                    onChange={(e) => update(d.medicationId, { intervalDays: Number(e.target.value) })}
                  >
                    <option value={1}>매일</option>
                    <option value={2}>2일마다</option>
                    <option value={3}>3일마다</option>
                    <option value={7}>7일마다</option>
                  </select>
                </label>
                <label>
                  <span>총 투약일수</span>
                  <div>
                    <input
                      inputMode="numeric"
                      value={d.durationDays}
                      onChange={(e) => update(d.medicationId, { durationDays: e.target.value })}
                    />
                    <small>일</small>
                  </div>
                </label>
                <label>
                  <span>복용 시점</span>
                  <select
                    value={d.timing}
                    onChange={(e) => update(d.medicationId, { timing: e.target.value as DoseTiming })}
                  >
                    {(Object.keys(timingLabel) as DoseTiming[]).map((t) => (
                      <option key={t} value={t}>
                        {timingLabel[t]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="directions">
                  <span>복용 방법</span>
                  <input
                    value={d.instructions}
                    maxLength={200}
                    onChange={(e) => update(d.medicationId, { instructions: e.target.value })}
                  />
                </label>
              </div>
            </article>
          ))}
          <div className="rx-actions">
            <Button icon="shield" onClick={() => void checkAndSave()} disabled={drafts.length === 0 || busy}>
              {busy && !warnings ? "금기 확인 중…" : "금기 확인 후 처방 저장"}
            </Button>
          </div>
          {prescriptions.length > 0 && (
            <div className="rx-history">
              <h3>이번 진료 처방 내역</h3>
              {prescriptions.map((p) => (
                <article key={p.prescriptionId} className={p.status === "CANCELLED" ? "cancelled" : ""}>
                  <div>
                    <b>
                      처방 #{p.prescriptionId} · {formatTime(p.prescribedAt)}
                    </b>
                    <small>{p.items.map((it) => medicationLabel(it.medicationId, it.medicationName)).join(", ")}</small>
                  </div>
                  {p.status === "ACTIVE" ? (
                    <Button variant="danger-ghost" disabled={busy} onClick={() => void cancelPrescription(p.prescriptionId)}>
                      처방 취소
                    </Button>
                  ) : (
                    <Badge tone="gray">취소됨</Badge>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
        <aside className="current-meds">
          <div className="card-title">
            <div>
              <h2>현재 복용 중 약</h2>
              <p>다른 진료 처방 포함</p>
            </div>
            <Badge tone="orange">{currentMedications.length}건</Badge>
          </div>
          {currentMedications.map((m) => (
            <div className="current-med-card" key={`${m.prescriptionId}-${m.medicationId}`}>
              <span className="med-pill">
                <Icon name="pill" />
              </span>
              <div>
                <h3>{medicationLabel(m.medicationId, m.medicationName)}</h3>
                <dl>
                  <div>
                    <dt>처방일</dt>
                    <dd>{formatDate(m.prescribedAt)}</dd>
                  </div>
                  <div>
                    <dt>투약기간</dt>
                    <dd>{m.durationDays}일분</dd>
                  </div>
                  <div>
                    <dt>복용 종료</dt>
                    <dd>{formatDate(medicationEndDate(m.prescribedAt, m.durationDays))}</dd>
                  </div>
                </dl>
                <Badge tone="orange">현재 복용 중</Badge>
              </div>
            </div>
          ))}
          {currentMedications.length === 0 && <p className="table-state">복용 중인 약이 없습니다.</p>}
          <div className="current-note">
            <Icon name="warning" size={16} /> 투약 종료일이 지나지 않은 처방만 표시됩니다.
          </div>
        </aside>
      </div>
      {warnings && warnings.length > 0 && (
        <div className="modal-layer">
          <div className="modal warning-modal">
            <button className="modal-close" onClick={() => setWarnings(null)} disabled={busy}>
              <Icon name="close" />
            </button>
            <div className="warning-icon">
              <Icon name="warning" size={30} />
            </div>
            <span className="warning-label">DUR SAFETY ALERT</span>
            <h2>금기 약품이 {warnings.length}건 확인되었습니다.</h2>
            <p className="override-question">그래도 처방하시겠습니까?</p>
            <p>약을 바꾸려면 [약 변경]을, 그대로 처방하려면 경고마다 처방 사유를 입력하세요.</p>
            {modalNotice && <p className="form-error">{modalNotice}</p>}
            <div className="warning-list">
              {warnings.map((w) => (
                <WarningItem
                  key={w.warningId}
                  warning={w}
                  patientLabel={`${patient.name} · ${formatDate(patient.birthDate)} · 만 ${age}세`}
                  inDraft={inDraft}
                  name={draftName}
                  reason={reasons[w.warningId] ?? ""}
                  onReason={(text) => setReasons({ ...reasons, [w.warningId]: text })}
                />
              ))}
            </div>
            <div className="modal-actions">
              <Button variant="outline" onClick={() => setWarnings(null)} disabled={busy}>
                약 변경
              </Button>
              <Button
                variant="danger"
                disabled={busy || warnings.some((w) => !(reasons[w.warningId] ?? "").trim())}
                onClick={() => void confirmOverride()}
              >
                {busy ? "저장 중…" : "네, 사유를 남기고 처방"}
              </Button>
            </div>
            <p className="override-note">
              <Icon name="shield" size={15} /> 금기 종류, 관련 약품, 금기 내용, 처방 강행 사유, 담당 의사, 기록 시각이 금기
              확인 기록에 저장됩니다.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

function WarningItem({
  warning,
  patientLabel,
  inDraft,
  name,
  reason,
  onReason,
}: {
  warning: DurWarning;
  patientLabel: string;
  inDraft: (id: number) => boolean;
  name: (id: number) => string;
  reason: string;
  onReason: (text: string) => void;
}) {
  const isInteraction = warning.type === "INTERACTION";
  const [a, b] = warning.medicationIds;
  // 병용금기는 한쪽이 이번 처방 약, 다른 쪽이 복용 중인 약일 수 있다
  const prescribed = isInteraction && !inDraft(a) ? b : a;
  const other = prescribed === a ? b : a;
  // 서버가 준 약품명을 먼저 쓴다
  const label = (id: number) => {
    const index = warning.medicationIds.indexOf(id);
    return warning.medicationNames?.[index] || name(id);
  };
  return (
    <div className="warning-item">
      <Badge tone="red">{isInteraction ? "병용금기" : "연령금기"}</Badge>
      {isInteraction ? (
        <div className="conflict-box">
          <div>
            <small>현재 처방 약</small>
            <b>{label(prescribed)}</b>
          </div>
          <span>+</span>
          <div>
            <small>{inDraft(other) ? "함께 처방한 약" : "현재 복용 중인 약"}</small>
            <b>{label(other)}</b>
          </div>
        </div>
      ) : (
        <div className="age-conflict-box">
          <div>
            <small>환자 나이</small>
            <b>{patientLabel}</b>
          </div>
          <div>
            <small>처방 약품</small>
            <b>{label(a)}</b>
          </div>
        </div>
      )}
      <div className="risk-content">
        <b>
          <Icon name="warning" size={17} /> 금기 내용
        </b>
        <p>{warning.message}</p>
      </div>
      <label className="field">
        <span>
          금기 처방 사유 <i>*</i>
        </span>
        <textarea
          value={reason}
          onChange={(e) => onReason(e.target.value)}
          placeholder="금기 약품을 그대로 처방해야 하는 임상적 사유를 입력하세요."
        />
        <small className={reason.trim() ? "valid" : "required"}>
          {reason.trim() ? (
            <>
              <Icon name="check" size={13} /> 사유가 입력되었습니다.
            </>
          ) : (
            "사유 입력 없이는 처방을 진행할 수 없습니다."
          )}
        </small>
      </label>
    </div>
  );
}

function saveErrorText(e: unknown) {
  if (e instanceof ApiError) {
    if (e.code === "INVALID_MEDICATIONS") return "사용 중지됐거나 중복된 약품이 있습니다. 약품을 다시 검색해 주세요.";
    if (e.code === "INVALID_VISIT_STATE") return "진료 중인 건에서만 처방할 수 있습니다. 이미 완료된 진료인지 확인해 주세요.";
    if (e.code === "INVALID_REQUEST") return "처방 입력값을 확인해 주세요.";
    return e.message;
  }
  return "처방 저장 중 문제가 발생했습니다.";
}
