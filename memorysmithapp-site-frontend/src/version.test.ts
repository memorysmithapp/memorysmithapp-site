import { describe, expect, it } from 'vitest';
import { versionLabel } from './version';

describe('the version in the footer', () => {
  it('shows the version it serves', () => {
    expect(versionLabel('0.3.0')).toBe('Versão 0.3.0');
  });

  it('shows no version while none is known', () => {
    expect(versionLabel(null)).toBe('');
  });
});
