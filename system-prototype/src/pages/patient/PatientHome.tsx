import { Icon } from "../../components/Icon";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { PageHeader } from "../../components/PageHeader";

export function PatientHome({ navigate }: { navigate: (s: string) => void }) {
  return (
    <>
      <PageHeader
        title="안녕하세요, 홍길동님"
        description="오늘도 건강한 하루 보내세요. 예정된 진료 일정을 확인해 주세요."
      />
      <div className="patient-hero">
        <div className="next-appointment">
          <div className="card-head">
            <div>
              <span className="section-kicker">NEXT APPOINTMENT</span>
              <h2>다음 예약</h2>
            </div>
            <Badge>예약완료</Badge>
          </div>
          <div className="appointment-date">
            <strong>11</strong>
            <span>
              2026년 11월
              <br />
              <b>수요일</b>
            </span>
          </div>
          <div className="appointment-info">
            <div>
              <small>진료과 / 담당 의사</small>
              <b>내과 · 이정훈 의사</b>
            </div>
            <div>
              <small>접수 예정시간</small>
              <b>오전 10:30</b>
            </div>
          </div>
          <div className="appointment-notice">
            <Icon name="clock" size={17} /> 예약한 접수 예정시간에 병원에 방문해 주세요.
          </div>
          <Button onClick={() => navigate("reservations")}>
            예약 상세 보기 <Icon name="chevron" size={16} />
          </Button>
        </div>
        <div className="quick-panel">
          <h3>빠른 메뉴</h3>
          <div className="quick-grid">
            {[
              ["booking", "calendar", "진료 예약하기", "원하는 진료과와 시간을 선택하세요"],
              ["reservations", "list", "예약 조회", "예약 변경 및 취소"],
              ["records", "file", "진료 내역", "지난 진료 기록 확인"],
              ["med-guide", "pill", "처방·복약 안내", "복용법과 주의사항"],
              ["receipts", "receipt", "전자영수증", "결제 내역 및 영수증"],
            ].map(([id, icon, title, desc]) => (
              <button key={id} onClick={() => navigate(id)}>
                <span className="quick-icon">
                  <Icon name={icon} />
                </span>
                <span>
                  <b>{title}</b>
                  <small>{desc}</small>
                </span>
                <Icon name="chevron" size={16} />
              </button>
            ))}
          </div>
        </div>
      </div>
      <h2 className="section-title">최근 이용 내역</h2>
      <div className="summary-cards">
        <button onClick={() => navigate("records")}>
          <span className="summary-top">
            <Icon name="file" /> 최근 진료
          </span>
          <b>감기 및 급성 인두염</b>
          <small>2026.10.14 · 내과 이정훈</small>
          <span className="link">상세 보기 →</span>
        </button>
        <button onClick={() => navigate("med-guide")}>
          <span className="summary-top mint">
            <Icon name="pill" /> 최근 처방
          </span>
          <b>아세트아미노펜정 외 1건</b>
          <small>3일분 · 2026.10.14 처방</small>
          <span className="link">복약 안내 보기 →</span>
        </button>
        <button onClick={() => navigate("receipts")}>
          <span className="summary-top green">
            <Icon name="receipt" /> 결제/영수증
          </span>
          <b>18,000원</b>
          <small>초진 진찰료 · 결제완료</small>
          <span className="link">영수증 보기 →</span>
        </button>
      </div>
    </>
  );
}
