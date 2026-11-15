import { useState } from "react";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { PageHeader } from "../../components/PageHeader";
import { TableState } from "../../components/TableState";
import { useAuth } from "../../auth/AuthContext";
import { doctorApi } from "../../api/doctor";
import { useApi } from "../../api/useApi";
import { dateKey, formatDate } from "../../utils/format";

/** "YYYY-MM" 달의 첫날·마지막 날 */
function monthRange(month: string) {
  const [y, m] = month.split("-").map(Number);
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return { from: `${month}-01`, to: `${month}-${String(last).padStart(2, "0")}` };
}

function shiftMonth(month: string, diff: number) {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + diff, 1));
  return d.toISOString().slice(0, 7);
}

const weekday = (key: string) => "일월화수목금토"[new Date(`${key}T00:00:00Z`).getUTCDay()];

export function DoctorSchedule() {
  const { user, doctorProfile } = useAuth();
  const [month, setMonth] = useState(() => dateKey().slice(0, 7));
  const { from, to } = monthRange(month);
  const { data, loading, error } = useApi(() => doctorApi.schedules(from, to), [from, to]);
  const rows = data?.items ?? [];
  const today = dateKey();
  const [y, m] = month.split("-");

  return (
    <>
      <PageHeader
        title="진료 일정 조회"
        description="관리자가 등록한 본인의 진료 일정을 조회합니다."
        actions={<Badge tone="gray">조회 전용</Badge>}
      />
      <div className="data-card">
        <div className="card-title schedule-title">
          <div>
            <h2>{user?.name} 의사 일정</h2>
            <p>
              {[doctorProfile?.departmentName, `${y}년 ${Number(m)}월`].filter(Boolean).join(" · ")} · 진료일{" "}
              {rows.filter((r) => !r.closed).length}일 · 휴진 {rows.filter((r) => r.closed).length}일
            </p>
          </div>
          <div className="header-actions">
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
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.scheduleId}>
                  <td>
                    <b>
                      {formatDate(r.date)} ({weekday(r.date)})
                    </b>
                    {r.date === today && <small className="subtext">오늘</small>}
                  </td>
                  <td>{r.closed ? "-" : r.receptionStart}</td>
                  <td>{r.closed ? "-" : r.closingTime}</td>
                  <td>{r.closed ? "-" : `${r.lunchStart} ~ ${r.lunchEnd}`}</td>
                  <td>
                    <Badge tone={r.closed ? "gray" : "green"}>{r.closed ? "휴진" : "진료"}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <TableState loading={loading} error={error} empty={rows.length === 0} emptyText="이 달에 등록된 진료 일정이 없습니다." />
        </div>
      </div>
    </>
  );
}
