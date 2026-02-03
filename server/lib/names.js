const ADJECTIVES = [
  "Sleepy",
  "Cozy",
  "Gentle",
  "Warm",
  "Soft",
  "Quiet",
  "Mellow",
  "Calm",
  "Velvet",
  "Drifting",
  "Sunny",
  "Moonlit",
  "Kind",
  "Tender",
  "Hushed",
  "Snug",
  "Golden",
  "Breezy",
  "Blooming",
  "Dusky",
];

const NOUNS = [
  "Fox",
  "Bear",
  "Cat",
  "Tea",
  "Cloud",
  "Owl",
  "Moon",
  "Leaf",
  "Fern",
  "Pebble",
  "Hearth",
  "Dawn",
  "Drift",
  "River",
  "Glade",
  "Pine",
  "Garden",
  "Meadow",
  "Star",
  "Bloom",
];

const COLORS = [
  "bg-rose-200",
  "bg-sky-200",
  "bg-emerald-200",
  "bg-amber-200",
  "bg-violet-200",
  "bg-indigo-200",
  "bg-teal-200",
  "bg-lime-200",
  "bg-orange-200",
  "bg-slate-200",
];

let lastAssignedName = null;
const recentNames = [];
const RECENT_LIMIT = 50;

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pushRecent(name) {
  recentNames.push(name);
  if (recentNames.length > RECENT_LIMIT) {
    recentNames.shift();
  }
}

function generateName(activeNames) {
  let name = "";
  let guard = 0;

  while (guard < 40) {
    const adj = pickRandom(ADJECTIVES);
    const noun = pickRandom(NOUNS);
    name = `${adj} ${noun}`;
    guard += 1;

    const inRecent = recentNames.includes(name) || name === lastAssignedName;
    const inActive = activeNames.has(name);

    if (guard < 20) {
      if (!inRecent && !inActive) break;
    } else {
      if (!inRecent) break;
    }
  }

  lastAssignedName = name;
  pushRecent(name);
  return name;
}

function resetNameHistory() {
  lastAssignedName = null;
  recentNames.length = 0;
}

export {
  ADJECTIVES,
  NOUNS,
  COLORS,
  generateName,
  resetNameHistory,
  RECENT_LIMIT,
};
