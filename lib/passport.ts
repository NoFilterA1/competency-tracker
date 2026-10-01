import { createHash } from "node:crypto";

export const period = (d = new Date()) => d.toISOString().slice(0, 7);
export const codeFor = (id: number, per = period()) => `${id}-${createHash("sha1").update(`${id}|${per}|competency-tracker`).digest("hex").slice(0, 8)}`;
export function checkCode(code: string): { id: number; period: string } | null {
  const id = parseInt(code.split("-")[0], 10);
  if (!id) return null;
  const now = new Date();
  for (const back of [0, 1, 2]) {
    const d = new Date(now.getFullYear(), now.getMonth() - back, 15);
    const per = period(d);
    if (codeFor(id, per) === code) return { id, period: per };
  }
  return null;
}
