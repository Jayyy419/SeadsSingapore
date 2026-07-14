@AGENTS.md

# Git workflow

Commit and push whenever a feature or bug fix is shipped and verified (typecheck/lint/build
green, and Playwright-verified for anything with a UI). Don't batch multiple unrelated features
into one big uncommitted pile — ship, verify, commit, push, repeat. Direct pushes to `main` are
blocked by branch protection; push to a feature branch and open a PR (merge it too, unless told
to leave it for review).
