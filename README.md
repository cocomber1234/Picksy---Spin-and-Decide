# 🎡 Picksy

**Can't decide? Spin it.**

Picksy is a fun decision-making website for people who cannot choose what to do. Add your options, spin the colorful wheel, and let Picksy pick for you.

🔗 **Live demo:** ` https://cocomber1234.github.io/Picksy---Spin-and-Decide/` 

---

## ✨ Features

- **Colorful spin wheel** with your own custom choices
- **Random picks** for activities, food, games, or movies using built-in presets
- **Add, edit, and remove** choices anytime
- **Favorites**: save your wheels and load them later
- **History**: view your past results
- **Winning animation** with a confetti burst
- **Share with friends** through a link that contains your wheel
- **Responsive design** that works on phones, tablets, and desktops

> Picksy starts with one wheel. More custom categories will be added in a later phase.

---

## 🛠️ Tech Stack

- HTML
- CSS
- Vanilla JavaScript (ES modules)
- HTML Canvas for the wheel and confetti
- `localStorage` for saving data (no backend, no accounts)

---

## 📁 Project Structure

```
picksy/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── app.js         # Entry point, connects all modules
│   ├── wheel.js       # Wheel drawing and spin logic
│   ├── choices.js     # Add, edit, remove choices
│   ├── presets.js     # Preset categories
│   ├── storage.js     # Favorites and history
│   └── effects.js     # Winner popup, confetti, sharing
├── .github/
│   ├── copilot-instructions.md
│   └── agents/
│       ├── picksy-lead.agent.md
│       ├── picksy-wheel.agent.md
│       ├── picksy-choices.agent.md
│       ├── picksy-storage.agent.md
│       ├── picksy-effects.agent.md
│       └── picksy-qa.agent.md
└── README.md
```

---

## 🚀 Getting Started

No installation needed.

1. Download or clone this repository.
2. Open `index.html` in your browser.

If your browser blocks ES modules when opening the file directly, run a simple local server instead:

```bash
# Python
python -m http.server 8000

# or Node.js
npx serve
```

Then open `http://localhost:8000`.

## 🎮 How to Use

1. **Pick a category** (Activities, Food, Games, Movies) or choose **Custom** to start empty.
2. **Edit your choices**: add new ones, change existing ones, or delete the ones you don't want.
3. Press **SPIN** and wait for the wheel to stop.
4. See your **winner** with confetti. Spin again if you like.
5. Press **Save wheel** to keep it in Favorites.
6. Press **Share** to copy a link and send it to a friend.

### Rules for choices

- At least 2 choices are needed to spin.
- No empty or duplicate choices.
- Maximum of 20 choices per wheel.

---

## 💾 Data and Privacy

Everything is stored in your own browser using `localStorage`. Nothing is sent to a server.

| Key | What it stores |
| --- | --- |
| `picksy_current` | The wheel you were last using |
| `picksy_favorites` | Your saved wheels |
| `picksy_history` | Your latest 50 results |

Clearing your browser data will remove them.

---

## 🔒 Security Notes

- Choices are rendered with `textContent`, never `innerHTML`.
- Data from share links is treated as untrusted. It is validated (array of short text items, limited count and length) before use.
- No secrets, API keys, or tokens are used.

---

## ♿ Accessibility

- Labeled inputs and keyboard-accessible controls with visible focus states
- Good color contrast, including text on wheel slices
- Results are announced to screen readers through an `aria-live` region
- Respects `prefers-reduced-motion` (shorter spin, no confetti)

---

## 🤖 Built with GitHub Copilot Agents

Picksy is built using custom Copilot agents, each with one job. Global rules live in `.github/copilot-instructions.md`.

| Agent | Responsibility |
| --- | --- |
| `picksy-lead` | Project setup, file structure, design rules |
| `picksy-wheel` | Canvas wheel, spin animation, result calculation |
| `picksy-choices` | Choice management and preset categories |
| `picksy-storage` | Favorites and history with `localStorage` |
| `picksy-effects` | Winner popup, confetti, share links |
| `picksy-qa` | Review, bug fixes, polish, final README check |

**Suggested order:** lead → wheel → choices → storage → effects → qa

---

## 🧪 Testing Checklist

- [ ] Spin works with 2, 5, and 20 choices
- [ ] Fewer than 2 choices shows a message and does not spin
- [ ] The result always matches the pointer
- [ ] Add, edit, and delete choices work
- [ ] Empty, duplicate, and very long choices are handled
- [ ] Save, load, and delete favorites work
- [ ] History saves and clears correctly
- [ ] Share link works, and a broken link is handled safely
- [ ] Layout works from 360px wide up to desktop
- [ ] No errors in the browser console
- [ ] Site loads correctly on the GitHub Pages link (no broken CSS or JS paths)

---

## 🗺️ Roadmap

- [x] Single wheel with preset categories
- [x] Custom choices, favorites, history
- [x] Confetti and share links
- [ ] More custom categories
- [ ] Sound effects
- [ ] Themes and wheel color options

---

## 📄 License

To be decided.