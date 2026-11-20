---
name: finishing-a-development-branch
description: Wrap up completed work with a summary and suggested commit message, plus diff hygiene, release/version notes and reading PR review feedback; use when work is done — never commit, push, publish, or open PRs without explicit human instruction.
---

# Finishing a Development Branch

1. **Verify** per `verification-before-completion`.
2. **Debrief** via `session-debrief`; the human decides before the commit.
3. **Summarize**: what was done, files created/modified/deleted, a suggested commit message (short imperative subject, matching `git log`).
4. **Wait.** Don't commit, stage, push, open PRs, or `npm publish`; the human handles git and releases.

## Release notes for this package

- A change to the public API or behaviour bumps `version` in `package.json` in the same change (patch: fix; minor: new hook or option; major: signature break or peer-range raise).
- `CHANGELOG.md` gets an entry under the new version (Fixed / Added / Breaking / Internal).
- README updated alongside: API table, examples, the `exhaustive-deps` regex, the options table for `StableHookOptions` changes.
- `dist/` is build output and is not committed; `package-lock.json` is committed with the dependency change that produced it.

## Diff hygiene before handing off

- One concern per change: dependency bumps, formatting and renames go in their own commit.
- No whitespace-only or reformatted lines outside the change, no leftover `console.*` (beyond the `debug` log), commented-out code, dead imports, or unrelated lockfile churn.
- A deferred follow-up gets a GitHub issue referenced in the PR, not a bare `TODO`.

## Reading PR review feedback

Read all three endpoints and state the item count (a `CHANGES_REQUESTED` rationale is usually in the review body):

```bash
gh api repos/{owner}/{repo}/pulls/<N>/comments --paginate    # inline
gh api repos/{owner}/{repo}/pulls/<N>/reviews --paginate     # review bodies (most often missed)
gh api repos/{owner}/{repo}/issues/<N>/comments --paginate   # conversation
```

Thread resolution is GraphQL-only (`reviewThreads { nodes { isResolved isOutdated path line } }` on the pull request). `isOutdated` means the code moved, not that the point was addressed — re-read each against current code.

Replying, resolving and reviewing: `posting-as-a-human`.
