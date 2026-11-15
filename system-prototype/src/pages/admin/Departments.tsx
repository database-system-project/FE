import { useState, type FormEvent } from "react";
import { Icon } from "../../components/Icon";
import { Button } from "../../components/Button";
import { PageHeader } from "../../components/PageHeader";
import { TableState } from "../../components/TableState";
import { adminApi } from "../../api/admin";
import { useApi } from "../../api/useApi";
import type { Department } from "../../api/types";
import {
  ActiveBadge,
  ActiveCheckbox,
  ActiveFilter,
  type ActiveFilterValue,
  activeParam,
  changedFields,
  errorText,
  FormModal,
} from "./shared";

const errors = { DUPLICATE_DEPARTMENT_NAME: "같은 이름의 진료과가 이미 있습니다 (사용중지 포함). 기존 진료과를 다시 사용하세요." };

export function Departments() {
  const [keyword, setKeyword] = useState("");
  const [query, setQuery] = useState({ keyword: "", active: "all" as ActiveFilterValue });
  const { data, loading, error, reload } = useApi(
    async () => {
      const [departments, doctors] = await Promise.all([
        adminApi.departments({ keyword: query.keyword || undefined, active: activeParam(query.active) }),
        adminApi.doctors(),
      ]);
      return { departments: departments.items, doctors: doctors.items };
    },
    [query],
  );
  const [editing, setEditing] = useState<Department | "new" | null>(null);
  const [notice, setNotice] = useState("");

  const rows = data?.departments ?? [];
  const doctorCount = (id: number) => (data?.doctors ?? []).filter((d) => d.departmentId === id && d.active).length;

  const search = (e: FormEvent) => {
    e.preventDefault();
    setQuery({ ...query, keyword: keyword.trim() });
  };

  return (
    <>
      <PageHeader
        title="진료과 관리"
        description="환자 예약에 노출되는 진료과를 관리합니다. 진료과는 삭제하지 않고 사용중지합니다."
        actions={
          <Button icon="plus" onClick={() => setEditing("new")}>
            진료과 등록
          </Button>
        }
      />
      <form className="toolbar" onSubmit={search}>
        <div className="search">
          <Icon name="search" />
          <input placeholder="진료과명" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
        </div>
        <ActiveFilter value={query.active} onChange={(active) => setQuery({ ...query, active })} />
        <Button type="submit" variant="outline">
          검색
        </Button>
      </form>
      {notice && <p className="form-notice">{notice}</p>}
      <div className="data-card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>진료과 번호</th>
                <th>진료과명</th>
                <th>소속 의사</th>
                <th>사용상태</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => (
                <tr key={d.departmentId}>
                  <td className="code">{d.departmentId}</td>
                  <td>
                    <b>{d.name}</b>
                  </td>
                  <td>{doctorCount(d.departmentId)}명</td>
                  <td>
                    <ActiveBadge active={d.active} />
                  </td>
                  <td>
                    <button className="text-link" onClick={() => setEditing(d)}>
                      수정
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <TableState loading={loading} error={error} empty={rows.length === 0} emptyText="조건에 맞는 진료과가 없습니다." />
        </div>
      </div>
      {editing && (
        <DepartmentModal
          target={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={(text) => {
            setEditing(null);
            setNotice(text);
            void reload();
          }}
        />
      )}
    </>
  );
}

function DepartmentModal({
  target,
  onClose,
  onSaved,
}: {
  target: Department | null;
  onClose: () => void;
  onSaved: (notice: string) => void;
}) {
  const [form, setForm] = useState({ name: target?.name ?? "", active: target?.active ?? true });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    const name = form.name.trim();
    if (!name || name.length > 50) return setError("진료과명을 50자 이내로 입력해 주세요.");
    setBusy(true);
    setError("");
    try {
      if (!target) {
        await adminApi.createDepartment({ name, active: form.active });
        onSaved(`${name} 진료과를 등록했습니다.`);
      } else {
        const body = changedFields({ name: target.name, active: target.active }, { name, active: form.active });
        if (Object.keys(body).length === 0) return onClose();
        await adminApi.updateDepartment(target.departmentId, body);
        onSaved(`${name} 진료과를 수정했습니다.`);
      }
    } catch (e) {
      setError(errorText(e, errors));
    } finally {
      setBusy(false);
    }
  };

  return (
    <FormModal
      kicker={target ? "EDIT DEPARTMENT" : "NEW DEPARTMENT"}
      title={target ? "진료과 수정" : "새 진료과 등록"}
      description="사용중지한 진료과는 신규 예약에서 빠지고, 기존 진료 기록은 유지됩니다."
      error={error}
      busy={busy}
      submitLabel={target ? "저장" : "등록"}
      onClose={onClose}
      onSubmit={() => void submit()}
    >
      <label className="field">
        <span>
          진료과명 <i>*</i>
        </span>
        <input value={form.name} maxLength={50} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </label>
      <ActiveCheckbox
        checked={form.active}
        onChange={(active) => setForm({ ...form, active })}
        label="사용"
        help="체크를 해제하면 환자 예약 화면에 나오지 않습니다."
      />
    </FormModal>
  );
}
