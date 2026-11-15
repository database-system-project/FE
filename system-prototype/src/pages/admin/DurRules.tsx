import { useMemo, useState } from "react";
import { Button } from "../../components/Button";
import { PageHeader } from "../../components/PageHeader";
import { TableState } from "../../components/TableState";
import { adminApi } from "../../api/admin";
import { useApi } from "../../api/useApi";
import type { AgeContraindication, AgeOperator, DrugInteraction, Medication } from "../../api/types";
import { errorText, FormModal } from "./shared";

// 병용금기·연령금기 기준 관리. 금기 기준은 비활성화 기능이 없고, 복합키(약품)는 수정할 수 없다.

type Kind = "interactions" | "age-rules";

const operatorLabel: Record<AgeOperator, string> = { LT: "미만", LTE: "이하" };
const errors = {
  DUPLICATE_DUR_RULE: "같은 기준이 이미 등록되어 있습니다. 기존 기준의 내용을 수정해 주세요.",
  NOT_FOUND: "선택한 약품을 찾을 수 없습니다. 목록을 새로고침해 주세요.",
};

async function load(kind: Kind, medicationId: number | null) {
  const filter = medicationId ? { medicationId } : {};
  const [meds, rules] = await Promise.all([
    adminApi.medications(), // 약품명 표시용 (금기 응답에는 ID만 온다)
    kind === "interactions" ? adminApi.interactions(filter) : adminApi.ageRules(filter),
  ]);
  return { meds: meds.items, rules: rules.items as (DrugInteraction | AgeContraindication)[] };
}

