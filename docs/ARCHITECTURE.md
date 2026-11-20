# Architecture

How `memorysmithapp-site` is organised, and why: what it is made of, what enforces each invariant of [`AGENTS.md` §5](../AGENTS.md#5-invariants), what it integrates with, and the decisions behind it.

Claims carry their status when it is not obvious: *observed*, *declared*, *inferred*, and **To confirm** for what was not verified ([`PRD.md`](PRD.md)).

## 1. Overview

*Instruction: what the system is made of, and how the parts relate.*

It is made of:

- **The website**, `memorysmithapp-site-frontend`: a single page built with Vite, React and TypeScript, the stack of the application's interface, that reads at runtime from `/config.json` the version it serves.
- **The infrastructure of the website**, `memorysmithapp-site-infra`: a CDK app in TypeScript that declares where the website is hosted, how a release is published into it, and the role a pipeline delivers with ([ADR-001](#adr-001-the-website-is-hosted-as-the-applications-interface)).

- **Documents:** `.claude/CLAUDE.md` imports `AGENTS.md`; `AGENTS.md` maps the reading and the writing onto `PRD.md`, `ARCHITECTURE.md` and `SDLC.md`, which live in `docs/`, and `README.md`, and states the limits and invariants in one line each; `CHANGELOG.md` records what each version changed. The root holds only what a tool or a convention looks for there.
- **Repository files:** `package.json`, the one home of the version; `.gitignore`, `.editorconfig` and `LICENSE`.
- **A setup script**, `scripts/setup-repo.sh`, which applies to the repository the GitHub configuration a copy of its files does not carry, and puts it back when it drifts.
- **A quality workflow**, `.github/workflows/quality.yml`, which runs `scripts/quality.mjs` and then type-checks, tests and builds both packages on every pull request and push to `main`; the ruleset requires it.
- **A release workflow**, `.github/workflows/release.yml`, which delivers production once a version's bump is merged, then tags and publishes that version and closes its milestone ([ADR-002](#adr-002-production-is-delivered-by-the-release-before-the-tag)).
- **GitHub configuration**: the ruleset `main`, the branch protection of `main`, the team `maintainers`'s write, and the settings the script applies.

Each fact has one home ([`AGENTS.md` §3](../AGENTS.md#3-writing-map)): an invariant is stated in `AGENTS.md` and its mechanism here; a rule is stated in `PRD.md` and enforced where §3 says.

## 2. Layout

*Instruction: every file and directory, and what it is for.*

| Path | What it is for |
|---|---|
| `.claude/CLAUDE.md` | The single line `@../AGENTS.md`, which Claude Code imports at the start of every session and sub-agent |
| `AGENTS.md` | How an agent works here: identity, reading and writing maps, limits, invariants, verified commands, the checklist before done; at the root, where the agents that read it look for it |
| `docs/PRD.md` | What the product solves and delivers, under which rule |
| `docs/ARCHITECTURE.md` | This document |
| `docs/SDLC.md` | How a change travels from an issue to a release |
| `README.md` | What this is and how to start; at the root, where GitHub renders it |
| `CHANGELOG.md` | What changed in each version, in Keep a Changelog 1.1.0; at the root, by Keep a Changelog's convention and because the scripts read it there |
| `package.json` | The one home of the version (`version`), the package manager pinned (`packageManager`), and the scripts `quality`, `test`, `typecheck` and `test:packages`; private, named `@memorysmithapp/site`, the root of the workspace, with no dependency of its own |
| `pnpm-workspace.yaml` | The packages of the workspace, and the one dependency allowed to run its install script, `esbuild` |
| `memorysmithapp-site-frontend/` | The website, `@memorysmithapp/site-frontend`, private and with no `version` of its own (INV-01); `pnpm build` writes it to `dist/` |
| `memorysmithapp-site-frontend/index.html` | The entry document: the icons, the fonts of the brand from Google Fonts, and the script |
| `memorysmithapp-site-frontend/vite.config.ts` | The build, and the answer of `vite dev` to `/config.json` from the untracked `config.local.json` |
| `memorysmithapp-site-frontend/config.example.json` | What `config.local.json` holds on a workstation |
| `memorysmithapp-site-frontend/public/` | The MemorySmith symbol, light and dark, and its icons, copied from `memorysmithapp-frontend` |
| `memorysmithapp-site-frontend/src/runtime-config.ts` | Reads and validates `/config.json`, never from the cache |
| `memorysmithapp-site-frontend/src/UnderConstruction.tsx` | The page, and `src/main.tsx` renders it and hands it the version |
| `memorysmithapp-site-frontend/src/styles.css` | The tokens of the brand, light and dark, and the layout of the page |
| `memorysmithapp-site-frontend/src/*.test.ts*` | Tests of the configuration and of the page, on `vitest`, the page rendered to static markup |
| `memorysmithapp-site-infra/` | The CDK app of the website, `@memorysmithapp/site-infra`, private and with no `version` of its own (INV-01) |
| `memorysmithapp-site-infra/cdk.json` | How the CDK runs the app, its feature flags, the account and region of `production`, and the repository and OIDC subject that may deliver |
| `memorysmithapp-site-infra/bin/app.ts` | The app: which stacks a synth declares, and their tags |
| `memorysmithapp-site-infra/config/environment.ts` | Reads the environment from `cdk.json`, field by field, and names the stacks |
| `memorysmithapp-site-infra/constructs/deployment.ts` | What a deploy says about itself: the environment, the version of the root `package.json` and the commit, and the tags that carry them |
| `memorysmithapp-site-infra/stacks/site-hosting.stack.ts` | The stack `MemorysmithSiteHosting`: the private bucket and the CloudFront distribution |
| `memorysmithapp-site-infra/stacks/site-release.stack.ts` | The stack `MemorysmithSiteRelease`: the build of the frontend and `/config.json`, published into the bucket |
| `memorysmithapp-site-infra/stacks/github-delivery.stack.ts` | The stack `MemorysmithSiteGithubDelivery`: the role GitHub Actions delivers with, deployed by hand |
| `memorysmithapp-site-infra/test/` | Tests of the synthesized templates, on `vitest` and `aws-cdk-lib/assertions` |
| `scripts/setup-repo.sh` | Applies the settings a copy does not carry to the repository; uses only `gh` and `jq`; the mechanism of INV-03 |
| `scripts/quality.mjs` | The checks of the workflow *Quality*, Node only |
| `scripts/quality.test.mjs` | The tests of the checks, one deliberate violation each, on `node:test` |
| `scripts/release.mjs` | Decides what the workflow *Release* does on a push to `main`: release, nothing, or fail |
| `scripts/release.test.mjs` | The tests of that decision |
| `scripts/close-milestone.mjs` | Closes the milestone of a version the workflow *Release* released, or leaves it open and names what it still holds |
| `scripts/close-milestone.test.mjs` | The tests of what it does to a milestone |
| `scripts/lib/changelog.mjs` | Reads `CHANGELOG.md`: its sections, categories, link definitions and the notes of a version |
| `.github/workflows/quality.yml` | The workflow *Quality*, job `Quality` |
| `.github/workflows/release.yml` | The workflow *Release*: the jobs `Decide`, `Deliver production` and `Release`, which deliver a merged version, write its tag and GitHub Release, and close its milestone |
| `pnpm-lock.yaml` | Written by pnpm: the exact version of every dependency of the workspace |
| `.gitignore` | Dependencies, build output, coverage, the CDK's `cdk.out/`, environment files, logs, operating-system and editor files, and Claude Code's personal settings and worktrees under `.claude/` |
| `.editorconfig` | UTF-8, LF, two spaces, final newline |
| `LICENSE` | The MIT licence; at the root, the only place GitHub detects it |

## 3. Invariants and their mechanisms

*Instruction: one subsection per invariant of `AGENTS.md` §5, saying what enforces it, or that nothing does.*

### INV-01 The version has one home

The version lives in the `version` field of the root `package.json` and nowhere else; `CHANGELOG.md` records the versions that were cut.

**Mechanism:** check 1 of [`scripts/quality.mjs`](../scripts/quality.mjs), run by the workflow *Quality*: the root `package.json` has a SemVer `version`, and it is the latest released section of `CHANGELOG.md`; on the branch `release/vX.Y.Z` it may be ahead of it, bumping to it; before the first cut it may be `0.1.0` with no released section. That the version is written in no other file is held by the writing map and the owner's review.

### INV-02 CLAUDE.md is only the import

`.claude/CLAUDE.md` is the line `@../AGENTS.md` and nothing else, and no `CLAUDE.md` sits at the root. Claude Code expands an `@path` line into the contents of the file it names, so the instructions load in every session and sub-agent (*observed* in the session that adopted this repository); a `CLAUDE.md` that only mentioned `AGENTS.md` in prose would leave reading it to the agent's judgement. The path resolves from the file that holds the import: inside `.claude/`, `@AGENTS.md` would import nothing (**To confirm** here). A `CLAUDE.md` at the root would load as well, beside the one in `.claude/`.

**Mechanism:** check 3 of [`scripts/quality.mjs`](../scripts/quality.mjs), run by the workflow *Quality*: `.claude/CLAUDE.md` is byte for byte `@../AGENTS.md` and an optional newline, and no `CLAUDE.md` exists at the root. The check walks no worktree under `.claude/worktrees/`, each a full copy of the repository.

### INV-03 main changes only through a pull request

**Mechanism:** two settings of the repository, the ruleset saying *how* a change reaches `main` and the branch protection saying *who* merges it.

The repository ruleset `main` (*observed* on 2026-11-20, id `27759007`), active on the default branch, with no bypass actors:

- `deletion`: the branch cannot be deleted;
- `non_fast_forward`: no force push;
- `pull_request`: every change through a pull request, with 0 required approvals and no code owner review, merge, squash and rebase allowed;
- `required_status_checks`: the check `Quality` passes before a merge.

Nobody can bypass it, administrators included (`current_user_can_bypass: never`, *observed*).

The branch protection of `main` (*observed* on 2026-11-20) restricts who can push to it to the organization's team `maintainers`, which has write on the repository; GitHub applies that restriction to merging a pull request too, so the merge of anyone outside the team is refused. `enforce_admins` is on, force pushes and deletion are off, and it requires no review and no status check of its own: those are the ruleset's. For a member of the team a merge is a permission, not a bypass, so a maintainer's own pull request merges with a green button (**To confirm** here). The team `contributors` keeps write, and with it branches, pull requests and merges into a `release/vX.Y.Z`. The restriction of a branch protection is available on GitHub's free plan for a public repository of an organization (*observed* on this one).

Both are settings of the repository, not files, so a copy of the repository's files does not carry them: **`scripts/setup-repo.sh`** creates them, or brings them back to this definition when they drifted. The script defines them in its own source and compares only what it sets: the ruleset rule by rule, so a parameter GitHub fills in by default does not count as drift, and the branch protection in the shape of its request, the users, teams and apps of the restriction by name. Its first run here, on 2026-11-20, created the ruleset and the team's write and then stopped before the branch protection (#1); a copy carrying the fix proposed in `memorysmithapp-template` created the branch protection and found everything else in place (*observed*). That a second run of this repository's own script changes nothing is **To confirm** once it carries the fix.

### INV-04 Only the release workflow writes a tag

A version names one commit: the tag `vX.Y.Z` is written once, on the merged commit, and never moved or deleted ([`SDLC.md` §10](SDLC.md#10-release), [§11](SDLC.md#11-rollback)).

**Mechanism:** the workflow *Release* ([`.github/workflows/release.yml`](../.github/workflows/release.yml)), on every push to `main`. [`scripts/release.mjs`](../scripts/release.mjs) reads the version, releases nothing when the GitHub links at the foot of `CHANGELOG.md` do not all name `GITHUB_REPOSITORY`, releases nothing when its tag names an ancestor of `HEAD` (`git merge-base --is-ancestor`, on the full history the checkout fetches), refuses to go on when the tag names any other commit, creates only the GitHub Release when the tag names `HEAD` and the Release is missing (read with `gh api`, where any answer but found or 404 fails the run), and releases only when `CHANGELOG.md` has a section for it and the tag does not exist yet; the workflow then delivers production and, only once that succeeded, writes the annotated tag on `GITHUB_SHA` and the Release with that section as its notes. Run by hand, it refuses any ref but a tag, so a branch is never released from a run nobody merged. That nobody writes a tag by hand is held by the limit of `AGENTS.md` §4: the ruleset `main` protects the branch, not tags.

The link condition exists because a repository created from `memorysmithapp-template` receives its `CHANGELOG.md`, released sections included, in an initial commit pushed to `main`: without it, *Release* would publish the template's version there on creation. Check 6 of [`scripts/quality.mjs`](../scripts/quality.mjs) holds the other side: the foot links name the repository the check runs in, so a changelog that names another repository fails `Quality` instead of leaving *Release* to skip in silence.

### INV-05 The documents keep their form

`CHANGELOG.md` keeps the format of Keep a Changelog 1.1.0, every relative link and anchor resolves, and no document carries a version footer.

**Mechanism:** checks 2, 4 and 5 of [`scripts/quality.mjs`](../scripts/quality.mjs), run by the workflow *Quality*. Anchors are computed as GitHub computes them (lowercase, punctuation dropped, spaces as hyphens, `-1`, `-2`… for repeated headings), which is what keeps the links of `AGENTS.md` into this document from rotting silently. Code blocks and inline code are skipped, so a link or a footer quoted as code is not read as one. A footer is a line *starting* with "Last revised", "Last updated", "Revision date", "Internal document" and the like; the words inside a sentence are not one.

## 4. Integrations

*Instruction: every external system the project depends on, and what it uses from each.*

**GitHub.**

- *Rulesets, branch protection and settings:* the ruleset `main` and the branch protection of `main` of [INV-03](#inv-03-main-changes-only-through-a-pull-request), the write of the organization's team `maintainers` on the repository, and the description, topics, merge options, wiki and discussions, all through the REST API by `scripts/setup-repo.sh` with the `gh` of an administrator.
- *Teams:* the organization's teams `maintainers` (who merges to `main`, today the owner alone) and `contributors` (branches, issues and pull requests), each with write on its repositories (*declared* by the owner). The script requires `maintainers` to exist and gives it write; it does not create teams or change their members.
- *Issues and milestones:* GitHub's blank issue, its default labels and the product label families a repository declares in [`SDLC.md` §2](SDLC.md#2-issues-and-milestones); a milestone per version, closed by the workflow *Release* once the version is released.
- *Actions:* the workflows *Quality* and *Release* on `ubuntu-latest`, with Node 24 from `actions/setup-node` and the pnpm of `packageManager` through Corepack, and `aws-actions/configure-aws-credentials` for the delivery. Nothing they run installs a system package, so the label is left to follow GitHub's images.
- *Environments:* the GitHub environment `production`, which the delivery job runs in and the OIDC subject of the delivery role names, with the variable `AWS_PRODUCTION_ROLE_ARN`, the output `RoleArn` of `MemorysmithSiteGithubDelivery`. It holds no secret, and only a run on the branch `main` or on a tag `v*` may enter it (*observed* on 2026-11-20), so a run on any other branch cannot assume the delivery role even though the role trusts the environment alone. Like the ruleset, it is a setting, not a file, created with `gh api`.

**AWS.** The website lives in the account and the region of the application, `364362227104` in `us-east-1`, which `cdk.json` names so the CDK refuses any other (*observed* in the application's own `cdk.json`, which this one repeats):

- *S3 and CloudFront:* a private bucket, encrypted by S3 and reachable only over TLS, that only the distribution reads, through Origin Access Control. The distribution redirects HTTP to HTTPS, serves HTTP/2 and HTTP/3 from price class 100, with the managed security-headers policy, and a CloudFront Function answers a path with no extension with `/index.html`. It answers on its own `*.cloudfront.net` host, which the output `SiteUrl` of `MemorysmithSiteHosting` names: `www.memorysmith.app` is #4's.
- *The release:* two `BucketDeployment`s of `aws-s3-deployment`. The hashed files under `assets/` go with `public, max-age=31536000, immutable`; `index.html`, the other files of the build and `/config.json` go with `no-cache, must-revalidate`, and invalidate `/*`. Nothing is pruned, so a visitor holding the entry document of the previous release still finds its assets. `/config.json` holds the environment, the version and the commit; a synth with no build publishes it alone.
- *IAM:* the role `memorysmith-site-github`, assumed through the account's GitHub OIDC provider, which the application's stack `MemorysmithGithubDelivery` declares and this app only trusts, by the `sub` of this repository's GitHub environment `production` with GitHub's immutable ids (`repo:memorysmithapp@311768902/memorysmithapp-site@1465855023:environment:production`, *observed* with `gh api`). It may only assume the roles of `cdk bootstrap`, qualifier `hnb659fds`, which the application bootstrapped in the account.
- *Tags:* every stack carries `app:project` `memorysmith-site` and `app:environment` `production`; the hosting and the release also carry `app:version` and `deploy:sha`, the version and the commit they serve.

**npm.** Any package a repository of the organisation publishes uses the scope `@memorysmithapp`. The npm organisation `memorysmithapp` exists since 2026-10-12, which reserves the scope, and is on the **free plan, which publishes public packages only**; a private package would need the paid Teams plan (*declared* by the owner). No npm token exists (*declared*). Therefore, in the `package.json` of every repository of the organisation:

- **A package published under `@memorysmithapp` declares `"publishConfig": { "access": "public" }`.** npm publishes a scoped package as *restricted* by default, and on the free plan that publish fails with `402 Payment Required`; written in `package.json`, the access does not depend on somebody remembering `--access public`.
- **A package never meant to be published declares `"private": true`**, which stops `npm publish` whatever the plan. The root `package.json` of this repository is one.
- **Publishing from CI goes through npm *trusted publishing* from GitHub Actions (OIDC)**, with no stored token, set up by the repository that first publishes, in an issue of its own.

## 5. Operation

*Instruction: what runs, where, with which permissions and secrets.*

**Quality** (`.github/workflows/quality.yml`) runs on every pull request and every push to `main`, with `contents: read` and no secret; it reads the branch from `GITHUB_HEAD_REF` or `GITHUB_REF_NAME` for check 1.

**Quality** also installs the workspace with `--frozen-lockfile`, type-checks and tests both packages, builds the website and synthesizes the infrastructure, with no AWS credentials.

**Release** (`.github/workflows/release.yml`) runs on every push to `main`, and by hand on a tag; it reads the repository it runs in from `GITHUB_REPOSITORY`, one run at a time (`concurrency: release`), with no stored secret. The job `Decide` runs `scripts/release.mjs` with `contents: read`. When it decides anything but `skip`, the job `Deliver production` runs in the GitHub environment `production` with `id-token: write`: it builds the website, assumes `AWS_PRODUCTION_ROLE_ARN` through OIDC for the run, and runs `cdk deploy` of `MemorysmithSiteHosting` and `MemorysmithSiteRelease` with the merged commit as `-c commit`, writing the version and the address served to the run summary. Only when that succeeded does the job `Release` run, with `contents: write` and `issues: write` for the workflow's own `GITHUB_TOKEN`: it pushes the tag with git, as `github-actions[bot]`, reads whether a Release exists and creates it with `gh`, and closes the milestone through the REST API with `gh` in `scripts/close-milestone.mjs`, which GitHub allows only with `issues: write`. That step runs when the decision is `release` or `tagged`, writes what it did to the run summary, and fails only when GitHub cannot be read or written. A tag pushed with that token starts no other workflow.

**The CDK app** synthesizes with no AWS credentials, since it looks nothing up. Deploying it needs credentials of the account: `MemorysmithSiteGithubDelivery` is deployed once, by hand, with an administrator's, and the hosting and the release are deployed by *Release* with the role it creates, and never from a workstation.

`scripts/setup-repo.sh` runs on a person's machine, once when the repository is created and again whenever its settings drift, with the permissions of the administrator whose `gh` it uses; it needs no token of its own. It refuses a repository not owned by an organization, an organization without the team `maintainers`, and a repository whose default branch has no commit yet, since a branch protection names an existing branch.

## 6. Architecture decision records

*Instruction: the decisions behind the architecture, one record each, in the format below.*

Each record has an identifier, never reused; its context, decision, rationale and consequences; its date, status and **origin**. A decision that changes keeps its old record, marked *Superseded by ADR-NNN*, and a new record states the new decision.

### ADR-001 The website is hosted as the application's interface

- **Context:** the website has to be served, and the organization already serves the application's interface, `memorysmithapp-frontend`, as a static build on AWS, delivered by a CDK app of its own repository.
- **Decision:** the website is a static build on a private S3 bucket behind CloudFront with Origin Access Control, declared by a CDK app in TypeScript, `memorysmithapp-site-infra`, in the application's account and region. As the interface does, the page reads at runtime from `/config.json` what the release publishes there, never from the bundle. It has one environment, production, and no staging.
- **Rationale:** one way of hosting a static site in the organization. The same services, the same constructs and the same bootstrap of the account mean that whoever maintains one knows the other, and nothing is paid for a server. A build that does not know its version can be built once and published anywhere.
- **Consequences:** the website depends on the bootstrap of the application's account and on its GitHub OIDC provider, and a change to either reaches it. Until #4 it answers on its CloudFront host alone.
- **Date:** 2026-11-20. **Status:** accepted. **Origin:** #5, #6.

### ADR-002 Production is delivered by the release, before the tag

- **Context:** the template's workflow *Release* tags a version on the merge of its bump, and the website now has a production to deliver. The application delivers production on every merge that touches what it deploys and tags once production serves it.
- **Decision:** production is delivered by the workflow *Release*, on the merge to `main` that carries a cut version, and on nothing else: a merge of documents, or one that cuts nothing, delivers nothing. The tag and the Release are written only after the delivery succeeded. A run by hand on the tag of a released version delivers that version again.
- **Rationale:** a tag then always names a version that production has served. Since what is delivered reaches `main` only through the pull request of a cycle, which carries its cut ([`SDLC.md` §3](SDLC.md#3-branches)), delivering on the cut loses no change. One workflow keeps one place for the order.
- **Consequences:** a delivery that fails leaves the version untagged, and running the workflow again finishes it. Production returns to an earlier version by running *Release* on its tag ([`SDLC.md` §11](SDLC.md#11-rollback)).
- **Date:** 2026-11-20. **Status:** accepted. **Origin:** #5, #8.
