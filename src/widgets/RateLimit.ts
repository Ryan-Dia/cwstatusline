import type { Widget, RenderContext, WidgetConfig } from './types.js';
import type { I18nKey } from '../i18n/index.js';
import { renderRateLimitSlot } from './rateLimitRenderer.js';

interface RateLimitParams {
  id: string;
  labelKey: I18nKey;
  prefix: string;
  color: string;
  period: 'five_hour' | 'seven_day';
}

function createRateLimitWidget(params: RateLimitParams): Widget {
  const { id, labelKey, prefix, color, period } = params;
  return {
    id,
    labelKey,
    render(ctx: RenderContext, _cfg: WidgetConfig): string | null {
      const slot = ctx.stdin.rate_limits?.[period];
      return renderRateLimitSlot({
        prefix,
        color,
        usedPercent: slot?.used_percentage ?? null,
        resetsAtMs: slot?.resets_at != null ? slot.resets_at * 1000 : null,
        now: ctx.now.getTime(),
      });
    },
  };
}

export const RateLimitWidget: Widget = createRateLimitWidget({
  id: 'rateLimit',
  labelKey: 'widget.rateLimit',
  prefix: '5h',
  color: '#ffd93d',
  period: 'five_hour',
});

export const WeeklyRateLimitWidget: Widget = createRateLimitWidget({
  id: 'weeklyRateLimit',
  labelKey: 'widget.weeklyRateLimit',
  prefix: 'All',
  color: '#6bcb77',
  period: 'seven_day',
});
