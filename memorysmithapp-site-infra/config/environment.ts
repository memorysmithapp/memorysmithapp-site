/**
 * The one environment the website has: production. It has no staging (#4).
 *
 * The account and the region are read from cdk.json and never from the
 * credentials, so the CDK refuses to deploy into any account but the one named
 * there: the application's, in the same region as the application.
 */

export interface ContextReader {
  tryGetContext(key: string): unknown;
}

export interface SiteEnvironment {
  readonly name: 'production';
  readonly account: string;
  readonly region: string;
  /** Where the website answers. */
  readonly domainName: string;
  /** The zone the name is written in: the application's, which the website writes a record of its own in. */
  readonly hostedZoneName: string;
  readonly hostedZoneId: string;
  /** `owner/name`: the one repository whose runs may deliver. */
  readonly repository: string;
  /** What the `sub` of its OIDC tokens starts with, ids included, as GitHub signs them. */
  readonly repositorySubject: string;
}

/** The issuer of the tokens GitHub Actions signs. */
export const GITHUB_ISSUER = 'token.actions.githubusercontent.com';

/** The name of every stack, from the part it holds. */
export function stackId(part: string): string {
  return `MemorysmithSite${part}`;
}

export function environmentOf(node: ContextReader): SiteEnvironment {
  const raw = node.tryGetContext('production') as Record<string, unknown> | undefined;
  if (!raw) throw new Error('cdk.json declares no "production".');
  const text = (value: unknown, key: string): string => {
    if (typeof value !== 'string' || value.trim() === '') {
      throw new Error(`cdk.json has no "${key}".`);
    }
    return value.trim();
  };
  const account = text(raw['account'], 'production.account');
  if (!/^\d{12}$/.test(account)) {
    throw new Error(`cdk.json names "${account}" as the account, which is not an account id.`);
  }
  return {
    name: 'production',
    account,
    region: text(raw['region'], 'production.region'),
    domainName: text(raw['domainName'], 'production.domainName'),
    hostedZoneName: text(raw['hostedZoneName'], 'production.hostedZoneName'),
    hostedZoneId: text(raw['hostedZoneId'], 'production.hostedZoneId'),
    repository: text(node.tryGetContext('repository'), 'repository'),
    repositorySubject: text(node.tryGetContext('repositorySubject'), 'repositorySubject'),
  };
}
