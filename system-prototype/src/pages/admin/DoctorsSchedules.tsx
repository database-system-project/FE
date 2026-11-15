import { useEffect, useState } from "react";
import { Icon } from "../../components/Icon";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { EmptyAvatar } from "../../components/EmptyAvatar";
import { PageHeader } from "../../components/PageHeader";
import { TableState } from "../../components/TableState";
import { adminApi } from "../../api/admin";
import { useApi } from "../../api/useApi";
import type { AdminDoctor, AdminSchedule, Department, StaffAccount } from "../../api/types";
import { dateKey, formatDate } from "../../utils/format";
import { ActiveBadge, ActiveCheckbox, changedFields, errorText, FormModal } from "./shared";

const scheduleErrors = {
  DUPLICATE_SCHEDULE: "해당 의사의 같은 날짜 일정이 이미 있습니다.",
  SCHEDULE_HAS_APPOINTMENTS: "예약(취소 이력 포함)이 연결된 일정은 날짜를 바꾸거나 휴진으로 바꾸거나 삭제할 수 없습니다.",
};
const doctorErrors = {
  ACCOUNT_ALREADY_LINKED: "이미 다른 의사에 연결된 계정입니다.",
  INVALID_DOCTOR_ACCOUNT: "의사(DOCTOR) 역할 계정만 연결할 수 있습니다.",
  NOT_FOUND: "계정이나 진료과를 찾을 수 없습니다. 목록을 새로고침해 주세요.",
};

function monthRange(month: string) {
  const [y, m] = month.split("-").map(Number);
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return { from: `${month}-01`, to: `${month}-${String(last).padStart(2, "0")}` };
}
const shiftMonth = (month: string, diff: number) => {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1 + diff, 1)).toISOString().slice(0, 7);
};
const weekday = (key: string) => "일월화수목금토"[new Date(`${key}T00:00:00Z`).getUTCDay()];

async function loadBase() {
  const [doctors, departments] = await Promise.all([adminApi.doctors(), adminApi.departments()]);
  return { doctors: doctors.items, departments: departments.items };
}

type Modal =
  | { kind: "doctor"; target: AdminDoctor | null }
  | { kind: "schedule"; target: AdminSchedule | null }
  | { kind: "delete"; target: AdminSchedule };

