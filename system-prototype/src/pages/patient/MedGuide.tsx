import { useState } from "react";
import { Icon } from "../../components/Icon";
import { Badge } from "../../components/Badge";
import { PageHeader } from "../../components/PageHeader";
import { TableState } from "../../components/TableState";
import { patientApi } from "../../api/patient";
import { useApi } from "../../api/useApi";
import type { MedGuideItem } from "../../api/types";
import { dateKey, formatDate, medicationEndDate, timingLabel } from "../../utils/format";
import { activePrescriptions, historySelection, loadHistory } from "./history";

/** 가장 늦게 끝나는 약 기준으로 아직 복용 기간이면 "복용 중" */
function takingNow(prescribedAt: string, items: MedGuideItem[]) {
  const longest = Math.max(...items.map((i) => i.durationDays));
  return medicationEndDate(prescribedAt, longest) >= dateKey();
}

/** "2026년 11월 15일" */
function koreanDate(iso: string) {
  const [y, m, d] = dateKey(new Date(iso)).split("-").map(Number);
  return `${y}년 ${m}월 ${d}일`;
}

const text = (v: string | null) => (v && v.trim() ? v : "정보 없음");

export function MedGuide() {
  const history = useApi(loadHistory, []);
  const list = activePrescriptions(history.data ?? []);
  // 진료 내역에서 고르고 들어오면 그 처방, 메뉴로 들어오면 가장 최근 처방
  const [picked, setPicked] = useState<number | null>(() => historySelection.takePrescription());
  const selectedId = picked ?? list[0]?.prescriptionId ?? null;
  const selected = list.find((p) => p.prescriptionId === selectedId);
  const guide = useApi(
    () => (selectedId ? patientApi.medGuide(selectedId) : Promise.resolve(null)),
    [selectedId],
  );
  const g = guide.data?.prescriptionId === selectedId ? guide.data : null;

  return (
    <>
      <PageHeader title="처방·복약 안내" description="처방받은 약의 효능과 나에게 맞는 복용 방법을 확인하세요." />
      {list.length > 1 && (
        <label className="field rx-picker">
          <span>처방 선택</span>
          <select value={selectedId ?? ""} onChange={(e) => setPicked(Number(e.target.value))}>
            {list.map((p) => (
              <option key={p.prescriptionId} value={p.prescriptionId}>
                {formatDate(p.prescribedAt)} · {p.visit.departmentName} {p.visit.doctorName} 의사 (처방 #{p.prescriptionId})
              </option>
            ))}
          </select>
        </label>
      )}
      {selected && (
        <div className="prescription-summary">
          <div>
            <span className="prescription-icon">
              <Icon name="pill" />
            </span>
            <div>
              <small>처방번호 {selected.prescriptionId}</small>
              <h3>{koreanDate(selected.prescribedAt)} 처방</h3>
              <p>
                {selected.visit.departmentName} · {selected.visit.doctorName} 의사
              </p>
            </div>
          </div>
          {g && (takingNow(g.prescribedAt, g.items) ? <Badge tone="mint">복용 중</Badge> : <Badge tone="green">복용 완료</Badge>)}
        </div>
      )}
      {g && (
        <div className="medicine-cards">
          {g.items.map((m, i) => (
            <article className="medicine-card" key={m.medicationId}>
              <div className="med-head">
                <span>{i + 1}</span>
                <div>
                  <h3>{m.name}</h3>
                  <small>
                    {m.durationDays}일분 · ~{formatDate(medicationEndDate(g.prescribedAt, m.durationDays))}까지
                  </small>
                </div>
              </div>
              <div className="med-info-grid">
                <div>
                  <b>주요 효능</b>
                  <p>{text(m.efficacy)}</p>
                </div>
                <div>
                  <b>사용법</b>
                  <p>{text(m.usage)}</p>
                </div>
                <div>
                  <b>주의사항</b>
                  <p>{text(m.precautions)}</p>
                </div>
                <div>
                  <b>보관방법</b>
                  <p>{text(m.storage)}</p>
                </div>
              </div>
              <div className="my-dose">
                <h4>
                  <Icon name="pill" size={18} /> 내 복용 방법
                </h4>
                <div>
                  <span>
                    <small>1회 복용량</small>
                    <b>
                      {m.dosePerIntake}
                      {m.doseUnit}
                    </b>
                  </span>
                  <span>
                    <small>복용 횟수</small>
                    <b>
                      {m.intervalDays > 1 ? `${m.intervalDays}일마다 ` : "하루 "}
                      {m.timesPerDay}회
                    </b>
                  </span>
                  <span>
                    <small>복용 기간</small>
                    <b>{m.durationDays}일</b>
                  </span>
                  <span>
                    <small>복용 시점</small>
                    <b>{timingLabel[m.timing]}</b>
                  </span>
                </div>
                <p>
                  <b>의사 안내</b>
                  {m.instructions}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
      <TableState
        loading={history.loading || guide.loading}
        error={history.error || guide.error}
        empty={!g}
        emptyText="받은 처방이 없습니다."
      />
    </>
  );
}
