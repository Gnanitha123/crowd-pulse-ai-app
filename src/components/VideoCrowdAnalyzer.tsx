import { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import { getPredictedLevel, type CrowdLevel } from "@/lib/crowdPrediction";

const BACKGROUND_VIDEOS: Record<CrowdLevel, string> = {
  LOW: "/low-crowd.mp4",
  MEDIUM: "/medium-crowd.mp4",
  HIGH: "/high-crowd.mp4",
  "VERY HIGH": "/very-high-crowd.mp4",
};

function getCrowdLevel(count: number): CrowdLevel {
  if (count < 5) return "LOW";
  if (count < 15) return "MEDIUM";
  if (count < 30) return "HIGH";
  return "VERY HIGH";
}

function waitForVideoEvent(
  video: HTMLVideoElement,
  eventName: "loadeddata" | "seeked"
): Promise<void> {
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      video.removeEventListener(eventName, onDone);
      video.removeEventListener("error", onError);
    };
    const onDone = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error("Unable to read temple-input.mp4. Check that it exists in public."));
    };
    video.addEventListener(eventName, onDone, { once: true });
    video.addEventListener("error", onError, { once: true });
  });
}

export default function VideoCrowdAnalyzer() {
  const analysisVideoRef = useRef<HTMLVideoElement>(null);

  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  // Level from the Predict page (this decides the background video).
  const [predictedLevel, setPredictedLevel] = useState<CrowdLevel | null>(null);
  // Level from counting people in temple-input.mp4 (extra info / fallback only).
  const [detectedLevel, setDetectedLevel] = useState<CrowdLevel | null>(null);

  const [people, setPeople] = useState(0);
  const [framesAnalyzed, setFramesAnalyzed] = useState(0);
  const [error, setError] = useState("");
  const [backgroundError, setBackgroundError] = useState("");

  // Read the Predict page result when this page opens.
  useEffect(() => {
    setPredictedLevel(getPredictedLevel());
  }, []);

  // Load TensorFlow + COCO-SSD.
  useEffect(() => {
    let cancelled = false;
    async function loadModel() {
      try {
        await tf.ready();
        const loaded = await cocoSsd.load();
        if (!cancelled) setModel(loaded);
      } catch (err) {
        console.error("Model loading error:", err);
        if (!cancelled)
          setError("AI model could not load. Check your internet connection and refresh.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void loadModel();
    return () => {
      cancelled = true;
    };
  }, []);

  // The Predict page result always wins. Detection is only a fallback.
  const activeLevel = predictedLevel ?? detectedLevel;
  const backgroundVideo = activeLevel ? BACKGROUND_VIDEOS[activeLevel] : null;

  async function analyzeVideo() {
    const video = analysisVideoRef.current;
    if (!model || !video || analyzing) return;

    setAnalyzing(true);
    setError("");
    setBackgroundError("");
    setPredictedLevel(getPredictedLevel()); // pick up a fresh prediction

    try {
      if (video.readyState < 2) await waitForVideoEvent(video, "loadeddata");

      const duration = video.duration;
      if (!Number.isFinite(duration) || duration <= 0)
        throw new Error("The source video has no valid duration.");

      const sampleCount = Math.min(12, Math.max(1, Math.floor(duration)));
      const counts: number[] = [];

      for (let i = 0; i < sampleCount; i++) {
        const time =
          sampleCount === 1
            ? Math.min(duration / 2, duration - 0.05)
            : Math.min(((duration - 0.05) * i) / (sampleCount - 1), duration - 0.05);

        if (Math.abs(video.currentTime - time) > 0.01) {
          const seekPromise = waitForVideoEvent(video, "seeked");
          video.currentTime = time;
          await seekPromise;
        }

        const predictions = await model.detect(video);
        counts.push(
          predictions.filter((p) => p.class === "person" && p.score >= 0.45).length
        );
      }

      const average = counts.reduce((a, b) => a + b, 0) / counts.length;
      const estimated = Math.round(average);

      setPeople(estimated);
      setFramesAnalyzed(counts.length);
      setDetectedLevel(getCrowdLevel(estimated));
    } catch (err) {
      console.error("Analysis error:", err);
      setError(err instanceof Error ? err.message : "Video analysis failed.");
    } finally {
      setAnalyzing(false);
    }
  }

  const heading = predictedLevel
    ? "PREDICTED CROWD (FROM PREDICT PAGE)"
    : detectedLevel
      ? "AI VIDEO ANALYSIS RESULT"
      : "WAITING FOR PREDICTION";

  return (
    <div className="relative isolate w-full space-y-6">
      {/* Hidden source video for people detection. */}
      <video
        ref={analysisVideoRef}
        src="/temple-input.mp4"
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        className="pointer-events-none absolute h-px w-px opacity-0"
      />

      <div className="relative min-h-[440px] overflow-hidden rounded-3xl border border-cyan-400/30 bg-slate-950 sm:min-h-[540px]">
        {backgroundVideo ? (
          <video
            key={backgroundVideo}
            src={backgroundVideo}
            autoPlay
            muted
            loop
            playsInline
            controls
            preload="auto"
            onLoadedData={(e) => {
              setBackgroundError("");
              void e.currentTarget.play().catch(() =>
                setBackgroundError("Video loaded but did not start. Press Play on the video.")
              );
            }}
            onError={() =>
              setBackgroundError(
                `Could not load ${backgroundVideo}. Check that the file exists in your public folder.`
              )
            }
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
            <p className="px-6 text-center text-white/70">
              Run a prediction on the Predict page. The matching crowd video will play here.
            </p>
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-black/45" />

        <div className="pointer-events-none relative z-10 flex min-h-[440px] flex-col justify-between p-6 sm:min-h-[540px] sm:p-10">
          <div>
            <p className="text-sm font-semibold tracking-[0.2em] text-cyan-300">CROWD PULSE AI</p>
            <h2 className="mt-3 text-3xl font-bold text-white sm:text-5xl">Video Crowd Analysis</h2>
          </div>

          <div>
            <p className="text-sm font-semibold text-white/80">{heading}</p>
            <h3 className="mt-2 text-4xl font-extrabold text-cyan-300 sm:text-6xl">
              {activeLevel ?? "NOT PREDICTED"}
            </h3>
            {backgroundVideo && (
              <p className="mt-3 break-all text-sm text-white">Playing: {backgroundVideo}</p>
            )}
          </div>

          <div className="pointer-events-auto">
            <button
              type="button"
              onClick={() => void analyzeVideo()}
              disabled={loading || !model || analyzing}
              className="rounded-xl bg-cyan-400 px-6 py-3 font-bold text-slate-950 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Loading AI model..." : analyzing ? "Analyzing..." : "Analyze Video"}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-xl border border-red-400/30 bg-red-950/40 p-4 text-red-200">
          {error}
        </p>
      )}
      {backgroundError && (
        <p role="alert" className="rounded-xl border border-amber-400/30 bg-amber-950/40 p-4 text-amber-200">
          {backgroundError}
        </p>
      )}

      {detectedLevel && !analyzing && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-black/40 p-5 text-center">
            <p className="text-sm text-white/60">Average people detected</p>
            <p className="mt-2 text-4xl font-bold text-white">{people}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/40 p-5 text-center">
            <p className="text-sm text-white/60">Predicted crowd level</p>
            <p className="mt-2 text-2xl font-bold text-cyan-300">{activeLevel}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/40 p-5 text-center">
            <p className="text-sm text-white/60">Frames analyzed</p>
            <p className="mt-2 text-4xl font-bold text-white">{framesAnalyzed}</p>
          </div>
        </div>
      )}
    </div>
  );
}