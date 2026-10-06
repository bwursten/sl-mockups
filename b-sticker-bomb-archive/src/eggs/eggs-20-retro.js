/* ============================================================
   EGGS: 4. Retro Mode (id 'retro-mode')
   Trigger (keyboard): Konami code ↑ ↑ ↓ ↓ ← → ← → B A (not while typing in a field)
   Trigger (touch):    swipe up, up, down, down, left, right, left, right on the header,
                       then tap the header twice (B, A) within 5 s.
   Effect: html.retro-mode 8-bit skin + scanlines + a pixel hiker walking under the header.
           Space / JUMP button / tap an empty spot on the header = jump over rocks (endless runner).
           Esc or "Exit Retro Mode" restores.
   ============================================================ */
(function(){
  'use strict';
  var SL = window.SL, K = SL && SL._egg; if (!K) return;

  var KONAMI = ['arrowup','arrowup','arrowdown','arrowdown','arrowleft','arrowright','arrowleft','arrowright','b','a'];
  var keys = [];
  var active = null;

  K.retro = { start: function(){ start(); }, stop: function(){ stop(); }, get on(){ return !!active; } };

  document.addEventListener('keydown', function(e){
    if (K.isTyping(e.target) || e.ctrlKey || e.metaKey || e.altKey) return;
    var k = (e.key || '').toLowerCase();
    if (!k) return;
    keys.push(k); if (keys.length > KONAMI.length) keys.shift();
    if (keys.length === KONAMI.length && keys.every(function(v, i){ return v === KONAMI[i]; })){
      keys = [];
      if (active) stop(); else start();
    }
  });

  /* ---- touch alternative: swipe pattern on the header + 2 taps ---- */
  K.ready(K.safe('retro-touch', function(){
    var header = document.getElementById('site-header');
    if (!header) return;
    var SWIPES = 'UUDDLRLR', seq = '', lastSwipe = 0, armedAt = 0, taps = 0, eatClick = false, t0 = null;
    header.addEventListener('touchstart', function(e){
      if (e.touches.length !== 1) { t0 = null; return; }
      var t = e.touches[0]; t0 = {x:t.clientX, y:t.clientY, t:Date.now()};
    }, {passive:true});
    header.addEventListener('touchend', function(e){
      if (!t0) return;
      var t = e.changedTouches[0], dx = t.clientX - t0.x, dy = t.clientY - t0.y, now = Date.now();
      var ax = Math.abs(dx), ay = Math.abs(dy);
      if (Math.max(ax, ay) >= 30 && now - t0.t < 900){
        var d = ax > ay ? (dx > 0 ? 'R' : 'L') : (dy > 0 ? 'D' : 'U');
        if (now - lastSwipe > 1800) seq = '';
        lastSwipe = now;
        seq = (seq + d).slice(-SWIPES.length);
        if (seq === SWIPES){ seq = ''; armedAt = now; taps = 0; }
      } else if (ax < 12 && ay < 12 && armedAt && now - armedAt < 5000){
        taps++; eatClick = true;   // swallow this tap so it doesn't follow a link
        if (taps >= 2){ armedAt = 0; taps = 0; if (active) stop(); else start(); }
      }
      t0 = null;
    }, {passive:true});
    header.addEventListener('click', function(e){
      if (eatClick){ eatClick = false; e.preventDefault(); e.stopPropagation(); }
    }, true);
  }));

  /* ---- sprites (pixel maps) ---- */
  var PAL = {k:'#000000', r:'#F83800', s:'#E09858', g:'#00A844', b:'#A85010', n:'#0058F8', m:'#8C8C9C', w:'#FCFCFC', y:'#F8B800', t:'#007800'};
  var HIKER_A = [
    '...rrr...',
    '..rrrrrr.',
    '...sss...',
    '...sks...',
    '..bggg...',
    '.bbgggs..',
    '.bbggg...',
    '..bggg...',
    '...nnn...',
    '...n.n...',
    '..n...n..',
    '..k...kk.'
  ];
  var HIKER_B = HIKER_A.slice(0, 9).concat([
    '...nn....',
    '...nn....',
    '...kkk...'
  ]);
  var HIKER_JUMP = HIKER_A.slice(0, 9).concat([
    '..nn.n...',
    '.k...n...',
    '.....kk..'
  ]);
  var ROCK = [
    '..kkk..',
    '.kmmwk.',
    'kmmmmmk',
    'kmmmmmk',
    'kkkkkkk'
  ];
  var TREE = [
    '...t...',
    '..ttt..',
    '.ttttt.',
    '..ttt..',
    '.ttttt.',
    'ttttttt',
    '...b...',
    '...b...'
  ];
  function draw(ctx, map, x, y, flash){
    for (var r = 0; r < map.length; r++){
      for (var c = 0; c < map[r].length; c++){
        var ch = map[r][c]; if (ch === '.') continue;
        ctx.fillStyle = flash ? '#FCFCFC' : PAL[ch];
        ctx.fillRect(Math.round(x) + c, Math.round(y) + r, 1, 1);
      }
    }
  }

  var POSTERIZE = '<svg class="egg-retro-defs" width="0" height="0" aria-hidden="true" focusable="false" style="position:absolute">' +
    '<filter id="egg-retro-posterize" color-interpolation-filters="sRGB"><feComponentTransfer>' +
    '<feFuncR type="discrete" tableValues="0 .33 .66 1"/><feFuncG type="discrete" tableValues="0 .33 .66 1"/><feFuncB type="discrete" tableValues="0 .33 .66 1"/>' +
    '</feComponentTransfer></filter></svg>';

  function start(){
    if (active) return;
    var html = document.documentElement;
    var header = document.getElementById('site-header');
    html.classList.add('retro-mode');
    K.found('retro-mode');

    var defs = K.html(POSTERIZE); document.body.appendChild(defs);
    var scan = K.el('div', 'egg-scanlines', {'aria-hidden':'true'}); document.body.appendChild(scan);
    K.adClip(scan);

    var best = SL.store.get('egg-retro-best', 0);
    var hud = K.html(
      '<div class="egg-retro-hud" role="region" aria-label="Retro Mode">' +
        '<span class="egg-retro-title">RETRO MODE</span>' +
        '<span class="egg-retro-score"><span data-r="score">SCORE 0</span> <span data-r="best">BEST ' + best + '</span></span>' +
        '<button type="button" class="egg-retro-btn" data-r="jump">JUMP</button>' +
        '<button type="button" class="egg-retro-btn egg-retro-exit" data-r="exit">Exit Retro Mode</button>' +
      '</div>');
    document.body.appendChild(hud);
    var scoreEl = hud.querySelector('[data-r="score"]'), bestEl = hud.querySelector('[data-r="best"]');

    var cv = K.el('canvas', 'egg-retro-canvas', {'aria-hidden':'true'});
    document.body.appendChild(cv);
    var ctx = cv.getContext('2d');
    var PX = 4, H = 20, W = 0, GROUND = H - 3;

    var G = {x:12, y:0, vy:0, onGround:true, frame:0, ft:0, rocks:[], trees:[], spawn:1.2, speed:42, score:0, hit:0, dash:0};
    function size(){
      W = Math.ceil(Math.min(K.vw(), 1600) / PX);
      cv.width = W; cv.height = H;
      cv.style.width = (W * PX) + 'px'; cv.style.height = (H * PX) + 'px';
      if (!G.trees.length){ for (var i = 0; i < 4; i++) G.trees.push({x: 30 + i * (W / 4) + Math.random()*20}); }
    }
    function placeCanvas(){
      var top = Math.max(K.topInset(), header ? header.getBoundingClientRect().bottom : 0, 0);
      cv.style.transform = 'translateY(' + top + 'px)';
      if (top !== lastTop || ++clipN % 20 === 0){ lastTop = top; K.adClip(cv, 0, top); }
    }
    var lastTop = -1, clipN = 0;
    size(); placeCanvas();
    G.y = GROUND - HIKER_A.length;

    function jump(){
      if (!active) return;
      if (!K.motion()){
        // gentle: a single static hop
        G.y = GROUND - HIKER_A.length - 6; render();
        setTimeout(function(){ G.y = GROUND - HIKER_A.length; render(); }, 300);
        return;
      }
      if (G.onGround){ G.vy = -56; G.onGround = false; }
    }
    function setScore(){
      scoreEl.textContent = 'SCORE ' + G.score;
      if (G.score > best){ best = G.score; SL.store.set('egg-retro-best', best); }
      bestEl.textContent = 'BEST ' + best;
    }

    function step(dt){
      G.ft += dt;
      // hiker physics
      if (!G.onGround){
        G.vy += 165 * dt; G.y += G.vy * dt;
        if (G.y >= GROUND - HIKER_A.length){ G.y = GROUND - HIKER_A.length; G.onGround = true; G.vy = 0; }
      }
      if (G.ft > 0.18){ G.ft = 0; G.frame ^= 1; }
      // world
      G.speed = Math.min(72, G.speed + dt * 0.6);
      G.dash = (G.dash + G.speed * dt) % 6;
      G.trees.forEach(function(t){ t.x -= G.speed * 0.35 * dt; if (t.x < -10) t.x = W + Math.random() * 40; });
      G.spawn -= dt;
      if (G.spawn <= 0){ G.rocks.push({x: W + 2, passed:false}); G.spawn = 1.1 + Math.random() * 1.6; }
      G.rocks.forEach(function(r){ r.x -= G.speed * dt; });
      G.rocks = G.rocks.filter(function(r){ return r.x > -10; });
      // collisions (forgiving hitbox)
      var hx1 = G.x + 2, hx2 = G.x + 7, hy2 = G.y + HIKER_A.length;
      G.rocks.forEach(function(r){
        var rx1 = r.x + 1, rx2 = r.x + 6, ry1 = GROUND - ROCK.length + 1;
        if (!r.hit && hx2 > rx1 && hx1 < rx2 && hy2 > ry1){
          r.hit = true; G.hit = 1.0; G.score = 0; setScore();
        }
        if (!r.passed && !r.hit && r.x + 7 < G.x){ r.passed = true; G.score++; setScore(); }
      });
      if (G.hit > 0) G.hit -= dt;
      placeCanvas();
      render();
    }
    function render(){
      ctx.clearRect(0, 0, W, H);
      // trees (parallax)
      G.trees.forEach(function(t){ draw(ctx, TREE, t.x, GROUND - TREE.length, false); });
      // ground
      ctx.fillStyle = '#000'; ctx.fillRect(0, GROUND, W, 1);
      ctx.fillStyle = '#A85010'; ctx.fillRect(0, GROUND + 1, W, 2);
      ctx.fillStyle = '#000';
      for (var x = -G.dash; x < W; x += 6) ctx.fillRect(Math.round(x), GROUND + 2, 2, 1);
      G.rocks.forEach(function(r){ draw(ctx, ROCK, r.x, GROUND - ROCK.length, false); });
      var spr = !G.onGround ? HIKER_JUMP : (G.frame ? HIKER_B : HIKER_A);
      // flash at 2 Hz max (safety: never > 3 flashes/s)
      var flash = G.hit > 0 && Math.floor(G.hit * 4) % 2 === 0;
      draw(ctx, spr, G.x, G.y, flash);
      if (G.hit > 0.4){
        ctx.fillStyle = '#000'; ctx.fillRect(G.x + 10, G.y - 1, 15, 7);
        // tiny "OOF" bubble drawn as pixels
        drawText(ctx, 'OOF', G.x + 11, G.y);
      }
    }
    // 3x5 pixel font for a couple of letters
    var FONT = {O:['111','101','101','101','111'], F:['111','100','110','100','100']};
    function drawText(c, s, x, y){
      c.fillStyle = '#F8B800';
      for (var i = 0; i < s.length; i++){
        var g = FONT[s[i]]; if (!g) continue;
        for (var r = 0; r < 5; r++) for (var q = 0; q < 3; q++) if (g[r][q] === '1') c.fillRect(x + i*4 + q, y + r, 1, 1);
      }
    }

    var loop = K.loop(step);
    if (K.motion()) loop.start(); else render();
    var onMotion = function(e){ var ok = e.detail && e.detail.ok; if (ok) loop.start(); else { loop.stop(); render(); } };
    document.addEventListener('sl:motion', onMotion);

    var onKey = function(e){
      if (e.key !== ' ' && e.code !== 'Space') return;
      if (K.isTyping(e.target)) return;
      var t = e.target;
      if (t && t.closest && t.closest('a,button,[role="button"],summary,[tabindex]:not([tabindex="-1"])') && t !== document.body) return;
      e.preventDefault(); jump();
    };
    var onHeaderDown = function(e){
      if (e.target.closest('a,button,input,select,textarea,label,[role="button"]')) return;
      jump();
    };
    var onResize = function(){ size(); render(); K.adClip(scan); };
    var onScroll = function(){ K.adClip(scan); if (!loop.running) { placeCanvas(); } };
    document.addEventListener('keydown', onKey);
    header && header.addEventListener('pointerdown', onHeaderDown);
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, {passive:true});
    hud.querySelector('[data-r="jump"]').addEventListener('click', function(){ jump(); });
    hud.querySelector('[data-r="exit"]').addEventListener('click', function(){ stop(); });
    var offEsc = K.onEsc(function(){ offEsc = null; stop(); });

    K.say('Retro Mode on. Press Space or the Jump button to jump over rocks. Press Escape to exit.');

    active = {
      cleanup: function(){
        loop.stop();
        document.removeEventListener('sl:motion', onMotion);
        document.removeEventListener('keydown', onKey);
        header && header.removeEventListener('pointerdown', onHeaderDown);
        window.removeEventListener('resize', onResize);
        window.removeEventListener('scroll', onScroll);
        offEsc && offEsc();
        [defs, scan, hud, cv].forEach(function(n){ n.remove(); });
        html.classList.remove('retro-mode');
      }
    };
  }
  function stop(){
    if (!active) return;
    var a = active; active = null;
    a.cleanup();
    K.say('Retro Mode off.');
  }
})();
