import { Icon } from "../../components/Icon";
import { Button } from "../../components/Button";

export function Receipt({ close }: { close: () => void }) {
  return (
    <div className="document-page receipt-doc">
      <div className="doc-brand">
        <span className="brand-mark">
          <Icon name="logo" />
        </span>
        <span>
          <b>온케어의원</b>
          <small>ONCARE CLINIC</small>
        </span>
      </div>
      <h1>진료비 전자영수증</h1>
      <p className="doc-number">영수증번호 PAY20261014-0092</p>
      <div className="doc-rule" />
      <dl className="doc-details">
        <div>
          <dt>환자명</dt>
          <dd>홍길동</dd>
        </div>
        <div>
          <dt>진료일</dt>
          <dd>2026년 10월 14일</dd>
        </div>
        <div>
          <dt>진료과</dt>
          <dd>내과</dd>
        </div>
        <div>
          <dt>담당 의사</dt>
          <dd>이정훈 의사</dd>
        </div>
        <div>
          <dt>진찰 구분</dt>
          <dd>초진</dd>
        </div>
        <div>
          <dt>결제시각</dt>
          <dd>2026.10.14 10:05</dd>
        </div>
      </dl>
      <div className="doc-total">
        <span>초진 진찰료</span>
        <b>18,000원</b>
      </div>
      <p className="doc-note">
        결제 기록을 기준으로 표시되는 진찰료 영수증이며 약값은 포함되지 않습니다.
      </p>
      <div className="doc-sign">
        온케어의원
        <br />
        <small>서울특별시 중구 세종대로 100 · 02-1234-5678</small>
      </div>
      <div className="document-actions">
        <Button variant="outline" onClick={close}>
          닫기
        </Button>
        <Button icon="print" onClick={() => window.print()}>
          인쇄
        </Button>
      </div>
    </div>
  );
}
