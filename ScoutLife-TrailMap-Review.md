# Scout Life Trail Map mockup: design and code review

**Reviewed:** October 14, 2026
**Scope:** Direction A (Trail Map) homepage (`a-trail-map/index.html`) and the three section fronts (`games.html`, `pinewood-derby.html`, `animals-and-nature.html`), plus their source in `a-trail-map/src/`.
**Method:** Automated accessibility checks (axe-core, WCAG 2.0–2.2 A/AA), keyboard and screen-reader testing, no-JavaScript testing, speed tests on a simulated slow phone (Slow 4G + 4× CPU slowdown), a read-through of the code, and a visual design pass at 1440, 1280, 1180, 1100, 1024, 800 and 375 px. The biggest findings were re-checked by hand.

**Left out on purpose:** suggestions that would undo choices already made: the footer phone number (removed at your request) and the sunshine-yellow Search button (your pick). Where a suggestion trades off against an earlier decision, it says so.

**Note:** file and line references (e.g., `shell.css:732`) point to the source as of this review, before the bug fixes in section 1. The fixes shifted some `shell.css` line numbers slightly, and they'll keep drifting as the code changes.

**Status key:** ✅ fixed · ⬜ open

**Update (October 14, 2026):** all six bugs in section 1 are fixed and re-tested (details in the table). Everything in sections 2–5 is still open.

---

## 1. Bugs (fix first)

| # | Status | Bug | Where / evidence | Fix (what was done) |
|---|---|---|---|---|
| 1 | ✅ | The four smaller top-picks photos disappear on tablet and phone (collapse to a 7×4 px sliver). | Homepage, 640–1023 px and below 640 px. Caused by the Oct 13 rule `.hero-sm{align-items:start}` (`shell.css:732`), which overrides the tablet/phone `align-items:stretch` (`shell.css:569`); the absolutely positioned image then has no width. | Folded the top alignment into the desktop rule (`.hero-sm`, `shell.css`) and deleted the Oct 13 override, so tablet/phone keep `align-items:stretch`. Verified: photos 333×187 (800 px), 255×143 (375 px); desktop unchanged (176×132, label and photo tops aligned). |
| 2 | ✅ | Phone top-pick summary squeezed to half the card (177 px wide in a 343 px card). | Homepage, phone. `.hc-dek{max-width:calc(100% - 128px)}` (`shell.css:327`) still reserves room for the "easy craft" note, which is hidden on phone (`shell.css:632`). | Added `max-width:none` to the phone `.hc-dek` rule (`shell.css`). Verified: 305 of 343 px at 375 (was 177). |
| 3 | ✅ | The phone sticky "Menu" button has no accessible name. | All pages at phone width after scrolling; it's the only way to reach navigation once the header is gone. `.sh-sticky-menu .sh-menu-txt{display:none}` (`shell.css:619`) hides its only text (`shell.html:293–296`). | The "Menu" text is now visually hidden instead of `display:none` (`shell.css`), so screen readers announce "Menu". Verified with an accessible-name query; the button stays 48 px wide. |
| 4 | ✅ | Games' current-section chip shows Outdoors green instead of Games blue. | `games.html`. `.sf-chip` falls back to the Outdoors color (`sections.css:109–111`) because Games sets `--sec` only on the hero. | Set `--sec:var(--c-games);--sec-ink:#fff` on the Games subnav (`pages/games/page.html`), as the shared contract specifies. Verified: active chip Games blue with white text; other chips' color squares blue. (Pinewood and Animals have no subnav.) |
| 5 | ✅ | Two phone widgets cut off content. | Homepage at 375 px: Fun Stuff to Do loses its third story (content 379 px in a 326 px body); the Halloween pumpkin carver clips its Mouth buttons. | Phone shelves now use the treatment Scout Essentials already had: 96 px thumbnails, 10 px gaps, titles clamped to 2 lines (`shell.css`). Pumpkin carver option rows tightened on phone (2 px row gap, 1.0 line-height labels, 2 px panel padding; `widgets/seasonal.css`); buttons stay 38 px. Verified: no widget overflow at 414, 375 and 360 px; carver panel content 171/171 px. |
| 6 | ✅ | The page jumps once it finishes loading on slow phones (layout shift 0.61; budget 0.1). | All pages. `core.js:8` swaps the `no-js` class for `js`, but it only runs in the single script at the very end of a 660–790 KB page (`build.py`). Until then the no-JS layout shows (wrapped nav + search strip, 425 px header, hero at 897 px); then the header shrinks to 191 px and everything jumps (one shift of ~0.6). | `build.py` now puts a one-line script in `<head>` (before the CSS) that swaps `no-js` for `js`. Verified on a simulated phone (Slow 4G + 4× CPU): CLS 0.611 → 0.009 (Home), 0.032 (Games), 0.004 (Pinewood), 0.003 (Animals); desktop Home 0.018. Trade-off: if the main script ever fails to load, the page stays in JS mode (standard pattern; WordPress uses the same). |


