# PRD

What `memorysmithapp-site` solves and delivers, and under which rule: the website of MemorySmith, served at `www.memorysmith.app`, the showcase that presents the product.

Claims carry their status when it is not obvious: *observed* (seen in this repository or in GitHub), *declared* (said by the owner of the organisation), *inferred* (an interpretation to confirm). What was not verified is marked **To confirm**.

## 1. Problem

*Instruction: the pain the product removes, for whom, and how it shows today.*

## 2. Audience

*Instruction: who uses the product, and what each of them needs from it.*

## 3. Goals and scope

*Instruction: what the current version delivers, and what it deliberately does not.*

The website is one page that says it is under construction, points at the product at `memorysmith.app`, and shows the version it serves. It answers at `www.memorysmith.app`. It does not present the product yet.

## 4. Principles

*Instruction: the product principles behind the decisions, each in one sentence.*

## 5. Ubiquitous language

*Instruction: the terms of the product, each with the meaning it has here and nowhere else.*

## 6. Journeys

*Instruction: the paths a member of the audience follows through the product, step by step.*

## 7. Features and rules

*Instruction: what the product provides, as business rules with codes `RN-{AREA}-{NNN}`.*

Codes are append-only: never renumbered, never reused. A rule that stops holding stays on its own line, marked **Removed** with the version and the reason.

- **RN-SITE-001** The page shows the version it serves, as the release that published it names it, never as a build remembers it.

## 8. Quality requirements

*Instruction: the measurable qualities the product holds, each with its threshold.*

## 9. Acceptance criteria

*Instruction: how each rule is checked, by its code.*

- **RN-SITE-001** Served with a `/config.json` that names a version, the page shows `Version` followed by it; while that file is read, or when it cannot be, the page shows no version. Checked by the tests of `memorysmithapp-site-frontend` and by opening the page production serves.
