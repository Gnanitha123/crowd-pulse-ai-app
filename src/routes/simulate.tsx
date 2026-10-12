import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { LevelPill, PageHead } from "@/components/shell";
import { levelOf } from "@/lib/demo";

export const Route = createFileRoute("/simulate")({
  head: () => ({
    meta: [
      { title: "Crowd Simulation — Crowd Pulse AI" },
      { name: "description", content: "An animated visual approximation of how crowds fill a temple complex." },
      { property: "og:title", content: "Crowd Simulation — Crowd Pulse AI" },
      { property: "og:description", content: "See how the crowd flows at different densities." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SimPage,
});

function SimPage() {
  const [density, setDensity] = useState(55);
  const ref = useRef<HTMLCanvasElement>(null);
  const dRef = useRef(density);
  dRef.current = density;

  useEffect(() => {
    const c = ref.current!; const ctx = c.getContext("2d")!;
    const css = getComputedStyle(document.documentElement);
    const cyan = css.getPropertyValue("--primary"), gold = css.getPropertyValue("--gold"), bord = css.getPropertyValue("--border");
    type P = { x: number; y: number; vx: number; vy: number };
    const ps: P[] = [];
    let raf = 0;
    const loop = () => {
      const W = (c.width = c.clientWidth * 2), H = (c.height = c.clientHeight * 2);
      const target = Math.round(dRef.current * 9);
      while (ps.length < target) ps.push({ x: Math.random() * W * 0.15, y: H * (0.35 + Math.random() * 0.3), vx: 0, vy: 0 });
      ps.length = Math.min(ps.length, target);
      ctx.clearRect(0, 0, W, H);
      // temple shrine + queue lanes
      ctx.strokeStyle = bord; ctx.lineWidth = 2;
      ctx.strokeRect(W * 0.05, H * 0.3, W * 0.75, H * 0.4);
      ctx.fillStyle = gold; ctx.globalAlpha = 0.85;
      ctx.beginPath(); ctx.moveTo(W * 0.86, H * 0.25); ctx.lineTo(W * 0.95, H * 0.5); ctx.lineTo(W * 0.86, H * 0.75); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1;
      const speed = 2.4 * (1.1 - dRef.current / 110);
      ctx.fillStyle = cyan;
      for (const p of ps) {
        p.vx += (speed - p.vx) * 0.05 + (Math.random() - 0.5) * 0.3;
        p.vy += (H / 2 - p.y) * 0.0004 + (Math.random() - 0.5) * 0.4;
        p.vy *= 0.9;
        p.x += p.vx; p.y += p.vy;
        if (p.x > W * 0.85) { p.x = Math.random() * W * 0.05; p.y = H * (0.35 + Math.random() * 0.3); }
        ctx.beginPath(); ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2); ctx.fill();
      }
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, []);

  const level = levelOf(density / 100);
  return (
    <div>
      <PageHead eyebrow="Mode 03" title="Crowd Simulation" sub="AI Simulation — visual approximation, not real CCTV footage.">
        <LevelPill level={level} />
      </PageHead>
      <div className="glass overflow-hidden p-3">
        <canvas ref={ref} className="h-[420px] w-full rounded-xl bg-background/60" />
      </div>
      <div className="glass mt-6 flex flex-wrap items-center gap-6 p-6">
        <div className="eyebrow">Density · {density}%</div>
        <input type="range" min={5} max={100} value={density} onChange={(e) => setDensity(+e.target.value)} className="flex-1 accent-[var(--primary)]" />
        <div className="font-mono text-sm text-muted-foreground">≈ {Math.round(density * 0.45)} min wait</div>
      </div>
    </div>
  );
}
