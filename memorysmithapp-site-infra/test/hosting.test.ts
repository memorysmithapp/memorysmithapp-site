import { Match } from 'aws-cdk-lib/assertions';
import { describe, expect, it } from 'vitest';
import { synth } from './stacks.js';

describe('the hosting of the website', () => {
  const { hosting } = synth();

  it('keeps the bucket private, encrypted and reachable only over TLS', () => {
    hosting.hasResourceProperties('AWS::S3::Bucket', {
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true,
      },
      BucketEncryption: {
        ServerSideEncryptionConfiguration: [
          { ServerSideEncryptionByDefault: { SSEAlgorithm: 'AES256' } },
        ],
      },
    });
    hosting.hasResourceProperties('AWS::S3::BucketPolicy', {
      PolicyDocument: {
        Statement: Match.arrayWith([
          Match.objectLike({
            Effect: 'Deny',
            Condition: { Bool: { 'aws:SecureTransport': 'false' } },
          }),
        ]),
      },
    });
  });

  it('lets only the distribution read the bucket, through Origin Access Control', () => {
    hosting.resourceCountIs('AWS::CloudFront::OriginAccessControl', 1);
    hosting.hasResourceProperties('AWS::S3::BucketPolicy', {
      PolicyDocument: {
        Statement: Match.arrayWith([
          Match.objectLike({
            Effect: 'Allow',
            Principal: { Service: 'cloudfront.amazonaws.com' },
            Action: 's3:GetObject',
          }),
        ]),
      },
    });
  });

  it('serves over HTTPS only, HTTP/2 and HTTP/3, in price class 100', () => {
    hosting.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: Match.objectLike({
        DefaultRootObject: 'index.html',
        HttpVersion: 'http2and3',
        PriceClass: 'PriceClass_100',
        DefaultCacheBehavior: Match.objectLike({
          ViewerProtocolPolicy: 'redirect-to-https',
          Compress: true,
          FunctionAssociations: [Match.objectLike({ EventType: 'viewer-request' })],
        }),
      }),
    });
  });

  it('claims no domain name, which the application still holds (#4)', () => {
    const [distribution] = Object.values(hosting.findResources('AWS::CloudFront::Distribution'));
    expect(distribution?.['Properties']?.['DistributionConfig']?.['Aliases']).toBeUndefined();
    hosting.resourceCountIs('AWS::Route53::RecordSet', 0);
    hosting.resourceCountIs('AWS::CertificateManager::Certificate', 0);
  });
});
