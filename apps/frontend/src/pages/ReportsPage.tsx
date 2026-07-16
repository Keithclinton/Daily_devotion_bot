import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { reportsApi } from "../api/reports";

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-slate-800">{value}</div>
    </div>
  );
}

export function ReportsPage() {
  const revenueQuery = useQuery({ queryKey: ["reports", "revenue"], queryFn: reportsApi.revenue });
  const subscribersQuery = useQuery({
    queryKey: ["reports", "subscribers-summary"],
    queryFn: reportsApi.subscribersSummary,
  });

  const paidCount = subscribersQuery.data?.byTier.find((t) => t.tier === "PAID")?.count ?? 0;
  const freeCount = subscribersQuery.data?.byTier.find((t) => t.tier === "FREE")?.count ?? 0;

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total revenue" value={`KES ${revenueQuery.data?.totalRevenue ?? 0}`} />
        <StatCard label="Subscribers" value={subscribersQuery.data?.total ?? 0} />
        <StatCard label="Paid" value={paidCount} />
        <StatCard label="Free" value={freeCount} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-800">Revenue by day</h2>
        <div className="h-64 rounded-lg border border-slate-200 bg-white p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueQuery.data?.byDay ?? []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="total" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-800">Revenue by type</h2>
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Count</th>
                <th className="px-3 py-2">Total (KES)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {revenueQuery.data?.byType.map((row) => (
                <tr key={row.type}>
                  <td className="px-3 py-2">{row.type}</td>
                  <td className="px-3 py-2">{row.count}</td>
                  <td className="px-3 py-2">{row.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
