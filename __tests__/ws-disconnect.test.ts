/* @vitest-environment node */
import { describe, it, expect } from 'vitest';
import WebSocket from 'ws';
import { startServer } from './utils';

function waitForState(ws: WebSocket, predicate: (state: any) => boolean) {
  return new Promise<any>((resolve) => {
    ws.on('message', (data) => {
      const msg = JSON.parse(String(data));
      if (msg.type === 'state' && predicate(msg.state)) resolve(msg);
    });
  });
}

function nextMessage(ws: WebSocket) {
  return new Promise<any>((resolve) => {
    ws.once('message', (data) => resolve(JSON.parse(String(data))));
  });
}

describe.sequential('ws disconnect', () => {
  it('clears active player on disconnect when queue empty', async () => {
    const server = await startServer();
    await new Promise((r) => setTimeout(r, 300));

    const ws1 = new WebSocket(`ws://localhost:${server.port}`);
    await new Promise<void>((resolve) => ws1.once('open', () => resolve()));
    const hello1 = await nextMessage(ws1);

    ws1.send(JSON.stringify({ type: 'joinQueue' }));
    await waitForState(ws1, (state) => state.activePlayer?.id === hello1.you.id);

    const ws2 = new WebSocket(`ws://localhost:${server.port}`);
    await new Promise<void>((resolve) => ws2.once('open', () => resolve()));
    await nextMessage(ws2);

    const cleared = waitForState(ws2, (state) => state.activePlayer === null);
    ws1.close();
    await cleared;

    const c2 = new Promise<void>((resolve) => ws2.once('close', () => resolve()));
    ws2.close();
    await c2;
    await server.stop();
  });
});
