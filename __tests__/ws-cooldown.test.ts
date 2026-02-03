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

describe.sequential('join cooldown', () => {
  it('ignores rapid leave + join', async () => {
    const server = await startServer();
    await new Promise((r) => setTimeout(r, 300));

    const ws = new WebSocket(`ws://localhost:${server.port}`);
    await new Promise<void>((resolve) => ws.once('open', () => resolve()));
    await nextMessage(ws);

    ws.send(JSON.stringify({ type: 'joinQueue' }));
    await waitForState(ws, (state) => state.activePlayer);

    ws.send(JSON.stringify({ type: 'leaveQueue' }));
    // immediate rejoin within cooldown
    ws.send(JSON.stringify({ type: 'joinQueue' }));

    const stateMsg = await waitForState(ws, (state) => !state.activePlayer || state.queue.length === 0);
    expect(stateMsg.state.queue.length).toBe(0);

    const closed = new Promise<void>((resolve) => ws.once('close', () => resolve()));
    ws.close();
    await closed;
    await server.stop();
  });
});
