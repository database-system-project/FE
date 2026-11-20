import { Icon } from "../../components/Icon";
import { Button } from "../../components/Button";
import type { Receipt as ReceiptData } from "../../api/types";
import { formatDate, formatTime } from "../../utils/format";

export const feeTypeLabel = { FIRST_VISIT: "초진", FOLLOW_UP: "재진" } as const;

/** 진료비 전자영수증 문서. GET /payments/{paymentId}/receipt 응답을 그대로 받는다 */
export function Receipt({ receipt, close }: { receipt: ReceiptData; close: () => void }) {
  const fee = feeTypeLabel[receipt.feeType];
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
      <p className="doc-number">영수증번호 {receipt.receiptNumber}</p>
      <div className="doc-rule" />
      <dl className="doc-details">
        <div>
          <dt>환자명</dt>
          <dd>{receipt.patientName}</dd>
        </div>
        <div>
          <dt>진료일</dt>
          <dd>{formatDate(receipt.visitDate)}</dd>
        </div>
        <div>
          <dt>진료과</dt>
          <dd>{receipt.departmentName}</dd>
        </div>
        <div>
          <dt>담당 의사</dt>
          <dd>{receipt.doctorName} 의사</dd>
        </div>
        <div>
          <dt>진찰 구분</dt>
          <dd>{fee}</dd>
        </div>
        <div>
          <dt>결제시각</dt>
          <dd>
            {formatDate(receipt.paidAt)} {formatTime(receipt.paidAt)}
          </dd>
        </div>
      </dl>
      <div className="doc-total">
        <span>{fee} 진찰료</span>
        <b>{receipt.amount.toLocaleString("ko-KR")}원</b>
      </div>
      <p className="doc-note">결제 기록을 기준으로 표시되는 진찰료 영수증이며 약값은 포함되지 않습니다.</p>
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
