import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  vite: {
    optimizeDeps: {
      include: [
        "lucide-react",
        "recharts",
        "clsx",
        "tailwind-merge",
      ],
    },

    plugins: [
      VitePWA({
        registerType: "autoUpdate",
        outDir: ".output/public",

        manifest: {
          name: "Crowd Pulse AI",
          short_name: "Crowd Pulse",
          description:
            "AI-powered temple crowd prediction and analysis",
          theme_color: "#0f172a",
          background_color: "#0f172a",
          display: "standalone",
          start_url: "/",
          scope: "/",

          icons: [
            {
              src: "/pwa-192x192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "/pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
            },
          ],
        },

        workbox: {
          globPatterns: [
            "**/*.{js,css,html,ico,png,svg,webp}",
          ],
        },
      }),
    ],
  },

  tanstackStart: {
    server: {
      entry: "server",
    },

    spa: {
      enabled: true,

      prerender: {
        outputPath: "/index.html",
      },
    },
  },
});