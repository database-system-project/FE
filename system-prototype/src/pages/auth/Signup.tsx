import { useState, type FormEvent } from "react";
import { Icon } from "../../components/Icon";
import { Button } from "../../components/Button";
import { authApi } from "../../api/auth";
import { ApiError } from "../../api/client";

type Form = {
  loginId: string;
  password: string;
  passwordConfirm: string;
  name: string;
  birthDate: string;
  gender: "" | "M" | "F";
  phone: string;
  privacyAgreed: boolean;
};

const empty: Form = {
  loginId: "",
  password: "",
  passwordConfirm: "",
  name: "",
  birthDate: "",
  gender: "",
  phone: "",
  privacyAgreed: false,
};

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/** 서버로 보내기 전에 화면에서 먼저 확인. 문제가 없으면 빈 문자열 */
function validate(f: Form): string {
  if (!f.loginId.trim() || f.loginId.trim().length > 50) return "아이디를 1~50자로 입력해 주세요.";
  if (!f.password) return "비밀번호를 입력해 주세요.";
  if (f.password !== f.passwordConfirm) return "비밀번호 확인이 일치하지 않습니다.";
  if (!f.name.trim() || f.name.trim().length > 50) return "이름을 1~50자로 입력해 주세요.";
  if (!f.birthDate) return "생년월일을 입력해 주세요.";
  if (f.birthDate > today()) return "생년월일은 오늘 이후일 수 없습니다.";
  if (!f.gender) return "성별을 선택해 주세요.";
  const phone = f.phone.replace(/[\s-]/g, "");
  if (!/^\d{1,20}$/.test(phone)) return "전화번호는 숫자로 입력해 주세요.";
  if (!f.privacyAgreed) return "개인정보 수집·이용에 동의해 주세요.";
  return "";
}

export function Signup({ back }: { back: () => void }) {
  const [form, setForm] = useState<Form>(empty);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [patientId, setPatientId] = useState<number | null>(null);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const message = validate(form);
    if (message) {
      setError(message);
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await authApi.signup({
        loginId: form.loginId.trim(),
        password: form.password,
        name: form.name.trim(),
        birthDate: form.birthDate,
        gender: form.gender as "M" | "F",
        phone: form.phone.replace(/[\s-]/g, ""),
        privacyAgreed: true,
      });
      setPatientId(res.patientId);
    } catch (e) {
      if (e instanceof ApiError && e.code === "LOGIN_ID_TAKEN") setError("이미 사용 중인 아이디입니다.");
      else if (e instanceof ApiError && e.code === "DUPLICATE_PATIENT")
        setError("이미 가입된 환자입니다. 아이디 찾기를 이용해 주세요.");
      else if (e instanceof ApiError) setError(e.message);
      else setError("회원가입 중 문제가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (patientId !== null)
    return (
      <div className="auth-simple">
        <div className="success-card">
          <div className="success-icon">
            <Icon name="check" size={34} />
          </div>
          <h2>회원가입이 완료되었습니다</h2>
          <p>
            환자번호 <b>{patientId}</b>이 자동 발급되었습니다.
            <br />
            이제 예약 서비스를 이용할 수 있습니다.
          </p>
          <Button onClick={back}>로그인하러 가기</Button>
        </div>
      </div>
    );

  return (
    <div className="auth-simple">
      <form className="signup-card" onSubmit={handleSubmit} noValidate>
        <button type="button" className="text-back" onClick={back}>
          ← 로그인으로 돌아가기
        </button>
        <div className="signup-title">
          <span className="brand-mark">
            <Icon name="logo" />
          </span>
          <div>
            <h2>환자 회원가입</h2>
            <p>예약 및 진료 조회를 위한 정보를 입력해 주세요.</p>
          </div>
        </div>
        <div className="form-grid">
          <label className="field full">
            <span>아이디</span>
            <input
              value={form.loginId}
              onChange={(e) => set("loginId", e.target.value)}
              placeholder="사용할 아이디 (50자 이내)"
              autoComplete="username"
            />
          </label>
          <label className="field">
            <span>비밀번호</span>
            <input
              type="password"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              placeholder="비밀번호 입력"
              autoComplete="new-password"
            />
          </label>
          <label className="field">
            <span>비밀번호 확인</span>
            <input
              type="password"
              value={form.passwordConfirm}
              onChange={(e) => set("passwordConfirm", e.target.value)}
              placeholder="비밀번호 재입력"
              autoComplete="new-password"
            />
          </label>
          <label className="field">
            <span>이름</span>
            <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="이름 입력" />
          </label>
          <label className="field">
            <span>생년월일</span>
            <input type="date" max={today()} value={form.birthDate} onChange={(e) => set("birthDate", e.target.value)} />
          </label>
          <label className="field">
            <span>성별</span>
            <select value={form.gender} onChange={(e) => set("gender", e.target.value as Form["gender"])}>
              <option value="">성별 선택</option>
              <option value="M">남성</option>
              <option value="F">여성</option>
            </select>
          </label>
          <label className="field">
            <span>전화번호</span>
            <input
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="010-0000-0000"
              inputMode="tel"
            />
          </label>
        </div>
        <label className="consent">
          <input type="checkbox" checked={form.privacyAgreed} onChange={(e) => set("privacyAgreed", e.target.checked)} />
          <span>
            <b>[필수] 개인정보 수집·이용에 동의합니다.</b>
            <small>예약 및 진료 서비스 제공을 위해 최소한의 정보를 수집합니다.</small>
          </span>
          <button type="button">보기</button>
        </label>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <Button className="wide" disabled={loading}>
          {loading ? "가입 처리 중…" : "회원가입 완료"}
        </Button>
        <p className="center-link">
          이미 가입된 계정이 있나요? <button type="button">아이디 찾기</button>
        </p>
      </form>
    </div>
  );
}
