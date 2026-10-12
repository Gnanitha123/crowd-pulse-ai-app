import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type VideoAnalysis = Tables<"video_analysis">;
export type VideoStatus = "uploading" | "processing" | "completed" | "failed";

/** True once a real computer-vision backend is configured. Until then no detections are produced. */
export const CV_CONNECTED = !!import.meta.env.VITE_CV_API_URL;

export async function uploadVideo(file: File): Promise<VideoAnalysis> {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error("Please sign in to upload videos.");
  const path = `${u.user.id}/${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;

  const { data: rec, error: e1 } = await supabase.from("video_analysis").insert({ user_id: u.user.id, video_url: path, status: "uploading" }).select().single();
  if (e1) throw e1;

  const { error: e2 } = await supabase.storage.from("videos").upload(path, file, { contentType: file.type });
  if (e2) {
    await supabase.from("video_analysis").update({ status: "failed", analysis_summary: e2.message }).eq("id", rec.id);
    throw e2;
  }
  return requestAnalysis(rec.id);
}

/**
 * Hand the stored video to the computer-vision service.
 * Without a connected service the record stays in "processing" — no fake results are written.
 */
export async function requestAnalysis(id: string): Promise<VideoAnalysis> {
  const { data, error } = await supabase.from("video_analysis").update({ status: "processing" }).eq("id", id).select().single();
  if (error) throw error;
  // Future: POST { id, video_url } to the CV service, which writes results back to this row.
  return data;
}

export async function listMyVideos() {
  const { data, error } = await supabase.from("video_analysis").select("*").order("created_at", { ascending: false }).limit(10);
  if (error) throw error;
  return data ?? [];
}

export async function signedVideoUrl(path: string) {
  const { data } = await supabase.storage.from("videos").createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}
