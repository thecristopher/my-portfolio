import { createHash } from "node:crypto";
import process from "node:process";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const inlineScriptHashes = (html) =>
  [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(
    ([, body]) => `'sha256-${createHash("sha256").update(body).digest("base64")}'`,
  );

// only production builds get the policy, the dev server injects inline scripts of its own for hot reload
const contentSecurityPolicy = (apiUrl) => ({
  name: "content-security-policy",
  apply: "build",
  transformIndexHtml: {
    order: "post",
    handler(html) {
      const apiOrigin = new URL(apiUrl).origin;
      const policy = [
        "default-src 'self'",
        // the theme script in index.html runs before paint, so it's allowed by its exact hash and nothing else inline is
        `script-src 'self' ${inlineScriptHashes(html).join(" ")}`,
        // framer-motion and the section glows set inline styles
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data:",
        `connect-src 'self' ${apiOrigin}`,
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        ...(apiOrigin.startsWith("https:") ? ["upgrade-insecure-requests"] : []),
      ].join("; ");

      return [{ tag: "meta", attrs: { "http-equiv": "Content-Security-Policy", content: policy }, injectTo: "head-prepend" }];
    },
  },
});

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [react(), tailwindcss(), contentSecurityPolicy(env.VITE_API_URL)],
    build: {
      outDir: "dist",
    },
  };
});
