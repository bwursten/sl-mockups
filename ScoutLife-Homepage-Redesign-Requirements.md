# Scout Life Homepage Redesign — Requirements & Plan

**Project:** scoutlife.org homepage redesign
**Owner:** Bryan Wursten
**Version:** 1.1 (draft for approval)
**Date:** October 5, 2026
**Status:** Awaiting approval. Mockups begin after sign-off.

| Version | Changes |
|---|---|
| 1.0 | First draft from discovery Q&A |
| 1.1 | Contests removed from top menu; YouTube-only social; logo and Maileagle assets added; Boredom Buster redesigned to avoid casino cues; Easter eggs refocused on mini interactions, animations and games; mockups to use real images and links |

---

## 1. Summary

Redesign the scoutlife.org homepage with a new look and feel while keeping today's content mix. The new homepage should be colorful, fun and easy to use for kids, built from large slab type, movement, swappable interactive widgets and hidden Easter eggs. It must work well on desktop, tablet and phone, stay fast on school Chromebooks and older phones, and keep ads and subscription promotion working.

### 1.1 Goals

1. **Easy navigation** to section fronts and individual articles.
2. **Highlight a changing mix** of timely, new or interesting articles.
3. **Give kids something to do** on the homepage with fun, interactive widgets.
4. **Reward curiosity** with surprising Easter eggs.
5. **Work everywhere:** desktop, tablet and mobile.

### 1.2 Success metrics

| Metric | What we measure | Direction |
|---|---|---|
| Pages per visit | Homepage → article/section click-through; pages per session from homepage entry | Up |
| Widget engagement | Interactions per widget (spins, votes, joke ratings, cabinet flips, carves), click-through to linked content | Up; used to decide widget swaps |
| Subscriptions | Clicks on every Subscribe CTA (header, promo band, footer), tracked by placement | Up |

Ad performance is not a success metric for this project, but the redesign must not reduce ad visibility or break Google Ad Manager delivery (see §9).

### 1.3 Out of scope

- Article pages, section fronts and subdomains (jokes, fishing, fiction, eagleprojects, headsup). These get links from the homepage but are not being redesigned now.
- Changing the content mix or editorial strategy.
- User accounts or logins.
- Choosing the final build platform (requirements are platform-agnostic, with WordPress notes).

---

## 2. Audience

**Primary:** Kids **8–13**. The design should be fun for younger Cub Scouts without feeling "babyish" to middle schoolers.

**Secondary:** Younger Cub Scouts (6–7, often reading with a parent), older Scouts BSA (14–17), and parents/leaders looking for requirement help.

Design implications:

- Big tap targets (minimum 44×44 px; 48 px preferred for primary actions).
- Short labels and headlines; images do much of the work.
- Reading level for UI copy around grade 3–4.
- Humor is punny and goofy, never mean or scary-scary (the Halloween content is "spooky-fun").
- Assume many visits come from shared or school devices: no personal data, nothing that "remembers" a kid beyond simple, anonymous browser storage.

---

## 3. Design direction

### 3.1 Shared design principles (all directions)

- **Colorful and loud, but organized.** Strong color blocks and big type, sitting on a clear grid so kids can scan quickly.
- **Large slab fonts.** Headlines are big, heavy slab serifs. Body text uses a highly legible sans for young readers.
- **Movement with a purpose.** Things wiggle, bounce and react to clicks to show they can be touched, and ambient motion gives the page life.
- **Playful logo.** The Scout Life logo stays recognizable but can animate, react to clicks and take part in Easter eggs (Google Doodle-style). The logo already exists in 10 color versions (red, orange, yellow, green, light blue, dark blue, purple, black, white, white-blue inline), so each direction can pick its main color and Easter eggs can cycle through the others.
- **Minimal mascots.** Content, color and motion carry the personality. **Scout the Maileagle** may appear *sparingly* (e.g., one Easter egg and the "no results" state). No other mascots.
- **No gambling cues.** This is a youth audience. No coins, tokens, credits, jackpots, betting language, slot symbols (7s, cherries, bars, bells), casino lights or "win" sounds anywhere on the page, including the Boredom Buster and Arcade widgets.
- **Clear ads.** Every ad is labeled "Advertisement" and visually separated from content. Easter eggs never sit next to or imitate ads.

### 3.2 Three style directions for mockups

The layout, components and requirements are the same across all three. Only the visual skin changes. Mockups will be built for each so you can pick one or blend them.

#### Direction A — Trail Map / Field Guide

The outdoors and Scouting as the theme.

- **Look:** Topo-map contour lines as background texture, dotted trail lines that connect sections, merit-badge-style patches for section labels, passport-style stamps for "NEW" and "HOT," compass rose details.
- **Motion:** The trail line "draws" itself as you scroll; patches flip on hover; the compass needle in the header follows the cursor.
- **Palette (starting point):** Forest green `#1F5C3A`, trail orange `#F26B21`, sky blue `#3FA9F5`, sunshine yellow `#FFC629`, topo cream `#F6EEDC`, ink `#1B1B1B`.
- **Type:** Alfa Slab One (headlines), Zilla Slab (subheads), Atkinson Hyperlegible (body).

#### Direction B — Sticker-Bomb Scrapbook

Hand-made, collected-from-everywhere energy.

