import { Link } from "@tanstack/react-router";
import { Activity, MessageSquare } from "lucide-react";
import type { ReactNode } from "react";
import { levelColor, type Level } from "@/lib/demo";

const nav = [
  { to: "/predict", label: "Predict" },
  { to: "/analyze", label: "Analyze Video" },
  { to: "/simulate", label: "Simulate" },
  { to: "/analytics", label: "Analytics" },
] as const;

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-5">
        <Link to="/" className="flex items-center gap-2 font-extrabold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/15 text-primary"><Activity className="h-4 w-4" /></span>
          CROWD PULSE <span className="text-primary">AI</span>
        </Link>
        <nav className="hidden flex-1 items-center gap-1 md:flex">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className="rounded-full px-3.5 py-1.5 text-sm text-muted-foreground transition hover:text-foreground" activeProps={{ className: "bg-secondary !text-foreground" }}>
              {n.label}
            </Link>
          ))}
        </nav>
        <Link to="/assistant" className="ml-auto inline-flex items-center gap-2 rounded-full border border-primary/40 px-4 py-1.5 text-sm text-primary transition hover:bg-primary/10">
          <MessageSquare className="h-4 w-4" /> Ask Pulse AI
        </Link>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-4 pb-2 md:hidden">
        {nav.map((n) => (
          <Link key={n.to} to={n.to} className="whitespace-nowrap rounded-full px-3 py-1 text-xs text-muted-foreground" activeProps={{ className: "bg-secondary !text-foreground" }}>{n.label}</Link>
        ))}
      </nav>
    </header>
  );
}

export function DemoBadge({ text = "Demo prediction — based on simulated sample data" }: { text?: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs text-gold">
      <span className="h-1.5 w-1.5 rounded-full bg-gold" /> Demo Mode · {text}
    </div>
  );
}

export function PageHead({ eyebrow, title, sub, children }: { eyebrow: string; title: string; sub?: string; children?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 animate-rise">
      <div>
        <div className="eyebrow mb-2">{eyebrow}</div>
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">{title}</h1>
        {sub && <p className="mt-2 max-w-xl text-muted-foreground">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

export function LevelPill({ level }: { level: Level }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 font-mono text-xs font-semibold" style={{ color: levelColor[level], background: `color-mix(in oklch, ${levelColor[level]} 15%, transparent)` }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: levelColor[level] }} />
      {level}
    </span>
  );
}

export function Gauge({ value, level }: { value: number; level: Level }) {
  const r = 80, c = Math.PI * r;
  return (
    <svg viewBox="0 0 200 120" className="w-full max-w-xs">
      <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="var(--secondary)" strokeWidth="14" strokeLinecap="round" />
      <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke={levelColor[level]} strokeWidth="14" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.2,.7,.2,1)", filter: `drop-shadow(0 0 8px ${levelColor[level]})` }} />
      <text x="100" y="88" textAnchor="middle" fill="var(--foreground)" fontSize="30" fontWeight="800">{value}%</text>
      <text x="100" y="108" textAnchor="middle" fill="var(--muted-foreground)" fontSize="9" letterSpacing="2">DENSITY</text>
    </svg>
  );
}

export function Stat({ label, value, sub }: { label: string; value: ReactNode; sub?: string }) {
  return (
    <div className="glass p-5">
      <div className="eyebrow">{label}</div>
      <div className="mt-2 text-2xl font-extrabold tracking-tight">{value}</div>
      {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}
