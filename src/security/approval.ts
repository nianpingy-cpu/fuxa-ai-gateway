/**
 * Operation approval workflow. Writes remain disabled by default. Any write
 * requires permission, approval, and an audit trail. There is no direct
 * model-to-PLC write path.
 */

export interface ApprovalResult {
  allowed: boolean;
  approvalId?: string;
  reason: string;
}

export interface ApprovalAuditEntry {
  approvalId: string;
  tool: string;
  target: string;
  approver?: string;
  allowed: boolean;
}

export class ApprovalService {
  private readonly writeEnabled: boolean;
  private readonly audit: ApprovalAuditEntry[] = [];
  private nextId = 1;

  constructor(writeEnabled = false) {
    this.writeEnabled = writeEnabled;
  }

  get auditEntries(): readonly ApprovalAuditEntry[] {
    return this.audit;
  }

  /**
   * Request approval for a write operation. Requires the write path to be
   * explicitly enabled and an approver to be provided.
   */
  requestWrite(tool: string, target: string, approver?: string): ApprovalResult {
    if (!this.writeEnabled) {
      return { allowed: false, reason: 'write operations are disabled by default' };
    }
    if (!approver) {
      return { allowed: false, reason: 'an approver is required for write operations' };
    }
    const approvalId = `appr-${this.nextId++}`;
    this.audit.push({ approvalId, tool, target, approver, allowed: true });
    return { allowed: true, approvalId, reason: `write approved for ${tool}` };
  }
}
