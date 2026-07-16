import { BadRequestException, Injectable, Inject, Logger, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { DeliveryService } from "../delivery/delivery.service";
import { WhatsappOutboundService } from "../whatsapp/whatsapp-outbound.service";
import { MPESA_CLIENT, MpesaClient } from "./interfaces/mpesa-client.interface";
import { nairobiDateString } from "../common/nairobi-time";
import {
  OnboardingState,
  PaymentStatus,
  PaymentType,
  SubscriberStatus,
  SubscriberTier,
} from "@devotion/shared";
import { toPaymentDto } from "./payments.mapper";

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    @Inject(MPESA_CLIENT) private readonly mpesa: MpesaClient,
    private readonly delivery: DeliveryService,
    private readonly whatsapp: WhatsappOutboundService,
  ) {}

  private priceFor(type: PaymentType): number {
    switch (type) {
      case PaymentType.SUBSCRIPTION:
        return this.config.get<number>("SUBSCRIPTION_PRICE_KES")!;
      case PaymentType.BUNDLE:
        return this.config.get<number>("BUNDLE_PRICE_KES")!;
      case PaymentType.PER_DEVOTION:
        return this.config.get<number>("PER_DEVOTION_PRICE_KES")!;
    }
  }

  async createPaymentIntent(subscriberId: string, type: PaymentType, devotionId?: string) {
    if (type === PaymentType.PER_DEVOTION && !devotionId) {
      throw new BadRequestException("devotionId is required for PER_DEVOTION payments");
    }

    const subscriber = await this.prisma.subscriber.findUnique({ where: { id: subscriberId } });
    if (!subscriber) {
      throw new NotFoundException("Subscriber not found");
    }

    const amount = this.priceFor(type);
    const { url, checkoutRequestId } = await this.mpesa.generatePaymentLink({
      phoneNumber: subscriber.phoneNumber,
      amount,
      purpose: type,
      subscriberId,
    });

    const payment = await this.prisma.payment.create({
      data: {
        subscriberId,
        type,
        amount,
        status: PaymentStatus.PENDING,
        mpesaCheckoutId: checkoutRequestId,
        relatedDevotionId: devotionId,
      },
    });

    return { payment: toPaymentDto(payment), url };
  }

  /** Mirrors Safaricom Daraja's STK callback shape so swapping in the real client needs no changes here. */
  async handleCallback(checkoutRequestId: string, resultCode: number, mpesaReceiptNo?: string) {
    const payment = await this.prisma.payment.findUnique({ where: { mpesaCheckoutId: checkoutRequestId } });
    if (!payment) {
      throw new NotFoundException("Payment not found for checkoutRequestId");
    }
    if (payment.status !== PaymentStatus.PENDING) {
      return toPaymentDto(payment); // already processed, idempotent no-op
    }

    if (resultCode !== 0) {
      const failed = await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED },
      });
      return toPaymentDto(failed);
    }

    const now = new Date();
    const completed = await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.COMPLETED, mpesaReceiptNo },
    });

    const subscriber = await this.prisma.subscriber.findUniqueOrThrow({
      where: { id: payment.subscriberId },
    });

    if (payment.type === PaymentType.SUBSCRIPTION || payment.type === PaymentType.BUNDLE) {
      const days = payment.type === PaymentType.SUBSCRIPTION ? 30 : this.config.get<number>("BUNDLE_DAYS")!;
      const extendFrom =
        subscriber.subscriptionExpiry && subscriber.subscriptionExpiry.getTime() > now.getTime()
          ? subscriber.subscriptionExpiry
          : now;
      const newExpiry = new Date(extendFrom.getTime() + days * 24 * 60 * 60 * 1000);

      await this.prisma.subscriber.update({
        where: { id: subscriber.id },
        data: {
          tier: SubscriberTier.PAID,
          status: SubscriberStatus.ACTIVE,
          subscriptionExpiry: newExpiry,
          onboardingState: OnboardingState.COMPLETE,
        },
      });
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { periodStart: now, periodEnd: newExpiry },
      });

      await this.whatsapp.sendTextMessage(
        subscriber.phoneNumber,
        `Payment received! Your premium access is active until ${newExpiry.toISOString().slice(0, 10)}.`,
      );

      const todaysDevotion = await this.prisma.devotion.findUnique({
        where: { date: new Date(`${nairobiDateString()}T00:00:00.000Z`) },
      });
      if (todaysDevotion) {
        const refreshedSubscriber = await this.prisma.subscriber.findUniqueOrThrow({
          where: { id: subscriber.id },
        });
        await this.delivery.deliverToSubscriber(todaysDevotion, refreshedSubscriber);
      }
    } else if (payment.type === PaymentType.PER_DEVOTION) {
      const devotionId = payment.relatedDevotionId!;
      await this.prisma.devotionUnlock
        .create({ data: { subscriberId: subscriber.id, devotionId, paymentId: payment.id } })
        .catch(() => undefined); // already unlocked, ignore

      const devotion = await this.prisma.devotion.findUnique({ where: { id: devotionId } });
      if (devotion) {
        const body = [
          "Payment received! Here's your unlocked devotion:",
          devotion.verseReference ? `${devotion.verseText}\n— ${devotion.verseReference}` : devotion.verseText,
          "",
          devotion.sermonText,
          "",
          `Worship song: ${devotion.songUrl}`,
        ].join("\n");
        await this.whatsapp.sendTextMessage(subscriber.phoneNumber, body);
      }
    }

    return toPaymentDto(completed);
  }
}
