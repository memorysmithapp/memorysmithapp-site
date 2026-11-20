/**
 * The website on S3 behind CloudFront with Origin Access Control: the bucket
 * and the distribution, and nothing that is published into them, which is the
 * release stack's.
 *
 * The bucket is private: only the distribution reads it. The distribution
 * answers on its own host, `*.cloudfront.net`, because `www.memorysmith.app`
 * belongs to the application's distribution until it lets go of it, and
 * CloudFront refuses one name on two distributions (#4).
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
import { BlockPublicAccess, Bucket, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import type { Construct } from 'constructs';
import { autoDeleteLogGroup } from '../constructs/log-groups.js';

export class SiteHostingStack extends Stack {
  readonly bucket: Bucket;
  readonly distribution: Distribution;

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

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
      httpVersion: HttpVersion.HTTP2_AND_3,
      priceClass: PriceClass.PRICE_CLASS_100,
    });

    // Where the website answers, read by whoever wants to open it.
    new CfnOutput(this, 'SiteUrl', { value: `https://${distribution.distributionDomainName}` });

    this.bucket = bucket;
    this.distribution = distribution;
  }
}
