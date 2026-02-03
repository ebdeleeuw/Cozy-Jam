/* @vitest-environment node */
import { describe, it, expect } from 'vitest';
import WebSocket from 'ws';
import { startServer } from './utils';

// Port is chosen dynamically in startServer
function waitForMessage(ws: WebSocket, type: string) {
  return new Promise<any>((resolve) => {
    ws.on('message', (data) => {
      const msg = JSON.parse(String(data));
      if (msg.type === type) resolve(msg);
    });
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

describe('ws joinQueue', () => {
  it('makes a user active when queue is empty', async () => {
    const server = await startServer();
    await new Promise((r) => setTimeout(r, 300));

    const ws = new WebSocket(`ws://localhost:${server.port}`);
    await new Promise<void>((resolve) => ws.once('open', () => resolve()));
    const hello = await waitForMessage(ws, 'hello');
    ws.send(JSON.stringify({ type: 'joinQueue' }));
    const stateMsg = await waitForState(ws, (state) => state.activePlayer);

    expect(stateMsg.state.activePlayer.id).toBe(hello.you.id);

    const closed = new Promise<void>((resolve) => ws.once('close', () => resolve()));
    ws.close();
    await closed;
    await server.stop();
  });
});
