import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { StatCard } from "../../components/StatCard";
import { PageHeader } from "../../components/PageHeader";
import { TableState } from "../../components/TableState";
import { billingApi } from "../../api/billing";
import { useApi } from "../../api/useApi";
import { formatTime } from "../../utils/format";
import { feeTypeLabel } from "../shared/Receipt";
import { billingTarget } from "./billingTarget";

const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;

export function CashierHome({ navigate }: { navigate: (s: string) => void }) {
  // 기간을 안 주면 오늘 진료 완료된 접수가 결제 전·후 모두 온다
  const { data, loading, error, reload } = useApi(() => billingApi.visits(), []);
  const rows = data?.items ?? [];
  const unpaid = rows.filter((r) => r.paymentStatus === "UNPAID");
  const paid = rows.filter((r) => r.paymentStatus === "PAID");
  const paidTotal = paid.reduce((sum, r) => sum + r.amount, 0);

  return (
    <>
      <PageHeader
        title="수납 대시보드"
        description="진료 완료 환자의 결제를 처리하고 문서를 발급합니다."
        actions={
          <Button variant="outline" onClick={() => void reload()}>
            새로고침
          </Button>
        }
      />
      <div className="stats-grid three">
        <StatCard label="결제 대기" value={`${unpaid.length}명`} helper="오늘 진료 완료 기준" icon="clock" tone="orange" />
        <StatCard label="오늘 결제 완료" value={`${paid.length}건`} helper="접수 1건당 결제 1번" icon="check" tone="green" />
        <StatCard label="오늘 결제 금액" value={won(paidTotal)} helper="진찰료 합계" icon="receipt" />
      </div>
      <section className="data-card">
        <div className="card-title">
          <div>
            <h2>결제 대기 환자</h2>
            <p>실제 카드 결제 없이 결제 완료 상태만 처리합니다.</p>
          </div>
          <Badge tone="orange">{unpaid.length}건</Badge>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>진료번호</th>
                <th>환자명</th>
                <th>진료과</th>
                <th>담당의사</th>
                <th>진료완료시간</th>
                <th>진찰 구분</th>
                <th>진찰료</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {unpaid.map((r) => (
                <tr key={r.visitId}>
                  <td className="code">{r.visitId}</td>
                  <td>
                    <b>{r.patientName}</b>
                  </td>
                  <td>{r.departmentName}</td>
                  <td>{r.doctorName}</td>
                  <td>{formatTime(r.completedAt)}</td>
                  <td>
                    <Badge tone={r.feeType === "FIRST_VISIT" ? "blue" : "gray"}>{feeTypeLabel[r.feeType]}</Badge>
                  </td>
                  <td>
                    <b>{won(r.amount)}</b>
                  </td>
                  <td>
                    <Button
                      onClick={() => {
                        billingTarget.set(r);
                        navigate("payment");
                      }}
                    >
                      결제
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <TableState
            loading={loading}
            error={error}
            empty={unpaid.length === 0}
            emptyText="결제를 기다리는 환자가 없습니다. 의사가 진료를 완료하면 여기에 나타납니다."
          />
        </div>
      </section>
    </>
  );
}
