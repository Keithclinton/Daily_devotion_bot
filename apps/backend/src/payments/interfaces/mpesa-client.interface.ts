export interface StkPushParams {
  phoneNumber: string;
  amount: number;
  accountRef: string;
  description: string;
}

export interface StkPushResult {
  checkoutRequestId: string;
  merchantRequestId: string;
}

export interface PaymentLinkParams {
  phoneNumber: string;
  amount: number;
  purpose: string;
  subscriberId: string;
}

export interface PaymentLinkResult {
  url: string;
  checkoutRequestId: string;
}

export interface MpesaClient {
  initiateStkPush(params: StkPushParams): Promise<StkPushResult>;
  generatePaymentLink(params: PaymentLinkParams): Promise<PaymentLinkResult>;
}

export const MPESA_CLIENT = Symbol("MPESA_CLIENT");
