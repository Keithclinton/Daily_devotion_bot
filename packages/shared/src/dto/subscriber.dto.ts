import { z } from "zod";
import { SubscriberStatus, SubscriberTier } from "../enums/index.js";

export const subscriberUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  tier: z.nativeEnum(SubscriberTier).optional(),
  status: z.nativeEnum(SubscriberStatus).optional(),
});
export type SubscriberUpdateInput = z.infer<typeof subscriberUpdateSchema>;

export interface SubscriberDto {
  id: string;
  phoneNumber: string;
  name: string | null;
  tier: SubscriberTier;
  status: SubscriberStatus;
  subscriptionExpiry: string | null;
  onboardingState: string;
  createdAt: string;
  updatedAt: string;
}
