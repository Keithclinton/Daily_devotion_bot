import { Subscriber } from "@prisma/client";
import { SubscriberDto, SubscriberStatus, SubscriberTier } from "@devotion/shared";

export function toSubscriberDto(subscriber: Subscriber): SubscriberDto {
  return {
    id: subscriber.id,
    phoneNumber: subscriber.phoneNumber,
    name: subscriber.name,
    tier: subscriber.tier as SubscriberTier,
    status: subscriber.status as SubscriberStatus,
    subscriptionExpiry: subscriber.subscriptionExpiry
      ? subscriber.subscriptionExpiry.toISOString()
      : null,
    onboardingState: subscriber.onboardingState,
    createdAt: subscriber.createdAt.toISOString(),
    updatedAt: subscriber.updatedAt.toISOString(),
  };
}
