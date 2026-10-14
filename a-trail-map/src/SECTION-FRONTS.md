# Section fronts: build contract (Direction A: Trail Map)

Read `CONTRACT.md` and `DIRECTION-A.md` first. All their rules still apply (gender-neutral palette from base.css, no gambling cues, Easter eggs are mini interactions/games, WCAG 2.2 AA, `SL.motionOK()`, no external libraries, real Scout Life content/links/images, no personal data).

## Client decisions
- Custom section fronts eventually for Games, Write a Funny Caption, Outdoors & Gear, Hobbies & Projects, Pinewood Derby, Scouts. Every other category/tag page uses a **default layout**.
- **This round:** default layout (demo category **Animals and Nature**), **Games**, **Pinewood Derby**.
- **All layouts:** large slab display headers (Alfa Slab One) with an **emphasis on featured images**.
- **Header style:** full-width featured-image banner with the giant slab section title on a **wooden trail sign** overlaid on the photo, plus the lead story's headline.
- **Paging (default layout):** "Load more" button **and** numbered page links underneath.
- **Ads:** top leaderboard (from the shell) + a 300×250 **in the story grid about every 2 rows**. No sidebar.
- **Default layout extras:** **one** editor-chosen widget slot in the grid. Subcategory chips under the header **only when the category has children** (Animals and Nature has none, so it shows just a breadcrumb).
- **Easter eggs:** all site-wide header/footer eggs work on every page (they live in the shell + eggs). The **hiker trail runs on the homepage only**. Plus new eggs unique to Games and Pinewood (below).
- **Mockup links:** homepage menus/widgets that point to Games, Pinewood Derby HQ or Animals and Nature open these new pages; everything else still links to the live site.

## Files and build
- Pages: `src/pages/<slug>/page.html` (content that goes inside `<main id="main">`), optional `page.css`, `page.js`, `meta.txt` (line 1 = `<title>`, line 2 = description). `python3 src/build.py` writes `../<slug>.html` using the shell's header + footer. `<!--WIDGET:id-->` placeholders work in page.html too.
- Slugs: `animals-and-nature`, `games`, `pinewood-derby`.
- Body gets `data-page="home|<slug>"`. Shell/egg JS must check it for homepage-only behavior.
- Shared section components: `src/sections/sections.css` and `src/sections/sections.js` (loaded on every page).
- Images: `assets/img/sf-<slug>-*.jpg`. Hero banners about 1600×700 (`i0.wp.com/...?...resize=1600%2C700&ssl=1`), cards about 600×400. Keep each under about 220 KB (hero) / 90 KB (card).
- CSS scoping: shared components use `.sf-*`; page-specific CSS is scoped under `body[data-page="<slug>"]` or a page prefix (`.gm-` Games, `.pd-` Pinewood, `.an-` default/Animals).

## Shared component markup (owned by Agent DEFAULT; page agents must use exactly this markup)

### 1. Section hero banner
```html
<section class="sf-hero" style="--sec:var(--c-outdoors);--sec-ink:var(--ink)" aria-labelledby="sf-title">
  <div class="sf-hero-media"><img src="assets/img/sf-animals-hero.jpg" alt="" width="1600" height="700" fetchpriority="high"></div>
  <div class="container sf-hero-inner">
    <nav class="sf-crumbs" aria-label="Breadcrumb"><ol>
      <li><a href="index.html">Home</a></li>
      <li><a href="https://scoutlife.org/section/outdoors/">Outdoors &amp; Gear</a></li>
      <li aria-current="page">Animals and Nature</li></ol></nav>
    <h1 class="sf-title" id="sf-title"><span class="sf-sign"><span class="sf-sign-txt">Animals and Nature</span></span></h1>
    <p class="sf-intro">One-line section intro.</p>
    <a class="sf-lead" href="https://scoutlife.org/…">
      <span class="sticker flag-new">Featured</span>
      <span class="sf-lead-title">Lead story headline</span>
      <span class="sf-lead-dek">Optional one-line dek.</span>
    </a>
  </div>
</section>
```
The photo is the lead story's image. Title sign is huge (≈ 72–96px desktop, 40–48px phone). The lead headline sits on a cream field-guide card at the bottom of the banner. The photo stays clearly visible (the "emphasis on featured images" requirement). Readable at every width.

### 2. Subnav chips (only when children exist)
```html
<nav class="container sf-subnav" aria-label="In this section"><ul>
  <li><a class="sf-chip" href="…" aria-current="page">Play Games</a></li>
  <li><a class="sf-chip" href="…">Quizzes</a></li>
</ul></nav>
```

