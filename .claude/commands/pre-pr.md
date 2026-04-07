# Pre-PR Checklist

Run the complete validation suite before opening a PR:

1. **Type check**: `pnpm typecheck` — must pass with 0 errors
2. **Lint**: `pnpm lint` — must pass with 0 warnings
3. **Unit tests**: `pnpm test` — must pass, coverage ≥ 80%
4. **Build (web)**: `pnpm --filter @better-zmanim/web build` — must succeed
5. **Build (api)**: `pnpm --filter @better-zmanim/api build` — must succeed
6. **Security scan**: Grep for hardcoded secrets, TODO/FIXME, console.log
7. **Shared boundary check**: Verify no imports cross between apps/web and apps/mobile
8. **Conventional commits**: Verify all commits follow conventional format
9. **Diff review**: `git diff develop...HEAD` — review every change

If ALL pass, output:
✅ Ready for PR — run `gh pr create --base develop --fill`

If ANY fail, list failures with remediation steps.
Do NOT open the PR until everything passes.