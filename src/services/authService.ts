import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const signUp = (email: string, password: string, displayName: string) =>
  supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin, data: { display_name: displayName } } });
export const signIn = (email: string, password: string) => supabase.auth.signInWithPassword({ email, password });
export const signOut = () => supabase.auth.signOut();

export async function getProfile() {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return null;
  const { data } = await supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle();
  return { user: u.user, profile: data };
}
export async function updateDisplayName(name: string) {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error("Not signed in");
  const { error } = await supabase.from("profiles").upsert({ id: u.user.id, display_name: name });
  if (error) throw error;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => { setUser(s?.user ?? null); setReady(true); });
    supabase.auth.getSession().then(({ data }) => { setUser(data.session?.user ?? null); setReady(true); });
    return () => sub.subscription.unsubscribe();
  }, []);
  return { user, ready };
}
