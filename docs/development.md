# Development

This guide explains how to set up and work on the FUXA-AI-Gateway codebase.

## Prerequisites

- Node.js 22+
- npm

## Setup

```bash
npm ci
```

## Scripts

| Script                  | Description                    |
| ----------------------- | ------------------------------ |
| `npm run build`         | Compile TypeScript             |
| `npm start`             | Run the built server           |
| `npm run dev`           | Run in development with `tsx`  |
| `npm test`              | Run the test suite             |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint`          | Run ESLint                     |
| `npm run format`        | Format code with Prettier      |
| `npm run format:check`  | Check formatting               |

## Project Structure

```
src/
  adapters/fuxa/   FUXA REST client
  analytics/       History statistics and anomaly detection
  monitoring/      Metrics
  prompts/         MCP prompts
  security/        Policy, audit, approval
  semantic/        Industrial model and device graph
  services/        Business logic
  server.ts        MCP server
tests/             Unit and integration tests
docs/              Documentation
docker/            Container and Grafana assets
```

## Code Quality

- TypeScript strict mode is enforced.
- ESLint and Prettier must pass.
- Unit test coverage must be at least 80%.

## Workflow

This project follows issue-driven development. Each change:

1. Starts from an issue.
2. Is developed on a feature branch (`feature/V1.0.x-description`).
3. Is written test-first.
4. Is merged via a reviewed pull request.

See `CONTRIBUTING.md` for details.
