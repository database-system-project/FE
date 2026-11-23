import { Icon } from "../../components/Icon";
import { Button } from "../../components/Button";
import type { PrescriptionPrint, PrintItem } from "../../api/types";
import { formatDate, timingLabel } from "../../utils/format";

// 약품명을 표시하고, 이전 백엔드 응답에 이름이 없으면 번호로 대체한다.
const medicationLabel = (item: PrintItem) => item.medicationName ?? `약품 #${item.medicationId}`;
const intervalLabel = (days: number) => (days === 1 ? "매일" : `${days}일마다`);

/** 처방전 출력 문서. GET /billing/visits/{visitId}/prescription-print 응답을 그대로 받는다 */
export function PrescriptionDocument({ data, close }: { data: PrescriptionPrint; close: () => void }) {
  const items = data.prescriptions.flatMap((p) => p.items);
  const first = data.prescriptions[0];
  const withDirections = items.filter((item) => item.instructions.trim());

  return (
    <div className="document-page prescription-doc">
      <div className="doc-brand">
        <span className="brand-mark">
          <Icon name="logo" />
        </span>
        <span>
          <b>온케어의원</b>
          <small>ONCARE CLINIC</small>
        </span>
      </div>
      <h1>처 방 전</h1>
      <p className="doc-number">처방번호 {data.prescriptions.map((p) => p.prescriptionId).join(", ")}</p>
      <div className="doc-rule" />
      <dl className="doc-details two">
        <div>
          <dt>환자명</dt>
          <dd>{data.patient.name}</dd>
        </div>
        <div>
          <dt>처방일</dt>
          <dd>{formatDate(first?.prescribedAt)}</dd>
        </div>
        <div>
          <dt>환자번호</dt>
          <dd>{data.patient.patientId}</dd>
        </div>
        <div>
          <dt>생년월일</dt>
          <dd>{formatDate(data.patient.birthDate)}</dd>
        </div>
        <div>
          <dt>진료과</dt>
          <dd>{data.doctor.departmentName}</dd>
        </div>
        <div>
          <dt>담당 의사</dt>
          <dd>{data.doctor.name} 의사</dd>
        </div>
      </dl>
      <table className="doc-table">
        <thead>
          <tr>
            <th>약품명</th>
            <th>1회</th>
            <th>하루</th>
            <th>간격</th>
            <th>일수</th>
            <th>시점</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={`${item.medicationId}-${i}`}>
              <td>{medicationLabel(item)}</td>
              <td>
                {item.dosePerIntake}
                {item.doseUnit}
              </td>
              <td>{item.timesPerDay}회</td>
              <td>{intervalLabel(item.intervalDays)}</td>
              <td>{item.durationDays}일</td>
              <td>{timingLabel[item.timing]}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {withDirections.length > 0 && (
        <div className="directions-box">
          <b>복용 방법</b>
          {withDirections.map((item, i) => (
            <p key={`${item.medicationId}-${i}`}>
              {medicationLabel(item)}: {item.instructions}
            </p>
          ))}
        </div>
      )}
      <div className="doctor-sign">
        처방의사 <b>{data.doctor.name}</b> (서명)
      </div>
      <div className="document-actions">
        <Button variant="outline" onClick={close}>
          닫기
        </Button>
        <Button icon="print" onClick={() => window.print()}>
          처방전 인쇄
        </Button>
      </div>
    </div>
  );
}
