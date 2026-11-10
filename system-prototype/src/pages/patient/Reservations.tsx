import { useState } from "react";
import { reservationRows } from "../../mocks/data";
import { Icon } from "../../components/Icon";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { PageHeader } from "../../components/PageHeader";

export function Reservations({ navigate }: { navigate: (s: string) => void }) {
  const [cancelled, setCancelled] = useState(false);
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
        <button className="active">전체 3</button>
        <button>예정된 예약 1</button>
        <button>지난 예약 2</button>
      </div>
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
              {reservationRows.map((r, i) => (
                <tr key={r[0]}>
                  <td className="code">{r[0]}</td>
                  <td>
                    <b>{r[1]}</b>
                  </td>
                  <td>{r[2]} 의사</td>
                  <td>{r[3]}</td>
                  <td>{r[4]}</td>
                  <td>
                    <Badge tone={i === 0 && !cancelled ? "blue" : i === 1 ? "green" : "gray"}>
                      {i === 0 && cancelled ? "취소" : r[5]}
                    </Badge>
                  </td>
                  <td className="right">
                    {i === 0 && !cancelled ? (
                      <div className="row-actions">
                        <Button variant="outline" onClick={() => navigate("booking")}>
                          예약 변경
                        </Button>
                        <Button variant="danger-ghost" onClick={() => setCancelled(true)}>
                          예약 취소
                        </Button>
                      </div>
                    ) : (
                      <button className="text-link">상세 보기</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="info-banner">
        <Icon name="calendar" />
        <span>
          <b>예약 변경 안내</b>
          <small>
            예약 변경 시 기존 예약은 취소 처리되고, 선택한 시간으로 새 예약이 생성됩니다.
          </small>
        </span>
      </div>
    </>
  );
}
