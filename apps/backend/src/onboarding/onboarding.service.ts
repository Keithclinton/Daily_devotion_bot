import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { SubscribersService } from "../subscribers/subscribers.service";
import { PaymentsService } from "../payments/payments.service";
import { WhatsappOutboundService } from "../whatsapp/whatsapp-outbound.service";
import { OnboardingState, PaymentType, SubscriberStatus, SubscriberTier } from "@devotion/shared";

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly subscribersService: SubscribersService,
    private readonly paymentsService: PaymentsService,
    private readonly whatsapp: WhatsappOutboundService,
  ) {}

  private normalizePhone(from: string): string {
    return from.startsWith("+") ? from : `+${from}`;
  }

  private welcomeMenuText(): string {
    const price = this.config.get<number>("SUBSCRIPTION_PRICE_KES");
    return [
      "Welcome to Daily Devotion! ",
      "Reply 1 for the Free daily verse.",
      `Reply 2 for Premium (verse + sermon + worship song) — KES ${price}/month via M-Pesa.`,
    ].join("\n");
  }

  private helpText(): string {
    return [
      "Commands:",
      "UPGRADE — subscribe to Premium",
      "STATUS — check your subscription status",
      "HELP — show this message",
    ].join("\n");
  }

  async handleInboundMessage(from: string, text: string): Promise<void> {
    const phoneNumber = this.normalizePhone(from);
    const normalizedText = text.trim().toLowerCase();
    const subscriber = await this.subscribersService.findOrCreateByPhone(phoneNumber);

    if (subscriber.onboardingState === OnboardingState.NEW) {
      await this.whatsapp.sendTextMessage(phoneNumber, this.welcomeMenuText());
      await this.prisma.subscriber.update({
        where: { id: subscriber.id },
        data: { onboardingState: OnboardingState.AWAITING_TIER_CHOICE },
      });
      return;
    }

    if (subscriber.onboardingState === OnboardingState.AWAITING_TIER_CHOICE) {
      if (normalizedText === "1" || normalizedText === "free") {
        await this.prisma.subscriber.update({
          where: { id: subscriber.id },
          data: {
            status: SubscriberStatus.ACTIVE,
            tier: SubscriberTier.FREE,
            onboardingState: OnboardingState.COMPLETE,
          },
        });
        await this.whatsapp.sendTextMessage(
          phoneNumber,
          "You're subscribed to the Free daily verse. God bless!",
        );
        return;
      }
      if (normalizedText === "2" || normalizedText === "premium" || normalizedText === "paid") {
        await this.startSubscriptionPayment(subscriber.id, phoneNumber);
        return;
      }
      await this.whatsapp.sendTextMessage(phoneNumber, this.welcomeMenuText());
      return;
    }

    if (subscriber.onboardingState === OnboardingState.AWAITING_PAYMENT) {
      await this.whatsapp.sendTextMessage(
        phoneNumber,
        "We're still waiting for your M-Pesa payment — tap the link we sent to complete it.",
      );
      return;
    }

    // COMPLETE subscribers: lightweight command router for free text, not a strict FSM.
    if (normalizedText.includes("upgrade") || normalizedText.includes("premium")) {
      await this.startSubscriptionPayment(subscriber.id, phoneNumber);
      return;
    }
    if (normalizedText.includes("status")) {
      const fresh = await this.prisma.subscriber.findUniqueOrThrow({ where: { id: subscriber.id } });
      const expiry = fresh.subscriptionExpiry ? fresh.subscriptionExpiry.toISOString().slice(0, 10) : "n/a";
      await this.whatsapp.sendTextMessage(
        phoneNumber,
        `Tier: ${fresh.tier}\nStatus: ${fresh.status}\nExpiry: ${expiry}`,
      );
      return;
    }
    await this.whatsapp.sendTextMessage(phoneNumber, this.helpText());
  }

  private async startSubscriptionPayment(subscriberId: string, phoneNumber: string) {
    const { url } = await this.paymentsService.createPaymentIntent(subscriberId, PaymentType.SUBSCRIPTION);
    await this.prisma.subscriber.update({
      where: { id: subscriberId },
      data: { onboardingState: OnboardingState.AWAITING_PAYMENT },
    });
    await this.whatsapp.sendTextMessage(phoneNumber, `Pay here to activate Premium: ${url}`);
  }
}