- **Look:** Cards set at slight angles with "tape" corners, die-cut sticker shapes for buttons and badges, doodles in the margins, notebook-paper and kraft-paper textures.
- **Motion:** Cards straighten and lift on hover; stickers "peel" a little when touched; doodles wiggle.
- **Palette (starting point):** Tomato `#FF5A36`, grape `#7B4BFF`, lime `#9BE15D`, sunny `#FFD23F`, teal `#17C3B2`, paper `#FFF8EC`, ink `#222222`.
- **Type:** Ultra (headlines), Patua One (subheads), Nunito (body), Gochi Hand (doodle accents only).

#### Direction C — Arcade / Game UI

The homepage as a game you're playing.

- **Look:** Chunky beveled buttons, score-counter and "level" labels, power-up icons for sections, pixel accents, a dark "screen" backdrop with neon highlights for game-type widgets and light panels for reading areas.
- **Motion:** Buttons press down with a click; "+1" pops on interactions; screen-flicker transitions; marquee text in the arcade widget.
- **Palette (starting point):** Night `#1A1440`, neon cyan `#00E5FF`, magenta `#FF2E93`, pixel yellow `#FFE600`, laser green `#39FF14`, white `#FFFFFF`.
- **Type:** Roboto Slab Black (headlines), Press Start 2P (tiny labels and score text only), Atkinson Hyperlegible (body).

All palettes are starting points. Final color pairs must pass WCAG 2.2 AA contrast (§11).

### 3.3 Typography

- **Licensing:** Free/open fonts only (SIL Open Font License or Apache, e.g., Google Fonts). Self-host the font files; don't load them from a third-party CDN (better speed, privacy and school-filter reliability).
- **Scale:** Hero headline 48–72 px desktop / 32–40 px mobile; section headers 32–40 px / 24–28 px; body 18 px minimum (16 px minimum on mobile).
- **Limits:** At most 3 font families per direction; subset fonts to Latin; use `font-display: swap`.

### 3.4 Motion system

**Level:** Lively but respectful.

- **Ambient motion:** In the header and a few select spots only, e.g., drifting clouds or a twinkling icon. Never behind body text.
- **Interaction motion:** Hover/tap wiggles, bouncy buttons, card lifts, reveals as content scrolls into view.
- **Celebration motion:** Short bursts (confetti, pops) for widget wins and Easter egg discoveries, 1.5 seconds or less.
- **Reduced motion:** When the device's `prefers-reduced-motion` setting is on, ambient motion and parallax turn off; transitions become simple fades; Easter eggs still work but without big movement.
- **Pause control:** A visible "Pause animations" toggle (in the header utility area or footer) that's remembered in browser storage.
- **Safety:** Nothing flashes more than 3 times per second. No auto-playing audio. Sound effects (if any) are off by default and require a tap to turn on.

---

## 4. Page structure

### 4.1 Order of sections (top to bottom)

| # | Section | Notes |
|---|---|---|
| 1 | Leaderboard ad | 728×90 desktop/tablet; 320×50 mobile. Labeled. |
| 2 | Header | Logo, mega-menu nav, search, Subscribe. Becomes a compact sticky bar on scroll. |
| 3 | Hero | 1 big promo + 4 secondary promos, all hand-picked. |
| 4 | Widget Zone 1 | 3 widget slots + 300×250 ad. |
| 5 | Feature band | Video of the Week + Subscription promo (side by side on desktop, stacked on mobile). |
| 6 | Widget Zone 2 | 4 widget slots + 300×600 ad. |
| 7 | Widget Zone 3 (section shelves) | Section Shelf widgets so every section stays visible on the homepage. Includes one more 300×250 ad. |
| 8 | Footer | Links, contact, social, Join Scouting, Advertise, Privacy, campfire Easter egg. |

### 4.2 Grid and breakpoints

| Breakpoint | Width | Columns | Container |
|---|---|---|---|
| Mobile | < 640 px | 4 | Full width, 16 px gutters |
| Tablet | 640–1023 px | 8 | Full width, 24 px gutters |
| Desktop | 1024–1279 px | 12 | 1024 px max |
| Wide | ≥ 1280 px | 12 | 1240 px max |

### 4.3 Widget slot sizes (fixed slots)

Widgets plug into fixed, standard-sized slots so any widget can swap into any slot of a matching size.

| Slot size | Desktop | Tablet | Mobile |
|---|---|---|---|
| **S (Standard)** | 4 of 12 columns, ~ 400×420 px | 4 of 8 columns | Full width |
| **W (Wide)** | 8 of 12 columns, ~ 820×420 px | Full width | Full width |

- Every widget must support **S**. Widgets that benefit from more space (Arcade, Seasonal, Gear carousel) also provide a **W** layout.
- Fixed heights prevent layout shift when widgets load or swap.
- On mobile, widgets stack in a single column. The editor-set order is kept, and ads are placed between widgets (never two ads in a row).

---

## 5. Header

### 5.1 Contents

- **Leaderboard ad** above the header (see §9).
- **Logo:** Large, left-aligned, animated and interactive (see Easter eggs §8).
- **Primary nav:** Games · Jokes · Outdoors & Gear · Hobbies & Projects · Scouts · Contact Us. (**Contests** is removed from the top menu. It stays in the footer and as a homepage widget.)
- **Search:** Icon button that opens a large search panel.
- **Subscribe:** The most visible button in the header (biggest contrast, sticker/button treatment, a gentle wiggle every so often, which stops after 3 times per visit).

