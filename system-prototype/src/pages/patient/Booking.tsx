import { useState } from "react";
import { Icon } from "../../components/Icon";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { EmptyAvatar } from "../../components/EmptyAvatar";
import { PageHeader } from "../../components/PageHeader";

export function Booking({ navigate }: { navigate: (s: string) => void }) {
  const [step, setStep] = useState(1);
  const [dept, setDept] = useState("");
  const [doctor, setDoctor] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [complete, setComplete] = useState(false);
  const progress = ["진료과", "의사", "날짜", "접수시간", "예약확인"];
  const select = (setter: (v: string) => void, value: string) => {
    setter(value);
    setTimeout(() => setStep(Math.min(step + 1, 5)), 120);
  };
  if (complete)
    return (
      <div className="completion">
        <div className="success-icon">
          <Icon name="check" size={34} />
        </div>
        <span className="section-kicker">RESERVATION COMPLETE</span>
        <h1>예약이 완료되었습니다</h1>
        <p>예약한 접수 예정시간에 병원에 방문해 주세요.</p>
        <div className="confirm-ticket">
          <div>
            <small>예약번호</small>
            <b>R20261111-042</b>
          </div>
          <Badge>예약완료</Badge>
          <hr />
          <dl>
            <div>
              <dt>진료과</dt>
              <dd>{dept || "내과"}</dd>
            </div>
            <div>
              <dt>담당 의사</dt>
              <dd>{doctor || "이정훈 의사"}</dd>
            </div>
            <div>
              <dt>예약일</dt>
              <dd>{date || "2026년 11월 11일 (수)"}</dd>
            </div>
            <div>
              <dt>접수 예정시간</dt>
              <dd>{time || "오전 10:30"}</dd>
            </div>
          </dl>
        </div>
        <div className="completion-actions">
          <Button variant="outline" onClick={() => navigate("patient-home")}>
            홈으로
          </Button>
          <Button onClick={() => navigate("reservations")}>예약 조회</Button>
        </div>
      </div>
    );
  return (
    <>
      <PageHeader
        title="진료 예약"
        description="진료과부터 접수 예정시간까지 순서대로 선택해 주세요."
      />
      <div className="stepper">
        {progress.map((label, i) => (
          <div
            key={label}
            className={`${step === i + 1 ? "current" : ""} ${step > i + 1 ? "done" : ""}`}
          >
            <span>{step > i + 1 ? <Icon name="check" size={14} /> : i + 1}</span>
            <b>{label}</b>
          </div>
        ))}
      </div>
      <div className="booking-card">
        {step === 1 && (
          <>
            <div className="booking-title">
              <span>STEP 1</span>
              <h2>진료과를 선택해 주세요</h2>
            </div>
            <div className="choice-grid">
              {["내과", "소아청소년과", "이비인후과", "피부과"].map((d, i) => (
                <button key={d} onClick={() => select(setDept, d)}>
                  <span className="dept-icon">
                    <Icon
                      name={i === 0 ? "logo" : i === 1 ? "users" : i === 2 ? "file" : "shield"}
                    />
                  </span>
                  <b>{d}</b>
                  <small>
                    {
                      [
                        "감기, 소화기, 만성질환",
                        "소아 질환 및 성장 상담",
                        "귀·코·목 질환",
                        "피부 질환 및 알레르기",
                      ][i]
                    }
                  </small>
                  <Icon name="chevron" />
                </button>
              ))}
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <div className="booking-title">
              <span>STEP 2</span>
              <h2>담당 의사를 선택해 주세요</h2>
              <button onClick={() => setStep(1)}>← 진료과 다시 선택</button>
            </div>
            <div className="doctor-choices">
              {["이정훈", "김민서", "박현우"].map((d, i) => (
                <button key={d} onClick={() => select(setDoctor, `${d} 의사`)}>
                  <EmptyAvatar name={d} doctor />
                  <span>
                    <b>{d} 의사</b>
                    <small>
                      {dept || "내과"} · {d} 의사
                    </small>
                    <Badge tone={i === 2 ? "gray" : "green"}>
                      {i === 2 ? "오늘 마감" : "오늘 예약 가능"}
                    </Badge>
                  </span>
                  <Icon name="chevron" />
                </button>
              ))}
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <div className="booking-title">
              <span>STEP 3</span>
              <h2>예약 날짜를 선택해 주세요</h2>
            </div>
            <div className="calendar-box">
              <div className="calendar-head">
                <button>‹</button>
                <b>2026년 11월</b>
                <button>›</button>
              </div>
              <div className="week">
                <span>일</span>
                <span>월</span>
                <span>화</span>
                <span>수</span>
                <span>목</span>
                <span>금</span>
                <span>토</span>
              </div>
              <div className="dates">
                {Array.from({ length: 35 }, (_, i) => i - 1).map((d, i) => (
                  <button
                    key={i}
                    disabled={d < 1 || d < 8}
                    className={d === 11 ? "selected" : ""}
                    onClick={() => select(setDate, `2026년 11월 ${d}일`)}
                  >
                    {d > 0 && d <= 30 ? d : ""}
                    {d === 11 && <small>예약가능</small>}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
        {step === 4 && (
          <>
            <div className="booking-title">
              <span>STEP 4</span>
              <h2>접수 예정시간을 선택해 주세요</h2>
            </div>
            <div className="time-notice">
              <Icon name="warning" />
              <span>
                <b>예약 시간은 진료 시작 시간이 아닙니다.</b>
                <small>병원에 방문하여 접수할 예정시간이며, 진료는 접수 순서대로 진행됩니다.</small>
              </span>
            </div>
            <h3 className="time-label">오전</h3>
            <div className="time-grid">
              {["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"].map((t, i) => (
                <button
                  disabled={[1, 4].includes(i)}
                  className={time === t ? "selected" : ""}
                  onClick={() => select(setTime, t)}
                  key={t}
                >
                  {t}
                  {[1, 4].includes(i) && <small>예약마감</small>}
                </button>
              ))}
            </div>
            <h3 className="time-label">오후</h3>
            <div className="time-grid">
              {["14:00", "14:30", "15:00", "15:30", "16:00", "16:30"].map((t, i) => (
                <button disabled={i === 2} onClick={() => select(setTime, t)} key={t}>
                  {t}
                  {i === 2 && <small>예약마감</small>}
                </button>
              ))}
            </div>
          </>
        )}
        {step === 5 && (
          <>
            <div className="booking-title">
              <span>STEP 5</span>
              <h2>예약 내용을 확인해 주세요</h2>
            </div>
            <div className="review-card">
              <div className="review-icon">
                <Icon name="calendar" />
              </div>
              <dl>
                <div>
                  <dt>진료과</dt>
                  <dd>{dept || "내과"}</dd>
                </div>
                <div>
                  <dt>담당 의사</dt>
                  <dd>{doctor || "이정훈 의사"}</dd>
                </div>
                <div>
                  <dt>예약일</dt>
                  <dd>{date || "2026년 11월 11일"}</dd>
                </div>
                <div>
                  <dt>접수 예정시간</dt>
                  <dd>{time || "10:30"}</dd>
                </div>
              </dl>
            </div>
            <label className="consent simple">
              <input type="checkbox" defaultChecked />
              <span>
                <b>예약 안내 및 취소 규정을 확인했습니다.</b>
                <small>예약 변경은 기존 예약 취소 후 새 예약으로 등록됩니다.</small>
              </span>
            </label>
            <div className="booking-actions">
              <Button variant="outline" onClick={() => setStep(4)}>
                이전
              </Button>
              <Button onClick={() => setComplete(true)}>예약 확정하기</Button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
