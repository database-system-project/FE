import { Icon } from "../../components/Icon";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { StatCard } from "../../components/StatCard";
import { EmptyAvatar } from "../../components/EmptyAvatar";
import { PageHeader } from "../../components/PageHeader";

export function DoctorDashboard({ navigate }: { navigate: (s: string) => void }) {
  return (
    <>
      <PageHeader
        title="진료 대시보드"
        description="이정훈 의사 · 내과 · 2026년 11월 11일 수요일"
      />
      <div className="stats-grid three">
        <StatCard label="오늘 진료 환자" value="12명" helper="예약 기준" icon="calendar" />
        <StatCard
          label="현재 대기"
          value="4명"
          helper="평균 대기 18분"
          icon="users"
          tone="orange"
        />
        <StatCard label="진료 완료" value="3명" helper="진행률 25%" icon="check" tone="green" />
      </div>
      <section className="data-card doctor-list">
        <div className="card-title">
          <div>
            <h2>오늘의 대기 환자</h2>
            <p>현재 진료 중인 환자가 가장 먼저 표시됩니다.</p>
          </div>
          <span className="live">
            <i /> 실시간 현황
          </span>
        </div>
        <div className="current-patient">
          <div className="patient-order">진료 중</div>
          <EmptyAvatar name="박서준" />
          <div className="patient-name">
            <b>박서준</b>
            <span>만 52세 · 남성</span>
          </div>
          <div>
            <small>접수시간</small>
            <b>09:28</b>
          </div>
          <div>
            <small>주요 메모</small>
            <b>고혈압 약 복용 중</b>
          </div>
          <Button onClick={() => navigate("medical-record")}>
            진료 화면 열기 <Icon name="chevron" size={16} />
          </Button>
        </div>
        <div className="patient-list-head">
          <span>순서</span>
          <span>접수시간</span>
          <span>환자명</span>
          <span>나이 / 성별</span>
          <span>상태</span>
          <span></span>
        </div>
        {[
          ["1", "09:42", "김하늘", "만 34세 / 여성"],
          ["2", "10:03", "정유진", "만 28세 / 여성"],
          ["3", "10:17", "홍길동", "만 42세 / 남성"],
        ].map((r) => (
          <div className="patient-list-row" key={r[0]}>
            <span className="queue">{r[0]}</span>
            <b>{r[1]}</b>
            <span>
              <b>{r[2]}</b>
              <small>환자번호 100{r[0]}42</small>
            </span>
            <span>{r[3]}</span>
            <Badge tone="orange">대기</Badge>
            <Button variant="outline" onClick={() => navigate("medical-record")}>
              진료 시작
            </Button>
          </div>
        ))}
      </section>
    </>
  );
}
