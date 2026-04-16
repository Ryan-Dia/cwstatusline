import type { Widget, RenderContext, WidgetConfig } from './types.js';

function buildBar(pct: number, width = 8): string {
  const filled = Math.round((pct / 100) * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

function formatRemaining(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
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
    const timeLabel = formatRemaining(remainingSec);
    const bar = buildBar(pct);
    return `5h ${bar} ${pct}% (${timeLabel})`;
  },
};
