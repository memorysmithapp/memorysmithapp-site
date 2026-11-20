/**
 * The release of the website: the build of `memorysmithapp-site-frontend` and
 * `/config.json`, published into the bucket of the hosting stack.
 *
 * Two deployments, because the two kinds of file want opposite things. An asset
 * carries a content hash in its name, so a new build is a new name and the old
 * one can be cached forever. The entry document and the configuration keep
 * their names across releases, so caching them would pin every visitor to the
 * release they happened to load first: they are revalidated on every load, and
 * the distribution is invalidated when they change.
 */

import { Stack, type StackProps } from 'aws-cdk-lib';
import type { IDistribution } from 'aws-cdk-lib/aws-cloudfront';
import type { IBucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, CacheControl, Source } from 'aws-cdk-lib/aws-s3-deployment';
import type { Construct } from 'constructs';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Deployment } from '../constructs/deployment.js';
import { siteLogGroup } from '../constructs/log-groups.js';

const here = dirname(fileURLToPath(import.meta.url));
/** Where `pnpm -C memorysmithapp-site-frontend build` writes the website. */
export const FRONTEND_DIST = join(here, '..', '..', 'memorysmithapp-site-frontend', 'dist');

/** What the page reads at runtime, and nothing else. */
export interface SiteConfig {
  readonly environment: string;
  readonly version: string;
  readonly commit: string;
}

export function siteConfigOf(deployment: Deployment): SiteConfig {
  return {
    environment: deployment.environment,
    version: deployment.version,
    commit: deployment.commit,
  };
}

export interface SiteReleaseStackProps extends StackProps {
  readonly bucket: IBucket;
  readonly distribution: IDistribution;
  readonly config: SiteConfig;
  /** The build to publish; the frontend's `dist/` unless a test names another. */
  readonly dist?: string;
}

export class SiteReleaseStack extends Stack {
  constructor(scope: Construct, id: string, props: SiteReleaseStackProps) {
    super(scope, id, props);

    const dist = props.dist ?? FRONTEND_DIST;
    // The build is published only when it exists, so `cdk synth` works on a
    // clean checkout; the configuration is published either way.
    const built = existsSync(dist);
    // Both deployments run on the one function the CDK shares between them, so they share its log group.
    const logGroup = siteLogGroup(this, 'DeploymentLogs');

    if (built) {
      new BucketDeployment(this, 'SiteAssets', {
        sources: [Source.asset(dist, { exclude: ['index.html', 'config.json'] })],
        destinationBucket: props.bucket,
        cacheControl: [CacheControl.fromString('public, max-age=31536000, immutable')],
        prune: false,
        memoryLimit: 512,
        logGroup,
      });
    }

    new BucketDeployment(this, 'SiteEntry', {
      sources: [
        ...(built ? [Source.asset(dist, { exclude: ['assets/*', 'config.json'] })] : []),
        Source.jsonData('config.json', props.config),
      ],
      destinationBucket: props.bucket,
      cacheControl: [CacheControl.fromString('no-cache, must-revalidate')],
      distribution: props.distribution,
      distributionPaths: ['/*'],
      prune: false,
      memoryLimit: 512,
      logGroup,
    });
  }
}
