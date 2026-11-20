/**
 * The CDK app of the website: one environment, production, in the account and
 * the region of the application.
 *
 * A delivery deploys the hosting and the release; the delivery role is
 * deployed once, by hand, and never by a delivery (see its stack).
 */

import { App, Tags } from 'aws-cdk-lib';
import { environmentOf, stackId } from '../config/environment.js';
import { deploymentOf, tagDelivery } from '../constructs/deployment.js';
import { GithubDeliveryStack } from '../stacks/github-delivery.stack.js';
import { SiteHostingStack } from '../stacks/site-hosting.stack.js';
import { SiteReleaseStack, siteConfigOf } from '../stacks/site-release.stack.js';

const app = new App();
const environment = environmentOf(app.node);
const deployment = deploymentOf(app.node);
const env = { account: environment.account, region: environment.region };

const hosting = new SiteHostingStack(app, stackId('Hosting'), { env });
const release = new SiteReleaseStack(app, stackId('Release'), {
  env,
  bucket: hosting.bucket,
  distribution: hosting.distribution,
  config: siteConfigOf(deployment),
});
const delivery = new GithubDeliveryStack(app, stackId('GithubDelivery'), { env, environment });

for (const stack of [hosting, release, delivery]) {
  Tags.of(stack).add('app:project', 'memorysmith-site');
  Tags.of(stack).add('app:environment', environment.name);
}
tagDelivery([hosting, release], deployment);
