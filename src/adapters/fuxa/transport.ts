import { FuxaError, HttpRequestOptions, HttpTransport } from './types.js';

/**
 * HTTP transport backed by the global fetch API.
 */
export class FetchTransport implements HttpTransport {
  private readonly timeoutMs: number;

  constructor(timeoutMs = 10000) {
    this.timeoutMs = timeoutMs;
  }

  async request<T>(options: HttpRequestOptions): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const headers: Record<string, string> = { ...options.headers };
      if (options.body !== undefined && headers['Content-Type'] === undefined) {
        headers['Content-Type'] = 'application/json';
      }
      const response = await fetch(options.url, {
        method: options.method,
        headers,
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });

      if (!response.ok) {
        let detail = '';
        try {
          detail = await response.text();
        } catch {
          // ignore body read failure
        }
        throw new FuxaError(
          'HTTP_ERROR',
          `FUXA request failed with status ${response.status}${detail ? `: ${detail}` : ''}`,
          response.status,
        );
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof FuxaError) {
        throw error;
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw new FuxaError('TIMEOUT', 'FUXA request timed out');
      }
      throw new FuxaError('CONNECTION_REFUSED', 'Unable to reach FUXA');
    } finally {
      clearTimeout(timer);
    }
  }
}
