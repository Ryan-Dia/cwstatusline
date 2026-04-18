import fs from 'fs';
import path from 'path';
import os from 'os';
import readline from 'readline';

export interface CodexRateLimits {
  primary: { usedPercent: number; resetsAt: number };
  secondary: { usedPercent: number; resetsAt: number };
}

export interface CodexSnapshot {
  available: boolean;
  dailyRequests: number;
  weeklyRequests: number;
  rateLimits: CodexRateLimits | null;
  model: string | null;
}

function getCodexDir(): string {
  return process.env.CODEX_CONFIG_DIR ?? path.join(os.homedir(), '.codex');
}

async function readCodexModel(): Promise<string | null> {
  try {
    const raw = await fs.promises.readFile(path.join(getCodexDir(), 'config.toml'), 'utf8');
    const match = raw.match(/^model\s*=\s*"([^"]+)"/m);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

async function findHistoryFile(): Promise<string | null> {
  const base = getCodexDir();
  const candidates = [path.join(base, 'history.jsonl'), path.join(base, 'sessions')];
  for (const c of candidates) {
    try {
      await fs.promises.access(c);
      return c;
    } catch {
      continue;
    }
  }
  return null;
}

async function findLatestSessionFile(): Promise<string | null> {
  const sessionsDir = path.join(getCodexDir(), 'sessions');
  try {
    const years = (await fs.promises.readdir(sessionsDir))
      .filter((y) => /^\d{4}$/.test(y))
      .sort()
      .reverse();
    for (const year of years) {
      const months = (await fs.promises.readdir(path.join(sessionsDir, year))).sort().reverse();
      for (const month of months) {
        const days = (await fs.promises.readdir(path.join(sessionsDir, year, month)))
          .sort()
          .reverse();
        for (const day of days) {
          const dayDir = path.join(sessionsDir, year, month, day);
          const files = (await fs.promises.readdir(dayDir))
            .filter((f) => f.endsWith('.jsonl'))
            .sort()
            .reverse();
          if (files.length > 0) return path.join(dayDir, files[0] as string);
        }
      }
    }
  } catch (_e) {
    // sessions dir not found or unreadable
  }
  return null;
}

async function readLastRateLimits(filePath: string): Promise<CodexRateLimits | null> {
  const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
  let last: CodexRateLimits | null = null;
  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const obj = JSON.parse(trimmed);
      if (obj.type === 'event_msg' && obj.payload?.type === 'token_count') {
        const r = obj.payload.rate_limits;
        if (r?.primary?.resets_at != null && r?.secondary?.resets_at != null) {
          last = {
            primary: {
              usedPercent: r.primary.used_percent ?? 0,
              resetsAt: r.primary.resets_at,
            },
            secondary: {
              usedPercent: r.secondary.used_percent ?? 0,
              resetsAt: r.secondary.resets_at,
            },
          };
        }
      }
    } catch (_e) {
      // skip malformed lines
    }
  }
  return last;
}

export async function getCodexSnapshot(): Promise<CodexSnapshot> {
  const histPath = await findHistoryFile();
  if (!histPath) {
    return { available: false, dailyRequests: 0, weeklyRequests: 0, rateLimits: null, model: null };
  }

  const [stat, latestSession, model] = await Promise.all([
    fs.promises.stat(histPath),
    findLatestSessionFile(),
    readCodexModel(),
  ]);
  const rateLimits = latestSession ? await readLastRateLimits(latestSession) : null;

  if (stat.isDirectory()) {
    return { available: true, dailyRequests: 0, weeklyRequests: 0, rateLimits, model };
  }

  const now = Date.now();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const weekStart = now - 7 * 24 * 60 * 60 * 1000;

  let daily = 0;
  let weekly = 0;

  const stream = fs.createReadStream(histPath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const obj = JSON.parse(trimmed);
      const ts = obj.timestamp ? new Date(obj.timestamp).getTime() : 0;
      if (ts >= todayStart.getTime()) daily += 1;
      if (ts >= weekStart) weekly += 1;
    } catch (_e) {
      // skip malformed lines
    }
  }

  return { available: true, dailyRequests: daily, weeklyRequests: weekly, rateLimits, model };
}
