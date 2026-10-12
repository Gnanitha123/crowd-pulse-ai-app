
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHead } from "@/components/shell";
import VideoCrowdAnalyzer from "@/components/VideoCrowdAnalyzer";

export const Route = createFileRoute("/analyze")({
  head: () => ({
    meta: [
      { title: "Analyze Video — Crowd Pulse AI" },
      {
        name: "description",
        content: "AI-powered temple crowd video analysis.",
      },
      {
        property: "og:title",
        content: "Analyze Video — Crowd Pulse AI",
      },
      {
        property: "og:description",
        content: "AI-powered temple crowd analysis.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AnalyzePage,
});

function AnalyzePage() {
  const [videoError, setVideoError] = useState(false);

  const steps = [
    "Video",
    "Frames",
    "Person detection",
    "People count",
    "Density",
    "Crowd level",
  ];

  return (
    <div>
      <PageHead
        eyebrow="Mode 02 · Every frame tells a story"
        title="Analyze Video"
        sub="AI analyzes the temple crowd and selects the matching crowd-level video automatically."
      />

      <div className="glass mb-6 flex flex-wrap items-center gap-2 p-4 font-mono text-xs">
        {steps.map((item, index) => (
          <div key={item} className="flex items-center gap-2">
            <span className="rounded-full bg-primary/15 px-3 py-1 text-primary">
              {item}
            </span>
            {index < steps.length - 1 && (
              <span className="text-muted-foreground/40">→</span>
            )}
          </div>
        ))}
      </div>

      {videoError ? (
        <div className="glass rounded-xl p-6">
          <h2 className="mb-2 text-lg font-semibold">
            Input video could not be loaded
          </h2>
          <p className="text-sm text-muted-foreground">
            Check that temple-input.mp4 exists inside your project's
            public folder and that the filename matches exactly.
          </p>
          <button
            type="button"
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-primary-foreground"
            onClick={() => {
              setVideoError(false);
              window.location.reload();
            }}
          >
            Retry
          </button>
        </div>
      ) : (
        <VideoCrowdAnalyzer />
      )}
    </div>
  );
}
