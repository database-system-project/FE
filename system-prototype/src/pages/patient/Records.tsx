import { Icon } from "../../components/Icon";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { PageHeader } from "../../components/PageHeader";

export function Records({ navigate }: { navigate: (s: string) => void }) {
  return (
    <>
      <PageHeader title="진료 내역" description="나의 외래 진료 기록을 확인할 수 있습니다." />
      <div className="record-list">
        {[
          ["2026.10.14", "내과", "이정훈", "급성 인두염 및 감기", "결제완료"],
          ["2026.07.21", "피부과", "김민서", "접촉성 피부염", "결제완료"],
        ].map((r, i) => (
          <div className="record-card" key={r[0]}>
            <div className="record-date">
              <b>{r[0].slice(5).replace(".", "월 ")}일</b>
              <small>{r[0].slice(0, 4)}년</small>
            </div>
            <div className="record-main">
              <div>
                <Badge tone="green">{r[4]}</Badge>
                <span>
                  {r[1]} · {r[2]} 의사
                </span>
              </div>
              <h3>{r[3]}</h3>
              <p>
                {i === 0
                  ? "목 통증, 미열 및 콧물 증상으로 내원하여 약물 치료를 진행했습니다."
                  : "팔 부위 발진과 가려움 증상으로 내원했습니다."}
              </p>
            </div>
            <div className="record-actions">
              <Button variant="outline" onClick={() => navigate("med-guide")}>
                복약 안내
              </Button>
              <Button variant="ghost" onClick={() => navigate("receipts")}>
                영수증 <Icon name="chevron" size={15} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
