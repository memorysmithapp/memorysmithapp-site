# Changelog

All notable changes to this repository are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this repository adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- `SDLC.md` and `AGENTS.md` §4 bring in three rules of `memorysmithapp-template` v0.5.3 and v0.5.4. Each repository stands on its own: a problem found in another repository is registered there, as one issue, with no sub-issues elsewhere, replacing the registration of a gap at its origin (§2). A cycle is planned from every open issue, reviewed with the owner before the work starts; leaving one out, or moving it to a later version, is the owner's decision with a reason (§2). Delivering is the owner's decision: running *Release* by hand on a tag, or a `cdk deploy`, needs the owner's go-ahead in the session, which a go-ahead to implement is not (§8) (#18).
- The website's two carousels have no pause button: the hero gains previous and next arrows beside its dots, the arrow keys and a swipe, the carousel of models carries its arrows over the edges of the image, which follows the finger or the mouse while dragged, and the first manual change stops the automatic rotation for good, which with the pause under the pointer or the focus and under less motion keeps WCAG 2.2.2 without the button (#23).
- The website's hero has no floating card over the product screen: it repeated what the chat beside it shows and, on a phone, took room before the app window (#20).
- On a phone, the 3D background's symbol is dimmer behind the hero's headline, which it competed with; the desktop does not change (#24).
- On a phone, the 3D background's symbol is sharp: it is drawn at the screen's real density, up to 3x, instead of a 2x canvas the browser stretched, and its particles have a crisper edge, with their brightness lowered to match; the desktop does not change (#21).

## [0.3.1] - 2026-11-22

### Fixed

- `scripts/setup-repo.sh` creates the branch protection of `main` when it is absent, instead of dying on the 404 that says so: under `pipefail` the pipeline into `grep` took the exit status of `gh` and never saw the 404. It carries the fix of `memorysmithapp-template` v0.5.2 (#1).
- `scripts/setup-repo.sh` gives the organization's team `contributors` write on the repository, as it does `maintainers`, and requires both teams to exist: without it a contributor fell back to the organization's base permission, read, and could not push a branch or create a milestone. It carries the fix of `memorysmithapp-template` v0.5.3 (#15).

## [0.3.0] - 2026-11-21

### Changed

- The website presents the product: the landing page of MemorySmith, in Brazilian Portuguese, replaces the page under construction, with its sections, its carousel of models, its questions and its 3D background, and the version it serves in its footer. It is dark only, and comes without the theme toggle, the accessibility panel, the contact section and the sign-in page of its design; its sign-in and subscription calls lead to `memorysmith.app` (#13).

### Removed

- React, from the website: the page is HTML, CSS and JavaScript bundled by Vite (#13).

## [0.2.0] - 2026-11-20

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

[unreleased]: https://github.com/memorysmithapp/memorysmithapp-site/compare/v0.3.1...HEAD
[0.3.1]: https://github.com/memorysmithapp/memorysmithapp-site/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/memorysmithapp/memorysmithapp-site/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/memorysmithapp/memorysmithapp-site/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/memorysmithapp/memorysmithapp-site/releases/tag/v0.1.0
