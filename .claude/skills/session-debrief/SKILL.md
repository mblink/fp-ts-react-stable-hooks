---
name: session-debrief
description: End-of-session retrospective that promotes durable learnings into the repo; use when wrapping up a task, before committing, or when the human asks what should be saved. Companion to `finishing-a-development-branch` (wrap-up).
---

# Session Debrief

Before declaring a non-trivial session done (or when asked what to save), capture what the next person on this codebase would need; skip for one-line fixes. Candidates: a user correction revealing an unstated rule, a repeated workflow, a topic no skill covered, a tooling footgun, a compatibility gotcha (an fp-ts or React API missing at the peer floor), a repeated error class.

## Where findings go (in order)

0. **The tool itself** — a rule ESLint, `tsconfig` or a test can decide belongs there, not in prose. Prefer reshaping the types so breaking the rule can't be expressed (`cdd`); a check that rejects bad input is the fallback.
1. **Existing skill** (`.claude/skills/<name>/SKILL.md`) — the default for judgment calls; extend, don't create.
2. **New skill** — only for an uncovered topic big enough to stand alone; link it from the closest existing skill.
3. **`CLAUDE.md`** — cross-cutting workflow rules.
4. **Personal memory** — only person-specific facts, never codebase facts.

## Workflow

1. List candidates, each citing the moment it came up, with a target file (or skip).
2. Ask which to apply — never write shared skills or `CLAUDE.md` unconfirmed.
3. Apply each as a concise rule plus, where useful, a one-clause why and an example, matching the surrounding style. Quote the exact failure, not a vague warning.
4. Point at code by path and symbol (`useEqMemoize` in `src/useEqMemoize.ts`), never `file:line`: line numbers go stale. State each fact once, in the most specific place that owns it, and link to it from elsewhere.