### 5.2 Mega menus

Hover (desktop) or tap (tablet/mobile) opens a big, colorful panel for each section:

| Nav item | Subsection links (from current site) | Featured slot |
|---|---|---|
| Games | Play Games (Arcade), Quizzes | 1–2 editor-picked games/quizzes with images |
| Jokes | Joke of the Day, Write a Funny Caption, Wacky Adventures comic, Pee Wee Harris comic | Today's Joke of the Day |
| Outdoors & Gear | Outdoors, Gear Buying Guides, Ask the Gear Guy, Animals and Nature, Fishing | 1–2 featured articles |
| Hobbies & Projects | How To Do It, Fun Stuff to Do, 10 Under 10 Crafts, Pinewood Derby HQ, Heads Up, Fiction | 1–2 featured articles |
| Scouts | Scouting Around, Eagle Project Showcase, Scouts in Action comics | 1–2 featured articles |
| Contact Us | Contact, Subscriber Services, Send Us Your Jokes, Advertise | none |

- Panels open on hover with a short delay (~150 ms) and close on mouse-out with a ~300 ms grace period. They're fully keyboard-operable (Enter/Space opens, Esc closes, arrow keys move).
- Each section has a signature color used in its panel, its section-shelf widget and its article labels, so kids learn the color coding.
- **Without JavaScript,** top-level items link straight to section fronts.

### 5.3 Search

- Opens as a large panel or overlay with a big input ("What are you looking for?").
- Shows **popular search chips** (editor-set), e.g., Jokes, Pinewood Derby, Knots, Games, Halloween.
- Supports **search-word Easter eggs** (§8). The gag plays first (≤ 1.5 s), then normal results load.
- Works as a plain form submit without JS.

### 5.4 Sticky behavior

- After scrolling past the full header, a compact bar slides in with a small logo, a menu button, search and Subscribe.
- The leaderboard ad is **not** sticky.

### 5.5 Mobile header

- Logo + search icon + Subscribe button + menu button.
- The menu opens a full-screen, colorful drawer: search at top, then section accordions (the mega-menu content in list form), then Subscribe and Contact.

### 5.6 Header animation (ambient)

Varies by direction. Examples: clouds drifting behind the logo (Trail Map), doodles that wiggle (Scrapbook), a blinking "PRESS START" cursor (Arcade). Nav items bounce slightly on hover. Ambient motion respects reduced-motion and the pause toggle.

---

## 6. Hero

### 6.1 Layout

- **1 big promo + 4 secondary promos,** all **hand-picked by editors.**
- **Desktop:** Big promo takes about 2/3 of the width (image, section label, big slab headline, short dek). The 4 secondary promos stack in a 2×2 grid or a column on the right third.
- **Tablet:** Big promo full width; secondary promos in a 2×2 grid below.
- **Mobile:** Big promo full width; secondary promos in a horizontally swipeable row with peeking cards (and visible arrows/dots for discoverability).

### 6.2 Promo card content

Image (16:9 for the big promo, 4:3 or 16:9 for secondary), section label in the section's color, headline, optional dek (big promo only), optional "NEW" / "HOT" / "SEASONAL" flag set by the editor.

### 6.3 Behavior

- Cards lift and tilt slightly on hover; the whole card is one link.
- **No auto-rotating carousel** for the big promo (bad for accessibility and young readers).
- Optional: one hero slot can hold a **game or quiz** promo with a "Play" button instead of "Read."

### 6.4 Editorial controls

- Editors choose all 5 slots, with image crop focus points and optional flag.
- A slot can be scheduled to start or end at a set date/time.
- If a hand-picked item is unpublished, its slot shows the next item in a backup list (to prevent an empty hole). This is a safety fallback, not routine auto-fill.

---

## 7. Interactive widgets

### 7.1 Widget framework (applies to every widget)

**Modular:** Each widget is a self-contained module with its own markup, styles, script, data source and analytics. Widgets don't depend on each other.

**Editor controls (CMS):**
- Turn each widget on or off.
- Assign it to a slot, and reorder slots in each zone.
- Pick S or W size where supported.
- Set optional start/end dates (useful for seasonal widgets, even though turning them on by hand is the main workflow).
- Edit the widget's title, intro line and the links it shows.

**Interaction model — "mini-play, then link":** Kids can *do something* right on the homepage (spin, vote, flip, carve), and every widget then offers a clear link to go deeper into the full content.

**Standard widget anatomy:**
1. Header: title in slab type + small icon.
2. Play area: the interactive bit.
3. Result/content area.
4. Footer link: "More jokes →", "See all games →", etc.

**Requirements for every widget:**
- Fixed height per slot size (no layout shift).
- Keyboard and screen-reader accessible. Any interaction done by drag or gesture also works by button.
- Works without JS: shows a static fallback (e.g., the current joke, a list of links).
- Lazy-loads its script when it's near the viewport.
- Fires standard analytics events (§13).
- Includes at least one small Easter egg hook (optional per widget).
- Collects **no personal information** and has **no free-text input that gets stored or published.**

### 7.2 Core widgets

#### Joke widget

