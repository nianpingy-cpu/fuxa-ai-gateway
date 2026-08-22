import { describe, it, expect } from 'vitest';
import { createPrompts } from '../../src/prompts/index.js';

describe('createPrompts', () => {
  it('creates the three prompts', () => {
    const prompts = createPrompts();
    expect(prompts).toHaveLength(3);
    const names = prompts.map((p) => p.name).sort();
    expect(names).toEqual(['daily_report', 'diagnose_alarm', 'maintenance_report']);
  });

  it('prompt content reinforces read-only and safe behavior', () => {
    const prompts = createPrompts();
    const diagnose = prompts.find((p) => p.name === 'diagnose_alarm');
    const text = diagnose?.messages[0]?.content?.text ?? '';
    expect(text.toLowerCase()).toContain('read');
  });
});
