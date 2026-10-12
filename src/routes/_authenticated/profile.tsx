import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { LevelPill, PageHead } from "@/components/shell";
import { Cta } from "@/components/ui-cta";
import { getProfile, signOut, updateDisplayName } from "@/services/authService";
import { listMyPredictions } from "@/services/predictionService";
import type { Level } from "@/lib/demo";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Your profile — Crowd Pulse AI" },
      { name: "description", content: "Your account and saved crowd predictions." },
      { property: "og:title", content: "Your profile — Crowd Pulse AI" },
      { property: "og:description", content: "Your account and saved predictions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Profile,
});

function Profile() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const me = useQuery({ queryKey: ["profile"], queryFn: getProfile });
  const preds = useQuery({ queryKey: ["predictions"], queryFn: listMyPredictions });
  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);
  useEffect(() => { setName(me.data?.profile?.display_name ?? ""); }, [me.data]);

  return (
    <div>
      <PageHead eyebrow="Account" title={`Hello${me.data?.profile?.display_name ? ", " + me.data.profile.display_name : ""}`} sub={me.data?.user.email}>
        <Cta variant="ghost" onClick={async () => { await signOut(); qc.clear(); nav({ to: "/" }); }}>Sign out</Cta>
      </PageHead>
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <form className="glass h-fit space-y-4 p-6" onSubmit={async (e) => { e.preventDefault(); await updateDisplayName(name); setSaved(true); qc.invalidateQueries({ queryKey: ["profile"] }); }}>
          <label className="block"><span className="eyebrow">Display name</span>
            <input value={name} onChange={(e) => { setName(e.target.value); setSaved(false); }} className="mt-2 w-full rounded-xl border border-input bg-secondary/60 px-4 py-3 text-sm outline-none focus:border-primary" />
          </label>
          <Cta className="w-full">{saved ? "Saved" : "Save"}</Cta>
        </form>
        <div className="glass p-6">
          <h3 className="font-bold">Saved predictions</h3>
          {preds.data?.length === 0 && <p className="mt-4 text-sm text-muted-foreground">No predictions yet.</p>}
          <div className="mt-4 divide-y divide-border text-sm">
            {preds.data?.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <div className="font-semibold">{p.temples?.name}</div>
                  <div className="font-mono text-xs text-muted-foreground">{p.prediction_date} · {p.prediction_hour}:00 · {p.model_version}</div>
                </div>
                <LevelPill level={p.crowd_level as Level} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
