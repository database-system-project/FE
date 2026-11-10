import { useState } from "react";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { PageHeader } from "../../components/PageHeader";

export function Waiting() {
  const [cancelled, setCancelled] = useState<string[]>([]);
  const rows = [
    ["V20261111-007", "09:28", "박서준", "이정훈", "진료 중", "박원무"],
    ["V20261111-008", "09:42", "김하늘", "이정훈", "대기", "박원무"],
    ["V20261111-009", "09:51", "이서아", "최은영", "대기", "강민지"],
    ["V20261111-010", "10:03", "정유진", "김민서", "대기", "박원무"],
    ["V20261111-006", "09:16", "오지호", "이정훈", "진료 완료", "강민지"],
  ];
  return (
    <>
      <PageHeader
        title="접수·대기 관리"
        description="접수 순서와 진료 상태를 실시간으로 확인합니다."
      />
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
      </div>
      <div className="data-card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>접수번호</th>
                <th>접수시간</th>
                <th>환자명</th>
                <th>담당의사</th>
                <th>진료상태</th>
                <th>처리 직원</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r[0]}>
                  <td className="code">{r[0]}</td>
                  <td>{r[1]}</td>
                  <td>
                    <b>{r[2]}</b>
                  </td>
                  <td>{r[3]} 의사</td>
                  <td>
                    <Badge
                      tone={
                        cancelled.includes(r[0])
                          ? "red"
                          : i === 0
                            ? "mint"
                            : i === 4
                              ? "green"
                              : "orange"
                      }
                    >
                      {cancelled.includes(r[0]) ? "취소" : r[4]}
                    </Badge>
                  </td>
                  <td>{r[5]}</td>
                  <td>
                    {r[4] === "대기" && !cancelled.includes(r[0]) && (
                      <Button
                        variant="danger-ghost"
                        onClick={() => setCancelled([...cancelled, r[0]])}
                      >
                        접수 취소
                      </Button>
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
