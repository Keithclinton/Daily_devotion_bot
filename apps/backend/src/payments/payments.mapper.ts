import { Payment } from "@prisma/client";
import { PaymentDto, PaymentStatus, PaymentType } from "@devotion/shared";

export function toPaymentDto(payment: Payment): PaymentDto {
  return {
    id: payment.id,
    subscriberId: payment.subscriberId,
    type: payment.type as PaymentType,
    amount: payment.amount.toString(),
    currency: payment.currency,
    status: payment.status as PaymentStatus,
    mpesaCheckoutId: payment.mpesaCheckoutId,
    mpesaReceiptNo: payment.mpesaReceiptNo,
    createdAt: payment.createdAt.toISOString(),
    updatedAt: payment.updatedAt.toISOString(),
  };
}
