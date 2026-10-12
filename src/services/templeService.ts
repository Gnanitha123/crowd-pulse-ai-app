import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import type { Place } from "@/lib/demo";

export type Temple = Tables<"temples">;

export async function listTemples(): Promise<Temple[]> {
  const { data, error } = await supabase.from("temples").select("*").order("popularity_score", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** Map a temple row to the shape the prediction engine expects. */
export function templeToPlace(t: Temple): Place {
  return { id: t.id, name: t.name, city: t.city, base: Math.round(Number(t.popularity_score) * 230) };
}

export async function getFestivalsOn(templeId: string, date: string) {
  const { data } = await supabase.from("festivals").select("festival_name").eq("temple_id", templeId).lte("start_date", date).gte("end_date", date);
  return data ?? [];
}
export async function getHolidayOn(date: string) {
  const { data } = await supabase.from("holidays").select("name").eq("date", date);
  return data ?? [];
}
