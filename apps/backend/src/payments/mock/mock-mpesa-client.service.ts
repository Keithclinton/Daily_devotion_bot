import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { randomUUID } from "crypto";
import {
  MpesaClient,
  PaymentLinkParams,
  PaymentLinkResult,
  StkPushParams,
  StkPushResult,
} from "../interfaces/mpesa-client.interface";

@Injectable()
export class MockMpesaClient implements MpesaClient {
  private readonly logger = new Logger("MockMpesaClient");

  constructor(private readonly config: ConfigService) {}

  async initiateStkPush(params: StkPushParams): Promise<StkPushResult> {
    const checkoutRequestId = `mock-checkout-${randomUUID()}`;
    const merchantRequestId = `mock-merchant-${randomUUID()}`;
    this.logger.log(
      `Mock STK push: KES ${params.amount} to ${params.phoneNumber} for ${params.description} (checkoutRequestId=${checkoutRequestId})`,
    );
    return { checkoutRequestId, merchantRequestId };
  }

  async generatePaymentLink(params: PaymentLinkParams): Promise<PaymentLinkResult> {
    const { checkoutRequestId } = await this.initiateStkPush({
      phoneNumber: params.phoneNumber,
      amount: params.amount,
      accountRef: params.subscriberId,
      description: params.purpose,
    });
    const baseUrl = this.config.get<string>("MPESA_CALLBACK_BASE_URL");
    const url = `${baseUrl}/mock-pay/${checkoutRequestId}`;
    return { url, checkoutRequestId };
  }
}