**Re-test after fixes:** no script errors on any page; no horizontal scrolling; checked in Chromium at 1280, 1024, 800, 414, 375, 360 and 320 px and in the Safari engine (WebKit) as iPhone 13, iPad Mini and desktop. In WebKit the phone hero row stays stable (cards 296 px wide, photos 266×163).

**New small findings from the re-test (not fixed, see Low lists):** at 320 px, Idea Machine's "Crank it!" button and "…or turn the crank yourself!" note are clipped and its "bored?" tagline touches the edge, and the homepage Pinewood widget's links clip by 2 px; in WebKit at iPad Mini width the Poll widget content overflows by 4 px.
---

## 2. Usability and accessibility

### High
- **Lead story is below the fold on desktop.** Ad + header take 383 px; the homepage hero headline starts at y≈968 at 1280×800, and section-front lead headlines at y≈846–986. Suggest: slimmer header (~180 px), drop or inline the "Start Your Adventure" sign on the homepage, cut section-front banner photos to ~460 px tall, and put the lead card beside the sign. Goal: lead headline visible on a 1366×768 Chromebook.
- **Focus ring is too faint.** `:focus-visible{outline:4px solid var(--tomato)}` (`base.css:85`) measures 2.63:1 on the cream page, 2.99:1 on cards, 2.39:1 on menu/search panels, 1.94:1 on the sky header, 2.6:1 on the forest sticky bar, 2.33:1 on the wood video board (WCAG 1.4.11 needs 3:1). It's also the same orange as Subscribe, Load more and other primary buttons. Suggest: use the two-tone ring from the section heroes (`sections.css:98`: ink outline + sunshine halo) site-wide.
- **Sticky bar hides whatever has keyboard focus on section fronts (WCAG 2.4.11).** After "Skip to main content", the next Tab focuses the breadcrumb "Home" under the 71 px fixed bar; on Animals and Nature at phone width, tabbing backward left 4 controls fully hidden and 12 partly hidden. Only `main [id]{scroll-margin-top:96px}` exists (`sections.css:259`). Suggest: `html{scroll-padding-top:84px}` (tested: 0 hidden).

