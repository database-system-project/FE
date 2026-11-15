import { useState, type FormEvent } from "react";
import { Icon } from "../../components/Icon";
import { Button } from "../../components/Button";
import { PageHeader } from "../../components/PageHeader";
import { TableState } from "../../components/TableState";
import { adminApi } from "../../api/admin";
import { useApi } from "../../api/useApi";
import type { Medication } from "../../api/types";
import {
  ActiveBadge,
  ActiveCheckbox,
  ActiveFilter,
  type ActiveFilterValue,
  activeParam,
  blankToNull,
  changedFields,
  errorText,
  FormModal,
} from "./shared";

const errors = { DUPLICATE_ITEM_SEQ: "같은 품목기준코드의 약품이 이미 있습니다 (사용중지 포함). 기존 약품을 수정해 주세요." };
const guideFields = [
  ["efficacy", "효능"],
  ["usage", "사용법"],
  ["precautions", "주의사항"],
  ["storage", "보관법"],
] as const;

export function Medicines() {
  const [keyword, setKeyword] = useState("");
  const [query, setQuery] = useState({ keyword: "", active: "all" as ActiveFilterValue });
  const { data, loading, error, reload } = useApi(
    () => adminApi.medications({ keyword: query.keyword || undefined, active: activeParam(query.active) }),
    [query],
  );
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editing, setEditing] = useState<Medication | "new" | null>(null);
  const [notice, setNotice] = useState("");
  const rows = data?.items ?? [];
  const selected = rows.find((m) => m.medicationId === selectedId) ?? null;

  const search = (e: FormEvent) => {
    e.preventDefault();
    setQuery({ ...query, keyword: keyword.trim() });
  };

  return (
    <>
      <PageHeader
        title="약품 관리"
        description="처방과 복약 안내에 사용하는 약품 기준정보를 관리합니다. 사용중지한 약품은 새 처방 후보에서 빠집니다."
        actions={
          <Button icon="plus" onClick={() => setEditing("new")}>
            약품 등록
          </Button>
        }
      />
      <form className="toolbar" onSubmit={search}>
        <div className="search">
          <Icon name="search" />
          <input placeholder="제품명 또는 품목기준코드" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
        </div>
        <ActiveFilter value={query.active} onChange={(active) => setQuery({ ...query, active })} />
        <Button type="submit" variant="outline">
          검색
        </Button>
      </form>
      {notice && <p className="form-notice">{notice}</p>}
      {selected && (
        <div className="medicine-detail-preview">
          <div>
            <span className="section-kicker">SELECTED MEDICINE</span>
            <h3>{selected.name}</h3>
            <p>
              품목기준코드 {selected.itemSeq} · {selected.companyName}
            </p>
            <div className="detail-actions">
              <ActiveBadge active={selected.active} />
              <Button variant="outline" onClick={() => setEditing(selected)}>
                수정
              </Button>
              <button className="text-link" onClick={() => setSelectedId(null)}>
                닫기
              </button>
            </div>
          </div>
          <dl>
            {guideFields.map(([key, label]) => (
              <div key={key}>
                <dt>{label}</dt>
                <dd>{selected[key] ?? "-"}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
      <div className="data-card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>품목기준코드</th>
                <th>제품명</th>
                <th>업체명</th>
                <th>주요 효능</th>
                <th>사용상태</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => (
                <tr key={m.medicationId} className={m.medicationId === selectedId ? "selected-row" : ""}>
                  <td className="code">{m.itemSeq}</td>
                  <td>
                    <b>{m.name}</b>
                  </td>
                  <td>{m.companyName}</td>
                  <td className="ellipsis-cell">{m.efficacy ?? "-"}</td>
                  <td>
                    <ActiveBadge active={m.active} />
                  </td>
                  <td>
                    <button className="text-link" onClick={() => setSelectedId(m.medicationId)}>
                      상세
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <TableState loading={loading} error={error} empty={rows.length === 0} emptyText="조건에 맞는 약품이 없습니다." />
        </div>
      </div>
      {editing && (
        <MedicineModal
          target={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={(saved, text) => {
            setEditing(null);
            setNotice(text);
            setSelectedId(saved.medicationId);
            // 저장한 약품이 현재 검색 조건에 안 걸릴 수 있어서, 그 약품의 코드로 다시 조회해 바로 보이게 한다
            setKeyword(saved.itemSeq);
            if (query.keyword === saved.itemSeq && query.active === "all") void reload();
            else setQuery({ keyword: saved.itemSeq, active: "all" });
          }}
        />
      )}
    </>
  );
}

function MedicineModal({
  target,
  onClose,
  onSaved,
}: {
  target: Medication | null;
  onClose: () => void;
  onSaved: (saved: Medication, notice: string) => void;
}) {
  const [form, setForm] = useState({
    itemSeq: target?.itemSeq ?? "",
    name: target?.name ?? "",
    companyName: target?.companyName ?? "",
    efficacy: target?.efficacy ?? "",
    usage: target?.usage ?? "",
    precautions: target?.precautions ?? "",
    storage: target?.storage ?? "",
    active: target?.active ?? true,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    const itemSeq = form.itemSeq.trim();
    const name = form.name.trim();
    const companyName = form.companyName.trim();
    if (!target && (!itemSeq || itemSeq.length > 20)) return setError("품목기준코드를 20자 이내로 입력해 주세요.");
    if (!name || name.length > 200) return setError("제품명을 200자 이내로 입력해 주세요.");
    if (!companyName || companyName.length > 100) return setError("업체명을 100자 이내로 입력해 주세요.");
    const next = {
      name,
      companyName,
      efficacy: blankToNull(form.efficacy),
      usage: blankToNull(form.usage),
      precautions: blankToNull(form.precautions),
      storage: blankToNull(form.storage),
      active: form.active,
    };
    setBusy(true);
    setError("");
    try {
      if (!target) {
        const saved = await adminApi.createMedication({ itemSeq, ...next });
        onSaved(saved, `${name}을(를) 등록했습니다.`);
      } else {
        const body = changedFields(
          {
            name: target.name,
            companyName: target.companyName,
            efficacy: target.efficacy,
            usage: target.usage,
            precautions: target.precautions,
            storage: target.storage,
            active: target.active,
          },
          next,
        );
        if (Object.keys(body).length === 0) return onClose();
        const saved = await adminApi.updateMedication(target.medicationId, body);
        onSaved(saved, `${name}을(를) 수정했습니다.`);
      }
    } catch (e) {
      setError(errorText(e, errors));
    } finally {
      setBusy(false);
    }
  };

  return (
    <FormModal
      kicker={target ? "EDIT MEDICINE" : "NEW MEDICINE"}
      title={target ? "약품 수정" : "약품 등록"}
      description={target ? "품목기준코드는 바꿀 수 없습니다." : "공공데이터의 품목기준코드로 등록합니다."}
      error={error}
      busy={busy}
      submitLabel={target ? "저장" : "등록"}
      onClose={onClose}
      onSubmit={() => void submit()}
    >
      <div className="form-grid">
        <label className="field">
          <span>
            품목기준코드 <i>*</i>
          </span>
          <input
            value={form.itemSeq}
            maxLength={20}
            disabled={!!target}
            onChange={(e) => setForm({ ...form, itemSeq: e.target.value })}
          />
        </label>
        <label className="field">
          <span>
            업체명 <i>*</i>
          </span>
          <input value={form.companyName} maxLength={100} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
        </label>
        <label className="field full">
          <span>
            제품명 <i>*</i>
          </span>
          <input value={form.name} maxLength={200} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        {guideFields.map(([key, label]) => (
          <label className="field full" key={key}>
            <span>{label}</span>
            <textarea value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
          </label>
        ))}
      </div>
      <ActiveCheckbox
        checked={form.active}
        onChange={(active) => setForm({ ...form, active })}
        label="사용"
        help="체크를 해제하면 새 처방 후보에서 빠집니다. 과거 처방 기록은 유지됩니다."
      />
    </FormModal>
  );
}
