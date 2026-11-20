# Changelog

All notable changes to this repository are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this repository adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `memorysmithapp-site-infra`, the CDK app of the website: a private S3 bucket behind CloudFront with Origin Access Control, the release of the frontend's build and of `/config.json` with the version it serves, and the role GitHub Actions delivers production with, through OIDC (#6).
- `memorysmithapp-site-frontend`, the website, with Vite, React and TypeScript: one page that says it is under construction, points at `memorysmith.app`, and shows the version it serves, read from `/config.json` (#7).

### Changed

- The repository adopts `memorysmithapp-template` v0.5.1: `AGENTS.md`, `README.md` and `package.json` name `memorysmithapp-site`; `docs/PRD.md` and `docs/ARCHITECTURE.md` keep their skeletons and the description of the parts kept; the version restarts at `0.1.0` and the changelog names this repository (#2).

[unreleased]: https://github.com/memorysmithapp/memorysmithapp-site/commits/main
