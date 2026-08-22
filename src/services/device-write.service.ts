import { FuxaClient } from '../adapters/fuxa/client.js';
import { FuxaDevice } from '../adapters/fuxa/types.js';
import { ApprovalService } from '../security/approval.js';
import { AuditLog } from '../security/audit.js';

export interface DeviceWriteResult {
  allowed: boolean;
  reason: string;
  approvalId?: string;
}

/**
 * Adds a device to the FUXA project. This is a write operation and is gated
 * behind the approval workflow and recorded in the audit log. By default the
 * write is not enabled.
 */
export class DeviceWriteService {
  private readonly client: FuxaClient;
  private readonly approval: ApprovalService;
  private readonly audit: AuditLog;

  constructor(client: FuxaClient, approval: ApprovalService, audit: AuditLog) {
    this.client = client;
    this.approval = approval;
    this.audit = audit;
  }

  async addDevice(device: FuxaDevice, approver?: string): Promise<DeviceWriteResult> {
    const decision = this.approval.requestWrite(
      'fuxa_add_device',
      device.id ?? 'unknown',
      approver,
    );
    if (!decision.allowed) {
      this.audit.record({
        tool: 'fuxa_add_device',
        action: 'write',
        allowed: false,
        detail: `blocked: ${decision.reason}`,
      });
      return { allowed: false, reason: decision.reason };
    }

    await this.client.addDevice(device).catch(async (err: unknown) => {
      // FUXA restarts after a successful write, which can drop the response
      // connection. If the connection is lost, verify whether the device was
      // actually added before reporting a failure.
      const code = err instanceof Error ? (err as { code?: string }).code : undefined;
      if (code === 'CONNECTION_REFUSED' || code === 'TIMEOUT') {
        const tags = await this.client.listTags();
        const exists =
          tags.some((t) => t.deviceId === device.id) || (await this.deviceExists(device.id));
        if (!exists) {
          throw err;
        }
      } else {
        throw err;
      }
    });

    this.audit.record({
      tool: 'fuxa_add_device',
      action: 'write',
      allowed: true,
      detail: `added device ${device.name ?? device.id}`,
    });
    return { allowed: true, reason: decision.reason, approvalId: decision.approvalId };
  }

  private async deviceExists(id: string): Promise<boolean> {
    const project = await this.client.getProject();
    return project.raw.devices ? id in project.raw.devices : false;
  }
}
