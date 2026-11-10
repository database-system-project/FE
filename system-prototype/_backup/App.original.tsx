import { useMemo, useState, type ReactNode } from "react";

type Role = "patient" | "desk" | "doctor" | "cashier" | "admin";
type Screen = string;

const roleLabel: Record<Role, string> = {
  patient: "환자",
  desk: "원무 직원",
  doctor: "의사",
  cashier: "수납 담당자",
  admin: "관리자",
};

const iconPaths: Record<string, ReactNode> = {
  logo: (
    <>
      <path d="M12 3v18M3 12h18" />
      <path d="M7 7h10v10H7z" />
    </>
  ),
  home: (
    <>
      <path d="m3 11 9-8 9 8" />
      <path d="M5 10v10h14V10M9 20v-6h6v6" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </>
  ),
  list: (
    <>
      <path d="M8 6h13M8 12h13M8 18h13" />
      <circle cx="3.5" cy="6" r=".5" />
      <circle cx="3.5" cy="12" r=".5" />
      <circle cx="3.5" cy="18" r=".5" />
    </>
  ),
  file: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M8 13h8M8 17h6" />
    </>
  ),
  pill: (
    <>
      <path d="m10.5 20.5-7-7a5 5 0 0 1 7-7l7 7a5 5 0 0 1-7 7Z" />
      <path d="m7 17 10-10" />
    </>
  ),
  receipt: (
    <>
      <path d="M5 3v18l3-2 4 2 4-2 3 2V3l-3 2-4-2-4 2-3-2Z" />
      <path d="M9 9h6M9 13h6" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  bell: (
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
    </>
  ),
  logout: (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
    </>
  ),
  chevron: <path d="m9 18 6-6-6-6" />,
  check: <path d="m5 12 4 4L19 6" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  warning: (
    <>
      <path d="M10.3 3.6 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4M12 17h.01" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  print: (
    <>
      <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <path d="M6 14h12v8H6z" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" />
    </>
  ),
  shield: (
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  close: <path d="m18 6-12 12M6 6l12 12" />,
};

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {iconPaths[name]}
    </svg>
  );
}

function Badge({ children, tone = "blue" }: { children: ReactNode; tone?: string }) {
  return (
    <span className={`badge badge-${tone}`}>
      <span className="badge-dot" />
      {children}
    </span>
  );
}

function Button({
  children,
  variant = "primary",
  icon,
  onClick,
  disabled,
  className = "",
}: {
  children: ReactNode;
  variant?: string;
  icon?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button className={`btn btn-${variant} ${className}`} onClick={onClick} disabled={disabled}>
      {icon && <Icon name={icon} size={17} />}
      {children}
    </button>
  );
}

function StatCard({
  label,
  value,
  helper,
  icon,
  tone = "blue",
}: {
  label: string;
  value: string;
  helper?: string;
  icon: string;
  tone?: string;
}) {
  return (
    <div className="stat-card">
      <div className={`stat-icon icon-${tone}`}>
        <Icon name={icon} size={22} />
      </div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        {helper && <small>{helper}</small>}
      </div>
    </div>
  );
}

function EmptyAvatar({ name, doctor = false }: { name: string; doctor?: boolean }) {
  return <div className={`avatar ${doctor ? "avatar-doctor" : ""}`}>{name.slice(-2)}</div>;
}

const menus: Record<Role, { id: string; label: string; icon: string }[]> = {
  patient: [
    { id: "patient-home", label: "홈", icon: "home" },
    { id: "booking", label: "진료 예약", icon: "calendar" },
    { id: "reservations", label: "예약 조회", icon: "list" },
    { id: "records", label: "진료 내역", icon: "file" },
    { id: "med-guide", label: "처방·복약 안내", icon: "pill" },
    { id: "receipts", label: "전자영수증", icon: "receipt" },
    { id: "patient-info", label: "내 정보", icon: "users" },
  ],
  desk: [
    { id: "desk-home", label: "원무 대시보드", icon: "home" },
    { id: "desk-reservations", label: "오늘 예약", icon: "calendar" },
    { id: "waiting", label: "접수·대기 관리", icon: "users" },
  ],
  doctor: [
    { id: "doctor-home", label: "진료 대시보드", icon: "home" },
    { id: "doctor-home", label: "오늘의 대기 환자", icon: "users" },
    { id: "doctor-records", label: "진료 기록", icon: "file" },
    { id: "doctor-schedule", label: "진료 일정 조회", icon: "calendar" },
  ],
  cashier: [
    { id: "cashier-home", label: "수납 대시보드", icon: "home" },
    { id: "cashier-home", label: "결제 대기", icon: "receipt" },
    { id: "cashier-history", label: "결제 내역", icon: "list" },
  ],
  admin: [
    { id: "admin-home", label: "관리자 대시보드", icon: "home" },
    { id: "departments", label: "진료과 관리", icon: "file" },
    { id: "doctors", label: "의사·일정 관리", icon: "users" },
    { id: "accounts", label: "사용자 계정", icon: "shield" },
    { id: "medicines", label: "약품 관리", icon: "pill" },
    { id: "interactions", label: "병용금기 관리", icon: "warning" },
    { id: "age-rules", label: "연령금기 관리", icon: "warning" },
    { id: "fees", label: "진찰료 관리", icon: "receipt" },
  ],
};

function AppShell({
  role,
  screen,
  navigate,
  logout,
  children,
}: {
  role: Role;
  screen: Screen;
  navigate: (s: Screen) => void;
  logout: () => void;
  children: ReactNode;
}) {
  const [mobileMenu, setMobileMenu] = useState(false);
  const user =
    role === "patient"
      ? "홍길동"
      : role === "doctor"
        ? "이정훈"
        : role === "admin"
          ? "김관리"
          : role === "cashier"
            ? "최수납"
            : "박원무";
  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <div className="brand" onClick={() => navigate(`${role}-home`)}>
          <span className="brand-mark">
            <Icon name="logo" size={22} />
          </span>
          <span>
            <b>온케어</b>
            <small>병원 예약·진료 관리 시스템</small>
          </span>
        </div>
        <nav>
          <p className="nav-heading">업무 메뉴</p>
          {menus[role].map((item, i) => (
            <button
              key={`${item.id}-${i}`}
              className={screen === item.id ? "active" : ""}
              onClick={() => {
                navigate(item.id);
                setMobileMenu(false);
              }}
            >
              <Icon name={item.icon} size={19} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-foot">
          <Icon name="shield" size={18} />
          <span>
            안전한 의료정보 시스템<small>세션이 안전하게 보호됩니다</small>
          </span>
        </div>
      </aside>
      <div className="main-wrap">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMobileMenu(!mobileMenu)}>
            <Icon name="menu" />
          </button>
          <div className="topbar-title">온케어의원 업무 시스템</div>
          <div className="top-actions">
            <button className="icon-btn notification">
              <Icon name="bell" size={20} />
              <span />
            </button>
            <div className="user-chip">
              <EmptyAvatar name={user} />
              <span>
                <b>{user}</b>
                <small>{roleLabel[role]}</small>
              </span>
            </div>
            <button className="logout-btn" onClick={logout}>
              <Icon name="logout" size={18} />
              <span>로그아웃</span>
            </button>
          </div>
        </header>
        <main className="content">{children}</main>
      </div>
      {mobileMenu && (
        <button className="overlay mobile-only" onClick={() => setMobileMenu(false)} />
      )}
    </div>
  );
}

function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="header-actions">{actions}</div>}
    </div>
  );
}

