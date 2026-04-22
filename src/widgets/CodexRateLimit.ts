import type { Widget, RenderContext, WidgetConfig } from './types.js';
import type { I18nKey } from '../i18n/index.js';
import type { CodexRateLimits } from '../data/codex.js';
import { renderRateLimitSlot, type RateLimitTimeFormat } from './rateLimitRenderer.js';

const PREFIX_WIDTH = 3; // "5h " / "7d " — fixed-width prefix column
const TIME_EXPR_WIDTH = 11; // "(2d 12h)   " — padded time expression column

type Period = keyof CodexRateLimits;

interface CodexRateLimitParams {
  id: string;
  labelKey: I18nKey;
  prefix: string;
  color: string;
  period: Period;
  timeFormat: RateLimitTimeFormat;
  prefixWidth?: number;
  timeExprWidth?: number;
}

function createCodexRateLimitWidget(params: CodexRateLimitParams): Widget {
  const { id, labelKey, prefix, color, period, timeFormat, prefixWidth, timeExprWidth } = params;
  return {
    id,
    labelKey,
    render(ctx: RenderContext, _cfg: WidgetConfig): string | null {
      const slot = ctx.codex?.rateLimits?.[period];
      return renderRateLimitSlot({
        prefix,
        color,
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

export const CodexRateLimitWidget: Widget = createCodexRateLimitWidget({
  id: 'codexRateLimit',
  labelKey: 'widget.codexRateLimit',
  prefix: '5h',
  color: '#ff9f43',
  period: 'primary',
  timeFormat: 'remaining',
  prefixWidth: PREFIX_WIDTH,
  timeExprWidth: TIME_EXPR_WIDTH,
});

export const CodexWeeklyRateLimitWidget: Widget = createCodexRateLimitWidget({
  id: 'codexWeeklyRateLimit',
  labelKey: 'widget.codexWeeklyRateLimit',
  prefix: '7d',
  color: '#48dbfb',
  period: 'secondary',
  timeFormat: 'remaining',
  prefixWidth: PREFIX_WIDTH,
  timeExprWidth: TIME_EXPR_WIDTH,
});