export function DurRules({ kind }: { kind: Kind }) {
  const isPair = kind === "interactions";
  const [medicationId, setMedicationId] = useState<number | null>(null);
  const { data, loading, error, reload } = useApi(() => load(kind, medicationId), [kind, medicationId]);
  const [editing, setEditing] = useState<DrugInteraction | AgeContraindication | "new" | null>(null);
  const [notice, setNotice] = useState("");

  const meds = data?.meds ?? [];
  const nameOf = useMemo(() => {
    const map = new Map(meds.map((m) => [m.medicationId, m]));
    return (id: number) => map.get(id)?.name ?? `약품 #${id}`;
  }, [meds]);
  const rows = data?.rules ?? [];

  return (
    <>
      <PageHeader
        title={isPair ? "병용금기 관리" : "연령금기 관리"}
        description={
          isPair
            ? "두 약품의 동시 복용 위험 기준을 관리합니다. 의사의 처방 저장 전 금기 확인에 사용됩니다."
            : "환자 만 나이를 기준으로 처방 제한 조건을 관리합니다. 의사의 처방 저장 전 금기 확인에 사용됩니다."
        }
        actions={
          <Button icon="plus" onClick={() => setEditing("new")}>
            {isPair ? "병용금기 등록" : "연령금기 등록"}
          </Button>
        }
      />
      <div className="toolbar">
        <MedicationSelect
          meds={meds}
          value={medicationId}
          onChange={setMedicationId}
          placeholder="전체 약품"
          ariaLabel="약품으로 거르기"
        />
      </div>
      {notice && <p className="form-notice">{notice}</p>}
      <div className="data-card">
        <div className="table-wrap">
          <table>
            <thead>
              {isPair ? (
                <tr>
                  <th>약품 A</th>
                  <th>약품 B</th>
                  <th>금기 내용</th>
                  <th></th>
                </tr>
              ) : (
                <tr>
                  <th>약품</th>
                  <th>기준 나이</th>
                  <th>조건</th>
                  <th>금기 내용</th>
                  <th></th>
                </tr>
              )}
            </thead>
            <tbody>
              {rows.map((r) =>
                r.type === "INTERACTION" ? (
                  <tr key={`${r.medicationAId}-${r.medicationBId}`}>
                    <td>
                      <b>{nameOf(r.medicationAId)}</b>
                    </td>
                    <td>
                      <b>{nameOf(r.medicationBId)}</b>
                    </td>
                    <td>{r.message}</td>
                    <td>
                      <button className="text-link" onClick={() => setEditing(r)}>
                        수정
                      </button>
                    </td>
                  </tr>
                ) : (
                  <tr key={`${r.medicationId}-${r.ageSeq}`}>
                    <td>
                      <b>{nameOf(r.medicationId)}</b>
                    </td>
                    <td>만 {r.ageLimit}세</td>
                    <td>{operatorLabel[r.ageOperator]}</td>
                    <td>{r.message}</td>
                    <td>
                      <button className="text-link" onClick={() => setEditing(r)}>
                        수정
                      </button>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
          <TableState loading={loading} error={error} empty={rows.length === 0} emptyText="등록된 금기 기준이 없습니다." />
        </div>
      </div>
      {editing &&
        (isPair ? (
          <InteractionModal
            target={editing === "new" ? null : (editing as DrugInteraction)}
            meds={meds}
            nameOf={nameOf}
            onClose={() => setEditing(null)}
            onSaved={(text) => {
              setEditing(null);
              setNotice(text);
              void reload();
            }}
          />
        ) : (
          <AgeRuleModal
            target={editing === "new" ? null : (editing as AgeContraindication)}
            meds={meds}
            nameOf={nameOf}
            onClose={() => setEditing(null)}
            onSaved={(text) => {
              setEditing(null);
              setNotice(text);
              void reload();
            }}
          />
        ))}
    </>
  );
}

/** 약품 선택. 등록할 때는 사용중인 약품만, 거르기에는 전체 */
function MedicationSelect({
  meds,
  value,
  onChange,
  placeholder,
  ariaLabel,
  activeOnly = false,
}: {
  meds: Medication[];
  value: number | null;
  onChange: (id: number | null) => void;
  placeholder: string;
  ariaLabel?: string;
  activeOnly?: boolean;
}) {
  const options = activeOnly ? meds.filter((m) => m.active) : meds;
  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
      aria-label={ariaLabel}
    >
      <option value="">{placeholder}</option>
      {options.map((m) => (
        <option key={m.medicationId} value={m.medicationId}>
          {m.name} ({m.itemSeq}){m.active ? "" : " · 사용중지"}
        </option>
      ))}
    </select>
  );
}

function InteractionModal({
  target,
  meds,
  nameOf,
  onClose,
  onSaved,
}: {
  target: DrugInteraction | null;
  meds: Medication[];
  nameOf: (id: number) => string;
  onClose: () => void;
  onSaved: (notice: string) => void;
}) {
  const [a, setA] = useState<number | null>(target?.medicationAId ?? null);
  const [b, setB] = useState<number | null>(target?.medicationBId ?? null);
  const [message, setMessage] = useState(target?.message ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    const text = message.trim();
    if (!target && (!a || !b)) return setError("두 약품을 모두 선택해 주세요.");
    if (!target && a === b) return setError("서로 다른 두 약품을 선택해 주세요.");
    if (!text) return setError("금기 내용을 입력해 주세요.");
    setBusy(true);
    setError("");
    try {
      if (!target) {
        await adminApi.createInteraction({ medicationAId: a!, medicationBId: b!, message: text });
        onSaved(`${nameOf(a!)} + ${nameOf(b!)} 병용금기를 등록했습니다.`);
      } else {
        if (text === target.message) return onClose();
        await adminApi.updateInteraction(target.medicationAId, target.medicationBId, text);
        onSaved("병용금기 내용을 수정했습니다.");
      }
    } catch (e) {
      setError(errorText(e, errors));
    } finally {
      setBusy(false);
    }
  };

  return (
    <FormModal
      kicker={target ? "EDIT INTERACTION" : "NEW INTERACTION"}
      title={target ? "병용금기 수정" : "새 병용금기 등록"}
      description={
        target ? "약품 조합은 바꿀 수 없습니다. 다른 조합은 새로 등록해 주세요." : "순서와 관계없이 같은 조합으로 저장됩니다."
      }
      error={error}
      busy={busy}
      submitLabel={target ? "저장" : "등록"}
      onClose={onClose}
      onSubmit={() => void submit()}
    >
      {target ? (
        <div className="conflict-box">
          <div>
            <small>약품 A</small>
            <b>{nameOf(target.medicationAId)}</b>
          </div>
          <span>+</span>
          <div>
            <small>약품 B</small>
            <b>{nameOf(target.medicationBId)}</b>
          </div>
        </div>
      ) : (
        <>
          <label className="field">
            <span>
              약품 A <i>*</i>
            </span>
            <MedicationSelect meds={meds} value={a} onChange={setA} placeholder="약품 선택" activeOnly />
          </label>
          <label className="field">
            <span>
              약품 B <i>*</i>
            </span>
            <MedicationSelect meds={meds} value={b} onChange={setB} placeholder="약품 선택" activeOnly />
          </label>
        </>
      )}
      <label className="field">
        <span>
          금기 내용 <i>*</i>
        </span>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="예: 동시 복용 시 출혈 위험 증가" />
      </label>
    </FormModal>
  );
}

function AgeRuleModal({
  target,
  meds,
  nameOf,
  onClose,
  onSaved,
}: {
  target: AgeContraindication | null;
  meds: Medication[];
  nameOf: (id: number) => string;
  onClose: () => void;
  onSaved: (notice: string) => void;
}) {
  const [medicationId, setMedicationId] = useState<number | null>(target?.medicationId ?? null);
  const [form, setForm] = useState({
    ageLimit: target ? String(target.ageLimit) : "",
    ageOperator: target?.ageOperator ?? ("LT" as AgeOperator),
    message: target?.message ?? "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    const ageLimit = Number(form.ageLimit);
    const message = form.message.trim();
    if (!target && !medicationId) return setError("약품을 선택해 주세요.");
    if (!/^\d+$/.test(form.ageLimit.trim()) || ageLimit > 32767) return setError("기준 나이를 0 이상의 정수로 입력해 주세요.");
    if (!message) return setError("금기 내용을 입력해 주세요.");
    setBusy(true);
    setError("");
    try {
      if (!target) {
        await adminApi.createAgeRule({ medicationId: medicationId!, ageLimit, ageOperator: form.ageOperator, message });
        onSaved(`${nameOf(medicationId!)} 연령금기를 등록했습니다.`);
      } else {
        const body: Partial<{ ageLimit: number; ageOperator: AgeOperator; message: string }> = {};
        if (ageLimit !== target.ageLimit) body.ageLimit = ageLimit;
        if (form.ageOperator !== target.ageOperator) body.ageOperator = form.ageOperator;
        if (message !== target.message) body.message = message;
        if (Object.keys(body).length === 0) return onClose();
        await adminApi.updateAgeRule(target.medicationId, target.ageSeq, body);
        onSaved("연령금기 기준을 수정했습니다.");
      }
    } catch (e) {
      setError(errorText(e, errors));
    } finally {
      setBusy(false);
    }
  };

  return (
    <FormModal
      kicker={target ? "EDIT AGE RULE" : "NEW AGE RULE"}
      title={target ? "연령금기 수정" : "새 연령금기 등록"}
      description="처방일 기준 환자의 만 나이로 판단합니다."
      error={error}
      busy={busy}
      submitLabel={target ? "저장" : "등록"}
      onClose={onClose}
      onSubmit={() => void submit()}
    >
      <label className="field">
        <span>
          약품 <i>*</i>
        </span>
        {target ? (
          <input value={nameOf(target.medicationId)} disabled />
        ) : (
          <MedicationSelect meds={meds} value={medicationId} onChange={setMedicationId} placeholder="약품 선택" activeOnly />
        )}
      </label>
      <div className="form-grid">
        <label className="field">
          <span>
            기준 나이 <i>*</i>
          </span>
          <div className="input-suffix">
            <input
              inputMode="numeric"
              value={form.ageLimit}
              onChange={(e) => setForm({ ...form, ageLimit: e.target.value })}
            />
            <span>세</span>
          </div>
        </label>
        <label className="field">
          <span>조건</span>
          <select value={form.ageOperator} onChange={(e) => setForm({ ...form, ageOperator: e.target.value as AgeOperator })}>
            <option value="LT">미만</option>
            <option value="LTE">이하</option>
          </select>
        </label>
      </div>
      <label className="field">
        <span>
          금기 내용 <i>*</i>
        </span>
        <textarea
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="예: 소아 호흡 억제 위험"
        />
      </label>
    </FormModal>
  );
}
