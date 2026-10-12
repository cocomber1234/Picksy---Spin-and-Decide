import { createChoicesPanel } from "./choices.js";
import { celebrate, decodeWheelState, shareChoices } from "./effects.js";
import { populateCategoryPicker, getPresetChoices, PRESETS } from "./presets.js";
import {
  loadCurrent,
  loadFavorites,
  loadHistory,
  saveCurrent,
  saveFavorites,
  saveHistory,
} from "./storage.js";
import { createWheel } from "./wheel.js";

const MAX_CHOICES = 20;
const MAX_CHOICE_LENGTH = 48;
const elements = {
  header: document.querySelector(".site-header"),
  category: document.querySelector("#category-picker"),
  canvas: document.querySelector("#decision-wheel"),
  status: document.querySelector("#wheel-status"),
  spin: document.querySelector("#spin-button"),
  list: document.querySelector("#choice-list"),
  count: document.querySelector("#choice-count"),
  form: document.querySelector("#choice-form"),
  input: document.querySelector("#choice-input"),
  tabs: [...document.querySelectorAll(".library-tab")],
  library: document.querySelector("#library-content"),
  toast: document.querySelector("#toast"),
  save: document.querySelector("#save-button"),
  share: document.querySelector("#share-button"),
  shuffle: document.querySelector("#shuffle-button"),
  clearAll: document.querySelector("#clear-all-button"),
  resultDialog: document.querySelector("#result-dialog"),
  resultChoice: document.querySelector("#result-choice"),
  resultCategory: document.querySelector("#result-category"),
  spinAgain: document.querySelector("#spin-again"),
  clearHistory: document.querySelector("#clear-history"),
  nameDialog: document.querySelector("#name-dialog"),
  nameForm: document.querySelector("#name-form"),
  nameInput: document.querySelector("#name-input"),
  nameLabel: document.querySelector("#name-label"),
  nameTitle: document.querySelector("#name-title"),
  nameCancel: document.querySelector("#name-cancel"),
  nameClose: document.querySelector("#name-close"),
};

const choices = createChoicesPanel({
  list: elements.list,
  count: elements.count,
  form: elements.form,
  input: elements.input,
});
let favorites = loadFavorites();
let history = loadHistory();
let activeTab = "favorites";
let toastTimeout;
let currentWheelName = "Current wheel";
let currentCategory = "activities";
let pendingNameAction = null;

let previousScrollY = window.scrollY;
let scrollFrameRequested = false;
window.addEventListener("scroll", () => {
  if (scrollFrameRequested) return;
  scrollFrameRequested = true;
  requestAnimationFrame(() => {
    const nextScrollY = window.scrollY;
    if (nextScrollY < 60 || nextScrollY < previousScrollY - 4) {
      elements.header.classList.remove("is-hidden");
    } else if (nextScrollY > previousScrollY + 4) {
      elements.header.classList.add("is-hidden");
    }
    previousScrollY = nextScrollY;
    scrollFrameRequested = false;
  });
}, { passive: true });

function announce(message) {
  elements.status.textContent = message;
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => elements.toast.classList.remove("is-visible"), 2600);
}

function getCategoryLabel(category) {
  const categoryLabels = {
    activities: "Activities",
    food: "Food",
    games: "Games",
    movies: "Movies",
    custom: "Custom",
  };
  return categoryLabels[category] ?? "Custom";
}

function getWheelNameFromCategory(category) {
  return `${getCategoryLabel(category)} wheel`;
}

function openNameDialog(title, defaultValue, onConfirm, labelText = "Wheel name") {
  pendingNameAction = onConfirm;
  elements.nameTitle.textContent = title;
  elements.nameLabel.textContent = labelText;
  elements.nameInput.value = defaultValue;
  elements.nameDialog.showModal();
  window.setTimeout(() => elements.nameInput.focus(), 0);
}

