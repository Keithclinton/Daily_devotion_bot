import { Injectable, Logger } from "@nestjs/common";
import { Devotion, Prisma, Subscriber } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { SubscribersService } from "../subscribers/subscribers.service";
import { WhatsappOutboundService } from "../whatsapp/whatsapp-outbound.service";
import { DeliveryStatus, SubscriberTier } from "@devotion/shared";

export type DeliveryOutcome = "SENT" | "FAILED" | "ALREADY_PROCESSED";

const TEMPLATE_LANGUAGE = "en";
const PREMIUM_TEMPLATE_NAME = "leadership_nuggets_premium";
const FREE_TEMPLATE_NAME = "leadership_nuggets_free";

@Injectable()
export class DeliveryService {
  private readonly logger = new Logger(DeliveryService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly subscribersService: SubscribersService,
    private readonly whatsapp: WhatsappOutboundService,
  ) {}

  /**
   * Delivers a devotion to a subscriber exactly once, gated by the unique
   * (devotionId, subscriberId) DeliveryLog constraint. Safe to call repeatedly
   * (from the cron and from immediate post-payment sends) without double-sending.
   */
  async deliverToSubscriber(devotion: Devotion, subscriber: Subscriber): Promise<DeliveryOutcome> {
    const entitled = await this.subscribersService.isEntitled(subscriber, devotion);
    const contentTier = entitled ? SubscriberTier.PAID : SubscriberTier.FREE;

    let deliveryLogId: string;
    try {
      const log = await this.prisma.deliveryLog.create({
        data: {
          devotionId: devotion.id,
          subscriberId: subscriber.id,
          status: DeliveryStatus.PENDING,
          contentTier,
        },
      });
      deliveryLogId = log.id;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return "ALREADY_PROCESSED";
      }
      throw error;
    }

    const { templateName, params } = this.buildTemplateParams(devotion, entitled);

    try {
      await this.whatsapp.sendTemplateMessage(
        subscriber.phoneNumber,
        templateName,
        TEMPLATE_LANGUAGE,
        params,
        devotion.imageUrl ?? undefined,
      );
      await this.prisma.deliveryLog.update({
        where: { id: deliveryLogId },
        data: { status: DeliveryStatus.SENT, sentAt: new Date() },
      });
      return "SENT";
    } catch (error) {
      this.logger.error(`Failed to deliver devotion ${devotion.id} to ${subscriber.phoneNumber}`, error as Error);
      await this.prisma.deliveryLog.update({
        where: { id: deliveryLogId },
        data: { status: DeliveryStatus.FAILED, errorMessage: (error as Error).message },
      });
      return "FAILED";
    }
  }

  private buildTemplateParams(
    devotion: Devotion,
    entitled: boolean,
  ): { templateName: string; params: string[] } {
    const verseLine = devotion.verseReference
      ? `${devotion.verseText}\n— ${devotion.verseReference}`
      : devotion.verseText;

    if (entitled) {
      return {
        templateName: PREMIUM_TEMPLATE_NAME,
        params: [verseLine, devotion.sermonText, devotion.songUrl],
      };
    }

    return { templateName: FREE_TEMPLATE_NAME, params: [verseLine] };
  }
}
