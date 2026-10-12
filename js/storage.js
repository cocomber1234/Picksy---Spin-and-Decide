// localStorage boundary. Wrap every access so the interface remains usable
// in private browsing and environments where storage is unavailable.
const KEYS = {
  favorites: "picksy_favorites",
  history: "picksy_history",
  current: "picksy_current",
};

function readStored(key, validate, fallback = []) {
  try {
    const value = window.localStorage.getItem(key);
    if (value === null) return fallback;
    const parsed = JSON.parse(value);
    return validate(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function writeStored(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

const isChoiceList = (value) => Array.isArray(value)
  && value.length <= 20
  && value.every((choice) => typeof choice === "string" && choice.trim().length > 0 && choice.length <= 48);

function isWheelList(value) {
  return Array.isArray(value) && value.length <= 100 && value.every((wheel) => {
    if (!wheel || typeof wheel !== "object") return false;
    if (typeof wheel.id !== "string") return false;
    if (typeof wheel.category !== "string") return false;
    const hasName = typeof wheel.name === "string" && wheel.name.trim().length > 0;
    const hasLegacyName = typeof wheel.wheelName === "string" && wheel.wheelName.trim().length > 0;
    if (!hasName && !hasLegacyName) return false;
    if (!isChoiceList(wheel.choices)) return false;
    return typeof wheel.createdAt === "string";
  });
}

function isHistoryList(value) {
  return Array.isArray(value) && value.length <= 50 && value.every((entry) => {
    if (!entry || typeof entry !== "object") return false;
    const hasChoice = typeof entry.choice === "string" && entry.choice.trim().length > 0 && entry.choice.length <= 48;
    const hasName = typeof entry.wheelName === "string" && entry.wheelName.trim().length > 0;
    const hasLegacyName = typeof entry.name === "string" && entry.name.trim().length > 0;
    if (!hasChoice || !(hasName || hasLegacyName)) return false;
    if (typeof entry.category !== "string") return false;
    return typeof entry.createdAt === "string";
  });
}

export function loadFavorites() {
  return readStored(KEYS.favorites, isWheelList, []);
}

export function saveFavorites(favorites) {
  return writeStored(KEYS.favorites, favorites);
}

export function loadHistory() {
  return readStored(KEYS.history, isHistoryList, []);
}

export function saveHistory(history) {
  return writeStored(KEYS.history, history.slice(0, 50));
}

export function loadCurrent() {
  return readStored(KEYS.current, (value) => value
    && typeof value.category === "string"
    && isChoiceList(value.choices), null);
}

export function saveCurrent(current) {
  return writeStored(KEYS.current, current);
}
