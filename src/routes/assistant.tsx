import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { DemoBadge, PageHead } from "@/components/shell";
import { PLACES, predictCrowd } from "@/lib/demo";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "Ask Pulse AI — Crowd Pulse AI" },
      { name: "description", content: "Ask questions about crowd levels, best visiting times and planning." },
      { property: "og:title", content: "Ask Pulse AI" },
      { property: "og:description", content: "Your crowd planning assistant." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Assistant,
});

const SUGGEST = ["When is the best time to visit Tirumala this Saturday?", "How busy is the Golden Temple tomorrow evening?", "What makes a crowd level CRITICAL?"];

function answer(q: string) {
  const lower = q.toLowerCase();
  const place = PLACES.find((p) => lower.includes(p.city.toLowerCase()) || p.name.toLowerCase().split(" ").some((w) => w.length > 4 && lower.includes(w.toLowerCase()))) ?? PLACES[0]!;
  if (lower.includes("critical")) return "CRITICAL means density above 85% of safe capacity — long queues, slow movement and higher safety risk. Visit at a quieter hour if you can.";
  const d = new Date(); if (lower.includes("tomorrow")) d.setDate(d.getDate() + 1);
  if (lower.includes("saturday")) d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7));
  const hour = lower.includes("evening") ? 18 : 9;
  const r = predictCrowd(place, d.toISOString().slice(0, 10), hour);
  return `For ${place.name} on ${d.toDateString()}, the crowd around ${hour % 12 || 12}${hour < 12 ? "am" : "pm"} looks ${r.level} (${r.density}% density, ${r.wait[0]}–${r.wait[1]} min wait). The quietest time is around ${r.best.label}; busiest around ${r.peak}.`;
}

function Assistant() {
  const [msgs, setMsgs] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [q, setQ] = useState("");
  const send = (text: string) => {
    if (!text.trim()) return;
    setMsgs((m) => [...m, { role: "user", text }, { role: "ai", text: answer(text) }]);
    setQ("");
  };
  return (
    <div className="mx-auto max-w-3xl">
      <PageHead eyebrow="Assistant" title="Ask Pulse AI" sub="Plan your visit in plain language."><DemoBadge text="rule-based answers" /></PageHead>
      <div className="glass flex min-h-[460px] flex-col p-5">
        <div className="flex-1 space-y-4">
          {msgs.length === 0 && (
            <div className="space-y-2">
              {SUGGEST.map((s) => <button key={s} onClick={() => send(s)} className="block w-full rounded-xl border border-border px-4 py-3 text-left text-sm text-muted-foreground transition hover:border-primary/40 hover:text-foreground">{s}</button>)}
            </div>
          )}
          {msgs.map((m, i) => (
            <div key={i} className={`flex animate-rise ${m.role === "user" ? "justify-end" : ""}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                {m.role === "ai" && <Sparkles className="mb-1 h-3.5 w-3.5 text-primary" />}{m.text}
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); send(q); }} className="mt-4 flex gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask about any temple, date or time…" className="flex-1 rounded-full border border-input bg-secondary/60 px-5 py-3 text-sm outline-none focus:border-primary" />
          <button className="grid h-11 w-11 place-items-center rounded-full bg-primary text-primary-foreground" aria-label="Send"><Send className="h-4 w-4" /></button>
        </form>
      </div>
    </div>
  );
}