function Login({
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

function Signup({ back }: { back: () => void }) {
  const [done, setDone] = useState(false);
  if (done)
    return (
      <div className="auth-simple">
        <div className="success-card">
          <div className="success-icon">
            <Icon name="check" size={34} />
          </div>
          <h2>회원가입이 완료되었습니다</h2>
          <p>
            환자번호 <b>100127</b>이 자동 발급되었습니다.
            <br />
            이제 예약 서비스를 이용할 수 있습니다.
          </p>
          <Button onClick={back}>로그인하러 가기</Button>
        </div>
      </div>
    );
  return (
    <div className="auth-simple">
      <div className="signup-card">
        <button className="text-back" onClick={back}>
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
            <div className="input-action">
              <input placeholder="영문, 숫자 조합 6~20자" />
              <Button variant="outline">중복 확인</Button>
            </div>
          </label>
          <label className="field">
            <span>비밀번호</span>
            <input type="password" placeholder="8자 이상 입력" />
          </label>
          <label className="field">
            <span>비밀번호 확인</span>
            <input type="password" placeholder="비밀번호 재입력" />
          </label>
          <label className="field">
            <span>이름</span>
            <input placeholder="이름 입력" />
          </label>
          <label className="field">
            <span>생년월일</span>
            <input type="date" />
          </label>
          <label className="field">
            <span>성별</span>
            <select>
              <option>성별 선택</option>
              <option>남성</option>
              <option>여성</option>
            </select>
          </label>
          <label className="field">
            <span>전화번호</span>
            <input placeholder="010-0000-0000" />
          </label>
        </div>
        <label className="consent">
          <input type="checkbox" />
          <span>
            <b>[필수] 개인정보 수집·이용에 동의합니다.</b>
            <small>예약 및 진료 서비스 제공을 위해 최소한의 정보를 수집합니다.</small>
          </span>
          <button>보기</button>
        </label>
        <Button className="wide" onClick={() => setDone(true)}>
          회원가입 완료
        </Button>
        <p className="center-link">
          이미 가입된 계정이 있나요? <button>아이디 찾기</button>
        </p>
      </div>
    </div>
  );
}

function PatientHome({ navigate }: { navigate: (s: string) => void }) {
  return (
    <>
      <PageHeader
        title="안녕하세요, 홍길동님"
        description="오늘도 건강한 하루 보내세요. 예정된 진료 일정을 확인해 주세요."
      />
      <div className="patient-hero">
        <div className="next-appointment">
          <div className="card-head">
            <div>
              <span className="section-kicker">NEXT APPOINTMENT</span>
              <h2>다음 예약</h2>
            </div>
            <Badge>예약완료</Badge>
          </div>
          <div className="appointment-date">
            <strong>11</strong>
            <span>
              2026년 11월
              <br />
              <b>수요일</b>
            </span>
          </div>
          <div className="appointment-info">
            <div>
              <small>진료과 / 담당 의사</small>
              <b>내과 · 이정훈 의사</b>
            </div>
            <div>
              <small>접수 예정시간</small>
              <b>오전 10:30</b>
            </div>
          </div>
          <div className="appointment-notice">
            <Icon name="clock" size={17} /> 예약한 접수 예정시간에 병원에 방문해 주세요.
          </div>
          <Button onClick={() => navigate("reservations")}>
            예약 상세 보기 <Icon name="chevron" size={16} />
          </Button>
        </div>
        <div className="quick-panel">
          <h3>빠른 메뉴</h3>
          <div className="quick-grid">
            {[
              ["booking", "calendar", "진료 예약하기", "원하는 진료과와 시간을 선택하세요"],
              ["reservations", "list", "예약 조회", "예약 변경 및 취소"],
              ["records", "file", "진료 내역", "지난 진료 기록 확인"],
              ["med-guide", "pill", "처방·복약 안내", "복용법과 주의사항"],
              ["receipts", "receipt", "전자영수증", "결제 내역 및 영수증"],
            ].map(([id, icon, title, desc]) => (
              <button key={id} onClick={() => navigate(id)}>
                <span className="quick-icon">
                  <Icon name={icon} />
                </span>
                <span>
                  <b>{title}</b>
                  <small>{desc}</small>
                </span>
                <Icon name="chevron" size={16} />
              </button>
            ))}
          </div>
        </div>
      </div>
      <h2 className="section-title">최근 이용 내역</h2>
      <div className="summary-cards">
        <button onClick={() => navigate("records")}>
          <span className="summary-top">
            <Icon name="file" /> 최근 진료
          </span>
          <b>감기 및 급성 인두염</b>
          <small>2026.10.14 · 내과 이정훈</small>
          <span className="link">상세 보기 →</span>
        </button>
        <button onClick={() => navigate("med-guide")}>
          <span className="summary-top mint">
            <Icon name="pill" /> 최근 처방
          </span>
          <b>아세트아미노펜정 외 1건</b>
          <small>3일분 · 2026.10.14 처방</small>
          <span className="link">복약 안내 보기 →</span>
        </button>
        <button onClick={() => navigate("receipts")}>
          <span className="summary-top green">
            <Icon name="receipt" /> 결제/영수증
          </span>
          <b>18,000원</b>
          <small>초진 진찰료 · 결제완료</small>
          <span className="link">영수증 보기 →</span>
        </button>
      </div>
    </>
  );
}

function Booking({ navigate }: { navigate: (s: string) => void }) {
  const [step, setStep] = useState(1);
  const [dept, setDept] = useState("");
  const [doctor, setDoctor] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [complete, setComplete] = useState(false);
  const progress = ["진료과", "의사", "날짜", "접수시간", "예약확인"];
  const select = (setter: (v: string) => void, value: string) => {
    setter(value);
    setTimeout(() => setStep(Math.min(step + 1, 5)), 120);
  };
  if (complete)
    return (
      <div className="completion">
        <div className="success-icon">
          <Icon name="check" size={34} />
        </div>
        <span className="section-kicker">RESERVATION COMPLETE</span>
        <h1>예약이 완료되었습니다</h1>
        <p>예약한 접수 예정시간에 병원에 방문해 주세요.</p>
        <div className="confirm-ticket">
          <div>
            <small>예약번호</small>
            <b>R20261111-042</b>
          </div>
          <Badge>예약완료</Badge>
          <hr />
          <dl>
            <div>
              <dt>진료과</dt>
              <dd>{dept || "내과"}</dd>
            </div>
            <div>
              <dt>담당 의사</dt>
              <dd>{doctor || "이정훈 의사"}</dd>
            </div>
            <div>
              <dt>예약일</dt>
              <dd>{date || "2026년 11월 11일 (수)"}</dd>
            </div>
            <div>
              <dt>접수 예정시간</dt>
              <dd>{time || "오전 10:30"}</dd>
            </div>
          </dl>
        </div>
        <div className="completion-actions">
          <Button variant="outline" onClick={() => navigate("patient-home")}>
            홈으로
          </Button>
          <Button onClick={() => navigate("reservations")}>예약 조회</Button>
        </div>
      </div>
    );
  return (
    <>
      <PageHeader
        title="진료 예약"
        description="진료과부터 접수 예정시간까지 순서대로 선택해 주세요."
      />
      <div className="stepper">
        {progress.map((label, i) => (
          <div
            key={label}
            className={`${step === i + 1 ? "current" : ""} ${step > i + 1 ? "done" : ""}`}
          >
            <span>{step > i + 1 ? <Icon name="check" size={14} /> : i + 1}</span>
            <b>{label}</b>
          </div>
        ))}
      </div>
      <div className="booking-card">
        {step === 1 && (
          <>
            <div className="booking-title">
              <span>STEP 1</span>
              <h2>진료과를 선택해 주세요</h2>
            </div>
            <div className="choice-grid">
              {["내과", "소아청소년과", "이비인후과", "피부과"].map((d, i) => (
                <button key={d} onClick={() => select(setDept, d)}>
                  <span className="dept-icon">
                    <Icon
                      name={i === 0 ? "logo" : i === 1 ? "users" : i === 2 ? "file" : "shield"}
                    />
                  </span>
                  <b>{d}</b>
                  <small>
                    {
                      [
                        "감기, 소화기, 만성질환",
                        "소아 질환 및 성장 상담",
                        "귀·코·목 질환",
                        "피부 질환 및 알레르기",
                      ][i]
                    }
                  </small>
                  <Icon name="chevron" />
                </button>
              ))}
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <div className="booking-title">
              <span>STEP 2</span>
              <h2>담당 의사를 선택해 주세요</h2>
              <button onClick={() => setStep(1)}>← 진료과 다시 선택</button>
            </div>
            <div className="doctor-choices">
              {["이정훈", "김민서", "박현우"].map((d, i) => (
                <button key={d} onClick={() => select(setDoctor, `${d} 의사`)}>
                  <EmptyAvatar name={d} doctor />
                  <span>
                    <b>{d} 의사</b>
                    <small>
                      {dept || "내과"} · {d} 의사
                    </small>
                    <Badge tone={i === 2 ? "gray" : "green"}>
                      {i === 2 ? "오늘 마감" : "오늘 예약 가능"}
                    </Badge>
                  </span>
                  <Icon name="chevron" />
                </button>
              ))}
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <div className="booking-title">
              <span>STEP 3</span>
              <h2>예약 날짜를 선택해 주세요</h2>
            </div>
            <div className="calendar-box">
              <div className="calendar-head">
                <button>‹</button>
                <b>2026년 11월</b>
                <button>›</button>
              </div>
              <div className="week">
                <span>일</span>
                <span>월</span>
                <span>화</span>
                <span>수</span>
                <span>목</span>
                <span>금</span>
                <span>토</span>
              </div>
              <div className="dates">
                {Array.from({ length: 35 }, (_, i) => i - 1).map((d, i) => (
                  <button
                    key={i}
                    disabled={d < 1 || d < 8}
                    className={d === 11 ? "selected" : ""}
                    onClick={() => select(setDate, `2026년 11월 ${d}일`)}
                  >
                    {d > 0 && d <= 30 ? d : ""}
                    {d === 11 && <small>예약가능</small>}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
        {step === 4 && (
          <>
            <div className="booking-title">
              <span>STEP 4</span>
              <h2>접수 예정시간을 선택해 주세요</h2>
            </div>
            <div className="time-notice">
              <Icon name="warning" />
              <span>
                <b>예약 시간은 진료 시작 시간이 아닙니다.</b>
                <small>병원에 방문하여 접수할 예정시간이며, 진료는 접수 순서대로 진행됩니다.</small>
              </span>
            </div>
            <h3 className="time-label">오전</h3>
            <div className="time-grid">
              {["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"].map((t, i) => (
                <button
                  disabled={[1, 4].includes(i)}
                  className={time === t ? "selected" : ""}
                  onClick={() => select(setTime, t)}
                  key={t}
                >
                  {t}
                  {[1, 4].includes(i) && <small>예약마감</small>}
                </button>
              ))}
            </div>
            <h3 className="time-label">오후</h3>
            <div className="time-grid">
              {["14:00", "14:30", "15:00", "15:30", "16:00", "16:30"].map((t, i) => (
                <button disabled={i === 2} onClick={() => select(setTime, t)} key={t}>
                  {t}
                  {i === 2 && <small>예약마감</small>}
                </button>
              ))}
            </div>
          </>
        )}
        {step === 5 && (
          <>
            <div className="booking-title">
              <span>STEP 5</span>
              <h2>예약 내용을 확인해 주세요</h2>
            </div>
            <div className="review-card">
              <div className="review-icon">
                <Icon name="calendar" />
              </div>
              <dl>
                <div>
                  <dt>진료과</dt>
                  <dd>{dept || "내과"}</dd>
                </div>
                <div>
                  <dt>담당 의사</dt>
                  <dd>{doctor || "이정훈 의사"}</dd>
                </div>
                <div>
                  <dt>예약일</dt>
                  <dd>{date || "2026년 11월 11일"}</dd>
                </div>
                <div>
                  <dt>접수 예정시간</dt>
                  <dd>{time || "10:30"}</dd>
                </div>
              </dl>
            </div>
            <label className="consent simple">
              <input type="checkbox" defaultChecked />
              <span>
                <b>예약 안내 및 취소 규정을 확인했습니다.</b>
                <small>예약 변경은 기존 예약 취소 후 새 예약으로 등록됩니다.</small>
              </span>
            </label>
            <div className="booking-actions">
              <Button variant="outline" onClick={() => setStep(4)}>
                이전
              </Button>
              <Button onClick={() => setComplete(true)}>예약 확정하기</Button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

const reservationRows = [
  ["R20261111-042", "내과", "이정훈", "2026.11.11 (수)", "10:30", "예약완료"],
  ["R20261014-018", "내과", "이정훈", "2026.10.14 (수)", "09:30", "접수완료"],
  ["R20260902-031", "피부과", "김민서", "2026.09.02 (수)", "14:00", "취소"],
];

function Reservations({ navigate }: { navigate: (s: string) => void }) {
  const [cancelled, setCancelled] = useState(false);
  return (
    <>
      <PageHeader
        title="예약 조회"
        description="예약 내역을 확인하고 접수 전 예약을 변경하거나 취소할 수 있습니다."
        actions={
          <Button icon="plus" onClick={() => navigate("booking")}>
            새 예약
          </Button>
        }
      />
      <div className="tabs">
        <button className="active">전체 3</button>
        <button>예정된 예약 1</button>
        <button>지난 예약 2</button>
      </div>
      <div className="data-card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>예약번호</th>
                <th>진료과</th>
                <th>담당 의사</th>
                <th>예약일</th>
                <th>접수 예정시간</th>
                <th>상태</th>
                <th className="right">관리</th>
              </tr>
            </thead>
            <tbody>
              {reservationRows.map((r, i) => (
                <tr key={r[0]}>
                  <td className="code">{r[0]}</td>
                  <td>
                    <b>{r[1]}</b>
                  </td>
                  <td>{r[2]} 의사</td>
                  <td>{r[3]}</td>
                  <td>{r[4]}</td>
                  <td>
                    <Badge tone={i === 0 && !cancelled ? "blue" : i === 1 ? "green" : "gray"}>
                      {i === 0 && cancelled ? "취소" : r[5]}
                    </Badge>
                  </td>
                  <td className="right">
                    {i === 0 && !cancelled ? (
                      <div className="row-actions">
                        <Button variant="outline" onClick={() => navigate("booking")}>
                          예약 변경
                        </Button>
                        <Button variant="danger-ghost" onClick={() => setCancelled(true)}>
                          예약 취소
                        </Button>
                      </div>
                    ) : (
                      <button className="text-link">상세 보기</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="info-banner">
        <Icon name="calendar" />
        <span>
          <b>예약 변경 안내</b>
          <small>
            예약 변경 시 기존 예약은 취소 처리되고, 선택한 시간으로 새 예약이 생성됩니다.
          </small>
        </span>
      </div>
    </>
  );
}

function Records({ navigate }: { navigate: (s: string) => void }) {
  return (
    <>
      <PageHeader title="진료 내역" description="나의 외래 진료 기록을 확인할 수 있습니다." />
      <div className="record-list">
        {[
          ["2026.10.14", "내과", "이정훈", "급성 인두염 및 감기", "결제완료"],
          ["2026.07.21", "피부과", "김민서", "접촉성 피부염", "결제완료"],
        ].map((r, i) => (
          <div className="record-card" key={r[0]}>
            <div className="record-date">
              <b>{r[0].slice(5).replace(".", "월 ")}일</b>
              <small>{r[0].slice(0, 4)}년</small>
            </div>
            <div className="record-main">
              <div>
                <Badge tone="green">{r[4]}</Badge>
                <span>
                  {r[1]} · {r[2]} 의사
                </span>
              </div>
              <h3>{r[3]}</h3>
              <p>
                {i === 0
                  ? "목 통증, 미열 및 콧물 증상으로 내원하여 약물 치료를 진행했습니다."
                  : "팔 부위 발진과 가려움 증상으로 내원했습니다."}
              </p>
            </div>
            <div className="record-actions">
              <Button variant="outline" onClick={() => navigate("med-guide")}>
                복약 안내
              </Button>
              <Button variant="ghost" onClick={() => navigate("receipts")}>
                영수증 <Icon name="chevron" size={15} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function MedGuide() {
  return (
    <>
      <PageHeader
        title="처방·복약 안내"
        description="처방받은 약의 효능과 나에게 맞는 복용 방법을 확인하세요."
      />
      <div className="prescription-summary">
        <div>
          <span className="prescription-icon">
            <Icon name="pill" />
          </span>
          <div>
            <small>처방번호 RX20261014-018</small>
            <h3>2026년 10월 14일 처방</h3>
            <p>내과 · 이정훈 의사</p>
          </div>
        </div>
        <Badge tone="green">복용 완료</Badge>
      </div>
      <div className="medicine-cards">
        {[
          [
            "아세트아미노펜정 500mg",
            "해열 및 감기로 인한 통증 완화",
            "정해진 용법과 용량을 지켜 복용하세요.",
            "과량 복용 시 간 손상 위험이 있습니다.",
            "실온(1~30℃), 습기를 피해 보관",
            "1정",
            "하루 3회",
            "3일",
            "식후",
            "충분한 물과 함께 복용하세요.",
          ],
          [
            "레보세티리진정 5mg",
            "알레르기성 비염 증상 완화",
            "1일 1회 복용합니다.",
            "졸음이 올 수 있으므로 운전 시 주의하세요.",
            "차광 밀폐용기에 실온 보관",
            "1정",
            "하루 1회",
            "3일",
            "취침 전",
            "취침 30분 전에 복용하세요.",
          ],
        ].map((m, i) => (
          <article className="medicine-card" key={m[0]}>
            <div className="med-head">
              <span>{i + 1}</span>
              <div>
                <h3>{m[0]}</h3>
                <small>한미약품 · 사용중</small>
              </div>
            </div>
            <div className="med-info-grid">
              <div>
                <b>주요 효능</b>
                <p>{m[1]}</p>
              </div>
              <div>
                <b>사용법</b>
                <p>{m[2]}</p>
              </div>
              <div>
                <b>주의사항</b>
                <p>{m[3]}</p>
              </div>
              <div>
                <b>보관방법</b>
                <p>{m[4]}</p>
              </div>
            </div>
            <div className="my-dose">
              <h4>
                <Icon name="pill" size={18} /> 내 복용 방법
              </h4>
              <div>
                <span>
                  <small>1회 복용량</small>
                  <b>{m[5]}</b>
                </span>
                <span>
                  <small>복용 횟수</small>
                  <b>{m[6]}</b>
                </span>
                <span>
                  <small>복용 기간</small>
                  <b>{m[7]}</b>
                </span>
                <span>
                  <small>복용 시점</small>
                  <b>{m[8]}</b>
                </span>
              </div>
              <p>
                <b>의사 안내</b>
                {m[9]}
              </p>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function Receipt({ close }: { close: () => void }) {
  return (
    <div className="document-page receipt-doc">
      <div className="doc-brand">
        <span className="brand-mark">
          <Icon name="logo" />
        </span>
        <span>
          <b>온케어의원</b>
          <small>ONCARE CLINIC</small>
        </span>
      </div>
      <h1>진료비 전자영수증</h1>
      <p className="doc-number">영수증번호 PAY20261014-0092</p>
      <div className="doc-rule" />
      <dl className="doc-details">
        <div>
          <dt>환자명</dt>
          <dd>홍길동</dd>
        </div>
        <div>
          <dt>진료일</dt>
          <dd>2026년 10월 14일</dd>
        </div>
        <div>
          <dt>진료과</dt>
          <dd>내과</dd>
        </div>
        <div>
          <dt>담당 의사</dt>
          <dd>이정훈 의사</dd>
        </div>
        <div>
          <dt>진찰 구분</dt>
          <dd>초진</dd>
        </div>
        <div>
          <dt>결제시각</dt>
          <dd>2026.10.14 10:05</dd>
        </div>
      </dl>
      <div className="doc-total">
        <span>초진 진찰료</span>
        <b>18,000원</b>
      </div>
      <p className="doc-note">
        결제 기록을 기준으로 표시되는 진찰료 영수증이며 약값은 포함되지 않습니다.
      </p>
      <div className="doc-sign">
        온케어의원
        <br />
        <small>서울특별시 중구 세종대로 100 · 02-1234-5678</small>
      </div>
      <div className="document-actions">
        <Button variant="outline" onClick={close}>
          닫기
        </Button>
        <Button icon="print" onClick={() => window.print()}>
          인쇄
        </Button>
      </div>
    </div>
  );
}

function Receipts() {
  const [open, setOpen] = useState(false);
  if (open) return <Receipt close={() => setOpen(false)} />;
  return (
    <>
      <PageHeader
        title="전자영수증"
        description="진료비 결제 내역과 전자영수증을 확인할 수 있습니다."
      />
      <div className="data-card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>영수증번호</th>
                <th>진료일</th>
                <th>진료과 / 담당 의사</th>
                <th>진찰 구분</th>
                <th>결제 금액</th>
                <th>결제시각</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="code">PAY20261014-0092</td>
                <td>2026.10.14</td>
                <td>내과 / 이정훈</td>
                <td>
                  <Badge>초진</Badge>
                </td>
                <td>
                  <b>18,000원</b>
                </td>
                <td>2026.10.14 10:05</td>
                <td>
                  <Button variant="outline" onClick={() => setOpen(true)}>
                    영수증 보기
                  </Button>
                </td>
              </tr>
              <tr>
                <td className="code">PAY20260721-0041</td>
                <td>2026.07.21</td>
                <td>피부과 / 김민서</td>
                <td>
                  <Badge tone="gray">재진</Badge>
                </td>
                <td>
                  <b>15,000원</b>
                </td>
                <td>2026.07.21 15:22</td>
                <td>
                  <Button variant="outline" onClick={() => setOpen(true)}>
                    영수증 보기
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function PatientInfo() {
  const [saved, setSaved] = useState(false);
  return (
    <>
      <PageHeader
        title="내 정보"
        description="예약과 진료에 사용되는 환자 기본정보를 확인하고 수정할 수 있습니다."
      />
      <div className="profile-layout">
        <section className="patient-panel">
          <div className="patient-profile">
            <EmptyAvatar name="홍길동" />
            <div>
              <h2>홍길동</h2>
              <p>환자번호 100001</p>
            </div>
          </div>
          <dl>
            <div>
              <dt>환자번호</dt>
              <dd>100001</dd>
            </div>
            <div>
              <dt>로그인 아이디</dt>
              <dd>patient01</dd>
            </div>
            <div>
              <dt>생년월일</dt>
              <dd>1984.05.18</dd>
            </div>
            <div>
              <dt>성별</dt>
              <dd>남성</dd>
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
        <section className="clinical-form">
          <div className="card-title">
            <div>
              <h2>정보 수정</h2>
              <p>이름, 전화번호, 비밀번호만 직접 변경할 수 있습니다.</p>
            </div>
            {saved && <Badge tone="green">수정 완료</Badge>}
          </div>
          <label className="field">
            <span>이름</span>
            <input defaultValue="홍길동" />
          </label>
          <label className="field">
            <span>전화번호</span>
            <input defaultValue="010-1234-5678" />
          </label>
          <label className="field">
            <span>새 비밀번호</span>
            <input type="password" placeholder="변경할 경우에만 입력하세요" />
          </label>
          <label className="field">
            <span>새 비밀번호 확인</span>
            <input type="password" placeholder="비밀번호를 다시 입력하세요" />
          </label>
          <div className="clinical-actions">
            <Button onClick={() => setSaved(true)}>정보 수정</Button>
          </div>
        </section>
      </div>
    </>
  );
}

const scheduleRows = [
  ["이정훈", "내과", "2026.11.11", "09:00", "17:30", "12:30", "13:30", "진료"],
  ["이정훈", "내과", "2026.11.12", "09:00", "17:30", "12:30", "13:30", "진료"],
  ["이정훈", "내과", "2026.11.13", "-", "-", "-", "-", "휴진"],
];

function ScheduleView({ editable = false }: { editable?: boolean }) {
  const [modal, setModal] = useState<"schedule" | "doctor" | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState("이정훈");
  const departmentByDoctor: Record<string, string> = {
    이정훈: "내과",
    김민서: "피부과",
    박현우: "소아청소년과",
  };
  const selectedDepartment = departmentByDoctor[selectedDoctor];
  const visibleSchedules = scheduleRows.map((row) => [
    selectedDoctor,
    selectedDepartment,
    ...row.slice(2),
  ]);
  return (
    <>
      <PageHeader
        title={editable ? "의사·일정 관리" : "진료 일정 조회"}
        description={
          editable
            ? "의사를 선택하여 예약 가능한 진료 일정을 등록·수정합니다."
            : "관리자가 등록한 본인의 진료 일정을 조회합니다."
        }
        actions={
          editable ? (
            <>
              <Button variant="outline" icon="plus" onClick={() => setModal("doctor")}>
                의사 등록
              </Button>
              <Button icon="plus" onClick={() => setModal("schedule")}>
                일정 등록
              </Button>
            </>
          ) : (
            <Badge tone="gray">조회 전용</Badge>
          )
        }
      />
      {editable && (
        <div className="schedule-doctor-picker">
          <span>의사 선택</span>
          {["이정훈 · 내과", "김민서 · 피부과", "박현우 · 소아청소년과"].map((doctor) => (
            <button
              key={doctor}
              className={doctor.startsWith(selectedDoctor) ? "active" : ""}
              onClick={() => setSelectedDoctor(doctor.split(" · ")[0])}
            >
              <EmptyAvatar name={doctor.split(" · ")[0]} />
              {doctor}
            </button>
          ))}
        </div>
      )}
      <div className="data-card">
        <div className="card-title schedule-title">
          <div>
            <h2>{selectedDoctor} 의사 일정</h2>
            <p>{selectedDepartment} · 2026년 11월</p>
          </div>
          {editable && (
            <span className="permission-note">
              <Icon name="shield" size={15} /> 관리자만 수정 가능
            </span>
          )}
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>의사명</th>
                <th>진료과</th>
                <th>진료일</th>
                <th>접수 시작시간</th>
                <th>진료 마감시간</th>
                <th>점심 시작시간</th>
                <th>점심 종료시간</th>
                <th>휴진 여부</th>
                {editable && <th></th>}
              </tr>
            </thead>
            <tbody>
              {visibleSchedules.map((row) => (
                <tr key={row[2]}>
                  {row.map((value, cell) => (
                    <td key={cell}>
                      {cell === 7 ? (
                        <Badge tone={value === "휴진" ? "gray" : "green"}>
                          {value === "휴진" ? "휴진" : "진료"}
                        </Badge>
                      ) : cell === 0 ? (
                        <b>{value}</b>
                      ) : (
                        value
                      )}
                    </td>
                  ))}
                  {editable && (
                    <td>
                      <Button variant="outline" onClick={() => setModal("schedule")}>
                        일정 수정
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {modal === "schedule" && (
        <div className="modal-layer">
          <div className="modal small-modal">
            <button className="modal-close" onClick={() => setModal(null)}>
              <Icon name="close" />
            </button>
            <span className="section-kicker">DOCTOR SCHEDULE</span>
            <h2>의사 일정 등록·수정</h2>
            <p>
              {selectedDoctor} 의사 · {selectedDepartment}
            </p>
            <label className="field">
              <span>날짜</span>
              <input type="date" defaultValue="2026-11-11" />
            </label>
            <div className="form-grid">
              <label className="field">
                <span>접수 시작시간</span>
                <input type="time" defaultValue="09:00" />
              </label>
              <label className="field">
                <span>진료 마감시간</span>
                <input type="time" defaultValue="17:30" />
              </label>
              <label className="field">
                <span>점심 시작시간</span>
                <input type="time" defaultValue="12:30" />
              </label>
              <label className="field">
                <span>점심 종료시간</span>
                <input type="time" defaultValue="13:30" />
              </label>
            </div>
            <label className="consent simple">
              <input type="checkbox" />
              <span>
                <b>휴진일로 설정</b>
                <small>예약이 존재하는 일정은 휴진으로 변경할 수 없습니다.</small>
              </span>
            </label>
            <div className="modal-actions">
              <Button variant="outline" onClick={() => setModal(null)}>
                취소
              </Button>
              <Button onClick={() => setModal(null)}>일정 저장</Button>
            </div>
          </div>
        </div>
      )}
      {modal === "doctor" && (
        <div className="modal-layer">
          <div className="modal small-modal">
            <button className="modal-close" onClick={() => setModal(null)}>
              <Icon name="close" />
            </button>
            <span className="section-kicker">DOCTOR REGISTRATION</span>
            <h2>의사 등록</h2>
            <p>관리자가 생성한 의사 계정과 진료과를 연결합니다.</p>
            <label className="field">
              <span>의사 계정</span>
              <select>
                <option>doctor05</option>
                <option>doctor06</option>
              </select>
            </label>
            <label className="field">
              <span>의사명</span>
              <input placeholder="이름을 입력하세요" />
            </label>
            <label className="field">
              <span>진료과</span>
              <select>
                <option>내과</option>
                <option>소아청소년과</option>
                <option>이비인후과</option>
                <option>피부과</option>
              </select>
            </label>
            <div className="modal-actions">
              <Button variant="outline" onClick={() => setModal(null)}>
                취소
              </Button>
              <Button onClick={() => setModal(null)}>의사 등록</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const patients = [
  ["09:00", "100142", "김하늘", "내과", "이정훈", "예약완료"],
  ["09:30", "100086", "박서준", "내과", "이정훈", "접수완료"],
  ["10:00", "100217", "정유진", "피부과", "김민서", "예약완료"],
  ["10:30", "100001", "홍길동", "내과", "이정훈", "예약완료"],
  ["11:00", "100098", "최도윤", "소아청소년과", "박현우", "예약완료"],
];

function DeskDashboard({ navigate }: { navigate: (s: string) => void }) {
  const [checked, setChecked] = useState<string[]>(["100086"]);
  return (
    <>
      <PageHeader
        title="원무 대시보드"
        description="2026년 11월 11일 수요일 · 오늘의 예약 및 접수 현황입니다."
      />
      <div className="stats-grid four">
        <StatCard label="오늘 예약 수" value="24" helper="오전 15 · 오후 9" icon="calendar" />
        <StatCard
          label="접수 완료"
          value={`${7 + checked.length - 1}`}
          helper="예약 대비 29%"
          icon="check"
          tone="green"
        />
        <StatCard
          label="현재 대기"
          value={`${4 + checked.length - 1}`}
          helper="평균 대기 18분"
          icon="users"
          tone="orange"
        />
        <StatCard label="진료 완료" value="3" helper="오늘 누적" icon="file" tone="mint" />
      </div>
      <div className="dashboard-split">
        <section className="data-card">
          <div className="card-title">
            <div>
              <h2>오늘 예약 환자</h2>
              <p>예약한 환자만 접수할 수 있습니다.</p>
            </div>
            <button className="text-link" onClick={() => navigate("desk-reservations")}>
              전체 보기 →
            </button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>예약시간</th>
                  <th>환자</th>
                  <th>진료과 / 의사</th>
                  <th>상태</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {patients.slice(0, 4).map((p) => (
                  <tr key={p[1]}>
                    <td>
                      <b>{p[0]}</b>
                    </td>
                    <td>
                      <b>{p[2]}</b>
                      <small className="subtext">{p[1]}</small>
                    </td>
                    <td>
                      {p[3]}
                      <small className="subtext">{p[4]} 의사</small>
                    </td>
                    <td>
                      <Badge tone={checked.includes(p[1]) ? "green" : "blue"}>
                        {checked.includes(p[1]) ? "접수완료" : "예약완료"}
                      </Badge>
                    </td>
                    <td>
                      {checked.includes(p[1]) ? (
                        <span className="complete-text">
                          <Icon name="check" size={15} /> 완료
                        </span>
                      ) : (
                        <Button onClick={() => setChecked([...checked, p[1]])}>접수</Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="waiting-panel">
          <div className="card-title">
            <div>
              <h2>현재 대기 환자</h2>
              <p>접수 순서대로 표시됩니다.</p>
            </div>
            <Badge tone="orange">{4 + checked.length - 1}명 대기</Badge>
          </div>
          {[
            ["1", "박서준", "09:28", "내과 · 이정훈", "진료 중"],
            ["2", "김하늘", "09:42", "내과 · 이정훈", "대기"],
            ["3", "이서아", "09:51", "이비인후과 · 최은영", "대기"],
            ["4", "정유진", "10:03", "피부과 · 김민서", "대기"],
          ].map((w, i) => (
            <div className={`wait-row ${i === 0 ? "now" : ""}`} key={w[0]}>
              <span className="queue">{w[0]}</span>
              <div>
                <b>{w[1]}</b>
                <small>접수 {w[2]}</small>
              </div>
              <span>{w[3]}</span>
              <Badge tone={i === 0 ? "mint" : "orange"}>{w[4]}</Badge>
            </div>
          ))}
          <Button variant="outline" className="wide" onClick={() => navigate("waiting")}>
            대기 목록 관리
          </Button>
        </section>
      </div>
    </>
  );
}

function DeskReservations({ navigate }: { navigate: (s: string) => void }) {
  const [checked, setChecked] = useState(["100086"]);
  return (
    <>
      <PageHeader
        title="오늘 예약 환자"
        description="2026년 11월 11일 · 당일 예약 환자의 내원 접수를 처리합니다."
      />
      <div className="toolbar">
        <div className="search">
          <Icon name="search" />
          <input placeholder="환자명 또는 환자번호 검색" />
        </div>
        <select>
          <option>전체 진료과</option>
          <option>내과</option>
          <option>피부과</option>
        </select>
        <select>
          <option>전체 상태</option>
          <option>예약완료</option>
          <option>접수완료</option>
        </select>
      </div>
      <div className="data-card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>예약시간</th>
                <th>환자번호</th>
                <th>환자명</th>
                <th>진료과</th>
                <th>담당의사</th>
                <th>상태</th>
                <th>처리</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p[1]}>
                  <td>
                    <b>{p[0]}</b>
                  </td>
                  <td className="code">{p[1]}</td>
                  <td>
                    <b>{p[2]}</b>
                  </td>
                  <td>{p[3]}</td>
                  <td>{p[4]}</td>
                  <td>
                    <Badge tone={checked.includes(p[1]) ? "green" : "blue"}>
                      {checked.includes(p[1]) ? "접수완료" : "예약완료"}
                    </Badge>
                  </td>
                  <td>
                    {checked.includes(p[1]) ? (
                      <button className="text-link" onClick={() => navigate("waiting")}>
                        대기목록 보기
                      </button>
                    ) : (
                      <Button onClick={() => setChecked([...checked, p[1]])}>접수</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function Waiting() {
  const [cancelled, setCancelled] = useState<string[]>([]);
  const rows = [
    ["V20261111-007", "09:28", "박서준", "이정훈", "진료 중", "박원무"],
    ["V20261111-008", "09:42", "김하늘", "이정훈", "대기", "박원무"],
    ["V20261111-009", "09:51", "이서아", "최은영", "대기", "강민지"],
    ["V20261111-010", "10:03", "정유진", "김민서", "대기", "박원무"],
    ["V20261111-006", "09:16", "오지호", "이정훈", "진료 완료", "강민지"],
  ];
  return (
    <>
      <PageHeader
        title="접수·대기 관리"
        description="접수 순서와 진료 상태를 실시간으로 확인합니다."
      />
      <div className="legend">
        <span>
          <i className="dot orange" />
          대기
        </span>
        <span>
          <i className="dot mint" />
          진료 중
        </span>
        <span>
          <i className="dot green" />
          진료 완료
        </span>
        <span>
          <i className="dot red" />
          취소
        </span>
      </div>
      <div className="data-card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>접수번호</th>
                <th>접수시간</th>
                <th>환자명</th>
                <th>담당의사</th>
                <th>진료상태</th>
                <th>처리 직원</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r[0]}>
                  <td className="code">{r[0]}</td>
                  <td>{r[1]}</td>
                  <td>
                    <b>{r[2]}</b>
                  </td>
                  <td>{r[3]} 의사</td>
                  <td>
                    <Badge
                      tone={
                        cancelled.includes(r[0])
                          ? "red"
                          : i === 0
                            ? "mint"
                            : i === 4
                              ? "green"
                              : "orange"
                      }
                    >
                      {cancelled.includes(r[0]) ? "취소" : r[4]}
                    </Badge>
                  </td>
                  <td>{r[5]}</td>
                  <td>
                    {r[4] === "대기" && !cancelled.includes(r[0]) && (
                      <Button
                        variant="danger-ghost"
                        onClick={() => setCancelled([...cancelled, r[0]])}
                      >
                        접수 취소
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function DoctorDashboard({ navigate }: { navigate: (s: string) => void }) {
  return (
    <>
      <PageHeader
        title="진료 대시보드"
        description="이정훈 의사 · 내과 · 2026년 11월 11일 수요일"
      />
      <div className="stats-grid three">
        <StatCard label="오늘 진료 환자" value="12명" helper="예약 기준" icon="calendar" />
        <StatCard
          label="현재 대기"
          value="4명"
          helper="평균 대기 18분"
          icon="users"
          tone="orange"
        />
        <StatCard label="진료 완료" value="3명" helper="진행률 25%" icon="check" tone="green" />
      </div>
      <section className="data-card doctor-list">
        <div className="card-title">
          <div>
            <h2>오늘의 대기 환자</h2>
            <p>현재 진료 중인 환자가 가장 먼저 표시됩니다.</p>
          </div>
          <span className="live">
            <i /> 실시간 현황
          </span>
        </div>
        <div className="current-patient">
          <div className="patient-order">진료 중</div>
          <EmptyAvatar name="박서준" />
          <div className="patient-name">
            <b>박서준</b>
            <span>만 52세 · 남성</span>
          </div>
          <div>
            <small>접수시간</small>
            <b>09:28</b>
          </div>
          <div>
            <small>주요 메모</small>
            <b>고혈압 약 복용 중</b>
          </div>
          <Button onClick={() => navigate("medical-record")}>
            진료 화면 열기 <Icon name="chevron" size={16} />
          </Button>
        </div>
        <div className="patient-list-head">
          <span>순서</span>
          <span>접수시간</span>
          <span>환자명</span>
          <span>나이 / 성별</span>
          <span>상태</span>
          <span></span>
        </div>
        {[
          ["1", "09:42", "김하늘", "만 34세 / 여성"],
          ["2", "10:03", "정유진", "만 28세 / 여성"],
          ["3", "10:17", "홍길동", "만 42세 / 남성"],
        ].map((r) => (
          <div className="patient-list-row" key={r[0]}>
            <span className="queue">{r[0]}</span>
            <b>{r[1]}</b>
            <span>
              <b>{r[2]}</b>
              <small>환자번호 100{r[0]}42</small>
            </span>
            <span>{r[3]}</span>
            <Badge tone="orange">대기</Badge>
            <Button variant="outline" onClick={() => navigate("medical-record")}>
              진료 시작
            </Button>
          </div>
        ))}
      </section>
    </>
  );
}

function MedicalRecord({ navigate }: { navigate: (s: string) => void }) {
  return (
    <>
      <PageHeader
        title="환자 진료기록"
        description="진료기록을 작성한 후 처방 단계로 진행하세요."
        actions={<Badge tone="mint">진료 중 · 09:35 시작</Badge>}
      />
      <div className="clinical-layout">
        <aside className="patient-panel">
          <div className="patient-profile">
            <EmptyAvatar name="박서준" />
            <div>
              <h2>박서준</h2>
              <p>환자번호 100086</p>
            </div>
          </div>
          <dl>
            <div>
              <dt>생년월일</dt>
              <dd>1974.03.18</dd>
            </div>
            <div>
              <dt>나이 / 성별</dt>
              <dd>만 52세 / 남성</dd>
            </div>
            <div>
              <dt>전화번호</dt>
              <dd>010-2345-6789</dd>
            </div>
          </dl>
          <div className="history-section">
            <h3>이전 진료 내역</h3>
            <div>
              <b>2026.11.01 · 내과</b>
              <span>고지혈증, 본태성 고혈압</span>
              <small>이정훈 의사</small>
            </div>
            <button>전체 내역 보기 →</button>
          </div>
          <div className="history-section">
            <h3>현재 복용 중인 약</h3>
            <div className="active-med">
              <Icon name="pill" size={18} />
              <span>
                <b>심바스타틴정 20mg</b>
                <small>11.01 처방 · 30일분 · 11.30 종료 예정</small>
              </span>
            </div>
            <Badge tone="orange">현재 복용 중</Badge>
          </div>
        </aside>
        <section className="clinical-form">
          <div className="card-title">
            <div>
              <h2>진료기록 입력</h2>
              <p>담당 의사만 작성 및 수정할 수 있습니다.</p>
            </div>
          </div>
          <label className="field">
            <span>
              증상 <i>*</i>
            </span>
            <textarea defaultValue="3일 전부터 시작된 기침과 가래, 인후통. 미열 동반. 야간에 기침이 심해 수면에 방해가 됨." />
          </label>
          <label className="field">
            <span>
              진단 <i>*</i>
            </span>
            <input defaultValue="급성 기관지염 의심" />
          </label>
          <label className="field">
            <span>
              진료 내용 <i>*</i>
            </span>
            <textarea
              className="large"
              defaultValue={
                "청진상 양측 폐음은 정상이며 천명음 없음. 인후부 경미한 발적 관찰됨.\n증상 완화를 위한 약물 치료 후 3일 뒤 경과 관찰하도록 안내함."
              }
            />
          </label>
          <div className="clinical-actions">
            <Button variant="outline">진료기록 저장</Button>
            <Button icon="pill" onClick={() => navigate("prescription")}>
              저장 후 처방 작성
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}

function Prescription({ navigate }: { navigate: (s: string) => void }) {
  const [added, setAdded] = useState(["아세트아미노펜정 500mg"]);
  const [warning, setWarning] = useState<"interaction" | "age" | null>(null);
  const [reason, setReason] = useState("");
  const [done, setDone] = useState(false);
  if (done)
    return (
      <div className="completion">
        <div className="success-icon">
          <Icon name="check" size={34} />
        </div>
        <h1>처방이 완료되었습니다</h1>
        <p>금기 확인 및 진료기록 저장이 완료되었습니다.</p>
        <div className="confirm-ticket mini">
          <div>
            <small>처방번호</small>
            <b>RX20261111-0037</b>
          </div>
          <Badge tone="green">처방완료</Badge>
          <hr />
          <dl>
            <div>
              <dt>환자</dt>
              <dd>{warning === "age" ? "김민준 (만 10세)" : "박서준 (100086)"}</dd>
            </div>
            <div>
              <dt>처방 약품</dt>
              <dd>{added.length}개 품목</dd>
            </div>
            <div>
              <dt>금기 기록</dt>
              <dd>{warning === "age" ? "연령금기 override 1건" : "병용금기 override 1건"}</dd>
            </div>
          </dl>
        </div>
        <Button onClick={() => navigate("doctor-home")}>대기 환자 목록으로</Button>
      </div>
    );
  return (
    <>
      <PageHeader
        title="처방 작성"
        description="박서준 · 만 52세 · 현재 복용약과 처방약의 금기를 자동 확인합니다."
        actions={
          <Button variant="outline" onClick={() => navigate("medical-record")}>
            진료기록으로
          </Button>
        }
      />
      <div className="rx-alert">
        <Icon name="shield" />
        <span>
          <b>DUR 금기 자동 확인</b>
          <small>처방 저장 시 병용금기와 환자 나이 기준 연령금기를 확인합니다.</small>
        </span>
        <Button
          variant="outline"
          onClick={() => {
            setReason("");
            setWarning("age");
          }}
        >
          연령금기 예시 보기
        </Button>
      </div>
      <div className="prescription-layout">
        <section className="drug-search">
          <h2>약품 검색</h2>
          <div className="search">
            <Icon name="search" />
            <input placeholder="약품명을 입력하세요" defaultValue="이트라코나졸" />
          </div>
          <div className="search-count">
            검색 결과 <b>2건</b>
          </div>
          {[
            ["이트라코나졸캡슐 100mg", "한국얀센", "진균 감염 치료"],
            ["이트라정 100mg", "대한약품", "피부 및 손발톱 진균증 치료"],
          ].map((d, i) => (
            <div className="drug-result" key={d[0]}>
              <div>
                <Badge tone="green">사용중</Badge>
                <h3>{d[0]}</h3>
                <small>{d[1]}</small>
                <p>{d[2]}</p>
              </div>
              <Button
                variant={added.includes(d[0]) ? "disabled" : "outline"}
                disabled={added.includes(d[0])}
                onClick={() => setAdded([...added, d[0]])}
              >
                {added.includes(d[0]) ? (
                  <>
                    <Icon name="check" size={15} /> 추가됨
                  </>
                ) : (
                  <>
                    <Icon name="plus" size={15} /> 처방에 추가
                  </>
                )}
              </Button>
            </div>
          ))}
        </section>
        <section className="rx-list">
          <div className="card-title">
            <div>
              <h2>현재 처방 약</h2>
              <p>약품별 복용 방법을 입력하세요.</p>
            </div>
            <Badge>{added.length}개 품목</Badge>
          </div>
          {added.map((name, i) => (
            <article className="rx-item" key={name}>
              <div className="rx-item-head">
                <span>{i + 1}</span>
                <div>
                  <h3>{name}</h3>
                  <small>{name.includes("이트라") ? "한국얀센" : "한미약품"}</small>
                </div>
                <button onClick={() => setAdded(added.filter((a) => a !== name))}>
                  <Icon name="close" size={17} />
                </button>
              </div>
              <div className="dose-grid">
                <label>
                  <span>1회 투약량</span>
                  <div>
                    <input defaultValue="1" />
                    <small>정</small>
                  </div>
                </label>
                <label>
                  <span>하루 횟수</span>
                  <select defaultValue={i === 0 ? "3" : "1"}>
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                  </select>
                </label>
                <label>
                  <span>투여 간격</span>
                  <select>
                    <option>매일</option>
                    <option>2일마다</option>
                  </select>
                </label>
                <label>
                  <span>총 투약일수</span>
                  <div>
                    <input defaultValue={i === 0 ? "3" : "7"} />
                    <small>일</small>
                  </div>
                </label>
                <label>
                  <span>복용 시점</span>
                  <select>
                    <option>식후</option>
                    <option>식전</option>
                    <option>취침 전</option>
                  </select>
                </label>
                <label className="directions">
                  <span>복용 방법</span>
                  <input defaultValue="충분한 물과 함께 복용하세요." />
                </label>
              </div>
            </article>
          ))}
          <div className="rx-actions">
            <Button
              icon="shield"
              onClick={() => {
                setReason("");
                setWarning("interaction");
              }}
              disabled={added.length < 2}
            >
              금기 확인 후 처방 저장
            </Button>
          </div>
        </section>
        <aside className="current-meds">
          <div className="card-title">
            <div>
              <h2>현재 복용 중 약</h2>
              <p>다른 진료 처방 포함</p>
            </div>
            <Badge tone="orange">1건</Badge>
          </div>
          <div className="current-med-card">
            <span className="med-pill">
              <Icon name="pill" />
            </span>
            <div>
              <h3>심바스타틴정 20mg</h3>
              <p>고지혈증 치료제</p>
              <dl>
                <div>
                  <dt>처방일</dt>
                  <dd>2026.11.01</dd>
                </div>
                <div>
                  <dt>투약기간</dt>
                  <dd>30일분</dd>
                </div>
                <div>
                  <dt>복용 종료</dt>
                  <dd>2026.11.30</dd>
                </div>
              </dl>
              <Badge tone="orange">현재 복용 중</Badge>
            </div>
          </div>
          <div className="current-note">
            <Icon name="warning" size={16} /> 투약 종료일이 지나지 않은 처방만 표시됩니다.
          </div>
        </aside>
      </div>
      {warning && (
        <div className="modal-layer">
          <div className="modal warning-modal">
            <button className="modal-close" onClick={() => setWarning(null)}>
              <Icon name="close" />
            </button>
            <div className="warning-icon">
              <Icon name="warning" size={30} />
            </div>
            <span className="warning-label">DUR SAFETY ALERT</span>
            <h2>
              {warning === "interaction"
                ? "병용금기 약품이 확인되었습니다."
                : "연령금기 약품이 확인되었습니다."}
            </h2>
            <p>
              {warning === "interaction"
                ? "현재 처방 약과 환자가 복용 중인 약의 병용금기를 확인했습니다."
                : "환자의 만 나이를 기준으로 연령금기를 확인했습니다."}
            </p>
            {warning === "interaction" ? (
              <div className="conflict-box">
                <div>
                  <small>현재 처방 약</small>
                  <b>이트라코나졸캡슐 100mg</b>
                </div>
                <span>+</span>
                <div>
                  <small>현재 복용 중인 약</small>
                  <b>심바스타틴정 20mg</b>
                </div>
              </div>
            ) : (
              <div className="age-conflict-box">
                <div>
                  <small>환자 나이</small>
                  <b>김민준 · 2016.06.15 · 만 10세</b>
                </div>
                <div>
                  <small>처방 약품</small>
                  <b>코데인 함유 진해제 시럽</b>
                </div>
                <div>
                  <small>금기 기준</small>
                  <b>12세 미만</b>
                </div>
              </div>
            )}
            <div className="risk-content">
              <b>
                <Icon name="warning" size={17} /> 금기 내용
              </b>
              <p>
                {warning === "interaction"
                  ? "동시 복용 시 근육 손상 위험이 증가할 수 있습니다."
                  : "소아 호흡 억제 위험"}
              </p>
            </div>
            <label className="field">
              <span>
                금기 처방 사유 <i>*</i>
              </span>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="금기 약품을 그대로 처방해야 하는 임상적 사유를 입력하세요."
              />
              <small className={reason ? "valid" : "required"}>
                {reason ? (
                  <>
                    <Icon name="check" size={13} /> 사유가 입력되었습니다.
                  </>
                ) : (
                  "사유 입력 없이는 처방을 진행할 수 없습니다."
                )}
              </small>
            </label>
            <div className="modal-actions">
              <Button variant="outline" onClick={() => setWarning(null)}>
                약 변경
              </Button>
              <Button variant="danger" disabled={!reason.trim()} onClick={() => setDone(true)}>
                사유 입력 후 그대로 처방
              </Button>
            </div>
            <p className="override-note">
              <Icon name="shield" size={15} /> 금기 종류, 관련 약품, 금기 내용, 처방 강행 사유, 담당
              의사, 기록 시각이 금기 확인 기록에 저장됩니다.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

const billing = [
  ["V20261111-006", "오지호", "내과", "이정훈", "09:42", "초진", "18,000원"],
  ["V20261111-011", "한예린", "피부과", "김민서", "10:08", "재진", "15,000원"],
  ["V20261111-012", "서지안", "이비인후과", "최은영", "10:21", "초진", "18,000원"],
];

function CashierHome({ navigate }: { navigate: (s: string) => void }) {
  return (
    <>
      <PageHeader
        title="수납 대시보드"
        description="진료 완료 환자의 결제를 처리하고 문서를 발급합니다."
      />
      <div className="stats-grid three">
        <StatCard
          label="결제 대기"
          value="3명"
          helper="진료 완료 기준"
          icon="clock"
          tone="orange"
        />
        <StatCard
          label="오늘 결제 완료"
          value="18건"
          helper="중복 결제 0건"
          icon="check"
          tone="green"
        />
        <StatCard label="오늘 결제 금액" value="312,000원" helper="진찰료 합계" icon="receipt" />
      </div>
      <section className="data-card">
        <div className="card-title">
          <div>
            <h2>결제 대기 환자</h2>
            <p>실제 카드 결제 없이 결제 완료 상태만 처리합니다.</p>
          </div>
          <Badge tone="orange">3건</Badge>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>접수번호</th>
                <th>환자명</th>
                <th>진료과</th>
                <th>담당의사</th>
                <th>진료완료시간</th>
                <th>진찰 구분</th>
                <th>진찰료</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {billing.map((r) => (
                <tr key={r[0]}>
                  <td className="code">{r[0]}</td>
                  <td>
                    <b>{r[1]}</b>
                  </td>
                  <td>{r[2]}</td>
                  <td>{r[3]}</td>
                  <td>{r[4]}</td>
                  <td>
                    <Badge tone={r[5] === "초진" ? "blue" : "gray"}>{r[5]}</Badge>
                  </td>
                  <td>
                    <b>{r[6]}</b>
                  </td>
                  <td>
                    <Button onClick={() => navigate("payment")}>결제</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function PrescriptionDocument({ close }: { close: () => void }) {
  return (
    <div className="document-page prescription-doc">
      <div className="doc-brand">
        <span className="brand-mark">
          <Icon name="logo" />
        </span>
        <span>
          <b>온케어의원</b>
          <small>ONCARE CLINIC</small>
        </span>
      </div>
      <h1>처 방 전</h1>
      <p className="doc-number">처방번호 RX20261111-0031</p>
      <div className="doc-rule" />
      <dl className="doc-details two">
        <div>
          <dt>환자명</dt>
          <dd>오지호</dd>
        </div>
        <div>
          <dt>처방일</dt>
          <dd>2026.11.11</dd>
        </div>
        <div>
          <dt>진료과</dt>
          <dd>내과</dd>
        </div>
        <div>
          <dt>담당 의사</dt>
          <dd>이정훈 의사</dd>
        </div>
      </dl>
      <table className="doc-table">
        <thead>
          <tr>
            <th>약품명</th>
            <th>1회</th>
            <th>하루</th>
            <th>간격</th>
            <th>일수</th>
            <th>시점</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>아세트아미노펜정 500mg</td>
            <td>1정</td>
            <td>3회</td>
            <td>매일</td>
            <td>3일</td>
            <td>식후</td>
          </tr>
          <tr>
            <td>레보세티리진정 5mg</td>
            <td>1정</td>
            <td>1회</td>
            <td>매일</td>
            <td>3일</td>
            <td>취침 전</td>
          </tr>
        </tbody>
      </table>
      <div className="directions-box">
        <b>복용 방법</b>
        <p>충분한 물과 함께 복용하십시오. 졸음이 올 수 있으므로 운전 시 주의하세요.</p>
      </div>
      <div className="doctor-sign">
        처방의사 <b>이정훈</b> (서명)
      </div>
      <div className="document-actions">
        <Button variant="outline" onClick={close}>
          닫기
        </Button>
        <Button icon="print" onClick={() => window.print()}>
          처방전 인쇄
        </Button>
      </div>
    </div>
  );
}

function Payment({ navigate }: { navigate: (s: string) => void }) {
  const [paid, setPaid] = useState(false);
  const [doc, setDoc] = useState<"receipt" | "rx" | null>(null);
  if (doc === "receipt") return <Receipt close={() => setDoc(null)} />;
  if (doc === "rx") return <PrescriptionDocument close={() => setDoc(null)} />;
  return (
    <>
      <PageHeader
        title="진료비 결제"
        description="진찰료와 환자 정보를 확인한 후 결제를 완료해 주세요."
        actions={
          <Button variant="outline" onClick={() => navigate("cashier-home")}>
            목록으로
          </Button>
        }
      />
      <div className="payment-layout">
        <section className="payment-card">
          <div className="card-title">
            <div>
              <h2>환자 및 진료 정보</h2>
              <p>접수번호 V20261111-006</p>
            </div>
            <Badge tone={paid ? "green" : "orange"}>{paid ? "결제완료" : "결제대기"}</Badge>
          </div>
          <dl className="payment-info">
            <div>
              <dt>환자명</dt>
              <dd>오지호</dd>
            </div>
            <div>
              <dt>환자번호</dt>
              <dd>100135</dd>
            </div>
            <div>
              <dt>진료일</dt>
              <dd>2026년 11월 11일</dd>
            </div>
            <div>
              <dt>진료과</dt>
              <dd>내과</dd>
            </div>
            <div>
              <dt>담당 의사</dt>
              <dd>이정훈 의사</dd>
            </div>
            <div>
              <dt>접수번호</dt>
              <dd className="code">V20261111-006</dd>
            </div>
            <div>
              <dt>진찰 구분</dt>
              <dd>
                <Badge>초진</Badge>
              </dd>
            </div>
            <div>
              <dt>진찰료</dt>
              <dd>18,000원</dd>
            </div>
          </dl>
        </section>
        <aside className="charge-card">
          <span className="section-kicker">CONSULTATION FEE</span>
          <h2>초진 진찰료</h2>
          <p>과거 진료 완료 기록이 없어 시스템에서 초진으로 자동 판정했습니다.</p>
          <div className="fee-amount">
            <small>결제 금액</small>
            <strong>
              18,000<em>원</em>
            </strong>
          </div>
          <div className="fee-note">
            <Icon name="shield" size={17} />
            <span>
              2026.11.01부터 적용된 진찰료입니다.
              <br />
              보험 및 약값은 포함하지 않습니다.
            </span>
          </div>
          {!paid ? (
            <Button className="wide" onClick={() => setPaid(true)}>
              결제 완료
            </Button>
          ) : (
            <div className="payment-success">
              <div>
                <Icon name="check" />
                <span>
                  <b>결제가 정상적으로 처리되었습니다.</b>
                  <small>2026.11.11 10:03 · 최수납</small>
                </span>
              </div>
              <Button variant="outline" onClick={() => setDoc("receipt")}>
                <Icon name="receipt" /> 전자영수증 보기
              </Button>
              <Button onClick={() => setDoc("rx")}>
                <Icon name="print" /> 처방전 출력
              </Button>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}

const adminCards = [
  ["등록된 진료과", "4개", "file", "departments"],
  ["활성 의사", "8명", "users", "doctors"],
  ["등록 약품", "326개", "pill", "medicines"],
  ["병용금기 수", "84건", "warning", "interactions"],
  ["연령금기 수", "29건", "warning", "age-rules"],
];

function AdminHome({ navigate }: { navigate: (s: string) => void }) {
  return (
    <>
      <PageHeader
        title="관리자 대시보드"
        description="병원 운영 기준정보와 사용자 권한을 관리합니다."
      />
      <div className="admin-summary">
        {adminCards.map((c) => (
          <button key={c[0]} onClick={() => navigate(c[3])}>
            <span className="admin-icon">
              <Icon name={c[2]} />
            </span>
            <span>
              <small>{c[0]}</small>
              <b>{c[1]}</b>
            </span>
            <Icon name="chevron" size={17} />
          </button>
        ))}
      </div>
      <section className="admin-highlight admin-safety">
        <span className="highlight-icon">
          <Icon name="shield" size={25} />
        </span>
        <div>
          <h3>처방 안전 기준 관리</h3>
          <p>약품과 병용·연령금기 정보는 의사의 처방 저장 전 안전성 확인에 사용됩니다.</p>
        </div>
        <button onClick={() => navigate("interactions")}>
          병용금기 관리 <Icon name="chevron" size={15} />
        </button>
        <button onClick={() => navigate("age-rules")}>
          연령금기 관리 <Icon name="chevron" size={15} />
        </button>
      </section>
    </>
  );
}

function AdminTable({ type }: { type: string }) {
  const [modal, setModal] = useState(false);
  const config: Record<
    string,
    { title: string; desc: string; button: string; heads: string[]; rows: string[][] }
  > = {
    departments: {
      title: "진료과 관리",
      desc: "환자 예약에 노출되는 진료과를 관리합니다.",
      button: "진료과 등록",
      heads: ["진료과 코드", "진료과명", "소속 의사", "사용상태"],
      rows: [
        ["D001", "내과", "3명", "사용중"],
        ["D002", "소아청소년과", "2명", "사용중"],
        ["D003", "이비인후과", "1명", "사용중"],
        ["D004", "피부과", "2명", "사용중"],
      ],
    },
    accounts: {
      title: "사용자 계정 관리",
      desc: "역할별 계정과 사용 상태를 관리합니다.",
      button: "직원 계정 등록",
      heads: ["계정 ID", "이름", "역할", "생성일", "상태"],
      rows: [
        ["doctor01", "이정훈", "의사", "2026.03.02", "사용중"],
        ["desk01", "박원무", "원무 직원", "2026.03.02", "사용중"],
        ["cashier01", "최수납", "수납 담당자", "2026.04.11", "사용중"],
        ["patient01", "홍길동", "환자", "2026.06.28", "사용중"],
      ],
    },
    medicines: {
      title: "약품 관리",
      desc: "처방과 복약 안내에 사용하는 약품 기준정보를 관리합니다.",
      button: "약품 등록",
      heads: ["품목기준코드", "제품명", "업체명", "주요 효능", "사용상태"],
      rows: [
        ["202300112", "아세트아미노펜정 500mg", "한미약품", "해열 및 진통", "사용중"],
        ["202108421", "심바스타틴정 20mg", "유한양행", "고지혈증 치료", "사용중"],
        ["201906712", "이트라코나졸캡슐 100mg", "한국얀센", "진균 감염 치료", "사용중"],
        ["201508813", "코데인 함유 진해제 시럽", "대한약품", "기침 억제", "사용중지"],
      ],
    },
    interactions: {
      title: "병용금기 관리",
      desc: "두 약품의 동시 복용 위험 기준을 관리합니다.",
      button: "병용금기 등록",
      heads: ["약품 A", "약품 B", "금기 내용", "등록일"],
      rows: [
        [
          "심바스타틴정 20mg",
          "이트라코나졸캡슐 100mg",
          "동시 복용 시 근육 손상 위험 증가",
          "2026.08.01",
        ],
        ["와파린정 5mg", "아스피린정 100mg", "출혈 위험 증가", "2026.08.01"],
        ["클라리스로마이신정", "콜히친정", "콜히친 독성 위험 증가", "2026.09.14"],
      ],
    },
    "age-rules": {
      title: "연령금기 관리",
      desc: "환자 만 나이를 기준으로 처방 제한 조건을 관리합니다.",
      button: "연령금기 등록",
      heads: ["약품", "기준 나이", "조건", "금기 내용"],
      rows: [
        ["코데인 함유 진해제 시럽", "12세", "미만", "소아 호흡 억제 위험"],
        ["아스피린정 100mg", "16세", "미만", "레이 증후군 위험"],
        ["독시사이클린정 100mg", "8세", "미만", "치아 변색 및 법랑질 형성 저하"],
      ],
    },
  };
  const c = config[type] || config.departments;
  return (
    <>
      <PageHeader
        title={c.title}
        description={c.desc}
        actions={
          <Button icon="plus" onClick={() => setModal(true)}>
            {c.button}
          </Button>
        }
      />
      <div className="toolbar">
        <div className="search">
          <Icon name="search" />
          <input placeholder="검색어를 입력하세요" />
        </div>
        <select>
          <option>전체 상태</option>
          <option>사용중</option>
          <option>사용중지</option>
        </select>
        <Button variant="outline">검색</Button>
      </div>
      <div className="data-card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {c.heads.map((h) => (
                  <th key={h}>{h}</th>
                ))}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {c.rows.map((r, i) => (
                <tr key={i}>
                  {r.map((v, j) => (
                    <td
                      key={j}
                      className={
                        j === 0 && type !== "interactions" && type !== "age-rules" ? "code" : ""
                      }
                    >
                      {j === 1 || (j === 0 && type === "age-rules") ? (
                        <b>{v}</b>
                      ) : v === "사용중" ? (
                        <Badge tone="green">{v}</Badge>
                      ) : v === "사용중지" ? (
                        <Badge tone="gray">{v}</Badge>
                      ) : (
                        v
                      )}
                    </td>
                  ))}
                  <td>
                    <button className="text-link">상세 / 수정</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {type === "medicines" && (
        <div className="medicine-detail-preview">
          <div>
            <span className="section-kicker">SELECTED MEDICINE</span>
            <h3>아세트아미노펜정 500mg</h3>
            <p>품목기준코드 202300112 · 한미약품</p>
          </div>
          <dl>
            <div>
              <dt>효능</dt>
              <dd>감기로 인한 발열 및 통증 완화</dd>
            </div>
            <div>
              <dt>사용법</dt>
              <dd>성인 1회 1~2정, 1일 3~4회 복용</dd>
            </div>
            <div>
              <dt>주의사항</dt>
              <dd>일일 최대 복용량을 초과하지 마십시오.</dd>
            </div>
            <div>
              <dt>보관법</dt>
              <dd>실온, 습기를 피해 보관</dd>
            </div>
          </dl>
        </div>
      )}
      {modal && (
        <div className="modal-layer">
          <div className="modal small-modal">
            <button className="modal-close" onClick={() => setModal(false)}>
              <Icon name="close" />
            </button>
            <span className="section-kicker">NEW RECORD</span>
            <h2>{c.button}</h2>
            <p>업무에 사용할 기준정보를 입력하세요.</p>
            <label className="field">
              <span>명칭 / 약품</span>
              <input placeholder="내용을 입력하세요" />
            </label>
            <label className="field">
              <span>상세 내용</span>
              <textarea placeholder="상세 내용을 입력하세요" />
            </label>
            <div className="modal-actions">
              <Button variant="outline" onClick={() => setModal(false)}>
                취소
              </Button>
              <Button onClick={() => setModal(false)}>등록</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Fees() {
  const [modal, setModal] = useState(false);
  return (
    <>
      <PageHeader
        title="진찰료 관리"
        description="초진·재진 진찰료의 적용 이력을 관리합니다."
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
            기존 금액은 삭제하지 않으며, 적용 시작일을 기준으로 진료 시점의 진찰료가 결정됩니다.
          </small>
        </span>
      </div>
      <div className="data-card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>진찰료 구분</th>
                <th>금액</th>
                <th>적용 시작일</th>
                <th>등록자</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <b>초진</b>
                </td>
                <td>
                  <b>18,000원</b>
                </td>
                <td>2026.11.01</td>
                <td>관리자</td>
                <td>
                  <Badge tone="green">적용중</Badge>
                </td>
              </tr>
              <tr>
                <td>
                  <b>재진</b>
                </td>
                <td>
                  <b>15,000원</b>
                </td>
                <td>2026.11.01</td>
                <td>관리자</td>
                <td>
                  <Badge tone="green">적용중</Badge>
                </td>
              </tr>
              <tr className="muted-row">
                <td>초진</td>
                <td>17,000원</td>
                <td>2026.03.01</td>
                <td>박관리</td>
                <td>
                  <Badge tone="gray">적용종료</Badge>
                </td>
              </tr>
              <tr className="muted-row">
                <td>재진</td>
                <td>14,000원</td>
                <td>2026.03.01</td>
                <td>박관리</td>
                <td>
                  <Badge tone="gray">적용종료</Badge>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      {modal && (
        <div className="modal-layer">
          <div className="modal small-modal">
            <button className="modal-close" onClick={() => setModal(false)}>
              <Icon name="close" />
            </button>
            <span className="section-kicker">FEE REVISION</span>
            <h2>진찰료 변경</h2>
            <p>새 금액은 적용 시작일부터 사용되며 기존 이력은 유지됩니다.</p>
            <label className="field">
              <span>진찰료 구분</span>
              <select>
                <option>초진</option>
                <option>재진</option>
              </select>
            </label>
            <label className="field">
              <span>변경 금액</span>
              <div className="input-suffix">
                <input defaultValue="18000" />
                <span>원</span>
              </div>
            </label>
            <label className="field">
              <span>적용 시작일</span>
              <input type="date" defaultValue="2026-12-01" />
            </label>
            <div className="modal-actions">
              <Button variant="outline" onClick={() => setModal(false)}>
                취소
              </Button>
              <Button onClick={() => setModal(false)}>변경 예약</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function App() {
  const [role, setRole] = useState<Role | null>(null);
  const [screen, setScreen] = useState<Screen>("login");
  const login = (r: Role) => {
    setRole(r);
    setScreen(`${r}-home`);
  };
  const logout = () => {
    setRole(null);
    setScreen("login");
  };
  const content = useMemo(() => {
    if (!role) return null;
    switch (screen) {
      case "patient-home":
        return <PatientHome navigate={setScreen} />;
      case "booking":
        return <Booking navigate={setScreen} />;
      case "reservations":
        return <Reservations navigate={setScreen} />;
      case "records":
        return <Records navigate={setScreen} />;
      case "med-guide":
        return <MedGuide />;
      case "receipts":
        return <Receipts />;
      case "patient-info":
        return <PatientInfo />;
      case "desk-home":
        return <DeskDashboard navigate={setScreen} />;
      case "desk-reservations":
        return <DeskReservations navigate={setScreen} />;
      case "waiting":
        return <Waiting />;
      case "doctor-home":
        return <DoctorDashboard navigate={setScreen} />;
      case "medical-record":
      case "doctor-records":
        return <MedicalRecord navigate={setScreen} />;
      case "doctor-schedule":
        return <ScheduleView />;
      case "prescription":
        return <Prescription navigate={setScreen} />;
      case "cashier-home":
        return <CashierHome navigate={setScreen} />;
      case "cashier-history":
        return <Receipts />;
      case "payment":
        return <Payment navigate={setScreen} />;
      case "admin-home":
        return <AdminHome navigate={setScreen} />;
      case "doctors":
        return <ScheduleView editable />;
      case "fees":
        return <Fees />;
      default:
        return <AdminTable type={screen} />;
    }
  }, [role, screen]);
  if (!role && screen === "signup") return <Signup back={() => setScreen("login")} />;
  if (!role) return <Login onLogin={login} navigate={setScreen} />;
  return (
    <AppShell role={role} screen={screen} navigate={setScreen} logout={logout}>
      {content}
    </AppShell>
  );
}
