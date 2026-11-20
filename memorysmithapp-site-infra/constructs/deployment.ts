/**
 * What a deploy says about itself: the environment, the version and the commit.
 *
 * The version is the `version` of the root `package.json`, its one home
 * (INV-01), unless a deploy passes `-c version=…`; the commit arrives as
 * `-c commit=…` from whatever runs the deploy. None of them is a constant of
 * the build: the page reads them from `/config.json`, and every stack a deploy
 * delivers carries the version and the commit as tags.
 */

import { Tags, type Stack } from 'aws-cdk-lib';
import type { ContextReader } from '../config/environment.js';
import root from '../../package.json' with { type: 'json' };

export interface Deployment {
  readonly environment: string;
  readonly version: string;
  readonly commit: string;
}

export function deploymentOf(node: ContextReader, rootVersion: string = root.version): Deployment {
  const context = (key: string): string | undefined => {
    const value: unknown = node.tryGetContext(key);
    return typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined;
  };
  return {
    environment: 'production',
    version: context('version') ?? rootVersion,
    commit: context('commit') ?? 'unknown',
  };
}

/**
 * Tags the stacks a deploy delivers with the version and the commit they serve.
 * Only those: the delivery role delivers every version, so a version written on
 * it would be false by construction.
 */
export function tagDelivery(stacks: readonly Stack[], deployment: Deployment): void {
  for (const stack of stacks) {
    Tags.of(stack).add('app:version', deployment.version);
    Tags.of(stack).add('deploy:sha', deployment.commit);
  }
}
