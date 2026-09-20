// סנכרון לומדים בין מכשירים: שולחים את הלומדים שבמכשיר, מקבלים בחזרה רשימה מאוחדת.
// המיזוג נעשה גם בשרת וגם כאן, באותו קוד, כדי ששני הצדדים יגיעו לאותה תוצאה.

import { mergeUsers } from "../server/mergeUsers.js";

const API = "/.netlify/functions/sync";
const post = async (payload) => {
  const r = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(r.status === 404 ? "no-code" : r.status === 409 ? "taken" : "failed");
  return r.json();
};

// קוד שההורה בוחר בעצמו — נתפס רק אם הוא פנוי
export async function claimFamily(code, users) {
  const data = await post({ code, users, create: true });
  return { code: data.code, users: data.users };
}

// הקישור שמאחורי הברקוד — פתיחה שלו במכשיר אחר מחברת אותו למשפחה
export const familyLink = (code) => `${location.origin}/?family=${encodeURIComponent(code)}`;

// יצירת קוד חדש מהלומדים שיש במכשיר
export async function createFamily(users) {
  const data = await post({ users });
  return { code: data.code, users: data.users };
}

// סנכרון דו-כיווני: מה שיש כאן עולה, ומה שיש שם יורד
export async function syncFamily(code, users) {
  const data = await post({ code, users });
  return { code: data.code, users: mergeUsers(users, data.users) };
}

// חיבור מכשיר לקוד קיים — בודק שהקוד קיים לפני שמסנכרנים
export async function joinFamily(code, users) {
  const r = await fetch(`${API}?code=${encodeURIComponent(code)}`);
  if (r.status === 404) throw new Error("no-code");
  if (!r.ok) throw new Error("failed");
  const data = await r.json();
  return syncFamily(code, mergeUsers(users, data.users));
}