export function DoctorsSchedules() {
  const base = useApi(loadBase, []);
  const doctors = base.data?.doctors ?? [];
  const departments = base.data?.departments ?? [];
  const [doctorId, setDoctorId] = useState<number | null>(null);
  const [month, setMonth] = useState(() => dateKey().slice(0, 7));
  const [modal, setModal] = useState<Modal | null>(null);
  const [notice, setNotice] = useState("");

  // 처음에는 첫 번째 의사를 고른다
  useEffect(() => {
    if (doctorId === null && doctors.length > 0) setDoctorId(doctors[0].doctorId);
  }, [doctors, doctorId]);

  const doctor = doctors.find((d) => d.doctorId === doctorId) ?? null;
  const { from, to } = monthRange(month);
  const schedules = useApi(
    async () => (doctorId ? (await adminApi.schedules({ doctorId, from, to })).items : []),
    [doctorId, from, to],
  );
  const rows = schedules.data ?? [];
  const [y, m] = month.split("-");

  const saved = (text: string, reloadBase = false) => {
    setModal(null);
    setNotice(text);
    if (reloadBase) void base.reload();
    void schedules.reload();
  };

  return (
    <>
      <PageHeader
        title="의사·일정 관리"
        description="의사를 선택하여 예약 가능한 진료 일정을 등록·수정합니다."
        actions={
          <>
            <Button variant="outline" icon="plus" onClick={() => setModal({ kind: "doctor", target: null })}>
              의사 등록
            </Button>
            <Button icon="plus" disabled={!doctor} onClick={() => setModal({ kind: "schedule", target: null })}>
              일정 등록
            </Button>
          </>
        }
      />
      <div className="schedule-doctor-picker">
        <span>의사 선택</span>
        {doctors.map((d) => (
          <button
            key={d.doctorId}
            className={d.doctorId === doctorId ? "active" : ""}
            onClick={() => setDoctorId(d.doctorId)}
          >
            <EmptyAvatar name={d.name} />
            {d.name} · {d.departmentName}
            {!d.active && <small className="subtext">사용중지</small>}
          </button>
        ))}
        {!base.loading && doctors.length === 0 && <small className="subtext">등록된 의사가 없습니다.</small>}
      </div>
      {notice && <p className="form-notice">{notice}</p>}
      {base.error && <p className="form-error">{base.error}</p>}
      <div className="data-card">
        <div className="card-title schedule-title">
          <div>
            <h2>
              {doctor ? `${doctor.name} 의사 일정` : "의사를 선택하세요"}{" "}
              {doctor && <ActiveBadge active={doctor.active} />}
            </h2>
            <p>
              {doctor ? `${doctor.departmentName} · ` : ""}
              {y}년 {Number(m)}월 · 진료일 {rows.filter((r) => !r.closed).length}일 · 휴진 {rows.filter((r) => r.closed).length}일
            </p>
          </div>
          <div className="header-actions">
            {doctor && (
              <Button variant="outline" onClick={() => setModal({ kind: "doctor", target: doctor })}>
                의사 정보 수정
              </Button>
            )}
            <Button variant="outline" onClick={() => setMonth(shiftMonth(month, -1))}>
              ← 이전 달
            </Button>
            <Button variant="outline" onClick={() => setMonth(shiftMonth(month, 1))}>
              다음 달 →
            </Button>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>진료일</th>
                <th>접수 시작시간</th>
                <th>진료 마감시간</th>
                <th>점심시간</th>
                <th>휴진 여부</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.scheduleId}>
                  <td>
                    <b>
                      {formatDate(r.date)} ({weekday(r.date)})
                    </b>
                  </td>
                  <td>{r.receptionStart}</td>
                  <td>{r.closingTime}</td>
                  <td>
                    {r.lunchStart} ~ {r.lunchEnd}
                  </td>
                  <td>
                    <Badge tone={r.closed ? "gray" : "green"}>{r.closed ? "휴진" : "진료"}</Badge>
                  </td>
                  <td className="row-actions">
                    <Button variant="outline" onClick={() => setModal({ kind: "schedule", target: r })}>
                      일정 수정
                    </Button>
                    <Button variant="danger-ghost" onClick={() => setModal({ kind: "delete", target: r })}>
                      삭제
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <TableState
            loading={schedules.loading}
            error={schedules.error}
            empty={rows.length === 0}
            emptyText={doctor ? "이 달에 등록된 일정이 없습니다." : "의사를 선택하세요."}
          />
        </div>
      </div>
      {modal?.kind === "doctor" && (
        <DoctorModal
          target={modal.target}
          departments={departments}
          doctors={doctors}
          onClose={() => setModal(null)}
          onSaved={(d, text) => {
            setDoctorId(d.doctorId);
            saved(text, true);
          }}
        />
      )}
      {modal?.kind === "schedule" && doctor && (
        <ScheduleModal
          target={modal.target}
          doctor={doctor}
          onClose={() => setModal(null)}
          onSaved={(text) => saved(text)}
        />
      )}
      {modal?.kind === "delete" && (
        <DeleteScheduleModal target={modal.target} onClose={() => setModal(null)} onSaved={(text) => saved(text)} />
      )}
    </>
  );
}

/** 운영시간은 서버 고정값이라 입력받지 않고 보여주기만 한다 */
function FixedHours() {
  return (
    <div className="form-grid fixed-hours">
      {[
        ["접수 시작시간", "09:00"],
        ["진료 마감시간", "17:00"],
        ["점심 시작시간", "12:30"],
        ["점심 종료시간", "13:30"],
      ].map(([label, value]) => (
        <label className="field" key={label}>
          <span>{label}</span>
          <input value={value} disabled />
        </label>
      ))}
      <small className="subtext full">운영시간은 병원 공통 기준으로 고정되어 있습니다.</small>
    </div>
  );
}

