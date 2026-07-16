import { Controller, Param, Post, UseGuards } from "@nestjs/common";
import { randomUUID } from "crypto";
import { PaymentsService } from "./payments.service";
import { Public } from "../common/decorators/public.decorator";
import { DevSecretGuard } from "../common/guards/dev-secret.guard";

/**
 * Stands in for the customer completing an STK push on their phone. Dev-only:
 * builds the same Daraja-shaped success result the real callback would produce,
 * so PaymentsService.handleCallback is exercised identically to production.
 */
@Controller("mock-pay")
export class MockPayController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Public()
  @UseGuards(DevSecretGuard)
  @Post(":checkoutRequestId/complete")
  complete(@Param("checkoutRequestId") checkoutRequestId: string) {
    const mpesaReceiptNo = `MOCK${randomUUID().slice(0, 8).toUpperCase()}`;
    return this.paymentsService.handleCallback(checkoutRequestId, 0, mpesaReceiptNo);
  }
}
