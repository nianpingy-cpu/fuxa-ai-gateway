/**
 * Industrial semantic model.
 *
 * These types give structure to raw FUXA data so that language models can
 * reason about devices and tags meaningfully.
 */

export interface Device {
  id: string;
  name: string;
  type: string;
  location: string;
  description?: string;
}

export interface TagRange {
  min: number;
  max: number;
}

export interface Tag {
  id: string;
  name: string;
  unit?: string;
  device?: string;
  description?: string;
  range?: TagRange;
}

export type ValidationResult = { ok: true; value: Device | Tag } | { ok: false; errors: string[] };

function isNonEmpty(value: string | undefined): boolean {
  return value !== undefined && value.trim().length > 0;
}

/**
 * Validate a Device. Returns ok with the value, or a list of errors.
 */
export function validateDevice(input: Device): ValidationResult {
  const errors: string[] = [];
  if (!isNonEmpty(input.id)) {
    errors.push('device id is required');
  }
  if (!isNonEmpty(input.name)) {
    errors.push('device name is required');
  }
  if (errors.length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, value: input };
}

/**
 * Validate a Tag. Returns ok with the value, or a list of errors.
 */
export function validateTag(input: Tag): ValidationResult {
  const errors: string[] = [];
  if (!isNonEmpty(input.id)) {
    errors.push('tag id is required');
  }
  if (!isNonEmpty(input.name)) {
    errors.push('tag name is required');
  }
  if (errors.length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, value: input };
}
