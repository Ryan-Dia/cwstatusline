import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { getClaudeDir } from '../config/load.js';

const ClaudeSettingsSchema = z.object({
  effortLevel: z.string().optional(),
});

export type ClaudeSettings = z.infer<typeof ClaudeSettingsSchema>;

export async function readClaudeSettings(): Promise<ClaudeSettings> {
  const settingsPath = path.join(getClaudeDir(), 'settings.json');
  try {
    const raw = await fs.promises.readFile(settingsPath, 'utf8');
    const result = ClaudeSettingsSchema.safeParse(JSON.parse(raw));
    return result.success ? result.data : {};
  } catch {
    return {};
  }
}
