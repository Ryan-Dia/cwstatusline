import type { Settings } from './schema.js';

export const PRESETS: Record<string, Partial<Settings>> = {
  minimal: {
    lines: [
      [{ id: 'dailyUsage' }, { id: 'context' }, { id: 'rateLimit' }],
      [{ id: 'weeklyUsage' }, { id: 'weeklyRateLimit' }],
      [{ id: 'model' }, { id: 'claudePeak' }],
    ],
  },
  full: {
    lines: [
      [
        { id: 'model' },
        { id: 'claudePeak' },
        { id: 'context' },
        { id: 'rateLimit' },
        { id: 'peakTime' },
        { id: 'dailyUsage' },
        { id: 'dailyReset' },
        { id: 'weeklyUsage' },
        { id: 'weeklyReset' },
        { id: 'sonnetWeeklyUsage' },
        { id: 'sonnetWeeklyReset' },
        { id: 'gptUsage' },
      ],
    ],
  },
  'korean-dev': {
    locale: 'ko',
    lines: [
      [
        { id: 'model' },
        { id: 'claudePeak' },
        { id: 'context' },
        { id: 'rateLimit' },
        { id: 'peakTime' },
        { id: 'dailyUsage' },
        { id: 'dailyReset' },
        { id: 'weeklyUsage' },
        { id: 'weeklyReset' },
        { id: 'sonnetWeeklyUsage' },
        { id: 'sonnetWeeklyReset' },
        { id: 'gptUsage' },
      ],
    ],
  },
  'multi-cli': {
    lines: [[{ id: 'model' }, { id: 'dailyUsage' }, { id: 'gptUsage' }]],
  },
  lite: {
    lines: [
      [{ id: 'dailyUsage' }, { id: 'context' }, { id: 'rateLimit' }],
      [{ id: 'weeklyUsage' }, { id: 'weeklyRateLimit' }],
      [{ id: 'model' }, { id: 'claudePeak' }, { id: 'gitRepo' }],
    ],
  },
  plus: {
    lines: [
      [{ id: 'dailyUsage' }, { id: 'context' }, { id: 'rateLimit' }],
      [{ id: 'weeklyUsage' }, { id: 'weeklyRateLimit' }],
      [{ id: 'spacer' }],
      [{ id: 'cacheHit' }, { id: 'cacheTtl' }, { id: 'sessionCost' }],
      [{ id: 'model' }, { id: 'claudePeak' }, { id: 'gitRepo' }],
    ],
  },
  pro: {
    lines: [
      [{ id: 'dailyUsage' }, { id: 'context' }, { id: 'rateLimit' }],
      [{ id: 'weeklyUsage' }, { id: 'weeklyRateLimit' }],
      [{ id: 'codexModel' }, { id: 'codexRateLimit' }, { id: 'codexWeeklyRateLimit' }],
      [{ id: 'spacer' }],
      [{ id: 'cacheHit' }, { id: 'cacheTtl' }, { id: 'sessionCost' }],
      [{ id: 'model' }, { id: 'claudePeak' }, { id: 'gitRepo' }],
    ],
  },
};

export const PRESET_NAMES = Object.keys(PRESETS);
