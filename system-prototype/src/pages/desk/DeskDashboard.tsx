import { useState } from "react";
import { patients } from "../../mocks/data";
import { Icon } from "../../components/Icon";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { StatCard } from "../../components/StatCard";
import { PageHeader } from "../../components/PageHeader";

export function DeskDashboard({ navigate }: { navigate: (s: string) => void }) {
  const [checked, setChecked] = useState<string[]>(["100086"]);
  return (
    <>
      <PageHeader
        title="원무 대시보드"
        description="2026년 11월 11일 수요일 · 오늘의 예약 및 접수 현황입니다."
      />
      <div className="stats-grid four">
        <StatCard label="오늘 예약 수" value="24" helper="오전 15 · 오후 9" icon="calendar" />
        <StatCard
          label="접수 완료"
          value={`${7 + checked.length - 1}`}
          helper="예약 대비 29%"
          icon="check"
          tone="green"
        />
        <StatCard
          label="현재 대기"
          value={`${4 + checked.length - 1}`}
          helper="평균 대기 18분"
          icon="users"
          tone="orange"
        />
        <StatCard label="진료 완료" value="3" helper="오늘 누적" icon="file" tone="mint" />
      </div>
      <div className="dashboard-split">
        <section className="data-card">
          <div className="card-title">
            <div>
              <h2>오늘 예약 환자</h2>
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
                {patients.slice(0, 4).map((p) => (
                  <tr key={p[1]}>
                    <td>
                      <b>{p[0]}</b>
                    </td>
                    <td>
                      <b>{p[2]}</b>
                      <small className="subtext">{p[1]}</small>
                    </td>
                    <td>
                      {p[3]}
                      <small className="subtext">{p[4]} 의사</small>
                    </td>
                    <td>
                      <Badge tone={checked.includes(p[1]) ? "green" : "blue"}>
                        {checked.includes(p[1]) ? "접수완료" : "예약완료"}
                      </Badge>
                    </td>
                    <td>
                      {checked.includes(p[1]) ? (
                        <span className="complete-text">
                          <Icon name="check" size={15} /> 완료
                        </span>
                      ) : (
                        <Button onClick={() => setChecked([...checked, p[1]])}>접수</Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="waiting-panel">
          <div className="card-title">
            <div>
              <h2>현재 대기 환자</h2>
              <p>접수 순서대로 표시됩니다.</p>
            </div>
            <Badge tone="orange">{4 + checked.length - 1}명 대기</Badge>
          </div>
          {[
            ["1", "박서준", "09:28", "내과 · 이정훈", "진료 중"],
            ["2", "김하늘", "09:42", "내과 · 이정훈", "대기"],
            ["3", "이서아", "09:51", "이비인후과 · 최은영", "대기"],
            ["4", "정유진", "10:03", "피부과 · 김민서", "대기"],
          ].map((w, i) => (
            <div className={`wait-row ${i === 0 ? "now" : ""}`} key={w[0]}>
              <span className="queue">{w[0]}</span>
              <div>
                <b>{w[1]}</b>
                <small>접수 {w[2]}</small>
              </div>
              <span>{w[3]}</span>
              <Badge tone={i === 0 ? "mint" : "orange"}>{w[4]}</Badge>
            </div>
          ))}
          <Button variant="outline" className="wide" onClick={() => navigate("waiting")}>
            대기 목록 관리
          </Button>
        </section>
      </div>
    </>
  );
}
