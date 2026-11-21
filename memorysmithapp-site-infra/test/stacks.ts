/** The stacks of the app as one synth declares them, for the tests to read. */

import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { environmentOf, stackId } from '../config/environment.js';
import { deploymentOf, tagProject } from '../constructs/deployment.js';
import { GithubDeliveryStack } from '../stacks/github-delivery.stack.js';
import { SiteHostingStack } from '../stacks/site-hosting.stack.js';
import { SiteReleaseStack, siteConfigOf } from '../stacks/site-release.stack.js';
import cdk from '../cdk.json' with { type: 'json' };

/** A build of the frontend, as small as one: an entry document and one hashed asset. */
export function fakeDist(): string {
  const dist = mkdtempSync(join(tmpdir(), 'site-dist-'));
  mkdirSync(join(dist, 'assets'));
  writeFileSync(join(dist, 'index.html'), '<!doctype html>');
  writeFileSync(join(dist, 'assets', 'index-abc123.js'), '');
  return dist;
}

export function synth(options: { context?: Record<string, string>; dist?: string } = {}) {
  const app = new App({ context: { ...cdk.context, ...options.context } });
  const environment = environmentOf(app.node);
  const env = { account: environment.account, region: environment.region };
  const hosting = new SiteHostingStack(app, stackId('Hosting'), {
  env,
  domainName: environment.domainName,
  hostedZoneName: environment.hostedZoneName,
  hostedZoneId: environment.hostedZoneId,
});
  const release = new SiteReleaseStack(app, stackId('Release'), {
    env,
    bucket: hosting.bucket,
    distribution: hosting.distribution,
    config: siteConfigOf(deploymentOf(app.node)),
    ...(options.dist ? { dist: options.dist } : {}),
  });
  const delivery = new GithubDeliveryStack(app, stackId('GithubDelivery'), { env, environment });
  tagProject([hosting, release, delivery], environment.name);
  return {
    hosting: Template.fromStack(hosting),
    release: Template.fromStack(release),
    delivery: Template.fromStack(delivery),
  };
}
