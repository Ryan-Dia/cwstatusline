import type { Widget, RenderContext, WidgetConfig } from './types.js';
import type { I18nKey } from '../i18n/index.js';
import type { Theme } from '../theme/themes.js';
import { buildBar, fmtPct } from '../utils/bar.js';
import { formatRemainingHM, formatAbsDatetime } from '../utils/duration.js';
import { themeColor } from '../utils/color.js';

export type RateLimitTimeFormat = 'remaining' | 'abs';

export interface RateLimitSlotParams {
  prefix: string;
  color?: string;
  theme?: Theme;
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
    theme,
    usedPercent,
    resetsAtMs,
    now,
    timeFormat = 'remaining',
    prefixWidth,
    timeExprWidth,
  } = params;

  const paddedPrefix = prefixWidth != null ? prefix.padEnd(prefixWidth) : prefix;
  const effectiveColor = theme ? themeColor(usedPercent ?? 0, theme) : (color ?? '#888888');

  if (usedPercent == null || resetsAtMs == null) {
    return `${paddedPrefix} ${buildBar(0, effectiveColor)}  ?%`;
  }

  const remainingMs = resetsAtMs - now;
  const pct = remainingMs <= 0 ? 0 : Math.round(usedPercent);
  const barColor = theme ? themeColor(pct, theme) : effectiveColor;

  let timeStr: string;
  if (remainingMs <= 0) {
    timeStr = 'reset';
  } else if (timeFormat === 'abs') {
    timeStr = formatAbsDatetime(resetsAtMs / 1000);
  } else {
    timeStr = formatRemainingHM(remainingMs);
  }

  const timeExpr = timeExprWidth != null ? `(${timeStr})`.padEnd(timeExprWidth) : `(${timeStr})`;
  return `${paddedPrefix} ${buildBar(pct, barColor)} ${fmtPct(pct)} ${timeExpr}`;
}

interface RateLimitWidgetParams {
  id: string;
  labelKey: I18nKey;
  prefix: string;
  getSlot: (ctx: RenderContext) => { usedPercent: number; resetsAt: number } | null | undefined;
  timeFormat?: RateLimitTimeFormat;
  prefixWidth?: number;
  timeExprWidth?: number;
}

export function createRateLimitWidget(params: RateLimitWidgetParams): Widget {
  const { id, labelKey, prefix, getSlot, timeFormat, prefixWidth, timeExprWidth } = params;
  return {
    id,
    labelKey,
    render(ctx: RenderContext, _cfg: WidgetConfig): string | null {
      const slot = getSlot(ctx);
      return renderRateLimitSlot({
        prefix,
        theme: ctx.theme,
        usedPercent: slot?.usedPercent ?? null,
        resetsAtMs: slot?.resetsAt != null ? slot.resetsAt * 1000 : null,
        now: ctx.now.getTime(),
        timeFormat,
        prefixWidth,
        timeExprWidth,
      });
    },
  };
}
