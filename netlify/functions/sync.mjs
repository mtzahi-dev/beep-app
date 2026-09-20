// פונקציית Netlify: /.netlify/functions/sync — ראו server/syncHandler.js
import { handleSync } from "../../server/syncHandler.js";

export default async (req) => {
  const url = new URL(req.url);
  const body = req.method === "POST" ? await req.text() : "";
  const out = await handleSync(req.method, body, Object.fromEntries(url.searchParams), process.env);
  return new Response(out.body, { status: out.status, headers: out.headers });
};
