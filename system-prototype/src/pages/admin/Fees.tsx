import { useState } from "react";
import { Icon } from "../../components/Icon";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { PageHeader } from "../../components/PageHeader";

export function Fees() {
  const [modal, setModal] = useState(false);
  return (
    <>
      <PageHeader
        title="진찰료 관리"
        description="초진·재진 진찰료의 적용 이력을 관리합니다."
        actions={
          <Button icon="plus" onClick={() => setModal(true)}>
            진찰료 변경
          </Button>
        }
      />
      <div className="info-banner">
        <Icon name="receipt" />
        <span>
          <b>이력 기반 진찰료 관리</b>
          <small>
            기존 금액은 삭제하지 않으며, 적용 시작일을 기준으로 진료 시점의 진찰료가 결정됩니다.
          </small>
        </span>
      </div>
      <div className="data-card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>진찰료 구분</th>
                <th>금액</th>
                <th>적용 시작일</th>
                <th>등록자</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <b>초진</b>
                </td>
                <td>
                  <b>18,000원</b>
                </td>
                <td>2026.11.01</td>
                <td>관리자</td>
                <td>
                  <Badge tone="green">적용중</Badge>
                </td>
              </tr>
              <tr>
                <td>
                  <b>재진</b>
                </td>
                <td>
                  <b>15,000원</b>
                </td>
                <td>2026.11.01</td>
                <td>관리자</td>
                <td>
                  <Badge tone="green">적용중</Badge>
                </td>
              </tr>
              <tr className="muted-row">
                <td>초진</td>
                <td>17,000원</td>
                <td>2026.03.01</td>
                <td>박관리</td>
                <td>
                  <Badge tone="gray">적용종료</Badge>
                </td>
              </tr>
              <tr className="muted-row">
                <td>재진</td>
                <td>14,000원</td>
                <td>2026.03.01</td>
                <td>박관리</td>
                <td>
                  <Badge tone="gray">적용종료</Badge>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      {modal && (
        <div className="modal-layer">
          <div className="modal small-modal">
            <button className="modal-close" onClick={() => setModal(false)}>
              <Icon name="close" />
            </button>
            <span className="section-kicker">FEE REVISION</span>
            <h2>진찰료 변경</h2>
            <p>새 금액은 적용 시작일부터 사용되며 기존 이력은 유지됩니다.</p>
            <label className="field">
              <span>진찰료 구분</span>
              <select>
                <option>초진</option>
                <option>재진</option>
              </select>
            </label>
            <label className="field">
              <span>변경 금액</span>
              <div className="input-suffix">
                <input defaultValue="18000" />
                <span>원</span>
              </div>
            </label>
            <label className="field">
              <span>적용 시작일</span>
              <input type="date" defaultValue="2026-12-01" />
            </label>
            <div className="modal-actions">
              <Button variant="outline" onClick={() => setModal(false)}>
                취소
              </Button>
              <Button onClick={() => setModal(false)}>변경 예약</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
