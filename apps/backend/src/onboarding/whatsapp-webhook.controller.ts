import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { OnboardingService } from "./onboarding.service";
import { Public } from "../common/decorators/public.decorator";
import { MetaSignatureGuard } from "../common/guards/meta-signature.guard";
import { extractInboundMessage, MetaWebhookPayload } from "./meta-webhook.types";

@Controller("webhooks/whatsapp")
export class WhatsappWebhookController {
  constructor(private readonly onboardingService: OnboardingService) {}

  /** Meta's webhook verification handshake (used once real credentials are configured). */
  @Public()
  @Get()
  verify(
    @Query("hub.mode") mode: string,
    @Query("hub.verify_token") token: string,
    @Query("hub.challenge") challenge: string,
  ) {
    if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      return challenge;
    }
    return "verification failed";
  }

  @Public()
  @UseGuards(MetaSignatureGuard)
  @Post()
  async handleInbound(@Body() payload: MetaWebhookPayload) {
    const message = extractInboundMessage(payload);
    if (message) {
      await this.onboardingService.handleInboundMessage(message.from, message.text);
    }
    return { received: true };
  }
}
