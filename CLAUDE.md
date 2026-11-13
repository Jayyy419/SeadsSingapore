@AGENTS.md

# Git workflow

Commit and push whenever a feature or bug fix is shipped and verified (typecheck/lint/build
green, and Playwright-verified for anything with a UI). Don't batch multiple unrelated features
into one big uncommitted pile — ship, verify, commit, push, repeat. Direct pushes to `main` are
blocked by branch protection; push to a feature branch and open a PR (merge it too, unless told
to leave it for review).

# AWS resources

Tag every AWS resource you create `Project=SeadsSingapore` and `Environment=Production`, at creation
time. The `seads-monthly-budget` only counts resources tagged `Project=SeadsSingapore`, and the AWS
account is shared with other projects, so an untagged resource is cost nobody is tracking.
