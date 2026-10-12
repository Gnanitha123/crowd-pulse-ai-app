import { supabase } from "@/integrations/supabase/client";
import { predictCrowd, type Prediction } from "@/lib/demo";
import { getFestivalsOn, getHolidayOn, templeToPlace, type Temple } from "./templeService";

/**
 * Prediction service abstraction.
 * Today: DEMO engine (src/lib/demo.ts). Later: set VITE_ML_API_URL and implement `mlPredict`
 * to call the Python ML service; the rest of the app does not change.
 */
export const MODEL_VERSION = "demo-v1";
export const IS_DEMO = !import.meta.env.VITE_ML_API_URL;

export type PredictionResult = Prediction & { isDemo: boolean; modelVersion: string; savedId: string | null; context: string[] };

export function validate(input: { templeId?: string; date?: string; hour?: number }) {
  if (!input.templeId) return "Please choose a temple.";
  if (!input.date || isNaN(Date.parse(input.date))) return "Please choose a valid date.";
  if (input.hour == null || input.hour < 0 || input.hour > 23) return "Please choose a valid time.";
  return null;
}

export async function runPrediction(temple: Temple, date: string, hour: number): Promise<PredictionResult> {
  const [festivals, holidays] = await Promise.all([getFestivalsOn(temple.id, date), getHolidayOn(date)]);
  const base = predictCrowd(templeToPlace(temple), date, hour);
  const context = [
    ...festivals.map((f) => `Festival: ${f.festival_name}`),
    ...holidays.map((h) => `Holiday: ${h.name}`),
  ];
  const result = { ...base, reasons: [...context.map((c) => `${c} — expect heavier crowds`), ...base.reasons] };

  let savedId: string | null = null;
  const { data: u } = await supabase.auth.getUser();
  if (u.user) {
    const { data, error } = await supabase.from("predictions").insert({
      user_id: u.user.id, temple_id: temple.id, prediction_date: date, prediction_hour: hour,
      crowd_score: result.density, crowd_level: result.level,
      estimated_min: result.range[0], estimated_max: result.range[1],
      waiting_min: result.wait[0], waiting_max: result.wait[1],
      confidence: result.confidence, model_version: MODEL_VERSION,
    }).select("id").single();
    if (!error) savedId = data.id;
  }
  return { ...result, isDemo: IS_DEMO, modelVersion: MODEL_VERSION, savedId, context };
}

export async function listMyPredictions() {
  const { data, error } = await supabase.from("predictions").select("*, temples(name)").order("created_at", { ascending: false }).limit(20);
  if (error) throw error;
  return data ?? [];
}

export async function sendFeedback(predictionId: string, rating: number) {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error("Sign in to rate predictions.");
  const { error } = await supabase.from("prediction_feedback").insert({ prediction_id: predictionId, user_id: u.user.id, user_rating: rating });
  if (error) throw error;
}
