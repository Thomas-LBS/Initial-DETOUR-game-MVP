# DETOUR — Every street is a choice

A **playable, original pixel-art browser game** about teenage autonomy, social pressure, and road safety. Inspired by the feel of Game Boy Color-era top-down adventures, but with original art rendered programmatically.

> UX/UI concept prototype · Double Diamond: Develop → Deliver · October 2026

## Quick start

Open `index.html` in any modern browser. No build step, external assets, account, or API key is required. (The optional Google Fonts import can fall back to system fonts when offline.)

For local development, run:

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

Or publish the static files using GitHub Pages / Netlify / Vercel.

## Controls

| Input | Action |
|---|---|
| Arrow keys or WASD | Move character |
| E or Space | Interact with nearby NPC or object |
| R | Restart entire chapter |
| On-screen D-pad / A button | Touch controls |
| ♫ button | Toggle generated audio (off by default) |
| ↻ button | Restart chapter |

## What's playable in the MVP

- Original top-down, tile-based neighborhood and pixel characters drawn entirely with Canvas.
- Explore the school area and find Lucas (orange `!` marker).
- Optional conversation with Maya reveals a traffic visibility clue.
- Choose **follow Lucas**, **suggest a marked crossing**, or **ask Maya**.
- Following Lucas triggers a **non-graphic, stylized school-bus collision**, game-over screen, and immediate checkpoint retry.
- Choosing the marked crossing plays an alternate route and chapter-completion screen.
- Exploration journal shows quest progress and contextual reflection.
- Touch and keyboard support, responsive layout, sound toggle.
- No analytics, cookies, tracking, dependencies, accounts, or data collection.

### Safety and learning notes

This is a **fictional design prototype**, not a road-safety training certification. A specific choice is scripted to produce a collision for demonstration; real-world risk and consequences are probabilistic, and motorists / infrastructure share responsibility. The game avoids graphic injuries and does not depict victims as blameworthy. Before use with actual minors, obtain appropriate safeguarding and content review and conduct usability testing.

## Files

- `index.html` — semantic page, canvas, dialogue and game UI
- `styles.css` — responsive editorial / retro-game visual system
- `logic.js` — pure rules and state transitions, unit-testable
- `game.js` — rendering, input, branching narrative, checkpoint and overlays
- `tests/logic.test.js` — Node built-in test runner

Run tests:

```sh
node --test tests/logic.test.js
```

## UX framing

**Research-informed problem statement (unvalidated):**

> Teenagers aged 14–17 need a way to navigate potentially unsafe social or physical situations in their everyday lives while maintaining their independence and sense of belonging, because peer influence, uncertainty, and social expectations can make it difficult to assess risks and make informed decisions.

**Hypothesized Aha! moment:** *I can speak up and find a safer route without abandoning my friends.*

**Core loop:** Explore → Notice cues → Talk → Decide → Experience outcome → Reflect → Replay.

### Next UX steps

1. Conduct age-appropriate concept/usability tests with 14–17-year-old participants using parental/guardian procedures as needed.
2. Check if the pixel-art presentation and dialogue feel credible, rather than patronizing.
3. Measure if players notice road cues and can explain alternatives in an unfamiliar scenario.
4. Review the consequences with an experienced road-safety educator.
5. Expand beyond deterministic win/lose outcomes into more nuanced branching paths and further scenarios.

## Deploy to GitHub Pages

1. Open this repository: https://github.com/Thomas-LBS/Initial-DETOUR-game-MVP
2. In **Settings → Pages**, choose **Deploy from a branch**, branch `main`, folder `/ (root)`.
3. After the build, play at https://thomas-lbs.github.io/Initial-DETOUR-game-MVP/.

## License

MIT — see `LICENSE`.