### 3. Story grid (image-first cards, in-grid ads, widget slot, paging)
```html
<section class="container sf-stories" aria-labelledby="sf-latest">
  <div class="sh-zone-head"><h2 id="sf-latest" class="sh-zone-title"><span class="sh-sign"><span class="sh-sign-board"><span class="sh-sign-txt">Latest Stories</span></span></span></h2><span class="sh-zone-note" aria-hidden="true">fresh tracks</span></div>
  <ul class="sf-grid" data-sf-grid>
    <li class="sf-card sf-card-lg">   <!-- optional: spans 2 columns on desktop -->
      <a href="https://scoutlife.org/…">
        <span class="sf-card-img"><img src="assets/img/sf-…jpg" alt="" width="600" height="400" loading="lazy"></span>
        <span class="sf-card-body">
          <span class="sticker label-outdoors">Animals &amp; Nature</span>
          <h3 class="sf-card-title">Headline</h3>
          <span class="sf-card-dek">Optional short dek</span>
        </span>
      </a>
    </li>
    <li class="sf-ad"><div class="ad-slot"><span class="ad-label">Advertisement</span><div class="ad-box ad-300x250">300 × 250 ad</div></div></li>
    <li class="sf-slot"><!--WIDGET:joke--></li>   <!-- editor-chosen widget (460px tall) -->
  </ul>
  <template data-sf-batch> …more <li class="sf-card"> + one sf-ad… </template>   <!-- revealed by Load more -->
  <div class="sf-more">
    <button class="btn btn-tomato sf-loadmore" type="button" data-sf-more>Load more stories</button>
    <nav class="sf-pages" aria-label="Pages"><a aria-current="page">1</a><a href="#">2</a><a href="#">3</a><a href="#">Next →</a></nav>
  </div>
</section>
```
- Grid: 3 columns desktop, 2 tablet, 1 phone. Cards are image-first (big 3:2 photo), with the label patch and slab headline. Hover = lift + patch flip like the homepage.
- An `.sf-ad` cell appears about every 2 rows. Never two ads adjacent (including on phone).
- `sections.js`: the Load more button appends the next `<template data-sf-batch>` (there can be several) with a fade-in, moves focus to the first new card, announces it via aria-live, and hides itself when no batches are left. Numbered page links are plain links (mockup: `href="#"`). Fire `SL.track('sf_load_more')`.

## Owners
| Agent | Owns |
|---|---|
| DEFAULT | `src/sections/*`, `src/pages/animals-and-nature/*`, shell edits (`data-page` guards so the hiker trail and homepage-only code run only on `home`; homepage links to the new pages), `src/eggs/*` guard fixes if any egg assumes homepage-only anchors |
| GAMES | `src/pages/games/*` |
| PINEWOOD | `src/pages/pinewood-derby/*` |

Page agents: don't edit shell.*, sections/*, widgets/*, eggs/*, base.css, core.js or build.py. If you need something shared changed, say so in your report. You may embed existing widgets with `<!--WIDGET:id-->` (e.g., `arcade`, `quiz`, `pinewood`, `poll`, `joke`); their JS initializes any instance with `data-widget`.

## Testing
`cd /sessions/youthful-gifted-feynman/mnt/sl-mockups/a-trail-map && python3 src/build.py`, then screenshot `file:///sessions/youthful-gifted-feynman/mnt/sl-mockups/a-trail-map/<slug>.html` at 1280 / 800 / 375 with Playwright Chromium (`LD_LIBRARY_PATH=/tmp/xd/usr/lib/aarch64-linux-gnu`; if /tmp/xd is missing: `mkdir -p /tmp/xd && cd /tmp && apt-get download libxdamage1 && dpkg -x libxdamage1*.deb /tmp/xd`; if Chromium is missing: `python3 -m playwright install chromium-headless-shell`). View crops by saving JPGs to /sessions/youthful-gifted-feynman/mnt/outputs/ and reading them at /Users/bwursten/Library/Application Support/Claude/local-agent-mode-sessions/322b4d07-3ffe-4f05-9a6e-69f24dd7de3e/a7d59dc3-af44-4e8f-b7a3-89e809a17d74/66e4192e/outputs/<file>.jpg. Delete scratch JPGs when done. Check for JS errors, horizontal overflow and that widgets stay 460px tall.
