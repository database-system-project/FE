import { doctorApi } from "../../api/doctor";
import { useApi } from "../../api/useApi";
import type { DoctorVisitDetail } from "../../api/types";

/**
 * 지금 진료 중인 내 환자의 상세. 없으면 null.
 * 의사당 진행 중 진료는 서버 규칙상 1건이라, 화면끼리 visitId를 넘기지 않고 대기열에서 찾는다.
 */
async function loadCurrentVisit(): Promise<DoctorVisitDetail | null> {
  const { items } = await doctorApi.queue("IN_PROGRESS");
  if (items.length === 0) return null;
  return doctorApi.visit(items[0].visitId);
}

export function useCurrentVisit() {
  return useApi(loadCurrentVisit, []);
}
