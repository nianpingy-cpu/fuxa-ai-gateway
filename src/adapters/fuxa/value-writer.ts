import { io } from 'socket.io-client';
import { ValueWriter } from './types.js';

const WRITE_TIMEOUT_MS = 10_000;

/**
 * Writes runtime tag values bound to a device over FUXA's socket.io channel.
 *
 * FUXA accepts live tag-value writes with the 'device-values' event:
 *   { cmd: 'set', var: { source: <deviceId>, id: <tagId>, value } }
 *
 * With security disabled (the default in this deployment), the write is
 * authorized for any socket. The connection is opened per write and closed
 * immediately after the message is sent.
 */
export class SocketIoValueWriter implements ValueWriter {
  private readonly url: string;

  constructor(baseUrl: string) {
    this.url = baseUrl.replace(/\/$/, '');
  }

  writeTagValue(deviceId: string, tagId: string, value: unknown): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const socket = io(this.url, {
        transports: ['websocket'],
        reconnection: false,
        timeout: WRITE_TIMEOUT_MS,
        forceNew: true,
      });

      let settled = false;
      const timer = setTimeout(() => {
        if (!settled) {
          settled = true;
          socket.close();
          reject(new Error('value write timed out'));
        }
      }, WRITE_TIMEOUT_MS);

      const finish = (err?: Error): void => {
        if (settled) {
          return;
        }
        settled = true;
        clearTimeout(timer);
        socket.close();
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      };

      socket.on('connect', () => {
        socket.emit('device-values', {
          cmd: 'set',
          var: { source: deviceId, id: tagId, value },
        });
        // Give the server a moment to accept before closing.
        setTimeout(() => finish(), 250);
      });
      socket.on('connect_error', (err) => finish(err instanceof Error ? err : new Error(String(err))));
      socket.on('error', (err) => finish(err instanceof Error ? err : new Error(String(err))));
    });
  }
}
