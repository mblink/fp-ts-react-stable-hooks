---
name: posting-as-a-human
description: Marking a post as Claude's when it goes out through a person's GitHub account (PR/review comments, issue replies) and which actions are never yours to take on their behalf; use before posting any comment or reply through a human's identity.
---

# Posting as a human

`gh` posts as the person; readers can't tell the words are yours, so say so.

## The byline

One italic line first, a blank line, then the reply:

```markdown
_Claude, on @<login>'s behalf._

`useEqMemoize` only bumps the counter when `eq` reports a change, so an `Eq` that compares by
reference will still fire on every render with freshly built deps.
```

- Name the account actually posting (`gh api user --jq .login`).
- Leading, not trailing (previews show the first line), once per post, in italics — not a code block or blockquote.
- Nothing else in it: no disclaimers, model/session details, narration, emoji, or banners.

## The reply

- An ordinary engineering comment, three or four sentences; no apologies or unrequested offers. Answer what was asked; side findings go to the terminal.
- One claim, one source (`file:line` or SHA); no narration of how you checked.
- Follow-ups edit the existing comment (`gh api --method PATCH repos/{owner}/{repo}/pulls/comments/{id} -f body=…`), with no "correcting my earlier reply" preamble.
- First person means you. State what you ran ("`npm run prepublishOnly` passes on this branch"), never the human's judgement ("looks good to me", "we'll release it next week"); write "That's @<login>'s call — flagging it for them." Never commit them to a position, priority, deadline, or scope.

## Never on someone's behalf, byline or not

- A review verdict (`gh pr review --approve` / `--request-changes`). Comments are fine when asked, each inline comment carrying its own byline.
- Merging, or `npm publish`.
- Closing someone else's issue/PR, or resolving any review thread without the human's explicit instruction — resolution is the reviewer's signal.

## No byline

Commits, PR descriptions, code, files.
