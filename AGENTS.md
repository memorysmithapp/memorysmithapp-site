# AGENTS.md

How an agent works in this repository. `.claude/CLAUDE.md` imports this file, so it is loaded whole in every session and every sub-agent: it stays short and points at sections of the other documents instead of repeating them.

## 1. Identity

- **Name:** `memorysmithapp-site`.
- **Purpose:** the website of MemorySmith, served at `www.memorysmith.app`: the showcase that presents the product.
- **Organisation:** [`memorysmithapp`](https://github.com/memorysmithapp).
- **Licence:** MIT, public repository.
- **Version:** the `version` field of the root `package.json`, and nowhere else.

## 2. Reading map

Read in this order; open a document at the section that answers the question in hand, not whole.

| Question | Where |
|---|---|
| What is this and how do I start? | [`README.md`](README.md) |
| What does the product solve and deliver, and under which rule? | [`PRD.md`](docs/PRD.md), the rules in [§7](docs/PRD.md#7-features-and-rules) |
| How is it organised, and why? | [`ARCHITECTURE.md`](docs/ARCHITECTURE.md), the invariants in [§3](docs/ARCHITECTURE.md#3-invariants-and-their-mechanisms), the decisions in [§6](docs/ARCHITECTURE.md#6-architecture-decision-records) |
| How does a change travel to `main` and to a release? | [`SDLC.md`](docs/SDLC.md) |
| What changed, and when? | [`CHANGELOG.md`](CHANGELOG.md) and the git history |
| What is planned, undecided or at risk? | The issues and milestones on GitHub, never a document |

## 3. Writing map

Each fact has one home. When a paragraph seems to fit two documents it goes into exactly one, and the other references it by section.

| The paragraph says… | It belongs to… |
|---|---|
| What the product solves, for whom, a business rule, a term of the ubiquitous language, a quality requirement | `PRD.md` |
| How the code or the repository is organised, a dependency, an integration, the mechanism of an invariant, a technical decision and its reason | `ARCHITECTURE.md` (a decision becomes an ADR) |
| How a change reaches `main` or a release: issues, branches, commits, PRs, review, versioning, rollback | `SDLC.md` |
| How to install, run or start using it | `README.md` |
| A rule an agent must not break, a verified command, the checklist before done | `AGENTS.md`, one line pointing at the home of its reason |
| What changed in a version | `CHANGELOG.md` |
| **Boundary:** "this changes the code" | `ARCHITECTURE.md`, even when it also changes how work flows |
| **Boundary:** "this changes the path to `main`" | `SDLC.md`, even when a workflow file implements it |
| **Boundary:** "this is why we chose it" | The ADR in `ARCHITECTURE.md`; `PRD.md` states the rule, not the history |
| **Boundary:** a rule that holds and is enforced | The rule in `PRD.md`, its enforcement in `ARCHITECTURE.md`, its one-line limit or invariant here |
| **Last row, absolute:** a hypothesis, the roadmap, an open risk, an undecided question, anything about the future | An issue, never a document |

## 4. Limits

One line each; the reason lives where the link points.

- `main` is protected: every change reaches it through a pull request. Never push to `main`; never use `--admin`, *Bypass rules*, `--no-verify` or an equivalent ([SDLC §1](docs/SDLC.md#1-the-life-cycle-of-a-change)).
- A blocked merge means **stop and report**, never work around it ([SDLC §7](docs/SDLC.md#7-a-blocked-merge)).
- An issue before implementing. An opinion asked for, or "open the issue", means register and ask; implement only on an explicit go-ahead from the owner, which puts the issue in a milestone ([SDLC §2](docs/SDLC.md#2-issues-and-milestones)).
- A gap that reaches other repositories of the organization is registered at its origin, with a sub-issue in each repository it reaches, without asking whether to open them ([SDLC §2](docs/SDLC.md#2-issues-and-milestones)).
- Anything delivered or published lands on the `release/vX.Y.Z` of its issue's milestone, never on `main` from a `feat/` or `fix/` branch ([SDLC §3](docs/SDLC.md#3-branches)).
- Nobody tags by hand: tags and Releases are written by the release workflow ([SDLC §10](docs/SDLC.md#10-release)).
- A document never describes the future: if it is in a document, it is true now ([SDLC §2](docs/SDLC.md#2-issues-and-milestones)).
- No version notes, revision dates or "internal document" footers inside documents; history lives in `CHANGELOG.md` and git ([SDLC §4](docs/SDLC.md#4-commits)).
- Everything is written in American English (en-US): documents, code, comments, commits, branches, issue and PR text.
- Create or delete a GitHub repository, or change a ruleset or a branch protection, only with the owner's go-ahead in the session.

## 5. Invariants

- **INV-01** The version has exactly one home, the root `package.json`, and `CHANGELOG.md` agrees with it ([mechanism](docs/ARCHITECTURE.md#inv-01-the-version-has-one-home)).
- **INV-02** `.claude/CLAUDE.md` is exactly `@../AGENTS.md` and nothing else, and no `CLAUDE.md` sits at the root ([mechanism](docs/ARCHITECTURE.md#inv-02-claudemd-is-only-the-import)).
- **INV-03** `main` changes only through a pull request, merged by a maintainer ([mechanism](docs/ARCHITECTURE.md#inv-03-main-changes-only-through-a-pull-request)).
- **INV-04** Only the release workflow writes a tag, and a version names one commit ([mechanism](docs/ARCHITECTURE.md#inv-04-only-the-release-workflow-writes-a-tag)).
- **INV-05** The documents keep their form: the changelog's format, links and anchors that resolve, no version footers ([mechanism](docs/ARCHITECTURE.md#inv-05-the-documents-keep-their-form)).

## 6. Verified commands

Each command with the directory it runs in, what it does, and the date somebody last ran it and saw it work. A command nobody ran is never listed.

| Command | Run in | What it does | Last verified |
|---|---|---|---|
| `scripts/setup-repo.sh <owner>/<repo> "<description>" <topic>[,<topic>...]` | The root | Applies the description, topics, merge options, wiki and discussions off, the ruleset `main`, write for the team `maintainers`, and the branch protection of `main`; idempotent | 2026-11-20, at this repository's creation: it stopped before the branch protection of `main` (#1), which a copy carrying the fix proposed in memorysmithapp/memorysmithapp-template#46 then created, finding everything else in place |
| `pnpm run quality` | The root | Runs the checks of the workflow *Quality* ([SDLC §8](docs/SDLC.md#8-tests-and-review)); exit 1 and the failing lines when one fails | 2026-11-20 |
| `pnpm test` | The root | Runs the tests of the checks, each against a deliberate violation | 2026-11-20 |

## 7. Before calling something done

- [ ] The issue's "Done when" holds, checked the way a person would use the change, not only by a green suite ([SDLC §12](docs/SDLC.md#12-done-criteria)).
- [ ] `CHANGELOG.md` has the entry under `[Unreleased]`, in the same commit as the change.
- [ ] Every document the change touches is updated in the same commit ([SDLC §4.1](docs/SDLC.md#41-when-a-commit-touches-each-document)).
- [ ] `.gitignore` was assessed for every file or directory created, moved or deleted; no sensitive file is left untracked without an entry.
- [ ] The commit is on the branch of the cycle ([SDLC §3](docs/SDLC.md#3-branches)), pushed, and the CI of the branch is green.
- [ ] The issue, in its milestone, is closed as `completed`, with a comment naming the commit ([SDLC §5](docs/SDLC.md#5-when-an-issue-closes)).
