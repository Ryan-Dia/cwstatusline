import { buildBar, fmtPct } from '../utils/bar.js';
import { formatRemainingHM, formatAbsDatetime } from '../utils/duration.js';

export type RateLimitTimeFormat = 'remaining' | 'abs';

export interface RateLimitSlotParams {
  prefix: string;
  color: string;
  usedPercent: number | null;
  resetsAtMs: number | null;
  now: number;
  timeFormat?: RateLimitTimeFormat;
  prefixWidth?: number;
  timeExprWidth?: number;
}

export function renderRateLimitSlot(params: RateLimitSlotParams): string {
  const {
    prefix,
    color,
    usedPercent,
    resetsAtMs,
    now,
    timeFormat = 'remaining',
    prefixWidth,
    timeExprWidth,
  } = params;

  const paddedPrefix = prefixWidth != null ? prefix.padEnd(prefixWidth) : prefix;

  if (usedPercent == null || resetsAtMs == null) {
    return `${paddedPrefix} ${buildBar(0, color)}  ?%`;
  }

  const remainingMs = resetsAtMs - now;
  const pct = remainingMs <= 0 ? 0 : Math.round(usedPercent);

  let timeStr: string;
  if (remainingMs <= 0) {
    timeStr = 'reset';
  } else if (timeFormat === 'abs') {
    timeStr = formatAbsDatetime(resetsAtMs / 1000);
  } else {
    timeStr = formatRemainingHM(remainingMs);
  }

  const timeExpr = timeExprWidth != null ? `(${timeStr})`.padEnd(timeExprWidth) : `(${timeStr})`;
  return `${paddedPrefix} ${buildBar(pct, color)} ${fmtPct(pct)} ${timeExpr}`;
}
