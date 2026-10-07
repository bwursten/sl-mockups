/* ============================================================
   Seasonal widget — reusable seasonal shell + Halloween skin
   (Direction C look: "Haunted Level").
   The SHELL (countdown, tabs, picks, activity registry) is generic.
   Everything seasonal lives in a SKIN config object; editors would
   swap the skin (winter, pinewood season, summer camp…) in the CMS.
   Owner: Agent C
   ============================================================ */
(function(){
  'use strict';
  var SL = window.SL;
  if (!SL) return;

  var SITE = 'https://scoutlife.org';

  /* ==========================================================
     SKIN CONFIG — Halloween
     ========================================================== */
  var SKINS = {
    halloween: {
      id: 'halloween',
      event: { name: 'Halloween', month: 10, day: 31 },
      /* skin colors (palette tokens only) */
      theme: {
        '--ss-night': 'var(--night-2)',
        '--ss-pop':   'var(--orange)',
        '--ss-glow':  'var(--sunny)',
        '--ss-slime': 'var(--lime)',
        '--ss-cool':  'var(--teal)',
        '--ss-door':  'var(--teal)'
      },
      copy: {
        label: 'Halloween timer',
        many: 'days left',
        one: 'day left',
        today: 'Happy Halloween!',
        todayIcon: '🎃'
      },
      /* tabs, in order (ids map to the ACTIVITIES registry below) */
      activities: [
        { id: 'carver', icon: '🎃', label: 'Pumpkin Carver', short: 'Carve' },
        { id: 'door',   icon: '🚪', label: 'Trick-or-Treat Door', short: 'Knock!' }
      ],
      carver: {
        secret: { eyes: 'star', nose: 'tri', mouth: 'zigzag' },
        litMsg: 'Candle lit! Now that’s a jack-o’-lantern.',
        aliveMsg: 'Whoa… it’s ALIVE! 🎃',
        pickMsg: 'Pick eyes, a nose and a mouth to light the candle.'
      },
      door: {
        treatChance: 0.6,
        treats: [
          { title: 'How to Make a Ghost Decoration Using a Cardboard Tube', href: SITE + '/hobbies-projects/projects/192234/how-to-make-a-ghost-decoration-using-a-cardboard-tube/', img: 'assets/img/seasonal-ghost.jpg' },
          { title: 'How to Make Faux Stained-Glass Art for Halloween', href: SITE + '/hobbies-projects/projects/182598/how-to-make-a-faux-stained-glass-pumpkin/', img: 'assets/img/seasonal-pumpkin.jpg' },
          { title: '101 Funny Halloween Jokes and Comics', href: SITE + '/features/23079/funny-halloween-jokes/', img: 'assets/img/seasonal-jokes.jpg' },
          { title: 'Creepy But Cool: These 5 Critters Are More Helpful Than Scary', href: SITE + '/outdoors/animals-and-nature/192183/creepy-but-cool-these-5-critters-are-more-helpful-than-scary/', img: 'assets/img/seasonal-critters.jpg' }
        ],
        /* real reader jokes from "101 Funny Halloween Jokes and Comics" */
        jokes: [
          { q: 'What do you call wood when it’s scared?', a: 'Petrified!', by: 'Daniel B., Lincoln, Neb.' },
          { q: 'What happens when a mummy gets a cold?', a: 'It starts coffin!', by: 'Keenan N., Williamstown, Kentucky' },
          { q: 'Where do the baby ghosts go?', a: 'Day scare!', by: 'Lucas Z., Evans, Ga.' },
          { q: 'What do ghosts like to eat?', a: 'Spook-ghetti.', by: 'Talia B., Summit, New Jersey' },
          { q: 'What treat do eye doctors give out on Halloween?', a: 'Candy corneas.', by: 'Michael and Matthew A., Elba, N.Y.' },
          { q: 'How do you mend a jack-o’-lantern?', a: 'With a pumpkin patch.', by: 'Thomas W., Shreveport, La.' },
          { q: 'What do mummies like listening to on Halloween?', a: 'Wrap music!', by: 'Brent J., Upper Arlington, Ohio' },
          { q: 'What did the ghost wear to the dance?', a: 'Booooots.', by: 'Bert Y., Corpus Christi, Tex.' }
        ],
        gags: {
          spider: 'A rubber spider! Gotcha! 🕷️',
          cat: 'A cat yowls from the dark! 🐈‍⬛',
          bats: 'A bunch of bats flap out! 🦇'
        },
        congaMsg: 'Shave and a haircut… TWO BOOS!',
        congaSub: 'You knocked the secret rhythm. Conga line, everybody!'
      },
      picks: [
        { title: 'How to Make a Ghost Decoration Using a Cardboard Tube', short: '👻 Ghost craft', href: SITE + '/hobbies-projects/projects/192234/how-to-make-a-ghost-decoration-using-a-cardboard-tube/', img: 'assets/img/seasonal-ghost.jpg' },
        { title: 'How to Make Faux Stained-Glass Art for Halloween', short: '🎃 Glass pumpkin', href: SITE + '/hobbies-projects/projects/182598/how-to-make-a-faux-stained-glass-pumpkin/', img: 'assets/img/seasonal-pumpkin.jpg' },
        { title: '101 Funny Halloween Jokes and Comics', short: '😂 101 jokes', href: SITE + '/features/23079/funny-halloween-jokes/', img: 'assets/img/seasonal-jokes.jpg' },
        { title: 'Creepy But Cool: These 5 Critters Are More Helpful Than Scary', short: '🕷️ Creepy critters', href: SITE + '/outdoors/animals-and-nature/192183/creepy-but-cool-these-5-critters-are-more-helpful-than-scary/', img: 'assets/img/seasonal-critters.jpg' }
      ]
    }
  };

  /* ==========================================================
     Helpers
     ========================================================== */
  var WID = 'seasonal';
  var found = {};
  function eggOnce(id){ if (found[id]) return; found[id] = true; SL.eggFound(id); }
  function esc(s){ return String(s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function restart(el, cls){ el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }
  function bag(src){ var b = []; return function(){ if (!b.length) b = SL.shuffle(src); return b.pop(); }; }

  /** "today" — supports ?sl-date=YYYY-MM-DD for previewing other days */
  function getToday(){
    var m = /[?&]sl-date=(\d{4})-(\d{2})-(\d{2})/.exec(window.location.search);
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date();
  }
  function daysUntil(month1, day, now){
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var target = new Date(now.getFullYear(), month1 - 1, day);
    if (today > target) target = new Date(now.getFullYear() + 1, month1 - 1, day);
    return Math.round((target - today) / 86400000);
  }

  /* ==========================================================
     SHELL parts (generic)
     ========================================================== */
  function applyTheme(root, skin){
    Object.keys(skin.theme || {}).forEach(function(k){ root.style.setProperty(k, skin.theme[k]); });
    root.setAttribute('data-skin', skin.id);
  }

  function renderCountdown(root, skin){
    var el = SL.$('.ss-count', root); if (!el) return;
    var num = SL.$('.ss-count-num', el), txt = SL.$('.ss-count-txt', el), lbl = SL.$('.ss-count-lbl', el);
    if (lbl && skin.copy.label) lbl.textContent = skin.copy.label;
    var n = daysUntil(skin.event.month, skin.event.day, getToday());
    if (n === 0){
      el.classList.add('is-today');
      num.textContent = skin.copy.todayIcon; num.setAttribute('aria-hidden', 'true');
      txt.textContent = skin.copy.today;
    } else {
      el.classList.remove('is-today');
      num.textContent = String(n); num.removeAttribute('aria-hidden');
      txt.textContent = ' ' + (n === 1 ? skin.copy.one : skin.copy.many);
    }
  }

  function renderPicks(root, skin){
    var ul = SL.$('.ss-picks', root); if (!ul || !skin.picks) return;
    ul.innerHTML = skin.picks.map(function(p){
      return '<li><a class="ss-pick" href="' + esc(p.href) + '">' +
        '<img src="' + esc(p.img) + '" alt="" width="56" height="40" loading="lazy">' +
        '<span class="ss-pick-t">' + esc(p.title) + '</span>' +
        '<span class="ss-pick-s" aria-hidden="true">' + esc(p.short) + '</span></a></li>';
    }).join('');
  }

  function initTabs(root, skin){
    var list = SL.$('.ss-tabs', root); if (!list) return;
    var wanted = skin.activities.map(function(a){ return a.id; });
    // drop tabs/panels this skin doesn't use; relabel the rest from config
    SL.$$('[role="tab"]', list).forEach(function(t){
      var id = t.id.replace('ss-tab-', '');
      var cfg = skin.activities.filter(function(a){ return a.id === id; })[0];
      if (!cfg){ var p = document.getElementById(t.getAttribute('aria-controls')); if (p) p.remove(); t.remove(); return; }
      t.innerHTML = '<span aria-hidden="true">' + esc(cfg.icon) + '</span> <span class="ss-long">' + esc(cfg.label) + '</span><span class="ss-short">' + esc(cfg.short) + '</span>';
    });
    var tabs = SL.$$('[role="tab"]', list).sort(function(a, b){
      return wanted.indexOf(a.id.replace('ss-tab-', '')) - wanted.indexOf(b.id.replace('ss-tab-', ''));
    });
    tabs.forEach(function(t){ list.appendChild(t); });
    if (tabs.length < 2) list.hidden = true;

    function select(tab, focus){
      tabs.forEach(function(t){
        var on = t === tab;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        var p = document.getElementById(t.getAttribute('aria-controls'));
        if (p) p.hidden = !on;
      });
      if (focus) tab.focus();
    }
    tabs.forEach(function(t, i){
      t.addEventListener('click', function(){
        if (t.getAttribute('aria-selected') !== 'true') SL.trackInteract(WID, 'tab_' + t.id.replace('ss-tab-', ''));
        select(t);
      });
      t.addEventListener('keydown', function(e){
        var n = tabs.length, j = null;
        if (e.key === 'ArrowRight') j = (i + 1) % n;
        else if (e.key === 'ArrowLeft') j = (i - 1 + n) % n;
        else if (e.key === 'Home') j = 0;
        else if (e.key === 'End') j = n - 1;
        if (j !== null){ e.preventDefault(); select(tabs[j], true); }
      });
    });
    select(tabs[0], false);
  }

  /* ==========================================================
     ACTIVITY: Pumpkin Carver
     ========================================================== */
  function pts(a){ return '<polygon points="' + a.map(function(p){ return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' ') + '"/>'; }
  function star(x, y, R, r){
    var a = []; for (var i = 0; i < 10; i++){ var ang = -Math.PI / 2 + i * Math.PI / 5, rad = i % 2 ? r : R; a.push([x + Math.cos(ang) * rad, y + Math.sin(ang) * rad]); }
    return pts(a);
  }
  var SHAPES = {
    eyes: [
      { id: 'tri',   name: 'Triangle eyes', f: function(x, y){ return pts([[x-15, y+11], [x+15, y+11], [x, y-14]]); } },
      { id: 'round', name: 'Round eyes',    f: function(x, y){ return '<circle cx="' + x + '" cy="' + y + '" r="13"/>'; } },
      { id: 'star',  name: 'Star eyes',     f: function(x, y){ return star(x, y + 1, 18, 7.5); } },
      { id: 'happy', name: 'Happy eyes',    f: function(x, y){ return '<path d="M' + (x-16) + ' ' + (y+8) + ' Q' + x + ' ' + (y-24) + ' ' + (x+16) + ' ' + (y+8) + ' Q' + x + ' ' + (y-5) + ' ' + (x-16) + ' ' + (y+8) + 'Z"/>'; } }
    ],
    nose: [
      { id: 'tri',     name: 'Triangle nose', f: function(x, y){ return pts([[x-12, y+10], [x+12, y+10], [x, y-11]]); } },
      { id: 'round',   name: 'Round nose',    f: function(x, y){ return '<circle cx="' + x + '" cy="' + y + '" r="9"/>'; } },
      { id: 'diamond', name: 'Diamond nose',  f: function(x, y){ return pts([[x, y-12], [x+10, y], [x, y+12], [x-10, y]]); } },
      { id: 'snout',   name: 'Snout nose',    f: function(x, y){ return '<circle cx="' + (x-6) + '" cy="' + y + '" r="5"/><circle cx="' + (x+6) + '" cy="' + y + '" r="5"/>'; } }
    ],
    mouth: [
      { id: 'grin',   name: 'Big grin',     f: function(x, y){ return '<path d="M' + (x-44) + ' ' + y + ' Q' + x + ' ' + (y+46) + ' ' + (x+44) + ' ' + y + ' Q' + x + ' ' + (y+20) + ' ' + (x-44) + ' ' + y + 'Z"/>'; } },
      { id: 'zigzag', name: 'Zigzag mouth', f: function(x, y){
          var d = 'M' + (x-46) + ' ' + y, zz = [[-34, 12], [-23, 2], [-11, 14], [0, 3], [11, 14], [23, 2], [34, 12], [46, 0]];
          zz.forEach(function(p){ d += ' L' + (x + p[0]) + ' ' + (y + p[1]); });
          return '<path d="' + d + ' Q' + x + ' ' + (y+50) + ' ' + (x-46) + ' ' + y + 'Z"/>'; } },
      { id: 'ooh',    name: 'Ooh! mouth',   f: function(x, y){ return '<ellipse cx="' + x + '" cy="' + (y+17) + '" rx="13" ry="16"/>'; } },
      { id: 'tooth',  name: 'One-tooth smile', f: function(x, y){ return '<path d="M' + (x-42) + ' ' + y + ' Q' + x + ' ' + (y+42) + ' ' + (x+42) + ' ' + y + ' L' + (x+7) + ' ' + y + ' L' + (x+7) + ' ' + (y+11) + ' L' + (x-7) + ' ' + (y+11) + ' L' + (x-7) + ' ' + y + 'Z"/>'; } }
    ]
  };
  var POS = { eyes: [[70, 93], [130, 93]], nose: [[100, 123]], mouth: [[100, 141]] };
  var ICON = { eyes: { at: [18, 19], vb: '0 0 36 36' }, nose: { at: [18, 18], vb: '2 2 32 32' }, mouth: { at: [50, 10], vb: '2 4 96 50' } };
  function shapeById(part, id){ return SHAPES[part].filter(function(s){ return s.id === id; })[0]; }

  function initCarver(root, skin){
    var panel = SL.$('.ss-carver', root); if (!panel) return;
    var cfg = skin.carver;
    var clip = SL.$('.ss-cut-clip', panel), edge = SL.$('.ss-cut-edge', panel), status = SL.$('.ss-carve-status', panel);
    var sel = { eyes: null, nose: null, mouth: null };
    var aliveT = null, wasLit = false;

    // build option buttons
    SL.$$('.ss-opt-row', panel).forEach(function(row){
      var part = row.getAttribute('data-part');
      SHAPES[part].forEach(function(s){
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'ss-opt';
        b.setAttribute('aria-pressed', 'false');
        b.setAttribute('aria-label', s.name);
        b.setAttribute('data-id', s.id);
        b.innerHTML = '<svg viewBox="' + ICON[part].vb + '" aria-hidden="true" focusable="false">' + s.f(ICON[part].at[0], ICON[part].at[1]) + '</svg>';
        b.addEventListener('click', function(){ choose(part, s.id); });
        row.appendChild(b);
      });
    });

    function draw(){
      var html = '';
      Object.keys(sel).forEach(function(part){
        if (!sel[part]) return;
        var s = shapeById(part, sel[part]);
        POS[part].forEach(function(p){ html += s.f(p[0], p[1]); });
      });
      clip.innerHTML = html; edge.innerHTML = html;
    }

    function choose(part, id){
      sel[part] = id;
      SL.$$('.ss-opt-row[data-part="' + part + '"] .ss-opt', panel).forEach(function(b){
        b.setAttribute('aria-pressed', b.getAttribute('data-id') === id ? 'true' : 'false');
      });
      draw();
      SL.trackInteract(WID, 'carve');
      var done = sel.eyes && sel.nose && sel.mouth;
      panel.classList.toggle('is-lit', !!done);
      if (!done){ status.textContent = cfg.pickMsg; return; }
      var s = cfg.secret;
      if (sel.eyes === s.eyes && sel.nose === s.nose && sel.mouth === s.mouth){ alive(); }
      else { status.textContent = cfg.litMsg; if (!wasLit) SL.confettiAt(SL.$('.ss-pk', panel), { count: 10, shapes: ['✦', '★', '●'], colors: ['#FFE600', '#FF9F1C', '#3CF06E'], spread: 80 }); }
      wasLit = true;
    }

    function alive(){
      clearTimeout(aliveT);
      panel.classList.remove('is-alive'); void panel.offsetWidth;
      panel.classList.add('is-alive');
      status.textContent = cfg.aliveMsg;
      eggOnce('pumpkin-alive');
      SL.trackInteract(WID, 'pumpkin_alive');
      SL.confettiAt(SL.$('.ss-pk', panel), { count: 22, shapes: ['🎃', '★', '✦', '●'], colors: ['#FF9F1C', '#FFE600', '#3CF06E', '#00E5FF'] });
      aliveT = setTimeout(function(){ panel.classList.remove('is-alive'); }, SL.motionOK() ? 3900 : 2600);
    }

    // start with a blank (uncarved) pumpkin
    clip.innerHTML = ''; edge.innerHTML = '';
    status.textContent = cfg.pickMsg;
  }

  /* ==========================================================
     ACTIVITY: Trick-or-Treat Door
     ========================================================== */
  var GHOST_SVG = '<svg viewBox="0 0 44 54" aria-hidden="true" focusable="false"><path d="M8 26 2 16M36 26l6-10" fill="none" stroke="#12102B" stroke-width="3.5" stroke-linecap="round"/>' +
    '<path d="M22 3C11 3 5 11 5 22v26l6-5 5 6 6-6 6 6 5-6 6 5V22C39 11 33 3 22 3z" fill="#fff" stroke="#12102B" stroke-width="3" stroke-linejoin="round"/>' +
    '<ellipse cx="16" cy="21" rx="3" ry="4.2" fill="#12102B"/><ellipse cx="28" cy="21" rx="3" ry="4.2" fill="#12102B"/><ellipse cx="22" cy="31" rx="3.6" ry="3.2" fill="#12102B"/>' +
    '<circle cx="11" cy="27" r="2.5" fill="#FF9F1C" opacity=".7"/><circle cx="33" cy="27" r="2.5" fill="#FF9F1C" opacity=".7"/></svg>';
  var BAT_SVG = '<svg viewBox="0 0 64 36" aria-hidden="true" focusable="false"><g class="ss-bat-wingL"><path d="M28 16C20 6 9 4 1 9c5 1 7 5 6 9 4-2 8-1 9 3 3-3 8-3 12-5z"/></g>' +
    '<g class="ss-bat-wingR"><path d="M36 16c8-10 19-12 27-7-5 1-7 5-6 9-4-2-8-1-9 3-3-3-8-3-12-5z"/></g><path d="M32 8c-5 0-7 4-7 9s3 10 7 10 7-5 7-10-2-9-7-9z"/>' +
    '<circle class="ss-bat-eye" cx="29.5" cy="15" r="2"/><circle class="ss-bat-eye" cx="34.5" cy="15" r="2"/><path class="ss-bat-fang" d="M30.5 20.5l1 2 1-2"/></svg>';
  var SPIDER_SVG = '<svg viewBox="0 0 34 28" aria-hidden="true" focusable="false"><g fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round">' +
    '<path d="M12 12 4 6 1 10M12 15 3 14 1 19M13 18l-7 5-1 4M22 12l8-6 3 4M22 15l9-1 2 5M21 18l7 5 1 4"/></g>' +
    '<ellipse cx="17" cy="15" rx="7" ry="8" fill="#4A4A5C" stroke="#fff" stroke-width="2"/><circle cx="14.5" cy="13" r="2.4" fill="#fff"/><circle cx="19.5" cy="13" r="2.4" fill="#fff"/>' +
    '<circle cx="15" cy="13.6" r="1.1" fill="#12102B"/><circle cx="20" cy="13.6" r="1.1" fill="#12102B"/><path d="M15 18q2 2 4 0" fill="none" stroke="#fff" stroke-width="1.5"/></svg>';
  var CAT_SVG = '<svg class="ss-cat" viewBox="0 0 80 66" aria-hidden="true" focusable="false">' +
    '<path d="M12 66V30L8 6l17 13h30L72 6l-4 24v36z" fill="#2B2B3A" stroke="#fff" stroke-width="2.5" stroke-linejoin="round"/>' +
    '<ellipse cx="28" cy="34" rx="7" ry="8" fill="#FFE600"/><ellipse cx="52" cy="34" rx="7" ry="8" fill="#FFE600"/>' +
    '<ellipse cx="28" cy="34" rx="2" ry="6" fill="#12102B"/><ellipse cx="52" cy="34" rx="2" ry="6" fill="#12102B"/>' +
    '<path d="M36 44h8l-4 4z" fill="#FF9F1C"/><ellipse cx="40" cy="54" rx="6" ry="5" fill="#12102B" stroke="#fff" stroke-width="2"/>' +
    '<path d="M4 42l18 3M4 50l18-1M76 42l-18 3M76 50l-18-1" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></svg>';

  /** Forgiving "shave and a haircut… two bits" detector.
      7 knocks; gaps in half-beats ≈ [2,1,1,2,(pause)4,2]. */
  function isShave(t){
    if (t.length !== 7) return false;
    var iv = [], total = 0;
    for (var i = 1; i < 7; i++){ var d = t[i] - t[i-1]; iv.push(d); total += d; }
    var pat = [2, 1, 1, 2, 4, 2], u = total / 12;
    if (u < 55 || u > 480) return false;                        // too fast / too slow to be a rhythm
    for (var k = 0; k < 6; k++){ var r = iv[k] / (pat[k] * u); if (r < 0.42 || r > 2.0) return false; }
    if (iv[4] < 1.25 * Math.max(iv[0], iv[3])) return false;    // the pause must be the big gap
    if (Math.max(iv[1], iv[2]) > iv[0] * 1.15) return false;    // "kn-kn" is quicker than the first gap
    return true;
  }

  function initDoor(root, skin){
    var panel = SL.$('.ss-doorpanel', root); if (!panel) return;
    var cfg = skin.door;
    var door = SL.$('.ss-door', panel), doorway = SL.$('.ss-doorway', panel), inside = SL.$('.ss-inside', panel);
    var porch = SL.$('.ss-porch', panel), result = SL.$('.ss-result', panel);
    var pop = SL.$('.ss-knock-pop', panel), dots = SL.$('.ss-knock-dots', panel), fx = SL.$('.ss-fx', root);
    var idleHTML = result.innerHTML;
    var knocks = [], tEnd = null, state = 'closed', anims = [], timers = [];
    var nextTreat = bag(cfg.treats), nextJoke = bag(cfg.jokes), nextGag = bag(Object.keys(cfg.gags));

    door.addEventListener('click', function(){
      if (state === 'closed') knock();
      else closeDoor(true);
    });

    function knock(){
      var now = performance.now();
      if (knocks.length && now - knocks[knocks.length - 1] > 2600) knocks = [];
      knocks.push(now);
      restart(door, 'is-knock');
      pop.style.transform = '';
      restart(pop, 'is-on');
      dots.textContent = new Array(Math.min(knocks.length, 9) + 1).join('●');
      clearTimeout(tEnd);
      if (knocks.length >= 7 && isShave(knocks.slice(-7))){ knocks = []; dots.textContent = ''; conga(); return; }
      tEnd = setTimeout(answer, knocks.length === 5 ? 1900 : 950);   // wait longer after 5 — maybe it's the "pause"
    }

    function openDoor(wide){
      state = wide ? 'conga' : 'open';
      panel.classList.add('is-open');
      panel.classList.toggle('is-wide', !!wide);
      door.setAttribute('aria-label', 'Close the door');
    }

    function answer(){
      knocks = []; dots.textContent = '';
      openDoor(false);
      SL.trackInteract(WID, 'knock');
      if (Math.random() < cfg.treatChance) showTreat(); else showTrick();
    }

    function againBtn(){ return '<button type="button" class="btn btn-sm btn-white ss-again">Knock again 🚪</button>'; }
    function wireAgain(){
      var b = SL.$('.ss-again', result);
      if (b) b.addEventListener('click', function(){ closeDoor(true); });
    }

    function showTreat(){
      var t = nextTreat();
      inside.innerHTML = '<span style="position:absolute;left:50%;bottom:8px;transform:translateX(-50%);font-size:26px;line-height:1">🍬</span>';
      result.innerHTML = '<a class="ss-treat" href="' + esc(t.href) + '"><span class="ss-tag">TREAT!</span>' +
        '<img src="' + esc(t.img) + '" alt="" loading="lazy"><span class="ss-treat-t">' + esc(t.title) + '</span></a>' + againBtn();
      wireAgain();
    }

    function showTrick(){
      var gag = nextGag(), j = nextJoke();
      result.innerHTML = '<div class="ss-trick"><span class="ss-tag is-trick">TRICK!</span>' +
        '<p class="ss-trick-gag">' + esc(cfg.gags[gag]) + '</p>' +
        '<p class="ss-joke-q">' + esc(j.q) + '</p><p class="ss-joke-a">' + esc(j.a) + '</p>' +
        '<p class="ss-joke-by">Joke by ' + esc(j.by) + '</p></div>' + againBtn();
      wireAgain();
      if (gag === 'spider') inside.innerHTML = '<div class="ss-spider">' + SPIDER_SVG + '</div>';
      else if (gag === 'cat'){
        inside.innerHTML = CAT_SVG;
        var y = document.createElement('span'); y.className = 'ss-yowl'; y.setAttribute('aria-hidden', 'true'); y.textContent = 'MRRROWW!';
        porch.appendChild(y);
      }
      else batsOut();
    }

    function localBox(el){
      var fr = fx.getBoundingClientRect(), r = el.getBoundingClientRect();
      return { x: r.left - fr.left, y: r.top - fr.top, w: r.width, h: r.height, W: fx.offsetWidth, H: fx.offsetHeight };
    }

    function batsOut(){
      var b = localBox(doorway), n = 5;
      for (var i = 0; i < n; i++){
        var el = document.createElement('span'); el.className = 'ss-fx-bat'; el.innerHTML = BAT_SVG;
        fx.appendChild(el);
        var x0 = b.x + b.w / 2 - 20, y0 = b.y + b.h * 0.5;
        if (!SL.motionOK()){
          el.style.transform = 'translate(' + (x0 + (i - 2) * 30) + 'px,' + (y0 - 40 - (i % 2) * 22) + 'px)';
          timers.push(setTimeout(function(e){ return function(){ e.remove(); }; }(el), 1600));
          continue;
        }
        var x1 = b.W * (0.45 + Math.random() * 0.6), y1 = -40 - Math.random() * 30;
        var mx = (x0 + x1) / 2 + (Math.random() - 0.5) * 120, my = y0 - 40 - Math.random() * 80;
        var a = el.animate([
          { transform: 'translate(' + x0 + 'px,' + y0 + 'px) scale(.4)' },
          { transform: 'translate(' + (x0 + 20) + 'px,' + (y0 - 30) + 'px) scale(.9)', offset: .2 },
          { transform: 'translate(' + mx + 'px,' + my + 'px) scale(1)', offset: .55 },
          { transform: 'translate(' + x1 + 'px,' + y1 + 'px) scale(.8)' }
        ], { duration: 1500 + Math.random() * 700, delay: i * 140, easing: 'ease-in-out', fill: 'both' });
        a.onfinish = function(e){ return function(){ e.remove(); }; }(el);
        anims.push(a);
      }
    }

    function conga(){
      clearTimeout(tEnd);
      openDoor(true);
      eggOnce('ghost-conga');
      SL.trackInteract(WID, 'ghost_conga');
      inside.innerHTML = '';
      result.innerHTML = '<p class="ss-conga-msg">' + esc(cfg.congaMsg) + '</p><p class="ss-idle-sub">' + esc(cfg.congaSub) + '</p>' + againBtn();
      wireAgain();
      var b = localBox(doorway), n = 7;
      var x0 = b.x + b.w / 2 - 22, y0 = b.y + b.h * 0.35;
      for (var i = 0; i < n; i++){
        var g = document.createElement('span'); g.className = 'ss-ghost'; g.innerHTML = GHOST_SVG;
        fx.appendChild(g);
        if (!SL.motionOK()){
          g.style.transform = 'translate(' + (x0 + 40 + i * 50) + 'px,' + (y0 + (i % 2 ? 10 : -10)) + 'px)';
          timers.push(setTimeout(function(e){ return function(){ e.remove(); }; }(g), 2800));
          continue;
        }
        var frames = [], steps = 16, endX = b.W + 60, baseY = Math.min(y0, b.H * 0.5);
        for (var s = 0; s <= steps; s++){
          var t = s / steps;
          var x = x0 + (endX - x0) * t;
          var y = baseY + Math.sin(t * Math.PI * 4) * 22 - Math.sin(t * Math.PI) * 30;
          var kick = (s % 2 ? 9 : -9);
          var sc = s === 0 ? .3 : 1;
          frames.push({ transform: 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) rotate(' + kick + 'deg) scale(' + sc + ')' });
        }
        var a = g.animate(frames, { duration: 4600, delay: i * 330, easing: 'linear', fill: 'both' });
        a.onfinish = function(e){ return function(){ e.remove(); }; }(g);
        anims.push(a);
      }
    }

    function clearFx(){
      anims.forEach(function(a){ try { a.cancel(); } catch(e){} });
      anims = [];
      timers.forEach(clearTimeout); timers = [];
      SL.$$('.ss-ghost, .ss-fx-bat', fx).forEach(function(e){ e.remove(); });
      SL.$$('.ss-yowl', porch).forEach(function(e){ e.remove(); });
      inside.innerHTML = '';
    }

    function closeDoor(focusDoor){
      var hadFocus = result.contains(document.activeElement);
      clearTimeout(tEnd); clearFx();
      knocks = []; dots.textContent = '';
      state = 'closed';
      panel.classList.remove('is-open', 'is-wide');
      door.setAttribute('aria-label', 'Knock on the door');
      result.innerHTML = idleHTML;
      if (focusDoor && hadFocus) door.focus();
    }

    document.addEventListener('sl:motion', function(e){ if (!(e.detail && e.detail.ok)) { anims.forEach(function(a){ try { a.finish(); } catch(x){} }); } });
  }

  /* ==========================================================
     Hidden critter: the bat
     ========================================================== */
  function initBat(root){
    var bat = SL.$('.ss-bat', root); if (!bat) return;
    var state = 'sleep', raf = 0, t0 = 0, home = null, cur = null, pointer = null, pointerT = 0, idleT = null;
    var FOLLOW = 5200;

    function local(e){ var r = root.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    root.addEventListener('pointermove', function(e){ pointer = local(e); pointerT = performance.now(); });
    root.addEventListener('pointerdown', function(e){ pointer = local(e); pointerT = performance.now(); });

    bat.addEventListener('click', function(e){
      if (state !== 'sleep') return;
      eggOnce('bat');
      SL.trackInteract(WID, 'bat_wake');
      bat.setAttribute('aria-label', 'The bat is awake and flapping around!');
      if (!SL.motionOK()){
        state = 'awake'; bat.classList.add('is-awake');
        idleT = setTimeout(land, 2400);
        return;
      }
      state = 'fly';
      home = { x: bat.offsetLeft + bat.offsetWidth / 2, y: bat.offsetTop + bat.offsetHeight / 2 };
      cur = { x: home.x, y: home.y };
      if (e.detail === 0) pointer = null;     // keyboard activation → do a loop instead of following
      bat.classList.add('is-flying');
      t0 = performance.now();
      raf = requestAnimationFrame(frame);
    });

    function frame(now){
      var el = now - t0, W = root.offsetWidth, H = root.offsetHeight, tgt;
      if (el < FOLLOW){
        if (pointer && now - pointerT < 2500){
          tgt = { x: Math.max(26, Math.min(W - 26, pointer.x - 26)), y: Math.max(24, Math.min(H - 24, pointer.y - 22)) };
        } else {
          tgt = { x: W / 2 + Math.sin(el / 650) * W * 0.36, y: H / 2 + Math.sin(el / 325) * H * 0.22 };
        }
      } else tgt = home;
      var k = el < FOLLOW ? 0.075 : 0.11;
      var vx = (tgt.x - cur.x) * k;
      cur.x += vx; cur.y += (tgt.y - cur.y) * k;
      var bob = el < FOLLOW ? Math.sin(el / 85) * 3 : 0;
      bat.classList.toggle('is-flip', vx < -0.4);
      bat.style.transform = 'translate(' + (cur.x - home.x).toFixed(1) + 'px,' + (cur.y - home.y + bob).toFixed(1) + 'px)';
      var d = Math.abs(cur.x - home.x) + Math.abs(cur.y - home.y);
      if (el > FOLLOW && (d < 2 || el > FOLLOW + 2600)){ land(); return; }
      raf = requestAnimationFrame(frame);
    }

    function land(){
      cancelAnimationFrame(raf); raf = 0; clearTimeout(idleT);
      state = 'sleep';
      bat.style.transform = '';
      bat.classList.remove('is-flying', 'is-awake', 'is-flip');
      bat.setAttribute('aria-label', 'A sleeping bat. Tap to wake it up!');
    }

    document.addEventListener('sl:motion', function(e){ if (!(e.detail && e.detail.ok) && state !== 'sleep') land(); });
  }

  /* ==========================================================
     Activity registry + widget init
     ========================================================== */
  var ACTIVITIES = { carver: initCarver, door: initDoor };

  SL.widget(WID, function(root){
    var skin = SKINS[root.getAttribute('data-skin')] || SKINS.halloween;
    applyTheme(root, skin);
    renderCountdown(root, skin);
    renderPicks(root, skin);
    initTabs(root, skin);
    skin.activities.forEach(function(a){ if (ACTIVITIES[a.id]) ACTIVITIES[a.id](root, skin); });
    initBat(root);
  });
})();
