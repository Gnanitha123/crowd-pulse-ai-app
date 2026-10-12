import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DemoBadge, PageHead, Stat } from "@/components/shell";
import { listTemples } from "@/services/templeService";
import { getTempleAnalytics } from "@/services/analyticsService";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Crowd Pulse AI" },
      { name: "description", content: "Historical crowd trends: busiest days, average wait and footfall." },
      { property: "og:title", content: "Analytics — Crowd Pulse AI" },
      { property: "og:description", content: "Historical crowd trends at a glance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AnalyticsPage,
});

const tip = { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 };
const axis = { stroke: "var(--muted-foreground)", fontSize: 11, tickLine: false, axisLine: false } as const;

function AnalyticsPage() {
  const temples = useQuery({ queryKey: ["temples"], queryFn: listTemples });
  const [picked, setPicked] = useState("");
  const id = picked || temples.data?.[0]?.id || "";
  const a = useQuery({ queryKey: ["analytics", id], queryFn: () => getTempleAnalytics(id), enabled: !!id });
  const d = a.data;

  return (
    <div>
      <PageHead eyebrow="History" title="Analytics" sub="Based on recorded crowd history for each temple.">
        <div className="flex flex-wrap items-center gap-3">
          <select value={id} onChange={(e) => setPicked(e.target.value)} className="rounded-full border border-input bg-secondary/60 px-4 py-2 text-sm outline-none focus:border-primary">
            {temples.data?.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          {d?.isSample && <DemoBadge text="sample history" />}
        </div>
      </PageHead>

      {(a.isLoading || temples.isLoading) && <div className="glass h-40 animate-pulse" />}
      {a.error && <div className="glass p-6 text-sm text-destructive">Couldn't load analytics. Please refresh.</div>}
      {a.isSuccess && !d && (
        <div className="glass p-10 text-center text-muted-foreground">Not enough history recorded for this temple yet — no statistics to show.</div>
      )}
      {d && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Stat label="Average crowd" value={d.avgDaily.toLocaleString()} sub="per day" />
            <Stat label="Peak crowd" value={d.peakHourly.toLocaleString()} sub="in one hour" />
            <Stat label="Average wait" value={`${d.avgWait} min`} />
            <Stat label="Busiest" value={d.busiestDay} sub={`around ${d.busiestHour}`} />
            <Stat label="Quietest" value={d.quietestDay} sub={`around ${d.quietestHour}`} />
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="glass p-6">
              <h3 className="font-bold">Visitors by weekday</h3>
              <div className="mt-4 h-64"><ResponsiveContainer><BarChart data={d.weekly}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" {...axis} /><YAxis {...axis} />
                <Tooltip contentStyle={tip} cursor={{ fill: "var(--secondary)" }} />
                <Bar dataKey="visitors" fill="var(--primary)" radius={[8, 8, 0, 0]} />
              </BarChart></ResponsiveContainer></div>
            </div>
            <div className="glass p-6">
              <h3 className="font-bold">Average by hour</h3>
              <div className="mt-4 h-64"><ResponsiveContainer><BarChart data={d.hourly}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" {...axis} /><YAxis {...axis} />
                <Tooltip contentStyle={tip} cursor={{ fill: "var(--secondary)" }} />
                <Bar dataKey="visitors" fill="var(--gold)" radius={[8, 8, 0, 0]} />
              </BarChart></ResponsiveContainer></div>
            </div>
          </div>
          <div className="glass mt-6 p-6">
            <h3 className="font-bold">Daily trend</h3>
            <div className="mt-4 h-64"><ResponsiveContainer><LineChart data={d.trend}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" {...axis} /><YAxis {...axis} />
              <Tooltip contentStyle={tip} />
              <Line type="monotone" dataKey="visitors" stroke="var(--primary)" strokeWidth={2.5} dot={false} />
            </LineChart></ResponsiveContainer></div>
            <p className="mt-3 font-mono text-xs text-muted-foreground">{d.rows.toLocaleString()} hourly records</p>
          </div>
        </>
      )}
    </div>
  );
}
