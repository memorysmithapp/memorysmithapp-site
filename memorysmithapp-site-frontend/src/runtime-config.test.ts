import { describe, expect, it } from 'vitest';
import { loadRuntimeConfig, parseRuntimeConfig } from './runtime-config';

const valid = { environment: 'production', version: '0.1.0', commit: 'abc1234' };

describe('the runtime configuration', () => {
  it('reads the environment, the version and the commit', () => {
    expect(parseRuntimeConfig(valid)).toEqual(valid);
  });

  it.each(['environment', 'version', 'commit'])('refuses a configuration with no %s', (key) => {
    expect(() => parseRuntimeConfig({ ...valid, [key]: ' ' })).toThrow(`config.json has no "${key}".`);
  });

  it('refuses what is not an object', () => {
    expect(() => parseRuntimeConfig([])).toThrow('config.json is not an object.');
    expect(() => parseRuntimeConfig(null)).toThrow('config.json is not an object.');
  });

  it('is read from /config.json, never from the cache', async () => {
    const asked: Array<{ url: unknown; init: unknown }> = [];
    const fetchImpl = (async (url: unknown, init: unknown) => {
      asked.push({ url, init });
      return new Response(JSON.stringify(valid));
    }) as typeof fetch;
    await expect(loadRuntimeConfig(fetchImpl)).resolves.toEqual(valid);
    expect(asked).toEqual([{ url: '/config.json', init: { cache: 'no-store' } }]);
  });

  it('says so when the file is missing', async () => {
    const fetchImpl = (async () => new Response('', { status: 404 })) as typeof fetch;
    await expect(loadRuntimeConfig(fetchImpl)).rejects.toThrow('config.json answered 404.');
  });
});
