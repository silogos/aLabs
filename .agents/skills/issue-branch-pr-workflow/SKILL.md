---
name: issue-branch-pr-workflow
description: End-to-end workflow for shipping a code change through a GitHub issue → feature branch → implementation → PR to main. Use whenever the user asks to implement, fix, or add a feature AND wants it tracked as an issue with a PR — phrases like "create issue, branch, PR", "write it in an issue then fix", "do X then PR to main", "add it to the backlog then implement", or any request that implies the full issue-to-PR lifecycle. Also use when the user says "what's next" and you and the user agree on a follow-up item to implement with a PR.
---

# Issue → Branch → PR Workflow

Ship a code change through the full lifecycle: GitHub issue first, feature branch off `origin/main`, implement, typecheck, push, PR to main that closes the issue.

## When to Use

- User asks to implement/fix something AND wants issue tracking + a PR.
- User says "create issue, create branch, create PR" or equivalent.
- User says "what's next", you agree on a follow-up, and the item involves code changes.
- User asks to "add it to tech debt then implement" — issue first, then implement.

## When NOT to Use

- Pure research / exploration / "explain X" — no code change, no PR needed.
- User explicitly says to just make a change directly without issue/PR ceremony.
- Creating a tech-debt issue that is NOT being implemented now (just the issue, no PR).

## Workflow Steps

### 1. Create the GitHub Issue

Write the issue **before** any code. This is the single source of truth for what the PR will deliver.

```bash
gh issue create \
  --title "<conventional-commit-style title>" \
  --label "<bug|enhancement|tech-debt>" \
  --assignee "@me" \
  --body "<issue body>"
```

**All GitHub metadata fields must be populated — none left blank:**

| Flag | Required | Value |
|------|----------|-------|
| `--title` | always | conventional-commit format (`<type>(<scope>): <description>`) |
| `--label` | always | one of: `bug`, `enhancement`, `tech-debt`. Add `documentation` if docs-only. |
| `--assignee` | always | `@me` (self-assign). Add other logins if relevant. |
| `--milestone` | if any open milestone exists | milestone title. Run `gh api repos/{owner}/{repo}/milestones --jq '.[].title'` first; if open milestones exist, pick the current one. If none exist, skip. |
| `--project` | if project board exists | project title. Run `gh project list` first; if accessible, pick the relevant board. If no access or none exist, skip. |
| `--body` | always | issue body (structure below) |

**Body content sections can be "None" if genuinely not needed — but the section header must still appear. Never omit a section.**

**Required fields — none may be empty:**

- `--title` — conventional-commit style (`<type>(<scope>): <description>`). Never blank, never a placeholder.
- `--label` — must be exactly one: `bug`, `enhancement`, or `tech-debt`. Choose based on change type.
- `--body` — must contain all four sections below. If any section has no content, write "None" — do not omit the section header.

**Issue body structure (all four sections required):**

```markdown
## Problem
<1-2 sentences — what's wrong or what's needed. Never blank.>

## Approach
<2-4 sentences — the implementation strategy. Never blank.>

## Tasks
- [ ] Task 1
- [ ] Task 2
- [ ] <at least one task. Every implementation step that touches code gets a checkbox.>

## Out of scope
- <anything explicitly not covered. If truly nothing, write "None".>
```

**Capture the issue number** from `gh issue create` output — the PR will close it with `Closes #NN`.

### 2. Create a Feature Branch off `origin/main`

Local `main` is often stale (unpushed commits, diverges from remote). **Always branch off `origin/main`, not local `main`:**

```bash
git fetch origin main
git checkout -b <type>/<kebab-slug> origin/main
```

**Branch naming:** `<type>/<short-slug>` where type is `feat`, `fix`, `refactor`, `chore`, matching the PR title prefix. Examples: `feat/dashboard-real-trends`, `fix/google-signin-error-handling`, `refactor/auth-middleware`.

### 3. Implement the Change

Make the code changes. Follow existing patterns in the codebase — match naming, style, and conventions of surrounding code.

**Commit with conventional commit messages:**

```
<type>(<scope>): <imperative description>
```

Examples: `feat(api): record actor_id on task status transitions`, `fix(auth): improve Google sign-in error handling`.

Multiple commits are fine if the change has logical stages (e.g., schema → hook → dashboard). Each commit should typecheck on its own.

### 4. Typecheck

Before pushing, verify the build:

```bash
pnpm -r typecheck
```

Or scope to the changed packages:

```bash
pnpm --filter @pmin/core typecheck && pnpm --filter @pmin/api typecheck && pnpm --filter @pmin/web typecheck
```

Fix any errors before proceeding.

### 5. Push the Branch

```bash
git push -u origin <branch-name>
```

### 6. Create the PR

```bash
gh pr create \
  --base main \
  --head <branch-name> \
  --title "<conventional-commit title>" \
  --label "<bug|enhancement|tech-debt>" \
  --assignee "@me" \
  --body "<PR body>"
```

