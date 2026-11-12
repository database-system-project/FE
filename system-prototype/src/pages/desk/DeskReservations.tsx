import { useEffect, useMemo, useState } from "react";
import { Icon } from "../../components/Icon";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { PageHeader } from "../../components/PageHeader";
import { TableState } from "../../components/TableState";
import { receptionApi } from "../../api/reception";
import { useApi } from "../../api/useApi";
import type { AppointmentStatus } from "../../api/types";
import { appointmentStatusLabel, appointmentStatusTone, formatTime, todayLabel } from "../../utils/format";
import { checkInWithMessage } from "./checkIn";

export function DeskReservations({ navigate }: { navigate: (s: string) => void }) {
  const [input, setInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<"" | AppointmentStatus>("");
  const [department, setDepartment] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  // 검색어는 입력을 멈추고 0.3초 뒤에 서버로 보낸다
  useEffect(() => {
    const t = window.setTimeout(() => setKeyword(input.trim()), 300);
    return () => window.clearTimeout(t);
  }, [input]);

  const { data, loading, error, reload } = useApi(
    () => receptionApi.appointments({ keyword: keyword || undefined, status: status || undefined }),
    [keyword, status],
  );
  const items = data?.items ?? [];
  const departments = useMemo(() => [...new Set(items.map((a) => a.departmentName))], [items]);
  const rows = department ? items.filter((a) => a.departmentName === department) : items;

  const checkIn = async (appointmentId: number, patientName: string) => {
    setBusyId(appointmentId);
    const result = await checkInWithMessage(appointmentId, patientName);
    setNotice(result);
    setBusyId(null);
    void reload();
  };

  return (
    <>
      <PageHeader title="오늘 예약 환자" description={`${todayLabel()} · 당일 예약 환자의 내원 접수를 처리합니다.`} />
      <div className="toolbar">
        <div className="search">
          <Icon name="search" />
          <input
            id="desk-res-search"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="환자명 또는 환자번호 검색"
          />
        </div>
        <select id="desk-res-dept" value={department} onChange={(e) => setDepartment(e.target.value)}>
          <option value="">전체 진료과</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <select id="desk-res-status" value={status} onChange={(e) => setStatus(e.target.value as "" | AppointmentStatus)}>
          <option value="">전체 상태</option>
          <option value="RESERVED">예약완료</option>
          <option value="CHECKED_IN">접수완료</option>
          <option value="CANCELLED">취소</option>
        </select>
      </div>
      {notice && (
        <p className={notice.ok ? "form-notice" : "form-error"} role="status">
          {notice.text}
        </p>
      )}
      <div className="data-card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>예약시간</th>
                <th>환자번호</th>
                <th>환자명</th>
                <th>진료과</th>
                <th>담당의사</th>
                <th>상태</th>
                <th>처리</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.appointmentId}>
                  <td>
                    <b>{formatTime(a.startsAt)}</b>
                  </td>
                  <td className="code">{a.patientId}</td>
                  <td>
                    <b>{a.patientName}</b>
                  </td>
                  <td>{a.departmentName}</td>
                  <td>{a.doctorName}</td>
                  <td>
                    <Badge tone={appointmentStatusTone[a.status]}>{appointmentStatusLabel[a.status]}</Badge>
                  </td>
                  <td>
                    {a.status === "RESERVED" && (
                      <Button disabled={busyId === a.appointmentId} onClick={() => checkIn(a.appointmentId, a.patientName)}>
                        {busyId === a.appointmentId ? "처리 중…" : "접수"}
                      </Button>
                    )}
                    {a.status === "CHECKED_IN" && (
                      <button className="text-link" onClick={() => navigate("waiting")}>
                        대기목록 보기
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <TableState loading={loading} error={error} empty={rows.length === 0} emptyText="조건에 맞는 오늘 예약이 없습니다." />
        </div>
      </div>
    </>
  );
}
