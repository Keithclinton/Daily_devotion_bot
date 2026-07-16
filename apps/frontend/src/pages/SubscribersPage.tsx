import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { subscribersApi } from "../api/subscribers";
import { SubscriberStatus, SubscriberTier } from "@devotion/shared";

export function SubscribersPage() {
  const [status, setStatus] = useState<SubscriberStatus | "">("");
  const [tier, setTier] = useState<SubscriberTier | "">("");

  const subscribersQuery = useQuery({
    queryKey: ["subscribers", status, tier],
    queryFn: () =>
      subscribersApi.list(status || undefined, tier || undefined),
  });

  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold text-slate-800">Subscribers</h2>
      <div className="mb-4 flex gap-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as SubscriberStatus | "")}
          className="rounded border border-slate-300 px-2 py-1 text-sm"
        >
          <option value="">All statuses</option>
          {Object.values(SubscriberStatus).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={tier}
          onChange={(e) => setTier(e.target.value as SubscriberTier | "")}
          className="rounded border border-slate-300 px-2 py-1 text-sm"
        >
          <option value="">All tiers</option>
          {Object.values(SubscriberTier).map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead>
            <tr className="text-left text-slate-500">
              <th className="px-3 py-2">Phone</th>
              <th className="px-3 py-2">Tier</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Expiry</th>
              <th className="px-3 py-2">Onboarding</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {subscribersQuery.data?.map((s) => (
              <tr key={s.id}>
                <td className="px-3 py-2">{s.phoneNumber}</td>
                <td className="px-3 py-2">{s.tier}</td>
                <td className="px-3 py-2">{s.status}</td>
                <td className="px-3 py-2">
                  {s.subscriptionExpiry ? s.subscriptionExpiry.slice(0, 10) : "—"}
                </td>
                <td className="px-3 py-2">{s.onboardingState}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
