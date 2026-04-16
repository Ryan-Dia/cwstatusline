import type { Widget, RenderContext, WidgetConfig } from './types.js';

export const WeeklyUsageWidget: Widget = {
  id: 'weeklyUsage',
  labelKey: 'widget.weeklyUsage',
  render(ctx: RenderContext, _cfg: WidgetConfig): string | null {
    if (!ctx.usage) return null;
    return '7days';
  },
};