**All GitHub metadata fields must be populated — none left blank:**

| Flag | Required | Value |
|------|----------|-------|
| `--title` | always | conventional-commit format |
| `--head` | always | the pushed branch name |
| `--base` | always | `main` |
| `--label` | always | same label as the issue (`bug`/`enhancement`/`tech-debt`) |
| `--assignee` | always | `@me`. Add other logins if relevant. |
| `--reviewer` | if team exists | request review from relevant team/member. Run `gh api repos/{owner}/{repo}/collaborators --jq '.[].login'` to check; if none beyond yourself, skip. |
| `--milestone` | if issue had one | match the issue's milestone |
| `--project` | if issue had one | match the issue's project board |
| `--body` | always | PR body (structure below) |

**Required fields — none may be empty:**

- `--title` — conventional-commit style (`<type>(<scope>): <description>`). Never blank, never a placeholder.
- `--head` — branch name, matches the branch you pushed.
- `--base main` — always main, never blank.
- `--body` — must contain all four sections below. If any section has no content, write "None" — do not omit the section header.

**PR body structure (all four sections required):**

```markdown
Closes #<issue-number>

## Summary
<1-2 sentences — what changed and why. Never blank.>

## Changes
- <bullet list — every meaningful code change gets a bullet. At least one bullet required.>

## Verification
- `pnpm -r typecheck` ✅
- <list every verification step actually performed: runtime checks, DB queries, manual smoke tests, script runs. If only typecheck was done, state that explicitly. Never fabricate a check you didn't run.>
```

The `Closes #NN` line auto-closes the issue when the PR merges. `#NN` must match the issue number created in step 1 — verify before submitting.

**Pre-submit checklist — verify every field is filled before running `gh pr create`:**

- [ ] `--title` is non-empty, conventional-commit format
- [ ] `--head` matches the pushed branch name
- [ ] `--base` is `main`
- [ ] `--body` has `Closes #NN` with a real issue number
- [ ] `--body` has Summary with content
- [ ] `--body` has Changes with ≥1 bullet
- [ ] `--body` has Verification listing checks actually performed

## Key Rules

1. **Issue before code.** The issue defines scope; the PR delivers it. Never reverse this order.
2. **Branch off `origin/main`, never local `main`.** Local main goes stale.
3. **Conventional commits everywhere.** Issue titles, branch names, commit messages, PR titles all use `<type>/<scope>: <description>`.
4. **Typecheck before push.** Don't push broken code.
5. **PR closes the issue.** Include `Closes #NN` in the PR body.
6. **Don't merge your own PR.** Leave it for review unless the user explicitly asks to merge.
7. **Bash tool space-before-digit bug:** When a digit immediately follows a word in a Bash command, the space gets stripped (`gh issue view14` → `gh issue view14`). Workaround: quote numeric args (`gh issue view "14"`) or avoid spaces before digits.
8. **All fields required — no empty fields.** Before running `gh issue create` or `gh pr create`, mentally (or explicitly via a checklist) verify every flag and body section has real content. If a section genuinely has nothing to say, write "None" — never leave a section header dangling or omit it. Never fabricate verification steps.

## Pre-Submission Checklists

Run these before each creation command. If any item fails, fix it first.

### Issue — before `gh issue create`
- [ ] `--title` non-empty, conventional-commit format
- [ ] `--label` is one of `bug`, `enhancement`, `tech-debt`
- [ ] `--assignee` is `@me` (at minimum)
- [ ] `--milestone` set if any open milestone exists (checked via `gh api .../milestones`)
- [ ] `--project` set if project board accessible (checked via `gh project list`)
- [ ] `--body` Problem section has 1-2 sentences
- [ ] `--body` Approach section has 2-4 sentences
- [ ] `--body` Tasks section has ≥1 checkbox
- [ ] `--body` Out of scope section present (write "None" if empty)

### PR — before `gh pr create`
- [ ] `--title` non-empty, conventional-commit format
- [ ] `--head` matches pushed branch name
- [ ] `--base` is `main`
- [ ] `--label` matches the issue's label
- [ ] `--assignee` is `@me` (at minimum)
- [ ] `--reviewer` set if collaborators beyond self exist
- [ ] `--milestone` set if issue had one
- [ ] `--project` set if issue had one
- [ ] `--body` `Closes #NN` with correct issue number
- [ ] `--body` Summary has 1-2 sentences
- [ ] `--body` Changes has ≥1 bullet
- [ ] `--body` Verification lists checks actually performed (never fabricated)

## Tech-Debt Variant

When the user says "add X to tech debt" or "write the issue first, implement later":

1. Create the issue with label `tech-debt` — **stop there**.
2. Do NOT create a branch or PR until the user explicitly asks to implement it.

The full workflow (issue → branch → PR) only applies when the user wants implementation now.
