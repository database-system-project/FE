import { useState } from "react";
import { patients } from "../../mocks/data";
import { Icon } from "../../components/Icon";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { PageHeader } from "../../components/PageHeader";

export function DeskReservations({ navigate }: { navigate: (s: string) => void }) {
  const [checked, setChecked] = useState(["100086"]);
  return (
    <>
      <PageHeader
        title="오늘 예약 환자"
        description="2026년 11월 11일 · 당일 예약 환자의 내원 접수를 처리합니다."
      />
      <div className="toolbar">
        <div className="search">
          <Icon name="search" />
          <input placeholder="환자명 또는 환자번호 검색" />
        </div>
        <select>
          <option>전체 진료과</option>
          <option>내과</option>
          <option>피부과</option>
        </select>
        <select>
          <option>전체 상태</option>
          <option>예약완료</option>
          <option>접수완료</option>
        </select>
      </div>
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
              {patients.map((p) => (
                <tr key={p[1]}>
                  <td>
                    <b>{p[0]}</b>
                  </td>
                  <td className="code">{p[1]}</td>
                  <td>
                    <b>{p[2]}</b>
                  </td>
                  <td>{p[3]}</td>
                  <td>{p[4]}</td>
                  <td>
                    <Badge tone={checked.includes(p[1]) ? "green" : "blue"}>
                      {checked.includes(p[1]) ? "접수완료" : "예약완료"}
                    </Badge>
                  </td>
                  <td>
                    {checked.includes(p[1]) ? (
                      <button className="text-link" onClick={() => navigate("waiting")}>
                        대기목록 보기
                      </button>
                    ) : (
                      <Button onClick={() => setChecked([...checked, p[1]])}>접수</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
