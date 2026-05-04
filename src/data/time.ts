export function getTimeWindows(): { now: number; todayStartMs: number; weekStartMs: number } {
  const now = Date.now();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  return { now, todayStartMs: todayStart.getTime(), weekStartMs: now - 7 * 24 * 60 * 60 * 1000 };
}