function ScheduleModal({
  target,
  doctor,
  onClose,
  onSaved,
}: {
  target: AdminSchedule | null;
  doctor: AdminDoctor;
  onClose: () => void;
  onSaved: (notice: string) => void;
}) {
  const [form, setForm] = useState({ date: target?.date ?? dateKey(), closed: target?.closed ?? false });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.date)) return setError("날짜를 선택해 주세요.");
    setBusy(true);
    setError("");
    try {
      if (!target) {
        await adminApi.createSchedule({ doctorId: doctor.doctorId, date: form.date, closed: form.closed });
        onSaved(`${doctor.name} 의사 ${formatDate(form.date)} 일정을 등록했습니다.`);
      } else {
        const body = changedFields({ date: target.date, closed: target.closed }, form);
        if (Object.keys(body).length === 0) return onClose();
        await adminApi.updateSchedule(target.scheduleId, body);
        onSaved(`${formatDate(form.date)} 일정을 수정했습니다.`);
      }
    } catch (e) {
      setError(errorText(e, scheduleErrors));
    } finally {
      setBusy(false);
    }
  };

  return (
    <FormModal
      kicker="DOCTOR SCHEDULE"
      title={target ? "의사 일정 수정" : "의사 일정 등록"}
      description={`${doctor.name} 의사 · ${doctor.departmentName}`}
      error={error}
      busy={busy}
      submitLabel="일정 저장"
      onClose={onClose}
      onSubmit={() => void submit()}
    >
      <label className="field">
        <span>날짜</span>
        <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
      </label>
      <FixedHours />
      <ActiveCheckbox
        checked={form.closed}
        onChange={(closed) => setForm({ ...form, closed })}
        label="휴진일로 설정"
        help="예약이 있는 일정은 휴진으로 바꿀 수 없습니다."
      />
    </FormModal>
  );
}

function DeleteScheduleModal({
  target,
  onClose,
  onSaved,
}: {
  target: AdminSchedule;
  onClose: () => void;
  onSaved: (notice: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      await adminApi.deleteSchedule(target.scheduleId);
      onSaved(`${formatDate(target.date)} 일정을 삭제했습니다.`);
    } catch (e) {
      setError(errorText(e, { ...scheduleErrors, NOT_FOUND: "이미 삭제된 일정입니다." }));
    } finally {
      setBusy(false);
    }
  };
  return (
    <FormModal
      kicker="DELETE SCHEDULE"
      title="일정을 삭제할까요?"
      description={`${target.doctorName} 의사 · ${formatDate(target.date)} (${weekday(target.date)}). 예약이 한 번도 없었던 일정만 삭제할 수 있습니다.`}
      error={error}
      busy={busy}
      submitLabel="삭제"
      onClose={onClose}
      onSubmit={() => void submit()}
    >
      <p className="subtext">
        <Icon name="warning" size={14} /> 삭제한 일정은 되돌릴 수 없습니다.
      </p>
    </FormModal>
  );
}

