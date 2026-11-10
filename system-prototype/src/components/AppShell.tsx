import { useState, type ReactNode } from "react";
import { type Role, type Screen } from "../types";
import { roleLabel } from "../constants/roles";
import { menus } from "../constants/menus";
import { Icon } from "./Icon";
import { EmptyAvatar } from "./EmptyAvatar";

export function AppShell({
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
