import { Icon } from "../../components/Icon";
import { Badge } from "../../components/Badge";
import { medicationName } from "../../api/doctor";
import type { CurrentMedication } from "../../api/types";
import { formatDate, medicationEndDate } from "../../utils/format";

/** 진료기록 화면 왼쪽의 "현재 복용 중인 약" 목록 */
export function CurrentMedicationList({ items }: { items: CurrentMedication[] }) {
  if (items.length === 0)
    return (
      <div>
        <b>복용 중인 약이 없습니다</b>
        <small>다른 진료에서 받은 유효 처방이 없습니다.</small>
      </div>
    );
  return (
    <>
      {items.map((m) => (
        <div className="active-med" key={`${m.prescriptionId}-${m.medicationId}`}>
          <Icon name="pill" size={18} />
          <span>
            <b>{medicationName(m.medicationId)}</b>
            <small>
              {formatDate(m.prescribedAt).slice(5)} 처방 · {m.durationDays}일분 ·{" "}
              {formatDate(medicationEndDate(m.prescribedAt, m.durationDays)).slice(5)} 종료 예정
            </small>
          </span>
        </div>
      ))}
      <Badge tone="orange">현재 복용 중 {items.length}건</Badge>
    </>
  );
}
