import { useState } from "react";
import { Button } from "../../components/Button";
import { PageHeader } from "../../components/PageHeader";
import { TableState } from "../../components/TableState";
import { adminApi } from "../../api/admin";
import { useApi } from "../../api/useApi";
import type { StaffAccount, StaffRole } from "../../api/types";
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

export const staffRoleLabel: Record<StaffRole, string> = {
  DOCTOR: "의사",
  RECEPTION: "원무 직원",
  CASHIER: "수납 담당자",
  ADMIN: "관리자",
};
const roles = Object.keys(staffRoleLabel) as StaffRole[];

const errors = {
  LOGIN_ID_TAKEN: "이미 사용 중인 아이디입니다 (사용중지·환자 계정 포함). 다른 아이디를 입력해 주세요.",
  ACCOUNT_ROLE_CONFLICT: "의사 프로필이 연결된 계정은 의사 외 역할로 바꿀 수 없습니다.",
  LAST_ACTIVE_ADMIN: "마지막 활성 관리자 계정은 사용중지하거나 역할을 바꿀 수 없습니다.",
};

export function Accounts() {
  const [role, setRole] = useState<StaffRole | "all">("all");
  const [active, setActive] = useState<ActiveFilterValue>("all");
  const { data, loading, error, reload } = useApi(
    () => adminApi.staffAccounts({ role: role === "all" ? undefined : role, active: activeParam(active) }),
    [role, active],
  );
  const [editing, setEditing] = useState<StaffAccount | "new" | null>(null);
  const [notice, setNotice] = useState("");
  const rows = data?.items ?? [];

  return (
    <>
      <PageHeader
        title="사용자 계정 관리"
        description="직원 계정의 역할과 사용 상태를 관리합니다. 환자 계정은 회원가입으로만 만들어지며 여기서 관리하지 않습니다."
        actions={
          <Button icon="plus" onClick={() => setEditing("new")}>
            직원 계정 등록
          </Button>
        }
      />
      <div className="toolbar">
        <select value={role} onChange={(e) => setRole(e.target.value as StaffRole | "all")} aria-label="역할">
          <option value="all">전체 역할</option>
          {roles.map((r) => (
            <option key={r} value={r}>
              {staffRoleLabel[r]}
            </option>
          ))}
        </select>
        <ActiveFilter value={active} onChange={setActive} />
      </div>
      {notice && <p className="form-notice">{notice}</p>}
      <div className="data-card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>계정 ID</th>
                <th>이름</th>
                <th>역할</th>
                <th>상태</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.accountId}>
                  <td className="code">{a.loginId}</td>
                  <td>
                    <b>{a.name}</b>
                  </td>
                  <td>{staffRoleLabel[a.role]}</td>
                  <td>
                    <ActiveBadge active={a.active} />
                  </td>
                  <td>
                    <button className="text-link" onClick={() => setEditing(a)}>
                      수정
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <TableState loading={loading} error={error} empty={rows.length === 0} emptyText="조건에 맞는 계정이 없습니다." />
        </div>
      </div>
      {editing && (
        <AccountModal
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

function AccountModal({
  target,
  onClose,
  onSaved,
}: {
  target: StaffAccount | null;
  onClose: () => void;
  onSaved: (notice: string) => void;
}) {
  const [form, setForm] = useState({
    loginId: target?.loginId ?? "",
    initialPassword: "",
    name: target?.name ?? "",
    role: target?.role ?? ("RECEPTION" as StaffRole),
    active: target?.active ?? true,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    const name = form.name.trim();
    if (!name || name.length > 50) return setError("이름을 50자 이내로 입력해 주세요.");
    if (!target) {
      if (!form.loginId.trim() || form.loginId.trim().length > 50) return setError("아이디를 50자 이내로 입력해 주세요.");
      if (form.initialPassword.length < 8 || form.initialPassword.length > 72)
        return setError("초기 비밀번호는 8~72자로 입력해 주세요.");
    }
    setBusy(true);
    setError("");
    try {
      if (!target) {
        await adminApi.createStaffAccount({
          loginId: form.loginId.trim(),
          initialPassword: form.initialPassword,
          name,
          role: form.role,
          active: form.active,
        });
        onSaved(
          form.role === "DOCTOR"
            ? `${name} 계정을 만들었습니다. 의사·일정 관리에서 의사로 등록해야 진료 화면을 쓸 수 있습니다.`
            : `${name} 계정을 만들었습니다.`,
        );
      } else {
        const body = changedFields(
          { name: target.name, role: target.role, active: target.active },
          { name, role: form.role, active: form.active },
        );
        if (Object.keys(body).length === 0) return onClose();
        await adminApi.updateStaffAccount(target.accountId, body);
        onSaved(`${name} 계정을 수정했습니다.`);
      }
    } catch (e) {
      setError(errorText(e, errors));
    } finally {
      setBusy(false);
    }
  };

  return (
    <FormModal
      kicker={target ? "EDIT ACCOUNT" : "NEW STAFF ACCOUNT"}
      title={target ? "직원 계정 수정" : "직원 계정 등록"}
      description={
        target
          ? "아이디와 비밀번호는 바꿀 수 없습니다. 사용중지하면 즉시 로그인할 수 없습니다."
          : "의사 계정은 만든 뒤 의사·일정 관리에서 진료과와 연결합니다."
      }
      error={error}
      busy={busy}
      submitLabel={target ? "저장" : "등록"}
      onClose={onClose}
      onSubmit={() => void submit()}
    >
      <label className="field">
        <span>
          로그인 ID <i>*</i>
        </span>
        <input
          value={form.loginId}
          maxLength={50}
          disabled={!!target}
          autoComplete="off"
          onChange={(e) => setForm({ ...form, loginId: e.target.value })}
        />
      </label>
      {!target && (
        <label className="field">
          <span>
            초기 비밀번호 <i>*</i>
          </span>
          <input
            type="password"
            value={form.initialPassword}
            maxLength={72}
            autoComplete="new-password"
            placeholder="8~72자"
            onChange={(e) => setForm({ ...form, initialPassword: e.target.value })}
          />
        </label>
      )}
      <div className="form-grid">
        <label className="field">
          <span>
            이름 <i>*</i>
          </span>
          <input value={form.name} maxLength={50} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <label className="field">
          <span>역할</span>
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as StaffRole })}>
            {roles.map((r) => (
              <option key={r} value={r}>
                {staffRoleLabel[r]}
              </option>
            ))}
          </select>
        </label>
      </div>
      <ActiveCheckbox checked={form.active} onChange={(active) => setForm({ ...form, active })} label="사용" />
    </FormModal>
  );
}
