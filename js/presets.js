// Canonical starter categories. Each preset carries a full starter list so the
// user can load a category and then customize it further.
export const PRESETS = {
  activities: [
    "Go for a walk",
    "Try a new recipe",
    "Call a friend",
    "Have a cozy night",
    "Go to a museum",
    "Take a scenic drive",
    "Try a local café",
    "Plan a mini adventure",
    "See live music",
    "Visit a bookstore",
  ],
  food: [
    "Tacos",
    "Sushi",
    "Pizza",
    "Something sweet",
    "Fresh ramen",
    "Berry smoothie bowl",
    "Brunch spot",
    "Burrito night",
    "Ice cream run",
    "A food truck",
  ],
  games: [
    "Charades",
    "A board game",
    "Trivia",
    "A cozy game",
    "A solo puzzle",
    "A quick card game",
    "A party game",
    "Guess the song",
    "A word game",
    "A racing game",
  ],
  movies: [
    "A comedy",
    "A mystery",
    "A classic",
    "A documentary",
    "An animated film",
    "A sci-fi adventure",
    "A feel-good movie",
    "A horror movie",
    "A romance movie",
    "A new release",
  ],
  custom: [],
};

export function getPresetChoices(category) {
  const preset = PRESETS[category];
  return preset ? [...preset] : [...PRESETS.activities];
}

export function populateCategoryPicker(select, selected = "activities") {
  if (!select) return;
  const next = PRESETS[selected] ? selected : "activities";
  select.value = next;
}
