/**
 * In-memory audit log. Records every policy decision for traceability without
 * ever storing sensitive data (passwords, API keys, etc.).
 */

export interface AuditEntry {
  timestamp: string;
  tool: string;
  action: string;
  allowed: boolean;
  detail?: string;
}

const SENSITIVE_PATTERNS = /(password|passwd|secret|api[_-]?key|token|authorization)/i;

export class AuditLog {
  private readonly log: AuditEntry[] = [];

  get entries(): readonly AuditEntry[] {
    return this.log;
  }

  record(entry: Omit<AuditEntry, 'timestamp'>): void {
    // Strip any sensitive-looking detail before storing.
    const safeDetail = entry.detail ? sanitize(entry.detail) : undefined;
    this.log.push({
      timestamp: new Date().toISOString(),
      tool: entry.tool,
      action: entry.action,
      allowed: entry.allowed,
      detail: safeDetail,
    });
  }
}

function sanitize(detail: string): string {
  if (SENSITIVE_PATTERNS.test(detail)) {
    return '[redacted]';
  }
  return detail;
}
