# Arcade mockup: Easter egg cheat sheet

Open `index.html` in Chrome, Safari, Firefox or Edge. Analytics events print to the browser console as `[track]`.

## Page-level eggs

| Egg | How to trigger (desktop / keyboard) | Touch |
|---|---|---|
| Jelly logo | Hover the logo; drag it and let go | Tap; drag |
| Color pop | Click the logo: it cycles through the official logo colors (purple left out in this version). 10 clicks in a row = rainbow spin | Tap |
| Maileagle flyby | 5 quick clicks on the logo. Click Scout mid-flight for a loop; move the cursor near the feather to blow it around | Same |
| Pocket Mode (retro handheld) | Konami code ↑↑↓↓←→←→ B A: the page turns 4-shade green (full effect in Chrome/Edge). Space or JUMP hops rocks. Esc exits | Swipe up, up, down, down, left, right, left, right on the header, then tap the header twice |
| Be Prepared | Type `BEPREPARED` (outside form fields); flick the gear around | Press and hold the "Psst… secrets" text by the campfire for 1.5 s |
| Flashlight hunt | Focus the logo, press Space in SOS (3 short, 3 long, 3 short). Find 5 critters. Esc = lights on | Tap the logo in SOS |
| Ladybug chase | Appears on a card 5–12 s after load. Catch it 3 times | Tap |
| Squirrel stash | Peeks out behind "Outdoors & Gear" every 25–45 s (desktop only). Toss the acorns back | Tap |
| Search secrets | Search: `pizza`, `pinewood`, `do a barrel roll`, `bigfoot`, `knot` | Same |
| S'mores toaster | Footer campfire: hold "Hold to toast", let go at golden-brown | Same |
| Constellations | Footer sky: click neighboring stars to draw the Big Dipper, Orion's Belt, Cassiopeia | Tap |
| Paper airplane | Drag and throw the plane in the top-right of "Today's Top Picks" | Drag and flick |
| Stone skipping | Flick across the pond on the Outdoors & Gear shelf | Swipe |

## Widget eggs

| Widget | Egg |
|---|---|
| Joke of the Day | Tap "Groan" 5 times in a row: the widget melts and boings back |
| Idea-O-Matic 3000 | All three screens match: the robot does a happy dance (guaranteed by the 4th crank in this mockup) |
| Arcade | Drag the joystick in a full circle (or ↑→↓← with it focused, or tap the swirl sticker): 10-second acorn-catch game |
| Halloween HQ | Pumpkin: star eyes + triangle nose + zigzag mouth. Door: knock "shave and a haircut… two bits." Tap the sleeping bat |
| Gear Guide | Try to go past the last card: the backpack bursts |
| Cast a Line | Tap the fish when it leaps out of the water |

## Game layer (this version only)

- Every widget interaction earns +10 XP and every secret found earns +50 XP. The header HUD shows LV, XP and a progress bar, with a "LEVEL UP!" flash every 100 XP.
- XP is stored only in this browser and is anonymous. It is not a currency: nothing can be bought or won with it.

## Mockup notes

- The **Pause animations** button (header and footer) and the device's reduced-motion setting both calm everything down.
- Ads are gray placeholder boxes at their real sizes.
- Some details are mockup-only and need an editor's check before launch: Idea Machine time estimates, requirement-to-article mapping in the Requirements Finder, the poll question and fish facts.
- Halloween countdown preview for another date: add `?sl-date=2026-10-31` to the URL.
- Source modules are in `src/`. Rebuild with `python3 src/build.py`.
