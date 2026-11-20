import { api } from "./client";
import type { BillingQuote, BillingVisit, ListResponse, PaymentResult, PrescriptionPrint, Receipt } from "./types";

// 수납(CASHIER) 화면에서 쓰는 API

export const billingApi = {
  /** 진료 완료된 접수 목록. 기간을 안 주면 오늘, paymentStatus로 결제 전/후만 골라 볼 수 있다 */
  visits: (params: { paymentStatus?: "UNPAID" | "PAID"; from?: string; to?: string } = {}) =>
    api.get<ListResponse<BillingVisit>>("/billing/visits", params),

  /** 한 접수의 금액 정보 (초진·재진은 서버가 판정) */
  quote: (visitId: number) => api.get<BillingQuote>(`/billing/visits/${visitId}`),

  /** 결제 완료 처리. feeId는 화면에 보여준 진찰료 번호 (그새 바뀌었으면 FEE_CHANGED) */
  pay: (visitId: number, feeId: number) => api.post<PaymentResult>(`/billing/visits/${visitId}/payments`, { feeId }),

  /** 전자영수증 */
  receipt: (paymentId: number) => api.get<Receipt>(`/payments/${paymentId}/receipt`),

  /** 처방전 출력용 내용 (결제 후에만) */
  prescriptionPrint: (visitId: number) => api.get<PrescriptionPrint>(`/billing/visits/${visitId}/prescription-print`),
};
