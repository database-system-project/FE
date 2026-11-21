import { useState } from "react";
import { Icon } from "../../components/Icon";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { PageHeader } from "../../components/PageHeader";
import { billingApi } from "../../api/billing";
import { ApiError } from "../../api/client";
import { errorMessage } from "../../api/useApi";
import type { BillingQuote, PrescriptionPrint, Receipt as ReceiptData } from "../../api/types";
import { formatDate, formatTime } from "../../utils/format";
import { feeTypeLabel, Receipt } from "../shared/Receipt";
import { PrescriptionDocument } from "./PrescriptionDocument";
import { billingTarget } from "./billingTarget";

const won = (n: number) => n.toLocaleString("ko-KR");

export function Payment({ navigate }: { navigate: (s: string) => void }) {
  // 수납 대시보드에서 고른 접수 (새로고침하면 사라지므로 그때는 목록으로 돌려보낸다)
  const [visit] = useState(() => billingTarget.get());
  const [quote, setQuote] = useState<BillingQuote | null>(visit);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [print, setPrint] = useState<PrescriptionPrint | null>(null);

  if (!visit || !quote) {
    return (
      <>
        <PageHeader title="진료비 결제" description="수납 대시보드에서 결제할 환자를 선택해 주세요." />
        <section className="data-card">
          <p className="table-state">선택된 환자가 없습니다.</p>
          <Button onClick={() => navigate("cashier-home")}>수납 대시보드로</Button>
        </section>
      </>
    );
  }

  if (receipt) return <Receipt receipt={receipt} close={() => setReceipt(null)} />;
  if (print) return <PrescriptionDocument data={print} close={() => setPrint(null)} />;

  const paid = quote.paymentStatus === "PAID";
  const fee = feeTypeLabel[quote.feeType];

  const pay = async () => {
    setBusy(true);
    setMessage("");
    try {
      setQuote(await billingApi.pay(visit.visitId, quote.feeId));
    } catch (e) {
      if (e instanceof ApiError && e.code === "FEE_CHANGED") {
        // 화면을 연 사이 관리자가 진찰료를 바꿨다: 새 금액을 보여주고 다시 확인받는다
        setQuote(await billingApi.quote(visit.visitId));
        setMessage("진찰료가 변경되었습니다. 바뀐 금액을 확인하고 다시 결제해 주세요.");
      } else if (e instanceof ApiError && e.code === "FEE_NOT_CONFIGURED") {
        setMessage("적용할 진찰료가 없습니다. 관리자에게 진찰료 등록을 요청해 주세요.");
      } else {
        setMessage(errorMessage(e));
      }
    } finally {
      setBusy(false);
    }
  };

  const openReceipt = async () => {
    if (!quote.paymentId) return;
    setMessage("");
    try {
      setReceipt(await billingApi.receipt(quote.paymentId));
    } catch (e) {
      setMessage(errorMessage(e));
    }
  };

  const openPrint = async () => {
    setMessage("");
    try {
      const data = await billingApi.prescriptionPrint(visit.visitId);
      if (!data.canPrint) {
        setMessage("이 진료에는 처방이 없어 출력할 처방전이 없습니다.");
        return;
      }
      setPrint(data);
    } catch (e) {
      setMessage(errorMessage(e));
    }
  };

  return (
    <>
      <PageHeader
        title="진료비 결제"
        description="진찰료와 환자 정보를 확인한 후 결제를 완료해 주세요."
        actions={
          <Button variant="outline" onClick={() => navigate("cashier-home")}>
            목록으로
          </Button>
        }
      />
      <div className="payment-layout">
        <section className="payment-card">
          <div className="card-title">
            <div>
              <h2>환자 및 진료 정보</h2>
              <p>진료번호 {visit.visitId}</p>
            </div>
            <Badge tone={paid ? "green" : "orange"}>{paid ? "결제완료" : "결제대기"}</Badge>
          </div>
          <dl className="payment-info">
            <div>
              <dt>환자명</dt>
              <dd>{visit.patientName}</dd>
            </div>
            <div>
              <dt>환자번호</dt>
              <dd>{visit.patientId}</dd>
            </div>
            <div>
              <dt>진료일</dt>
              <dd>{formatDate(visit.completedAt)}</dd>
            </div>
            <div>
              <dt>진료과</dt>
              <dd>{visit.departmentName}</dd>
            </div>
            <div>
              <dt>담당 의사</dt>
              <dd>{visit.doctorName} 의사</dd>
            </div>
            <div>
              <dt>진료 완료</dt>
              <dd>{formatTime(visit.completedAt)}</dd>
            </div>
            <div>
              <dt>진찰 구분</dt>
              <dd>
                <Badge tone={quote.feeType === "FIRST_VISIT" ? "blue" : "gray"}>{fee}</Badge>
              </dd>
            </div>
            <div>
              <dt>진찰료</dt>
              <dd>{won(quote.amount)}원</dd>
            </div>
          </dl>
        </section>
        <aside className="charge-card">
          <span className="section-kicker">CONSULTATION FEE</span>
          <h2>{fee} 진찰료</h2>
          <p>
            {quote.feeType === "FIRST_VISIT"
              ? "과거 진료 완료 기록이 없어 시스템에서 초진으로 자동 판정했습니다."
              : "이전에 완료된 진료 기록이 있어 시스템에서 재진으로 자동 판정했습니다."}
          </p>
          <div className="fee-amount">
            <small>결제 금액</small>
            <strong>
              {won(quote.amount)}
              <em>원</em>
            </strong>
          </div>
          <div className="fee-note">
            <Icon name="shield" size={17} />
            <span>
              결제 시점에 적용 중인 진찰료입니다.
              <br />
              보험 및 약값은 포함하지 않습니다.
            </span>
          </div>
          {message && (
            <p className="form-error" role="alert">
              {message}
            </p>
          )}
          {!paid ? (
            <Button className="wide" onClick={() => void pay()} disabled={busy}>
              {busy ? "처리 중…" : "결제 완료"}
            </Button>
          ) : (
            <div className="payment-success">
              <div>
                <Icon name="check" />
                <span>
                  <b>결제가 정상적으로 처리되었습니다.</b>
                  <small>
                    {formatDate(quote.paidAt)} {formatTime(quote.paidAt)} · 영수증번호 {quote.paymentId}
                  </small>
                </span>
              </div>
              <Button variant="outline" onClick={() => void openReceipt()}>
                <Icon name="receipt" /> 전자영수증 보기
              </Button>
              <Button onClick={() => void openPrint()}>
                <Icon name="print" /> 처방전 출력
              </Button>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
