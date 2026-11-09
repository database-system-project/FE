import { useState } from "react";
import { type Role } from "../../types";
import { roleLabel } from "../../constants/roles";
import { Icon } from "../../components/Icon";
import { Button } from "../../components/Button";

export function Login({
  onLogin,
  navigate,
}: {
  onLogin: (r: Role) => void;
  navigate: (s: string) => void;
}) {
  const [selected, setSelected] = useState<Role>("patient");
  const demoAccounts: Record<Role, string> = {
    patient: "patient01",
    desk: "desk01",
    doctor: "doctor01",
    cashier: "cashier01",
    admin: "admin01",
  };
  const [loginId, setLoginId] = useState(demoAccounts.patient);
  const handleLogin = () => {
    const accountRole =
      (Object.keys(demoAccounts) as Role[]).find((role) => demoAccounts[role] === loginId) ||
      "patient";
    onLogin(accountRole);
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
        <div className="login-form">
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
            />
          </label>
          <label className="field">
            <span>비밀번호</span>
            <input type="password" defaultValue="12345678" placeholder="비밀번호를 입력하세요" />
          </label>
          <Button className="login-submit" onClick={handleLogin}>
            로그인
          </Button>
          <div className="auth-links">
            <button>아이디 찾기</button>
            <span />
            <button onClick={() => navigate("signup")}>환자 회원가입</button>
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
        </div>
        <p className="copyright">© 2026 Oncare Clinic. All rights reserved.</p>
      </section>
    </main>
  );
}
