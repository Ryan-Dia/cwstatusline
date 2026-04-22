import { promises as fs } from 'fs';

export interface TtlCache<V> {
  get(compute: () => Promise<V>): Promise<V>;
  invalidate(): void;
}

export interface MtimeCache<V> {
  get(filePath: string, compute: (p: string) => Promise<V>): Promise<V>;
}

export function createTtlCache<V>(ttlMs: number): TtlCache<V> {
  let cached: { value: V; loadedAt: number } | null = null;

  return {
    async get(compute) {
      const now = Date.now();
      if (cached && now - cached.loadedAt < ttlMs) {
        return cached.value;
      }
      const value = await compute();
      cached = { value, loadedAt: now };
      return value;
    },
    invalidate() {
      cached = null;
    },
  };
}

export function createMtimeCache<V>(): MtimeCache<V> {
  const store = new Map<string, { mtime: number; value: V }>();

  return {
    async get(filePath, compute) {
      const stat = await fs.stat(filePath);
      const mtime = stat.mtimeMs;
      const entry = store.get(filePath);
      if (entry && entry.mtime === mtime) {
        return entry.value;
      }
      const value = await compute(filePath);
      store.set(filePath, { mtime, value });
      return value;
    },
  };
}
