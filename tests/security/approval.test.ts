import { describe, it, expect } from 'vitest';
import { ApprovalService } from '../../src/security/approval.js';

describe('ApprovalService', () => {
  it('blocks writes by default', () => {
    const service = new ApprovalService();
    const result = service.requestWrite('fuxa_write_tag', 't1');
    expect(result.allowed).toBe(false);
  });

  it('allows a write when approval is granted', () => {
    const service = new ApprovalService(true);
    const result = service.requestWrite('fuxa_write_tag', 't1', 'operator');
    expect(result.allowed).toBe(true);
    expect(result.approvalId).toBeDefined();
  });

  it('records approvals in the audit log', () => {
    const service = new ApprovalService(true);
    service.requestWrite('fuxa_write_tag', 't1', 'operator');
    expect(service.auditEntries).toHaveLength(1);
    expect(service.auditEntries[0]?.tool).toBe('fuxa_write_tag');
  });
});
