import { Injectable, Logger } from "@nestjs/common";
import { Devotion, Prisma, Subscriber } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { SubscribersService } from "../subscribers/subscribers.service";
import { WhatsappOutboundService } from "../whatsapp/whatsapp-outbound.service";
import { DeliveryStatus, SubscriberTier } from "@devotion/shared";

export type DeliveryOutcome = "SENT" | "FAILED" | "ALREADY_PROCESSED";

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

    const body = this.buildMessageBody(devotion, entitled);

    try {
      await this.whatsapp.sendTextMessage(subscriber.phoneNumber, body);
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

  private buildMessageBody(devotion: Devotion, entitled: boolean): string {
    const verseLine = devotion.verseReference
      ? `${devotion.verseText}\n— ${devotion.verseReference}`
      : devotion.verseText;

    if (entitled) {
      return [verseLine, "", devotion.sermonText, "", `Worship song: ${devotion.songUrl}`].join(
        "\n",
      );
    }

    return [
      verseLine,
      "",
      "Reply UPGRADE to unlock today's full sermon + worship song for premium subscribers.",
    ].join("\n");
  }
}
