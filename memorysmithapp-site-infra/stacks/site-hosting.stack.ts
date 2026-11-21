/**
 * The website on S3 behind CloudFront with Origin Access Control: the bucket,
 * the distribution, its certificate and its records, and nothing that is
 * published into them, which is the release stack's.
 *
 * The bucket is private: only the distribution reads it. The distribution
 * answers on `www.memorysmith.app`, which the application let go of in its
 * v0.21.0 (#4), with a certificate of its own: CloudFront requires it in
 * us-east-1, where the website already is. Its records are written in the
 * application's zone, as records of this stack.
 */

import { CfnOutput, RemovalPolicy, Stack, type StackProps } from 'aws-cdk-lib';
import {
  AllowedMethods,
  Distribution,
  Function as CloudFrontFunction,
  FunctionCode,
  FunctionEventType,
  HttpVersion,
  PriceClass,
  ResponseHeadersPolicy,
  ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import { S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { Certificate, CertificateValidation } from 'aws-cdk-lib/aws-certificatemanager';
import { AaaaRecord, ARecord, HostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import { BlockPublicAccess, Bucket, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import type { Construct } from 'constructs';
import { autoDeleteLogGroup } from '../constructs/log-groups.js';

export interface SiteHostingStackProps extends StackProps {
  readonly domainName: string;
  readonly hostedZoneName: string;
  readonly hostedZoneId: string;
}

export class SiteHostingStack extends Stack {
  readonly bucket: Bucket;
  readonly distribution: Distribution;

  constructor(scope: Construct, id: string, props: SiteHostingStackProps) {
    super(scope, id, props);

    const zone = HostedZone.fromHostedZoneAttributes(this, 'Zone', {
      zoneName: props.hostedZoneName,
      hostedZoneId: props.hostedZoneId,
    });
    const certificate = new Certificate(this, 'SiteCertificate', {
      domainName: props.domainName,
      validation: CertificateValidation.fromDns(zone),
    });

    const bucket = new Bucket(this, 'SiteBucket', {
      encryption: BucketEncryption.S3_MANAGED,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      // Nothing in it is kept: every release publishes the whole website again.
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });
    autoDeleteLogGroup(this, bucket);

    /**
     * A path with no extension is a page of the single-page app, and is
     * answered with index.html, so a deep link keeps working on a hard refresh
     * without turning the bucket into a website endpoint.
     */
    const rewrite = new CloudFrontFunction(this, 'SpaRewrite', {
      code: FunctionCode.fromInline(`
function handler(event) {
  var request = event.request;
  if (!request.uri.includes('.')) request.uri = '/index.html';
  return request;
}
`),
    });

    const distribution = new Distribution(this, 'Distribution', {
      comment: 'The website of MemorySmith',
      defaultBehavior: {
        origin: S3BucketOrigin.withOriginAccessControl(bucket),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: AllowedMethods.ALLOW_GET_HEAD,
        compress: true,
        responseHeadersPolicy: ResponseHeadersPolicy.SECURITY_HEADERS,
        functionAssociations: [{ function: rewrite, eventType: FunctionEventType.VIEWER_REQUEST }],
      },
      defaultRootObject: 'index.html',
      domainNames: [props.domainName],
      certificate,
      httpVersion: HttpVersion.HTTP2_AND_3,
      priceClass: PriceClass.PRICE_CLASS_100,
    });

    const target = RecordTarget.fromAlias(new CloudFrontTarget(distribution));
    new ARecord(this, 'SiteRecord', { zone, recordName: props.domainName, target });
    new AaaaRecord(this, 'SiteRecordIpv6', { zone, recordName: props.domainName, target });

    // Where the website answers, read by whoever wants to open it.
    new CfnOutput(this, 'SiteUrl', { value: `https://${props.domainName}` });
    // Its own host, which answers too, for whoever needs to tell the two apart.
    new CfnOutput(this, 'DistributionUrl', {
      value: `https://${distribution.distributionDomainName}`,
    });

    this.bucket = bucket;
    this.distribution = distribution;
  }
}
