import { AuthResult, FuxaError, HttpTransport } from './types.js';

/**
 * Handles FUXA authentication: API Key and JWT login with token caching.
 */
export class FuxaAuth {
  private readonly transport: HttpTransport;
  private readonly baseUrl: string;
  private readonly apiKey?: string;
  private readonly username?: string;
  private readonly password?: string;
  private token?: string;
  private tokenExpiresAt?: number;

  constructor(
    transport: HttpTransport,
    baseUrl: string,
    credentials: { apiKey?: string; username?: string; password?: string },
  ) {
    this.transport = transport;
    this.baseUrl = baseUrl;
    this.apiKey = credentials.apiKey;
    this.username = credentials.username;
    this.password = credentials.password;
  }

  /**
   * Ensure a valid token is available. Returns the auth headers to attach.
   */
  async ensureHeaders(): Promise<Record<string, string>> {
    if (this.apiKey) {
      return { 'X-API-Key': this.apiKey };
    }
    if (this.token && (this.tokenExpiresAt === undefined || this.tokenExpiresAt > Date.now())) {
      return { 'x-access-token': this.token };
    }
    if (!this.username || !this.password) {
      // No credentials configured; proceed without authentication
      // (FUXA works without auth when secureEnabled is false).
      return {};
    }
    const result = await this.login(this.username, this.password);
    this.token = result.token;
    this.tokenExpiresAt = result.expiresAt;
    return { 'x-access-token': this.token };
  }

  private async login(username: string, password: string): Promise<AuthResult> {
    const response = await this.transport.request<{
      data: { token: string };
    }>({
      method: 'POST',
      url: `${this.baseUrl}/api/signin`,
      body: { username, password },
    });
    if (!response.data?.token) {
      throw new FuxaError('AUTH_FAILED', 'FUXA login did not return a token');
    }
    return { token: response.data.token };
  }
}
