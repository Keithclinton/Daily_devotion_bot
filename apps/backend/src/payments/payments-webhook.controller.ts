import { Body, Controller, Post } from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { Public } from "../common/decorators/public.decorator";
import { DarajaStkCallbackPayload, extractMpesaReceipt } from "./daraja-callback.types";

@Controller("webhooks/mpesa")
export class PaymentsWebhookController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Public()
  @Post()
  handleCallback(@Body() payload: DarajaStkCallbackPayload) {
    const { CheckoutRequestID, ResultCode } = payload.Body.stkCallback;
    return this.paymentsService.handleCallback(
      CheckoutRequestID,
      ResultCode,
      extractMpesaReceipt(payload),
    );
  }
}
