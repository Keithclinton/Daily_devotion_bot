import { Injectable, NotImplementedException } from "@nestjs/common";
import {
  MpesaClient,
  PaymentLinkParams,
  PaymentLinkResult,
  StkPushParams,
  StkPushResult,
} from "../interfaces/mpesa-client.interface";

/**
 * Real Safaricom Daraja M-Pesa client. Swap in once MPESA_CONSUMER_KEY/SECRET,
 * MPESA_SHORTCODE, and MPESA_PASSKEY are available and MPESA_PROVIDER=daraja is set.
 */
@Injectable()
export class DarajaMpesaClient implements MpesaClient {
  async initiateStkPush(_params: StkPushParams): Promise<StkPushResult> {
    throw new NotImplementedException(
      "DarajaMpesaClient is not implemented yet. Set MPESA_PROVIDER=mock until real credentials are wired up.",
    );
  }

  async generatePaymentLink(_params: PaymentLinkParams): Promise<PaymentLinkResult> {
    throw new NotImplementedException(
      "DarajaMpesaClient is not implemented yet. Set MPESA_PROVIDER=mock until real credentials are wired up.",
    );
  }
}
