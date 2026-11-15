import { useState } from "react";
import { Icon } from "../../components/Icon";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { PageHeader } from "../../components/PageHeader";
import { TableState } from "../../components/TableState";
import { ApiError } from "../../api/client";
import { adminApi } from "../../api/admin";
import { useApi } from "../../api/useApi";
import type { FeeType } from "../../api/types";
import { addDays, dateKey, formatDate } from "../../utils/format";
import { errorText, FormModal } from "./shared";

export const feeTypeLabel: Record<FeeType, string> = { FIRST_VISIT: "초진", FOLLOW_UP: "재진" };
const feeTypes = Object.keys(feeTypeLabel) as FeeType[];

/** 현행 요금. 한 유형이라도 설정이 없으면 서버가 409 FEE_NOT_CONFIGURED와 빠진 유형을 준다 */
async function loadFees() {
  try {
    const { items } = await adminApi.fees();
    return { items, missing: [] as FeeType[] };
  } catch (e) {
    if (e instanceof ApiError && e.code === "FEE_NOT_CONFIGURED")
      return { items: [], missing: ((e.details?.feeTypes as FeeType[]) ?? feeTypes) };
    throw e;
  }
}

export function Fees() {
  const { data, loading, error, reload } = useApi(loadFees, []);
  const [modal, setModal] = useState(false);
  const [notice, setNotice] = useState("");
  const rows = data?.items ?? [];

  return (
    <>
      <PageHeader
        title="진찰료 관리"
        description="초진·재진 진찰료를 관리합니다."
        actions={
          <Button icon="plus" onClick={() => setModal(true)}>
            진찰료 변경
          </Button>
        }
      />
      <div className="info-banner">
        <Icon name="receipt" />
        <span>
          <b>이력 기반 진찰료 관리</b>
          <small>
            기존 금액은 고치지 않고 새 금액을 추가합니다. 적용 시작일이 지나면 새 금액이 현행 요금이 되고, 이미 결제된
            금액은 바뀌지 않습니다.
          </small>
        </span>
      </div>
      {notice && <p className="form-notice">{notice}</p>}
      {data && data.missing.length > 0 && (
        <p className="form-error">
          {data.missing.map((t) => feeTypeLabel[t]).join("·")} 진찰료가 설정되지 않아 수납할 수 없습니다. 진찰료 변경에서
          금액을 등록해 주세요.
        </p>
      )}
      <div className="data-card">
        <div className="card-title">
          <div>
            <h2>현행 진찰료</h2>
            <p>오늘 결제에 적용되는 금액입니다. 적용 예정인 새 금액은 시작일부터 반영됩니다.</p>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>진찰료 구분</th>
                <th>금액</th>
                <th>적용 시작일</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((f) => (
                <tr key={f.feeId}>
                  <td>
                    <b>{feeTypeLabel[f.feeType]}</b>
                  </td>
                  <td>
                    <b>{f.amount.toLocaleString("ko-KR")}원</b>
                  </td>
                  <td>{formatDate(f.effectiveFrom)}</td>
                  <td>
                    <Badge tone="green">적용중</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <TableState
            loading={loading}
            error={error}
            empty={rows.length === 0}
            emptyText="설정된 진찰료가 없습니다."
          />
        </div>
      </div>
      {modal && (
        <FeeModal
          onClose={() => setModal(false)}
          onSaved={(text) => {
            setModal(false);
            setNotice(text);
            void reload();
          }}
        />
      )}
    </>
  );
}

function FeeModal({ onClose, onSaved }: { onClose: () => void; onSaved: (notice: string) => void }) {
  const [form, setForm] = useState({ feeType: "FIRST_VISIT" as FeeType, amount: "", date: addDays(dateKey(), 1) });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    const amount = Number(form.amount);
    if (!/^\d+$/.test(form.amount.trim()) || amount <= 0 || amount > 2147483647)
      return setError("금액을 1원 이상의 정수로 입력해 주세요.");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.date)) return setError("적용 시작일을 선택해 주세요.");
    setBusy(true);
    setError("");
    try {
      // 적용 시작일 0시(한국 시간)부터 적용
      await adminApi.changeFee({ feeType: form.feeType, amount, effectiveFrom: `${form.date}T00:00:00+09:00` });
      const when = form.date <= dateKey() ? "바로 적용됩니다" : `${formatDate(form.date)}부터 적용됩니다`;
      onSaved(`${feeTypeLabel[form.feeType]} 진찰료 ${amount.toLocaleString("ko-KR")}원을 등록했습니다. ${when}.`);
    } catch (e) {
      setError(errorText(e, { DUPLICATE_FEE_EFFECTIVE_FROM: "같은 구분·적용 시작일의 진찰료가 이미 있습니다. 다른 날짜를 선택해 주세요." }));
    } finally {
      setBusy(false);
    }
  };

  return (
    <FormModal
      kicker="FEE REVISION"
      title="진찰료 변경"
      description="새 금액은 적용 시작일부터 사용되며 기존 이력은 유지됩니다."
      error={error}
      busy={busy}
      submitLabel="변경 예약"
      onClose={onClose}
      onSubmit={() => void submit()}
    >
      <label className="field">
        <span>진찰료 구분</span>
        <select value={form.feeType} onChange={(e) => setForm({ ...form, feeType: e.target.value as FeeType })}>
          {feeTypes.map((t) => (
            <option key={t} value={t}>
              {feeTypeLabel[t]}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>
          변경 금액 <i>*</i>
        </span>
        <div className="input-suffix">
          <input inputMode="numeric" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <span>원</span>
        </div>
      </label>
      <label className="field">
        <span>적용 시작일</span>
        <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
      </label>
    </FormModal>
  );
}