### Medium
- **Logo Easter eggs get in the way of going home on section fronts.** A click reaches home after 0.85–0.93 s; a double-click or second tap within 700 ms cancels navigation (`eggs-10-logo.js:137–147`); `touch-action:none` on the logo (`eggs-10-logo.js:96`) means a swipe that starts on it doesn't scroll. The sticky-bar logo goes home in 0.2 s, so the two logos behave differently. Suggest: navigate immediately on section pages and keep logo eggs homepage-only (or start them with a long-press); use `touch-action:pan-y`.
- **"Pause animations" is hard to find.** Footer only: tab stop 144 of 145 on the homepage, ~y=11,600 px on the phone homepage, while header motion starts immediately. It shows "not paused" when the device's reduced-motion setting has already stopped everything (`shell.js:44`). With JS off the button is hidden (`shell.css:712`) but CSS loops keep running. Suggest (trade-off with your request to keep it out of the header): a small pause icon in the sticky bar (`shell.js:43` already supports mirror buttons), reflect the OS setting, pause ambient loops in no-JS.
- **Small text and handwriting carry real instructions.** Kalam appears 52 times on the homepage. Examples: joke topic labels 12.5 px (`joke.css:128,132`), joke credit 13 px Kalam (`joke.css:31`), Games "Play" buttons 12 px pixel font (`games/page.css:320`), game tags 13 px, "Subscribe Today!" 12 px (`shell.css:667`), "Q2 OF 10" 10 px, "TODAY'S JOKE" stamp 10.5 px, ad labels 11 px; Kalam used for the Requirements Finder prompt, fishing/derby results, Games "Showing 10 of 38 games", Hall of Fame quotes. Requirements §3.3 sets 16 px as the mobile minimum. Suggest: handwriting and pixel fonts for decoration only; at least 14 px for labels and 16 px for content.
- **Heading structure.** Homepage has no h1 (the hero sign is an h2, `shell.html:329`). Every widget title is a hard-coded h2 (e.g., `joke.html:5`), so on Animals and Nature the "Joke of the Day" h2 sits inside the "Latest Stories" h3 list and appears to own the cards after it; on Games the Quiz h2 takes over the quiz cards. Suggest: a visually hidden h1 (or logo h1 on the front page); make widget heading level a block setting (h3 inside zones/grids).
- **No-JavaScript leftovers.** Visible buttons that do nothing: 10 on the homepage (4 quiz answers, 4 arcade controls, fishing ripple, bat), 16 on Games (cabinet joystick/D-pad, 6 filter chips, Surprise me, 4 quiz answers), the Pinewood bench car. Fishing still says "Tap Cast!" with no Cast button (`fishing.html:71`); the Pinewood builder says "Turn on JavaScript to design and race your own car" (`pinewood-derby/page.css:202`), which kids on school devices can't do; Arcade "See all games" is cut off; homepage Pinewood widget shows a blank area. Suggest: hide these with `html.no-js` or turn them into links; replace the JS message with links to tips and the Hall of Fame.
- **Teal text contrast 4.48:1 (just under 4.5:1).** "Scouting Around" patches (12–13 px), "Ask the Gear Guy" labels (14 px), footer "Scouts" sticker (17 px), drawer "Scouts" heading, "1 mile" on the Scouts mega panel (`base.css:36,127`). Suggest: lighten `--teal` to ~#49A693 (5.07:1) or use white on `--teal-dk` (6.34:1).
- **Phone swipe rows hide items with no cue.** Pinewood "On this page" links (items 3–4 off-screen, `pinewood-derby/page.css:337–338`), Games subnav ("Write a Funny Caption" cut off, `sections.css:240–241`), Halloween "Spooky picks" (`seasonal.css:256–257`). Suggest: let short rows wrap; otherwise add an edge fade or arrow.
- **Video of the Week focus and art.** The poster link's focus ring is clipped by `.sh-video-frame{overflow:hidden}` (`shell.css:388`); the play button covers the video's title art ("RAISING THE STAKES"). Suggest: inset outline or `:focus-within` ring on the frame; move the play button off the title.

