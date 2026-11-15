import { type FormEvent, type ReactNode } from "react";
import { Icon } from "../../components/Icon";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { ApiError } from "../../api/client";

// 관리자 화면들이 같이 쓰는 작은 조각들

/** 사용 여부 배지 */
export function ActiveBadge({ active }: { active: boolean }) {
  return <Badge tone={active ? "green" : "gray"}>{active ? "사용중" : "사용중지"}</Badge>;
}

export type ActiveFilterValue = "all" | "true" | "false";

/** 목록의 사용 상태 필터. API에는 boolean 또는 생략으로 보낸다 */
export function ActiveFilter({ value, onChange }: { value: ActiveFilterValue; onChange: (v: ActiveFilterValue) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value as ActiveFilterValue)} aria-label="사용 상태">
      <option value="all">전체 상태</option>
      <option value="true">사용중</option>
      <option value="false">사용중지</option>
    </select>
  );
}

export const activeParam = (v: ActiveFilterValue) => (v === "all" ? undefined : v === "true");

/** 등록·수정 모달 공통 틀 */
export function FormModal({
  kicker,
  title,
  description,
  error,
  busy,
  submitLabel,
  onClose,
  onSubmit,
  children,
}: {
  kicker: string;
  title: string;
  description?: string;
  error?: string;
  busy?: boolean;
  submitLabel: string;
  onClose: () => void;
  onSubmit: () => void;
  children: ReactNode;
}) {
  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };
  return (
    <div className="modal-layer">
      <form className="modal small-modal" onSubmit={submit} noValidate>
        <button type="button" className="modal-close" onClick={onClose} aria-label="닫기">
          <Icon name="close" />
        </button>
        <span className="section-kicker">{kicker}</span>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
        {children}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="modal-actions">
          <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
            취소
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? "저장 중…" : submitLabel}
          </Button>
        </div>
      </form>
    </div>
  );
}

/** 사용 여부 체크박스 (모달 안) */
export function ActiveCheckbox({
  checked,
  onChange,
  label = "사용",
  help,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  help?: string;
}) {
  return (
    <label className="consent simple">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>
        <b>{label}</b>
        {help && <small>{help}</small>}
      </span>
    </label>
  );
}

/** PATCH에 보낼 바뀐 필드만 고른다 */
export function changedFields<T extends Record<string, unknown>>(original: T, next: T): Partial<T> {
  const out: Partial<T> = {};
  (Object.keys(next) as (keyof T)[]).forEach((k) => {
    if (next[k] !== original[k]) out[k] = next[k];
  });
  return out;
}

/** 오류 코드별 문구. 표에 없으면 서버 메시지를 그대로 쓴다 */
export function errorText(e: unknown, byCode: Record<string, string> = {}) {
  if (e instanceof ApiError) {
    if (byCode[e.code]) return byCode[e.code];
    if (e.code === "INVALID_REQUEST") return "입력값을 확인해 주세요.";
    return e.message;
  }
  return "처리 중 문제가 발생했습니다.";
}

/** 공백만 있으면 null (약품 안내문처럼 비워둘 수 있는 칸) */
export const blankToNull = (v: string) => (v.trim() ? v.trim() : null);