- **Joke of the Day:** Shows the **full joke** (names and lines, as formatted on jokes.scoutlife.org), with the contributor credit ("Joke by Teddy W., Lambertville, New Jersey").
- **Find a joke — topic buttons:** 5–6 chunky buttons (editor-configurable; e.g., Animals, Food, Knock-Knock, Camping/Scouting, Monsters, School). Tapping one swaps in a random joke from that topic with a flip/bounce animation.
- **Rate it:** A "Laugh-o-Meter" with 3–5 emoji-style faces (Groan → LOL) that maps to the existing 5-star rating on jokes.scoutlife.org where possible. Anonymous; one rating per joke per browser.
- **Links:** "More jokes →" (jokes.scoutlife.org), "Send us your joke →" (contact page).
- **Data:** Joke of the Day and topic jokes are pulled from jokes.scoutlife.org (WordPress REST API or a cached feed). *Dependency: confirm a feed/API exists or can be added.*
- **Easter egg:** Tapping "Groan" 5 times in a row makes the whole widget sag and melt down like a puddle, then boing back into shape.

#### Requirements Finder

Helps Scouts (and parents/leaders) find Scout Life content that supports specific advancement requirements.

- **Step 1:** Program: **Cub Scouts** or **Scouts BSA** (two big toggle buttons).
- **Step 2:** Dropdown of ranks/categories:
  - Cub Scouts: Lion, Tiger, Wolf, Bear, Webelos, Arrow of Light
  - Scouts BSA: Scout, Tenderfoot, Second Class, First Class, Star, Life, Eagle, **Merit Badges**
- **Step 3:** Dropdown of adventures / requirements / merit badges (only options that have tagged content are shown).
- **Result:** 3–5 matching articles as compact cards, plus "See all →" to a filtered results page.
- **Data:** Uses the existing **Requirements taxonomy** (built but not fully populated). Dropdowns only show terms with at least one tagged article, so kids never land on empty results.
- **Fallback:** If nothing matches, show related content (same rank or category) and a friendly "We're still adding stuff for this one!" note. This is where Scout the Maileagle may appear.
- **Without JS:** A standard form that submits to the results page.
- **Dependency:** A tagging plan to fill out the taxonomy (see §15).

#### Boredom Buster (the Idea Machine)

Works like a slot machine (crank it, windows spin, an idea pops out), but it should look and feel like a **silly homemade contraption**, not a casino game. Think gumball machine crossed with a mad-scientist invention: gears, pipes, a crank, a little smokestack.

- **Interaction:** Kids turn a big crank (or tap a big "CRANK IT!" button). Gears turn, the machine shakes and puffs steam, and three windows spin before landing on a **random project or how-to** from Hobbies & Projects / Fun Stuff to Do / How To Do It.
- **Window icons** show content types: scissors = craft, flask = science, tent = outdoors, paintbrush = art, chef hat = recipe, hammer = build.
- **Result:** The idea pops out of a chute on a ticket or capsule that unrolls into a card: image + title + a "time needed" tag (if available) + "Let's do it →" link. "Try another!" button.
- **Language:** "Crank it!", "Try another!", "Here's an idea!" **Never** "spin to win," "jackpot," "lucky," "bet" or "prize."
- **Banned visuals/sounds:** Coins, tokens, credits, 7s, cherries, bars, bells, flashing marquee lights, casino payout sounds.
- **Easter egg:** If all three windows show the same icon, the machine does a happy dance: it hops, its smokestack toots a bubble ring, and gears pop out and spin back in.
- **Data:** Draws from an editor-maintained pool (or category feed) of projects. Optional metadata for time/indoor/outdoor if we want to filter later.
- **Reduced motion:** The windows fade to the result instead of spinning; the machine doesn't shake.

#### Arcade widget (arcade cabinet)

- **Look:** An illustrated arcade cabinet (styled to match each direction). The "screen" shows an animated preview of the featured game (short looping WebP or muted video, lazy-loaded).
- **Controls:** Joystick / ◀ ▶ arrows flip through 4–6 editor-picked games; a marquee at the top shows the game name; a **"PRESS START"** button links to the game. (No coin slot or "insert coin," in line with the no-gambling-cues rule.)
- **Links:** "See all games →" (Play Games section).
- **Easter egg:** Wiggle the joystick in a full circle and the cabinet's screen turns into a **10-second mini-game** (e.g., catch falling acorns in a basket), with a pixel "Nice!" at the end.
- **Sizes:** S and W (W shows the cabinet plus a short game description).

#### Seasonal widget (Halloween is the first skin)

A **reusable seasonal widget shell** that editors can re-skin for different times of year.

- **Shell parts:**
  1. **Countdown banner:** "17 days until Halloween!" (auto-calculated; switches to a "Happy Halloween!" message on the day).
  2. **Activity area:** Tabs for 1–2 mini-activities.
  3. **Picks:** 3–4 editor-picked seasonal links (crafts, costumes, jokes, stories).
