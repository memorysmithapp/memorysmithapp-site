import { Match } from 'aws-cdk-lib/assertions';
import { describe, expect, it } from 'vitest';
import { synth } from './stacks.js';

describe('the role that delivers the website', () => {
  const { delivery } = synth();

  it('is assumed only by this repository, in its GitHub environment production', () => {
    delivery.hasResourceProperties('AWS::IAM::Role', {
      RoleName: 'memorysmith-site-github',
      AssumeRolePolicyDocument: {
        Statement: [
          Match.objectLike({
            Action: 'sts:AssumeRoleWithWebIdentity',
            Condition: {
              StringEquals: {
                'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
                'token.actions.githubusercontent.com:sub':
                  'repo:memorysmithapp@311768902/memorysmithapp-site@1465855023:environment:production',
              },
            },
          }),
        ],
      },
    });
  });

  it("trusts the account's existing provider, and creates none", () => {
    delivery.resourceCountIs('AWS::IAM::OIDCProvider', 0);
    delivery.resourceCountIs('Custom::AWSCDKOpenIdConnectProvider', 0);
  });

  it('may only assume the roles cdk bootstrap created', () => {
    const policies = Object.values(delivery.findResources('AWS::IAM::Policy'));
    expect(policies).toHaveLength(1);
    expect(policies[0]?.['Properties']?.['PolicyDocument']?.['Statement']).toEqual([
      {
        Effect: 'Allow',
        Action: 'sts:AssumeRole',
        Resource: 'arn:aws:iam::364362227104:role/cdk-hnb659fds-*',
      },
    ]);
  });
});
