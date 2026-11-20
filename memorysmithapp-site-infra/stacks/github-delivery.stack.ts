/**
 * What lets GitHub Actions deliver the website, with no AWS key stored
 * anywhere.
 *
 * A run asks GitHub for a token signed by its OIDC provider, which says which
 * repository and which GitHub environment the run is for, and exchanges it for
 * credentials of the role below, valid for the run. The role is assumed only by
 * a run of THIS repository in its GitHub environment `production`: a branch, a
 * pull request, a fork or another repository never matches.
 *
 * The account has one OIDC provider per issuer, and the application's stack
 * `MemorysmithGithubDelivery` declares it; this stack only trusts it. It is
 * deployed once, by hand, from a workstation with administrator credentials,
 * and never by a delivery, so no run can change what it may do:
 *
 *   pnpm -C memorysmithapp-site-infra deploy MemorysmithSiteGithubDelivery
 *
 * What the role may do is what a delivery does: assume the roles `cdk
 * bootstrap` created, which deploy. Those roles can change anything in the
 * account, so what keeps a branch away from production is who may assume this
 * one.
 */

import { CfnOutput, Duration, Stack, type StackProps } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import type { Construct } from 'constructs';
import { GITHUB_ISSUER, type SiteEnvironment } from '../config/environment.js';

export interface GithubDeliveryStackProps extends StackProps {
  readonly environment: SiteEnvironment;
}

export class GithubDeliveryStack extends Stack {
  readonly role: iam.Role;

  constructor(scope: Construct, id: string, props: GithubDeliveryStackProps) {
    super(scope, id, props);
    const { environment } = props;

    const provider = iam.OpenIdConnectProvider.fromOpenIdConnectProviderArn(
      this,
      'GithubProvider',
      `arn:${this.partition}:iam::${this.account}:oidc-provider/${GITHUB_ISSUER}`,
    );

    this.role = new iam.Role(this, 'ProductionRole', {
      roleName: 'memorysmith-site-github',
      description: `Assumed by GitHub Actions of ${environment.repository} in its production environment.`,
      maxSessionDuration: Duration.hours(1),
      assumedBy: new iam.WebIdentityPrincipal(provider.openIdConnectProviderArn, {
        StringEquals: {
          [`${GITHUB_ISSUER}:aud`]: 'sts.amazonaws.com',
          // The repository AND the GitHub environment.
          [`${GITHUB_ISSUER}:sub`]: `${environment.repositorySubject}:environment:${environment.name}`,
        },
      }),
    });
    this.role.addToPolicy(
      new iam.PolicyStatement({
        actions: ['sts:AssumeRole'],
        resources: [`arn:${this.partition}:iam::${this.account}:role/cdk-hnb659fds-*`],
      }),
    );

    // The value of the variable AWS_PRODUCTION_ROLE_ARN of the GitHub environment.
    new CfnOutput(this, 'RoleArn', { value: this.role.roleArn });
  }
}
