/**
 * What the release published beside the page, read at runtime from
 * `/config.json`: the environment, the version and the commit it serves.
 *
 * Never a constant of the build, so one build can be published anywhere and
 * still say which version it is (ADR-001).
 */

export interface RuntimeConfig {
  readonly environment: string;
  readonly version: string;
  readonly commit: string;
}

/** Validates what `/config.json` holds, field by field. */
export function parseRuntimeConfig(raw: unknown): RuntimeConfig {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    throw new Error('config.json is not an object.');
  }
  const fields = raw as Record<string, unknown>;
  const text = (key: keyof RuntimeConfig): string => {
    const value = fields[key];
    if (typeof value !== 'string' || value.trim() === '') {
      throw new Error(`config.json has no "${key}".`);
    }
    return value.trim();
  };
  return { environment: text('environment'), version: text('version'), commit: text('commit') };
}

/**
 * Reads `/config.json`. It is never taken from the cache: its name stays put
 * across releases, and a cached copy would name the release before.
 */
export async function loadRuntimeConfig(fetchImpl: typeof fetch = fetch): Promise<RuntimeConfig> {
  const response = await fetchImpl('/config.json', { cache: 'no-store' });
  if (!response.ok) throw new Error(`config.json answered ${response.status}.`);
  return parseRuntimeConfig(await response.json());
}
