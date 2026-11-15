import { Icon } from "../../components/Icon";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { PageHeader } from "../../components/PageHeader";
import { useAuth } from "../../auth/AuthContext";
import { patientApi } from "../../api/patient";
import { useApi } from "../../api/useApi";
import { dateKey, formatDate, formatTime } from "../../utils/format";
import { feeTypeLabel } from "../shared/Receipt";
import { activePrescriptions, historySelection, loadHistory } from "./history";

const WEEKDAY = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];

export function PatientHome({ navigate }: { navigate: (s: string) => void }) {
  const { user } = useAuth();
  const upcoming = useApi(() => patientApi.appointments({ period: "UPCOMING" }), []);
  // 목록은 최신순(내림차순)이라 가장 가까운 예약은 맨 뒤
  const items = upcoming.data?.items ?? [];
  const next = items.length ? items[items.length - 1] : null;
  const day = next ? dateKey(new Date(next.startsAt)) : "";
  const [y, m, d] = day ? day.split("-").map(Number) : [0, 0, 0];
  const weekday = day ? WEEKDAY[new Date(Date.UTC(y, m - 1, d)).getUTCDay()] : "";
  return (
    <>
      <PageHeader
        title={`안녕하세요, ${user?.name ?? ""}님`}
        description="오늘도 건강한 하루 보내세요. 예정된 진료 일정을 확인해 주세요."
      />
      <div className="patient-hero">
        <div className="next-appointment">
          <div className="card-head">
            <div>
              <span className="section-kicker">NEXT APPOINTMENT</span>
              <h2>다음 예약</h2>
            </div>
            {next && <Badge>예약완료</Badge>}
          </div>
          {next ? (
            <>
              <div className="appointment-date">
                <strong>{d}</strong>
                <span>
                  {y}년 {m}월
                  <br />
                  <b>{weekday}</b>
                </span>
              </div>
              <div className="appointment-info">
                <div>
                  <small>진료과 / 담당 의사</small>
                  <b>
                    {next.departmentName} · {next.doctorName} 의사
                  </b>
                </div>
                <div>
                  <small>접수 예정시간</small>
                  <b>{formatTime(next.startsAt)}</b>
                </div>
              </div>
              <div className="appointment-notice">
                <Icon name="clock" size={17} /> 예약한 접수 예정시간에 병원에 방문해 주세요.
              </div>
              <Button onClick={() => navigate("reservations")}>
                예약 상세 보기 <Icon name="chevron" size={16} />
              </Button>
            </>
          ) : (
            <>
              <p className="table-state">{upcoming.loading ? "불러오는 중…" : upcoming.error || "예정된 예약이 없습니다."}</p>
              <Button onClick={() => navigate("booking")}>
                진료 예약하기 <Icon name="chevron" size={16} />
              </Button>
            </>
          )}
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
      <RecentCards navigate={navigate} />
    </>
  );
}

/** 최근 진료·처방·결제 한 건씩 */
async function loadRecent() {
  const history = await loadHistory();
  const latestVisit = history[0] ?? null;
  const latestRx = activePrescriptions(history)[0] ?? null;
  const paid = history.find((v) => v.paymentId !== null);
  const [guide, receipt] = await Promise.all([
    latestRx ? patientApi.medGuide(latestRx.prescriptionId) : null,
    paid ? patientApi.receipt(paid.paymentId!) : null,
  ]);
  return { latestVisit, latestRx, guide, receipt };
}

function RecentCards({ navigate }: { navigate: (s: string) => void }) {
  const { data, loading, error } = useApi(loadRecent, []);
  if (!data) return <p className="table-state">{error || (loading ? "불러오는 중…" : "")}</p>;
  const { latestVisit: v, latestRx: rx, guide, receipt } = data;
  const longest = guide ? Math.max(...guide.items.map((i) => i.durationDays)) : 0;
  return (
    <div className="summary-cards">
      <button onClick={() => navigate("records")}>
        <span className="summary-top">
          <Icon name="file" /> 최근 진료
        </span>
        <b>{v ? (v.detail.medicalRecord?.diagnosis ?? "진료기록 없음") : "진료 내역 없음"}</b>
        <small>{v ? `${formatDate(v.visitDate)} · ${v.departmentName} ${v.doctorName}` : "진료를 받으면 여기에 표시됩니다"}</small>
        <span className="link">상세 보기 →</span>
      </button>
      <button
        onClick={() => {
          if (rx) historySelection.setPrescription(rx.prescriptionId);
          navigate("med-guide");
        }}
      >
        <span className="summary-top mint">
          <Icon name="pill" /> 최근 처방
        </span>
        <b>
          {guide && guide.items.length
            ? `${guide.items[0].name}${guide.items.length > 1 ? ` 외 ${guide.items.length - 1}건` : ""}`
            : "처방 없음"}
        </b>
        <small>{rx && guide ? `${longest}일분 · ${formatDate(rx.prescribedAt)} 처방` : "처방을 받으면 여기에 표시됩니다"}</small>
        <span className="link">복약 안내 보기 →</span>
      </button>
      <button
        onClick={() => {
          if (receipt) historySelection.setPayment(receipt.paymentId);
          navigate("receipts");
        }}
      >
        <span className="summary-top green">
          <Icon name="receipt" /> 결제/영수증
        </span>
        <b>{receipt ? `${receipt.amount.toLocaleString("ko-KR")}원` : "결제 내역 없음"}</b>
        <small>{receipt ? `${feeTypeLabel[receipt.feeType]} 진찰료 · 결제완료` : "수납 후 영수증을 볼 수 있습니다"}</small>
        <span className="link">영수증 보기 →</span>
      </button>
    </div>
  );
}
