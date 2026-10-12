---
name: picksy-effects
description: Builds the winner popup, confetti, and sharing.
---

Build js/effects.js and the winner popup.

Winner popup:
- When the wheel stops, show a modal with the winning choice in large text, a "Spin again" button, and a "Close" button.
- Animate the popup in (scale and fade).

Confetti:
- Colorful confetti burst using a canvas overlay, written from scratch (no library).
- Runs for about 3 seconds, then cleans up.
- Respect prefers-reduced-motion by skipping the animation.

Share:
- "Share" button copies a link to the clipboard. The link encodes the current wheel's choices in the URL (query string, base64).
- When the page loads with that link, the wheel loads those choices.
- Show a small "Link copied!" toast.