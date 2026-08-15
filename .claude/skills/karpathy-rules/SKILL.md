---
name: karpathy-rules
description: Use before writing or editing ANY code in this repository — every bug fix, feature, or refactor, not just when someone says "Karpathy" or "rules". Encodes Andrej Karpathy's pragmatic engineering principles for working with an AI coding agent, distilled from his public commentary on AI-assisted coding and the nanoGPT design philosophy: think before coding, keep changes minimal and surgical, avoid premature abstraction, and define verifiable "done" criteria before starting.
---

# Karpathy Programming Rules

Pragmatic rules for AI-assisted coding, distilled from Andrej Karpathy's public
writing on software engineering (his commentary on AI coding agents, and the
nanoGPT/nanoChat design philosophy of small, readable, single-purpose code).
Optimize for clear reasoning, small diffs, local style, and verifiable
progress — not for cleverness.

## 1. Think before coding

- State your interpretation of the task and surface assumptions before touching code.
- If something is genuinely unclear, stop and name what's unclear rather than guessing through it — ask instead of guessing.
- Name meaningful tradeoffs out loud when a choice isn't obvious.

## 2. Simplicity first

- Implement the smallest thing that satisfies the current request. Do not add unrequested features.
- No abstractions for single-use / single-caller code — three similar lines beat a premature helper.
- No configurability, flags, or generality before there is a real, current need for it.
- Don't introduce a new dependency when the existing code can express the logic simply.
- Prefer the direct implementation over new architecture: solve today's problem, don't accidentally design tomorrow's system.

## 3. Surgical changes

- Touch only the files and lines the request actually requires.
- Match local code style even where you'd personally do it differently.
- Every changed line should trace back to the actual request — no drive-by cleanups, renames, or refactors bundled into an unrelated change.

## 4. Goal-driven execution — define "done" before starting

- Turn the request into a checkable outcome before you start, not after.
- Prefer verification over instruction-following: e.g. write a test that reproduces the bug, then make it pass — rather than just changing code until it "looks right".
- Don't call something done without having actually verified it (run it, test it, check the output) — see the `run` skill in this environment for driving the app to confirm a change works.

## 5. Repo hygiene

- Checkpoint commits are verified milestones, not saves-in-progress — commit working states.
- No mass-deletion or wildcard cleanup commands; deletions need explicit, named paths.
- No force-push, history rewrite, or other repo-admin operations without explicit permission.

## Why this matters here

This repo's `CLAUDE.md` already carries several of these instincts (direct-to-main
workflow, no unnecessary process). This skill exists so the same discipline
applies inside a single task too: don't over-engineer a weather-app fix,
don't refactor beyond what was asked, and always define what "done" looks
like — including the "verify the deploy actually shipped" step `CLAUDE.md`
already requires — before calling a change complete.
