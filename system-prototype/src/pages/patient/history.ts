import { patientApi } from "../../api/patient";
import type { PatientVisit, PatientVisitDetail } from "../../api/types";

// 진료 내역·복약 안내·영수증·홈 화면이 같이 쓰는 이용내역 불러오기

export type VisitHistory = PatientVisit & { detail: PatientVisitDetail };

/**
 * 진료 완료 목록 + 각 진료의 상세(진단·처방 목록).
 * 목록 API에 진단·처방이 없어서 상세를 함께 받는다 (환자 1명의 진료 건수라 많지 않다).
 */
export async function loadHistory(): Promise<VisitHistory[]> {
  const { items } = await patientApi.visits();
  const details = await Promise.all(items.map((v) => patientApi.visit(v.visitId)));
  return items.map((v, i) => ({ ...v, detail: details[i] }));
}

/** 유효한(취소되지 않은) 처방을 최신순으로, 어느 진료의 처방인지와 함께 */
export function activePrescriptions(history: VisitHistory[]) {
  return history.flatMap((v) =>
    v.detail.prescriptions
      .filter((p) => p.status === "ACTIVE")
      .map((p) => ({ ...p, visit: v }))
      .reverse(),
  );
}

// 화면 전환이 주소가 아니라 문자열이라, 진료 내역에서 고른 처방·영수증 번호를 여기 잠깐 담아 두고 넘어간다.
let prescriptionId: number | null = null;
let paymentId: number | null = null;

export const historySelection = {
  setPrescription: (id: number | null) => {
    prescriptionId = id;
  },
  /** 한 번 읽으면 비운다 (메뉴로 다시 들어오면 기본 선택으로) */
  takePrescription: () => {
    const id = prescriptionId;
    prescriptionId = null;
    return id;
  },
  setPayment: (id: number | null) => {
    paymentId = id;
  },
  takePayment: () => {
    const id = paymentId;
    paymentId = null;
    return id;
  },
};