### Low
- **Tap targets under the 44 px project standard** (all pass WCAG's 24 px minimum): pumpkin face options 38×38, Gear dots 26×40, Hall of Fame dots 24×24 (×13 on phone), cabinet thumbnails 46×36, sticky logo 86×28 (phone), widget "More …" links 27–30 px tall, Halloween tabs 38 px / picks 34 px, breadcrumbs 27 px, fishing ripple 64×30, joke credit link 21 px, "See past caption contests" 22 px.
- **Load more and page numbers disagree.** After two "Load more" clicks (21 stories) the pager still marks page 1 and "2" would repeat stories (`sections.js:71–75`). Update the current page and "Next" link.
- **Gear carousel list semantics:** `li` elements get `role=group` (`gear.js:47–51`); put the role on an inner div.
- **`aria-label` on plain divs is ignored** (`seasonal.html:72`, `arcade.html:15`); add `role="group"` or `role="img"`.
- **Landmark noise:** three complementary landmarks all named "Advertisement" (`shell.html:5, 404, 469`); every widget is a named region (~17 on the homepage) plus a nested aside in Halloween HQ; the sr-only "Top of page" span sits outside any landmark.
- **CSS-generated text read aloud:** shelf links start with "No." (`shell.css:447`), mega panels say "1 mile" (`shell.css:151`), "→" in many link names. Use `content:"x" / ""`.
- **Joke widget naming:** topic buttons include the emoji ("Show a random 🐾Animals joke", `joke.js:78`); "★ Today's Joke" is `aria-hidden` (`joke.html:11`); meter reads "Laugh-o- Meter".
- **Very long link names** on hero/section cards (~200 characters: label + flag + title + description). Name the link from the title (`aria-labelledby`) and attach the description (`aria-describedby`).
- **Symbols in button names / duplicate button:** "▶ Play" twice in Trail Runner; "↺ Restart", "✕ Exit bonus". Wrap symbols in `aria-hidden` spans.
- **Mobile drawer drops the Contact submenu** (`shell.js:215`): Send Us Your Jokes, Advertise, Subscriber Services are missing.
- **Flashlight hunt doesn't contain focus** (`eggs-40-flashlight.js:38`): Tab reaches elements under the dark overlay. Make the page inert or trap focus while it runs.
- **Search panel at 375 px:** the × close button overlaps "What are you looking for?" (`shell.css:624`). Add right padding.
- **320 px width:** joke widget "Send us your joke →" and "ha ha ha!" clip by 4–12 px.
- **More 320 px clipping (found in the bug re-test):** Idea Machine's "Crank it!" button and its "…or turn the crank yourself!" note are clipped and "bored?" touches the edge; the homepage Pinewood widget's links clip by 2 px. In WebKit at iPad Mini width the Poll content overflows by 4 px.
- **Fixed-height side effects:** Requirements Finder step 3 label truncates on phone (`reqfinder.css:19`); all 4 "Spooky picks" titles truncate (consequence of the 460 px widget height).

---

## 3. Performance

### Per-page metrics (at review time)

| | Home | Games | Pinewood | Animals |
|---|---|---|---|---|
| HTML raw / gzip (KB) | 731 / 191 | 771 / 198 | 760 / 197 | 658 / 175 |
| Inline CSS raw / gzip (KB) | 282 / 70.6 | 315 / 76.8 | 313 / 76.4 | 283 / 70.8 |
| Inline JS raw / gzip (KB) | 328 / 94.7 | 368 / 106.2 | 367 / 105.7 | 328 / 94.7 |
| Unused CSS / JS after load + full scroll | 43% / 52% | 63% / 63% | 65% / 61% | 65% / 63% |
| DOM elements (load → after scroll) | 1,875 → 2,073 | 1,313 → 1,494 | 1,552 → 1,750 | 683 → 881 |
| Images on first screen, desktop | 18 / 1,026 KB | 10 / 728 KB | 10 / 743 KB | 13 / 734 KB |
| Images on first screen, phone | 12 / 586 KB | 8 / 614 KB | 4 / 320 KB | 8 / 524 KB |
| Images after full scroll, desktop | 34 / 1,575 KB | 28 / 1,495 KB | 23 / 1,305 KB | 15 / 759 KB |
| Fonts on first screen | 8 / 160 KB | 8 / 160 KB | 7 / 147 KB | 7 / 147 KB |
| Layouts per second while idle | 60 | 60 | 60 | 60 |
| Main thread busy while idle, phone at 4× (top / mid-page) | 22% / 57% | 10% / 14% | 9% / 13% | 7% / 10% |
| Phone, Slow 4G + 4×: LCP | 0.63 s* | 4.96 s | 3.26 s | 2.97 s |
| Phone, Slow 4G + 4×: CLS | 0.61 | 0.61 | 0.61 | 0.61 |

\*Home's LCP was the no-JS search strip; with bug 6 fixed it becomes the hero image at about 3.17 s.

### High
- **Every page carries every widget and egg inline.** `build.py` puts all widgets, eggs and section code into every page: 95–106 KB gzipped JS (Games and Pinewood over the 100 KB budget); Pinewood uses none of the 10 widgets but ships 147 KB of widget JS and 104 KB of widget CSS; ~165–183 KB gzipped is re-downloaded on every page view; inline CSS first delays the hero image and fonts. Production plan (§18) fixes this: per-block loading via `block.json`, eggs deferred → initial JS ≈ 56 KB (Home), 27 (Games), 26 (Pinewood), 19 (Animals) gzipped.
- **Background animations run constantly.** 60 layouts and style recalcs per second at rest on every page (Pause/reduced-motion drop it to ~0). Clouds animate `left` (`shell.css:43–46`, ~14% of main thread); fishing waves move an SVG group (`fishing.css:23–24`, ~21%); campfire flames (`eggs.css:204–207`, ~20%); arcade scanline, pond ripples, stars, fireflies, embers force restyles even off-screen. After one scroll, 58 (Home) / 47 (section) infinite animations run while ≤8 are visible. The campfire visibility check (`eggs-70-campfire.js:479`) stops only the JS fireflies. Suggest: animate `transform`/`opacity` only, animate whole SVGs or HTML wrappers rather than shapes inside SVGs, and pause off-screen regions with one shared observer.
- **Images aren't sized for phones.** No `srcset`/`sizes`/`<picture>` anywhere; all JPEG/PNG. Games and Pinewood heroes are 177 KB and 195 KB (budget 150 KB). `scout-reading.png` is 523×600 / 297 KB shown at 84×95; arcade thumbnails 480×360 (~40 KB each) shown at 46×36; logo is a 79 KB PNG shown at 360×76. Suggest: WordPress `srcset` with slot-specific `sizes`, AVIF/WebP (home hero at 750 px: 14 KB AVIF / 17 KB WebP), SVG logo. Simulated with bug 6 fixed + WebP hero/logo/mascot + no arcade preloads: home phone LCP 3.17 s → 1.10 s, load 4.8 s → 2.3 s.
- **Preloads defeat lazy loading.** `arcade.js:25` preloads all 6 game screenshots and `arcade.html:16` loads one eagerly (~253 KB on a phone's first screen for a widget ~4,000 px down); Games `page.js:40` preloads another 285 KB and `page.html:41` loads 76 KB eagerly, competing with the hero; hovering/focusing the logo (`eggs-10-logo.js:46–52`) downloads 8 files / 722 KB. Suggest: drop the preloads, small lazy thumbnails, one SVG logo recolored in CSS.
- **Hiker trail is the most expensive load-time JS.** `buildTrail` (`shell.js:502–676`) takes 55 ms (214–258 ms at 4×), runs twice at load (`shell.js:710–719`) and again on every resize/height change; longest tasks at 4×: 240, 156, 98 ms. Suggest: build when idle, rebuild only on width change, or precompute per breakpoint.

### Medium
- **Eggs aren't loaded after idle** (requirements §8.2 rule 5): 132 KB raw / 38 KB gzipped JS + 23 KB CSS in every page; logo, retro and Be Prepared eggs start at load. Suggest: tiny trigger listener in core; load each egg on its trigger or when idle.
- **Fonts:** 5 families / 8 files / 160 KB on the first screen (spec: ≤3 families). The pixel font and both Kalam weights (43 KB) load immediately. Suggest: drop or subset Kalam, load the pixel font only with the arcade block, preload Alfa Slab One and Atkinson 400, use metric-matched fallbacks.
- **DOM size:** Home 1,875–2,073 elements (Lighthouse flags >1,400); 644 are inside 72 inline SVGs; the JS-built mobile drawer (104 elements) duplicates the mega menus. Suggest: SVG sprites; build the drawer on first open.
- **Topo texture data URIs** are 82% of `base.css` (21.9 KB gzipped), repeated inline on every page; the header copy is dead (overridden at `shell.css:767`). Suggest: an external, cached, simplified SVG file.

### Low
- **Favicon** is a 1200×1200, 205 KB JPEG (`build.py`). Use a small PNG/ICO plus SVG.
- **18 unused asset files (903 KB):** five identical Nunito copies and other Direction B fonts; `g.css` (points at Google's font servers, must never be linked); three unused shelf images and one unused Games image; two logo variants; `scout-cap.png` (252 KB).
- **Pause doesn't stop smooth scrolling:** `html.motion-off *` doesn't match `<html>`, so `scroll-behavior:smooth` (`base.css:77`) stays on.
- **`body` became a scroll container** (`base.css:77–79`); future `position:sticky` would fail.
- **Minor rendering costs:** 19 forced-reflow animation restarts; a reflow loop in `joke.js:66–69`; 5 stacked drop-shadow filters on each of 10 gear cards (`gear.css:13–14`).

---

## 4. Look and feel

### High
- **Pick a smaller decoration kit.** The first homepage screen has ~16 decorative elements and the site uses seven textures (topo map, graph paper, notebook lines, folded map, wood, cork, pegboard). Keep: wooden signs, patches (labels), passport stamps, the homepage trail. Consider removing: the dashed stitched inner border on cards/widgets/nav pills (keep on patches and Subscribe), map pins on all widgets and lead cards, colored tabs on hero side cards (`.hero-sm::before`, `shell.css:334`), "No. 1/2/3" tags, graph paper behind the hero headline.
- **Widget header taglines** ("ha ha ha!", "bored?", "vote!") and a note beside every zone sign add a lot of handwriting. Consider dropping most widget taglines and keeping at most one note per zone. (You just tuned "ha ha ha!", so this is a judgment call.)
- **Keep the section color code consistent.** Pinewood Derby widget is yellow (Jokes) instead of Hobbies orange; Fishing is sky blue (Outdoors is green); Requirements Finder is forest green (Scouts is teal); Quiz is sky blue (Games is dark blue); Games genre tags reuse section colors. Rule to adopt: a widget header uses its destination section's color; utility and seasonal widgets get a neutral or seasonal color.

### Medium
- **Games page:** Gaga Brawl appears five times (hero art, lead card, Rec Hall cabinet, bulletin "NEW GAME!" note, first game card); default the cabinet to a different game. The hero art's built-in "GAGA BRAWL" title fights the "Games" sign (covers "GAGA", leaves "A BRAWL"); use a text-free crop or right-align the sign. The 15 wooden cabinet cards are ~530 px tall each (phone page 16,405 px; cabinet alone ~850 px); use standard story cards with a yellow Play button, keep wood for the one featured cabinet, two-up tiles on phone.
- **One headline scale.** Homepage lead headline 48 px vs. section-front lead 31 px for the same job; card titles come in six sizes (18–31 px). Suggested scale: 80 px section sign, 44–48 px lead story, 31 px zone sign / featured card, 22–23 px cards and widgets, 14 px labels.
- **Blank space and grid alignment.** Fixed-height widgets leave empty space in neighboring cards (homepage shelf cards 47–84 px empty; Animals cards beside the Joke widget 78–105 px). Ads in grids float vertically centered with ~75 px above/below; align to top. Games' last row had two cards and an empty cell; Caption Contest card stops at x=1100 while content runs to 1316.
- **Scout Essentials:** the pond takes a third of the slot, leaving two narrow stories (titles cut at 1024; title and tagline wrap on phone). Consider three stories and move the pond.
- **Pinewood builder:** the preview is ~385 px of mostly empty pegboard with a small car; after a race the "YOU" tag sits on the lane 1 car while pointing at lane 2, and all three cars stop at the same spot; two race buttons ("Race it!" and "Race!").
- **Repeated labels on section fronts:** every Animals card says "Animals & Nature", every Pinewood card "Pinewood Derby"; every Hall of Fame card has a "HALL OF FAME '26" stamp (covers the car on phone) and its own "See the full gallery →". Show a label only when it differs from the page.
- **Buttons aren't a system:** seven fill colors; "Surprise me" is yellow on Games, white on Pinewood; Games has a blue "Show all 38 games" and an orange "Load more quizzes"; duplicate CTAs (Arcade "See all games" button + footer link; two Play buttons in Trail Runner). Suggested: orange primary (one per module), white secondary, yellow Play for games only.
- **Carousel controls come in four styles** (phone hero, Gear Guide, Hall of Fame, Arcade). Use one: 48 px round arrows outside the image, same color both sides, "1 of N" counter.
- **1024–1180 px squeeze points:** Idea Machine "bored?" collides with the title and "turn me!" clips; Requirements Finder labels cut off ("Adventure or requir…", "Choose a ran…", also at 1100 and 375); "Knock-Knock" touches its button edge; Spooky picks cut mid-word; Games Quiz widget ~275 px wide so answers wrap to three lines.
- **Feature band:** at 1024 the Subscribe headline wraps to four lines and the badge pokes outside the panel; at 1280–1440 the Video and Subscribe panels are ~35 px out of top alignment.
- **Subscribe badge:** the yellow circle with a tent can read as a hazard sign; Subscribe also shares the Hobbies orange and stitching, which weakens it as the most visible header button (§5.1).
- **Low-res magazine cover and mascot badge:** `promo-cover.jpg` is 157×206 shown at ~180×240; the Maileagle badge is print-style art that clashes with the flat illustrations (removing it keeps the mascot to the empty state and flyby egg).
- **Sign mileage is inconsistent:** "→ 0.x mi" on some signs, "→ 38 games" on one, none on Derby Stories / Latest Stories; the wood-knot texture lands behind sign text like a smudge.
- **Trail Runner header still has the topo texture** (`games/page.css:219`), which you removed from widget headers.
- **Footer:** "Psst… secrets" note sits at x=23 while everything else starts at x=124; ~145 px of empty space before the footer on every page; Explore pills form a ragged stack; at 1024 the URL breaks as "contact-/us".

### Low
- **Mega menus:** the "1 mile" scale bar is pure decoration; the Games panel's link column is half empty; the underline under "All Games →" splits at the arrow.
- **Stray arrows and awkward breaks:** "→" drops to its own line on Games' lead title and the phone YouTube link (use a non-breaking space); the Animals sign breaks "Animals / and / Nature" at 1440 (`text-wrap:balance`).
- **Line length:** Pinewood Build Trail text runs ~95–100 characters per line at 1440; cap at ~65.
- **Polish:** the Games cabinet "CAMP" pennant clips its "P"; the Fishing scene crops the sun and lily pad; the ladybug egg lands on Animals' "FEATURED" stamp on phone; the Halloween bat overlaps tabs on phone; the drawer's search placeholder is cut off.
- **Bike Blitz hero card** has a lot of empty space and no Play button (§6.3 allows one for a game slot).

---

## 5. Before building in WordPress (code)

### High
- **Escape content safely.** Content is inserted with `innerHTML` and four private escape functions with different rules; `joke.js:83` and `reqfinder.js:126` don't escape `'`; `reqfinder.js:175–178` puts URLs into `href`/`src` unescaped; `joke.js:91` puts `joke.id` into a URL unencoded. Reader-submitted jokes make this an XSS risk. Render server-side with `esc_*`/`wp_kses`, and use one escaping helper (or `textContent`) in JS.
- **Split `shell.js` into separate parts.** Every header feature sits in one callback (`shell.js:33–720`); renaming one element (`.sh-search-close`) threw an error and stopped the drawer, sticky bar, hero dots and trail. Admins can edit header/footer in the Site Editor, so markup will drift. One guarded module per header block.

### Medium
- **Clean up `shell.css`.** 80 selector/media pairs defined more than once; the Oct 7 and Oct 13 override blocks (`shell.css:719–783`) redefine 20 earlier selectors; `.sh-head-top` grid declared in 7 places; dead rules (`.sh-head-top .sh-logo` at 53 and 597; `.sh-sticky{background-image:none}` at 781); an ID+class selector only to win specificity. Fold edits back into the original rules, use `@layer`, add stylelint.
- **Breakpoints and magic numbers:** 19 distinct media queries (~10 off-spec: 420, 768, 800, 820, 920, 999, 1100, 1180, 1199, 1279 vs. the documented 640/1024/1280); 29 z-index values up to 9999; `--band-h` must match the nav height (`shell.css:767–777`); `main [id]{scroll-margin-top:96px}` hard-codes the sticky height. Move to `theme.json` tokens and a z-index scale.
- **Duplicated components:** Games cabinet (`games/page.js:22–160`) forks `arcade.js:7–135`; three carousels (`shell.js:364–404`, `gear.js:39–110`, `pinewood-derby/page.js:614–705`) and two race engines; escape helper ×4, page-ready helper ×4, "is typing" check ×3. One arcade block with size variants; shared helpers in `SL`.
- **Content hard-coded in JS:** Requirements Finder data 25.6 KB (79% of `reqfinder.js`), jokes 6 KB, seasonal skin 6.3 KB, Idea Machine ideas 2.6 KB, two overlapping game lists. Move to block attributes, REST endpoints or server-rendered markup (also helps no-JS).
- **Fixed IDs in widget templates** (`joke.html:5`, `fishing.html:13–15`, `reqfinder.html:20,44`, `seasonal.html:13–33`, SVG symbols in `ideamachine.html`/`pinewood.html`) collide if a widget is placed twice. Use `wp_unique_id()` in `render.php`.
- **Widget lifecycle:** all widgets start at page load (the `SL.lazy` helper is used only by the campfire); listeners are never removed (13 document-level on Home); each widget has its own visibility observer. Add per-instance cleanup (AbortController + destroy) and start widgets near the viewport.

### Low
- **Global side effects in shared CSS:** `main [id]` applies on every page; Retro mode restyles the whole document with a `!important` universal rule (`eggs.css:47`).
- **Mockup-only code that shouldn't ship:** analytics console logging (`core.js:36`), the dev-only ad-adjacency checker that forces layout (`sections.js:99–115`), an event list that grows forever (`core.js:35`).
- **Docs and naming drift:** `src/CONTRACT.md` is still Direction B's contract; color token names are left over from B (`--tomato` is trail orange; `--green-dk` duplicates `--forest`, `base.css:32–33`); two no-JS hook styles (`html.no-js` and `.no-js`).

### Production recommendations (summary)
- **Asset delivery:** `base.css` and `core.js` as external, versioned, long-cached files; each block's CSS/JS via `block.json` only where used; eggs as a deferred module. Expected: initial JS 19–56 KB gzipped; ~165–183 KB gzipped saved per page after the first.
- **`<head>`:** the `js` class script; preload the hero image (with `srcset`, high priority) and two critical fonts.
- **Images:** WordPress `srcset`/`sizes` per slot; AVIF/WebP; SVG logo.
- **Motion:** animate only `transform`/`opacity`; pause off-screen; build the trail when idle.
- **Data and security:** render in `render.php` with escaping; pass data as JSON (`wp_interactivity_state` or `data-*`); unique IDs per instance; cache REST endpoints for jokes and Requirements.
- **Architecture:** `theme.json` tokens with meaningful names, one breakpoint set, z-index scale; CSS `@layer`; stylelint + ESLint via `@wordpress/scripts`; shared helpers in `SL`; one arcade block; `shell.js` split per header block.
- **Ads and caching:** load Google Ad Manager after first paint with its lazy-load setting, reserved slot sizes and the child-directed flag; defer Google Tag Manager; full-page cache + CDN with Brotli; test with ad/analytics domains blocked.
- **Budget checks:** Lighthouse CI or WebPageTest on staging (Slow 4G + 4×, ads on); fail the build over 100 KB initial JS, CLS > 0.1 or LCP > 2.5 s.

---

## 6. Worth keeping
- **Trail Map look:** wood-sign section headers, the giant slab sign over the photo on section fronts, the sky-over-forest header and campfire footer.
- **Widget feedback:** clear and fun throughout (Idea Machine result card, Poll results with the "YOU" stamp, Quiz "NOPE! WRONG TRAIL" stamp, derby ribbon); no gambling cues.
- **Animals and Nature layout:** photo-first 3/2/1 grid with "Load more" and page numbers; a model for other sections.
- **Pinewood Build Trail:** signposts on desktop that become a numbered accordion on phone; the car builder is engaging.
- **Menus and phone navigation:** mega menus fully keyboard-operable (Enter, Space, arrows, Esc, focus return); search and drawer trap focus and close on Esc; 10 tab stops before main content on desktop, 5 on phone; working skip link.
- **Motion and stability:** Pause and reduced-motion stop everything (0 running animations idle); flashing stays under 3/sec; no sideways scrolling or script errors at any width; widgets, ads and images don't shift layout; YouTube loads only on click; no third-party requests; self-hosted Latin-subset fonts.
- **Markup basics:** no duplicate IDs, `lang` set, every form control labelled, alt text used correctly, decorative SVG hidden; live regions quiet when idle and helpful after actions; results not conveyed by color alone.
- **No-JS core content:** navigation, search, the Requirements Finder form, the poll form, all 38 games and page links work.
- **Code basics:** a single global (`SL`), strict-mode self-contained modules, each widget and egg wrapped so one failure doesn't take down others; cheap, frame-throttled scroll handlers; eggs remove their listeners when they end; taps respond in 24–72 ms at 4× CPU.
