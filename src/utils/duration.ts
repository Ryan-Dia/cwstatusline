/** 'h m' style — 1h 30m, 45m, 2d 3h */
export function formatRemainingHM(ms: number): string {
  const totalMins = Math.max(0, Math.ceil(ms / 60000));
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  if (h >= 24) {
    const d = Math.floor(h / 24);
    const rh = h % 24;
    return `${d}d ${rh}h`;
  }
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

/** 'MM/DD HH:mm' absolute datetime from unix seconds — used for rate limit reset dates */
export function formatAbsDatetime(unixSecs: number): string {
  const d = new Date(unixSecs * 1000);
  const M = String(d.getMonth() + 1).padStart(2, '0');
  const D = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${M}/${D} ${h}:${m}`;
}

/** 'HH:MM' style, degrades to 'Nd Nh' past 24h — used for reset timers */
export function formatRemainingClock(ms: number): string {
  const totalSecs = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  if (h > 24) {
    const d = Math.floor(h / 24);
    const rh = h % 24;
    return `${d}d ${rh}h`;
  }
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
