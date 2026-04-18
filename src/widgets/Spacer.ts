import type { Widget, RenderContext, WidgetConfig } from './types.js';

export const SpacerWidget: Widget = {
  id: 'spacer',
  labelKey: 'widget.spacer',
  render(_ctx: RenderContext, _cfg: WidgetConfig): string {
    return ' ';
  },
};
