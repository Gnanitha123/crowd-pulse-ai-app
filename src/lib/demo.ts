// Demo-mode data engine. Replace `predictCrowd` with a call to the production ML API later.
export type Level = "LOW" | "MODERATE" | "HIGH" | "CRITICAL";

export type Place = { id: string; name: string; city: string; base: number };
export const PLACES: Place[] = [
  { id: "tirupati", name: "Tirumala Tirupati", city: "Tirupati", base: 22000 },
  { id: "srikalahasti", name: "Srikalahasti Temple", city: "Srikalahasti", base: 13800 },
  { id: "kanakadurga", name: "Kanaka Durga Temple", city: "Vijayawada", base: 16100 },
  { id: "srisailam", name: "Srisailam Temple", city: "Srisailam", base: 15000 },
  { id: "yadadri", name: "Yadadri Temple", city: "Yadagirigutta", base: 14300 },
  { id: "simhachalam", name: "Simhachalam Temple", city: "Visakhapatnam", base: 13300 },
];

function seeded(n: number) {
  const x = Math.sin(n * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}
export function hourCurve(h: number) {
  // two peaks: morning darshan & evening aarti
  return 0.25 + 0.75 * Math.max(Math.exp(-((h - 9) ** 2) / 6), 0.9 * Math.exp(-((h - 18) ** 2) / 5));
}
export function levelOf(ratio: number): Level {
  if (ratio < 0.35) return "LOW";
  if (ratio < 0.6) return "MODERATE";
  if (ratio < 0.85) return "HIGH";
  return "CRITICAL";
}
export const levelColor: Record<Level, string> = {
  LOW: "var(--level-low)",
  MODERATE: "var(--level-moderate)",
  HIGH: "var(--level-high)",
  CRITICAL: "var(--level-critical)",
};

export function predictCrowd(p: Place, date: string, hour: number) {
  const placeId = p.id;
  const d = new Date(date + "T00:00:00");
  const weekend = d.getDay() === 0 || d.getDay() === 6;
  const seed = d.getDate() + d.getMonth() * 31 + placeId.length;
  const festival = seeded(seed) > 0.85;
  const dayFactor = (weekend ? 1.25 : 1) * (festival ? 1.4 : 1) * (0.9 + seeded(seed + 1) * 0.2);
  const hourly = Array.from({ length: 16 }, (_, i) => {
    const h = i + 5;
    const visitors = Math.round(p.base * hourCurve(h) * dayFactor * 0.12);
    return { hour: h, label: `${h % 12 || 12}${h < 12 ? "am" : "pm"}`, visitors };
  });
  const cap = p.base * 0.12 * 1.4;
  const ratio = Math.min(1, (p.base * 0.12 * hourCurve(hour) * dayFactor) / cap);
  const total = Math.round(p.base * dayFactor);
  const level = levelOf(ratio);
  const sorted = [...hourly].sort((a, b) => a.visitors - b.visitors);
  const reasons = [
    weekend ? "Weekend — historically 25% busier than weekdays" : "Weekday — typical baseline footfall",
    festival ? "Festival period detected in the calendar" : "No major festival on this date",
    hour >= 8 && hour <= 10 ? "Morning darshan window is a peak period" : hour >= 17 && hour <= 19 ? "Evening aarti draws a second peak" : "Selected hour is outside main peaks",
    `Seasonal trend for ${d.toLocaleString("en", { month: "long" })}`,
  ];
  return {
    place: p,
    level,
    density: Math.round(ratio * 100),
    range: [Math.round(total * 0.9), Math.round(total * 1.1)] as const,
    wait: [Math.round(ratio * 50), Math.round(ratio * 75 + 5)] as const,
    confidence: Math.round(84 + seeded(seed + 2) * 10),
    hourly,
    peak: sorted.slice(-2).map((x) => x.label).join(" & "),
    quiet: sorted.slice(0, 2).map((x) => x.label).join(" & "),
    best: sorted[0]!,
    reasons,
    festival,
  };
}
export type Prediction = ReturnType<typeof predictCrowd>;

export const WEEKLY = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => ({
  day: d,
  visitors: Math.round(12000 + [0, -800, 200, 600, 2400, 7800, 9400][i]! + seeded(i) * 1500),
  wait: Math.round(22 + [0, -3, 1, 2, 8, 22, 28][i]!),
}));
export const MONTHLY = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => ({
  month: m,
  visitors: Math.round(380000 + Math.sin(i / 1.9) * 90000 + seeded(i + 40) * 60000),
}));
