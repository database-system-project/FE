import { Icon } from "../../components/Icon";
import { PageHeader } from "../../components/PageHeader";
import { adminApi } from "../../api/admin";
import { useApi } from "../../api/useApi";

// 현황 숫자는 각 목록 API의 개수로 계산한다 (별도 통계 API 없음)
async function loadSummary() {
  const [departments, doctors, medications, interactions, ageRules] = await Promise.all([
    adminApi.departments({ active: true }),
    adminApi.doctors({ active: true }),
    adminApi.medications({ active: true }),
    adminApi.interactions(),
    adminApi.ageRules(),
  ]);
  return {
    departments: departments.items.length,
    doctors: doctors.items.length,
    medications: medications.items.length,
    interactions: interactions.items.length,
    ageRules: ageRules.items.length,
  };
}

export function AdminHome({ navigate }: { navigate: (s: string) => void }) {
  const { data, error } = useApi(loadSummary, []);
  const value = (n: number | undefined, unit: string) => (n === undefined ? "…" : `${n}${unit}`);
  const cards = [
    ["사용중인 진료과", value(data?.departments, "개"), "file", "departments"],
    ["활성 의사", value(data?.doctors, "명"), "users", "doctors"],
    ["사용중인 약품", value(data?.medications, "개"), "pill", "medicines"],
    ["병용금기 수", value(data?.interactions, "건"), "warning", "interactions"],
    ["연령금기 수", value(data?.ageRules, "건"), "warning", "age-rules"],
  ];

  return (
    <>
      <PageHeader title="관리자 대시보드" description="병원 운영 기준정보와 사용자 권한을 관리합니다." />
      {error && <p className="form-error">{error}</p>}
      <div className="admin-summary">
        {cards.map((c) => (
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
