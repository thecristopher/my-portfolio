import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: "dist",
    // the pdf writer is the one big chunk, and it only downloads the first time someone asks for the resume
    chunkSizeWarningLimit: 1300,
    rollupOptions: {
      output: {
        // the libraries change far less often than the site, so they get their own files and stay cached between deploys
        manualChunks: {
          react: ["react", "react-dom", "react-dom/client"],
          motion: ["framer-motion", "lenis"],
          data: ["@reduxjs/toolkit", "react-redux"],
        },
      },
    },
  },
});
