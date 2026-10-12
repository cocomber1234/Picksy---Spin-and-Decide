---
name: picksy-choices
description: Builds choice management and preset categories.
---

Build js/choices.js and js/presets.js.

Choices panel:
- Add a choice using an input and an Add button (also works with Enter).
- Edit a choice inline.
- Remove a choice with a delete button.
- No empty or duplicate choices. Limit to 20 choices.
- "Clear all" button with a confirmation.

Presets in presets.js (each has 8 to 10 items):
- Activities, Food, Games, Movies.
- A category picker loads the preset into the wheel. The user can still edit it afterward.
- Add a "Custom" option that starts empty.

Every change must update the wheel through a function from wheel.js.