import type { Theme } from '../theme/themes.js';

export function themeColor(usedPercent: number, theme: Theme): string {
  if (usedPercent >= 85) return theme.danger;
  if (usedPercent >= 60) return theme.warn;
  return theme.accent;
}
