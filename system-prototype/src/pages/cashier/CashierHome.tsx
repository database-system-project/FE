import { billing } from "../../mocks/data";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { StatCard } from "../../components/StatCard";
import { PageHeader } from "../../components/PageHeader";

export function CashierHome({ navigate }: { navigate: (s: string) => void }) {
  return (
    <>
      <PageHeader
        title="수납 대시보드"
        description="진료 완료 환자의 결제를 처리하고 문서를 발급합니다."
      />
      <div className="stats-grid three">
        <StatCard
          label="결제 대기"
          value="3명"
          helper="진료 완료 기준"
          icon="clock"
          tone="orange"
        />
        <StatCard
          label="오늘 결제 완료"
          value="18건"
          helper="중복 결제 0건"
          icon="check"
          tone="green"
        />
        <StatCard label="오늘 결제 금액" value="312,000원" helper="진찰료 합계" icon="receipt" />
      </div>
      <section className="data-card">
        <div className="card-title">
          <div>
            <h2>결제 대기 환자</h2>
            <p>실제 카드 결제 없이 결제 완료 상태만 처리합니다.</p>
          </div>
          <Badge tone="orange">3건</Badge>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>접수번호</th>
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
              {billing.map((r) => (
                <tr key={r[0]}>
                  <td className="code">{r[0]}</td>
                  <td>
                    <b>{r[1]}</b>
                  </td>
                  <td>{r[2]}</td>
                  <td>{r[3]}</td>
                  <td>{r[4]}</td>
                  <td>
                    <Badge tone={r[5] === "초진" ? "blue" : "gray"}>{r[5]}</Badge>
                  </td>
                  <td>
                    <b>{r[6]}</b>
                  </td>
                  <td>
                    <Button onClick={() => navigate("payment")}>결제</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
