import type { BillingVisit } from "../../api/types";

// 수납 대시보드에서 "결제"를 누른 접수를 결제 화면으로 넘긴다 (화면 전환이 주소 없이 이름으로만 되기 때문)
let target: BillingVisit | null = null;

export const billingTarget = {
  set: (visit: BillingVisit | null) => {
    target = visit;
  },
  get: () => target,
};
