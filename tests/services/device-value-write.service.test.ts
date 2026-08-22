import { describe, it, expect, vi } from 'vitest';
import { DeviceValueWriteService } from '../../src/services/device-value-write.service.js';
import { FuxaClient } from '../../src/adapters/fuxa/client.js';
import { ApprovalService } from '../../src/security/approval.js';
import { AuditLog } from '../../src/security/audit.js';

describe('DeviceValueWriteService', () => {
  function setup(clientOverrides = {}) {
    const client = {
      writeTagValue: vi.fn(async () => undefined),
      ...clientOverrides,
    } as unknown as FuxaClient;
    const approval = new ApprovalService(true);
    const audit = new AuditLog();
    const service = new DeviceValueWriteService(client, approval, audit);
    return { client, approval, audit, service };
  }

  it('writes a tag value when write is enabled and approved', async () => {
    const { client, service } = setup();

    const result = await service.writeTagValue('dev-1', 'temperature', 42.5, 'lead');

    expect(result.allowed).toBe(true);
    expect(result.approvalId).toBeDefined();
    expect(client.writeTagValue).toHaveBeenCalledWith('dev-1', 'temperature', 42.5);
  });

  it('blocks the write when write is disabled', async () => {
    const client = { writeTagValue: vi.fn(async () => undefined) } as unknown as FuxaClient;
    const approval = new ApprovalService(false);
    const audit = new AuditLog();
    const service = new DeviceValueWriteService(client, approval, audit);

    const result = await service.writeTagValue('dev-1', 'temperature', 42.5, 'lead');

    expect(result.allowed).toBe(false);
    expect(client.writeTagValue).not.toHaveBeenCalled();
  });

  it('requires an approver', async () => {
    const { client, service } = setup();

    const result = await service.writeTagValue('dev-1', 'temperature', 42.5);

    expect(result.allowed).toBe(false);
    expect(client.writeTagValue).not.toHaveBeenCalled();
  });
});
