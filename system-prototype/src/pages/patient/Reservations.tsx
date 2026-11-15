import { useState } from "react";
import { Icon } from "../../components/Icon";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { PageHeader } from "../../components/PageHeader";
import { TableState } from "../../components/TableState";
import { ApiError } from "../../api/client";
import { patientApi } from "../../api/patient";
import { useApi } from "../../api/useApi";
import type { PatientAppointment } from "../../api/types";
import { appointmentStatusLabel, appointmentStatusTone, formatDate, formatTime } from "../../utils/format";
import { rescheduleTarget } from "./rescheduleTarget";

type Tab = "ALL" | "UPCOMING" | "PAST";

export function Reservations({ navigate }: { navigate: (s: string) => void }) {
  const [tab, setTab] = useState<Tab>("ALL");
  const { data, loading, error, reload } = useApi(() => patientApi.appointments(), []);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  const all = data?.items ?? [];
  // 서버의 UPCOMING 기준과 같게: 예약완료이면서 아직 시간이 안 지난 것
  const upcoming = all.filter((a) => a.status === "RESERVED" && new Date(a.startsAt).getTime() >= Date.now());
  const past = all.filter((a) => !upcoming.includes(a));
  const rows = tab === "ALL" ? all : tab === "UPCOMING" ? upcoming : past;

  const change = (a: PatientAppointment) => {
    rescheduleTarget.set(a);
    navigate("booking");
  };

  const cancel = async (a: PatientAppointment) => {
    setBusy(true);
    try {
      await patientApi.cancel(a.appointmentId);
      setNotice({ ok: true, text: `${a.appointmentCode} 예약을 취소했습니다.` });
    } catch (e) {
      if (e instanceof ApiError && e.code === "INVALID_APPOINTMENT_STATE")
        setNotice({ ok: false, text: "이미 접수됐거나 지난 예약은 취소할 수 없습니다." });
      else setNotice({ ok: false, text: e instanceof ApiError ? e.message : "예약 취소 중 문제가 발생했습니다." });
    } finally {
      setBusy(false);
      setConfirmId(null);
      void reload();
    }
  };

  return (
    <>
      <PageHeader
        title="예약 조회"
        description="예약 내역을 확인하고 접수 전 예약을 변경하거나 취소할 수 있습니다."
        actions={
          <Button icon="plus" onClick={() => navigate("booking")}>
            새 예약
          </Button>
        }
      />
      <div className="tabs">
        <button className={tab === "ALL" ? "active" : ""} onClick={() => setTab("ALL")}>
          전체 {all.length}
        </button>
        <button className={tab === "UPCOMING" ? "active" : ""} onClick={() => setTab("UPCOMING")}>
          예정된 예약 {upcoming.length}
        </button>
        <button className={tab === "PAST" ? "active" : ""} onClick={() => setTab("PAST")}>
          지난 예약 {past.length}
        </button>
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
                <th>예약번호</th>
                <th>진료과</th>
                <th>담당 의사</th>
                <th>예약일</th>
                <th>접수 예정시간</th>
                <th>상태</th>
                <th className="right">관리</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.appointmentId}>
                  <td className="code">{a.appointmentCode}</td>
                  <td>
                    <b>{a.departmentName}</b>
                  </td>
                  <td>{a.doctorName} 의사</td>
                  <td>{formatDate(a.startsAt)}</td>
                  <td>{formatTime(a.startsAt)}</td>
                  <td>
                    <Badge tone={appointmentStatusTone[a.status]}>{appointmentStatusLabel[a.status]}</Badge>
                  </td>
                  <td className="right">
                    {confirmId === a.appointmentId ? (
                      <div className="row-actions">
                        <span className="subtext">정말 취소할까요?</span>
                        <Button variant="danger-ghost" disabled={busy} onClick={() => cancel(a)}>
                          {busy ? "처리 중…" : "취소 확정"}
                        </Button>
                        <button className="text-link" onClick={() => setConfirmId(null)} disabled={busy}>
                          닫기
                        </button>
                      </div>
                    ) : (
                      <div className="row-actions">
                        {a.canReschedule && (
                          <Button variant="outline" onClick={() => change(a)}>
                            예약 변경
                          </Button>
                        )}
                        {a.canCancel && (
                          <Button variant="danger-ghost" onClick={() => setConfirmId(a.appointmentId)}>
                            예약 취소
                          </Button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <TableState loading={loading} error={error} empty={rows.length === 0} emptyText="예약 내역이 없습니다." />
        </div>
      </div>
      <div className="info-banner">
        <Icon name="calendar" />
        <span>
          <b>예약 변경 안내</b>
          <small>예약 변경 시 기존 예약은 취소 처리되고, 선택한 시간으로 새 예약이 생성됩니다.</small>
        </span>
      </div>
    </>
  );
}