function persistCurrent(successMessage) {
  const saved = saveCurrent({
    name: currentWheelName,
    category: elements.category.value,
    choices: choices.getChoices(),
  });
  if (!saved) announce("Your browser couldn't save this wheel. Check its storage settings.");
  else if (successMessage) announce(successMessage);
  return saved;
}

function refreshWheel() {
  const current = choices.getChoices();
  wheel.draw(current);
  elements.spin.disabled = current.length < 2 || wheel.isSpinning();
  elements.spin.setAttribute("aria-disabled", String(elements.spin.disabled));
}

function setSpinning(isSpinning) {
  elements.category.disabled = isSpinning;
  elements.shuffle.disabled = isSpinning;
  elements.save.disabled = isSpinning;
  elements.share.disabled = isSpinning;
  elements.input.disabled = isSpinning;
  elements.form.querySelector("button").disabled = isSpinning;
  elements.list.querySelectorAll("button").forEach((button) => { button.disabled = isSpinning; });
  elements.library.querySelectorAll("button").forEach((button) => { button.disabled = isSpinning; });
  elements.spin.disabled = isSpinning || choices.getChoices().length < 2;
}

function validChoices(value) {
  return Array.isArray(value)
    && value.length > 0
    && value.length <= MAX_CHOICES
    && value.every((choice) => typeof choice === "string"
      && choice.trim().length > 0
      && choice.trim().length <= MAX_CHOICE_LENGTH);
}

function createWheelInstance() {
  return createWheel(elements.canvas, elements.status, (winner) => {
    const entry = {
      choice: winner,
      wheelName: currentWheelName || getWheelNameFromCategory(elements.category.value),
      category: elements.category.value,
      createdAt: new Date().toISOString(),
    };
    history = [entry, ...history].slice(0, 50);
    const saved = saveHistory(history);
    renderLibrary();
    elements.resultChoice.textContent = winner;
    elements.resultCategory.textContent = `Picked from ${elements.category.selectedOptions[0].textContent.trim()}`;
    if (!elements.resultDialog.open) elements.resultDialog.showModal();
    celebrate();
    if (!saved) announce("The result was picked, but your browser couldn't save history.");
    refreshWheel();
  });
}

const wheel = createWheelInstance();

function renderLibrary() {
  elements.library.replaceChildren();
  const empty = document.createElement("div");
  empty.className = "library-empty";

  const entries = activeTab === "favorites" ? favorites : history;
  if (!entries.length) {
    const icon = document.createElement("div");
    icon.className = "empty-illustration";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = activeTab === "favorites" ? "♡" : "◷";
    const title = document.createElement("p");
    title.className = "empty-title";
    title.textContent = activeTab === "favorites" ? "Your favorites live here" : "No spins just yet";
    const copy = document.createElement("p");
    copy.className = "empty-copy";
    copy.textContent = activeTab === "favorites"
      ? "Save a wheel you love and find it again anytime."
      : "Your picks will show up here after a spin.";
    empty.append(icon, title, copy);
    elements.library.append(empty);
    return;
  }

  const list = document.createElement("ul");
  list.className = "library-list";
  entries.forEach((entry) => {
    const item = document.createElement("li");
    item.className = "library-item";
    const info = document.createElement("div");
    info.className = "library-item-info";
    const title = document.createElement("strong");
    const detail = document.createElement("span");

    if (activeTab === "favorites") {
      const favoriteName = entry.name || "Saved wheel";
      title.textContent = favoriteName;
      detail.textContent = `${entry.choices.length} choices · ${getCategoryLabel(entry.category)}`;
    } else {
      const resultName = entry.wheelName || entry.name || "Current wheel";
      title.textContent = entry.choice;
      detail.textContent = `${resultName} · ${new Date(entry.createdAt).toLocaleString([], {
        dateStyle: "medium",
        timeStyle: "short",
      })}`;
    }

    info.append(title, detail);
    const actions = document.createElement("div");
    actions.className = "library-item-actions";
    const load = document.createElement("button");
    load.type = "button";
    load.className = "library-item-button";
    load.dataset.action = activeTab === "favorites" ? "load" : "repeat";
    load.dataset.id = entry.id ?? "";
    load.dataset.choice = entry.choice ?? "";
    load.dataset.index = String(entries.indexOf(entry));
    load.textContent = activeTab === "favorites" ? "Load" : "Again";
    load.setAttribute("aria-label", `${load.textContent} ${activeTab === "favorites" ? "favorite wheel" : entry.choice}`);
    actions.append(load);

    if (activeTab === "favorites") {
      const rename = document.createElement("button");
      rename.type = "button";
      rename.className = "library-item-button";
      rename.dataset.action = "rename";
      rename.dataset.id = entry.id;
      rename.textContent = "Rename";
      rename.setAttribute("aria-label", `Rename saved wheel ${entry.name || "saved wheel"}`);
      actions.append(rename);

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "library-item-button is-remove";
      remove.dataset.action = "delete";
      remove.dataset.id = entry.id;
      remove.textContent = "×";
      remove.setAttribute("aria-label", "Delete saved wheel");
      actions.append(remove);
    }

    item.append(info, actions);
    list.append(item);
  });
  elements.library.append(list);
}

