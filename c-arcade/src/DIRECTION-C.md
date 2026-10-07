# Direction C: Arcade / Game UI (re-theme brief)

This folder is a COPY of the finished Direction B (Sticker-Bomb) mockup. Same layout, same widgets, same eggs, same behavior and content. Your job is to **re-theme the look** to Direction C so it feels like its own design, not B recolored. `CONTRACT.md` still applies: rules, anchors, API, 460px fixed widget height, accessibility, motion, no gambling cues, gender-neutral. Only the visual direction changes.

Already done by the lead:
- `src/base.css` was rewritten: new palette (same token names + new `--night --night-2 --night-3 --grid --bevel --card`), fonts and component styling. **Read it first.**
  - Fonts: `--f-display` and `--f-sub` are both **Roboto Slab** (variable). Use **weight 900 for display/headlines** and 700–800 for subheads. Many B files set `font-weight:400` on display text, which now renders thin: fix that in your files. `--f-body` Atkinson Hyperlegible. `--f-doodle` is now **Silkscreen** (pixel font for SHORT game-UI callouts; uppercase; not for sentences longer than ~6 words). `--f-pixel` Press Start 2P (tiny labels, scores, "PRESS START").
  - The page is a dark "screen" (`--night`, starfield + faint cyan grid). Anything kids READ sits on LIGHT panels (`--card`, `--paper`). Neon accents: pixel yellow `--sunny`, neon cyan `--teal`, laser green `--lime`, neon orange-red `--tomato`, `--orange`, `--sky`, electric blue `--cobalt`. **No magenta/pink/purple** (gender-neutral requirement; this replaces the doc's magenta).
  - Frames: widgets are game panels: dark scanline title bar with the title in the accent color + glow, square beveled pixel-tile icon, neon outline ring + corner brackets, light body, light footer. `.sticker` labels are power-up badges; `.flag-*` are blinking pixel tags. Buttons are beveled arcade buttons that press down.
- **XP game layer (new, in core.js):** `SL.addXP(n, el?, label?)` shows a floating "+n XP" pop and fires `document` event `sl:xp` `{xp, level, gained, levelUp}`; `SL.level()`; `SL.xp`. `SL.trackInteract` automatically gives +10 XP and `SL.eggFound` gives +50. Don't double-award in widgets. (XP is not money: no coins, credits, tokens, prizes or gambling language.)
- All hard-coded B hex colors in src were find/replaced to C equivalents (first pass only).

## The Direction C look (requirements doc §3.2)
The homepage as a game you're playing.
- **Look:** chunky beveled buttons, score-counter and "LEVEL"/"WORLD" labels, power-up icons for sections, pixel accents, a dark "screen" backdrop with neon highlights for game-type widgets and light panels for reading areas. Think a modern, friendly indie-game menu or a retro console UI, not a casino, not a grim shooter.
- **Motion:** Buttons press down with a click; "+1"/"+XP" pops on interactions; screen-flicker/scanline transitions; marquee text; blinking "PRESS START" style prompts (sparingly); pixel sparkle bursts.
- **Mood:** Bright, energetic, playful for ages 8–13; readable; gender-neutral.
- **Remove B-isms:** tilts, washi tape, die-cut wobble stickers, kraft paper, scrapbook doodles (squiggles, spirals, paper scraps), Gochi Hand / Ultra / Patua One / Nunito anywhere (including SVG text and JS-generated markup).

## Rules for this pass
- Edit only the files assigned to you. Don't touch `base.css`, `core.js`, `build.py`.
- Keep every id, class hook, `data-*` attribute, anchor and JS behavior working. Read the JS before changing markup.
- Set every `--tilt` to `0deg`. Replace `--tape` usage as you see fit.
- Contrast: white or neon text only on `--night*`; ink text on neon fills; `--cobalt` takes white text. Neon text on light panels is NOT readable: use ink there.
- Re-verify the 460px fit at desktop (S≈385px, narrow-desktop S≈310px, W≈795px), tablet and phone (343px).
- Test: `cd /sessions/youthful-gifted-feynman/mnt/sl-mockups/c-arcade && python3 src/build.py`, then screenshots: `LD_LIBRARY_PATH=/tmp/xd/usr/lib/aarch64-linux-gnu python3 /sessions/youthful-gifted-feynman/mnt/outputs/tools/shot.py c-arcade <prefix>` (writes /tmp/<prefix>_{desk,tab,phone}.png full-page). Crop with PIL, save JPGs into /sessions/youthful-gifted-feynman/mnt/outputs/ and view them with the Read tool at /Users/bwursten/Library/Application Support/Claude/local-agent-mode-sessions/322b4d07-3ffe-4f05-9a6e-69f24dd7de3e/a7d59dc3-af44-4e8f-b7a3-89e809a17d74/66e4192e/outputs/<file>.jpg. If /tmp/xd is missing: `mkdir -p /tmp/xd && cd /tmp && apt-get download libxdamage1 && dpkg -x libxdamage1*.deb /tmp/xd`. Emoji don't render in headless Chromium; ignore empty emoji boxes. Delete your scratch JPGs when done.
