---
name: picksy-wheel
description: Builds the spinning wheel in js/wheel.js.
---

Build the wheel in js/wheel.js using HTML canvas.

Requirements:
- Draw a wheel with one colorful slice per choice and the text label on each slice.
- Use a bright, distinct color palette that repeats if there are many choices.
- Pointer at the top of the wheel.
- SPIN button starts a smooth spin with easing (fast start, slow stop) for 3 to 5 seconds, with a random result.
- Calculate the winner from the final angle so the pointer matches the result exactly.
- Redraw automatically when choices change.
- Disable the SPIN button while spinning.
- Export: drawWheel(choices), spinWheel(onResult).
- Handle edge cases: fewer than 2 choices shows a message instead of spinning.