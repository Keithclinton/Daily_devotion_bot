export enum SubscriberTier {
  FREE = "FREE",
  PAID = "PAID",
}

export enum SubscriberStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  PAST_DUE = "PAST_DUE",
  CHURNED = "CHURNED",
}

export enum PaymentType {
  SUBSCRIPTION = "SUBSCRIPTION",
  BUNDLE = "BUNDLE",
  PER_DEVOTION = "PER_DEVOTION",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  EXPIRED = "EXPIRED",
}

export enum DeliveryStatus {
  PENDING = "PENDING",
  SENT = "SENT",
  FAILED = "FAILED",
  SKIPPED = "SKIPPED",
}

export enum OnboardingState {
  NEW = "NEW",
  AWAITING_TIER_CHOICE = "AWAITING_TIER_CHOICE",
  AWAITING_PAYMENT = "AWAITING_PAYMENT",
  COMPLETE = "COMPLETE",
}
