import { useState } from "react";
import { Icon } from "../../components/Icon";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { StatCard } from "../../components/StatCard";
import { PageHeader } from "../../components/PageHeader";
import { TableState } from "../../components/TableState";
import { receptionApi } from "../../api/reception";
import { useApi } from "../../api/useApi";
import {
  appointmentStatusLabel,
  appointmentStatusTone,
  formatTime,
  hourOf,
  todayLabel,
  visitStatusLabel,
  visitStatusTone,
} from "../../utils/format";
import { checkInWithMessage } from "./checkIn";
import { loadTodayVisits } from "./Waiting";

async function loadDashboard() {
  const [appointments, visits] = await Promise.all([receptionApi.appointments(), loadTodayVisits()]);
  return { appointments: appointments.items, visits };
}

export function DeskDashboard({ navigate }: { navigate: (s: string) => void }) {
  const { data, loading, error, reload } = useApi(loadDashboard, []);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  const appointments = (data?.appointments ?? []).filter((a) => a.status !== "CANCELLED");
  const visits = data?.visits ?? [];
  const morning = appointments.filter((a) => hourOf(a.startsAt) < 13).length;
  const checkedIn = appointments.filter((a) => a.status === "CHECKED_IN").length;
  const waiting = visits.filter((v) => v.status === "WAITING").length;
  const inProgress = visits.filter((v) => v.status === "IN_PROGRESS").length;
  const completed = visits.filter((v) => v.status === "COMPLETED").length;
  const rate = appointments.length ? Math.round((checkedIn / appointments.length) * 100) : 0;
  const upcoming = appointments.filter((a) => a.status === "RESERVED").slice(0, 5);
  const queue = visits.filter((v) => v.status === "WAITING" || v.status === "IN_PROGRESS");

  const checkIn = async (appointmentId: number, patientName: string) => {
    setBusyId(appointmentId);
    setNotice(await checkInWithMessage(appointmentId, patientName));
    setBusyId(null);
    void reload();
  };

  return (
    <>
      <PageHeader title="원무 대시보드" description={`${todayLabel()} · 오늘의 예약 및 접수 현황입니다.`} />
      <div className="stats-grid four">
        <StatCard
          label="오늘 예약 수"
          value={`${appointments.length}`}
          helper={`오전 ${morning} · 오후 ${appointments.length - morning}`}
          icon="calendar"
        />
        <StatCard label="접수 완료" value={`${checkedIn}`} helper={`예약 대비 ${rate}%`} icon="check" tone="green" />
        <StatCard label="현재 대기" value={`${waiting}`} helper={`진료 중 ${inProgress}명`} icon="users" tone="orange" />
        <StatCard label="진료 완료" value={`${completed}`} helper="오늘 누적" icon="file" tone="mint" />
      </div>
      {notice && (
        <p className={notice.ok ? "form-notice" : "form-error"} role="status">
          {notice.text}
        </p>
      )}
      <div className="dashboard-split">
        <section className="data-card">
          <div className="card-title">
            <div>
              <h2>접수 대기 예약</h2>
              <p>예약한 환자만 접수할 수 있습니다.</p>
            </div>
            <button className="text-link" onClick={() => navigate("desk-reservations")}>
              전체 보기 →
            </button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>예약시간</th>
                  <th>환자</th>
                  <th>진료과 / 의사</th>
                  <th>상태</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map((a) => (
                  <tr key={a.appointmentId}>
                    <td>
                      <b>{formatTime(a.startsAt)}</b>
                    </td>
                    <td>
                      <b>{a.patientName}</b>
                      <small className="subtext">{a.patientId}</small>
                    </td>
                    <td>
                      {a.departmentName}
                      <small className="subtext">{a.doctorName} 의사</small>
                    </td>
                    <td>
                      <Badge tone={appointmentStatusTone[a.status]}>{appointmentStatusLabel[a.status]}</Badge>
                    </td>
                    <td>
                      <Button disabled={busyId === a.appointmentId} onClick={() => checkIn(a.appointmentId, a.patientName)}>
                        {busyId === a.appointmentId ? "처리 중…" : "접수"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <TableState loading={loading} error={error} empty={upcoming.length === 0} emptyText="접수할 예약이 없습니다." />
          </div>
        </section>
        <section className="waiting-panel">
          <div className="card-title">
            <div>
              <h2>현재 대기 환자</h2>
              <p>접수 순서대로 표시됩니다.</p>
            </div>
            <Badge tone="orange">{waiting}명 대기</Badge>
          </div>
          {queue.map((v, i) => (
            <div className={`wait-row ${v.status === "IN_PROGRESS" ? "now" : ""}`} key={v.visitId}>
              <span className="queue">{i + 1}</span>
              <div>
                <b>{v.patientName}</b>
                <small>접수 {formatTime(v.checkedInAt)}</small>
              </div>
              <span>{v.departmentName}</span>
              <Badge tone={visitStatusTone[v.status]}>{visitStatusLabel[v.status]}</Badge>
            </div>
          ))}
          {!loading && queue.length === 0 && (
            <p className="table-state">
              <Icon name="users" size={16} /> 대기 중인 환자가 없습니다.
            </p>
          )}
          <Button variant="outline" className="wide" onClick={() => navigate("waiting")}>
            대기 목록 관리
          </Button>
        </section>
      </div>
    </>
  );
}