function setActiveTab(tabName) {
  activeTab = tabName;
  elements.tabs.forEach((tab) => {
    const active = tab.dataset.tab === tabName;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
  });
  elements.library.setAttribute("aria-labelledby", `${tabName}-tab`);
  renderLibrary();
}

function loadSharedWheel() {
  const params = new URLSearchParams(window.location.search);
  if (!params.has("choices")) return null;
  try {
    const category = params.get("category") ?? "activities";
    const sharedChoices = decodeWheelState(params.get("choices"));
    if (!validChoices(sharedChoices) || !PRESETS[category]) return null;
    return { category, choices: sharedChoices.map((choice) => choice.trim()) };
  } catch {
    return null;
  }
}

const sharedWheel = loadSharedWheel();
const savedCurrent = loadCurrent();
currentWheelName = savedCurrent?.name || getWheelNameFromCategory(savedCurrent?.category || "activities");
const initial = sharedWheel ?? (savedCurrent?.choices?.length ? savedCurrent : null);
currentCategory = PRESETS[initial?.category] ? initial.category : "activities";
if (initial) {
  populateCategoryPicker(elements.category, currentCategory);
  choices.setChoices(initial.choices);
  currentWheelName = initial.name || currentWheelName;
} else {
  choices.setChoices(getPresetChoices(elements.category.value));
}
refreshWheel();
renderLibrary();

elements.category.addEventListener("change", () => {
  const previous = choices.getChoices();
  const next = getPresetChoices(elements.category.value);
  const isPreset = Object.values(PRESETS).some((preset) => JSON.stringify(preset) === JSON.stringify(previous));
  if (!isPreset && !window.confirm("Changing category will replace your current choices. Continue?")) {
    populateCategoryPicker(elements.category, currentCategory);
    return;
  }
  currentCategory = elements.category.value;
  choices.setChoices(next);
  persistCurrent("Category choices updated.");
  refreshWheel();
});

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = elements.input.value.trim();
  if (!value) {
    announce("Enter a choice first.");
    elements.input.focus();
    return;
  }
  if (value.length > MAX_CHOICE_LENGTH) {
    announce(`Choices can be up to ${MAX_CHOICE_LENGTH} characters.`);
    return;
  }
  const current = choices.getChoices();
  if (current.length >= MAX_CHOICES) {
    announce(`A wheel can have up to ${MAX_CHOICES} choices.`);
    return;
  }
  if (current.some((choice) => choice.toLocaleLowerCase() === value.toLocaleLowerCase())) {
    announce("That choice is already on your wheel.");
    return;
  }
  const next = [...current, value];
  choices.setChoices(next);
  elements.input.value = "";
  persistCurrent("Choice added to your wheel.");
  refreshWheel();
});

