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
// קוד אקראי הוא 8 תווים, אבל הורה יכול לבחור קוד משלו (4–16 אותיות וספרות)
const CODE_RE = /^[A-Z0-9]{4,16}$/;
const MAX_BYTES = 300 * 1024;

// שם המשפחה הוא שכבה שנייה: הקוד לבדו לא מספיק כדי לראות את הלומדים
const cleanName = (s) => String(s || "").replace(/\s+/g, " ").trim().slice(0, 30);
const sameName = (a, b) => cleanName(a).toLowerCase() === cleanName(b).toLowerCase();

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
      if (data.name && !sameName(data.name, (query && query.name) || "")) return json(403, { error: "name" });
      return json(200, { code, name: data.name || "", users: data.users || [], updatedAt: data.updatedAt || 0 });
    }

    if (method !== "POST") return json(405, { error: "method" });
    if (!body || body.length > MAX_BYTES) return json(400, { error: "bad body" });
    const req = JSON.parse(body);
    const users = Array.isArray(req.users) ? req.users.slice(0, MAX_USERS).map(cleanUser) : [];
    if (!users.length) return json(400, { error: "no users" });
    const name = cleanName(req.name);

    // בלי קוד — יוצרים חדש (וכאן שם המשפחה חובה)
    if (!req.code) {
      if (name.length < 2) return json(400, { error: "bad name" });
      const code = newCode();
      await writeCode(code, { name, users, updatedAt: Date.now() });
      // store מאפשר לוודא שבענן באמת נשמר ב-Blobs ולא בקובץ מקומי זמני
      return json(200, { code, name, users, store: (await store()) ? "cloud" : "local" });
    }

    const code = String(req.code).toUpperCase();
    if (!CODE_RE.test(code)) return json(400, { error: "bad code" });
    const prev = await readCode(code);
    // בחירת קוד משלכם: אם הקוד כבר תפוס על ידי משפחה אחרת — לא מתחברים אליו בטעות
    if (req.create) {
      if (prev) return json(409, { error: "taken" });
      if (name.length < 2) return json(400, { error: "bad name" });
    }
    // הקוד לבדו לא פותח את רשימת הלומדים — גם שם המשפחה חייב להתאים.
    // למשפחה ותיקה שעדיין אין לה שם, השם הראשון שמגיע נשמר.
    if (prev && prev.name && !sameName(prev.name, name)) return json(403, { error: "name" });
    const renamed = cleanName(req.newName);
    const keep = renamed.length >= 2 ? renamed : (prev && prev.name) || name;
    const merged = mergeUsers(prev ? prev.users : [], users);
    await writeCode(code, { name: keep, users: merged, updatedAt: Date.now() });
    return json(200, { code, name: keep, users: merged });
  } catch (e) {
    console.error("sync:", e.message);
    return json(500, { error: "sync failed" });
  }
}
