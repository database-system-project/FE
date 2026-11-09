import { Icon } from "../../components/Icon";
import { Button } from "../../components/Button";

export function PrescriptionDocument({ close }: { close: () => void }) {
  return (
    <div className="document-page prescription-doc">
      <div className="doc-brand">
        <span className="brand-mark">
          <Icon name="logo" />
        </span>
        <span>
          <b>온케어의원</b>
          <small>ONCARE CLINIC</small>
        </span>
      </div>
      <h1>처 방 전</h1>
      <p className="doc-number">처방번호 RX20261111-0031</p>
      <div className="doc-rule" />
      <dl className="doc-details two">
        <div>
          <dt>환자명</dt>
          <dd>오지호</dd>
        </div>
        <div>
          <dt>처방일</dt>
          <dd>2026.11.11</dd>
        </div>
        <div>
          <dt>진료과</dt>
          <dd>내과</dd>
        </div>
        <div>
          <dt>담당 의사</dt>
          <dd>이정훈 의사</dd>
        </div>
      </dl>
      <table className="doc-table">
        <thead>
          <tr>
            <th>약품명</th>
            <th>1회</th>
            <th>하루</th>
            <th>간격</th>
            <th>일수</th>
            <th>시점</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>아세트아미노펜정 500mg</td>
            <td>1정</td>
            <td>3회</td>
            <td>매일</td>
            <td>3일</td>
            <td>식후</td>
          </tr>
          <tr>
            <td>레보세티리진정 5mg</td>
            <td>1정</td>
            <td>1회</td>
            <td>매일</td>
            <td>3일</td>
            <td>취침 전</td>
          </tr>
        </tbody>
      </table>
      <div className="directions-box">
        <b>복용 방법</b>
        <p>충분한 물과 함께 복용하십시오. 졸음이 올 수 있으므로 운전 시 주의하세요.</p>
      </div>
      <div className="doctor-sign">
        처방의사 <b>이정훈</b> (서명)
      </div>
      <div className="document-actions">
        <Button variant="outline" onClick={close}>
          닫기
        </Button>
        <Button icon="print" onClick={() => window.print()}>
          처방전 인쇄
        </Button>
      </div>
    </div>
  );
}
