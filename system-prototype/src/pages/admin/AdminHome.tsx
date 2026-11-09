import { adminCards } from "../../mocks/data";
import { Icon } from "../../components/Icon";
import { PageHeader } from "../../components/PageHeader";

export function AdminHome({ navigate }: { navigate: (s: string) => void }) {
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
