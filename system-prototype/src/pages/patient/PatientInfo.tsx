import { useState, type FormEvent } from "react";
import { Icon } from "../../components/Icon";
import { Button } from "../../components/Button";
import { EmptyAvatar } from "../../components/EmptyAvatar";
import { PageHeader } from "../../components/PageHeader";
import { authApi } from "../../api/auth";
import { patientApi } from "../../api/patient";
import { useApi } from "../../api/useApi";
import { ApiError } from "../../api/client";
import type { PatientProfile } from "../../api/types";
import { useAuth } from "../../auth/AuthContext";
import { formatDate, formatPhone, genderLabel } from "../../utils/format";

const errorText = (e: unknown, byCode: Record<string, string>) => {
  if (e instanceof ApiError) return byCode[e.code] ?? (e.code === "INVALID_REQUEST" ? "입력값을 확인해 주세요." : e.message);
  return "처리 중 문제가 발생했습니다.";
};

export function PatientInfo() {
  const { data, error, reload } = useApi(() => authApi.me(), []);
  const profile = data?.profile as PatientProfile | undefined;
  const [notice, setNotice] = useState("");

  return (
    <>
      <PageHeader title="내 정보" description="예약과 진료에 사용되는 환자 기본정보를 확인하고 수정할 수 있습니다." />
      {error && <p className="form-error">{error}</p>}
      {notice && <p className="form-notice">{notice}</p>}
      {data && profile && (
        <div className="profile-layout">
          <section className="patient-panel">
            <div className="patient-profile">
              <EmptyAvatar name={profile.name} />
              <div>
                <h2>{profile.name}</h2>
                <p>환자번호 {profile.patientId}</p>
              </div>
            </div>
            <dl>
              <div>
                <dt>환자번호</dt>
                <dd>{profile.patientId}</dd>
              </div>
              <div>
                <dt>로그인 아이디</dt>
                <dd>{data.loginId}</dd>
              </div>
              <div>
                <dt>생년월일</dt>
                <dd>{formatDate(profile.birthDate)}</dd>
              </div>
              <div>
                <dt>성별</dt>
                <dd>{genderLabel[profile.gender]}</dd>
              </div>
              <div>
                <dt>전화번호</dt>
                <dd>{formatPhone(profile.phone)}</dd>
              </div>
            </dl>
            <div className="info-banner profile-notice">
              <Icon name="warning" size={18} />
              <span>
                <b>수정 제한 정보</b>
                <small>생년월일 또는 성별 수정이 필요한 경우 원무 직원에게 문의해 주세요.</small>
              </span>
            </div>
          </section>
          <div className="profile-forms">
            <ProfileForm
              key={`${profile.name}-${profile.phone}`}
              profile={profile}
              onSaved={() => {
                setNotice("기본정보를 수정했습니다.");
                void reload();
              }}
            />
            <PasswordForm />
          </div>
        </div>
      )}
    </>
  );
}

function ProfileForm({ profile, onSaved }: { profile: PatientProfile; onSaved: () => void }) {
  const { updateUser } = useAuth();
  const [form, setForm] = useState({ name: profile.name, phone: formatPhone(profile.phone) });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    const phone = form.phone.replace(/[-\s]/g, "");
    if (!name || name.length > 50) return setError("이름을 50자 이내로 입력해 주세요.");
    if (!/^\d{1,20}$/.test(phone)) return setError("전화번호는 숫자로 입력해 주세요.");
    const body: { name?: string; phone?: string } = {};
    if (name !== profile.name) body.name = name;
    if (phone !== profile.phone) body.phone = phone;
    if (Object.keys(body).length === 0) return setNotice("바뀐 내용이 없습니다.");
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const saved = await patientApi.updateProfile(body);
      updateUser({ name: saved.name });
      onSaved();
    } catch (err) {
      setError(
        errorText(err, {
          DUPLICATE_PATIENT: "같은 이름·생년월일·전화번호로 가입된 환자가 이미 있습니다. 원무 직원에게 문의해 주세요.",
        }),
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="clinical-form" onSubmit={submit}>
      <div className="card-title">
        <div>
          <h2>기본정보 수정</h2>
          <p>이름과 전화번호는 직접 바꿀 수 있습니다.</p>
        </div>
      </div>
      <label className="field">
        <span>이름</span>
        <input value={form.name} maxLength={50} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </label>
      <label className="field">
        <span>전화번호</span>
        <input inputMode="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      </label>
      {error && <p className="form-error">{error}</p>}
      {notice && <p className="form-notice">{notice}</p>}
      <div className="clinical-actions">
        <Button type="submit" disabled={busy}>
          {busy ? "저장 중…" : "정보 수정"}
        </Button>
      </div>
    </form>
  );
}

function PasswordForm() {
  const { logout } = useAuth();
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.current) return setError("현재 비밀번호를 입력해 주세요.");
    if (form.next.length < 8 || form.next.length > 72) return setError("새 비밀번호는 8자 이상 72자 이하로 입력해 주세요.");
    if (form.next !== form.confirm) return setError("새 비밀번호와 확인이 다릅니다.");
    if (form.next === form.current) return setError("현재 비밀번호와 다른 비밀번호를 입력해 주세요.");
    setBusy(true);
    setError("");
    try {
      await patientApi.changePassword(form.current, form.next);
      setDone(true);
    } catch (err) {
      setError(errorText(err, { INVALID_CURRENT_PASSWORD: "현재 비밀번호가 일치하지 않습니다." }));
    } finally {
      setBusy(false);
    }
  };

  if (done)
    return (
      <section className="clinical-form">
        <div className="card-title">
          <div>
            <h2>비밀번호 변경 완료</h2>
            <p>보안을 위해 기존 로그인이 해제되었습니다. 새 비밀번호로 다시 로그인해 주세요.</p>
          </div>
        </div>
        <div className="clinical-actions">
          <Button onClick={logout}>다시 로그인</Button>
        </div>
      </section>
    );

  return (
    <form className="clinical-form" onSubmit={submit}>
      <div className="card-title">
        <div>
          <h2>비밀번호 변경</h2>
          <p>변경하면 다시 로그인해야 합니다.</p>
        </div>
      </div>
      <label className="field">
        <span>현재 비밀번호</span>
        <input
          type="password"
          autoComplete="current-password"
          value={form.current}
          onChange={(e) => setForm({ ...form, current: e.target.value })}
        />
      </label>
      <label className="field">
        <span>새 비밀번호</span>
        <input
          type="password"
          autoComplete="new-password"
          placeholder="8자 이상"
          value={form.next}
          onChange={(e) => setForm({ ...form, next: e.target.value })}
        />
      </label>
      <label className="field">
        <span>새 비밀번호 확인</span>
        <input
          type="password"
          autoComplete="new-password"
          value={form.confirm}
          onChange={(e) => setForm({ ...form, confirm: e.target.value })}
        />
      </label>
      {error && <p className="form-error">{error}</p>}
      <div className="clinical-actions">
        <Button type="submit" variant="outline" disabled={busy}>
          {busy ? "변경 중…" : "비밀번호 변경"}
        </Button>
      </div>
    </form>
  );
}
