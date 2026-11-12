import { ApiError } from "../../api/client";
import { receptionApi } from "../../api/reception";

/** 접수 처리 후 화면에 띄울 문구를 돌려준다. ok가 false면 실패 */
export async function checkInWithMessage(appointmentId: number, patientName: string) {
  try {
    const res = await receptionApi.checkIn(appointmentId);
    return { ok: true, text: `${patientName}님 접수 완료 · 접수번호 ${res.visit.receptionCode}` };
  } catch (e) {
    if (e instanceof ApiError && e.code === "ALREADY_CHECKED_IN")
      return { ok: false, text: `${patientName}님은 이미 접수된 예약입니다.` };
    if (e instanceof ApiError && e.code === "INVALID_APPOINTMENT_STATE")
      return { ok: false, text: "오늘 마감(17:00) 전의 예약완료 상태만 접수할 수 있습니다." };
    return { ok: false, text: e instanceof ApiError ? e.message : "접수 중 문제가 발생했습니다." };
  }
}
