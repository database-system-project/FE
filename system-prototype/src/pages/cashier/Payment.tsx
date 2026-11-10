import { useState } from "react";
import { Icon } from "../../components/Icon";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { PageHeader } from "../../components/PageHeader";
import { Receipt } from "../shared/Receipt";
import { PrescriptionDocument } from "./PrescriptionDocument";

export function Payment({ navigate }: { navigate: (s: string) => void }) {
  const [paid, setPaid] = useState(false);
  const [doc, setDoc] = useState<"receipt" | "rx" | null>(null);
  if (doc === "receipt") return <Receipt close={() => setDoc(null)} />;
  if (doc === "rx") return <PrescriptionDocument close={() => setDoc(null)} />;
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
              <p>접수번호 V20261111-006</p>
            </div>
            <Badge tone={paid ? "green" : "orange"}>{paid ? "결제완료" : "결제대기"}</Badge>
          </div>
          <dl className="payment-info">
            <div>
              <dt>환자명</dt>
              <dd>오지호</dd>
            </div>
            <div>
              <dt>환자번호</dt>
              <dd>100135</dd>
            </div>
            <div>
              <dt>진료일</dt>
              <dd>2026년 11월 11일</dd>
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
              <dt>접수번호</dt>
              <dd className="code">V20261111-006</dd>
            </div>
            <div>
              <dt>진찰 구분</dt>
              <dd>
                <Badge>초진</Badge>
              </dd>
            </div>
            <div>
              <dt>진찰료</dt>
              <dd>18,000원</dd>
            </div>
          </dl>
        </section>
        <aside className="charge-card">
          <span className="section-kicker">CONSULTATION FEE</span>
          <h2>초진 진찰료</h2>
          <p>과거 진료 완료 기록이 없어 시스템에서 초진으로 자동 판정했습니다.</p>
          <div className="fee-amount">
            <small>결제 금액</small>
            <strong>
              18,000<em>원</em>
            </strong>
          </div>
          <div className="fee-note">
            <Icon name="shield" size={17} />
            <span>
              2026.11.01부터 적용된 진찰료입니다.
              <br />
              보험 및 약값은 포함하지 않습니다.
            </span>
          </div>
          {!paid ? (
            <Button className="wide" onClick={() => setPaid(true)}>
              결제 완료
            </Button>
          ) : (
            <div className="payment-success">
              <div>
                <Icon name="check" />
                <span>
                  <b>결제가 정상적으로 처리되었습니다.</b>
                  <small>2026.11.11 10:03 · 최수납</small>
                </span>
              </div>
              <Button variant="outline" onClick={() => setDoc("receipt")}>
                <Icon name="receipt" /> 전자영수증 보기
              </Button>
              <Button onClick={() => setDoc("rx")}>
                <Icon name="print" /> 처방전 출력
              </Button>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