function DoctorModal({
  target,
  departments,
  doctors,
  onClose,
  onSaved,
}: {
  target: AdminDoctor | null;
  departments: Department[];
  doctors: AdminDoctor[];
  onClose: () => void;
  onSaved: (doctor: AdminDoctor, notice: string) => void;
}) {
  // 새 의사: 아직 의사로 연결되지 않은 DOCTOR 역할 계정만 고를 수 있다
  const accounts = useApi(async () => (target ? [] : (await adminApi.staffAccounts({ role: "DOCTOR" })).items), []);
  const linked = new Set(doctors.map((d) => d.accountId));
  const candidates: StaffAccount[] = (accounts.data ?? []).filter((a) => !linked.has(a.accountId));
  const activeDepartments = departments.filter((d) => d.active || d.departmentId === target?.departmentId);

  const [form, setForm] = useState({
    accountId: null as number | null,
    departmentId: (target?.departmentId ?? activeDepartments[0]?.departmentId ?? null) as number | null,
    name: target?.name ?? "",
    active: target?.active ?? true,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const pickAccount = (id: number | null) => {
    const account = candidates.find((a) => a.accountId === id);
    setForm({ ...form, accountId: id, name: form.name || account?.name || "" });
  };

  const submit = async () => {
    const name = form.name.trim();
    if (!target && !form.accountId) return setError("연결할 의사 계정을 선택해 주세요.");
    if (!form.departmentId) return setError("진료과를 선택해 주세요.");
    if (!name || name.length > 50) return setError("의사명을 50자 이내로 입력해 주세요.");
    setBusy(true);
    setError("");
    try {
      if (!target) {
        const doctor = await adminApi.createDoctor({
          accountId: form.accountId!,
          departmentId: form.departmentId,
          name,
          active: form.active,
        });
        onSaved(doctor, `${name} 의사를 등록했습니다. 이제 일정을 등록할 수 있습니다.`);
      } else {
        const body = changedFields(
          { departmentId: target.departmentId, name: target.name, active: target.active },
          { departmentId: form.departmentId!, name, active: form.active },
        );
        if (Object.keys(body).length === 0) return onClose();
        const doctor = await adminApi.updateDoctor(target.doctorId, body);
        onSaved(doctor, `${name} 의사 정보를 수정했습니다.`);
      }
    } catch (e) {
      setError(errorText(e, doctorErrors));
    } finally {
      setBusy(false);
    }
  };

  return (
    <FormModal
      kicker={target ? "EDIT DOCTOR" : "DOCTOR REGISTRATION"}
      title={target ? "의사 정보 수정" : "의사 등록"}
      description={
        target
          ? "연결된 계정은 바꿀 수 없습니다. 이름을 바꾸면 직원 계정 이름도 함께 바뀝니다."
          : "사용자 계정에서 만든 의사 계정을 진료과와 연결합니다."
      }
      error={error}
      busy={busy}
      submitLabel={target ? "저장" : "의사 등록"}
      onClose={onClose}
      onSubmit={() => void submit()}
    >
      {!target && (
        <label className="field">
          <span>
            의사 계정 <i>*</i>
          </span>
          <select
            value={form.accountId ?? ""}
            onChange={(e) => pickAccount(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">{accounts.loading ? "불러오는 중…" : "계정 선택"}</option>
            {candidates.map((a) => (
              <option key={a.accountId} value={a.accountId}>
                {a.loginId} · {a.name}
              </option>
            ))}
          </select>
          {!accounts.loading && candidates.length === 0 && (
            <small className="required">연결할 의사 계정이 없습니다. 사용자 계정에서 의사 역할 계정을 먼저 만들어 주세요.</small>
          )}
        </label>
      )}
      <label className="field">
        <span>
          의사명 <i>*</i>
        </span>
        <input value={form.name} maxLength={50} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </label>
      <label className="field">
        <span>진료과</span>
        <select
          value={form.departmentId ?? ""}
          onChange={(e) => setForm({ ...form, departmentId: e.target.value ? Number(e.target.value) : null })}
        >
          {activeDepartments.map((d) => (
            <option key={d.departmentId} value={d.departmentId}>
              {d.name}
            </option>
          ))}
        </select>
      </label>
      <ActiveCheckbox
        checked={form.active}
        onChange={(active) => setForm({ ...form, active })}
        label="신규 예약 허용"
        help="체크를 해제하면 환자가 이 의사에게 새로 예약할 수 없습니다. 기존 예약은 유지됩니다."
      />
    </FormModal>
  );
}
