import { Icon } from "../../components/Icon";
import { Badge } from "../../components/Badge";
import { PageHeader } from "../../components/PageHeader";

export function MedGuide() {
  return (
    <>
      <PageHeader
        title="처방·복약 안내"
        description="처방받은 약의 효능과 나에게 맞는 복용 방법을 확인하세요."
      />
      <div className="prescription-summary">
        <div>
          <span className="prescription-icon">
            <Icon name="pill" />
          </span>
          <div>
            <small>처방번호 RX20261014-018</small>
            <h3>2026년 10월 14일 처방</h3>
            <p>내과 · 이정훈 의사</p>
          </div>
        </div>
        <Badge tone="green">복용 완료</Badge>
      </div>
      <div className="medicine-cards">
        {[
          [
            "아세트아미노펜정 500mg",
            "해열 및 감기로 인한 통증 완화",
            "정해진 용법과 용량을 지켜 복용하세요.",
            "과량 복용 시 간 손상 위험이 있습니다.",
            "실온(1~30℃), 습기를 피해 보관",
            "1정",
            "하루 3회",
            "3일",
            "식후",
            "충분한 물과 함께 복용하세요.",
          ],
          [
            "레보세티리진정 5mg",
            "알레르기성 비염 증상 완화",
            "1일 1회 복용합니다.",
            "졸음이 올 수 있으므로 운전 시 주의하세요.",
            "차광 밀폐용기에 실온 보관",
            "1정",
            "하루 1회",
            "3일",
            "취침 전",
            "취침 30분 전에 복용하세요.",
          ],
        ].map((m, i) => (
          <article className="medicine-card" key={m[0]}>
            <div className="med-head">
              <span>{i + 1}</span>
              <div>
                <h3>{m[0]}</h3>
                <small>한미약품 · 사용중</small>
              </div>
            </div>
            <div className="med-info-grid">
              <div>
                <b>주요 효능</b>
                <p>{m[1]}</p>
              </div>
              <div>
                <b>사용법</b>
                <p>{m[2]}</p>
              </div>
              <div>
                <b>주의사항</b>
                <p>{m[3]}</p>
              </div>
              <div>
                <b>보관방법</b>
                <p>{m[4]}</p>
              </div>
            </div>
            <div className="my-dose">
              <h4>
                <Icon name="pill" size={18} /> 내 복용 방법
              </h4>
              <div>
                <span>
                  <small>1회 복용량</small>
                  <b>{m[5]}</b>
                </span>
                <span>
                  <small>복용 횟수</small>
                  <b>{m[6]}</b>
                </span>
                <span>
                  <small>복용 기간</small>
                  <b>{m[7]}</b>
                </span>
                <span>
                  <small>복용 시점</small>
                  <b>{m[8]}</b>
                </span>
              </div>
              <p>
                <b>의사 안내</b>
                {m[9]}
              </p>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
