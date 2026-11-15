import { useState } from "react";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { PageHeader } from "../../components/PageHeader";
import { TableState } from "../../components/TableState";
import { patientApi } from "../../api/patient";
import { useApi } from "../../api/useApi";
import type { Receipt as ReceiptData } from "../../api/types";
import { formatDate, formatTime } from "../../utils/format";
import { feeTypeLabel, Receipt } from "../shared/Receipt";
import { historySelection } from "./history";

/** 결제한 진료의 영수증. 목록 API에 금액이 없어서 결제된 진료마다 영수증을 받아 표로 만든다 */
async function loadReceipts() {
  const { items } = await patientApi.visits();
  const paid = items.filter((v) => v.paymentId !== null);
  return Promise.all(paid.map((v) => patientApi.receipt(v.paymentId!)));
}

export function MyReceipts() {
  const { data, loading, error } = useApi(loadReceipts, []);
  const rows = data ?? [];
  // 진료 내역에서 "영수증"을 누르고 들어오면 그 영수증을 바로 연다
  const [openId, setOpenId] = useState<number | null>(() => historySelection.takePayment());
  const open: ReceiptData | undefined = rows.find((r) => r.paymentId === openId);

  if (open) return <Receipt receipt={open} close={() => setOpenId(null)} />;
  return (
    <>
      <PageHeader title="전자영수증" description="진료비 결제 내역과 전자영수증을 확인할 수 있습니다." />
      <div className="data-card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>영수증번호</th>
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
                <tr key={r.paymentId}>
                  <td className="code">{r.receiptNumber}</td>
                  <td>{formatDate(r.visitDate)}</td>
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
                    <Button variant="outline" onClick={() => setOpenId(r.paymentId)}>
                      영수증 보기
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <TableState
            loading={loading}
            error={error}
            empty={rows.length === 0}
            emptyText="결제한 진료가 없습니다. 진료 후 수납 창구에서 결제하면 영수증이 생깁니다."
          />
        </div>
      </div>
    </>
  );
}
