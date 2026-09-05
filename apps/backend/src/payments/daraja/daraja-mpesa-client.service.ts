import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  MpesaClient,
  PaymentLinkParams,
  PaymentLinkResult,
  StkPushParams,
  StkPushResult,
} from "../interfaces/mpesa-client.interface";

interface OAuthResponse {
  access_token: string;
  expires_in: string;
}

interface StkPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseDescription?: string;
  errorMessage?: string;
}

/**
 * Real Safaricom Daraja (Lipa na M-Pesa Online / STK Push) client. There is no
 * concept of a "payment link" here — the STK push puts a PIN prompt directly
 * on the customer's phone, so generatePaymentLink returns an empty url.
 */
@Injectable()
export class DarajaMpesaClient implements MpesaClient {
  private readonly logger = new Logger(DarajaMpesaClient.name);
  private cachedToken: { value: string; expiresAt: number } | null = null;

  constructor(private readonly config: ConfigService) {}

  async initiateStkPush(params: StkPushParams): Promise<StkPushResult> {
    const baseUrl = this.config.get<string>("MPESA_API_BASE_URL");
    const shortcode = this.config.get<string>("MPESA_SHORTCODE");
    const passkey = this.config.get<string>("MPESA_PASSKEY");
    const callbackBaseUrl = this.config.get<string>("MPESA_CALLBACK_BASE_URL");
    const transactionType = this.config.get<string>("MPESA_TRANSACTION_TYPE");

    const token = await this.getAccessToken();
    const timestamp = this.timestamp();
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");
    const phone = params.phoneNumber.replace(/^\+/, "");

    const response = await fetch(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: transactionType,
        Amount: Math.round(params.amount),
        PartyA: phone,
        PartyB: shortcode,
        PhoneNumber: phone,
        CallBackURL: `${callbackBaseUrl}/webhooks/mpesa`,
        AccountReference: params.accountRef.slice(0, 12),
        TransactionDesc: params.description.slice(0, 13),
      }),
    });

    const payload = (await response.json()) as StkPushResponse;

    if (!response.ok) {
      this.logger.error(`Daraja STK push failed for ${params.phoneNumber}: ${JSON.stringify(payload)}`);
      throw new InternalServerErrorException(
        `M-Pesa STK push failed: ${payload.errorMessage ?? payload.ResponseDescription ?? response.statusText}`,
      );
    }

    return {
      checkoutRequestId: payload.CheckoutRequestID,
      merchantRequestId: payload.MerchantRequestID,
    };
  }

  async generatePaymentLink(params: PaymentLinkParams): Promise<PaymentLinkResult> {
    const { checkoutRequestId } = await this.initiateStkPush({
      phoneNumber: params.phoneNumber,
      amount: params.amount,
      accountRef: params.subscriberId,
      description: params.purpose,
    });
    return { url: "", checkoutRequestId };
  }

  private async getAccessToken(): Promise<string> {
    if (this.cachedToken && this.cachedToken.expiresAt > Date.now()) {
      return this.cachedToken.value;
    }

    const baseUrl = this.config.get<string>("MPESA_API_BASE_URL");
    const consumerKey = this.config.get<string>("MPESA_CONSUMER_KEY");
    const consumerSecret = this.config.get<string>("MPESA_CONSUMER_SECRET");
    const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

    const response = await fetch(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: { Authorization: `Basic ${credentials}` },
    });

    if (!response.ok) {
      throw new InternalServerErrorException("Failed to obtain M-Pesa access token");
    }

    const payload = (await response.json()) as OAuthResponse;
    this.cachedToken = {
      value: payload.access_token,
      expiresAt: Date.now() + (Number(payload.expires_in) - 60) * 1000,
    };
    return this.cachedToken.value;
  }

  /** Safaricom expects the shortcode's local timestamp; TZ=Africa/Nairobi is set process-wide in main.ts. */
  private timestamp(): string {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return (
      `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}` +
      `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
    );
  }
}
