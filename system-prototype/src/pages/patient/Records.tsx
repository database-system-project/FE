import { useState } from "react";
import { Icon } from "../../components/Icon";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { PageHeader } from "../../components/PageHeader";
import { TableState } from "../../components/TableState";
import { useApi } from "../../api/useApi";
import { formatDate, formatTime } from "../../utils/format";
import { historySelection, loadHistory, type VisitHistory } from "./history";

export function Records({ navigate }: { navigate: (s: string) => void }) {
  const { data, loading, error } = useApi(loadHistory, []);
  const [open, setOpen] = useState<number | null>(null);
  const rows = data ?? [];

  return (
    <>
      <PageHeader title="진료 내역" description="나의 외래 진료 기록을 확인할 수 있습니다." />
      <div className="record-list">
        {rows.map((v) => (
          <RecordCard
            key={v.visitId}
            v={v}
            open={open === v.visitId}
            toggle={() => setOpen(open === v.visitId ? null : v.visitId)}
            navigate={navigate}
          />
        ))}
      </div>
      <TableState loading={loading} error={error} empty={rows.length === 0} emptyText="진료 완료된 내역이 없습니다." />
    </>
  );
}

function RecordCard({
  v,
  open,
  toggle,
  navigate,
}: {
  v: VisitHistory;
  open: boolean;
  toggle: () => void;
  navigate: (s: string) => void;
}) {
  const [y, m, d] = v.visitDate.split("-");
  const record = v.detail.medicalRecord;
  const active = v.detail.prescriptions.filter((p) => p.status === "ACTIVE");

  const openGuide = () => {
    historySelection.setPrescription(active[active.length - 1].prescriptionId);
    navigate("med-guide");
  };
  const openReceipt = () => {
    historySelection.setPayment(v.paymentId);
    navigate("receipts");
  };

  return (
    <div className="record-card">
      <div className="record-date">
        <b>
          {Number(m)}월 {Number(d)}일
        </b>
        <small>{y}년</small>
      </div>
      <div className="record-main">
        <div>
          {v.paymentStatus === "PAID" ? <Badge tone="green">결제완료</Badge> : <Badge tone="orange">결제 대기</Badge>}
          <span>
            {v.departmentName} · {v.doctorName} 의사
          </span>
        </div>
        <h3>{record?.diagnosis ?? "진료기록 없음"}</h3>
        <p>{record?.symptoms ?? ""}</p>
        {open && (
          <dl className="record-detail">
            <div>
              <dt>증상</dt>
              <dd>{record?.symptoms ?? "-"}</dd>
            </div>
            <div>
              <dt>진단</dt>
              <dd>{record?.diagnosis ?? "-"}</dd>
            </div>
            <div>
              <dt>진료 내용</dt>
              <dd>{record?.treatmentNote ?? "-"}</dd>
            </div>
            <div>
              <dt>처방</dt>
              <dd>
                {v.detail.prescriptions.length === 0
                  ? "처방 없음"
                  : v.detail.prescriptions.map((p) => (
                      <span key={p.prescriptionId} className={p.status === "CANCELLED" ? "cancelled" : ""}>
                        처방 #{p.prescriptionId} · {formatDate(p.prescribedAt)} {formatTime(p.prescribedAt)}
                        {p.status === "CANCELLED" && " (취소)"}
                      </span>
                    ))}
              </dd>
            </div>
          </dl>
        )}
      </div>
      <div className="record-actions">
        <Button variant="ghost" onClick={toggle}>
          {open ? "접기" : "상세"}
        </Button>
        {active.length > 0 && (
          <Button variant="outline" onClick={openGuide}>
            복약 안내
          </Button>
        )}
        {v.paymentId && (
          <Button variant="ghost" onClick={openReceipt}>
            영수증 <Icon name="chevron" size={15} />
          </Button>
        )}
      </div>
    </div>
  );
}
