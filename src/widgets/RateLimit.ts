import chalk from 'chalk';
import type { Widget, RenderContext, WidgetConfig } from './types.js';

const BAR_WIDTH = 10;

function buildBar(pct: number, color: string): string {
  const filled = Math.round((pct / 100) * BAR_WIDTH);
  const filledStr = chalk.hex(color)('▬'.repeat(filled));
  const emptyStr = chalk.hex('#444444')('▬'.repeat(BAR_WIDTH - filled));
  return filledStr + emptyStr;
}

function fmtPct(pct: number): string {
  return `${String(pct).padStart(3)}%`;
}

function formatRemaining(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h >= 24) {
    const d = Math.floor(h / 24);
    const rh = h % 24;
    return `${d}d ${rh}h`;
  }
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export const RateLimitWidget: Widget = {
  id: 'rateLimit',
  labelKey: 'widget.rateLimit',
  render(ctx: RenderContext, _cfg: WidgetConfig): string | null {
    const fiveHour = ctx.stdin.rate_limits?.five_hour;
    if (fiveHour?.used_percentage == null || !fiveHour?.resets_at) return null;

    const pct = Math.round(fiveHour.used_percentage);
    const remainingSec = fiveHour.resets_at - ctx.now.getTime() / 1000;
    return `5h ${buildBar(pct, '#ffd93d')} ${fmtPct(pct)} (${formatRemaining(remainingSec)})`;
  },
};

export const WeeklyRateLimitWidget: Widget = {
  id: 'weeklyRateLimit',
  labelKey: 'widget.weeklyRateLimit',
  render(ctx: RenderContext, _cfg: WidgetConfig): string | null {
    const sevenDay = ctx.stdin.rate_limits?.seven_day;
    if (sevenDay?.used_percentage == null || !sevenDay?.resets_at) return null;

    const pct = Math.round(sevenDay.used_percentage);
    const remainingSec = sevenDay.resets_at - ctx.now.getTime() / 1000;
    return `All ${buildBar(pct, '#6bcb77')} ${fmtPct(pct)} (${formatRemaining(remainingSec)})`;
  },
};
