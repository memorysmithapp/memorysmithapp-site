/**
 * The version the home page serves, in its footer, as the release that
 * published it names it in `/config.json` (RN-SITE-001).
 */

import { loadRuntimeConfig } from './runtime-config';

/** What the footer says: nothing while the version is unknown. */
export function versionLabel(version: string | null): string {
  return version ? `Versão ${version}` : '';
}

const slot = typeof document === 'undefined' ? null : document.getElementById('version');
if (slot) {
  loadRuntimeConfig()
    .then((config) => {
      slot.textContent = versionLabel(config.version);
    })
    .catch((error: unknown) => console.error(error));
}
