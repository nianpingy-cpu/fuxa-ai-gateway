import { describe, it, expect, vi } from 'vitest';
import { FetchTransport } from '../../../src/adapters/fuxa/transport.js';
import { FuxaError } from '../../../src/adapters/fuxa/types.js';

describe('FetchTransport', () => {
  it('returns parsed JSON for a successful request', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ data: { id: 'p1' } }),
    }));
    vi.stubGlobal('fetch', fetchMock);

    const transport = new FetchTransport(1000);
    const result = await transport.request<{ data: { id: string } }>({
      method: 'GET',
      url: 'http://fuxa/api/project/p1',
    });

    expect(result.data.id).toBe('p1');
    vi.unstubAllGlobals();
  });

  it('throws a FuxaError on a non-OK response', async () => {
    const fetchMock = vi.fn(async () => ({ ok: false, status: 500 }));
    vi.stubGlobal('fetch', fetchMock);

    const transport = new FetchTransport(1000);
    await expect(
      transport.request({ method: 'GET', url: 'http://fuxa/api' }),
    ).rejects.toBeInstanceOf(FuxaError);
    vi.unstubAllGlobals();
  });

  it('throws a FuxaError when FUXA is unreachable', async () => {
    const fetchMock = vi.fn(async () => {
      throw new TypeError('fetch failed');
    });
    vi.stubGlobal('fetch', fetchMock);

    const transport = new FetchTransport(1000);
    await expect(
      transport.request({ method: 'GET', url: 'http://fuxa/api' }),
    ).rejects.toMatchObject({ code: 'CONNECTION_REFUSED' });
    vi.unstubAllGlobals();
  });
});
