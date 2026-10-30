# DETOUR — Every street is a choice

An **original retro pixel-art browser adventure** about teenagers navigating everyday social pressure and physical safety. Inspired by the feeling of Game Boy Color-era, top-down exploration games, with original characters, maps, and code-rendered graphics.

> UX/UI concept prototype · Double Diamond: Develop → Deliver · October 2026 · Version 0.3 (four choices, no countdown)

## Play

**Live game:** https://thomas-lbs.github.io/Initial-DETOUR-game-MVP/

Open `index.html` in a modern browser, or run locally:

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

No dependencies or build steps. Sound is synthesized in-browser using the Web Audio API; no samples or copyrighted music are used. Browsers may require the first user interaction before audio will play. When audio is muted or unsupported, gameplay continues normally. The Google Fonts CSS import is optional and falls back to system fonts.

## Chapters

Each chapter now offers **four distinct paths**. Choosing is never timed, and there is no automatic bad ending for hesitation.

| Chapter | Individual safe choice | Cooperative positive resolution | Social fallout / ridicule | Real danger |
|---|---|---|---|---|
| 1. **The Shortcut** | Use the crossing yourself | Invite Lucas and Maya to cross as a group | Call out Lucas; face mockery and exclusion | Follow Lucas across traffic; non-graphic bus collision |
| 2. **The Humiliating Photo** | Refuse sharing and report privately | Support Amine with Maya; seek help together | Challenge Lucas publicly; friends ridicule or exclude you | Share the image; bullying spreads and privacy is put at risk |
| 3. **The Rooftop Dare** | Keep a safe distance | Suggest a creative ground-level shot together | Leave the group; face teasing and exclusion | Climb; a loose foothold leads to a non-graphic fall |

Consequences are scripted plausible examples, not guaranteed real-world outcomes. Bullying victims are **never responsible for being targeted**, and neither asking for help nor declining a dangerous activity is wrong. The soundtrack remains three original synthesized chiptune themes; it creates atmosphere **without a timer**.

The player's choices may lead to a dramatic **danger ending** or to an **outcome-specific reflection screen** including an optional replay. Non-danger outcomes (including difficult social endings) allow progression to the next chapter.

## Controls

| Input | Action |
|---|---|
| Arrow keys / WASD | Walk around |
| E / Space | Interact near NPCs |
| 1 / 2 / 3 / 4 | Choose an on-screen response |
| R / restart button | Restart the adventure |
| ♫ button | Mute or unmute original chiptune soundtrack |
| Touch D-pad / A | Move / interact on mobile |

**There is no countdown, pause key, automatic timeout or forced choice.** Take time to read the dialogue, consider the situation, and decide.

## UX and safeguarding

DETOUR is a **fictional interactive learning prototype**, not a certified safety curriculum. It uses dramatic outcomes to support reflection. Real consequences are uncertain and depend on context, the decisions of others, and chance. The road collision and rooftop accident are non-graphic. Nobody experiencing bullying is responsible for being victimized; harmful acts remain the responsibility of those who commit them.

The game stores no personal information, analytics, cookies, or accounts. Before research sessions involving minors, obtain relevant consent and safeguarding arrangements and review the content with youth-safety specialists. Validate accessibility, emotional impact, and educational transfer through actual user research.

**Research-informed problem statement (not yet validated):**

> Teenagers aged 14–17 need a way to navigate potentially unsafe social or physical situations in their everyday lives while maintaining their independence and sense of belonging, because peer influence, uncertainty, and social expectations can make it difficult to assess risks and make informed decisions.

**Core loop:** Explore → Meet people → Notice context → Make a decision → Experience one plausible outcome → Reflect → Retry or continue.

## Project structure

- `index.html` — semantic page, canvas, speech bubbles, four choices, and controls
- `styles.css` — responsive UI; automatic light/dark speech-bubble text contrast
- `logic.js` — testable chapter data, movement boundaries, and outcome rules
- `music.js` — original procedural chiptune soundtrack and optional sound effects
- `game.js` — tile drawing, NPC interactions, narrative scenes, choice outcomes, checkpoints, and animation
- `tests/` — automated Node tests for movement, chapter data, and consequence mapping
- `.github/workflows/test.yml` — automatic CI tests on pushes / pull requests

Run tests:

```sh
node --test tests/*.test.js
```

## Publish / update

The static project deploys to GitHub Pages from `main` and the repository root. The GitHub Pages URL is linked above. Pushing changes to `main` updates the live site after GitHub completes deployment.

## License

MIT; see [`LICENSE`](LICENSE).
## Version 4: comic consequence cinematics

Three original, non-graphic pixel-art cutscenes: a school-bus collision with a flying shoe and exaggerated crash cloud; a rooftop slip with a tumbling phone; and a bullying photo that goes viral until Amine leaves the group chat. The satire is aimed at risky actions and group behavior, not at the victim. Original chiptune stings play with each event. The decision timer remains removed. All CSS and JS asset URLs use `?v=4` to reduce stale caches on GitHub Pages. Reduced-motion preferences disable screen shaking.

## Version 5: game-first cosmic redesign

- Rebuilt the page as an immersive, CrazyGames-inspired game portal layout, with original design and branding.
- Palette sampled from the provided purple-night reference: `#0D0407`, `#23172F`, `#32204A`, `#482F69`, and `#69488D`.
- The game viewport occupies **76% of the viewport height**, or more on responsive layouts. Native pixel-art aspect ratio is preserved without stretching.
- Dark-background/light-text and light-background/dark-text combinations are applied to foreground location labels and comic-style NPC speech bubbles.
- A visible **EXPLORE / E · TALK / DECIDE** HUD sits above the canvas drawing rather than behind it.
- Clickable chapter selector, touch controls, and a fullscreen action. Existing chapters, four-choice branching stories, untimed decisions, and original audio are preserved.
- Assets use query-string version `v=5` to reduce stale-cache problems after Pages deployment.
- Includes five new static UI/layout tests, with explicit contrast checks during design.
