# Cozy Jam

A cozy, anonymous MIDI room where one player at a time performs and everyone else listens in real time.

## Features
- Anonymous users with rotating 30s turns (first‑come, first‑served)
- WebSocket real‑time state + note streaming
- Local monitoring for the active player (zero‑latency feel)
- Listener playback via buffered Web Audio synth
- Reactions broadcast to all clients
- Keyboard fallback input (A W S E D F T G Y H U J K)

## Tech stack
- React + Vite + TypeScript
- Tailwind CSS
- WebSocket server (Node + ws)
- Web MIDI + Web Audio (synth‑based)

## Getting started
**Prerequisites:** Node.js 20+

```bash
npm install
npm run dev
```

- Client: http://localhost:3000
- WebSocket server: ws://localhost:8787

## Keyboard controls (fallback)
When you are the active player, press:
```
A W S E D F T G Y H U J K
```
This maps to C4–C5 (white keys + black keys).

## Environment
- `VITE_WS_URL` (optional): override the WebSocket URL (default: `ws://localhost:8787`)

## Notes
- Only the active player can broadcast notes.
- Instrument selection is global and controlled by the active player.
- MIDI devices are detected automatically (Web MIDI supported browsers).

## Scripts
- `npm run dev` – start client + server
- `npm run build` – build client
- `npm run preview` – preview client build
