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

  it('answers on www.memorysmith.app, with a certificate of its own validated in the zone (#4)', () => {
    hosting.hasResourceProperties('AWS::CertificateManager::Certificate', {
      DomainName: 'www.memorysmith.app',
      ValidationMethod: 'DNS',
      DomainValidationOptions: [
        { DomainName: 'www.memorysmith.app', HostedZoneId: 'Z1003210YHFJUFXNHOVX' },
      ],
    });
    hosting.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: Match.objectLike({
        Aliases: ['www.memorysmith.app'],
        ViewerCertificate: Match.objectLike({ SslSupportMethod: 'sni-only' }),
      }),
    });
  });

  it('writes its A and AAAA records in the zone of the application, and nothing at the apex', () => {
    for (const type of ['A', 'AAAA']) {
      hosting.hasResourceProperties('AWS::Route53::RecordSet', {
        Name: 'www.memorysmith.app.',
        Type: type,
        HostedZoneId: 'Z1003210YHFJUFXNHOVX',
        AliasTarget: Match.objectLike({
          DNSName: { 'Fn::GetAtt': [Match.stringLikeRegexp('^Distribution'), 'DomainName'] },
        }),
      });
    }
    hosting.resourceCountIs('AWS::Route53::RecordSet', 2);
  });
});
