import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Cta } from "@/components/ui-cta";
import { signIn, signUp } from "@/services/authService";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Crowd Pulse AI" },
      { name: "description", content: "Sign in to save predictions and upload crowd videos." },
      { property: "og:title", content: "Sign in — Crowd Pulse AI" },
      { property: "og:description", content: "Save predictions and upload crowd videos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

const field = "w-full rounded-xl border border-input bg-secondary/60 px-4 py-3 text-sm outline-none focus:border-primary";

function AuthPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (password.length < 6) return setMsg({ ok: false, text: "Password must be at least 6 characters." });
    setBusy(true);
    if (mode === "in") {
      const { error } = await signIn(email, password);
      setBusy(false);
      if (error) return setMsg({ ok: false, text: error.message });
      nav({ to: "/profile" });
    } else {
      const { data, error } = await signUp(email, password, name);
      setBusy(false);
      if (error) return setMsg({ ok: false, text: error.message });
      if (data.session) nav({ to: "/profile" });
      else setMsg({ ok: true, text: "Check your email to confirm your account, then sign in." });
    }
  };

  return (
    <div className="mx-auto mt-10 max-w-md animate-rise">
      <div className="glass p-8">
        <div className="eyebrow mb-2">Account</div>
        <h1 className="text-3xl font-extrabold tracking-tight">{mode === "in" ? "Welcome back" : "Create account"}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Save your predictions and upload crowd videos.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          {mode === "up" && <input className={field} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />}
          <input className={field} type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className={field} type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {msg && <p className={`text-sm ${msg.ok ? "text-primary" : "text-destructive"}`}>{msg.text}</p>}
          <Cta className="w-full" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}{mode === "in" ? "Sign in" : "Sign up"}</Cta>
        </form>
        <button onClick={() => { setMode(mode === "in" ? "up" : "in"); setMsg(null); }} className="mt-5 w-full text-center text-sm text-muted-foreground hover:text-foreground">
          {mode === "in" ? "New here? Create an account" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
