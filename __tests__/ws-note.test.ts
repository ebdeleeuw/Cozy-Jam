/* @vitest-environment node */
import { describe, it, expect } from 'vitest';
import WebSocket from 'ws';
import { startServer } from './utils';

// Port is chosen dynamically in startServer
function nextMessage(ws: WebSocket) {
  return new Promise<any>((resolve) => {
    ws.once('message', (data) => resolve(JSON.parse(String(data))));
  });
}

function waitForState(ws: WebSocket, predicate: (state: any) => boolean) {
  return new Promise<any>((resolve) => {
    ws.on('message', (data) => {
      const msg = JSON.parse(String(data));
      if (msg.type === 'state' && predicate(msg.state)) resolve(msg);
    });
  });
}

describe.sequential('ws note gating', () => {
  it('ignores notes from non-active users', async () => {
    const server = await startServer();
    await new Promise((r) => setTimeout(r, 300));

    const ws1 = new WebSocket(`ws://localhost:${server.port}`);
    const ws2 = new WebSocket(`ws://localhost:${server.port}`);

    await new Promise<void>((resolve) => ws1.once('open', () => resolve()));
    await new Promise<void>((resolve) => ws2.once('open', () => resolve()));

    await new Promise((r) => setTimeout(r, 150));

    ws1.send(JSON.stringify({ type: 'joinQueue' }));
    await new Promise((r) => setTimeout(r, 200));

    // non-active user sends note
    ws2.send(JSON.stringify({ type: 'note', note: 60, velocity: 0.8, on: true }));

    let gotNote = false;
    const timer = new Promise<void>((resolve) => setTimeout(resolve, 200));
    ws1.on('message', (data) => {
      const msg = JSON.parse(String(data));
      if (msg.type === 'note') {
        gotNote = true;
      }
    });

    await timer;
    expect(gotNote).toBe(false);

    const c1 = new Promise<void>((resolve) => ws1.once('close', () => resolve()));
    const c2 = new Promise<void>((resolve) => ws2.once('close', () => resolve()));
    ws1.close();
    ws2.close();
    await Promise.all([c1, c2]);
    await server.stop();
  });
});
