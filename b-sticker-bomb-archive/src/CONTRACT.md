# Build contract: Scout Life homepage mockup, Direction B (Sticker-Bomb Scrapbook)

Everyone builds pieces that get stitched into ONE page by `src/build.py`. Read this whole file first.
Requirements doc (source of truth for behavior): `../../ScoutLife-Homepage-Redesign-Requirements.md` (sections 3, 4, 7, 8 matter most).

## Paths
- Mac path (file tools Read/Write/Edit): `/Users/bwursten/Documents/GitHub/sl-mockups/b-sticker-bomb/`
- Linux path (bash): `/sessions/youthful-gifted-feynman/mnt/sl-mockups/b-sticker-bomb/`
- Build: `cd <linux path> && python3 src/build.py` → writes `index.html`. Safe to run any time.
- Syntax check your JS: `node --check src/widgets/<id>.js`

## Files you may touch
Only your own files (listed per owner below). **Do not edit** `base.css`, `core.js`, `build.py`, `CONTRACT.md`, or anyone else's files.
- Widget module = 3 files: `src/widgets/<id>.html`, `src/widgets/<id>.css`, `src/widgets/<id>.js`
- Eggs = `src/eggs/eggs.css`, `src/eggs/eggs.js` (more files OK under `src/eggs/`)
- Shell = `src/shell.html`, `src/shell.css`, `src/shell.js`
- Images you download: `assets/img/<your-prefix>-<slug>.jpg` (prefix = widget id, `hero`, `shelf`, `egg`, etc.)

## Hard rules
1. **Look & feel:** Sticker-bomb scrapbook. Cards set at slight angles, tape strips, die-cut sticker buttons with thick ink outlines + hard offset shadows, doodles in margins (Gochi Hand), notebook/kraft textures. Bright, loud, playful, but organized and readable.
2. **Gender-neutral.** It shouldn't read as feminine or masculine. Use the palette in `base.css` (tomato, orange, sunny, lime, teal, sky, cobalt + paper/kraft/ink). **No pink/magenta/lavender, no pastel "princess" looks, no camo/military/skulls/flames-as-aggression, no "for boys/for girls" imagery.** Icons and themes: nature, science, crafts, food, space, animals, games, tools, outdoors.
3. **No gambling cues anywhere.** No coins, tokens, credits, jackpots, 7s/cherries/bars/bells, "spin to win," "lucky," "bet," "prize," casino lights or payout sounds.
4. **Easter eggs = mini interactions/animations/games.** Not links to hidden content, not bonus jokes.
5. **Mascot:** Scout the Maileagle only, sparingly (images in `assets/mascot/`). No other mascots.
6. **Real content:** Real Scout Life article titles, real links (absolute `https://scoutlife.org/...` etc.), real images. You may `web_fetch` scoutlife.org pages to find more. Download images locally with curl into `assets/img/` (use the `i0.wp.com/...?...resize=W%2CH&ssl=1` URLs at a sensible size, ~600px wide for cards, ~1200px for the hero) and reference them as `assets/img/...` (relative). Keep each image under ~150 KB.
7. **No external libraries, no CDNs, no network calls at runtime.** Vanilla JS + CSS only. Emoji are OK for small icons; inline SVG preferred for drawn things.
8. **Accessibility:** WCAG 2.2 AA. Real `<button>`s for actions, labels on controls, visible focus, `aria-live="polite"` on areas whose result changes, everything keyboard-operable, tap targets ≥ 44px.
9. **Motion:** Check `SL.motionOK()` before JS-driven animation and provide an instant/fade alternative. CSS animation is auto-killed under reduced motion / pause (see `html.motion-off` in base.css), so make sure end states still look right without animation. Listen to `document` event `sl:motion` if you run loops (requestAnimationFrame), and stop them when `!SL.motionOK()`.
10. **No-JS fallback:** The `.html` fragment must show meaningful static content + working links before JS runs. JS enhances.
11. **No personal data, no free-text input that's stored.**
12. Scope ALL your CSS under your root class (`.w-<id>` for widgets, `.egg-` prefix for eggs, shell uses its own classes). Don't style bare elements globally.
13. JS: wrap in an IIFE with `'use strict'`. No globals except through `window.SL`. ES2017 is fine.

