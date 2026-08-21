import { FuxaProject, FuxaTag } from '../adapters/fuxa/types.js';
import { Device, Tag } from './model.js';

/**
 * Map raw FUXA project data into a semantic Device.
 * Missing optional fields are defaulted or omitted gracefully.
 */
export function mapDevice(project: FuxaProject): Device {
  return {
    id: project.id,
    name: project.name,
    type: 'unknown',
    location: 'unknown',
    description: project.description,
  };
}

/**
 * Map raw FUXA tag data into a semantic Tag.
 * Missing optional fields are omitted gracefully.
 */
export function mapTag(tag: FuxaTag): Tag {
  return {
    id: tag.id,
    name: tag.name,
    unit: tag.unit,
    device: tag.deviceId,
    description: tag.description,
    range: undefined,
  };
}
