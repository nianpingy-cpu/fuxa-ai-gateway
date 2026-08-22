import { describe, it, expect } from 'vitest';
import { AuditLog } from '../../src/security/audit.js';
import { PolicyService } from '../../src/security/policy.js';

describe('AuditLog', () => {
  it('records an entry', () => {
    const log = new AuditLog();
    log.record({ tool: 'fuxa_health_check', action: 'read', allowed: true });
    expect(log.entries).toHaveLength(1);
    expect(log.entries[0]?.tool).toBe('fuxa_health_check');
  });

  it('never records sensitive data', () => {
    const log = new AuditLog();
    log.record({ tool: 'login', action: 'read', allowed: true, detail: 'password=secret' });
    for (const entry of log.entries) {
      expect(JSON.stringify(entry).toLowerCase()).not.toContain('secret');
    }
  });
});

describe('PolicyService', () => {
  it('allows read actions by default', () => {
    const policy = new PolicyService();
    const result = policy.check('fuxa_health_check', 'read');
    expect(result.allowed).toBe(true);
  });

  it('rejects write actions by default', () => {
    const policy = new PolicyService();
    const result = policy.check('fuxa_write_tag', 'write');
    expect(result.allowed).toBe(false);
  });
});
