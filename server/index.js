import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import { COLORS, generateName } from "./lib/names.js";
import { withinRate } from "./lib/rateLimit.js";

const PORT = process.env.PORT ? Number(process.env.PORT) : 8787;
const TURN_DURATION = 30;

const server = http.createServer();
const wss = new WebSocketServer({ server });

const NOTE_RATE_LIMIT = 120; // per 5s
const MSG_RATE_LIMIT = 30; // per 5s
const JOIN_COOLDOWN_MS = 2000;
const INSTRUMENT_COOLDOWN_MS = 500;
const MAX_CONNECTIONS_PER_IP = 3;
const DISCONNECT_COOLDOWN_MS = 3000;

/** @type {Map<string, WebSocket>} */
const sockets = new Map();
/** @type {Map<string, {id: string, name: string, avatarColor: string, ip: string}>} */
const users = new Map();
/** @type {Map<string, 'inactive' | 'recording' | 'playing'>} */
const loopStatus = new Map();
/** @type {Map<string, {windowStart: number, count: number}>} */
const noteBuckets = new Map();
/** @type {Map<string, {windowStart: number, count: number}>} */
const msgBuckets = new Map();
/** @type {Map<string, number>} */
const lastJoinLeaveAt = new Map();
/** @type {Map<string, number>} */
const lastInstrumentAt = new Map();
/** @type {Map<string, number>} */
const lastDisconnectAt = new Map();
/** @type {Map<string, number>} */
const ipConnections = new Map();
/** @type {string[]} */
let queue = [];
let activePlayerId = null;
let timeRemaining = 0;
let currentInstrument = "PIANO";

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function createUser(id, ip) {
  const activeNames = new Set(Array.from(users.values()).map((u) => u.name));
  return {
    id,
    name: generateName(activeNames),
    avatarColor: pickRandom(COLORS),
    ip,
  };
}

