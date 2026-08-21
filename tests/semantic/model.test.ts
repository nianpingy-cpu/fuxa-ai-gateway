import { describe, it, expect } from 'vitest';
import { validateDevice, validateTag } from '../../src/semantic/model.js';

describe('validateDevice', () => {
  it('accepts a valid device', () => {
    const result = validateDevice({
      id: 'd1',
      name: 'Cooling Pump',
      type: 'pump',
      location: 'Line 1',
      description: 'Main cooling pump',
    });
    expect(result.ok).toBe(true);
  });

  it('rejects a device missing an id', () => {
    const result = validateDevice({
      id: '',
      name: 'Cooling Pump',
      type: 'pump',
    });
    expect(result.ok).toBe(false);
  });

  it('rejects a device missing a name', () => {
    const result = validateDevice({
      id: 'd1',
      name: '',
      type: 'pump',
    });
    expect(result.ok).toBe(false);
  });
});

describe('validateTag', () => {
  it('accepts a valid tag', () => {
    const result = validateTag({
      id: 't1',
      name: 'temperature',
      unit: 'C',
      device: 'd1',
      description: 'Cooling pump temperature',
      range: { min: 0, max: 100 },
    });
    expect(result.ok).toBe(true);
  });

  it('rejects a tag missing an id', () => {
    const result = validateTag({
      id: '',
      name: 'temperature',
    });
    expect(result.ok).toBe(false);
  });

  it('rejects a tag missing a name', () => {
    const result = validateTag({
      id: 't1',
      name: '',
    });
    expect(result.ok).toBe(false);
  });
});
