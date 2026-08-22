import { FuxaClient } from '../adapters/fuxa/client.js';
import { ApprovalService } from '../security/approval.js';
import { AuditLog } from '../security/audit.js';

export interface DeviceValueWriteResult {
  allowed: boolean;
  reason: string;
  approvalId?: string;
}

/**
 * Writes a runtime tag value bound to a device. This is a write operation and
 * is gated behind the approval workflow and recorded in the audit log. By
 * default the write is not enabled.
 */
export class DeviceValueWriteService {
  private readonly client: FuxaClient;
  private readonly approval: ApprovalService;
  private readonly audit: AuditLog;

  constructor(client: FuxaClient, approval: ApprovalService, audit: AuditLog) {
    this.client = client;
    this.approval = approval;
    this.audit = audit;
  }

  async writeTagValue(
    deviceId: string,
    tagId: string,
    value: unknown,
    approver?: string,
  ): Promise<DeviceValueWriteResult> {
    const decision = this.approval.requestWrite(
      'fuxa_write_tag_value',
      `${deviceId}.${tagId}`,
      approver,
    );
    if (!decision.allowed) {
      this.audit.record({
        tool: 'fuxa_write_tag_value',
        action: 'write',
        allowed: false,
        detail: `blocked: ${decision.reason}`,
      });
      return { allowed: false, reason: decision.reason };
    }

    await this.client.writeTagValue(deviceId, tagId, value);

    this.audit.record({
      tool: 'fuxa_write_tag_value',
      action: 'write',
      allowed: true,
      detail: `wrote ${deviceId}.${tagId} = ${String(value)}`,
    });
    return { allowed: true, reason: decision.reason, approvalId: decision.approvalId };
  }
}
