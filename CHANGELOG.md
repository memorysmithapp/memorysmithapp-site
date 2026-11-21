# Changelog

All notable changes to this repository are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this repository adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- The website answers at `www.memorysmith.app`, with a certificate of its own and its `A` and `AAAA` records in the zone `memorysmith.app`, now that the application lets go of the name (#4).

## [0.1.0] - 2026-11-20

### Added

- `memorysmithapp-site-infra`, the CDK app of the website: a private S3 bucket behind CloudFront with Origin Access Control, the release of the frontend's build and of `/config.json` with the version it serves, and the role GitHub Actions delivers production with, through OIDC (#6).
- `memorysmithapp-site-frontend`, the website, with Vite, React and TypeScript: one page that says it is under construction, points at `memorysmith.app`, and shows the version it serves, read from `/config.json` (#7).
- The workflow *Release* delivers production before it tags: on the merge of a cut version it builds the website and deploys it to AWS through OIDC, and writes the tag and the Release only once production serves it. Run by hand on the tag of a released version, it delivers that version again (#8).
- The cost of the website has its own line in the account's bill, under the tag `app:project` `memorysmith-site`: the log group of every function its stacks create is declared in its stack, tagged and kept 30 days, instead of being left untagged and kept forever (#10).

### Changed

- The workflow *Quality* also type-checks, tests and builds the website and its infrastructure (#8).
- The repository adopts `memorysmithapp-template` v0.5.1: `AGENTS.md`, `README.md` and `package.json` name `memorysmithapp-site`; `docs/PRD.md` and `docs/ARCHITECTURE.md` keep their skeletons and the description of the parts kept; the version restarts at `0.1.0` and the changelog names this repository (#2).

[unreleased]: https://github.com/memorysmithapp/memorysmithapp-site/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/memorysmithapp/memorysmithapp-site/releases/tag/v0.1.0
