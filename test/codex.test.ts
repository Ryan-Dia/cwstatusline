import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('getCodexSnapshot', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(join(tmpdir(), 'festatusline-codex-'));
    process.env.CODEX_CONFIG_DIR = tmpDir;
    vi.resetModules();
  });

  afterEach(async () => {
    delete process.env.CODEX_CONFIG_DIR;
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('returns unavailable snapshot when no history file or sessions dir exists', async () => {
    const { getCodexSnapshot } = await import('../src/data/codex.js');
    const snap = await getCodexSnapshot();
    expect(snap.available).toBe(false);
    expect(snap.dailyRequests).toBe(0);
    expect(snap.weeklyRequests).toBe(0);
    expect(snap.rateLimits).toBeNull();
    expect(snap.model).toBeNull();
  });

  it('reads model name from config.toml', async () => {
    await fs.writeFile(join(tmpDir, 'config.toml'), 'model = "o4-mini"\n');
    await fs.mkdir(join(tmpDir, 'sessions'), { recursive: true });

    const { getCodexSnapshot } = await import('../src/data/codex.js');
    const snap = await getCodexSnapshot();
    expect(snap.available).toBe(true);
    expect(snap.model).toBe('o4-mini');
  });

  it('counts session JSONL files in today directory', async () => {
    const today = new Date();
    const year = String(today.getFullYear());
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dayDir = join(tmpDir, 'sessions', year, month, day);
    await fs.mkdir(dayDir, { recursive: true });
    await fs.writeFile(join(dayDir, 'sess1.jsonl'), '');
    await fs.writeFile(join(dayDir, 'sess2.jsonl'), '');
    await fs.writeFile(join(dayDir, 'not-a-session.txt'), '');

    const { getCodexSnapshot } = await import('../src/data/codex.js');
    const snap = await getCodexSnapshot();
    expect(snap.available).toBe(true);
    expect(snap.dailyRequests).toBe(2);
    expect(snap.weeklyRequests).toBe(2);
  });

  it('excludes old sessions from daily count but includes in weekly', async () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const fmt = (d: Date) => ({
      year: String(d.getFullYear()),
      month: String(d.getMonth() + 1).padStart(2, '0'),
      day: String(d.getDate()).padStart(2, '0'),
    });

    const todayFmt = fmt(today);
    const yestFmt = fmt(yesterday);

    const todayDir = join(tmpDir, 'sessions', todayFmt.year, todayFmt.month, todayFmt.day);
    const yestDir = join(tmpDir, 'sessions', yestFmt.year, yestFmt.month, yestFmt.day);
    await fs.mkdir(todayDir, { recursive: true });
    await fs.mkdir(yestDir, { recursive: true });
    await fs.writeFile(join(todayDir, 'today.jsonl'), '');
    await fs.writeFile(join(yestDir, 'yesterday.jsonl'), '');

    const { getCodexSnapshot } = await import('../src/data/codex.js');
    const snap = await getCodexSnapshot();
    expect(snap.dailyRequests).toBe(1);
    expect(snap.weeklyRequests).toBe(2);
  });
});
