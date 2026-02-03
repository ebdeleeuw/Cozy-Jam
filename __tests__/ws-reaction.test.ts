/* @vitest-environment node */
import { describe, it, expect } from 'vitest';
import WebSocket from 'ws';
import { startServer } from './utils';

function nextMessage(ws: WebSocket) {
  return new Promise<any>((resolve) => {
    ws.once('message', (data) => resolve(JSON.parse(String(data))));
  });
}

function waitForType(ws: WebSocket, type: string, timeoutMs = 2000) {
  return new Promise<any>((resolve, reject) => {
    const onMsg = (data: WebSocket.RawData) => {
      const msg = JSON.parse(String(data));
      if (msg.type === type) {
        cleanup();
        resolve(msg);
      }
    };
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error(`timeout waiting for ${type}`));
    }, timeoutMs);
    const cleanup = () => {
      ws.off('message', onMsg);
      clearTimeout(timer);
    };
    ws.on('message', onMsg);
  });
}
describe.sequential('ws reactions', () => {
  it('broadcasts reactions to other clients', async () => {
    const server = await startServer();
    await new Promise((r) => setTimeout(r, 300));

    const ws1 = new WebSocket(`ws://localhost:${server.port}`);
    const ws2 = new WebSocket(`ws://localhost:${server.port}`);

    const hello1 = nextMessage(ws1);
    const hello2 = nextMessage(ws2);

    await new Promise<void>((resolve) => ws1.once('open', () => resolve()));
    await new Promise<void>((resolve) => ws2.once('open', () => resolve()));

    await Promise.race([
      hello1,
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout hello ws1')), 1000)),
    ]);
    await Promise.race([
      hello2,
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout hello ws2')), 1000)),
    ]);
    ws1.send(JSON.stringify({ type: 'reaction', emoji: '✨' }));
    const msg = await Promise.race([
      waitForType(ws2, 'reaction', 2000),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout reaction ws2')), 2000)),
    ]);
    expect(msg.emoji).toBe('✨');

    const c1 = new Promise<void>((resolve) => ws1.once('close', () => resolve()));
    const c2 = new Promise<void>((resolve) => ws2.once('close', () => resolve()));
    ws1.close();
    ws2.close();
    await Promise.all([c1, c2]);
    await server.stop();
  });
});
