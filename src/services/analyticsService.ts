import { supabase } from "@/integrations/supabase/client";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export type Analytics = {
  rows: number;
  isSample: boolean;
  avgDaily: number;
  peakHourly: number;
  avgWait: number;
  busiestDay: string;
  quietestDay: string;
  busiestHour: string;
  quietestHour: string;
  weekly: { day: string; visitors: number }[];
  hourly: { label: string; visitors: number }[];
  trend: { date: string; visitors: number }[];
};

const hl = (h: number) => `${h % 12 || 12}${h < 12 ? "am" : "pm"}`;

export async function getTempleAnalytics(templeId: string): Promise<Analytics | null> {
  const { data, error } = await supabase
    .from("crowd_history")
    .select("date,hour,visitor_count,waiting_time_minutes,source")
    .eq("temple_id", templeId)
    .order("date")
    .limit(5000);
  if (error) throw error;
  if (!data || data.length < 24) return null;

  const byDate = new Map<string, number>();
  const byHour = new Map<number, number[]>();
  let wait = 0, peak = 0;
  for (const r of data) {
    byDate.set(r.date, (byDate.get(r.date) ?? 0) + r.visitor_count);
    byHour.set(r.hour, [...(byHour.get(r.hour) ?? []), r.visitor_count]);
    wait += r.waiting_time_minutes;
    peak = Math.max(peak, r.visitor_count);
  }
  const byDow = new Map<number, number[]>();
  for (const [d, v] of byDate) {
    const dow = new Date(d + "T00:00:00").getDay();
    byDow.set(dow, [...(byDow.get(dow) ?? []), v]);
  }
  const avg = (a: number[]) => Math.round(a.reduce((x, y) => x + y, 0) / a.length);
  const weekly = [1, 2, 3, 4, 5, 6, 0].filter((d) => byDow.has(d)).map((d) => ({ day: DAYS[d]!, visitors: avg(byDow.get(d)!) }));
  const hourly = [...byHour.entries()].sort((a, b) => a[0] - b[0]).map(([h, v]) => ({ hour: h, label: hl(h), visitors: avg(v) }));
  const ws = [...weekly].sort((a, b) => a.visitors - b.visitors);
  const hs = [...hourly].sort((a, b) => a.visitors - b.visitors);
  return {
    rows: data.length,
    isSample: data.every((r) => r.source === "demo_sample"),
    avgDaily: avg([...byDate.values()]),
    peakHourly: peak,
    avgWait: Math.round(wait / data.length),
    busiestDay: ws.at(-1)?.day ?? "—",
    quietestDay: ws[0]?.day ?? "—",
    busiestHour: hs.at(-1)?.label ?? "—",
    quietestHour: hs[0]?.label ?? "—",
    weekly,
    hourly,
    trend: [...byDate.entries()].map(([date, visitors]) => ({ date: date.slice(5), visitors })),
  };
}
