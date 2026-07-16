import { z } from "zod";
import { PaymentStatus, PaymentType } from "../enums/index.js";

export const createPaymentIntentSchema = z.object({
  subscriberId: z.string().uuid(),
  type: z.nativeEnum(PaymentType),
  devotionId: z.string().uuid().optional(),
});
export type CreatePaymentIntentInput = z.infer<typeof createPaymentIntentSchema>;

export interface PaymentDto {
  id: string;
  subscriberId: string;
  type: PaymentType;
  amount: string;
  currency: string;
  status: PaymentStatus;
  mpesaCheckoutId: string | null;
  mpesaReceiptNo: string | null;
  createdAt: string;
  updatedAt: string;
}
