import http from "http";
import { WebSocketServer } from "ws";

const PORT = process.env.PORT ? Number(process.env.PORT) : 8787;
const TURN_DURATION = 30;

const NAMES = [
  "Sleepy Fox",
  "Cozy Bear",
  "Gentle Cat",
  "Warm Tea",
  "Soft Cloud",
  "Quiet Owl",
  "Mellow Moon",
  "Calm Leaf",
];

const COLORS = [
  "bg-rose-200",
  "bg-sky-200",
  "bg-emerald-200",
  "bg-amber-200",
  "bg-violet-200",
];

const server = http.createServer();
const wss = new WebSocketServer({ server });

/** @type {Map<string, WebSocket>} */
const sockets = new Map();
/** @type {Map<string, {id: string, name: string, avatarColor: string}>} */
const users = new Map();
/** @type {Map<string, 'inactive' | 'recording' | 'playing'>} */
const loopStatus = new Map();
/** @type {string[]} */
let queue = [];
let activePlayerId = null;
let timeRemaining = 0;
let currentInstrument = "PIANO";

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function createUser(id) {
  return {
    id,
    name: pickRandom(NAMES),
    avatarColor: pickRandom(COLORS),
  };
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
    if (ws.readyState !== ws.OPEN) continue;
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

function advanceTurn() {
  activePlayerId = queue.shift() ?? null;
  if (activePlayerId) {
    timeRemaining = TURN_DURATION;
  } else {
    timeRemaining = 0;
  }
}

setInterval(() => {
  if (!activePlayerId) return;
  timeRemaining = Math.max(0, timeRemaining - 1);
  if (timeRemaining === 0) {
    advanceTurn();
  }
  broadcastState();
}, 1000);

wss.on("connection", (ws) => {
  const id = Math.random().toString(36).slice(2, 9);
  const user = createUser(id);
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

    switch (msg.type) {
      case "joinQueue": {
        if (!queue.includes(id) && activePlayerId !== id) {
          if (!activePlayerId) {
            activePlayerId = id;
            timeRemaining = TURN_DURATION;
          } else {
            queue = [...queue, id];
          }
        }
        break;
      }
      case "leaveQueue": {
        queue = queue.filter((q) => q !== id);
        if (activePlayerId === id) {
          advanceTurn();
        }
        break;
      }
      case "setInstrument": {
        if (activePlayerId === id && typeof msg.instrument === "string") {
          const allowed = new Set(["PIANO", "DRUMS", "SYNTH"]);
          if (allowed.has(msg.instrument)) {
            currentInstrument = msg.instrument;
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
      default:
        break;
    }

    broadcastState();
  });

  ws.on("close", () => {
    sockets.delete(id);
    users.delete(id);
    loopStatus.delete(id);
    queue = queue.filter((q) => q !== id);
    if (activePlayerId === id) {
      advanceTurn();
    }
    broadcastState();
  });
});

server.listen(PORT, () => {
  console.log(`Cozy Jam server listening on http://localhost:${PORT}`);
});
