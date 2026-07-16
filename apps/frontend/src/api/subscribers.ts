import { api } from "./client";
import { SubscriberDto, SubscriberStatus, SubscriberTier, SubscriberUpdateInput } from "@devotion/shared";

export const subscribersApi = {
  list: (status?: SubscriberStatus, tier?: SubscriberTier) => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (tier) params.set("tier", tier);
    const qs = params.toString();
    return api.get<SubscriberDto[]>(`/subscribers${qs ? `?${qs}` : ""}`);
  },
  update: (id: string, input: SubscriberUpdateInput) => api.patch<SubscriberDto>(`/subscribers/${id}`, input),
};
