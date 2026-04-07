# Prepare Release

1. Ensure we're on the develop branch with no uncommitted changes
2. Run the full CI suite locally: lint, test, typecheck, build
3. Delegate to the release-manager agent to:
   - Determine version from conventional commits
   - Generate changelog
   - Bump versions across all packages
4. Show me the full diff before committing
5. After I approve:
   - Create the commit
   - Show me the exact commands to push, create the GitHub release, and trigger EAS builds

$ARGUMENTS