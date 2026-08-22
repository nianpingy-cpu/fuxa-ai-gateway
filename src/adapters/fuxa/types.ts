/**
 * Shared types for the FUXA adapter layer.
 */

export interface FuxaConfig {
  baseUrl: string;
  apiKey?: string;
  username?: string;
  password?: string;
  timeoutMs?: number;
}

export interface AuthResult {
  token: string;
  expiresAt?: number;
}

export interface FuxaProject {
  id: string;
  name: string;
  description?: string;
  raw: RawFuxaProject;
}

export interface FuxaTag {
  id: string;
  name: string;
  unit?: string;
  deviceId?: string;
  description?: string;
}

/**
 * Raw FUXA device (as stored in the FUXA project).
 */
export interface FuxaDevice {
  id: string;
  name: string;
  type?: string;
  enabled?: boolean;
  tags?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Raw FUXA project as returned by GET /api/project.
 */
export interface RawFuxaProject {
  devices?: Record<string, FuxaDevice>;
  hmi?: { views?: unknown[] };
  version?: string;
  server?: unknown;
  [key: string]: unknown;
}

/**
 * Normalized project summary used by services.
 */
export interface FuxaProject {
  id: string;
  name: string;
  description?: string;
  raw: RawFuxaProject;
}

export interface FuxaAlarm {
  id: string;
  name: string;
  deviceId?: string;
  tagId?: string;
  severity?: string;
  active: boolean;
  message?: string;
}

export interface DaqPoint {
  timestamp: string;
  value: number;
}

export interface FuxaErrorCode {
  code: string;
  message: string;
  status?: number;
}

/**
 * Normalized error type returned by the adapter for all failures.
 */
export class FuxaError extends Error {
  readonly code: string;
  readonly status?: number;

  constructor(code: string, message: string, status?: number) {
    super(message);
    this.name = 'FuxaError';
    this.code = code;
    this.status = status;
  }
}

/**
 * Pluggable HTTP transport so the adapter can be tested without a network.
 */
export interface HttpTransport {
  request<T>(options: HttpRequestOptions): Promise<T>;
}

export interface HttpRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  headers?: Record<string, string>;
  body?: unknown;
}
