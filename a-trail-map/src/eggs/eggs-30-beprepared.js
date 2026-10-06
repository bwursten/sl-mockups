/* ============================================================
   EGGS: 5. Be Prepared (id 'be-prepared')
   Trigger (keyboard): type B E P R E P A R E D anywhere (ignored while typing in a form field).
   Trigger (touch / mouse alternative): press and hold the "Psst… there are secrets…" hint
                       (#egg-hint, near the footer campfire) for 1.5 seconds.
   Effect: compasses, flashlights and knots rain down and pile up at the bottom of the screen
           (gravity, bounces, simple collisions). Drag + release to flick/toss them.
           They fade after ~12 s; Esc clears them right away.
   ============================================================ */
(function(){
  'use strict';
  var SL = window.SL, K = SL && SL._egg; if (!K) return;

  var WORD = 'BEPREPARED', buf = '';
  document.addEventListener('keydown', function(e){
    if (K.isTyping(e.target) || e.ctrlKey || e.metaKey || e.altKey) return;
    if (!e.key || e.key.length !== 1) return;
    buf = (buf + e.key.toUpperCase()).slice(-WORD.length);
    if (buf === WORD){ buf = ''; start(); }
  });

  /* long-press the hint (touch alternative) */
  K.ready(K.safe('bp-hint', function(){
    var hint = document.getElementById('egg-hint');
    if (!hint) return;
    var timer = 0;
    hint.classList.add('egg-hint-press');
    hint.addEventListener('pointerdown', function(){
      clearTimeout(timer);
      hint.classList.add('egg-holding');
      timer = setTimeout(function(){ hint.classList.remove('egg-holding'); start(); }, 1500);
    });
    ['pointerup','pointerleave','pointercancel'].forEach(function(ev){
      hint.addEventListener(ev, function(){ clearTimeout(timer); hint.classList.remove('egg-holding'); });
    });
    hint.addEventListener('contextmenu', function(e){ e.preventDefault(); });
  }));

  var ICONS = {
    compass: '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="20" fill="#FFC629" stroke="#1F2A22" stroke-width="3"/><circle cx="24" cy="24" r="14" fill="#fff" stroke="#1F2A22" stroke-width="2"/>' +
      '<path d="M24 11 L28.5 24 L19.5 24Z" fill="#F26B21" stroke="#1F2A22" stroke-width="1.6" stroke-linejoin="round"/><path d="M24 37 L28.5 24 L19.5 24Z" fill="#1F64B0" stroke="#1F2A22" stroke-width="1.6" stroke-linejoin="round"/><circle cx="24" cy="24" r="2.4" fill="#1F2A22"/>' +
      '<rect x="21" y="0.5" width="6" height="5" rx="1.5" fill="#FFC629" stroke="#1F2A22" stroke-width="2"/></svg>',
    flashlight: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M30 13 L44 7 L44 41 L30 35Z" fill="#FFC629" stroke="#1F2A22" stroke-width="3" stroke-linejoin="round"/>' +
      '<rect x="4" y="16" width="27" height="16" rx="4" fill="#1F64B0" stroke="#1F2A22" stroke-width="3"/><rect x="13" y="19.5" width="8" height="5" rx="2" fill="#F26B21" stroke="#1F2A22" stroke-width="1.8"/>' +
      '<path d="M44 12 L44 36" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".9"/></svg>',
    knot: '<svg viewBox="0 0 48 48" aria-hidden="true"><g fill="none" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M4 34 C12 34 14 12 25 12 C36 12 38 28 29 32 C20 36 16 22 25 19 C34 16 39 31 45 31" stroke="#1F2A22" stroke-width="9"/>' +
      '<path d="M4 34 C12 34 14 12 25 12 C36 12 38 28 29 32 C20 36 16 22 25 19 C34 16 39 31 45 31" stroke="#E8B867" stroke-width="5"/>' +
      '<path d="M8 33 l2 -3 M15 24 l3 -1 M22 14 l2 2 M31 14 l0 3 M35 25 l-3 1" stroke="#9A6A2A" stroke-width="1.5"/></g></svg>'
  };
  var KINDS = ['compass', 'flashlight', 'knot'];

  var S = null; // active session

  function start(){
    if (S){ S.extend(); burst(S, 10); return; }
    K.found('be-prepared');
    K.say('Be Prepared! Compasses, flashlights and knots are raining down. Drag to toss them. Press Escape to clear.');
    var L = K.el('div', 'egg-bp-layer'); document.body.appendChild(L);
    K.adClip(L);   // items slip "behind" ads instead of covering them
    var R = K.vw() < 640 ? 18 : 22;
    S = {layer:L, items:[], r:R, until:Date.now() + 12000, drag:null};
    S.extend = function(){ S.until = Math.max(S.until, Date.now() + 6000); };
    var offEsc = K.onEsc(function(){ offEsc = null; end(); });
    var onScroll = function(){ K.adClip(L); };
    window.addEventListener('scroll', onScroll, {passive:true});
    S.offEsc = function(){ offEsc && offEsc(); window.removeEventListener('scroll', onScroll); };

    if (!K.motion()){ staticPile(S); }
    else { burst(S, K.vw() < 640 ? 16 : 26); S.loop = K.loop(step); S.loop.start(); }
    S.timer = setInterval(function(){
      if (!S) return;
      if (Date.now() > S.until && !S.drag) end();
    }, 400);
  }

  function makeItem(S, kind){
    var el = K.el('div', 'egg-bp-item egg-bp-' + kind);
    el.innerHTML = ICONS[kind];
    el.style.width = el.style.height = (S.r * 2) + 'px';
    S.layer.appendChild(el);
    var it = {el:el, x:0, y:0, vx:0, vy:0, a:0, av:0, r:S.r};
    if (K.motion()) bindDrag(S, it);
    S.items.push(it);
    return it;
  }
  function burst(S, n){
    var vw = K.vw();
    for (var i = 0; i < n; i++){
      var it = makeItem(S, KINDS[i % KINDS.length]);
      it.x = K.rnd(S.r + 10, vw - S.r - 10);
      it.y = -S.r - Math.random() * 420;
      it.vx = K.rnd(-90, 90); it.vy = K.rnd(0, 160);
      it.a = Math.random() * 6.28; it.av = K.rnd(-4, 4);
      render(it);
    }
  }
  function staticPile(S){
    var vw = K.vw(), vh = K.vh(), d = S.r * 2 + 4, n = 12;
    var cols = Math.min(n, Math.floor((vw - 40) / d)), x0 = (vw - cols * d) / 2 + S.r;
    for (var i = 0; i < n; i++){
      var it = makeItem(S, KINDS[i % KINDS.length]);
      var row = Math.floor(i / cols), col = i % cols;
      it.x = x0 + col * d + (row % 2 ? S.r : 0); it.y = vh - S.r - 6 - row * (d - 6);
      it.a = (Math.random() - .5) * 1.2;
      render(it);
      it.el.classList.add('egg-fade-in');
    }
  }
  function render(it){
    it.el.style.transform = 'translate(' + (it.x - it.r).toFixed(1) + 'px,' + (it.y - it.r).toFixed(1) + 'px) rotate(' + it.a.toFixed(3) + 'rad)';
  }

  function bindDrag(S, it){
    it.el.addEventListener('pointerdown', function(e){
      if (!S || S.drag) return;
      e.preventDefault();
      try { it.el.setPointerCapture(e.pointerId); } catch(err){}
      S.drag = {it:it, id:e.pointerId, ox:it.x - e.clientX, oy:it.y - e.clientY, lx:e.clientX, ly:e.clientY, lt:performance.now(), vx:0, vy:0};
      it.el.classList.add('is-grabbed');
      S.extend();
    });
    it.el.addEventListener('pointermove', function(e){
      var d = S && S.drag; if (!d || d.it !== it || d.id !== e.pointerId) return;
      var now = performance.now(), dt = Math.max(1, now - d.lt) / 1000;
      var ivx = (e.clientX - d.lx) / dt, ivy = (e.clientY - d.ly) / dt;
      d.vx = d.vx * 0.5 + ivx * 0.5; d.vy = d.vy * 0.5 + ivy * 0.5;
      d.lx = e.clientX; d.ly = e.clientY; d.lt = now;
      it.x = e.clientX + d.ox; it.y = e.clientY + d.oy; it.vx = 0; it.vy = 0;
      if (!S.loop || !S.loop.running) render(it);
    });
    var up = function(e){
      var d = S && S.drag; if (!d || d.it !== it) return;
      var lim = 2600;
      it.vx = K.clamp(d.vx, -lim, lim); it.vy = K.clamp(d.vy, -lim, lim);
      it.av = it.vx / it.r * 0.5;
      it.el.classList.remove('is-grabbed');
      S.drag = null; S.extend();
    };
    it.el.addEventListener('pointerup', up);
    it.el.addEventListener('pointercancel', up);
  }

  function step(dt){
    if (!S) return false;
    var vw = K.vw(), vh = K.vh(), G = 1900, sub = 3, h = dt / sub, items = S.items;
    var dragged = S.drag && S.drag.it;
    for (var s = 0; s < sub; s++){
      for (var i = 0; i < items.length; i++){
        var it = items[i]; if (it === dragged) continue;
        it.vy += G * h;
        it.x += it.vx * h; it.y += it.vy * h; it.a += it.av * h;
        var floor = vh - it.r - 2;
        if (it.y > floor){
          it.y = floor;
          if (it.vy > 0) it.vy = -it.vy * 0.38;
          if (Math.abs(it.vy) < 40) it.vy = 0;
          it.vx *= (1 - 3.5 * h);
          it.av = it.vx / it.r;
        }
        if (it.x < it.r){ it.x = it.r; it.vx = Math.abs(it.vx) * 0.5; }
        if (it.x > vw - it.r){ it.x = vw - it.r; it.vx = -Math.abs(it.vx) * 0.5; }
        if (it.y < -600){ it.y = -600; it.vy = 0; }
        it.av *= (1 - 0.8 * h);
      }
      // circle collisions
      for (var a = 0; a < items.length; a++){
        for (var b = a + 1; b < items.length; b++){
          var A = items[a], B = items[b];
          var dx = B.x - A.x, dy = B.y - A.y, min = A.r + B.r, d2 = dx*dx + dy*dy;
          if (d2 >= min*min || d2 === 0) continue;
          var d = Math.sqrt(d2), nx = dx / d, ny = dy / d, pen = min - d;
          var wa = A === dragged ? 0 : 1, wb = B === dragged ? 0 : 1, wt = wa + wb || 1;
          A.x -= nx * pen * wa / wt; A.y -= ny * pen * wa / wt;
          B.x += nx * pen * wb / wt; B.y += ny * pen * wb / wt;
          var rvx = B.vx - A.vx, rvy = B.vy - A.vy, vn = rvx * nx + rvy * ny;
          if (vn < 0){
            var j = -(1 + 0.25) * vn / wt;
            A.vx -= j * nx * wa; A.vy -= j * ny * wa;
            B.vx += j * nx * wb; B.vy += j * ny * wb;
          }
        }
      }
    }
    for (var k = 0; k < items.length; k++) render(items[k]);
  }

  K.onMotion(function(ok){
    if (!S || !S.loop) return;
    if (ok) S.loop.start(); else S.loop.stop();
  });

  function end(){
    if (!S) return;
    var s = S; S = null;
    s.loop && s.loop.stop();
    clearInterval(s.timer);
    s.offEsc();
    s.layer.classList.add('egg-fade-out');
    setTimeout(function(){ s.layer.remove(); }, 600);
  }
})();
