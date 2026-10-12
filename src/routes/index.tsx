import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BrainCircuit, Video, Users } from "lucide-react";
import hero from "@/assets/hero-temple.jpg";
import { DemoBadge, LevelPill } from "@/components/shell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Crowd Pulse AI — Predict the crowd before you arrive" },
      { name: "description", content: "AI crowd prediction and video intelligence for temples, events and public places." },
      { property: "og:title", content: "Crowd Pulse AI" },
      { property: "og:description", content: "Predict the crowd. Understand the flow. Plan smarter." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const steps = [
  { icon: BrainCircuit, t: "Predict", d: "Pick a place, date and time. The model forecasts crowd level, visitors and wait." },
  { icon: Video, t: "Analyze", d: "Upload footage. Frames are scanned to count people and score density." },
  { icon: Users, t: "Simulate", d: "Watch an animated approximation of how the crowd fills the space." },
];

function Index() {
  return (
    <div className="-mt-8">
      <section className="relative -mx-5 overflow-hidden rounded-b-[2.5rem]">
        <img src={hero} alt="Temple at night with crowd flow" width={1600} height={1008} className="absolute inset-0 h-full w-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/10" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 pb-20 pt-28 md:grid-cols-[1.3fr_1fr] md:pt-40">
          <div className="animate-rise">
            <div className="eyebrow mb-4 text-primary">Crowd intelligence · v1</div>
            <h1 className="text-5xl font-extrabold leading-[1.02] tracking-tight md:text-7xl">
              Predict the crowd <span className="text-gradient">before you arrive.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-muted-foreground">AI-powered crowd intelligence for temples, events and public spaces.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/predict" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground glow transition hover:brightness-110">Predict Crowd <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/analyze" className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-6 py-3 text-sm font-bold backdrop-blur transition hover:bg-secondary">Analyze Video</Link>
            </div>
          </div>
          <div className="glass self-end p-6 animate-rise [animation-delay:200ms]">
            <div className="flex items-center justify-between">
              <span className="eyebrow">Tirumala · Sat 9:00am</span>
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse-ring" />
            </div>
            <div className="mt-4 text-4xl font-extrabold">18,420 <span className="text-base font-medium text-muted-foreground">visitors</span></div>
            <div className="mt-3 flex items-center gap-3"><LevelPill level="HIGH" /><span className="font-mono text-xs text-muted-foreground">91% confidence</span></div>
            <div className="mt-5 flex h-16 items-end gap-1">
              {[3, 5, 8, 11, 13, 10, 7, 6, 6, 8, 11, 12, 9, 5].map((v, i) => (
                <div key={i} className="flex-1 rounded-t bg-primary/70" style={{ height: `${v * 7}%` }} />
              ))}
            </div>
            <div className="mt-4"><DemoBadge text="sample" /></div>
          </div>
        </div>
      </section>

      <section className="mt-20">
        <div className="eyebrow mb-2">How it works</div>
        <h2 className="text-3xl font-extrabold tracking-tight">How Crowd Pulse AI works</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.t} className="glass p-6 transition hover:-translate-y-1 hover:border-primary/40">
              <div className="flex items-center justify-between">
                <s.icon className="h-6 w-6 text-primary" />
                <span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>
              </div>
              <h3 className="mt-6 text-xl font-bold">{s.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 max-w-2xl text-sm text-muted-foreground">
          Numbers come from a dedicated prediction model, not a chatbot. AI is used only to explain results in plain language. Until the production model is connected, every result is clearly labelled as demo data.
        </p>
      </section>
    </div>
  );
}