elements.list.addEventListener("click", (event) => {
  const item = event.target.closest(".choice-item");
  if (!item) return;
  const current = item.querySelector(".choice-name").textContent;
  const currentChoices = choices.getChoices();
  if (event.target.closest(".choice-edit")) {
    openNameDialog("Edit this choice", current, (value) => {
      const trimmed = value.trim();
      if (!trimmed || trimmed.length > MAX_CHOICE_LENGTH) {
        announce(`Enter a choice between 1 and ${MAX_CHOICE_LENGTH} characters.`);
        return;
      }
      if (currentChoices.some((choice) => choice !== current && choice.toLocaleLowerCase() === trimmed.toLocaleLowerCase())) {
        announce("That choice is already on your wheel.");
        return;
      }
      choices.setChoices(currentChoices.map((choice) => choice === current ? trimmed : choice));
      persistCurrent("Choice updated.");
      refreshWheel();
    }, "Choice");
    return;
  }
  if (!event.target.closest(".choice-remove")) return;
  const next = currentChoices.filter((choice) => choice !== current);
  choices.setChoices(next);
  persistCurrent("Choice removed.");
  refreshWheel();
});

elements.spin.addEventListener("click", () => {
  if (choices.getChoices().length < 2) {
    announce("Add at least two choices before spinning.");
    return;
  }
  refreshWheel();
  elements.spin.disabled = true;
  void wheel.spin();
});

elements.shuffle.addEventListener("click", () => {
  const next = choices.getChoices();
  for (let index = next.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[randomIndex]] = [next[randomIndex], next[index]];
  }
  choices.setChoices(next);
  persistCurrent("Your choices have been mixed up.");
  refreshWheel();
});

elements.clearAll.addEventListener("click", () => {
  if (!choices.getChoices().length) {
    announce("There are no choices to clear.");
    return;
  }
  if (!window.confirm("Clear all choices from this wheel?")) return;
  choices.clearAll();
  persistCurrent("All choices cleared.");
  refreshWheel();
  announce("All choices cleared.");
});

elements.tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    setActiveTab(tab.dataset.tab);
    elements.clearHistory.hidden = tab.dataset.tab !== "history";
  });
});

elements.library.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const { action, id, choice } = button.dataset;
  if (action === "load") {
    const favorite = favorites.find((item) => item.id === id);
    if (!favorite) return;
    currentCategory = PRESETS[favorite.category] ? favorite.category : "activities";
    currentWheelName = favorite.name || getWheelNameFromCategory(currentCategory);
    populateCategoryPicker(elements.category, currentCategory);
    choices.setChoices(favorite.choices);
    persistCurrent("Favorite wheel loaded.");
    refreshWheel();
  } else if (action === "rename") {
    const favorite = favorites.find((item) => item.id === id);
    if (!favorite) return;
    openNameDialog("Rename this wheel", favorite.name || "Saved wheel", (value) => {
      const trimmed = value.trim();
      if (!trimmed) {
        announce("Please enter a name for this saved wheel.");
        return;
      }
      favorite.name = trimmed;
      if (!saveFavorites(favorites)) {
        announce("Your browser couldn't update this favorite. Check its storage settings.");
        return;
      }
      renderLibrary();
      announce("Favorite renamed.");
    });
  } else if (action === "delete") {
    if (!window.confirm("Remove this saved wheel from Favorites?")) return;
    const previousFavorites = favorites;
    favorites = favorites.filter((item) => item.id !== id);
    if (!saveFavorites(favorites)) {
      favorites = previousFavorites;
      announce("Your browser couldn't update favorites. Check its storage settings.");
      return;
    }
    renderLibrary();
    announce("Favorite removed.");
  } else if (action === "repeat") {
    const entry = history[Number(button.dataset.index)];
    if (entry) {
      currentCategory = PRESETS[entry.category] ? entry.category : "activities";
      currentWheelName = entry.wheelName || entry.name || getWheelNameFromCategory(currentCategory);
      populateCategoryPicker(elements.category, currentCategory);
      if (PRESETS[entry.category]) choices.setChoices(getPresetChoices(entry.category));
      if (!choices.getChoices().includes(choice) && choices.getChoices().length < MAX_CHOICES) {
        choices.setChoices([...choices.getChoices(), choice]);
      }
      persistCurrent(`Added “${choice}” to the current wheel.`);
      refreshWheel();
    }
  }
});

