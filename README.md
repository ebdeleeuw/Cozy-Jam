<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Cozy Jam

Minimal, anonymous MIDI room with server-authoritative rotation and a cozy UI.

## Run locally

**Prerequisites:** Node.js 20+

1. Install dependencies:
   `npm install`
2. Run the app + WebSocket server:
   `npm run dev`

- Client: http://localhost:3000
- WebSocket server: ws://localhost:8787

## Environment
- `VITE_WS_URL` (optional): override the WebSocket URL (default: ws://localhost:8787)
