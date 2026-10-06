/* ============================================================
   Fishing widget — "Cast a line": cast, wait for the bobber to
   dip, reel in a real fishing.scoutlife.org article, a fish fact
   or a fish joke.
   Egg (hidden critter): now and then ripples appear and a fish
   leaps out. Tap it mid-jump to catch it — spin, splash, tally.
   Owner: Agent C
   ============================================================ */
(function(){
  'use strict';
  var SL = window.SL;
  if (!SL) return;
  var WID = 'fishing';
  var F = 'https://fishing.scoutlife.org';

  var ARTICLES = [
    { title: '8 Fishing Knots to Know', href: F + '/8-fishing-knots-to-know/', img: 'assets/img/fishing-knots.jpg' },
    { title: 'Name That Fish Quiz', href: F + '/name-that-fish-quiz/', img: 'assets/img/fishing-quiz.jpg' },
    { title: '25 Funny Fish Jokes', href: F + '/25-funny-fish-jokes/', img: 'assets/img/fishing-jokes.jpg' },
    { title: 'How to Make a Minnow Trap', href: F + '/make-a-minnow-trap/', img: 'assets/img/fishing-minnow.jpg' },
    { title: 'Essential Fishing Gear to Get Started', href: F + '/essential-fishing-gear-to-get-started/', img: 'assets/img/fishing-gear.jpg' },
    { title: 'How to Catch Different Types of Fish', href: F + '/secrets-to-better-fishing/', img: 'assets/img/fishing-species.jpg' },
    { title: 'Make This Homemade Fishing Lure', href: F + '/homemade-fishing-lure/', img: 'assets/img/fishing-lure.jpg' },
    { title: 'How to Properly Handle Fish', href: F + '/how-to-properly-handle-fish/', img: 'assets/img/fishing-handle.jpg' }
  ];
  var FACTS = [
    'Most fish don’t have eyelids — they can’t blink!',
    'A fish’s scales have growth rings, like a tree. Scientists count them to tell how old the fish is.',
    'Catfish have taste buds all over their bodies — even on their whiskers.',
    'Fish feel vibrations with a “lateral line,” a row of sensors running down each side of their body.',
    'Bluegills are a kind of sunfish. Dads guard the nest and chase off much bigger fish!',
    'Trout need cold, clean water with lots of oxygen. Finding them is a sign of a healthy stream.'
  ];
  /* real reader jokes from "25 Funny Fish Jokes" */
  var JOKES = [
    { q: 'Where does a fisherman go to get his hair cut?', a: 'The bobber shop.', by: 'Maurice P., Hesston, Kan.' },
    { q: 'What kind of music should you listen to while fishing?', a: 'Something catchy!', by: 'Max K., Elizabethtown, Pa.' },
    { q: 'Why is it so easy to weigh fish?', a: 'Because they have their own scales!', by: 'Ashwin B., Morris Plains, N.J.' },
    { q: 'How do you communicate with a fish?', a: 'Drop it a line!', by: 'Thomas H., Annapolis, Md.' }
  ];

  var FISH_SVG = '<svg viewBox="0 0 58 36" aria-hidden="true" focusable="false">' +
    '<path d="M14 18 2 6v24z" fill="#2E7550" stroke="#1F2A22" stroke-width="2.5" stroke-linejoin="round"/>' +
    '<path d="M24 7c4-6 12-6 16-2" fill="#2E7550" stroke="#1F2A22" stroke-width="2.5" stroke-linejoin="round"/>' +
    '<ellipse cx="33" cy="18" rx="22" ry="12.5" fill="#8DBF4A" stroke="#1F2A22" stroke-width="2.8"/>' +
    '<path d="M16 21c8 7 26 8 37 0" fill="#F6EEDC" stroke="#1F2A22" stroke-width="2"/>' +
    '<path d="M24 10v14M30 8v16" stroke="#2E7550" stroke-width="2.5" stroke-linecap="round"/>' +
    '<circle cx="45" cy="14" r="4" fill="#fff" stroke="#1F2A22" stroke-width="2"/><circle cx="46" cy="14" r="1.8" fill="#1F2A22"/>' +
    '<path d="M50 21q3 1 4-1" fill="none" stroke="#1F2A22" stroke-width="2" stroke-linecap="round"/></svg>';

  function esc(s){ return String(s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function bag(src){ var b = []; return function(){ if (!b.length) b = SL.shuffle(src); return b.pop(); }; }
  function lerp(a, b, t){ return a + (b - a) * t; }
  function ease(t){ return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

  /** tiny rAF tween; jumps to the end when motion is off */
  function tween(ms, fn, done){
    if (!SL.motionOK()){ fn(1); if (done) done(); return function(){}; }
    var t0 = performance.now(), raf = 0, dead = false;
    function step(now){
      if (dead) return;
      var t = Math.min(1, (now - t0) / ms);
      fn(t);
      if (t < 1) raf = requestAnimationFrame(step); else if (done) done();
    }
    raf = requestAnimationFrame(step);
    return function(){ dead = true; cancelAnimationFrame(raf); };
  }

  SL.widget(WID, function(root){
    var scene = SL.$('.fs-scene', root), svg = SL.$('.fs-svg', root);
    var rod = SL.$('.fs-rod', root), line = SL.$('.fs-line', root), bobber = SL.$('.fs-bobber', root), ripples = SL.$('.fs-ripples', root);
    var go = SL.$('.fs-go', root), status = SL.$('.fs-status', root);
    var layer = SL.$('.fs-layer', root), rippleBtn = SL.$('.fs-ripple-btn', root), tally = SL.$('.fs-tally', root);
    if (!scene || !svg) return;

    var PIV = { x: 45, y: 204 }, L = 165, A_IDLE = -48, A_BACK = -80, A_CAST = -32, A_HOLD = -58;
    var state = 'idle', angle = A_IDLE, bob = null, stopTween = null, biteT = null, autoT = null, card = null;
    var nextArticle = bag(ARTICLES), nextFact = bag(FACTS), nextJoke = bag(JOKES);

    function tipAt(a){ var r = a * Math.PI / 180; return { x: PIV.x + L * Math.cos(r), y: PIV.y + L * Math.sin(r) }; }
    function setRod(a){ angle = a; rod.setAttribute('transform', 'rotate(' + a.toFixed(2) + ' ' + PIV.x + ' ' + PIV.y + ')'); }
    function setBob(p){ bob = p; bobber.setAttribute('transform', 'translate(' + p.x.toFixed(1) + ' ' + p.y.toFixed(1) + ')'); }
    function setLine(sag){
      var t = tipAt(angle), b = bob;
      var cx = (t.x + b.x) / 2, cy = Math.max(t.y, b.y - 12) + (sag || 0);
      line.setAttribute('d', 'M' + t.x.toFixed(1) + ' ' + t.y.toFixed(1) + ' Q' + cx.toFixed(1) + ' ' + cy.toFixed(1) + ' ' + b.x.toFixed(1) + ' ' + (b.y - 12).toFixed(1));
    }
    function dangle(){ var t = tipAt(angle); setBob({ x: t.x, y: t.y + 31 }); setLine(0); }

    /* viewBox (360x260, xMidYMax slice) → scene px */
    function toPx(p){
      var w = svg.clientWidth, h = svg.clientHeight, s = Math.max(w / 360, h / 260);
      return { x: (w - 360 * s) / 2 + p.x * s, y: (h - 260 * s) + p.y * s, s: s };
    }

    function setBtn(label, opts){
      opts = opts || {};
      go.textContent = label;
      go.classList.toggle('is-hot', !!opts.hot);
      if (opts.busy) go.setAttribute('aria-disabled', 'true'); else go.removeAttribute('aria-disabled');
    }
    function say(msg){ status.textContent = msg; }
    function clearTimers(){ clearTimeout(biteT); clearTimeout(autoT); if (stopTween) stopTween(); stopTween = null; }

    /* ---- cast ---- */
    function cast(){
      clearTimers();
      removeCard();
      line.style.display = ''; bobber.style.display = '';
      svg.classList.remove('is-floating', 'is-bite');
      state = 'casting';
      setBtn('Casting…', { busy: true });
      say('Whoosh!');
      SL.trackInteract(WID, 'cast');
      setRod(A_IDLE); dangle();
      var target = { x: 236 + Math.random() * 60, y: 158 + Math.random() * 34 };
      stopTween = tween(260, function(t){ setRod(lerp(A_IDLE, A_BACK, ease(t))); dangle(); }, function(){
        var start = null;
        stopTween = tween(780, function(t){
          setRod(lerp(A_BACK, A_CAST, Math.min(1, t * 3.2)));
          var tip = tipAt(angle);
          if (!start) start = { x: tip.x, y: tip.y + 20 };
          var x = lerp(start.x, target.x, t), y = lerp(start.y, target.y, t) - Math.sin(Math.PI * t) * 95;
          setBob({ x: x, y: y });
          setLine(t < 1 ? -10 * (1 - t) : 22);
        }, function(){
          setBob(target); setLine(22);
          state = 'waiting';
          svg.classList.add('is-floating');
          setBtn('Reel in!');
          say('Wait for it… watch the bobber!');
          biteT = setTimeout(bite, 1400 + Math.random() * 2600);
        });
      });
    }

    function bite(){
      state = 'bite';
      ripples.setAttribute('transform', 'translate(' + bob.x.toFixed(1) + ' ' + (bob.y + 4).toFixed(1) + ')');
      svg.classList.remove('is-floating'); svg.classList.add('is-bite');
      setBtn('Reel in!', { hot: true });
      say('Something’s biting! Reel it in!');
      autoT = setTimeout(function(){ reel(true); }, 3200);
    }

    /* ---- reel ---- */
    function reel(auto){
      clearTimers();
      state = 'reeling';
      svg.classList.remove('is-floating', 'is-bite');
      setBtn('Reeling…', { busy: true });
      say(auto ? 'Whoa — it hooked itself! Reeling in…' : 'Reeling in…');
      SL.trackInteract(WID, auto ? 'reel_auto' : 'reel');
      var from = { x: bob.x, y: bob.y }, a0 = angle;
      stopTween = tween(820, function(t){
        setRod(lerp(a0, A_HOLD, ease(t)));
        var tip = tipAt(angle);
        var x = lerp(from.x, tip.x, ease(t)), y = lerp(from.y, tip.y + 30, ease(t)) + (t < .6 ? Math.sin(t * 30) * 2 : 0);
        setBob({ x: x, y: y }); setLine(8 * (1 - t));
      }, showCatch);
    }

    function pick(){
      var r = Math.random();
      if (r < 0.55) return { kind: 'article', item: nextArticle() };
      if (r < 0.8) return { kind: 'fact', item: nextFact() };
      return { kind: 'joke', item: nextJoke() };
    }

    function showCatch(){
      state = 'caught';
      var c = pick(), el;
      if (c.kind === 'article'){
        el = document.createElement('a'); el.className = 'fs-card'; el.href = c.item.href;
        el.innerHTML = '<img src="' + esc(c.item.img) + '" alt="" width="400" height="225">' +
          '<span class="fs-card-txt"><span class="fs-card-kick">You caught:</span><span class="fs-card-t">' + esc(c.item.title) + '</span></span>';
        say('You caught: ' + c.item.title + '!');
      } else if (c.kind === 'fact'){
        el = document.createElement('div'); el.className = 'fs-card is-fact';
        el.innerHTML = '<span class="fs-card-kick">🐟 You caught a fish fact!</span><span class="fs-fact">' + esc(c.item) + '</span>';
        say('You caught a fish fact!');
      } else {
        el = document.createElement('div'); el.className = 'fs-card is-joke';
        el.innerHTML = '<span class="fs-card-kick">You caught a fish joke!</span><span class="fs-jq">' + esc(c.item.q) + '</span>' +
          '<span class="fs-ja">' + esc(c.item.a) + '</span><span class="fs-by">Joke by ' + esc(c.item.by) + '</span>' +
          '<a class="fs-card-more" href="' + F + '/25-funny-fish-jokes/">More fish jokes →</a>';
        say('You caught a fish joke!');
      }
      line.style.display = 'none'; bobber.style.display = 'none';
      scene.appendChild(el); card = el;
      var tip = toPx(tipAt(A_HOLD)), W = scene.clientWidth;
      var cw = el.offsetWidth, left = Math.max(6, Math.min(W - cw - 6, tip.x - cw / 2));
      el.style.left = left.toFixed(1) + 'px';
      el.style.top = (tip.y + 25).toFixed(1) + 'px';
      el.style.setProperty('--hook-x', (tip.x - left).toFixed(1) + 'px');
      if (SL.motionOK()){
        var a = el.animate([{ transform: 'translateY(90px) scale(.3)', opacity: 0 }, { transform: 'translateY(-8px) scale(1.04)', opacity: 1, offset: .7 }, { transform: 'none', opacity: 1 }],
          { duration: 520, easing: 'ease-out' });
        a.onfinish = function(){ el.classList.add('is-swing'); };
        SL.confettiAt(el, { count: 10, shapes: ['💧', '●', '✦'], colors: ['#3FA9F5', '#1F64B0', '#FFFFFF'], spread: 70 });
      }
      setBtn('🎣 Cast again!');
    }

    function removeCard(){ if (card){ card.remove(); card = null; } }

    go.addEventListener('click', function(){
      if (go.getAttribute('aria-disabled') === 'true') return;
      if (state === 'idle' || state === 'caught') cast();
      else if (state === 'waiting'){
        say('Nothing yet… wait for the bobber to dip!');
        go.classList.remove('is-hot');
      }
      else if (state === 'bite') reel(false);
    });

    setRod(A_IDLE); dangle();

    /* ==========================================================
       Egg: the jumping fish
       ========================================================== */
    var fish = null, fishAnim = null, jumping = false, caught = 0, jt = null, visible = false, gotOnce = false;

    function waterY(){ return toPx({ x: 0, y: 130 }).y; }
    function spot(){
      var W = scene.clientWidth, H = scene.clientHeight, wy = waterY();
      // lower-right water, clear of the hanging catch card
      return { x: W * (0.62 + Math.random() * 0.22), y: Math.min(H - 22, Math.max(wy + 40, H - 56) + Math.random() * 26) };
    }

    function splash(x, y){
      if (!SL.motionOK()) return;
      var ring = document.createElement('span'); ring.className = 'fs-splash';
      ring.style.left = x + 'px'; ring.style.top = y + 'px';
      layer.appendChild(ring);
      ring.animate([{ transform: 'scale(.3)', opacity: 1 }, { transform: 'scale(2.2)', opacity: 0 }], { duration: 700, easing: 'ease-out' }).onfinish = function(){ ring.remove(); };
      for (var i = 0; i < 6; i++){
        var d = document.createElement('span'); d.className = 'fs-drop';
        layer.appendChild(d);
        var dx = (i - 2.5) * 12 + (Math.random() - .5) * 8, up = 30 + Math.random() * 30;
        d.animate([
          { transform: 'translate(' + (x - 4) + 'px,' + (y - 4) + 'px) scale(.6)', opacity: 1 },
          { transform: 'translate(' + (x - 4 + dx * .6) + 'px,' + (y - 4 - up) + 'px) scale(1)', opacity: 1, offset: .45 },
          { transform: 'translate(' + (x - 4 + dx) + 'px,' + (y + 4) + 'px) scale(.5)', opacity: 0 }
        ], { duration: 650, easing: 'ease-out' }).onfinish = (function(d){ return function(){ d.remove(); }; })(d);
      }
    }

    function makeFish(){
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'fs-fish';
      b.setAttribute('aria-label', 'A jumping fish! Tap to catch it');
      b.innerHTML = FISH_SVG;
      b.addEventListener('click', catchFish);
      scene.appendChild(b);
      return b;
    }

    function startJump(slow){
      if (jumping || !visible && !slow) return;
      jumping = true;
      var s = spot();
      rippleBtn.style.left = s.x + 'px'; rippleBtn.style.top = s.y + 'px';
      rippleBtn.classList.add('is-rippling');
      setTimeout(function(){
        if (!jumping) return;
        fish = makeFish();
        var x0 = s.x - 29, y0 = s.y - 18, dist = 70 + Math.random() * 30, peak = 80 + Math.random() * 30;
        if (x0 + dist > scene.clientWidth - 60) dist = -dist;
        var flip = dist < 0 ? ' scaleX(-1)' : '';
        var frames = [];
        for (var i = 0; i <= 10; i++){
          var t = i / 10, x = x0 + dist * t, y = y0 - 4 * peak * t * (1 - t) + 10;
          var rot = lerp(-55, 55, t) * (dist < 0 ? -1 : 1);
          frames.push({ transform: 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) rotate(' + rot.toFixed(1) + 'deg)' + flip, opacity: (i === 0 || i === 10) ? 0 : 1 });
        }
        fishAnim = fish.animate(frames, { duration: slow ? 2600 : 1350, easing: 'linear', fill: 'forwards' });
        fishAnim.onfinish = function(){
          splash(x0 + dist + 29, s.y);
          endJump();
        };
        rippleBtn.classList.remove('is-rippling');
      }, slow ? 350 : 950);
    }

    /* static version (reduced motion): fish pops up and waits to be tapped */
    function staticFish(){
      if (jumping) return;
      jumping = true;
      fish = makeFish();
      var s = spot();
      rippleBtn.style.left = s.x + 'px'; rippleBtn.style.top = s.y + 'px';
      fish.style.transform = 'translate(' + (s.x - 29) + 'px,' + (s.y - 60) + 'px) rotate(-20deg)';
      fish.focus();
      setTimeout(function(){ if (jumping && fish && !fish.classList.contains('is-caught')) endJump(); }, 6000);
    }

    function endJump(){
      jumping = false;
      if (fish){ fish.remove(); fish = null; }
      fishAnim = null;
      rippleBtn.classList.remove('is-rippling');
    }

    function catchFish(){
      if (!fish || fish.classList.contains('is-caught')) return;
      var f = fish;
      f.classList.add('is-caught');
      var hadFocus = document.activeElement === f;
      var m;
      if (fishAnim){ fishAnim.pause(); m = new DOMMatrix(getComputedStyle(f).transform); f.style.transform = m.toString(); fishAnim.cancel(); fishAnim = null; }
      else m = new DOMMatrix(getComputedStyle(f).transform);
      var x = m.e, y = m.f;
      caught++;
      if (!gotOnce){ gotOnce = true; SL.eggFound('jumping-fish'); }
      SL.trackInteract(WID, 'fish_catch');
      tally.hidden = false;
      tally.textContent = 'Fish caught: ' + caught + ' 🐟';
      var got = document.createElement('span'); got.className = 'fs-got'; got.textContent = SL.rand(['Got it!', 'Nice catch!', 'Gotcha!']);
      got.style.left = Math.max(4, Math.min(scene.clientWidth - 110, x - 10)) + 'px'; got.style.top = Math.max(4, y - 34) + 'px';
      layer.appendChild(got);
      if (hadFocus) rippleBtn.focus();
      if (!SL.motionOK()){
        setTimeout(function(){ got.remove(); endJump(); }, 1100);
        return;
      }
      var svgEl = f.querySelector('svg');
      svgEl.animate([{ transform: 'rotate(0) scale(1)' }, { transform: 'rotate(720deg) scale(1.4)' }, { transform: 'rotate(720deg) scale(1)' }], { duration: 750, easing: 'ease-out' });
      setTimeout(function(){
        got.remove();
        var wy = Math.max(y + 30, waterY() + 30);
        var fall = f.animate([{ transform: 'translate(' + x + 'px,' + y + 'px) rotate(0deg)' }, { transform: 'translate(' + (x + 14) + 'px,' + wy + 'px) rotate(100deg)', opacity: .2 }],
          { duration: 420, easing: 'ease-in', fill: 'forwards' });
        fall.onfinish = function(){ splash(x + 36, wy + 6); endJump(); };
      }, 780);
    }

    rippleBtn.addEventListener('click', function(){
      if (jumping){ catchFish(); return; }
      if (!SL.motionOK()) staticFish(); else startJump(true);
    });

    function schedule(ms){
      clearTimeout(jt);
      jt = setTimeout(function(){
        if (visible && SL.motionOK() && !jumping && !document.hidden) startJump(false);
        if (SL.motionOK()) schedule(7000 + Math.random() * 7000);
      }, ms);
    }

    if ('IntersectionObserver' in window){
      new IntersectionObserver(function(en){ en.forEach(function(e){ visible = e.isIntersecting; }); }, { threshold: 0.4 }).observe(root);
    } else visible = true;
    if (SL.motionOK()) schedule(4500);

    document.addEventListener('sl:motion', function(e){
      var ok = !!(e.detail && e.detail.ok);
      if (!ok){
        clearTimeout(jt);
        if (fishAnim){ fishAnim.cancel(); endJump(); }
        if (stopTween){ stopTween(); stopTween = null;
          // finish whatever was moving, instantly
          if (state === 'casting'){ state = 'waiting'; setRod(A_CAST); setBob({ x: 270, y: 175 }); setLine(22); svg.classList.add('is-floating'); setBtn('Reel in!'); biteT = setTimeout(bite, 1500); }
          else if (state === 'reeling'){ setRod(A_HOLD); showCatch(); }
        }
      } else schedule(3000);
    });
  });
})();
