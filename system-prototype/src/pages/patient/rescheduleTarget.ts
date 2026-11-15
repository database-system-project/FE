import type { PatientAppointment } from "../../api/types";

// 예약 조회 화면에서 "예약 변경"을 누르면 바꿀 예약을 여기 잠깐 담아 두고 예약 화면으로 넘어간다.
// (화면 전환이 주소가 아니라 문자열로 되어 있어서 값을 넘길 곳이 없기 때문)

let target: PatientAppointment | null = null;

export const rescheduleTarget = {
  set: (a: PatientAppointment | null) => {
    target = a;
  },
  get: () => target,
};
