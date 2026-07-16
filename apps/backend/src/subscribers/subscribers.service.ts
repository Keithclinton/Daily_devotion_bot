import { Injectable, NotFoundException } from "@nestjs/common";
import { Devotion, Subscriber } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import {
  OnboardingState,
  SubscriberStatus,
  SubscriberTier,
  SubscriberUpdateInput,
} from "@devotion/shared";
import { toSubscriberDto } from "./subscribers.mapper";

@Injectable()
export class SubscribersService {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(status?: SubscriberStatus, tier?: SubscriberTier) {
    const subscribers = await this.prisma.subscriber.findMany({
      where: { status, tier },
      orderBy: { createdAt: "desc" },
    });
    return subscribers.map(toSubscriberDto);
  }

  async findOne(id: string) {
    const subscriber = await this.prisma.subscriber.findUnique({ where: { id } });
    if (!subscriber) {
      throw new NotFoundException("Subscriber not found");
    }
    return toSubscriberDto(subscriber);
  }

  async update(id: string, input: SubscriberUpdateInput) {
    await this.findOne(id);
    const subscriber = await this.prisma.subscriber.update({ where: { id }, data: input });
    return toSubscriberDto(subscriber);
  }

  /** Finds a subscriber by phone number, creating a new PENDING/FREE record if none exists. */
  async findOrCreateByPhone(phoneNumber: string): Promise<Subscriber> {
    const existing = await this.prisma.subscriber.findUnique({ where: { phoneNumber } });
    if (existing) {
      return existing;
    }
    return this.prisma.subscriber.create({
      data: {
        phoneNumber,
        tier: SubscriberTier.FREE,
        status: SubscriberStatus.PENDING,
        onboardingState: OnboardingState.NEW,
      },
    });
  }

  /**
   * Whether a subscriber is entitled to the full (verse+sermon+song) content of a devotion,
   * via an active paid subscription or a one-off per-devotion unlock.
   */
  async isEntitled(subscriber: Subscriber, devotion: Devotion): Promise<boolean> {
    if (!devotion.isPremiumSermon) {
      return true;
    }
    const hasActiveSubscription =
      subscriber.tier === SubscriberTier.PAID &&
      !!subscriber.subscriptionExpiry &&
      subscriber.subscriptionExpiry.getTime() >= Date.now();
    if (hasActiveSubscription) {
      return true;
    }
    const unlock = await this.prisma.devotionUnlock.findUnique({
      where: { subscriberId_devotionId: { subscriberId: subscriber.id, devotionId: devotion.id } },
    });
    return !!unlock;
  }
}
