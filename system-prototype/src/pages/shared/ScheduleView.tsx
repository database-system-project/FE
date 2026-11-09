import { useState } from "react";
import { scheduleRows } from "../../mocks/data";
import { Icon } from "../../components/Icon";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { EmptyAvatar } from "../../components/EmptyAvatar";
import { PageHeader } from "../../components/PageHeader";

export function ScheduleView({ editable = false }: { editable?: boolean }) {
  const [modal, setModal] = useState<"schedule" | "doctor" | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState("이정훈");
  const departmentByDoctor: Record<string, string> = {
    이정훈: "내과",
    김민서: "피부과",
    박현우: "소아청소년과",
  };
  const selectedDepartment = departmentByDoctor[selectedDoctor];
  const visibleSchedules = scheduleRows.map((row) => [
    selectedDoctor,
    selectedDepartment,
    ...row.slice(2),
  ]);
  return (
    <>
      <PageHeader
        title={editable ? "의사·일정 관리" : "진료 일정 조회"}
        description={
          editable
            ? "의사를 선택하여 예약 가능한 진료 일정을 등록·수정합니다."
            : "관리자가 등록한 본인의 진료 일정을 조회합니다."
        }
        actions={
          editable ? (
            <>
              <Button variant="outline" icon="plus" onClick={() => setModal("doctor")}>
                의사 등록
              </Button>
              <Button icon="plus" onClick={() => setModal("schedule")}>
                일정 등록
              </Button>
            </>
          ) : (
            <Badge tone="gray">조회 전용</Badge>
          )
        }
      />
      {editable && (
        <div className="schedule-doctor-picker">
          <span>의사 선택</span>
          {["이정훈 · 내과", "김민서 · 피부과", "박현우 · 소아청소년과"].map((doctor) => (
            <button
              key={doctor}
              className={doctor.startsWith(selectedDoctor) ? "active" : ""}
              onClick={() => setSelectedDoctor(doctor.split(" · ")[0])}
            >
              <EmptyAvatar name={doctor.split(" · ")[0]} />
              {doctor}
            </button>
          ))}
        </div>
      )}
      <div className="data-card">
        <div className="card-title schedule-title">
          <div>
            <h2>{selectedDoctor} 의사 일정</h2>
            <p>{selectedDepartment} · 2026년 11월</p>
          </div>
          {editable && (
            <span className="permission-note">
              <Icon name="shield" size={15} /> 관리자만 수정 가능
            </span>
          )}
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>의사명</th>
                <th>진료과</th>
                <th>진료일</th>
                <th>접수 시작시간</th>
                <th>진료 마감시간</th>
                <th>점심 시작시간</th>
                <th>점심 종료시간</th>
                <th>휴진 여부</th>
                {editable && <th></th>}
              </tr>
            </thead>
            <tbody>
              {visibleSchedules.map((row) => (
                <tr key={row[2]}>
                  {row.map((value, cell) => (
                    <td key={cell}>
                      {cell === 7 ? (
                        <Badge tone={value === "휴진" ? "gray" : "green"}>
                          {value === "휴진" ? "휴진" : "진료"}
                        </Badge>
                      ) : cell === 0 ? (
                        <b>{value}</b>
                      ) : (
                        value
                      )}
                    </td>
                  ))}
                  {editable && (
                    <td>
                      <Button variant="outline" onClick={() => setModal("schedule")}>
                        일정 수정
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {modal === "schedule" && (
        <div className="modal-layer">
          <div className="modal small-modal">
            <button className="modal-close" onClick={() => setModal(null)}>
              <Icon name="close" />
            </button>
            <span className="section-kicker">DOCTOR SCHEDULE</span>
            <h2>의사 일정 등록·수정</h2>
            <p>
              {selectedDoctor} 의사 · {selectedDepartment}
            </p>
            <label className="field">
              <span>날짜</span>
              <input type="date" defaultValue="2026-11-11" />
            </label>
            <div className="form-grid">
              <label className="field">
                <span>접수 시작시간</span>
                <input type="time" defaultValue="09:00" />
              </label>
              <label className="field">
                <span>진료 마감시간</span>
                <input type="time" defaultValue="17:30" />
              </label>
              <label className="field">
                <span>점심 시작시간</span>
                <input type="time" defaultValue="12:30" />
              </label>
              <label className="field">
                <span>점심 종료시간</span>
                <input type="time" defaultValue="13:30" />
              </label>
            </div>
            <label className="consent simple">
              <input type="checkbox" />
              <span>
                <b>휴진일로 설정</b>
                <small>예약이 존재하는 일정은 휴진으로 변경할 수 없습니다.</small>
              </span>
            </label>
            <div className="modal-actions">
              <Button variant="outline" onClick={() => setModal(null)}>
                취소
              </Button>
              <Button onClick={() => setModal(null)}>일정 저장</Button>
            </div>
          </div>
        </div>
      )}
      {modal === "doctor" && (
        <div className="modal-layer">
          <div className="modal small-modal">
            <button className="modal-close" onClick={() => setModal(null)}>
              <Icon name="close" />
            </button>
            <span className="section-kicker">DOCTOR REGISTRATION</span>
            <h2>의사 등록</h2>
            <p>관리자가 생성한 의사 계정과 진료과를 연결합니다.</p>
            <label className="field">
              <span>의사 계정</span>
              <select>
                <option>doctor05</option>
                <option>doctor06</option>
              </select>
            </label>
            <label className="field">
              <span>의사명</span>
              <input placeholder="이름을 입력하세요" />
            </label>
            <label className="field">
              <span>진료과</span>
              <select>
                <option>내과</option>
                <option>소아청소년과</option>
                <option>이비인후과</option>
                <option>피부과</option>
              </select>
            </label>
            <div className="modal-actions">
              <Button variant="outline" onClick={() => setModal(null)}>
                취소
              </Button>
              <Button onClick={() => setModal(null)}>의사 등록</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