## Shared API (`window.SL`, from core.js; loads first)
- `SL.widget('id', function(rootEl){...})`: register your widget init (runs on DOM ready; auto fires `widget_view`).
- `SL.trackInteract('id','action')`: call on every play (spin/vote/flip/carve/rate...).
- `SL.track(name, params)`, `SL.eggFound('egg-id')`: analytics stubs (console).
- `SL.motionOK()`, event `sl:motion`.
- `SL.confetti(x,y,{count,shapes,colors,spread})`, `SL.confettiAt(el,opts)`: sticker confetti burst.
- `SL.toast('msg')`: small status pop-up.
- `SL.lazy(el, fn)`: run fn when near viewport. `SL.rand`, `SL.shuffle`, `SL.$`, `SL.$$`, `SL.wait(ms)`, `SL.store.get/set`.
- `SL.searchEggs['word'] = function(q){ return Promise }`: eggs register search gags; shell calls `SL.runSearch(q)`.

## Shared CSS (base.css)
Tokens: `--paper --paper-2 --kraft --ink --ink-soft --white --tomato --tomato-dk --orange --sunny --lime --green-dk --teal --teal-dk --sky --cobalt --cobalt-dk`, section colors `--c-games(cobalt) --c-jokes(sunny) --c-outdoors(lime) --c-hobbies(tomato) --c-scouts(teal) --c-features(orange) --c-quizzes(sky)`, fonts `--f-display(Ultra) --f-sub(Patua One) --f-body(Nunito) --f-doodle(Gochi Hand) --f-pixel(Press Start 2P)`, `--line --radius --shadow --shadow-sm --slot-h(460px) --ease-bounce`.
Classes: `.btn` (+ `.btn-tomato .btn-orange .btn-teal .btn-lime .btn-sky .btn-white .btn-cobalt .btn-sm .btn-pill`), `.chip`, `.sticker` (+ `.round .flag-new .flag-hot .flag-seasonal`, `.label-games/jokes/outdoors/hobbies/scouts/features/quizzes`), `.taped`, `.display .sub .doodle`, `.sr-only`, `.container`, ad classes.
Text on colors: ink text on sunny/lime/teal/sky/orange/tomato; white text only on `--cobalt`, `--cobalt-dk`, `--teal-dk`, `--green-dk`, `--tomato-dk`, `--ink`.

## Widget frame (REQUIRED markup for every widget's root)
```html
<section class="widget slot-S w-joke" data-widget="joke" data-slot="z1-1" aria-labelledby="w-joke-title"
         style="--tilt:-1.2deg;--accent:var(--sunny);--tape:rgba(18,181,165,.6)">
  <header class="widget-head">
    <span class="widget-icon" aria-hidden="true">😂</span>
    <h2 class="widget-title" id="w-joke-title">Joke of the Day</h2>
    <span class="widget-kicker">ha!</span>          <!-- optional doodle -->
  </header>
  <div class="widget-body"> … your play area … </div>
  <footer class="widget-foot"><a class="more-link" href="https://jokes.scoutlife.org/">More jokes</a></footer>
</section>
```
- Size class: `slot-S` or `slot-W`, as assigned below. Height is FIXED at `var(--slot-h)` = **460px** at every breakpoint. Your content must fit (use `overflow:hidden` / internal scrolling only as last resort).
- Widths to design for: **S** ≈ 385px desktop, ≈ 340px tablet, **343px** on a 375px phone. **W** ≈ 795px desktop, ≈ 700px tablet, **343px phone** (W must collapse gracefully to phone width, still 460px tall).
- Tilt: pick something between -1.5deg and 1.5deg. Set `--accent` (header color) and `--tape`.

## Page layout (shell builds this; widget slots are placeholders `<!--WIDGET:id-->`)
Grid: 3 equal columns desktop (≥1024), 2 columns tablet (640–1023), 1 column phone. `slot-S` spans 1, `slot-W` spans 2 (1 on phone). Ad cells are grid items too.
```
LEADERBOARD AD (728x90 / 320x50 phone)
HEADER (logo, mega-menu nav, search, Subscribe) → compact sticky bar on scroll
HERO (1 big + 4 secondary, hand-picked)
ZONE 1: [joke S] [ideamachine S] [AD 300x250] / [reqfinder W] [poll S]
FEATURE BAND: Video of the Week + Subscribe promo
ZONE 2: [seasonal W] [AD 300x600, spans 2 rows] / [arcade W] / [gear W] [quiz S]
ZONE 3: [shelf-fun W] [pinewood S] / [fishing S] [shelf-scouting W] / [shelf-outdoors W] [AD 300x250]
FOOTER (incl. #campfire night-sky band for eggs)
```

