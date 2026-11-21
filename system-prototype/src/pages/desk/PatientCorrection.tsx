import { useState, type FormEvent } from "react";
import { Icon } from "../../components/Icon";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { EmptyAvatar } from "../../components/EmptyAvatar";
import { PageHeader } from "../../components/PageHeader";
import { TableState } from "../../components/TableState";
import { ApiError } from "../../api/client";
import { receptionApi } from "../../api/reception";
import type { PatientProfile, StaffPatientSummary } from "../../api/types";
import { ageOf, dateKey, formatDate, formatPhone, genderLabel } from "../../utils/format";

type Gender = "M" | "F";

/** 정정 결과. 바꾸기 전 값과 바꾼 값을 같이 보여준다 */
type Corrected = { before: PatientProfile; after: PatientProfile };

const errorText = (e: unknown, fallback: string) => {
  if (e instanceof ApiError) {
    if (e.code === "INVALID_REQUEST") return "입력값을 확인해 주세요. 생년월일은 오늘 이후일 수 없습니다.";
    if (e.code === "NOT_FOUND") return "환자를 찾을 수 없습니다.";
    return e.message;
  }
  return fallback;
};

export function PatientCorrection() {
  const [query, setQuery] = useState({ name: "", birthDate: "", phone: "" });
  const [results, setResults] = useState<StaffPatientSummary[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [selected, setSelected] = useState<PatientProfile | null>(null);
  const [corrected, setCorrected] = useState<Corrected | null>(null);

  const search = async (e: FormEvent) => {
    e.preventDefault();
    const name = query.name.trim();
    const phone = query.phone.replace(/[-\s]/g, "");
    if (!name && !query.birthDate && !phone) return setSearchError("이름, 생년월일, 전화번호 중 하나 이상 입력해 주세요.");
    if (phone && !/^\d{1,20}$/.test(phone)) return setSearchError("전화번호는 숫자로 입력해 주세요.");
    setSearching(true);
    setSearchError("");
    try {
      const res = await receptionApi.searchPatients({
        name: name || undefined,
        birthDate: query.birthDate || undefined,
        phone: phone || undefined,
      });
      setResults(res.items);
    } catch (err) {
      setSearchError(errorText(err, "환자 검색 중 문제가 발생했습니다."));
    } finally {
      setSearching(false);
    }
  };

  const pick = async (patientId: number) => {
    setCorrected(null);
    try {
      setSelected(await receptionApi.patient(patientId));
    } catch (err) {
      setSearchError(errorText(err, "환자 정보를 불러오지 못했습니다."));
    }
  };

  return (
    <>
      <PageHeader
        title="환자 정보 정정"
        description="생년월일·성별은 연령금기 판정 기준이라 원무 직원만 정정할 수 있고, 정정하면 이전 값이 이력으로 남습니다."
      />
      <form className="toolbar" onSubmit={search}>
        <div className="search">
          <Icon name="search" />
          <input
            id="correction-name"
            value={query.name}
            maxLength={50}
            onChange={(e) => setQuery({ ...query, name: e.target.value })}
            placeholder="환자명"
          />
        </div>
        <input
          id="correction-birth"
          type="date"
          className="toolbar-input"
          value={query.birthDate}
          max={dateKey()}
          onChange={(e) => setQuery({ ...query, birthDate: e.target.value })}
          aria-label="생년월일"
        />
        <input
          id="correction-phone"
          className="toolbar-input"
          inputMode="tel"
          value={query.phone}
          onChange={(e) => setQuery({ ...query, phone: e.target.value })}
          placeholder="전화번호"
        />
        <Button type="submit" icon="search" disabled={searching}>
          {searching ? "검색 중…" : "환자 검색"}
        </Button>
      </form>
      {searchError && <p className="form-error">{searchError}</p>}

      {results && (
        <div className="data-card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>환자번호</th>
                  <th>환자명</th>
                  <th>생년월일</th>
                  <th>성별</th>
                  <th>전화번호</th>
                  <th>선택</th>
                </tr>
              </thead>
              <tbody>
                {results.map((p) => (
                  <tr key={p.patientId} className={selected?.patientId === p.patientId ? "selected-row" : ""}>
                    <td className="code">{p.patientId}</td>
                    <td>
                      <b>{p.name}</b>
                    </td>
                    <td>{formatDate(p.birthDate)}</td>
                    <td>{genderLabel[p.gender]}</td>
                    <td>{p.displayPhone}</td>
                    <td>
                      <Button variant="outline" type="button" onClick={() => void pick(p.patientId)}>
                        정정하기
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <TableState loading={false} error="" empty={results.length === 0} emptyText="검색 조건에 맞는 환자가 없습니다." />
          </div>
        </div>
      )}

      {selected && (
        <div className="profile-layout correction-layout">
          <section className="patient-panel">
            <div className="patient-profile">
              <EmptyAvatar name={selected.name} />
              <div>
                <h2>{selected.name}</h2>
                <p>환자번호 {selected.patientId}</p>
              </div>
            </div>
            <dl>
              <div>
                <dt>생년월일</dt>
                <dd>{formatDate(selected.birthDate)}</dd>
              </div>
              <div>
                <dt>만 나이</dt>
                <dd>만 {ageOf(selected.birthDate)}세</dd>
              </div>
              <div>
                <dt>성별</dt>
                <dd>{genderLabel[selected.gender]}</dd>
              </div>
              <div>
                <dt>전화번호</dt>
                <dd>{formatPhone(selected.phone)}</dd>
              </div>
            </dl>
          </section>
          <div className="profile-forms">
            {corrected && <CorrectionResult result={corrected} />}
            <CorrectionForm
              key={`${selected.patientId}-${selected.birthDate}-${selected.gender}`}
              patient={selected}
              onSaved={(after) => {
                setCorrected({ before: selected, after });
                setSelected(after);
                setResults((list) =>
                  list?.map((p) =>
                    p.patientId === after.patientId ? { ...p, birthDate: after.birthDate, gender: after.gender } : p,
                  ) ?? null,
                );
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}

function CorrectionForm({ patient, onSaved }: { patient: PatientProfile; onSaved: (after: PatientProfile) => void }) {
  const [birthDate, setBirthDate] = useState(patient.birthDate);
  const [gender, setGender] = useState<Gender>(patient.gender);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const changed = birthDate !== patient.birthDate || gender !== patient.gender;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!birthDate) return setError("생년월일을 입력해 주세요.");
    if (birthDate > dateKey()) return setError("생년월일은 오늘 이후일 수 없습니다.");
    if (!changed) return setError("바뀐 내용이 없습니다.");
    const body: { birthDate?: string; gender?: Gender } = {};
    if (birthDate !== patient.birthDate) body.birthDate = birthDate;
    if (gender !== patient.gender) body.gender = gender;
    setBusy(true);
    setError("");
    try {
      onSaved(await receptionApi.correctDemographics(patient.patientId, body));
    } catch (err) {
      setError(errorText(err, "정정 중 문제가 발생했습니다."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="clinical-form" onSubmit={submit}>
      <div className="card-title">
        <div>
          <h2>생년월일 · 성별 정정</h2>
          <p>신분증 등으로 확인한 정확한 값으로 고쳐 주세요.</p>
        </div>
      </div>
      <label className="field">
        <span>생년월일</span>
        <input type="date" value={birthDate} max={dateKey()} onChange={(e) => setBirthDate(e.target.value)} />
      </label>
      <label className="field">
        <span>성별</span>
        <select value={gender} onChange={(e) => setGender(e.target.value as Gender)}>
          <option value="M">남성</option>
          <option value="F">여성</option>
        </select>
      </label>
      {changed && birthDate && (
        <div className="info-banner">
          <Icon name="warning" size={18} />
          <span>
            <b>연령금기 판정이 바뀔 수 있습니다</b>
            <small>
              만 {ageOf(patient.birthDate)}세 → 만 {ageOf(birthDate)}세. 저장하면 이전 값과 정정한 직원, 시각이
              정정 이력(patient_demographic_audit)에 남습니다.
            </small>
          </span>
        </div>
      )}
      {error && <p className="form-error">{error}</p>}
      <div className="clinical-actions">
        <Button type="submit" icon="shield" disabled={busy || !changed}>
          {busy ? "저장 중…" : "정정 저장"}
        </Button>
      </div>
    </form>
  );
}

function CorrectionResult({ result }: { result: Corrected }) {
  const { before, after } = result;
  const rows: { label: string; from: string; to: string }[] = [];
  if (before.birthDate !== after.birthDate)
    rows.push({ label: "생년월일", from: formatDate(before.birthDate), to: formatDate(after.birthDate) });
  if (before.gender !== after.gender)
    rows.push({ label: "성별", from: genderLabel[before.gender], to: genderLabel[after.gender] });
  return (
    <section className="clinical-form correction-result">
      <div className="card-title">
        <div>
          <h2>정정이 저장되었습니다</h2>
          <p>이전 값은 정정 이력에 남아, 그 사이 처방의 연령금기 판정 근거를 확인할 수 있습니다.</p>
        </div>
        <Badge tone="green">이력 저장</Badge>
      </div>
      <dl className="correction-diff">
        {rows.map((r) => (
          <div key={r.label}>
            <dt>{r.label}</dt>
            <dd>
              <s>{r.from}</s> <Icon name="chevron" size={13} /> <b>{r.to}</b>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
