import type { Widget, RenderContext, WidgetConfig } from './types.js';

export const DailyUsageWidget: Widget = {
  id: 'dailyUsage',
  labelKey: 'widget.dailyUsage',
  render(ctx: RenderContext, _cfg: WidgetConfig): string | null {
    if (!ctx.usage) return null;
    return 'Daily';
  },
};
