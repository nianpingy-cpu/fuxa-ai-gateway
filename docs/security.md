# Security

Industrial systems are safety-critical. FUXA-AI-Gateway is read-only by default and enforces
multiple layers of protection.

## Read-Only by Default

- Every tool is read-only.
- Write operations are disabled unless explicitly enabled and approved.
- There is no direct model-to-PLC write path.

## Permission Layer

The `PolicyService` checks every tool action:

- Read actions are allowed by default.
- Write actions are rejected unless explicitly enabled.

## Approval Workflow

The `ApprovalService` gates any future safe-write operation:

- Writes are disabled by default.
- A write requires permission, an explicit approver, and an audit trail.

## Audit Log

The `AuditLog` records every policy decision for traceability. It never stores sensitive data:
passwords, API keys, tokens, and authorization details are redacted.

## Authentication

The FUXA adapter supports API Key and JWT authentication. Credentials are read from environment
variables only and are never logged.

## Secret Handling

- No secrets are baked into the image or repository.
- Secrets are supplied at runtime via environment variables.
- `.env` files are excluded from the build context.
- The runtime container runs as a non-root user.

## Safe by Design

- Tool descriptions clearly state their function and read-only nature.
- Analytics return aggregated summaries, never raw firehoses of data.
- The gateway returns `SCADA unavailable` rather than crashing when FUXA is offline.
