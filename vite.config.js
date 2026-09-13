import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { handleTts } from "./server/ttsHandler.js";

// בפיתוח: אותה כתובת כמו פונקציית Netlify, עם המפתח מקובץ .env (נקרא מחדש בכל בקשה)
function ttsDevApi() {
  return {
    name: "beep-tts-dev",
    configureServer(server) {
      server.middlewares.use("/.netlify/functions/tts", async (req, res) => {
        const chunks = [];
        for await (const c of req) chunks.push(c);
        const env = loadEnv(server.config.mode, server.config.envDir || server.config.root, "");
        const out = await handleTts(req.method, Buffer.concat(chunks).toString("utf8"), env);
        res.statusCode = out.status;
        for (const [k, v] of Object.entries(out.headers)) res.setHeader(k, v);
        res.end(typeof out.body === "string" ? out.body : Buffer.from(out.body));
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), ttsDevApi()],
  server: { port: 5199 },
});
