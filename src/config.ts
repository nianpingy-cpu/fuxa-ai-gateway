import { FuxaConfig } from './adapters/fuxa/types.js';

/**
 * Load FUXA connection configuration from environment variables.
 */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): FuxaConfig {
  const baseUrl = env['FUXA_BASE_URL'] ?? 'http://localhost:1881';
  return {
    baseUrl,
    apiKey: env['FUXA_API_KEY'] || undefined,
    username: env['FUXA_USERNAME'] || undefined,
    password: env['FUXA_PASSWORD'] || undefined,
    timeoutMs: env['FUXA_TIMEOUT_MS'] ? Number(env['FUXA_TIMEOUT_MS']) : undefined,
  };
}
