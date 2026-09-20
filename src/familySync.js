// סנכרון לומדים בין מכשירים: שולחים את הלומדים שבמכשיר, מקבלים בחזרה רשימה מאוחדת.
// המיזוג נעשה גם בשרת וגם כאן, באותו קוד, כדי ששני הצדדים יגיעו לאותה תוצאה.

import { mergeUsers } from "../server/mergeUsers.js";

const API = "/.netlify/functions/sync";
const ERR = { 404: "no-code", 409: "taken", 403: "name" };
const post = async (payload) => {
  const r = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(ERR[r.status] || "failed");
  return r.json();
};

// קוד שההורה בוחר בעצמו — נתפס רק אם הוא פנוי
export async function claimFamily(code, name, users) {
  const data = await post({ code, name, users, create: true });
  return { code: data.code, name: data.name, users: data.users };
}

// הקישור שמאחורי הברקוד — פתיחה שלו במכשיר אחר מחברת אותו למשפחה
export const familyLink = (code, name) =>
  `${location.origin}/?family=${encodeURIComponent(code)}&fam=${encodeURIComponent(name || "")}`;

// יצירת קוד חדש מהלומדים שיש במכשיר
export async function createFamily(name, users) {
  const data = await post({ name, users });
  return { code: data.code, name: data.name, users: data.users };
}

// סנכרון דו-כיווני: מה שיש כאן עולה, ומה שיש שם יורד
export async function syncFamily(code, name, users) {
  const data = await post({ code, name, users });
  return { code: data.code, name: data.name, users: mergeUsers(users, data.users) };
}

// חיבור מכשיר לקוד קיים — בודק שהקוד קיים לפני שמסנכרנים
export async function joinFamily(code, name, users) {
  const r = await fetch(`${API}?code=${encodeURIComponent(code)}&name=${encodeURIComponent(name)}`);
  if (r.status === 404) throw new Error("no-code");
  if (r.status === 403) throw new Error("name");
  if (!r.ok) throw new Error("failed");
  const data = await r.json();
  return syncFamily(code, name, mergeUsers(users, data.users));
}
