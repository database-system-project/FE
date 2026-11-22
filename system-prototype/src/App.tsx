import { useEffect, useState, useMemo } from "react";
import { type Role, type Screen } from "./types";
import { useAuth } from "./auth/AuthContext";
import { AppShell } from "./components/AppShell";
import { Login } from "./pages/auth/Login";
import { Signup } from "./pages/auth/Signup";
import { PatientHome } from "./pages/patient/PatientHome";
import { Booking } from "./pages/patient/Booking";
import { Reservations } from "./pages/patient/Reservations";
import { Records } from "./pages/patient/Records";
import { MedGuide } from "./pages/patient/MedGuide";
import { PatientInfo } from "./pages/patient/PatientInfo";
import { PaymentHistory } from "./pages/cashier/PaymentHistory";
import { MyReceipts } from "./pages/patient/MyReceipts";
import { DeskDashboard } from "./pages/desk/DeskDashboard";
import { DeskReservations } from "./pages/desk/DeskReservations";
import { Waiting } from "./pages/desk/Waiting";
import { PatientCorrection } from "./pages/desk/PatientCorrection";
import { DoctorDashboard } from "./pages/doctor/DoctorDashboard";
import { MedicalRecord } from "./pages/doctor/MedicalRecord";
import { Prescription } from "./pages/doctor/Prescription";
import { DoctorSchedule } from "./pages/doctor/DoctorSchedule";
import { CashierHome } from "./pages/cashier/CashierHome";
import { Payment } from "./pages/cashier/Payment";
import { AdminHome } from "./pages/admin/AdminHome";
import { Fees } from "./pages/admin/Fees";
import { Departments } from "./pages/admin/Departments";
import { Accounts } from "./pages/admin/Accounts";
import { Medicines } from "./pages/admin/Medicines";
import { DurRules } from "./pages/admin/DurRules";
import { DoctorsSchedules } from "./pages/admin/DoctorsSchedules";

const homeOf = (role: Role | null): Screen => (role ? `${role}-home` : "login");

export default function App() {
  // 로그인 정보는 AuthContext가 관리한다 (src/auth/AuthContext.tsx)
  const { role, logout } = useAuth();
  const [screen, setScreen] = useState<Screen>(() => homeOf(role));
  // 로그인하면 역할별 첫 화면으로, 로그아웃(또는 토큰 만료)하면 로그인 화면으로
  useEffect(() => {
    setScreen(homeOf(role));
  }, [role]);
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
        return <MyReceipts />;
      case "patient-info":
        return <PatientInfo />;
      case "desk-home":
        return <DeskDashboard navigate={setScreen} />;
      case "desk-reservations":
        return <DeskReservations navigate={setScreen} />;
      case "waiting":
        return <Waiting />;
      case "patient-correction":
        return <PatientCorrection />;
      case "doctor-home":
        return <DoctorDashboard navigate={setScreen} />;
      case "medical-record":
      case "doctor-records":
        return <MedicalRecord navigate={setScreen} />;
      case "doctor-schedule":
        return <DoctorSchedule />;
      case "prescription":
        return <Prescription navigate={setScreen} />;
      case "cashier-home":
        return <CashierHome navigate={setScreen} />;
      case "cashier-history":
        return <PaymentHistory />;
      case "payment":
        return <Payment navigate={setScreen} />;
      case "admin-home":
        return <AdminHome navigate={setScreen} />;
      case "departments":
        return <Departments />;
      case "doctors":
        return <DoctorsSchedules />;
      case "accounts":
        return <Accounts />;
      case "medicines":
        return <Medicines />;
      case "interactions":
      case "age-rules":
        return <DurRules key={screen} kind={screen} />;
      case "fees":
        return <Fees />;
      default:
        return null;
    }
  }, [role, screen]);
  if (!role && screen === "signup") return <Signup back={() => setScreen("login")} />;
  if (!role) return <Login navigate={setScreen} />;
  return (
    <AppShell role={role} screen={screen} navigate={setScreen} logout={logout}>
      {content}
    </AppShell>
  );
}
