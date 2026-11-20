/**
 * The log groups of the functions the stacks create, declared in the stacks
 * (#10).
 *
 * Left to Lambda, a function's log group is created on its first invocation,
 * outside CloudFormation: it carries no tag, so the bill counts it under no
 * project, and it keeps its logs forever. Declared here, it carries the tags of
 * its stack and keeps a month, as every log group of the application does.
 */

import { RemovalPolicy, type CfnResource, type Stack } from 'aws-cdk-lib';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import type { Bucket } from 'aws-cdk-lib/aws-s3';

/** How long every log group of the website keeps what it holds. */
export const LOG_RETENTION = RetentionDays.ONE_MONTH;

/** A log group of the stack, removed with it. */
export function siteLogGroup(stack: Stack, id: string, logGroupName?: string): LogGroup {
  return new LogGroup(stack, id, {
    retention: LOG_RETENTION,
    removalPolicy: RemovalPolicy.DESTROY,
    ...(logGroupName ? { logGroupName } : {}),
  });
}

/**
 * The log group of the function that empties a bucket when its stack is
 * deleted. That function is a provider of the CDK, which takes no log group,
 * so its group is declared under the name Lambda gives one, and the emptying
 * waits for it: deleted after the run, not before, so the run does not create
 * it again, untagged, once the stack is gone.
 */
export function autoDeleteLogGroup(stack: Stack, bucket: Bucket): LogGroup {
  const handler = stack.node
    .tryFindChild('Custom::S3AutoDeleteObjectsCustomResourceProvider')
    ?.node.tryFindChild('Handler') as CfnResource | undefined;
  const emptying = bucket.node.tryFindChild('AutoDeleteObjectsCustomResource');
  if (!handler || !emptying) {
    throw new Error(`${stack.stackName}: the bucket ${bucket.node.id} does not empty itself on delete.`);
  }
  const logGroup = siteLogGroup(stack, 'AutoDeleteObjectsLogs', `/aws/lambda/${handler.ref}`);
  emptying.node.addDependency(logGroup);
  return logGroup;
}