## Owners & widget IDs
| Owner | IDs / files | Size |
|---|---|---|
| Agent SHELL | shell.html/css/js: leaderboard ad, header, mega menus, search panel, sticky header, mobile drawer, hero, zones + ad cells, feature band (video + subscribe), the 3 section shelves (`shelf-fun`, `shelf-scouting`, `shelf-outdoors`, built directly in shell.html with the widget frame), footer, pause toggle | shelves W |
| Agent A | `joke` (S), `reqfinder` (W), `poll` (S), `quiz` (S) | |
| Agent B | `ideamachine` (S), `arcade` (W), `pinewood` (S) | |
| Agent C | `seasonal` (W, Halloween skin), `gear` (W), `fishing` (S) | |
| Agent EGGS | `src/eggs/*`: all page-level Easter eggs | |

## Egg anchors the SHELL must provide (EGGS agent relies on these exact hooks)
- `#site-header`: the header element. `#site-logo`: the logo link/button wrapper; `#site-logo-img`: the `<img>` (src `assets/logo/logo-red.png`).
- `[data-egg-anchor="squirrel"]`: a `position:relative` empty `<span>` inside the nav item "Outdoors & Gear".
- `[data-egg-anchor="airplane"]`: a ~70×50 empty positioned box in a corner of the hero.
- `[data-egg-anchor="pond"]`: a ~260×90 "pond" spot (water drawn by shell in CSS, blue with ripples) inside the `shelf-outdoors` widget's body.
- `#campfire`: a footer band ~300px tall with a dark night-sky background (shell draws sky color + ground silhouette; EGGS fill it with campfire, s'mores, stars, fireflies).
- `#egg-hint`: small text near the campfire: "Psst… there are secrets hidden on this page."
- `#search-form` / `#search-input`: on submit, shell calls `SL.runSearch(input.value)` (shell must `preventDefault`).
- `.hero-card` class on every hero promo card; `.widget` on every widget (critters use these as perches).
- `#pause-anim` button (header utility area) toggles `SL.setPaused(!SL.paused)` and reflects state with `aria-pressed`.

## Widget-owned eggs (built inside the widget by its owner)
joke: 5 groans → widget melts & boings back · ideamachine: triple match → happy dance · arcade: joystick full circle → 10-sec mini-game on the screen · seasonal: secret pumpkin face → pumpkin comes alive; "shave and a haircut" knock → ghost conga; bat critter on the widget · gear: swipe past last card → backpack bursts · fishing: jumping fish you can tap mid-air. Call `SL.eggFound('<id>')` when triggered.

## Real content you can use (from scoutlife.org homepage, Oct 2026)
Images: `https://i0.wp.com/scoutlife.org/wp-content/uploads/<path>?resize=600%2C338&ssl=1`
- Ghost decoration (Hobbies/How To): /hobbies-projects/projects/192234/how-to-make-a-ghost-decoration-using-a-cardboard-tube/ · img 2026/09/ghost-featured.jpg
- Compass Game (Scouting Around): /about-scouts/scouting-around/191944/use-the-compass-game-to-improve-your-navigation-skills/ · img 2026/09/compass-game-feature3.jpg
- Morse Code Translator (Fun Stuff): /hobbies-projects/funstuff/575/morse-code-translator/ · img 2007/02/morsecode-1.jpg
- Multisport MB quiz (Quizzes): /quizzes/191897/how-much-do-you-know-about-the-multisport-merit-badge/ · img 2026/08/multisport-featured.jpg
- Write a Funny Caption: /games/write-a-funny-caption/192217/write-a-funny-caption-for-this-photo-175/ · img 2026/09/funnycaption-feature.jpg
- Creepy But Cool critters (Animals & Nature): /outdoors/animals-and-nature/192183/creepy-but-cool-these-5-critters-are-more-helpful-than-scary/ · img 2026/09/creepycrawlies-feature.jpg
- Diary of a Wimpy Kid author interview (Features): /features/192278/lets-talk-to-the-author-of-diary-of-a-wimpy-kid/ · img 2026/09/jeff-kinney-wimpy-kid.jpg
- Invite your friends (Scouting Around): /about-scouts/scouting-around/191490/invite-your-friends-to-make-scouting-even-more-fun/ · img 2026/07/recruiter-1.jpg
- 101 Funny Halloween Jokes (Features): /features/23079/funny-halloween-jokes/ · img 2018/10/halloween-feature.jpg
- Memorize the Scout Law: /about-scouts/182075/memorize-the-scout-law/ · img 2024/08/scoutlaw-feature.jpg
- Faux stained-glass pumpkin: /hobbies-projects/projects/182598/how-to-make-a-faux-stained-glass-pumpkin/
- Backyard mini golf: /hobbies-projects/projects/718/fore/ · DIY survival kit: /hobbies-projects/projects/180051/how-to-make-a-diy-survival-kit/
- Duct-tape creations: /hobbies-projects/funstuff/157997/10-amazing-duct-tape-creations-you-can-make-right-now/ · 4 Thieves card trick: /hobbies-projects/funstuff/157224/how-to-do-the-4-thieves-card-trick/ · Invisible ink: /hobbies-projects/funstuff/162663/how-to-make-invisible-ink-for-writing-top-secret-messages/
- Games: Bike Blitz /games/mobile-games/178477/bike-blitz/ (img 2023/04/bikeblitz.jpg) · Tiger's Backyard Bounce /games/mobile-games/137281/tigers-backyard-bounce/ · Pee Wee's Basketball Madness /games/mobile-games/139995/pee-wees-basketball-madness/ · Dredd Speed's Cosmic Air Hockey /games/mobile-games/161644/dredd-speeds-cosmic-air-hockey/ · all games /section/games/mobile-games/
- Jokes site https://jokes.scoutlife.org/ (Joke of the Day; topics at /topics/animal-jokes/, /topics/food-jokes/, /topics/knock-knock-jokes/, /topics/scouting-jokes/, /topics/monster-jokes/, /topics/space-jokes/ …). Format: "**WILLIAM:** What keys unlock a banana? **EMMA:** What? **WILLIAM:** Monkeys." · Joke by William R., Katy, Texas
- Pinewood: HQ /pinewood-derby/ · KPop Demon Hunters cars /hobbies-projects/pinewood-derby/191553/take-a-look-at-awesome-kpop-demon-hunters-pinewood-derby-cars/ · 2026 Hall of Fame /hobbies-projects/pinewood-derby/188756/rev-up-your-imagination-with-these-awesome-pinewood-derby-cars-of-2026/ · Fast car /hobbies-projects/projects/2952/fast-pinewood-derby-car/
- Scouting Around: Multisport MB /about-scouts/scouting-around/192163/scouts-go-the-extra-mile-with-the-multisport-merit-badge/ · Fundraisers /about-scouts/scouting-around/191970/creative-fundraisers/
- Fishing https://fishing.scoutlife.org/ : /8-fishing-knots-to-know/ · /name-that-fish-quiz/ · /25-funny-fish-jokes/
- Quizzes: KPop Demon Hunters vs Pokémon /quizzes/191435/who-would-win-kpop-demon-hunters-or-pokemon/ · Umpire quiz /quizzes/140566/you-make-the-call-baseball-umpire-quiz/ · all /section/quizzes/
- Eagle projects https://eagleprojects.scoutlife.org/ · Fiction https://fiction.scoutlife.org/
- Outdoors & Gear: Emergency kit /outdoors/outdoorarticles/16727/create-an-emergency-pack-or-kit/ · Backpacking stove guide /outdoors/guygear/3315/backpacking-stoves-buying-guide/ · Trail running gear /outdoors/2410/trail-running/ · Ask the Gear Guy: Philmont gear /outdoors/ask-the-gear-guy/192253/recommended-gear-for-a-philmont-backpacking-trek/ · Stuff We Like: NEMO Double Haul /outdoors/ask-the-gear-guy/192272/stuff-we-like-nemo-double-haul/ · Prevent blisters /outdoors/ask-the-gear-guy/192248/how-do-i-prevent-blisters/ · Gear Guides /section/outdoors/guygear/ · Ask the Gear Guy /section/outdoors/ask-the-gear-guy/
- Polls /polls/ · Contests /giveaways/ · This month's issue /magazine/192223/inside-the-october-2026-issue/ · Cover img 2026/09/cover.jpg · Subscribe https://subscribe.scoutlife.org/subscribe/sl?utm_source=scoutlife&utm_medium=web&utm_campaign=<placement> · Subscriber Services /contact-us/subscriber-services/
- Video of the Week (YouTube): "Tales From the Campfire" id `a4VIsgRbBLY` · channel https://youtube.com/channel/UCZW4mLoi5-4bruRFohr-_gw
- Logos: `assets/logo/logo-{red,orange,yellow,green,lt-blue,dk-blue,purple,black,white,white-blue-inline}.png` (900×190). Mascot: `assets/mascot/scout-{reading,pointing,cap,head}.png`.
(All paths above are on https://scoutlife.org unless a full URL is shown.)

## When you finish
Run `node --check` on your JS and `python3 src/build.py`. Report back: files created, anything you couldn't do, and any assumptions. Keep the report short.
