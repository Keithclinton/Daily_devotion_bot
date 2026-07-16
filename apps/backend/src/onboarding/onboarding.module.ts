import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { OnboardingService } from "./onboarding.service";
import { WhatsappWebhookController } from "./whatsapp-webhook.controller";
import { DevInboundController } from "./dev-inbound.controller";
import { SubscribersModule } from "../subscribers/subscribers.module";
import { PaymentsModule } from "../payments/payments.module";
import { WhatsappModule } from "../whatsapp/whatsapp.module";

@Module({
  imports: [ConfigModule, SubscribersModule, PaymentsModule, WhatsappModule],
  controllers: [WhatsappWebhookController, DevInboundController],
  providers: [OnboardingService],
})
export class OnboardingModule {}
