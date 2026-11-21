import { useState } from "react";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { PageHeader } from "../../components/PageHeader";
import { TableState } from "../../components/TableState";
import { billingApi } from "../../api/billing";
import { errorMessage, useApi } from "../../api/useApi";
import type { PrescriptionPrint, Receipt as ReceiptData } from "../../api/types";
import { addDays, dateKey, formatDate, formatTime } from "../../utils/format";
import { feeTypeLabel, Receipt } from "../shared/Receipt";
import { PrescriptionDocument } from "./PrescriptionDocument";

const periods = [
  { days: 1, label: "오늘" },
  { days: 7, label: "최근 7일" },
  { days: 30, label: "최근 30일" },
] as const;

/** 결제 내역: 결제 완료된 진료를 기간별로 보고, 영수증·처방전을 다시 발급한다 */
export function PaymentHistory() {
  const [days, setDays] = useState<number>(1);
  const today = dateKey();
  const { data, loading, error } = useApi(
    () => billingApi.visits({ paymentStatus: "PAID", from: addDays(today, 1 - days), to: today }),
    [days, today],
  );
  // 서버는 진료 완료 순으로 주므로 최신 결제가 위로 오게 뒤집는다
  const rows = [...(data?.items ?? [])].reverse();
  const total = rows.reduce((sum, r) => sum + r.amount, 0);

  const [message, setMessage] = useState("");
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [print, setPrint] = useState<PrescriptionPrint | null>(null);

  if (receipt) return <Receipt receipt={receipt} close={() => setReceipt(null)} />;
  if (print) return <PrescriptionDocument data={print} close={() => setPrint(null)} />;

  const openReceipt = async (paymentId: number) => {
    setMessage("");
    try {
      setReceipt(await billingApi.receipt(paymentId));
    } catch (e) {
      setMessage(errorMessage(e));
    }
  };

  const openPrint = async (visitId: number) => {
    setMessage("");
    try {
      const doc = await billingApi.prescriptionPrint(visitId);
      if (doc.canPrint) setPrint(doc);
      else setMessage("이 진료에는 처방이 없어 출력할 처방전이 없습니다.");
    } catch (e) {
      setMessage(errorMessage(e));
    }
  };

  return (
    <>
      <PageHeader title="결제 내역" description="결제가 끝난 진료의 전자영수증과 처방전을 다시 발급할 수 있습니다." />
      <div className="tabs">
        {periods.map((p) => (
          <button key={p.days} className={days === p.days ? "active" : ""} onClick={() => setDays(p.days)}>
            {p.label}
          </button>
        ))}
      </div>
      {message && (
        <p className="form-error" role="alert">
          {message}
        </p>
      )}
      <div className="data-card">
        <div className="card-title">
          <div>
            <h2>결제 {rows.length}건</h2>
            <p>합계 {total.toLocaleString("ko-KR")}원</p>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>영수증번호</th>
                <th>환자명</th>
                <th>진료일</th>
                <th>진료과 / 담당 의사</th>
                <th>진찰 구분</th>
                <th>결제 금액</th>
                <th>결제시각</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.visitId}>
                  <td className="code">{r.paymentId}</td>
                  <td>
                    <b>{r.patientName}</b>
                  </td>
                  <td>{formatDate(r.completedAt)}</td>
                  <td>
                    {r.departmentName} / {r.doctorName}
                  </td>
                  <td>
                    <Badge tone={r.feeType === "FIRST_VISIT" ? "blue" : "gray"}>{feeTypeLabel[r.feeType]}</Badge>
                  </td>
                  <td>
                    <b>{r.amount.toLocaleString("ko-KR")}원</b>
                  </td>
                  <td>
                    {formatDate(r.paidAt)} {formatTime(r.paidAt)}
                  </td>
                  <td>
                    <div className="row-actions">
                      <Button variant="outline" onClick={() => r.paymentId && void openReceipt(r.paymentId)}>
                        영수증
                      </Button>
                      <Button variant="outline" onClick={() => void openPrint(r.visitId)}>
                        처방전
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <TableState loading={loading} error={error} empty={rows.length === 0} emptyText="이 기간에 결제한 진료가 없습니다." />
        </div>
      </div>
    </>
  );
}
