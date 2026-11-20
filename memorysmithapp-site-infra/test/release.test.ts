import { Match } from 'aws-cdk-lib/assertions';
import { describe, expect, it } from 'vitest';
import root from '../../package.json' with { type: 'json' };
import { deploymentOf } from '../constructs/deployment.js';
import { siteConfigOf } from '../stacks/site-release.stack.js';
import { fakeDist, synth } from './stacks.js';

const context = (values: Record<string, unknown>) => ({ tryGetContext: (key: string) => values[key] });

describe('what a deploy says about itself', () => {
  it('serves the version of the root package.json, its one home', () => {
    expect(deploymentOf(context({}))).toEqual({
      environment: 'production',
      version: root.version,
      commit: 'unknown',
    });
  });

  it('takes the version and the commit a deploy passes', () => {
    expect(deploymentOf(context({ version: '9.9.9', commit: 'abc1234' }))).toMatchObject({
      version: '9.9.9',
      commit: 'abc1234',
    });
  });

  it('publishes the environment, the version and the commit, and nothing else', () => {
    expect(siteConfigOf(deploymentOf(context({ commit: 'abc1234' })))).toEqual({
      environment: 'production',
      version: root.version,
      commit: 'abc1234',
    });
  });
});

describe('the release of the website', () => {
  it('publishes the configuration on a clean checkout, with no build', () => {
    const { release } = synth({ dist: '/nonexistent' });
    release.resourceCountIs('Custom::CDKBucketDeployment', 1);
  });

  it('publishes the assets as immutable, and the entry and configuration revalidated', () => {
    const { release } = synth({ dist: fakeDist() });
    release.resourceCountIs('Custom::CDKBucketDeployment', 2);
    release.hasResourceProperties('Custom::CDKBucketDeployment', {
      SystemMetadata: { 'cache-control': 'public, max-age=31536000, immutable' },
      DistributionPaths: Match.absent(),
    });
    release.hasResourceProperties('Custom::CDKBucketDeployment', {
      SystemMetadata: { 'cache-control': 'no-cache, must-revalidate' },
      DistributionPaths: ['/*'],
      Prune: false,
    });
  });
});
