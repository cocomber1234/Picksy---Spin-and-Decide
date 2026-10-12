# Picksy Website - Copilot Instructions

## Project context

Project name: Picksy

Picksy is a fun decision-making website for people who cannot choose what to do. Users spin a colorful wheel of custom choices and get a random result.

Current priority: Build and refine the core spin experience first (wheel, choices, result).

Known features:
- Colorful spin wheel with custom choices
- Random picks for activity, food, game, or movie
- Add, remove, and edit choices
- Save favorite wheels and view past results (history)
- Winning animation with confetti
- Share a wheel with friends

Important: Start with ONE wheel. Custom categories beyond Activities, Food, Games, and Movies are a later phase. Do not invent extra features, accounts, or backend requirements. Keep unknown parts as placeholders until requirements are provided.

## Tech and architecture

- HTML, CSS, vanilla JavaScript (ES modules). No backend, no framework unless the project already uses one.
- Data is stored in localStorage only.
- Folder layout: index.html, css/styles.css, js/app.js, js/wheel.js, js/choices.js, js/storage.js, js/effects.js, js/presets.js.
- Follow the existing structure and naming. Do not replace working architecture without a clear reason.

## Current implementation scope

Focus on these flows before anything else:
1. User opens Picksy and sees a wheel with a default set of choices.
2. User picks a category or adds their own choices.
3. User presses SPIN and the wheel spins with a smooth slow-down.
4. The pointer and the result always match.
5. A winner popup appears with confetti.
6. User can spin again, save the wheel, or share it.
7. User can open Favorites and History and reload a saved wheel.

## Skills required

### UI/UX design
- Playful, colorful, friendly look with rounded corners
- Visual hierarchy: the wheel and SPIN button are the main focus
- Layout, spacing, typography, and color contrast
- Consistent components
- Mobile-first responsive design
- Empty, loading, spinning, success, and error states
- Clear user feedback (toasts, popups)

### Frontend development
- Semantic HTML
- Flexbox/Grid and responsive CSS
- Canvas drawing and animation (requestAnimationFrame, easing)
- Event handling and state management
- Form handling for choices
- Reusable, modular code with clear comments

### Data and storage
- localStorage with try/catch around every read and write
- Keys: picksy_favorites, picksy_history, picksy_current
- Graceful fallback when storage is empty, full, or blocked
- Validate and sanitize any saved or shared data before use

### Security
- Never use innerHTML with user-entered choices. Use textContent.
- Treat data from share links as untrusted: decode safely, validate it is an array of short strings, limit the count and length, and ignore bad data.
- Never hard-code secrets, keys, or tokens.
- Avoid unsafe DOM insertion and eval-like patterns.

### Accessibility
- Proper labels on all inputs
- Keyboard-accessible controls with visible focus states
- Sufficient color contrast, including text on wheel slices
- The canvas wheel needs a text alternative: announce the result with an aria-live region
- Respect prefers-reduced-motion (shorten the spin, skip confetti)
- Use ARIA only when semantic HTML is not enough

### Testing and debugging
- Test spinning with 2, 5, and 20 choices
- Test fewer than 2 choices (show a message, no spin)
- Test empty, duplicate, and very long choice text
- Test add, edit, and delete choices
- Test save, load, and delete favorites
- Test history saving and clearing
- Test share link create and load, including a broken link
- Test the result matches the pointer
- Test small (360px) and large screens
- Check the browser console for errors

### Git and maintainability
- Keep changes small and focused
- Reuse existing code and styles first
- Inspect related files before changing unfamiliar code
- Briefly explain assumptions when requirements are missing

## UI behavior requirements

Required states:
- Default (preset loaded)
- Editing choices
- Not enough choices
- Spinning (SPIN button disabled)
- Winner popup with confetti
- Empty Favorites and History
- Link copied toast
- Mobile layout

The interface should:
- Make SPIN the obvious primary action
- Keep Save and Share easy to find without competing with SPIN
- Show messages near the relevant area
- Keep the user's choices after a page reload
- Never lose the user's wheel without a confirmation (for example "Clear all")

## Coding workflow

Before implementing:
1. Inspect the current project structure.
2. Identify existing patterns and reuse them.
3. Check which agent file (.github/agents) owns the task.

When implementing:
1. Build the smallest working change.
2. Keep wheel drawing, choice logic, storage, and effects in separate modules.
3. Keep text easy to edit later.
4. Avoid unnecessary dependencies and libraries.

After implementing:
1. Run available tests, linting, and checks.
2. Verify the main spin flow end to end.
3. Check responsive behavior.
4. Summarize what changed and note any assumptions.