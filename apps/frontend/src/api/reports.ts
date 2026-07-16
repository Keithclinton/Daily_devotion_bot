import { api } from "./client";

export interface RevenueReport {
  totalRevenue: number;
  byType: { type: string; total: number; count: number }[];
  byDay: { day: string; total: number }[];
}

export interface SubscribersSummary {
  total: number;
  byTier: { tier: string; count: number }[];
  byStatus: { status: string; count: number }[];
}

export const reportsApi = {
  revenue: () => api.get<RevenueReport>("/reports/revenue"),
  subscribersSummary: () => api.get<SubscribersSummary>("/reports/subscribers/summary"),
  deliveries: (devotionId?: string) =>
    api.get<{ status: string; count: number }[]>(
      `/reports/deliveries${devotionId ? `?devotionId=${devotionId}` : ""}`,
    ),
};
