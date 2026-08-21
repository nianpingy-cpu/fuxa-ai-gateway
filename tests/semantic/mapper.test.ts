import { describe, it, expect } from 'vitest';
import { mapDevice, mapTag } from '../../src/semantic/mapper.js';

describe('mapDevice', () => {
  it('maps a FUXA project to a semantic device', () => {
    const device = mapDevice({ id: 'd1', name: 'Cooling Pump', description: 'Main pump' });
    expect(device).toEqual({
      id: 'd1',
      name: 'Cooling Pump',
      type: 'unknown',
      location: 'unknown',
      description: 'Main pump',
    });
  });

  it('defaults missing optional fields', () => {
    const device = mapDevice({ id: 'd1', name: 'Cooling Pump' });
    expect(device.type).toBe('unknown');
    expect(device.location).toBe('unknown');
    expect(device.description).toBeUndefined();
  });
});

describe('mapTag', () => {
  it('maps a FUXA tag to a semantic tag', () => {
    const tag = mapTag({
      id: 't1',
      name: 'temperature',
      unit: 'C',
      deviceId: 'd1',
      description: 'Cooling pump temperature',
    });
    expect(tag).toEqual({
      id: 't1',
      name: 'temperature',
      unit: 'C',
      device: 'd1',
      description: 'Cooling pump temperature',
      range: undefined,
    });
  });

  it('defaults missing optional fields', () => {
    const tag = mapTag({ id: 't1', name: 'temperature' });
    expect(tag.unit).toBeUndefined();
    expect(tag.device).toBeUndefined();
    expect(tag.range).toBeUndefined();
  });
});
