# DETOUR — Every street is a choice

An **original retro pixel-art browser adventure** about teenagers navigating everyday social pressure and physical safety. Inspired by the feeling of Game Boy Color-era, top-down exploration games, with original characters, maps, and code-rendered graphics.

> UX/UI concept prototype · Double Diamond: Develop → Deliver · October 2026 · Version 0.2 (three chapters)

![DETOUR game with timed decision dialogue](assets/preview.png)

## Play

**Live game:** https://thomas-lbs.github.io/Initial-DETOUR-game-MVP/

Open `index.html` in a modern browser, or run locally:

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

No dependencies or build steps. Sound is synthesized in-browser using the Web Audio API; no samples or copyrighted music are used. Browsers may require the first user interaction before audio will play. When audio is muted or unsupported, gameplay continues normally. The Google Fonts CSS import is optional and falls back to system fonts.

## Chapters

| # | Story | Decision | Consequences |
|---|---|---|---|
| 1 | **The Shortcut** | Follow Lucas across the road, suggest a crossing, or ask Maya | Non-graphic vehicle collision or safe alternate route |
| 2 | **The Humiliating Photo** | Forward a humiliating photo, refuse, or support Amine | Photo spreads and damages trust, or supportive/boundary-setting responses |
| 3 | **The Rooftop Dare** | Join a climb, stay grounded, or suggest another shot | Non-graphic accident or social pushback / alternative group plan |

Each chapter has its **own original chiptune melody**, new pixel environment, contrasting dialogue bubbles, and a **10-second decision timer**. If time runs out, the situation escalates to the chapter's most difficult scripted outcome. Timeout does not imply the player is morally responsible for other people's harmful actions. The game treats outcomes as possibilities, not predictions.

The player's choices may lead to **critical endings** or **chapter-complete screens**, with a checkpoint replay option. After successful completion, the next chapter unlocks immediately.

## Controls

| Input | Action |
|---|---|
| Arrow keys / WASD | Walk around |
| E / Space | Interact near NPCs |
| 1 / 2 / 3 | Choose an on-screen response |
| P / pause button | Pause or resume the 10-second timer |
| R / restart button | Restart the entire adventure |
| ♫ button | Mute or unmute original chiptune soundtrack |
| Touch D-pad / A | Move / interact on mobile |

The countdown begins **only when a timed conversation appears**. It pauses when the tab becomes hidden or the browser loses focus. The pause button is always available during a decision. Pausing is never penalized.

## UX and safeguarding

DETOUR is a **fictional interactive learning prototype**, not a certified safety curriculum. It uses dramatic outcomes to support reflection. Real consequences are uncertain and depend on context, the decisions of others, and chance. The road collision and rooftop accident are non-graphic. Nobody experiencing bullying is responsible for being victimized; harmful acts remain the responsibility of those who commit them.

The game stores no personal information, analytics, cookies, or accounts. Before research sessions involving minors, obtain relevant consent and safeguarding arrangements and review the content with youth-safety specialists. Validate accessibility, emotional impact, and educational transfer through actual user research.

**Research-informed problem statement (not yet validated):**

> Teenagers aged 14–17 need a way to navigate potentially unsafe social or physical situations in their everyday lives while maintaining their independence and sense of belonging, because peer influence, uncertainty, and social expectations can make it difficult to assess risks and make informed decisions.

**Core loop:** Explore → Meet people → Notice context → Make a decision → Experience one plausible outcome → Reflect → Retry or continue.

## Project structure

- `index.html` — semantic page, canvas, speech bubbles, decision timer, and controls
- `styles.css` — responsive UI; automatic light/dark speech-bubble text contrast
- `logic.js` — testable chapter data, collision boundaries, and outcome rules
- `music.js` — original procedural chiptune soundtrack and optional sound effects
- `game.js` — tile drawing, NPC interactions, narrative scenes, timer, checkpoints, and animation
- `tests/` — automated Node tests for movement, chapter data, and consequence mapping
- `.github/workflows/test.yml` — automatic CI tests on pushes / pull requests
- `assets/preview.png` — gameplay screenshot used only for the README

Run tests:

```sh
node --test tests/*.test.js
```

## Publish / update

The static project deploys to GitHub Pages from `main` and the repository root. The GitHub Pages URL is linked above. Pushing changes to `main` updates the live site after GitHub completes deployment.

## License

MIT; see [`LICENSE`](LICENSE).