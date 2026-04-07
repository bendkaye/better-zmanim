# Feature Planning

Analyze the Better Zmanim codebase and create a detailed implementation plan for:

$ARGUMENTS

## Requirements
1. Enter Plan mode (Shift+Tab if not already)
2. Read all relevant existing code before planning — especially:
   - packages/shared/src/ for existing types and hooks
   - The relevant app directory (apps/web, apps/mobile, or apps/api)
   - CLAUDE.md files for conventions
3. Produce a numbered task list where each task:
   - Has a clear description (1-2 sentences)
   - Lists exact file paths to create or modify
   - Includes the complete test to write FIRST (TDD)
   - Includes the minimal implementation to pass the test
   - Specifies the git commit message (conventional commits)
   - Takes 2-5 minutes to execute
4. If the feature touches both web and mobile:
   - Shared logic tasks come FIRST (packages/shared)
   - Web implementation tasks come SECOND
   - Mobile implementation tasks come THIRD
5. Include a "Pre-flight checklist" at the top:
   - [ ] Branch created from develop
   - [ ] No uncommitted changes
   - [ ] All existing tests pass (`pnpm test`)
   - [ ] TypeScript compiles (`pnpm typecheck`)
6. Include a "Post-flight checklist" at the bottom:
   - [ ] All new tests pass
   - [ ] All existing tests still pass
   - [ ] TypeScript compiles with no errors
   - [ ] Linting passes
   - [ ] Changes reviewed with /project:review