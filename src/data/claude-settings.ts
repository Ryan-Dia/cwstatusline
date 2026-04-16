import fs from 'fs';
import path from 'path';
import os from 'os';

export interface ClaudeSettings {
  effortLevel?: string;
}

export async function readClaudeSettings(): Promise<ClaudeSettings> {
  const dir = process.env.CLAUDE_CONFIG_DIR ?? path.join(os.homedir(), '.claude');
  const settingsPath = path.join(dir, 'settings.json');
  try {
    const raw = await fs.promises.readFile(settingsPath, 'utf8');
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return {
      effortLevel: typeof parsed.effortLevel === 'string' ? parsed.effortLevel : undefined,
    };
  } catch {
    return {};
  }
}
