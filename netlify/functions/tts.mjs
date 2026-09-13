// פונקציית Netlify: /.netlify/functions/tts — ראו server/ttsHandler.js
import { handleTts } from "../../server/ttsHandler.js";

export default async (req) => {
  const body = req.method === "POST" ? await req.text() : "";
  const out = await handleTts(req.method, body, process.env);
  return new Response(out.body, { status: out.status, headers: out.headers });
};
