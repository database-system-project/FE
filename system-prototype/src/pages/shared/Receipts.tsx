import { useState } from "react";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { PageHeader } from "../../components/PageHeader";
import { Receipt } from "./Receipt";

export function Receipts() {
  const [open, setOpen] = useState(false);
  if (open) return <Receipt close={() => setOpen(false)} />;
  return (
    <>
      <PageHeader
        title="전자영수증"
        description="진료비 결제 내역과 전자영수증을 확인할 수 있습니다."
      />
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
              <tr>
                <td className="code">PAY20261014-0092</td>
                <td>2026.10.14</td>
                <td>내과 / 이정훈</td>
                <td>
                  <Badge>초진</Badge>
                </td>
                <td>
                  <b>18,000원</b>
                </td>
                <td>2026.10.14 10:05</td>
                <td>
                  <Button variant="outline" onClick={() => setOpen(true)}>
                    영수증 보기
                  </Button>
                </td>
              </tr>
              <tr>
                <td className="code">PAY20260721-0041</td>
                <td>2026.07.21</td>
                <td>피부과 / 김민서</td>
                <td>
                  <Badge tone="gray">재진</Badge>
                </td>
                <td>
                  <b>15,000원</b>
                </td>
                <td>2026.07.21 15:22</td>
                <td>
                  <Button variant="outline" onClick={() => setOpen(true)}>
                    영수증 보기
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
