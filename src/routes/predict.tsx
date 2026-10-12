import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Check, Clock, Loader2, Sparkles, Users } from "lucide-react";
import { DemoBadge, Gauge, LevelPill, PageHead, Stat } from "@/components/shell";
import { Cta } from "@/components/ui-cta";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { listTemples } from "@/services/templeService";
import { runPrediction, validate, type PredictionResult } from "@/services/predictionService";
import { savePredictedLevel } from "@/lib/crowdPrediction"; // NEW
type Prediction = PredictionResult;

export const Route = createFileRoute("/predict")({
  head: () => ({
    meta: [
      { title: "Predict Crowd — Crowd Pulse AI" },
      { name: "description", content: "Forecast crowd level, visitors and waiting time for any temple, date and hour." },
      { property: "og:title", content: "Predict Crowd — Crowd Pulse AI" },
      { property: "og:description", content: "Forecast crowd level, visitors and waiting time." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PredictPage,
});

const STEPS = ["Analyzing historical patterns...", "Checking festival effects...", "Evaluating seasonal trends...", "Running prediction model...", "Prediction ready."];
const field = "w-full rounded-xl border border-input bg-secondary/60 px-4 py-3 text-sm outline-none focus:border-primary";

function PredictPage() {
  const today = new Date().toISOString().slice(0, 10) as string;
  const temples = useQuery({ queryKey: ["temples"], queryFn: listTemples });
  const [picked, setPicked] = useState("");
  const place = picked || temples.data?.[0]?.id || "";
  const setPlace = setPicked;
  const [err, setErr] = useState("");
  const [date, setDate] = useState(today);
  const [hour, setHour] = useState(9);
  const [step, setStep] = useState(-1);
  const [res, setRes] = useState<Prediction | null>(null);

  const run = async () => {
    setErr("");
    const v = validate({ templeId: place, date, hour });
    if (v) return setErr(v);
    const temple = temples.data?.find((t) => t.id === place);
    if (!temple) return setErr("Temple not found.");
    setRes(null);
    setStep(0);
    STEPS.forEach((_, i) => setTimeout(() => setStep(i), i * 550));
    try {
      const [r] = await Promise.all([runPrediction(temple, date, hour), new Promise((ok) => setTimeout(ok, STEPS.length * 550))]);
      setRes(r);
      savePredictedLevel(r.level); // NEW
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Prediction failed. Please try again.");
    } finally { setStep(-1); }
  };

  return (
    <div>
      <PageHead eyebrow="Mode 01" title="Predict Crowd" sub="Choose a place, date and time to forecast how busy it will be.">
        <DemoBadge text="Demo prediction — based on sample data" />
      </PageHead>
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="glass h-fit space-y-5 p-6">
          <label className="block"><span className="eyebrow">Select place</span>
            <select className={field + " mt-2"} value={place} onChange={(e) => setPlace(e.target.value)}>
              {temples.isLoading && <option>Loading temples…</option>}
              {temples.data?.map((p) => <option key={p.id} value={p.id}>{p.name} · {p.city}</option>)}
            </select>
          </label>
          <label className="block"><span className="eyebrow">Select date</span>
            <input type="date" className={field + " mt-2"} value={date} min={today} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label className="block"><span className="eyebrow">Select time · {hour % 12 || 12}:00 {hour < 12 ? "am" : "pm"}</span>
            <input type="range" min={5} max={20} value={hour} onChange={(e) => setHour(+e.target.value)} className="mt-4 w-full accent-[var(--primary)]" />
          </label>
          <Cta className="w-full" onClick={run} disabled={step >= 0 || !date}>
            {step >= 0 ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Predict Crowd
          </Cta>
          {(err || temples.error) && <p className="text-sm text-destructive">{err || "Couldn't load temples."}</p>}
        </div>

        <div>
          {step >= 0 && (
            <div className="glass space-y-3 p-8">
              {STEPS.map((s, i) => (
                <div key={s} className={`flex items-center gap-3 text-sm transition ${i <= step ? "text-foreground" : "text-muted-foreground/40"}`}>
                  {i < step ? <Check className="h-4 w-4 text-primary" /> : i === step ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <span className="h-4 w-4" />}
                  {s}
                </div>
              ))}
            </div>
          )}
          {!res && step < 0 && (
            <div className="glass grid min-h-[380px] place-items-center p-8 text-center text-muted-foreground">
              <div><Users className="mx-auto mb-3 h-10 w-10 text-primary/60" />Your forecast will appear here.</div>
            </div>
          )}
          {res && <Result r={res} hour={hour} />}
        </div>
      </div>
    </div>
  );
}

function Result({ r, hour }: { r: Prediction; hour: number }) {
  return (
    <div className="space-y-6 animate-rise">
      <div className="glass grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <div className="eyebrow">Crowd level · {r.place.name}</div>
          <div className="mt-3 flex items-center gap-4">
            <span className="text-6xl font-extrabold tracking-tight">{r.level}</span>
            <LevelPill level={r.level} />
          </div>
          {r.context.map((c) => <div key={c} className="mt-3 text-sm text-gold">{c}</div>)}
          <div className="mt-3 font-mono text-xs text-muted-foreground">
            {r.savedId ? "Saved to your history" : <Link to="/auth" className="text-primary">Sign in to save predictions</Link>} · model {r.modelVersion}
          </div>
        </div>
        <Gauge value={r.density} level={r.level} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Estimated visitors" value={`${r.range[0].toLocaleString()} – ${r.range[1].toLocaleString()}`} sub="full day" />
        <Stat label="Waiting time" value={`${r.wait[0]} – ${r.wait[1]} min`} sub="at selected hour" />
        <Stat label="Confidence" value={`${r.confidence}%`} sub="demo model" />
      </div>
      <div className="glass p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-bold">Hourly crowd forecast</h3>
          <div className="flex gap-4 font-mono text-xs text-muted-foreground"><span>Peak: <b className="text-level-high">{r.peak}</b></span><span>Quiet: <b className="text-level-low">{r.quiet}</b></span></div>
        </div>
        <div className="mt-4 h-64">
          <ResponsiveContainer>
            <AreaChart data={r.hourly}>
              <defs><linearGradient id="g" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="var(--primary)" stopOpacity={0.5} /><stop offset="1" stopColor="var(--primary)" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }} />
              <ReferenceLine x={r.hourly.find((h) => h.hour === hour)?.label ?? ""} stroke="var(--gold)" strokeDasharray="4 4" />
              <Area type="monotone" dataKey="visitors" stroke="var(--primary)" strokeWidth={2} fill="url(#g)" animationDuration={1200} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass p-6">
          <h3 className="font-bold">Why this prediction?</h3>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            {r.reasons.map((x) => <li key={x} className="flex gap-3"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />{x}</li>)}
          </ul>
        </div>
        <div className="glass border-primary/30 p-6">
          <h3 className="flex items-center gap-2 font-bold"><Sparkles className="h-4 w-4 text-primary" /> AI recommendation</h3>
          <p className="mt-4 text-sm text-muted-foreground">
            For the shortest wait, visit around <b className="text-foreground">{r.best.label}</b> — expected about {r.best.visitors.toLocaleString()} visitors per hour. Avoid {r.peak}, when queues are longest.
          </p>
          <div className="mt-4 flex items-center gap-2 font-mono text-xs text-primary"><Clock className="h-3.5 w-3.5" /> Recommended visit: {r.best.label}</div>
        </div>
      </div>
    </div>
  );
}