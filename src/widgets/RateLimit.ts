import type { Widget } from './types.js';
import { createRateLimitWidget } from './rateLimitRenderer.js';

export const RateLimitWidget: Widget = createRateLimitWidget({
  id: 'rateLimit',
  labelKey: 'widget.rateLimit',
  prefix: '5h',
  getSlot: (ctx) => {
    const s = ctx.stdin.rate_limits?.five_hour;
    if (!s || s.resets_at == null) return null;
    return { usedPercent: s.used_percentage ?? 0, resetsAt: s.resets_at };
  },
});

export const WeeklyRateLimitWidget: Widget = createRateLimitWidget({
  id: 'weeklyRateLimit',
  labelKey: 'widget.weeklyRateLimit',
  prefix: 'All',
  getSlot: (ctx) => {
    const s = ctx.stdin.rate_limits?.seven_day;
    if (!s || s.resets_at == null) return null;
    return { usedPercent: s.used_percentage ?? 0, resetsAt: s.resets_at };
  },
});
