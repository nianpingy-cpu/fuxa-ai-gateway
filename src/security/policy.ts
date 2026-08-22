/**
 * Safety policy layer. Enforces read-only behavior by default and controls
 * access to tools. Writes are rejected unless explicitly enabled and approved.
 */

export type Action = 'read' | 'write';

export interface PolicyResult {
  allowed: boolean;
  reason: string;
}

export class PolicyService {
  private readonly writeEnabled: boolean;

  constructor(writeEnabled = false) {
    this.writeEnabled = writeEnabled;
  }

  /**
   * Check whether an action is allowed for a tool.
   */
  check(tool: string, action: Action): PolicyResult {
    if (action === 'read') {
      return { allowed: true, reason: 'read-only access granted' };
    }
    if (!this.writeEnabled) {
      return { allowed: false, reason: 'write operations are disabled by default' };
    }
    return { allowed: true, reason: `write enabled for ${tool}` };
  }

  get isWriteEnabled(): boolean {
    return this.writeEnabled;
  }
}
