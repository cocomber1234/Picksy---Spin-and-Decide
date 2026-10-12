---
name: picksy-storage
description: Builds favorites and history using localStorage.
---

Build js/storage.js and the Favorites and History tabs.

Favorites:
- "Save wheel" button asks for a name and saves the wheel (name + choices).
- Favorites tab lists saved wheels. Each can be loaded, renamed, or deleted.

History:
- After every spin, save the result with the wheel name, the winning choice, and the date and time.
- History tab shows the latest 50 results, newest first.
- "Clear history" button.

Rules:
- Wrap localStorage in try/catch.
- Use keys: picksy_favorites, picksy_history, picksy_current.
- Restore the last used wheel when the page loads.
- Show a friendly empty state when there is nothing saved.