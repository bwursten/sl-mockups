# Direction A: Trail Map / Field Guide (re-theme brief)

This folder is a COPY of the finished Direction B (Sticker-Bomb) mockup. Same layout, same widgets, same eggs, same behavior and content. Your job is to **re-theme the look** to Direction A so it feels like its own design, not B recolored. `CONTRACT.md` still applies: rules, anchors, API, 460px fixed widget height, accessibility, motion, no gambling cues, gender-neutral. Only the visual direction changes.

Already done by the lead:
- `src/base.css` was rewritten: new palette (same token names), fonts and component styling. **Read it first.**
  - Fonts: `--f-display` Alfa Slab One · `--f-sub` Zilla Slab · `--f-body` Atkinson Hyperlegible · `--f-doodle` Kalam (field-notes handwriting) · `--f-pixel` unchanged.
  - Palette: topo cream paper, forest `--forest/--green-dk`, trail orange `--tomato`, amber `--orange`, sunshine `--sunny`, meadow `--lime`, pine-lake `--teal`, sky, deep-lake `--cobalt`, `--bark`/`--bark-dk` wood, `--moss`, `--pine`, `--card` page white.
  - Textures: `var(--topo)` (contour-line background tile, 600px) and `var(--topo-light)` (white contours for colored bands).
  - Frames: widgets are field-guide cards (no tilt, stitched dashed inner border, brass map pin on top instead of tape, round embroidered patch icon, topo lines in the colored header). Labels (`.sticker.label-*`) are embroidered patches. `.flag-new/.flag-hot/.flag-seasonal` are passport stamps. `.taped` is now a map pin. Buttons press down like chunky trail signs.
- All hard-coded B hex colors in src were find/replaced to their A equivalents (a first pass only).

## The Direction A look (from requirements doc §3.2)

The outdoors and Scouting as the theme.
- **Look:** Topo-map contour lines as background texture; dotted trail lines that connect sections; merit-badge-style patches for section labels; passport-style stamps for "NEW"/"HOT"; compass rose details; wooden trail signs; field journal / ranger-station / camp details; pine silhouettes; trail blazes (painted rectangles on trees).
- **Motion:** The trail line "draws" itself as you scroll; patches flip on hover; the compass needle in the header follows the cursor.
- **Mood:** Adventurous, outdoorsy, bright daylight. Still FUN and colorful for 8–13 (not a muted REI catalog, not military/survivalist). Gender-neutral.
- **Remove B-isms:** tilted cards, washi tape, sticker die-cuts with wobbly rotation, kraft "scrapbook" doodles (squiggles, spirals, paper scraps), Gochi Hand, Ultra/Patua/Nunito font names hard-coded anywhere.

## Rules for this pass
- Edit only the files assigned to you (see the Agent prompt). Don't touch `base.css`, `core.js`, `build.py`.
- Keep every id, class hook, `data-*` attribute, anchor and JS behavior working. If you change markup, keep the hooks the JS uses (read the JS first).
- Set every `--tilt` to `0deg` (or remove it). Replace `--tape` with `--pin` (map-pin color) if you like.
- Re-verify the 460px fit at desktop (S≈385px, W≈795px; narrow desktop S can be ~310px), tablet and phone (343px) after font changes. Alfa Slab One, Zilla Slab and Kalam have different widths from B's fonts.
- Test: `cd /sessions/youthful-gifted-feynman/mnt/sl-mockups/a-trail-map && python3 src/build.py`, then screenshots: `LD_LIBRARY_PATH=/tmp/xd/usr/lib/aarch64-linux-gnu python3 /sessions/youthful-gifted-feynman/mnt/outputs/tools/shot.py a-trail-map <prefix>` (writes /tmp/<prefix>_{desk,tab,phone}.png full-page; crop with PIL and view them by saving JPGs into /sessions/youthful-gifted-feynman/mnt/outputs/ and reading them at /Users/bwursten/Library/Application Support/Claude/local-agent-mode-sessions/322b4d07-3ffe-4f05-9a6e-69f24dd7de3e/a7d59dc3-af44-4e8f-b7a3-89e809a17d74/66e4192e/outputs/<file>.jpg). If /tmp/xd is missing: `mkdir -p /tmp/xd && cd /tmp && apt-get download libxdamage1 && dpkg -x libxdamage1*.deb /tmp/xd`. Emoji don't render in headless Chromium; ignore empty emoji boxes. Delete your scratch JPGs from outputs when done (or ask for delete permission; if denied, leave them).
