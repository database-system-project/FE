import { useState, type FormEvent } from "react";
import { type Role } from "../../types";
import { roleLabel } from "../../constants/roles";
import { Icon } from "../../components/Icon";
import { Button } from "../../components/Button";
import { useAuth } from "../../auth/AuthContext";
import { ApiError } from "../../api/client";

// 시연용 계정 아이디. 백엔드 시드 데이터의 계정과 맞춰서 바꾼다.
const demoAccounts: Record<Role, string> = {
  patient: "patient01",
  desk: "desk01",
  doctor: "doctor01",
  cashier: "cashier01",
  admin: "admin01",
};

export function Login({ navigate }: { navigate: (s: string) => void }) {
  const { login } = useAuth();
  const [selected, setSelected] = useState<Role>("patient");
  const [loginId, setLoginId] = useState(demoAccounts.patient);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!loginId.trim() || !password) {
      setError("아이디와 비밀번호를 입력해 주세요.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      // 성공하면 AuthContext가 역할을 저장하고, App이 역할별 첫 화면으로 이동한다.
      await login(loginId.trim(), password);
    } catch (e) {
      if (e instanceof ApiError && e.code === "INVALID_CREDENTIALS") {
        setError("아이디 또는 비밀번호를 확인해 주세요.");
      } else if (e instanceof ApiError) {
        setError(e.message);
      } else {
        setError("로그인 중 문제가 발생했습니다.");
      }
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-aside">
        <div className="auth-brand">
          <span className="brand-mark large">
            <Icon name="logo" size={28} />
          </span>
          <b>온케어의원</b>
        </div>
        <h1>
          예약부터 처방까지,
          <br />
          하나의 시스템으로
        </h1>
        <p>
          환자와 의료진의 모든 외래 진료 과정을
          <br />
          정확하고 안전하게 연결합니다.
        </p>
        <div className="flow-list">
          <span>
            <Icon name="calendar" /> 간편한 진료 예약·접수
          </span>
          <span>
            <Icon name="pill" /> 안전한 처방·금기 확인
          </span>
          <span>
            <Icon name="receipt" /> 명확한 수납·진료 기록
          </span>
        </div>
      </section>
      <section className="auth-main">
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="mobile-auth-brand">
            <span className="brand-mark">
              <Icon name="logo" />
            </span>
            <b>온케어의원</b>
          </div>
          <div className="eyebrow">HOSPITAL MANAGEMENT SYSTEM</div>
          <h2>병원 예약·진료 관리 시스템</h2>
          <p className="login-intro">업무를 시작하려면 계정으로 로그인해 주세요.</p>
          <label className="field">
            <span>아이디</span>
            <input
              value={loginId}
              onChange={(event) => setLoginId(event.target.value)}
              placeholder="아이디를 입력하세요"
              autoComplete="username"
            />
          </label>
          <label className="field">
            <span>비밀번호</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="비밀번호를 입력하세요"
              autoComplete="current-password"
            />
          </label>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <Button className="login-submit" disabled={loading}>
            {loading ? "로그인 중…" : "로그인"}
          </Button>
          <div className="auth-links">
            <button type="button">아이디 찾기</button>
            <span />
            <button type="button" onClick={() => navigate("signup")}>
              환자 회원가입
            </button>
          </div>
          <div className="demo-note">
            <Icon name="shield" size={17} />
            <span>
              <b>데모 계정</b>
              <small>데모에서 확인할 계정을 선택하면 아이디가 자동 입력됩니다.</small>
            </span>
            <select
              value={selected}
              onChange={(event) => {
                const role = event.target.value as Role;
                setSelected(role);
                setLoginId(demoAccounts[role]);
              }}
            >
              {(Object.keys(roleLabel) as Role[]).map((role) => (
                <option key={role} value={role}>
                  {roleLabel[role]} 계정
                </option>
              ))}
            </select>
          </div>
        </form>
        <p className="copyright">© 2026 Oncare Clinic. All rights reserved.</p>
      </section>
    </main>
  );
}
