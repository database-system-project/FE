import { useState } from "react";
import { Icon } from "../../components/Icon";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { PageHeader } from "../../components/PageHeader";

export function Prescription({ navigate }: { navigate: (s: string) => void }) {
  const [added, setAdded] = useState(["아세트아미노펜정 500mg"]);
  const [warning, setWarning] = useState<"interaction" | "age" | null>(null);
  const [reason, setReason] = useState("");
  const [done, setDone] = useState(false);
  if (done)
    return (
      <div className="completion">
        <div className="success-icon">
          <Icon name="check" size={34} />
        </div>
        <h1>처방이 완료되었습니다</h1>
        <p>금기 확인 및 진료기록 저장이 완료되었습니다.</p>
        <div className="confirm-ticket mini">
          <div>
            <small>처방번호</small>
            <b>RX20261111-0037</b>
          </div>
          <Badge tone="green">처방완료</Badge>
          <hr />
          <dl>
            <div>
              <dt>환자</dt>
              <dd>{warning === "age" ? "김민준 (만 10세)" : "박서준 (100086)"}</dd>
            </div>
            <div>
              <dt>처방 약품</dt>
              <dd>{added.length}개 품목</dd>
            </div>
            <div>
              <dt>금기 기록</dt>
              <dd>{warning === "age" ? "연령금기 override 1건" : "병용금기 override 1건"}</dd>
            </div>
          </dl>
        </div>
        <Button onClick={() => navigate("doctor-home")}>대기 환자 목록으로</Button>
      </div>
    );
  return (
    <>
      <PageHeader
        title="처방 작성"
        description="박서준 · 만 52세 · 현재 복용약과 처방약의 금기를 자동 확인합니다."
        actions={
          <Button variant="outline" onClick={() => navigate("medical-record")}>
            진료기록으로
          </Button>
        }
      />
      <div className="rx-alert">
        <Icon name="shield" />
        <span>
          <b>DUR 금기 자동 확인</b>
          <small>처방 저장 시 병용금기와 환자 나이 기준 연령금기를 확인합니다.</small>
        </span>
        <Button
          variant="outline"
          onClick={() => {
            setReason("");
            setWarning("age");
          }}
        >
          연령금기 예시 보기
        </Button>
      </div>
      <div className="prescription-layout">
        <section className="drug-search">
          <h2>약품 검색</h2>
          <div className="search">
            <Icon name="search" />
            <input placeholder="약품명을 입력하세요" defaultValue="이트라코나졸" />
          </div>
          <div className="search-count">
            검색 결과 <b>2건</b>
          </div>
          {[
            ["이트라코나졸캡슐 100mg", "한국얀센", "진균 감염 치료"],
            ["이트라정 100mg", "대한약품", "피부 및 손발톱 진균증 치료"],
          ].map((d, i) => (
            <div className="drug-result" key={d[0]}>
              <div>
                <Badge tone="green">사용중</Badge>
                <h3>{d[0]}</h3>
                <small>{d[1]}</small>
                <p>{d[2]}</p>
              </div>
              <Button
                variant={added.includes(d[0]) ? "disabled" : "outline"}
                disabled={added.includes(d[0])}
                onClick={() => setAdded([...added, d[0]])}
              >
                {added.includes(d[0]) ? (
                  <>
                    <Icon name="check" size={15} /> 추가됨
                  </>
                ) : (
                  <>
                    <Icon name="plus" size={15} /> 처방에 추가
                  </>
                )}
              </Button>
            </div>
          ))}
        </section>
        <section className="rx-list">
          <div className="card-title">
            <div>
              <h2>현재 처방 약</h2>
              <p>약품별 복용 방법을 입력하세요.</p>
            </div>
            <Badge>{added.length}개 품목</Badge>
          </div>
          {added.map((name, i) => (
            <article className="rx-item" key={name}>
              <div className="rx-item-head">
                <span>{i + 1}</span>
                <div>
                  <h3>{name}</h3>
                  <small>{name.includes("이트라") ? "한국얀센" : "한미약품"}</small>
                </div>
                <button onClick={() => setAdded(added.filter((a) => a !== name))}>
                  <Icon name="close" size={17} />
                </button>
              </div>
              <div className="dose-grid">
                <label>
                  <span>1회 투약량</span>
                  <div>
                    <input defaultValue="1" />
                    <small>정</small>
                  </div>
                </label>
                <label>
                  <span>하루 횟수</span>
                  <select defaultValue={i === 0 ? "3" : "1"}>
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                  </select>
                </label>
                <label>
                  <span>투여 간격</span>
                  <select>
                    <option>매일</option>
                    <option>2일마다</option>
                  </select>
                </label>
                <label>
                  <span>총 투약일수</span>
                  <div>
                    <input defaultValue={i === 0 ? "3" : "7"} />
                    <small>일</small>
                  </div>
                </label>
                <label>
                  <span>복용 시점</span>
                  <select>
                    <option>식후</option>
                    <option>식전</option>
                    <option>취침 전</option>
                  </select>
                </label>
                <label className="directions">
                  <span>복용 방법</span>
                  <input defaultValue="충분한 물과 함께 복용하세요." />
                </label>
              </div>
            </article>
          ))}
          <div className="rx-actions">
            <Button
              icon="shield"
              onClick={() => {
                setReason("");
                setWarning("interaction");
              }}
              disabled={added.length < 2}
            >
              금기 확인 후 처방 저장
            </Button>
          </div>
        </section>
        <aside className="current-meds">
          <div className="card-title">
            <div>
              <h2>현재 복용 중 약</h2>
              <p>다른 진료 처방 포함</p>
            </div>
            <Badge tone="orange">1건</Badge>
          </div>
          <div className="current-med-card">
            <span className="med-pill">
              <Icon name="pill" />
            </span>
            <div>
              <h3>심바스타틴정 20mg</h3>
              <p>고지혈증 치료제</p>
              <dl>
                <div>
                  <dt>처방일</dt>
                  <dd>2026.11.01</dd>
                </div>
                <div>
                  <dt>투약기간</dt>
                  <dd>30일분</dd>
                </div>
                <div>
                  <dt>복용 종료</dt>
                  <dd>2026.11.30</dd>
                </div>
              </dl>
              <Badge tone="orange">현재 복용 중</Badge>
            </div>
          </div>
          <div className="current-note">
            <Icon name="warning" size={16} /> 투약 종료일이 지나지 않은 처방만 표시됩니다.
          </div>
        </aside>
      </div>
      {warning && (
        <div className="modal-layer">
          <div className="modal warning-modal">
            <button className="modal-close" onClick={() => setWarning(null)}>
              <Icon name="close" />
            </button>
            <div className="warning-icon">
              <Icon name="warning" size={30} />
            </div>
            <span className="warning-label">DUR SAFETY ALERT</span>
            <h2>
              {warning === "interaction"
                ? "병용금기 약품이 확인되었습니다."
                : "연령금기 약품이 확인되었습니다."}
            </h2>
            <p>
              {warning === "interaction"
                ? "현재 처방 약과 환자가 복용 중인 약의 병용금기를 확인했습니다."
                : "환자의 만 나이를 기준으로 연령금기를 확인했습니다."}
            </p>
            {warning === "interaction" ? (
              <div className="conflict-box">
                <div>
                  <small>현재 처방 약</small>
                  <b>이트라코나졸캡슐 100mg</b>
                </div>
                <span>+</span>
                <div>
                  <small>현재 복용 중인 약</small>
                  <b>심바스타틴정 20mg</b>
                </div>
              </div>
            ) : (
              <div className="age-conflict-box">
                <div>
                  <small>환자 나이</small>
                  <b>김민준 · 2016.06.15 · 만 10세</b>
                </div>
                <div>
                  <small>처방 약품</small>
                  <b>코데인 함유 진해제 시럽</b>
                </div>
                <div>
                  <small>금기 기준</small>
                  <b>12세 미만</b>
                </div>
              </div>
            )}
            <div className="risk-content">
              <b>
                <Icon name="warning" size={17} /> 금기 내용
              </b>
              <p>
                {warning === "interaction"
                  ? "동시 복용 시 근육 손상 위험이 증가할 수 있습니다."
                  : "소아 호흡 억제 위험"}
              </p>
            </div>
            <label className="field">
              <span>
                금기 처방 사유 <i>*</i>
              </span>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="금기 약품을 그대로 처방해야 하는 임상적 사유를 입력하세요."
              />
              <small className={reason ? "valid" : "required"}>
                {reason ? (
                  <>
                    <Icon name="check" size={13} /> 사유가 입력되었습니다.
                  </>
                ) : (
                  "사유 입력 없이는 처방을 진행할 수 없습니다."
                )}
              </small>
            </label>
            <div className="modal-actions">
              <Button variant="outline" onClick={() => setWarning(null)}>
                약 변경
              </Button>
              <Button variant="danger" disabled={!reason.trim()} onClick={() => setDone(true)}>
                사유 입력 후 그대로 처방
              </Button>
            </div>
            <p className="override-note">
              <Icon name="shield" size={15} /> 금기 종류, 관련 약품, 금기 내용, 처방 강행 사유, 담당
              의사, 기록 시각이 금기 확인 기록에 저장됩니다.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
