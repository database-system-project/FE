import { useEffect, useMemo, useState } from "react";
import { Icon } from "../../components/Icon";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { EmptyAvatar } from "../../components/EmptyAvatar";
import { PageHeader } from "../../components/PageHeader";
import { ApiError } from "../../api/client";
import { patientApi } from "../../api/patient";
import { useApi } from "../../api/useApi";
import type { BookingDepartment, BookingDoctor, PatientAppointment } from "../../api/types";
import { addDays, dateKey, formatTime } from "../../utils/format";
import { rescheduleTarget } from "./rescheduleTarget";

/** 예약 가능 시각을 불러올 기간 (오늘부터 며칠) */
const RANGE_DAYS = 30;
const MORNING = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00"];
const AFTERNOON = ["13:30", "14:00", "14:30", "15:00", "15:30", "16:00"];
const WEEK = ["일", "월", "화", "수", "목", "금", "토"];

/** "2026-11-15" → "2026년 11월 15일 (일)" */
function dateLabel(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  const w = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return `${y}년 ${m}월 ${d}일 (${WEEK[w]})`;
}

export function Booking({ navigate }: { navigate: (s: string) => void }) {
  // "예약 변경"으로 들어온 경우 바꿀 예약. 읽은 뒤에는 비워서 다음에 "새 예약"으로 들어올 때 남지 않게 한다.
  // (개발 모드 StrictMode는 초기값 함수를 두 번 부르므로 비우는 건 effect에서 한다)
  const [changing] = useState<PatientAppointment | null>(() => rescheduleTarget.get());
  useEffect(() => rescheduleTarget.set(null), []);
  const [step, setStep] = useState(changing ? 3 : 1);
  const [dept, setDept] = useState<BookingDepartment | null>(
    changing ? { departmentId: changing.departmentId, name: changing.departmentName } : null,
  );
  const [doctor, setDoctor] = useState<BookingDoctor | null>(
    changing ? { doctorId: changing.doctorId, name: changing.doctorName, departmentId: changing.departmentId } : null,
  );
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState<{ scheduleId: number; startsAt: string } | null>(null);
  const [agreed, setAgreed] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<PatientAppointment | null>(null);

  const today = dateKey();
  const departments = useApi(() => patientApi.departments(), []);
  const doctors = useApi(
    () => (dept ? patientApi.doctors(dept.departmentId) : Promise.resolve({ items: [] })),
    [dept?.departmentId],
  );
  const availability = useApi(
    () => (doctor ? patientApi.availability(doctor.doctorId, today, addDays(today, RANGE_DAYS)) : Promise.resolve(null)),
    [doctor?.doctorId],
  );
  // 날짜 → { scheduleId, 가능한 시각("HH:mm") → ISO }
  const byDate = useMemo(() => {
    const map = new Map<string, { scheduleId: number; times: Map<string, string> }>();
    for (const day of availability.data?.items ?? []) {
      map.set(day.date, { scheduleId: day.scheduleId, times: new Map(day.slots.map((s) => [formatTime(s), s])) });
    }
    return map;
  }, [availability.data]);

  const progress = ["진료과", "의사", "날짜", "접수시간", "예약확인"];

  const confirm = async () => {
    if (!slot) return;
    setSaving(true);
    setError("");
    try {
      const result = changing
        ? (await patientApi.reschedule(changing.appointmentId, slot)).newAppointment
        : await patientApi.book(slot);
      setDone(result);
    } catch (e) {
      if (e instanceof ApiError && e.code === "SLOT_UNAVAILABLE") {
        setError("방금 다른 예약이 들어온 시간입니다. 다른 시간을 선택해 주세요.");
        setSlot(null);
        setStep(4);
        void availability.reload();
      } else if (e instanceof ApiError && e.code === "INVALID_APPOINTMENT_STATE") {
        setError("이미 접수됐거나 지난 예약이라 변경할 수 없습니다.");
      } else {
        setError(e instanceof ApiError ? e.message : "예약 중 문제가 발생했습니다.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (done)
    return (
      <div className="completion">
        <div className="success-icon">
          <Icon name="check" size={34} />
        </div>
        <span className="section-kicker">{changing ? "RESERVATION CHANGED" : "RESERVATION COMPLETE"}</span>
        <h1>{changing ? "예약이 변경되었습니다" : "예약이 완료되었습니다"}</h1>
        <p>예약한 접수 예정시간에 병원에 방문해 주세요.</p>
        <div className="confirm-ticket">
          <div>
            <small>예약번호</small>
            <b>{done.appointmentCode}</b>
          </div>
          <Badge>예약완료</Badge>
          <hr />
          <dl>
            <div>
              <dt>진료과</dt>
              <dd>{done.departmentName}</dd>
            </div>
            <div>
              <dt>담당 의사</dt>
              <dd>{done.doctorName} 의사</dd>
            </div>
            <div>
              <dt>예약일</dt>
              <dd>{dateLabel(dateKey(new Date(done.startsAt)))}</dd>
            </div>
            <div>
              <dt>접수 예정시간</dt>
              <dd>{formatTime(done.startsAt)}</dd>
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
        title={changing ? "예약 변경" : "진료 예약"}
        description={
          changing
            ? `${changing.appointmentCode} 예약의 날짜와 시간을 다시 선택해 주세요. 변경하면 기존 예약은 취소됩니다.`
            : "진료과부터 접수 예정시간까지 순서대로 선택해 주세요."
        }
      />
      <div className="stepper">
        {progress.map((label, i) => (
          <div key={label} className={`${step === i + 1 ? "current" : ""} ${step > i + 1 ? "done" : ""}`}>
            <span>{step > i + 1 ? <Icon name="check" size={14} /> : i + 1}</span>
            <b>{label}</b>
          </div>
        ))}
      </div>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="booking-card">
        {step === 1 && (
          <>
            <div className="booking-title">
              <span>STEP 1</span>
              <h2>진료과를 선택해 주세요</h2>
            </div>
            <div className="choice-grid">
              {(departments.data?.items ?? []).map((d) => (
                <button
                  key={d.departmentId}
                  onClick={() => {
                    setDept(d);
                    setDoctor(null);
                    setStep(2);
                  }}
                >
                  <span className="dept-icon">
                    <Icon name="logo" />
                  </span>
                  <b>{d.name}</b>
                  <small>담당 의사와 예약 가능 시간을 확인합니다</small>
                  <Icon name="chevron" />
                </button>
              ))}
            </div>
            <StepState loading={departments.loading} error={departments.error} empty={!departments.data?.items.length} text="예약할 수 있는 진료과가 없습니다." />
          </>
        )}
        {step === 2 && dept && (
          <>
            <div className="booking-title">
              <span>STEP 2</span>
              <h2>담당 의사를 선택해 주세요</h2>
              <button onClick={() => setStep(1)}>← 진료과 다시 선택</button>
            </div>
            <div className="doctor-choices">
              {(doctors.data?.items ?? []).map((d) => (
                <button
                  key={d.doctorId}
                  onClick={() => {
                    setDoctor(d);
                    setDate("");
                    setSlot(null);
                    setStep(3);
                  }}
                >
                  <EmptyAvatar name={d.name} doctor />
                  <span>
                    <b>{d.name} 의사</b>
                    <small>{dept.name}</small>
                  </span>
                  <Icon name="chevron" />
                </button>
              ))}
            </div>
            <StepState loading={doctors.loading} error={doctors.error} empty={!doctors.data?.items.length} text="이 진료과에 예약 가능한 의사가 없습니다." />
          </>
        )}
        {step === 3 && doctor && (
          <>
            <div className="booking-title">
              <span>STEP 3</span>
              <h2>예약 날짜를 선택해 주세요</h2>
              {!changing && <button onClick={() => setStep(2)}>← 의사 다시 선택</button>}
            </div>
            <Calendar
              today={today}
              available={byDate}
              selected={date}
              onSelect={(key) => {
                setDate(key);
                setSlot(null);
                setStep(4);
              }}
            />
            <StepState
              loading={availability.loading}
              error={availability.error}
              empty={byDate.size === 0}
              text={`앞으로 ${RANGE_DAYS}일 안에 예약 가능한 날짜가 없습니다.`}
            />
          </>
        )}
        {step === 4 && date && (
          <>
            <div className="booking-title">
              <span>STEP 4</span>
              <h2>접수 예정시간을 선택해 주세요</h2>
              <button onClick={() => setStep(3)}>← 날짜 다시 선택</button>
            </div>
            <div className="time-notice">
              <Icon name="warning" />
              <span>
                <b>예약 시간은 진료 시작 시간이 아닙니다.</b>
                <small>병원에 방문하여 접수할 예정시간이며, 진료는 접수 순서대로 진행됩니다.</small>
              </span>
            </div>
            {[
              ["오전", MORNING],
              ["오후", AFTERNOON],
            ].map(([label, times]) => (
              <div key={label as string}>
                <h3 className="time-label">{label}</h3>
                <div className="time-grid">
                  {(times as string[]).map((t) => {
                    const day = byDate.get(date);
                    const iso = day?.times.get(t);
                    return (
                      <button
                        key={t}
                        disabled={!iso}
                        className={slot?.startsAt === iso ? "selected" : ""}
                        onClick={() => {
                          if (!iso || !day) return;
                          setSlot({ scheduleId: day.scheduleId, startsAt: iso });
                          setError("");
                          setStep(5);
                        }}
                      >
                        {t}
                        {!iso && <small>예약마감</small>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </>
        )}
        {step === 5 && dept && doctor && slot && (
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
                  <dd>{dept.name}</dd>
                </div>
                <div>
                  <dt>담당 의사</dt>
                  <dd>{doctor.name} 의사</dd>
                </div>
                <div>
                  <dt>예약일</dt>
                  <dd>{dateLabel(date)}</dd>
                </div>
                <div>
                  <dt>접수 예정시간</dt>
                  <dd>{formatTime(slot.startsAt)}</dd>
                </div>
              </dl>
            </div>
            <label className="consent simple">
              <input id="booking-agree" type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
              <span>
                <b>예약 안내 및 취소 규정을 확인했습니다.</b>
                <small>예약 변경은 기존 예약 취소 후 새 예약으로 등록됩니다.</small>
              </span>
            </label>
            <div className="booking-actions">
              <Button variant="outline" onClick={() => setStep(4)}>
                이전
              </Button>
              <Button disabled={!agreed || saving} onClick={confirm}>
                {saving ? "처리 중…" : changing ? "예약 변경하기" : "예약 확정하기"}
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function StepState({ loading, error, empty, text }: { loading: boolean; error: string; empty: boolean; text: string }) {
  if (error) return <p className="table-state error">{error}</p>;
  if (loading) return <p className="table-state">불러오는 중…</p>;
  if (empty) return <p className="table-state">{text}</p>;
  return null;
}

/** 한 달 달력. 예약 가능한 날짜만 누를 수 있다 */
function Calendar({
  today,
  available,
  selected,
  onSelect,
}: {
  today: string;
  available: Map<string, unknown>;
  selected: string;
  onSelect: (key: string) => void;
}) {
  const [month, setMonth] = useState(today.slice(0, 7)); // "YYYY-MM"
  const [y, m] = month.split("-").map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const lastKey = addDays(today, RANGE_DAYS).slice(0, 7);
  const move = (delta: number) => {
    const d = new Date(Date.UTC(y, m - 1 + delta, 1));
    setMonth(d.toISOString().slice(0, 7));
  };
  return (
    <div className="calendar-box">
      <div className="calendar-head">
        <button onClick={() => move(-1)} disabled={month <= today.slice(0, 7)} aria-label="이전 달">
          ‹
        </button>
        <b>
          {y}년 {m}월
        </b>
        <button onClick={() => move(1)} disabled={month >= lastKey} aria-label="다음 달">
          ›
        </button>
      </div>
      <div className="week">
        {WEEK.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <div className="dates">
        {Array.from({ length: 42 }, (_, i) => i - first + 1).map((d, i) => {
          const inMonth = d >= 1 && d <= days;
          const key = `${month}-${String(d).padStart(2, "0")}`;
          const open = inMonth && available.has(key);
          return (
            <button key={i} disabled={!open} className={selected === key ? "selected" : ""} onClick={() => onSelect(key)}>
              {inMonth ? d : ""}
              {open && <small>예약가능</small>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
