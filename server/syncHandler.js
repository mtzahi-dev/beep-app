// סנכרון לומדים בין מכשירים לפי "קוד משפחה".
//   POST { users }          → יוצר קוד חדש ושומר את הלומדים
//   POST { code, users }    → ממזג עם מה ששמור, מחזיר את הרשימה המאוחדת
//   GET  ?code=XXXXXXXX     → מחזיר את הלומדים של הקוד
// אחסון: Netlify Blobs בענן; בפיתוח מקומי — קובץ זמני, כדי שאפשר יהיה לבדוק בלי ענן.

import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { mergeUsers, MAX_USERS } from "./mergeUsers.js";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // בלי אותיות שמתבלבלות (I,O,0,1)
const CODE_RE = /^[A-HJ-NP-Z2-9]{8}$/;
const MAX_BYTES = 300 * 1024;

const json = (status, obj) => ({
  status,
  headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  body: JSON.stringify(obj),
});

let storeMemo;
async function store() {
  if (storeMemo !== undefined) return storeMemo;
  try {
    const { getStore } = await import("@netlify/blobs");
    storeMemo = getStore({ name: "beep-family", consistency: "strong" });
  } catch {
    storeMemo = null; // אין ענן (פיתוח מקומי)
  }
  return storeMemo;
}

const devFile = (code) => path.join(os.tmpdir(), `beep-family-${code}.json`);

async function readCode(code) {
  const s = await store();
  if (s) {
    try {
      return (await s.get(code, { type: "json" })) || null;
    } catch {
      return null;
    }
  }
  try {
    return JSON.parse(await fs.readFile(devFile(code), "utf8"));
  } catch {
    return null;
  }
}

async function writeCode(code, data) {
  const s = await store();
  if (s) return s.setJSON(code, data);
  return fs.writeFile(devFile(code), JSON.stringify(data));
}

function newCode() {
  let out = "";
  for (let i = 0; i < 8; i++) out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return out;
}

// שומרים רק את מה שצריך ללומד — בלי שדות ענק שנוצרו בטעות
const cleanUser = (u) => {
  const out = {};
  for (const [k, v] of Object.entries(u || {})) {
    if (typeof v === "function" || k.startsWith("_")) continue;
    out[k] = v;
  }
  return out;
};

export async function handleSync(method, body, query, env) {
  try {
    if (method === "GET") {
      const code = String((query && query.code) || "").toUpperCase();
      if (!CODE_RE.test(code)) return json(400, { error: "bad code" });
      const data = await readCode(code);
      if (!data) return json(404, { error: "no such code" });
      return json(200, { code, users: data.users || [], updatedAt: data.updatedAt || 0 });
    }

    if (method !== "POST") return json(405, { error: "method" });
    if (!body || body.length > MAX_BYTES) return json(400, { error: "bad body" });
    const req = JSON.parse(body);
    const users = Array.isArray(req.users) ? req.users.slice(0, MAX_USERS).map(cleanUser) : [];
    if (!users.length) return json(400, { error: "no users" });

    // בלי קוד — יוצרים חדש
    if (!req.code) {
      const code = newCode();
      await writeCode(code, { users, updatedAt: Date.now() });
      // store מאפשר לוודא שבענן באמת נשמר ב-Blobs ולא בקובץ מקומי זמני
      return json(200, { code, users, store: (await store()) ? "cloud" : "local" });
    }

    const code = String(req.code).toUpperCase();
    if (!CODE_RE.test(code)) return json(400, { error: "bad code" });
    const prev = await readCode(code);
    const merged = mergeUsers(prev ? prev.users : [], users);
    await writeCode(code, { users: merged, updatedAt: Date.now() });
    return json(200, { code, users: merged });
  } catch (e) {
    console.error("sync:", e.message);
    return json(500, { error: "sync failed" });
  }
}
