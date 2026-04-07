# Development Guide

How to build a feature from idea to release using the full Claude Code toolchain.

## Prerequisites

Make sure these are running before you start:

```bash
# MCP servers (configured in .claude/settings.json)
# - Playwright: E2E browser testing
# - Context7: semantic codebase search + library docs
# - Cloudflare: Workers/KV/Pages API access (OAuth, no keys needed)

# Verify MCP servers are connected
claude mcp list
```

## The Lifecycle: Plan > Execute > Test > Review > Deploy > Release

Every feature follows this cycle. Each feature is one Claude Code session.

---

### 1. Branch

```bash
git checkout develop && git pull
git checkout -b feature/short-description
```

### 2. Brainstorm

Start with divergent thinking -- no code, just design exploration.

```
/brainstorm design [your feature description]
```

Claude explores trade-offs, edge cases, and alternatives. Fork into tangents as needed. When satisfied, finalize the brainstorm.

### 3. Plan

Enter Plan mode and describe what you want. The plan skill produces a numbered task list where each task has:

- Exact file paths to create or modify
- The test to write first (TDD)
- The minimal implementation to pass it
- A conventional commit message

```
/plan [feature description with requirements]
```

Review the plan. Approve, reject, or annotate individual tasks before execution begins.

### 4. Execute

Approve the plan and Claude works through tasks sequentially. For each task:

1. **Write the failing test** (TDD red phase)
2. **Write the implementation** (TDD green phase)
3. **Commit** with a conventional message

Hooks fire automatically on every file write:

- **Prettier** formats the file
- **tsc** type-checks (TypeScript files)
- **ESLint** lints (TypeScript files)

If a hook fails, Claude sees the error and fixes it in the same turn.

#### Delegating to subagents

For complex or parallelizable work, delegate to specialized agents:

| Agent               | Purpose                   | When to use                                               |
| ------------------- | ------------------------- | --------------------------------------------------------- |
| `test-writer`       | Comprehensive test suites | Coverage gaps, edge-heavy modules like zmanim computation |
| `security-reviewer` | Security analysis         | Before any PR (runs as part of `/review`)                 |
| `release-manager`   | Version bumps + changelog | Release prep                                              |

```
# Example: delegate test writing
> Delegate to the test-writer agent: write comprehensive tests for
> apps/api/src/lib/compute.ts covering polar regions, DST, and date line edge cases.
```

#### Build order for shared features

If a feature touches both web and mobile:

1. **packages/shared** first (types, hooks, API client)
2. **apps/web** second
3. **apps/mobile** third

Never duplicate logic between web and mobile -- extract to packages/shared.

### 5. Test

TDD covers most testing during execution. This step fills gaps.

```bash
# Check coverage
/test-coverage

# Run full suite
pnpm test

# E2E (web) -- uses Playwright MCP server
# Claude can run browser tests against your local dev server
pnpm dev  # start the dev server first
```

### 6. Review + PR

```bash
# Gate check -- must pass before opening a PR
/pre-pr
```

This runs: typecheck, lint, tests, both builds, security scan, commit format check, and diff review.

If everything passes:

```bash
gh pr create --base develop --fill
```

The `claude-review.yml` workflow triggers automatically. Claude reviews the diff and posts comments. You can also ask it questions:

```
@claude review the error handling in the geocode endpoint
```

### 7. Merge

After CI passes and review is approved:

```bash
gh pr merge --squash
```

This auto-deploys to staging via the `deploy-web.yml` workflow (API worker + web app).

### 8. Verify staging

```bash
/deploy-check staging
```

### 9. Release

When ready to cut a release:

```bash
/release
```

The release-manager agent:

1. Determines version bump from conventional commits
2. Generates CHANGELOG entry
3. Bumps versions across all packages
4. Shows the diff for your approval
5. Gives you the exact commands to push and publish

```bash
# After approval
git push origin develop
gh release create v1.x.x --title "v1.x.x" --notes-file RELEASE_NOTES.md
```

Production deploy triggers automatically on release publish.

#### Mobile releases

```bash
cd apps/mobile
eas build --platform all --profile production
eas submit --platform all
```

Or trigger via GitHub Actions: Actions > Mobile Build > Run workflow.

---

## Quick Reference

| Command          | What it does                        |
| ---------------- | ----------------------------------- |
| `pnpm dev`       | Start web + API dev servers         |
| `pnpm test`      | Run unit tests                      |
| `pnpm lint`      | Lint all packages                   |
| `pnpm typecheck` | Type-check all packages             |
| `/plan [desc]`   | Plan a feature                      |
| `/pre-pr`        | Run pre-PR gate checks              |
| `/test-coverage` | Analyze and fill test coverage gaps |
| `/review`        | Review current branch changes       |
| `/release`       | Prepare a release                   |
| `/deploy-check`  | Verify a deployment                 |

## Rules to Live By

- **TDD**: Write the failing test first, then implement.
- **No `any`**: Strict TypeScript, no escape hatches without a comment.
- **No duplication**: Shared logic goes in packages/shared.
- **Conventional commits**: `feat:`, `fix:`, `chore:`, `docs:`.
- **Never push to main or develop directly**: Always go through a PR.
- **Update CLAUDE.md**: Every time Claude gets something wrong, add the correction.