elements.nameForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = elements.nameInput.value.trim();
  if (!value) {
    announce("Please enter a wheel name.");
    elements.nameInput.focus();
    return;
  }
  const action = pendingNameAction;
  pendingNameAction = null;
  elements.nameDialog.close();
  if (typeof action === "function") action(value);
});

elements.nameCancel.addEventListener("click", () => {
  pendingNameAction = null;
  elements.nameDialog.close();
});

elements.nameClose.addEventListener("click", () => {
  pendingNameAction = null;
  elements.nameDialog.close();
});

elements.save.addEventListener("click", () => {
  if (!choices.getChoices().length) {
    announce("Add at least one choice before saving a wheel.");
    return;
  }

  const proposedName = currentWheelName && currentWheelName !== "Current wheel"
    ? currentWheelName
    : getWheelNameFromCategory(elements.category.value);

  openNameDialog("Name this wheel", proposedName, (name) => {
    const value = name.trim();
    if (!value) {
      announce("Please enter a wheel name.");
      return;
    }

    const wheel = {
      id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: value,
      category: elements.category.value,
      choices: choices.getChoices(),
      createdAt: new Date().toISOString(),
    };
    if (favorites.some((entry) => entry.category === wheel.category
      && JSON.stringify(entry.choices) === JSON.stringify(wheel.choices))) {
      announce("This wheel is already in your favorites.");
      return;
    }
    const previousFavorites = favorites;
    favorites = [wheel, ...favorites].slice(0, 100);
    currentWheelName = value;
    if (!saveFavorites(favorites)) {
      favorites = previousFavorites;
      announce("Your browser couldn't save this favorite. Check its storage settings.");
      return;
    }
    setActiveTab("favorites");
    announce("Wheel saved to Favorites.");
  });
});

document.querySelector(".header-help").addEventListener("click", () => {
  announce("Add at least two choices, pick a category, then spin when you’re ready.");
});

async function shareCurrent() {
  try {
    const result = await shareChoices(choices.getChoices(), elements.category.value);
    if (result === "copied") announce("Share link copied!");
    else if (result === "shared") announce("Wheel shared.");
    else announce("Sharing isn't available. Copy the page URL to share this wheel.");
  } catch {
    announce("Sharing was cancelled or isn't available right now.");
  }
}

elements.share.addEventListener("click", shareCurrent);
document.querySelector("#result-share").addEventListener("click", shareCurrent);
elements.spinAgain.addEventListener("click", () => {
  elements.resultDialog.close();
  elements.spin.click();
});
document.querySelector("#result-save").addEventListener("click", () => {
  elements.resultDialog.close();
  elements.save.click();
});
elements.clearHistory.addEventListener("click", () => {
  if (!history.length || !window.confirm("Clear all spin history? This can't be undone.")) return;
  const previousHistory = history;
  history = [];
  if (!saveHistory(history)) {
    history = previousHistory;
    announce("Your browser couldn't clear history. Check its storage settings.");
    return;
  }
  renderLibrary();
  announce("Spin history cleared.");
});

if (window.location.search.includes("choices=") && !sharedWheel) {
  announce("This shared wheel link is invalid, so your saved wheel was kept.");
}
