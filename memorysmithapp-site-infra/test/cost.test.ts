/**
 * What the bill can tell apart (#10): the tags the account groups its cost by,
 * on what costs something, and a log group of its own, tagged and expiring,
 * for every function the stacks create.
 */

import type { Template } from 'aws-cdk-lib/assertions';
import { describe, expect, it } from 'vitest';
import { fakeDist, synth } from './stacks.js';

const PROJECT = { Key: 'app:project', Value: 'memorysmith-site' };
const ENVIRONMENT = { Key: 'app:environment', Value: 'production' };

type Resource = { Type: string; Properties?: Record<string, unknown>; DependsOn?: string[] };

const resourcesOf = (template: Template, type: string): Array<[string, Resource]> =>
  Object.entries(template.findResources(type)) as Array<[string, Resource]>;

const tagsOf = (resource: Resource): unknown =>
  resource.Properties?.['Tags'] ??
  (resource.Properties?.['DistributionConfig'] as Record<string, unknown> | undefined)?.['Tags'];

describe('the cost of the website', () => {
  const { hosting, release } = synth({ dist: fakeDist() });

  it.each([
    ['the bucket', hosting, 'AWS::S3::Bucket'],
    ['the distribution', hosting, 'AWS::CloudFront::Distribution'],
    ['the function that publishes a release', release, 'AWS::Lambda::Function'],
  ] as const)('is counted under memorysmith-site: %s', (_name, template, type) => {
    const resources = resourcesOf(template, type);
    expect(resources.length).toBeGreaterThan(0);
    for (const [, resource] of resources) {
      expect(tagsOf(resource)).toEqual(expect.arrayContaining([PROJECT, ENVIRONMENT]));
    }
  });

  it.each([
    ['hosting', hosting],
    ['release', release],
  ] as const)('keeps every log group of the %s a month, tagged', (_name, template) => {
    const groups = resourcesOf(template, 'AWS::Logs::LogGroup');
    expect(groups).toHaveLength(1);
    for (const [, group] of groups) {
      expect(group.Properties?.['RetentionInDays']).toBe(30);
      expect(group.Properties?.['Tags']).toEqual(expect.arrayContaining([PROJECT, ENVIRONMENT]));
    }
  });

  it('sends the logs of the function that publishes a release to its declared group', () => {
    const [[groupId]] = resourcesOf(release, 'AWS::Logs::LogGroup') as [[string, Resource]];
    const functions = resourcesOf(release, 'AWS::Lambda::Function');
    expect(functions).toHaveLength(1);
    for (const [, fn] of functions) {
      expect(fn.Properties?.['LoggingConfig']).toEqual({ LogGroup: { Ref: groupId } });
    }
  });

  it('names the group of the function that empties the bucket as Lambda would, and keeps it until the emptying ran', () => {
    const [[groupId, group]] = resourcesOf(hosting, 'AWS::Logs::LogGroup') as [[string, Resource]];
    const [[handlerId]] = resourcesOf(hosting, 'AWS::Lambda::Function') as [[string, Resource]];
    expect(group.Properties?.['LogGroupName']).toEqual({
      'Fn::Join': ['', ['/aws/lambda/', { Ref: handlerId }]],
    });
    const [[, emptying]] = resourcesOf(hosting, 'Custom::S3AutoDeleteObjects') as [[string, Resource]];
    expect(emptying.DependsOn).toContain(groupId);
  });
});
