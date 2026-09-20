// מיזוג רשימות לומדים משני מכשירים: לכל לומד נשמר העותק שעודכן לאחרונה.
// משותף לשרת וללקוח — בלי תלויות, כדי ששני הצדדים ימזגו בדיוק אותו דבר.

export const MAX_USERS = 12;

export function mergeUsers(a = [], b = []) {
  const byId = new Map();
  for (const u of [...(a || []), ...(b || [])]) {
    if (!u || !u.id || !u.name) continue;
    const cur = byId.get(u.id);
    if (!cur || (u.updatedAt || 0) > (cur.updatedAt || 0)) byId.set(u.id, u);
  }
  return [...byId.values()]
    .sort((x, y) => (y.updatedAt || 0) - (x.updatedAt || 0))
    .slice(0, MAX_USERS);
}
