import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { OnboardingService } from "./onboarding.service";
import { Public } from "../common/decorators/public.decorator";
import { DevSecretGuard } from "../common/guards/dev-secret.guard";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { mockInboundMessageSchema, MockInboundMessageInput } from "@devotion/shared";

/** Dev-only: simulates an inbound WhatsApp message without a real Meta webhook call. */
@Controller("dev/mock-whatsapp-inbound")
export class DevInboundController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Public()
  @UseGuards(DevSecretGuard)
  @Post()
  async handle(@Body(new ZodValidationPipe(mockInboundMessageSchema)) body: MockInboundMessageInput) {
    await this.onboardingService.handleInboundMessage(body.from, body.text);
    return { received: true };
  }
}
