# Code Review

Review the current branch's changes against develop:

$ARGUMENTS

1. Run `git diff develop...HEAD --stat` to see changed files
2. For each changed file, review for:
   - Correctness: Does the logic do what the task intended?
   - Types: Are types precise (no `any`, no unnecessary casts)?
   - Tests: Is the new/changed code tested?
   - Conventions: Does it follow CLAUDE.md rules?
   - Performance: Are there unnecessary re-renders, missing memoization?
   - Zmanim accuracy: Are calculations delegated to KosherZmanim (not hand-rolled)?
3. Delegate to the security-reviewer agent for security analysis
4. Report findings as:
   - 🔴 Must fix before merge
   - 🟡 Should fix, not blocking
   - 🟢 Nice to have