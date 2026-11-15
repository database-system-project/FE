import { Icon } from "../../components/Icon";
import { Button } from "../../components/Button";
import { PageHeader } from "../../components/PageHeader";

/** 진료 중인 환자가 없을 때 진료기록·처방 화면에 보여준다 */
export function NoCurrentVisit({ navigate }: { navigate: (s: string) => void }) {
  return (
    <>
      <PageHeader title="환자 진료기록" description="진료 중인 환자의 기록과 처방을 작성합니다." />
      <section className="data-card empty-visit">
        <Icon name="users" size={30} />
        <h2>진료 중인 환자가 없습니다</h2>
        <p>대시보드에서 대기 순서가 된 환자의 진료를 시작하면 이 화면에서 기록을 작성할 수 있습니다.</p>
        <Button onClick={() => navigate("doctor-home")}>대기 환자 목록으로</Button>
      </section>
    </>
  );
}
