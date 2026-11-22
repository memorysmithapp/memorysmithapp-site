# memorysmithapp-site

The website of [MemorySmith](https://memorysmith.app), served at `www.memorysmith.app`: the showcase that presents the product.

It holds the website, in [`memorysmithapp-site-frontend`](memorysmithapp-site-frontend), its infrastructure on AWS, in [`memorysmithapp-site-infra`](memorysmithapp-site-infra), the documents it is built by, and the checks that keep them true.

## Start

With Node 24 and Corepack (`corepack enable`), from the root:

```sh
pnpm install
pnpm run quality         # the checks the workflow Quality runs on every pull request
pnpm test                # their tests
pnpm typecheck           # the type checks of the packages
pnpm test:packages       # the tests of the packages
```

The website runs on a workstation with the version a local `config.local.json` names:

```sh
cp memorysmithapp-site-frontend/config.example.json memorysmithapp-site-frontend/config.local.json
pnpm -C memorysmithapp-site-frontend dev     # http://localhost:5173
pnpm -C memorysmithapp-site-frontend build   # the build a release publishes, in dist/
```

The infrastructure is a CDK app in [`memorysmithapp-site-infra`](memorysmithapp-site-infra); it synthesizes with no AWS credentials:

```sh
pnpm -C memorysmithapp-site-infra synth
```

## Repository settings

The settings a copy of the files does not carry — description, topics, merge options, wiki and discussions off, the ruleset `main` that protects the default branch, write for the organisation's teams `maintainers` and `contributors`, and the branch protection that lets only `maintainers` merge to `main` — are applied by a script, with `gh` authenticated as an administrator and [`jq`](https://jqlang.org/) installed. It was run with:

```sh
scripts/setup-repo.sh memorysmithapp/memorysmithapp-site \
  "The showcase of MemorySmith: the website served at www.memorysmith.app." \
  memorysmith,website,landing-page
```

It is idempotent: run it again whenever the ruleset, the branch protection or the settings drift, and it puts back only what differs.

## The documents

| Document | Answers |
|---|---|
| [`AGENTS.md`](AGENTS.md) (imported by [`.claude/CLAUDE.md`](.claude/CLAUDE.md)) | How an agent works here |
| [`docs/PRD.md`](docs/PRD.md) | What the product solves and delivers, under which rule |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | How the repository is organised, and why |
| [`docs/SDLC.md`](docs/SDLC.md) | How a change travels from an issue to a release |
| [`CHANGELOG.md`](CHANGELOG.md) | What changed in each version |

The version lives in the `version` field of [`package.json`](package.json).

## Licence

[MIT](LICENSE).