- **Halloween activities:**
  - **Pumpkin Carver:** Tap to pick eyes, nose and mouth shapes for a jack-o'-lantern; a candle flickers when you finish. A "Carve it for real →" link goes to pumpkin projects. *Easter egg:* a secret face combination brings the pumpkin to life: it hops, rolls its eyes, and its candle flame dances.
  - **Trick-or-Treat Door:** Knock on a spooky door. You get a **treat** (a Halloween project or article) or a **trick** (a Halloween joke or a harmless gag, like a rubber spider dropping down). *Easter egg:* knocking the "shave and a haircut" rhythm swings the door open and a conga line of little ghosts dances out across the widget.
- **Future skins (examples):** Winter holidays (decorate a tree / build a snowman), Pinewood Derby season (pick a car, race), Thanksgiving (turkey joke disguise), Summer camp (pack the bag / roast s'mores), Back to school.
- **Sizes:** S and W.

#### Gear Guide widget (carousel)

- **Content:** Swipeable cards mixing **Gear Buying Guides**, **Ask the Gear Guy** Q&As and **Stuff We Like** reviews.
- **Card:** Image, type label ("Buying Guide" / "Ask the Gear Guy" / "Stuff We Like"), title, and for Q&As a short question teaser.
- **Controls:** Arrows + swipe + dots; no auto-advance.
- **Links:** "All gear guides →".
- **Easter egg:** Swipe past the last card and a backpack bursts open, spilling gear icons.
- **Sizes:** S and W.

### 7.3 Additional widgets (current homepage blocks folded into the widget system)

These keep today's homepage content visible in the new widget format.

| Widget | Mini-play | Links to |
|---|---|---|
| **Poll** | Vote on today's poll; animated results bar. Anonymous, one vote per browser. | Polls page |
| **Quiz Teaser** | Answer one question from a featured quiz; get instant "Correct!" / "Nope!" feedback. | Full quiz, Quizzes section |
| **Pinewood Derby** | Pick 1 of 3 cars and watch a 3-second race down the track. | Pinewood Derby HQ |
| **Fishing** | "Cast a line" and reel in a random fishing article, fish fact or fish joke. | fishing.scoutlife.org |
| **Fiction** | "Story starter": the first line of a featured story in big type, with "Keep reading →". | fiction.scoutlife.org |
| **Eagle Projects** | Flip-card carousel of featured Eagle projects. | eagleprojects.scoutlife.org |
| **Comic of the Day** | Comic panel(s) from Wacky Adventures, Pee Wee Harris or Scouts in Action, or a joke-site comic. | Comic section |
| **Write a Funny Caption** | Shows the current photo; tap to see a sample caption. *No caption entry on the homepage (COPPA).* | Caption contest page |
| **Contests & Giveaways** | Flip card that reveals the current prize. | Contests page |
| **Section Shelf** (generic) | A shelf of 3–4 latest articles from any chosen section in that section's color (e.g., Fun Stuff to Do, How To Do It, Scouting Around, Outdoors & Gear, Animals and Nature). | Section front |

**Note:** "This Month's Issue" and "Subscriber Services" move into the Subscription promo (§10).

---

## 8. Easter eggs

### 8.1 Philosophy

Easter eggs are **experiences, not destinations.** Each one is a small, self-contained **mini interaction, animation or game** that's fun in its own right and lasts about 3–30 seconds. The reward is the moment itself: something moves, reacts, can be played with or turns into a quick challenge.

- **Do:** Physics toys (things you can flick, drag, toss or pop), surprise animations, quick skill games, playful page transformations.
- **Don't:** Make the payoff a link to hidden content, a bonus joke, a secret page or a text message.

### 8.2 Rules

1. **Never block content or navigation.** Eggs are bonuses, not barriers.
2. **Never next to, inside or imitating ads.**
3. **No personal data.** Discoveries can be counted anonymously for analytics; nothing else is stored.
4. **Accessible:** Every egg has a keyboard/tap trigger; egg animations respect reduced-motion and the pause toggle; any surprise that changes the page can be undone with one click or Esc.
5. **Lightweight:** The Easter egg script loads after the page is idle and never delays main content.
6. **Editor control:** A master switch plus per-egg toggles in the CMS.
7. **Mobile parity:** Every egg triggered by keyboard has a touch alternative.
8. **No gambling cues** (see §3.1).

### 8.3 Egg catalog

| # | Category | Egg | Trigger | The mini interaction / game |
|---|---|---|---|---|
| 1 | Logo | **Jelly logo** | Hover/tap the logo | Letters jiggle like jelly. Drag any letter and it stretches, then springs back with a boing. |
| 2 | Logo | **Color pop** | Tap the logo repeatedly | Each tap pops it into the next of its 10 official colors with a paint-splat burst. Ten taps in a row and it does a full rainbow spin. |
| 3 | Logo | **Maileagle flyby** | Click/tap the logo 5 times fast | Scout the Maileagle swoops across the header. Tap him mid-flight and he does a loop-de-loop; a feather floats down that kids can blow around with the cursor. (One of the few Maileagle appearances.) |
| 4 | Secret code | **Retro Mode** | Konami code (↑↑↓↓←→←→BA); on touch, swipe that pattern on the header | The page turns into an 8-bit pixel skin and a little pixel hiker walks along the header. Press Space or tap to make him jump over pixel rocks. Esc or "Exit Retro Mode" restores. |
| 5 | Secret code | **Be Prepared** | Type `BEPREPARED` anywhere | A burst of knots, compasses and flashlights rains down and piles up at the bottom of the screen. Kids can flick and toss them around (simple physics) until they fade. |
| 6 | Secret code | **Flashlight hunt** | Tap the logo in Morse SOS (··· − − − ···) | The page goes dark and the cursor/finger becomes a flashlight beam. Find all 5 glowing critters hiding on the page; a counter tracks "3 of 5 found." Lights come back on when you finish or press Esc. |
| 7 | Hidden critter | **Ladybug chase** | Ladybug appears on a random edge | Tap it and it flies to a new spot. Catch it 3 times and it does a victory spiral and flies off the screen. |
| 8 | Hidden critter | **Squirrel stash** | Squirrel peeks out behind a nav item | Tap it and it grabs an acorn and dashes off. Tap the acorns it drops to toss them back, and it catches each one with a little flip. |
| 9 | Hidden critter | **Jumping fish** | Ripples in the Fishing or Gear widget | A fish leaps from the water now and then. Tap it mid-jump to "catch" it; it does a spin and splashes back in. |
| 10 | Hidden critter | **Bat** (seasonal) | Hangs on the Halloween widget | Tap it and it wakes up and follows your cursor around the widget for a few seconds before flapping back to its perch. |
| 11 | Search secret | **Pizza** | Search "pizza" | Pizza slices rain down; tap them to take a bite out of each one. Then results load. |
| 12 | Search secret | **Pinewood** | Search "pinewood" | A derby car zooms down a track that draws itself across the search bar, then crosses a checkered finish line. |
| 13 | Search secret | **Barrel roll** | Search "do a barrel roll" | The page spins once (a wiggle under reduced-motion). |
| 14 | Search secret | **Bigfoot** | Search "bigfoot" | Giant footprints stomp across the page, shaking the cards as they pass. |
| 15 | Search secret | **Knot** | Search "knot" | The search bar ties itself in a square knot; tap to untie it. |
| 16 | Footer | **S'mores toaster** | Scroll to the very bottom | A campfire crackles. Press and hold to toast a marshmallow: let go at golden-brown for a "Perfect!" happy-marshmallow dance; hold too long and it catches fire, so blow it out (tap fast). |
| 17 | Footer | **Constellation builder** | Tap the stars above the campfire | Connect stars to draw constellations; a finished one lights up and animates (e.g., the Big Dipper pours out sparkles). Fireflies blink and drift toward the cursor. |
| 18 | Hidden object | **Paper airplane** | A tiny folded airplane tucked in the hero's corner | Drag and release to throw it; it glides, loops and lands somewhere else on the page. Throw it again from there. |
| 19 | Hidden object | **Stone skipping** | A small pond texture on the Outdoors shelf | Swipe/flick across the water to skip a stone; ripples and a skip counter ("4 skips!"). |
| 20 | Widget | Joke melt, Idea Machine dance, Arcade mini-game, Pumpkin comes alive, Ghost conga, Backpack burst | See §7 | See §7 |

**Critter limits:** At most 2 critters visible at once; positions are randomized per visit so kids keep looking.

**Hint system:** A subtle line near the footer campfire: "Psst… there are secrets hidden on this page." No full list is ever shown on the site.

### 8.4 Parked ideas (not in scope now; revisit later)

- Collectible hidden patches with a "patch vest" tracker.
- Time-of-day and calendar surprises (night-sky header after dark, full moons, Friday the 13th).

## 9. Advertising

- **Ad server:** Google Ad Manager (as now).
- **Labels:** Every unit has a visible "Advertisement" label above it, in a consistent style that's clearly separate from widget styles.
- **Child-directed / COPPA:** All ad requests flagged as child-directed (`tagForChildDirectedTreatment`), with no personalized/behavioral targeting. No Easter eggs, critters or mascots near ads.
- **House-ad fallback:** Unfilled slots show Scout Life house promos (Subscribe, Contests, Send Us Your Jokes, Join Scouting).
- **Layout stability:** Reserve each slot's size up front so the page doesn't jump when ads load.
- **Lazy loading:** Units below the first screen lazy-load (standard GAM lazy load).

### 9.1 Placements and sizes

| Slot | Desktop | Tablet | Mobile |
|---|---|---|---|
| Leaderboard (top) | 728×90 | 728×90 | 320×50 (or 320×100) |
| In-zone 1 (Widget Zone 1) | 300×250 in the zone grid | 300×250 | 300×250, between widgets |
| Tall (Widget Zone 2) | 300×600 next to widgets | 300×250 (swap) | 300×250, between widgets |
| In-zone 3 (Section shelves) | 300×250 | 300×250 | 300×250, between widgets |

- On mobile, never place two ad units back to back, and keep at least one widget between ads.
- Final ad count and order to be confirmed with ad ops (§15).

---

## 10. Subscription promo and Video of the Week

### 10.1 Subscription promo (feature band)

- **Content:** The current magazine cover (large, slightly tilted, lifts on hover), headline ("Get Scout Life delivered to your house!"), a short benefit line, a big **Subscribe** button, and secondary links to **This Month's Issue** and **Subscriber Services**.
- **Motion:** The cover gently "breathes"; on hover a corner peels up to tease an inside page.
- **Tracking:** UTM tags per placement (`utm_campaign=header`, `=promo-band`, `=footer`) so we can compare Subscribe CTAs.
- **Subscribe CTAs in total:** Header (always visible), feature band, footer.

### 10.2 Video of the Week

- **Display:** Custom poster image (hosted on scoutlife.org) + big play button + title + 1-line description.
- **Playback:** Click to play. The YouTube player (`youtube-nocookie.com`, privacy-enhanced mode) loads **only** after the click.
- **Fallback:** If YouTube is blocked (common on school networks) or JS is off, the poster links to the video on YouTube and shows a "Watch on YouTube" label.
- **Links:** "More videos on our YouTube channel →".
- **Editor controls:** Video URL, poster image, title, description.

---

## 11. Accessibility, performance and resilience

### 11.1 Accessibility: WCAG 2.2 AA

- Color contrast: 4.5:1 for body text, 3:1 for large text and UI parts. Big slab headlines on bright colors must be checked.
- Full keyboard support; visible focus states (styled to match each direction, never removed).
- Semantic headings, landmarks and labeled controls; widgets announce result changes to screen readers (`aria-live`).
- Minimum target size 24×24 px (WCAG 2.2), with 44–48 px as our standard.
- No content conveyed only by color or motion.
- Reduced motion and the pause toggle (§3.4).

### 11.2 Performance: Core Web Vitals budget

| Metric | Target (75th percentile, mobile) |
|---|---|
| Largest Contentful Paint | ≤ 2.5 s |
| Interaction to Next Paint | ≤ 200 ms |
| Cumulative Layout Shift | ≤ 0.1 |
| Initial JS (excluding ads) | ≤ 100 KB gzipped |
| Hero image | Responsive `srcset`, AVIF/WebP, ≤ 150 KB on mobile |

- Test target: a mid-range Android phone and a low-end school Chromebook on a throttled 4G connection.
- Widget and Easter egg code loads only when needed (lazy/idle).
- Prefer CSS animations; use JS/Lottie only where needed; no heavy animation libraries on the critical path.

### 11.3 Works without JavaScript

- All content and navigation are reachable with JS off.
- Each widget shows a static fallback (links/lists).
- Search and Requirements Finder work as normal form submits.

### 11.4 School-filter friendly

- Self-host fonts, icons and poster images.
- Load YouTube only on click, with a link fallback.
- Avoid third-party embeds (social feeds, etc.) on the homepage.
- Make sure the page still works if ad and analytics domains are blocked.

---

## 12. Footer

- **Section links:** Games, Jokes, Outdoors & Gear, Hobbies & Projects, Scouts, Contests & Giveaways.
- **Magazine:** Current cover + Subscribe; Subscriber Services; This Month's Issue.
- **Contact:** Online (scoutlife.org/contact-us), phone (866) 584-6589, mail: 1325 W. Walnut Hill Lane, P.O. Box 152401, Irving, TX 75015-2401.
- **Social:** **YouTube only** (channel link with subscribe prompt). No other social icons or promotions anywhere on the homepage.
- **Join Scouting promo:** Scouting America logo + "Find out how you can get involved" → beascout.org (with UTM).
- **Business/legal:** Advertise (media kit), Give, Privacy Policy, © Boy Scouts of America.
- **Fun:** Campfire + s'mores and fireflies/constellation Easter eggs (§8); the "Pause animations" toggle.

---

## 13. Analytics

Uses the existing Google Tag Manager / GA4 setup, configured for a child-directed audience: Google signals and ad personalization off, and IP truncation on.

| Event | Fired when | Key parameters |
|---|---|---|
| `hero_click` | A hero promo is clicked | slot (big, sec1–sec4), article ID |
| `nav_click` | A nav or mega-menu link is clicked | menu, item, featured (y/n) |
| `widget_view` | A widget is 50% in view for 1 s | widget ID, slot, size |
| `widget_interact` | First and subsequent plays (spin, vote, flip, carve, rate) | widget ID, action |
| `widget_clickthrough` | A link out of a widget is clicked | widget ID, destination |
| `egg_found` | An Easter egg is triggered | egg ID |
| `subscribe_click` | Any Subscribe CTA is clicked | placement |
| `video_play` | Video of the Week is played | video ID |
| `search_submit` | A search is submitted | (query not tied to any identifier) |

A simple dashboard showing widget engagement and click-through per widget/slot will support swap decisions.

---

## 14. CMS and editorial operations

Platform-agnostic. If staying on WordPress, these map to a custom theme with a Homepage settings screen (or blocks/ACF).

| Area | Editors can… |
|---|---|
| Hero | Pick 5 items, set crop focus and flag, schedule start/end, keep a backup list |
| Widget zones | Turn widgets on/off, assign to slots, reorder, choose S/W size, set dates |
| Widget content | Edit titles, intro lines, link lists, item pools (Arcade games, Boredom Buster projects, Gear cards, Seasonal picks, Poll question, Quiz question) |
| Video of the Week | Set URL, poster, title, description |
| Subscription promo | Swap cover image, headline, button text |
| Mega menus | Choose featured articles per section |
| Search | Edit popular search chips |
| Easter eggs | Master switch + per-egg toggles |
| Ads | Slot on/off and house-ad creative (in coordination with ad ops) |

---

## 15. Dependencies and open questions

| # | Item | Owner | Needed by |
|---|---|---|---|
| 1 | **Vector logo for production:** PNGs (10 colors, 2193×464) are fine for mockups. Production should use an SVG exported from `ScoutLifeLogo_lgTagRed.ai` for crisp scaling and animation. | Design | Build |
| 2 | **Maileagle web art:** Source files are PSD/TIF (CMYK) plus one PNG head. For mockups I'll use the PNG head and flattened PSD exports. Production needs web-ready transparent PNG/SVG poses (flying pose for the flyby egg) and the usage rules from the reference sheet. | Design | Build |
| 3 | Easter egg review and approval process (animations, mini-games). | Editorial | Build |
| 4 | **Requirements taxonomy:** export of current terms and a plan/owner to finish tagging. | Editorial | Build |
| 5 | **Joke feed/API** from jokes.scoutlife.org (Joke of the Day, by topic, ratings). | Dev | Build |
| 6 | Poll system: keep the current polls plugin or replace? | Dev | Build |
| 7 | Ad ops: GAM ad unit names, final slot count, refresh policy, house-ad creative. | Ad ops | Build |
| 8 | Platform decision (custom WordPress theme vs. headless). | Bryan / dev | Build |
| 9 | Launch timing (e.g., before a seasonal moment such as Pinewood Derby season or summer). | Bryan | Planning |

---

## 16. Mockup plan (Phase 2, after approval)

### 16.1 Deliverables

Three **interactive HTML prototypes**, one per direction, saved in the `sl-mockups` folder:

```
sl-mockups/
  a-trail-map/index.html
  b-sticker-bomb/index.html
  c-arcade/index.html
```

Each is a single self-contained responsive page you can open on desktop, tablet and phone.

### 16.2 What each prototype includes

- Header with leaderboard placeholder, animated logo, working mega menus, search panel, Subscribe, sticky compact header, mobile drawer.
- Hero with 1 big + 4 secondary promos (using real current Scout Life headlines).
- All 6 core widgets working at the mini-play level: Joke, Requirements Finder, Boredom Buster, Arcade, Halloween seasonal, Gear carousel.
- 3–4 additional widgets (e.g., Poll, Quiz Teaser, Pinewood Derby, Section Shelf).
- Video of the Week and Subscription promo band.
- Labeled ad placeholders at the correct sizes for each breakpoint.
- At least 8 working Easter eggs, all mini interactions or games: Jelly logo, Color pop, Maileagle flyby, Retro Mode, a critter (Ladybug chase), a search secret, the S'mores toaster and a widget egg (e.g., Idea Machine dance).
- Reduced-motion support and the pause toggle.
- Footer.

### 16.3 Content in mockups

**Use real content wherever possible:** real current article titles, real images (from scoutlife.org) and real links to live scoutlife.org pages and subdomains, so clicking a promo or widget result opens the actual article. Real logo PNGs from `scout life logo/` and Maileagle art from `maileagle illustrations/`. Placeholders only where no real equivalent exists (e.g., ads are gray labeled boxes; the Video of the Week uses a real Scout Life YouTube video).

### 16.4 Review process

1. Review all three directions on desktop and phone.
2. Pick one direction, or a blend (e.g., Trail Map structure + Arcade widgets).
3. Revise the chosen direction.
4. Optional: page-level specs / style guide for developers.

---

## 17. Decision log

| Topic | Decision |
|---|---|
| Primary audience | Ages 8–13 |
| Brand freedom | Logo stays recognizable but can be playful/animated |
| Visual direction | Explore 3: Trail Map, Sticker-Bomb Scrapbook, Arcade |
| Platform | Undecided; requirements platform-agnostic |
| Easter egg types | Secret codes, hidden critters, logo reactions, search secrets, footer surprises; ad-free zones rule |
| Easter egg style | Mini interactions, animations and games; not links to hidden content or bonus jokes |
| Motion | Lively but respectful (reduced-motion + pause toggle) |
| Mascots | Minimal; Scout the Maileagle sparingly |
| Hero curation | Fully hand-picked |
| Other homepage blocks | Folded into the widget system |
| Widget operations | Editor toggles in CMS; fixed slots |
| Requirements Finder | Uses existing Requirements taxonomy (partially populated) |
| Widget depth | Mini-play, then link |
| Boredom Buster | Slot-machine mechanic, styled as a playful "Idea Machine" contraption; no casino cues |
| Ads | Google Ad Manager; COPPA/kid-safe; mobile size swaps; house-ad fallback |
| Joke widget | Show full Joke of the Day (matches jokes site format); topic buttons; rate it |
| Gear widget | Carousel |
| Navigation | Mega menus |
| Standards | WCAG 2.2 AA; Core Web Vitals budget; works without JS; school-filter friendly |
| Seasonal widget | Reusable template; Halloween with Pumpkin Carver, Trick-or-Treat Door, Countdown + picks |
| Arcade widget | Arcade cabinet |
| Video of the Week | Poster image, click-to-play (privacy-enhanced YouTube) |
| Mockups | Interactive HTML, 3 directions |
| Fonts | Free/open licenses only |
| Success metrics | Pages per visit, widget engagement, subscriptions |
| Document format | Word + Markdown |
| Top menu | Contests removed (kept in footer and as a widget) |
| Social | YouTube only |
| Brand assets | Logo PNGs (10 colors) and Maileagle art provided in project folder |
| Mockup content | Real images and links whenever possible |
