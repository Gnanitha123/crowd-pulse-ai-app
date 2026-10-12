export type CrowdLevel = "LOW" | "MEDIUM" | "HIGH" | "VERY HIGH";

const KEY = "predictedCrowd";

// Turns "high", "HIGH", "Very High", "very-high" into a CrowdLevel.
export function normalizeLevel(raw: unknown): CrowdLevel | null {
  if (typeof raw !== "string") return null;
  const s = raw.toUpperCase().replace(/[\s_-]+/g, " ").trim();
  if (s.includes("VERY") || s.includes("EXTREME")) return "VERY HIGH";
  if (s.includes("HIGH")) return "HIGH";
  if (s.includes("MED") || s.includes("MODERATE")) return "MEDIUM";
  if (s.includes("LOW")) return "LOW";
  return null;
}

// Call this on the Predict page whenever a result is shown.
export function savePredictedLevel(raw: unknown) {
  const level = normalizeLevel(raw);
  if (!level) return;
  try {
    localStorage.setItem(KEY, level);
  } catch {
    /* storage unavailable */
  }
}

// Call this on the Analyze Video page.
export function getPredictedLevel(): CrowdLevel | null {
  try {
    return normalizeLevel(localStorage.getItem(KEY));
  } catch {
    return null;
  }
}