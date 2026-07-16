import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { devotionsApi } from "../api/devotions";
import { DevotionInput } from "@devotion/shared";
import { ApiError } from "../api/client";

function isoDate(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function emptyWeek(): DevotionInput[] {
  return Array.from({ length: 7 }, (_, i) => ({
    date: isoDate(i),
    verseText: "",
    verseReference: "",
    sermonText: "",
    songUrl: "",
    scheduledSendAt: "06:00",
    isPremiumSermon: true,
  }));
}

export function DevotionsPage() {
  const queryClient = useQueryClient();
  const [rows, setRows] = useState<DevotionInput[]>(emptyWeek());
  const [error, setError] = useState<string | null>(null);

  const devotionsQuery = useQuery({
    queryKey: ["devotions"],
    queryFn: () => devotionsApi.list(),
  });

  const batchMutation = useMutation({
    mutationFn: (input: DevotionInput[]) => devotionsApi.createBatch(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devotions"] });
      setRows(emptyWeek());
      setError(null);
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Failed to save week"),
  });

  function updateRow(index: number, patch: Partial<DevotionInput>) {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-800">Author this week</h2>
        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
        <div className="space-y-4">
          {rows.map((row, i) => (
            <div key={i} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <label className="text-sm">
                  Date
                  <input
                    type="date"
                    value={row.date}
                    onChange={(e) => updateRow(i, { date: e.target.value })}
                    className="mt-1 w-full rounded border border-slate-300 px-2 py-1"
                  />
                </label>
                <label className="text-sm">
                  Send time
                  <input
                    type="time"
                    value={row.scheduledSendAt}
                    onChange={(e) => updateRow(i, { scheduledSendAt: e.target.value })}
                    className="mt-1 w-full rounded border border-slate-300 px-2 py-1"
                  />
                </label>
                <label className="text-sm">
                  Verse reference
                  <input
                    value={row.verseReference}
                    onChange={(e) => updateRow(i, { verseReference: e.target.value })}
                    placeholder="John 3:16"
                    className="mt-1 w-full rounded border border-slate-300 px-2 py-1"
                  />
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={row.isPremiumSermon}
                    onChange={(e) => updateRow(i, { isPremiumSermon: e.target.checked })}
                  />
                  Sermon is premium
                </label>
              </div>
              <label className="mb-3 block text-sm">
                Verse text
                <textarea
                  value={row.verseText}
                  onChange={(e) => updateRow(i, { verseText: e.target.value })}
                  className="mt-1 w-full rounded border border-slate-300 px-2 py-1"
                  rows={2}
                />
              </label>
              <label className="mb-3 block text-sm">
                Sermon text
                <textarea
                  value={row.sermonText}
                  onChange={(e) => updateRow(i, { sermonText: e.target.value })}
                  className="mt-1 w-full rounded border border-slate-300 px-2 py-1"
                  rows={3}
                />
              </label>
              <label className="block text-sm">
                Worship song URL
                <input
                  value={row.songUrl}
                  onChange={(e) => updateRow(i, { songUrl: e.target.value })}
                  placeholder="https://youtube.com/..."
                  className="mt-1 w-full rounded border border-slate-300 px-2 py-1"
                />
              </label>
            </div>
          ))}
        </div>
        <button
          onClick={() => batchMutation.mutate(rows)}
          disabled={batchMutation.isPending}
          className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {batchMutation.isPending ? "Saving..." : "Save week"}
        </button>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-800">Upcoming devotions</h2>
        {devotionsQuery.isLoading && <p className="text-slate-500">Loading...</p>}
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Verse</th>
                <th className="px-3 py-2">Send time</th>
                <th className="px-3 py-2">Premium</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {devotionsQuery.data?.map((d) => (
                <tr key={d.id}>
                  <td className="px-3 py-2">{d.date}</td>
                  <td className="max-w-xs truncate px-3 py-2">{d.verseText}</td>
                  <td className="px-3 py-2">{d.scheduledSendAt}</td>
                  <td className="px-3 py-2">{d.isPremiumSermon ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
