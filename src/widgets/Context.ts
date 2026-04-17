import chalk from 'chalk';
import type { Widget, RenderContext, WidgetConfig } from './types.js';

const BAR_WIDTH = 10;

function dimColor(hex: string): string {
  const r = Math.round(parseInt(hex.slice(1, 3), 16) * 0.35)
    .toString(16)
    .padStart(2, '0');
  const g = Math.round(parseInt(hex.slice(3, 5), 16) * 0.35)
    .toString(16)
    .padStart(2, '0');
  const b = Math.round(parseInt(hex.slice(5, 7), 16) * 0.35)
    .toString(16)
    .padStart(2, '0');
  return `#${r}${g}${b}`;
}

function buildBar(pct: number, color: string): string {
  const filled = Math.round((pct / 100) * BAR_WIDTH);
  const filledStr = chalk.hex(color)('■'.repeat(filled));
  const emptyStr = chalk.hex(dimColor(color))('■'.repeat(BAR_WIDTH - filled));
  return filledStr + emptyStr;
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

export const ContextWidget: Widget = {
  id: 'context',
  labelKey: 'widget.context',
  render(ctx: RenderContext, _cfg: WidgetConfig): string | null {
    const cw = ctx.stdin.context_window;
    if (!cw?.context_window_size) return null;

    const usage = cw.current_usage;
    const used =
      (usage?.input_tokens ?? 0) +
      (usage?.output_tokens ?? 0) +
      (usage?.cache_creation_input_tokens ?? 0) +
      (usage?.cache_read_input_tokens ?? 0);
    const max = cw.context_window_size;
    const pct = cw.used_percentage ?? Math.min(100, Math.round((used / max) * 100));

    const bar = buildBar(pct, '#22d3ee');
    const usedStr = formatTokens(used);
    const maxStr = formatTokens(max);
    return `Ctx ${bar} ${String(pct).padStart(3)}% (${usedStr}/${maxStr})`;
  },
};
