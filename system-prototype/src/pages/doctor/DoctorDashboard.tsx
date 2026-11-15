import { useState } from "react";
import { Icon } from "../../components/Icon";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { StatCard } from "../../components/StatCard";
import { EmptyAvatar } from "../../components/EmptyAvatar";
import { PageHeader } from "../../components/PageHeader";
import { TableState } from "../../components/TableState";
import { useAuth } from "../../auth/AuthContext";
import { ApiError } from "../../api/client";
import { doctorApi } from "../../api/doctor";
import { useApi } from "../../api/useApi";
import { formatTime, todayLabel, visitStatusLabel, visitStatusTone } from "../../utils/format";

async function loadDashboard() {
  const [active, completed] = await Promise.all([doctorApi.queue(), doctorApi.queue("COMPLETED")]);
  return { active: active.items, completedCount: completed.items.length };
}

/** 진료 시작 실패 사유를 화면 문구로 */
function startErrorText(e: unknown) {
  if (e instanceof ApiError) {
    if (e.code === "NOT_QUEUE_HEAD") return "먼저 접수한 환자가 있습니다. 대기 순서대로 진료를 시작해 주세요.";
    if (e.code === "DOCTOR_ALREADY_IN_PROGRESS") return "이미 진료 중인 환자가 있습니다. 해당 진료를 완료한 뒤 시작해 주세요.";
    if (e.code === "INVALID_VISIT_STATE") return "대기 상태가 아닌 접수입니다. 목록을 새로고침해 주세요.";
    return e.message;
  }
  return "진료 시작 중 문제가 발생했습니다.";
}

export function DoctorDashboard({ navigate }: { navigate: (s: string) => void }) {
  const { user, doctorProfile } = useAuth();
  const { data, loading, error, reload } = useApi(loadDashboard, []);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  const active = data?.active ?? [];
  const current = active.find((v) => v.status === "IN_PROGRESS") ?? null;
  const waiting = active.filter((v) => v.status === "WAITING");
  const completed = data?.completedCount ?? 0;
  const total = active.length + completed;
  const rate = total ? Math.round((completed / total) * 100) : 0;
  const now = Date.now();
  const avgWait = waiting.length
    ? Math.round(waiting.reduce((sum, v) => sum + (now - new Date(v.checkedInAt).getTime()), 0) / waiting.length / 60000)
    : 0;

  const start = async (visitId: number) => {
    setBusyId(visitId);
    setNotice(null);
    try {
      await doctorApi.start(visitId);
      navigate("medical-record");
    } catch (e) {
      setNotice({ ok: false, text: startErrorText(e) });
      void reload();
    } finally {
      setBusyId(null);
    }
  };

  const header = [user?.name && `${user.name} 의사`, doctorProfile?.departmentName, todayLabel()].filter(Boolean).join(" · ");

  return (
    <>
      <PageHeader title="진료 대시보드" description={header} />
      <div className="stats-grid three">
        <StatCard label="오늘 진료 환자" value={`${total}명`} helper="접수 기준" icon="calendar" />
        <StatCard
          label="현재 대기"
          value={`${waiting.length}명`}
          helper={waiting.length ? `평균 대기 ${avgWait}분` : "대기 환자 없음"}
          icon="users"
          tone="orange"
        />
        <StatCard label="진료 완료" value={`${completed}명`} helper={`진행률 ${rate}%`} icon="check" tone="green" />
      </div>
      {notice && (
        <p className={notice.ok ? "form-notice" : "form-error"} role="status">
          {notice.text}
        </p>
      )}
      <section className="data-card doctor-list">
        <div className="card-title">
          <div>
            <h2>오늘의 대기 환자</h2>
            <p>현재 진료 중인 환자가 가장 먼저 표시됩니다. 진료는 접수 순서대로 시작합니다.</p>
          </div>
          <button className="text-link" onClick={() => void reload()} disabled={loading}>
            {loading ? "불러오는 중…" : "새로고침"}
          </button>
        </div>
        {current && (
          <div className="current-patient">
            <div className="patient-order">진료 중</div>
            <EmptyAvatar name={current.patientName} />
            <div className="patient-name">
              <b>{current.patientName}</b>
              <span>환자번호 {current.patientId}</span>
            </div>
            <div>
              <small>접수시간</small>
              <b>{formatTime(current.checkedInAt)}</b>
            </div>
            <div>
              <small>진료 시작</small>
              <b>{formatTime(current.startedAt)}</b>
            </div>
            <Button onClick={() => navigate("medical-record")}>
              진료 화면 열기 <Icon name="chevron" size={16} />
            </Button>
          </div>
        )}
        <div className="patient-list-head">
          <span>순서</span>
          <span>접수시간</span>
          <span>환자명</span>
          <span>접수번호</span>
          <span>상태</span>
          <span></span>
        </div>
        {waiting.map((v, i) => {
          // 서버 규칙: 진행 중 진료가 없고 대기열 맨 앞인 환자만 시작할 수 있다
          const canStart = !current && i === 0;
          return (
            <div className="patient-list-row" key={v.visitId}>
              <span className="queue">{i + 1}</span>
              <b>{formatTime(v.checkedInAt)}</b>
              <span>
                <b>{v.patientName}</b>
                <small>환자번호 {v.patientId}</small>
              </span>
              <span className="code">{v.receptionCode}</span>
              <Badge tone={visitStatusTone[v.status]}>{visitStatusLabel[v.status]}</Badge>
              <Button
                variant={canStart ? "outline" : "disabled"}
                disabled={!canStart || busyId !== null}
                onClick={() => start(v.visitId)}
              >
                {busyId === v.visitId ? "시작 중…" : "진료 시작"}
              </Button>
            </div>
          );
        })}
        <TableState loading={loading} error={error} empty={active.length === 0} emptyText="오늘 대기 중인 환자가 없습니다." />
      </section>
    </>
  );
}