function getIpFromReq(req) {
  const forwarded = req?.headers?.["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  return req?.socket?.remoteAddress || "unknown";
}

function getQueueUsers() {
  return queue.map((id) => users.get(id)).filter(Boolean);
}

function getActivePlayer() {
  return activePlayerId ? users.get(activePlayerId) ?? null : null;
}

function broadcastState() {
  const state = {
    queue: getQueueUsers(),
    activePlayer: getActivePlayer(),
    timeRemaining,
    currentInstrument,
  };

  for (const [id, ws] of sockets) {
    if (ws.readyState !== WebSocket.OPEN) continue;
    ws.send(
      JSON.stringify({
        type: "state",
        state,
        you: {
          id,
          loopStatus: loopStatus.get(id) ?? "inactive",
        },
      })
    );
  }
}

function ensureActivePlayer() {
  if (!activePlayerId && queue.length > 0) {
    activePlayerId = queue.shift();
    timeRemaining = TURN_DURATION;
  }
}

function broadcastAllNotesOff(fromId) {
  const payload = { type: "allNotesOff", from: fromId };
  for (const [, wsClient] of sockets) {
    if (wsClient.readyState !== WebSocket.OPEN) continue;
    wsClient.send(JSON.stringify(payload));
  }
}

function advanceTurn() {
  const prev = activePlayerId;
  activePlayerId = queue.shift() ?? null;
  if (activePlayerId) {
    timeRemaining = TURN_DURATION;
  } else {
    timeRemaining = 0;
  }
  if (prev) {
    broadcastAllNotesOff(prev);
  }
  broadcastState();
}

setInterval(() => {
  if (!activePlayerId) return;
  timeRemaining = Math.max(0, timeRemaining - 1);
  if (timeRemaining === 0) {
    advanceTurn();
  }
  broadcastState();
}, 1000);

wss.on("connection", (ws, req) => {
  const ip = getIpFromReq(req);
  const ipCount = ipConnections.get(ip) || 0;
  const lastDisc = lastDisconnectAt.get(ip) || 0;
  if (ipCount >= MAX_CONNECTIONS_PER_IP || Date.now() - lastDisc < DISCONNECT_COOLDOWN_MS) {
    ws.close();
    return;
  }
  ipConnections.set(ip, ipCount + 1);

  const id = Math.random().toString(36).slice(2, 9);
  const user = createUser(id, ip);
  sockets.set(id, ws);
  users.set(id, user);
  loopStatus.set(id, "inactive");

  ws.send(JSON.stringify({ type: "hello", you: user }));

  ensureActivePlayer();
  broadcastState();

  ws.on("message", (data) => {
    let msg;
    try {
      msg = JSON.parse(String(data));
    } catch {
      return;
    }

    if (!msg || typeof msg.type !== "string") return;
    if (!withinRate(msgBuckets, id, MSG_RATE_LIMIT, 5000)) return;

    switch (msg.type) {
      case "joinQueue": {
        const last = lastJoinLeaveAt.get(id) || 0;
        if (Date.now() - last < JOIN_COOLDOWN_MS) break;
        if (queue.includes(id) || activePlayerId === id) break;
        lastJoinLeaveAt.set(id, Date.now());
        if (!activePlayerId) {
          activePlayerId = id;
          timeRemaining = TURN_DURATION;
        } else {
          queue = [...queue, id];
        }
        break;
      }
      case "leaveQueue": {
        const last = lastJoinLeaveAt.get(id) || 0;
        if (Date.now() - last < JOIN_COOLDOWN_MS) break;
        lastJoinLeaveAt.set(id, Date.now());
        queue = queue.filter((q) => q !== id);
        if (activePlayerId === id) {
          advanceTurn();
        }
        break;
      }
      case "setInstrument": {
        const last = lastInstrumentAt.get(id) || 0;
        if (Date.now() - last < INSTRUMENT_COOLDOWN_MS) break;
        if (activePlayerId === id && typeof msg.instrument === "string") {
          const allowed = new Set(["PIANO", "DRUMS", "SYNTH"]);
          if (allowed.has(msg.instrument)) {
            currentInstrument = msg.instrument;
            lastInstrumentAt.set(id, Date.now());
          }
        }
        break;
      }
      case "loopStart":
        loopStatus.set(id, "recording");
        break;
      case "loopCommit":
        loopStatus.set(id, "playing");
        break;
      case "loopClear":
        loopStatus.set(id, "inactive");
        break;
      case "note": {
        if (activePlayerId !== id) break;
        if (typeof msg.note !== "number" || typeof msg.velocity !== "number") break;
        const isOn = Boolean(msg.on);
        if (isOn && !withinRate(noteBuckets, id, NOTE_RATE_LIMIT, 5000)) break;
        const payload = {
          type: "note",
          note: msg.note,
          velocity: msg.velocity,
          on: isOn,
          instrument: currentInstrument,
          from: id,
        };
        for (const [, wsClient] of sockets) {
          if (wsClient.readyState !== WebSocket.OPEN) continue;
          wsClient.send(JSON.stringify(payload));
        }
        return; // skip broadcastState for note messages
      }
      case "reaction": {
        if (typeof msg.emoji !== "string") break;
        const payload = { type: "reaction", emoji: msg.emoji, from: id };
        for (const [, wsClient] of sockets) {
          if (wsClient.readyState !== WebSocket.OPEN) continue;
          wsClient.send(JSON.stringify(payload));
        }
        return;
      }
      default:
        break;
    }

    broadcastState();
  });

  ws.on("close", () => {
    sockets.delete(id);
    users.delete(id);
    loopStatus.delete(id);
    noteBuckets.delete(id);
    msgBuckets.delete(id);
    lastJoinLeaveAt.delete(id);
    lastInstrumentAt.delete(id);

    const ip = user.ip;
    if (ip) {
      const count = ipConnections.get(ip) || 1;
      ipConnections.set(ip, Math.max(0, count - 1));
      lastDisconnectAt.set(ip, Date.now());
    }

    queue = queue.filter((q) => q !== id);
    if (activePlayerId === id) {
      advanceTurn();
    } else {
      broadcastState();
    }
  });
});

server.listen(PORT, () => {
  console.log(`Cozy Jam server listening on http://localhost:${PORT}`);
});
