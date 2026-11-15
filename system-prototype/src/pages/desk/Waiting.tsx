import { useState } from "react";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { PageHeader } from "../../components/PageHeader";
import { TableState } from "../../components/TableState";
import { ApiError } from "../../api/client";
import { receptionApi } from "../../api/reception";
import { useApi } from "../../api/useApi";
import type { QueueVisit } from "../../api/types";
import { formatTime, visitStatusLabel, visitStatusTone } from "../../utils/format";

/** 오늘 접수 전체: 대기·진료 중 + 진료 완료 + 취소를 접수 순서대로 */
export async function loadTodayVisits(): Promise<QueueVisit[]> {
  const [active, completed, cancelled] = await Promise.all([
    receptionApi.queue(),
    receptionApi.queue({ status: "COMPLETED" }),
    receptionApi.queue({ status: "CANCELLED" }),
  ]);
  return [...active.items, ...completed.items, ...cancelled.items].sort(
    (a, b) => a.checkedInAt.localeCompare(b.checkedInAt) || a.visitId - b.visitId,
  );
}

export function Waiting() {
  const { data, loading, error, reload } = useApi(loadTodayVisits, []);
  const rows = data ?? [];
  const [cancelling, setCancelling] = useState<number | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  const startCancel = (visitId: number) => {
    setCancelling(visitId);
    setReason("");
    setNotice(null);
  };

  const confirmCancel = async (v: QueueVisit) => {
    const text = reason.trim();
    if (!text || text.length > 200) {
      setNotice({ ok: false, text: "취소 사유를 200자 이내로 입력해 주세요." });
      return;
    }
    setBusy(true);
    try {
      await receptionApi.cancelVisit(v.visitId, text);
      setNotice({ ok: true, text: `${v.patientName}님 접수(${v.receptionCode})를 취소했습니다.` });
      setCancelling(null);
    } catch (e) {
      if (e instanceof ApiError && e.code === "INVALID_VISIT_STATE")
        setNotice({ ok: false, text: "대기 중인 접수만 취소할 수 있습니다. 이미 진료가 시작됐는지 확인해 주세요." });
      else setNotice({ ok: false, text: e instanceof ApiError ? e.message : "접수 취소 중 문제가 발생했습니다." });
    } finally {
      setBusy(false);
      void reload();
    }
  };

  return (
    <>
      <PageHeader title="접수·대기 관리" description="접수 순서와 진료 상태를 확인합니다." />
      <div className="legend">
        <span>
          <i className="dot orange" />
          대기
        </span>
        <span>
          <i className="dot mint" />
          진료 중
        </span>
        <span>
          <i className="dot green" />
          진료 완료
        </span>
        <span>
          <i className="dot red" />
          취소
        </span>
        <button className="text-link" onClick={() => void reload()} disabled={loading}>
          {loading ? "불러오는 중…" : "새로고침"}
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
                <th>접수번호</th>
                <th>접수시간</th>
                <th>환자명</th>
                <th>진료과</th>
                <th>진료상태</th>
                <th>진료 시작</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((v) => (
                <tr key={v.visitId}>
                  <td className="code">{v.receptionCode}</td>
                  <td>{formatTime(v.checkedInAt)}</td>
                  <td>
                    <b>{v.patientName}</b>
                    <small className="subtext">{v.patientId}</small>
                  </td>
                  <td>{v.departmentName}</td>
                  <td>
                    <Badge tone={visitStatusTone[v.status]}>{visitStatusLabel[v.status]}</Badge>
                  </td>
                  <td>{formatTime(v.startedAt)}</td>
                  <td>
                    {v.status === "WAITING" && cancelling !== v.visitId && (
                      <Button variant="danger-ghost" onClick={() => startCancel(v.visitId)}>
                        접수 취소
                      </Button>
                    )}
                    {cancelling === v.visitId && (
                      <div className="inline-cancel">
                        <input
                          id={`cancel-reason-${v.visitId}`}
                          value={reason}
                          maxLength={200}
                          onChange={(e) => setReason(e.target.value)}
                          placeholder="취소 사유 (예: 환자 요청)"
                          aria-label="접수 취소 사유"
                        />
                        <Button variant="danger-ghost" disabled={busy} onClick={() => confirmCancel(v)}>
                          {busy ? "처리 중…" : "취소 확정"}
                        </Button>
                        <button className="text-link" onClick={() => setCancelling(null)} disabled={busy}>
                          닫기
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <TableState loading={loading} error={error} empty={rows.length === 0} emptyText="오늘 접수된 환자가 없습니다." />
        </div>
      </div>
    </>
  );
}
