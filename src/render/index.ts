import { promises as fs } from 'fs';
import { homedir } from 'os';
import { dirname, join } from 'path';
import { readStdin } from '../data/stdin.js';
import { getUsageSnapshot } from '../data/usage.js';
import { getCodexSnapshot } from '../data/codex.js';
import { readClaudeSettings } from '../data/claude-settings.js';
import { loadSettings } from '../config/load.js';
import { getTheme } from '../theme/index.js';
import { t, setLocale, type Locale } from '../i18n/index.js';
import { renderAllLines } from './line.js';
import type { RenderContext } from '../widgets/types.js';

const CACHE_DIR = process.env.XDG_CACHE_HOME
  ? join(process.env.XDG_CACHE_HOME, 'festatusline')
  : join(homedir(), '.cache', 'festatusline');
const CACHE_PATH = join(CACHE_DIR, 'last.txt');
const RATE_LIMITS_CACHE_PATH = join(CACHE_DIR, 'rate_limits.json');

async function writeCache(output: string): Promise<void> {
  await fs.mkdir(dirname(CACHE_PATH), { recursive: true }).catch(() => {});
  await fs.writeFile(CACHE_PATH, output, 'utf8').catch(() => {});
}

type RateLimitsCache = NonNullable<import('../data/stdin.js').ClaudeStdin['rate_limits']>;

async function readRateLimitsCache(): Promise<RateLimitsCache | null> {
  try {
    const raw = await fs.readFile(RATE_LIMITS_CACHE_PATH, 'utf8');
    return JSON.parse(raw) as RateLimitsCache;
  } catch {
    return null;
  }
}

async function writeRateLimitsCache(rateLimits: RateLimitsCache): Promise<void> {
  await fs.mkdir(CACHE_DIR, { recursive: true }).catch(() => {});
  await fs.writeFile(RATE_LIMITS_CACHE_PATH, JSON.stringify(rateLimits), 'utf8').catch(() => {});
}

export async function renderFromStdin(): Promise<void> {
  const [stdin, settings, claudeSettings, usage, codex, cachedRateLimits] = await Promise.all([
    readStdin(),
    loadSettings(),
    readClaudeSettings(),
    getUsageSnapshot().catch(() => null),
    getCodexSnapshot().catch(() => null),
    readRateLimitsCache(),
  ]);

  setLocale(settings.locale as Locale);

  if (stdin.rate_limits) {
    writeRateLimitsCache(stdin.rate_limits).catch(() => {});
  }

  const theme = getTheme(settings.theme);
  const ctx: RenderContext = {
    stdin: {
      ...stdin,
      rate_limits: stdin.rate_limits ?? cachedRateLimits ?? undefined,
    },
    usage,
    codex,
    theme,
    t,
    now: new Date(),
    weeklyAnchorDay: settings.weeklyAnchorDay,
    effortLevel: claudeSettings.effortLevel,
  };

  const output = renderAllLines(settings.lines, ctx, settings.separator);

  // Output always (widgets render placeholders when data is absent).
  // Update the cache only when we have real API session data (context_window
  // present), so /clear and startup events don't overwrite the last rich cache.
  if (stdin.context_window) {
    await writeCache(output);
  }
  process.stdout.write(`${output}\n`);
}
