# Contributing to FUXA-AI-Gateway

Thank you for your interest in contributing. This project follows an issue-driven development
workflow. Please read this guide before opening a pull request.

## Development Workflow

Every change starts from an issue.

```
Issue
  ↓
Design
  ↓
Branch
  ↓
Test First
  ↓
Implementation
  ↓
Local Validation
  ↓
Commit
  ↓
Push
  ↓
Pull Request
  ↓
Review
  ↓
Merge
```

## Branching

- `main` — production branch.
- `develop` — integration branch.
- Feature branches: `feature/V1.0.x-description`
- Bug fix branches: `fix/V1.0.x-description`

Do not commit directly to `main` or `develop`.

## Commit Messages

Use conventional commits:

```
feat: implement fuxa api client
fix: handle scada unavailable state
test: add analyzer unit tests
docs: update deployment guide
refactor: extract policy service
chore: update dependencies
```

## Testing

- Write tests before implementation (test-first).
- Every issue must include unit tests, and where relevant integration and security tests.
- Unit test coverage must be at least 80%.
- Run the full suite before opening a pull request:

```bash
npm test
```

## Code Quality

- TypeScript strict mode.
- ESLint and Prettier must pass.
- No `any` where a concrete type is possible.
- Keep files focused; avoid oversized files and duplicated logic.

## Pull Requests

Each pull request must include:

- A reference to the related issue (`Fixes #<issue>`).
- A summary of the change.
- The technical changes made.
- The tests added and their results.
- A risk analysis.

## Review

All pull requests are reviewed for architecture, MCP compliance, security, testing,
documentation, and industrial reliability. Changes may be requested; address them and re-submit.

## Code of Conduct

Please follow our [Code of Conduct](CODE_OF_CONDUCT.md) in all interactions.
