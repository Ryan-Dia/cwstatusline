import { execFileSync } from 'child_process';
import { basename } from 'path';
import type { Widget, RenderContext, WidgetConfig } from './types.js';

function gitCommand(args: string[], cwd: string): string | null {
  try {
    return execFileSync('git', args, {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return null;
  }
}

// Cache branch per cwd for 5 s to avoid double git invocation when
// both gitBranch and gitRepo widgets are active in the same render line.
const branchCache = new Map<string, { value: string | null; expiresAt: number }>();

function getCachedBranch(cwd: string): string | null {
  const now = Date.now();
  const cached = branchCache.get(cwd);
  if (cached && now < cached.expiresAt) return cached.value;
  const value = gitCommand(['rev-parse', '--abbrev-ref', 'HEAD'], cwd);
  branchCache.set(cwd, { value, expiresAt: now + 5_000 });
  return value;
}

export const GitBranchWidget: Widget = {
  id: 'gitBranch',
  labelKey: 'widget.gitBranch',
  render(ctx: RenderContext, _cfg: WidgetConfig): string | null {
    const cwd = ctx.stdin.cwd ?? process.cwd();
    return getCachedBranch(cwd);
  },
};

export const GitRepoWidget: Widget = {
  id: 'gitRepo',
  labelKey: 'widget.gitRepo',
  render(ctx: RenderContext, _cfg: WidgetConfig): string | null {
    const cwd = ctx.stdin.cwd ?? process.cwd();
    const topLevel = gitCommand(['rev-parse', '--show-toplevel'], cwd);
    if (!topLevel) return null;
    const repo = basename(topLevel);
    const branch = getCachedBranch(cwd);
    return branch ? `📁 ${repo}(${branch})` : `📁 ${repo}`;
  },
};
