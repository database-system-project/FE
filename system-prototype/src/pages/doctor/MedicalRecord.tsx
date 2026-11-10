import { Icon } from "../../components/Icon";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { EmptyAvatar } from "../../components/EmptyAvatar";
import { PageHeader } from "../../components/PageHeader";

export function MedicalRecord({ navigate }: { navigate: (s: string) => void }) {
  return (
    <>
      <PageHeader
        title="환자 진료기록"
        description="진료기록을 작성한 후 처방 단계로 진행하세요."
        actions={<Badge tone="mint">진료 중 · 09:35 시작</Badge>}
      />
      <div className="clinical-layout">
        <aside className="patient-panel">
          <div className="patient-profile">
            <EmptyAvatar name="박서준" />
            <div>
              <h2>박서준</h2>
              <p>환자번호 100086</p>
            </div>
          </div>
          <dl>
            <div>
              <dt>생년월일</dt>
              <dd>1974.03.18</dd>
            </div>
            <div>
              <dt>나이 / 성별</dt>
              <dd>만 52세 / 남성</dd>
            </div>
            <div>
              <dt>전화번호</dt>
              <dd>010-2345-6789</dd>
            </div>
          </dl>
          <div className="history-section">
            <h3>이전 진료 내역</h3>
            <div>
              <b>2026.11.01 · 내과</b>
              <span>고지혈증, 본태성 고혈압</span>
              <small>이정훈 의사</small>
            </div>
            <button>전체 내역 보기 →</button>
          </div>
          <div className="history-section">
            <h3>현재 복용 중인 약</h3>
            <div className="active-med">
              <Icon name="pill" size={18} />
              <span>
                <b>심바스타틴정 20mg</b>
                <small>11.01 처방 · 30일분 · 11.30 종료 예정</small>
              </span>
            </div>
            <Badge tone="orange">현재 복용 중</Badge>
          </div>
        </aside>
        <section className="clinical-form">
          <div className="card-title">
            <div>
              <h2>진료기록 입력</h2>
              <p>담당 의사만 작성 및 수정할 수 있습니다.</p>
            </div>
          </div>
          <label className="field">
            <span>
              증상 <i>*</i>
            </span>
            <textarea defaultValue="3일 전부터 시작된 기침과 가래, 인후통. 미열 동반. 야간에 기침이 심해 수면에 방해가 됨." />
          </label>
          <label className="field">
            <span>
              진단 <i>*</i>
            </span>
            <input defaultValue="급성 기관지염 의심" />
          </label>
          <label className="field">
            <span>
              진료 내용 <i>*</i>
            </span>
            <textarea
              className="large"
              defaultValue={
                "청진상 양측 폐음은 정상이며 천명음 없음. 인후부 경미한 발적 관찰됨.\n증상 완화를 위한 약물 치료 후 3일 뒤 경과 관찰하도록 안내함."
              }
            />
          </label>
          <div className="clinical-actions">
            <Button variant="outline">진료기록 저장</Button>
            <Button icon="pill" onClick={() => navigate("prescription")}>
              저장 후 처방 작성
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
