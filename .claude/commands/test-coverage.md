# Test Coverage Analysis

Run the full test suite with coverage and analyze gaps:

1. Run `pnpm test -- --coverage --reporter=json`
2. Identify files with less than 80% line coverage
3. For each under-covered file:
   - List which functions/branches are uncovered
   - Generate the missing tests using TDD
   - Run tests to verify they pass
4. Pay special attention to:
   - apps/api/src/lib/compute.ts (zmanim calculations — needs exhaustive coverage)
   - packages/shared/src/hooks/ (all hooks need full coverage)
   - Edge cases: DST transitions, polar regions, date line
5. Report final coverage numbers
6. If overall coverage < 80%, flag as blocking for PR