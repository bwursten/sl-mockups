/* ============================================================
   Games section front — Agent GAMES
   1. Big Rec Hall cabinet (+ controller-combo BONUS LEVEL egg)
   2. Trail Runner canvas mini-game
   3. Game browser: type filters, in-grid ads, Surprise me!
   4. High-score ghost egg (click G-A-M-E-S on the sign)
   ============================================================ */
(function(){
  'use strict';
  var SL = window.SL;
  if (!SL || document.body.getAttribute('data-page') !== 'games') return;

  var G = 'https://scoutlife.org/games/mobile-games/';
  var PALETTE = ['#F26B21','#F7A531','#FFC629','#8DBF4A','#3E9C8A','#3FA9F5','#1F64B0'];
  function motion(){ return SL.motionOK(); }
  function ready(fn){ if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }
  function isTyping(el){ return el && (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable); }

  /* ============================================================
     1. BIG CABINET
     ============================================================ */
  var FEAT = [
    {t:'Scout Life’s Gaga Brawl', u:G+'191713/gaga-brawl/', img:'gagabrawl', d:'Will you be the last brawler standing? Dodge the red-hot ball in this online gaga ball video game.'},
    {t:'Hide & Seek Havoc', u:G+'183079/hide-seek-havoc/', img:'hideseek', d:'You’ll need sharp eyes to track down the lost people and missing gear. Can you spot them all before time runs out?'},
    {t:'Cat Stack', u:G+'179013/cat-stack/', img:'catstack', d:'Can you fit these bitty kitties into the puzzle purrfectly? Just because cats have nine lives doesn’t mean you do!'},
    {t:'Bike Blitz', u:G+'178477/bike-blitz/', img:'bikeblitz', d:'Experience the thrill of competitive cycling! Customize your bike and race through Italy, France and Spain.'},
    {t:'Cheese Patrol 2: Cat Attack!', u:G+'176958/cheese-patrol-2-cat-attack/', img:'catattack', d:'Cheese Patrol is back, and it’s even cheesier! Help your mouse buddy rescue his friends and avoid the cats.'},
    {t:'Scout Life Jigsaw Puzzles', u:G+'177586/jigsaw-puzzles/', img:'jigsaw', d:'We’ve turned some iconic Scout Life covers and photos into challenging jigsaw puzzles. Can you solve them?'}
  ];

  function initCabinet(){
    var cab = SL.$('[data-gm-cab]'); if (!cab) return;
    function $(s){ return cab.querySelector(s); }
    var screen = $('.gm-screen'), shot = $('.gm-shot'), marquee = $('.gm-marquee-txt'), title = $('.gm-cab-title'),
        desc = $('.gm-cab-desc'), start = $('.gm-start'), num = $('.gm-screen-n'), thumbsEl = $('.gm-thumbs'),
        live = $('.gm-cab-live'), stick = $('.gm-stick'), exitBtn = $('.gm-bonus-exit');
    var idx = 0, N = FEAT.length, bonus = false, seq = [], seqT = 0, flashT = 0;
    var BTN = {U:$('.gm-up'), D:$('.gm-down'), L:$('.gm-left'), R:$('.gm-right')};

    FEAT.forEach(function(g){ var i = new Image(); i.src = 'assets/img/sf-games-' + g.img + '.jpg'; });
    var thumbs = FEAT.map(function(g, i){
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'gm-thumb'; b.setAttribute('aria-label', g.t);
      b.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
      b.innerHTML = '<img src="assets/img/sf-games-' + g.img + '.jpg" alt="" width="62" height="47" loading="lazy">';
      b.addEventListener('click', function(){ if (i !== idx) show(i, i > idx ? 1 : -1, 'thumb'); });
      thumbsEl.appendChild(b);
      return b;
    });

    function apply(){
      var g = FEAT[idx];
      shot.src = 'assets/img/sf-games-' + g.img + '.jpg';
      shot.alt = g.t + ' game title screen';
      marquee.textContent = g.t; title.textContent = g.t; desc.textContent = g.d;
      start.href = g.u; start.setAttribute('aria-label', 'Press start: play ' + g.t);
      num.textContent = (idx + 1) + '/' + N;
      thumbs.forEach(function(b, i){ b.setAttribute('aria-pressed', i === idx ? 'true' : 'false'); });
    }
    function show(i, dir, src){
      idx = (i + N) % N;
      SL.track('gm_cabinet', {action:src, game:FEAT[idx].img});
      live.textContent = 'Game ' + (idx + 1) + ' of ' + N + ': ' + FEAT[idx].t;
      if (motion()){
        screen.animate([
          {transform:'scale(1,1)', filter:'brightness(1)'},
          {transform:'scale(1,.03)', filter:'brightness(2.2)', offset:.45},
          {transform:'scale(1,.03)', filter:'brightness(2.2)', offset:.55},
          {transform:'scale(1,1)', filter:'brightness(1)'}
        ], {duration:320, easing:'ease-in-out'});
        setTimeout(apply, 150);
        marquee.animate([{transform:'translateX(' + (dir > 0 ? 50 : -50) + 'px)', opacity:0}, {transform:'none', opacity:1}],
          {duration:300, delay:130, easing:'ease-out', fill:'backwards'});
      } else {
        apply();
        screen.animate([{opacity:.35}, {opacity:1}], {duration:180});
      }
    }
    function press(el){ if (!el) return; el.classList.add('is-press'); setTimeout(function(){ el.classList.remove('is-press'); }, 140); }

    /* every directional input: ▲ / ◀ = previous, ▼ / ▶ = next, and feeds the combo */
    function input(dir, src){
      press(BTN[dir]);
      show(idx + (dir === 'U' || dir === 'L' ? -1 : 1), (dir === 'U' || dir === 'L') ? -1 : 1, src + '_' + dir);
      var now = Date.now();
      if (now - seqT > 2500) seq = [];
      seqT = now; seq.push(dir); if (seq.length > 4) seq.shift();
      if (seq.join('') === 'UUDD'){ seq = []; setBonus(true); }
    }
    Object.keys(BTN).forEach(function(d){ BTN[d].addEventListener('click', function(){ input(d, 'button'); }); });

    /* keyboard: arrow keys anywhere inside the cabinet */
    cab.addEventListener('keydown', function(e){
      var d = {ArrowUp:'U', ArrowDown:'D', ArrowLeft:'L', ArrowRight:'R'}[e.key];
      if (!d || e.altKey || e.ctrlKey || e.metaKey) return;
      e.preventDefault();
      nudge(d);
      input(d, 'key');
    });

    /* ---- BONUS LEVEL (controller combo egg) ---- */
    function setBonus(on){
      if (on === bonus) { if (on) flash(); return; }
      bonus = on;
      cab.classList.toggle('is-bonus', on);
      exitBtn.hidden = !on;
      if (on){
        SL.eggFound('games-combo');
        flash();
        SL.toast('★ Bonus level unlocked! ★');
        live.textContent = 'Bonus level unlocked! The cabinet glows with stars. Press Escape or the Exit bonus button to go back.';
        if (motion()) setTimeout(function(){ SL.confettiAt($('.gm-marquee'), {count:30, shapes:['★','✦','●','■'], spread:220}); }, 120);
      } else {
        cab.classList.remove('is-flash');
        live.textContent = 'Back to the regular cabinet.';
        if (document.activeElement === exitBtn || !document.activeElement || document.activeElement === document.body) BTN.U.focus({preventScroll:true});
      }
    }
    function flash(){
      clearTimeout(flashT);
      cab.classList.remove('is-flash'); void cab.offsetWidth; cab.classList.add('is-flash');
      flashT = setTimeout(function(){ cab.classList.remove('is-flash'); }, 1900);
    }
    exitBtn.addEventListener('click', function(){ setBonus(false); });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && bonus) setBonus(false); });

    /* ---- joystick: drag/flick in a direction, or click for next ---- */
    function setKnob(x, y, spring){
      stick.classList.toggle('is-spring', !!spring);
      stick.style.setProperty('--kx', x + 'px'); stick.style.setProperty('--ky', y + 'px');
      stick.style.setProperty('--tilt-x', (x * 1.5) + 'deg');
    }
    function nudge(d){
      var v = {U:[0,-10], D:[0,7], L:[-12,0], R:[12,0]}[d];
      setKnob(v[0], v[1], true);
      setTimeout(function(){ setKnob(0, 0, true); }, 160);
    }
    var drag = null;
    stick.addEventListener('pointerdown', function(e){
      if (e.button > 0) return;
      e.preventDefault();
      try { stick.setPointerCapture(e.pointerId); } catch(_){}
      drag = {x:e.clientX, y:e.clientY, id:e.pointerId, dx:0, dy:0};
      stick.classList.remove('is-spring');
    });
    stick.addEventListener('pointermove', function(e){
      if (!drag || e.pointerId !== drag.id) return;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y, dist = Math.sqrt(dx*dx + dy*dy), max = 14, k = dist > max ? max / dist : 1;
      drag.dx = dx; drag.dy = dy;
      setKnob(dx * k, dy * k * .7, false);
    });
    function endDrag(e){
      if (!drag || (e && e.pointerId !== drag.id)) return;
      var d = drag; drag = null;
      setKnob(0, 0, true);
      if (Math.abs(d.dx) < 8 && Math.abs(d.dy) < 8){ input('R', 'stick'); return; }
      input(Math.abs(d.dx) > Math.abs(d.dy) ? (d.dx > 0 ? 'R' : 'L') : (d.dy > 0 ? 'D' : 'U'), 'stick');
    }
    stick.addEventListener('pointerup', endDrag);
    stick.addEventListener('pointercancel', function(){ drag = null; setKnob(0, 0, true); });
    stick.addEventListener('click', function(e){ if (e.detail === 0) { nudge('R'); input('R', 'stick'); } });
    start.addEventListener('click', function(){ SL.track('gm_press_start', {game:FEAT[idx].img, bonus:bonus}); });
  }

  /* ============================================================
     2. TRAIL RUNNER
     ============================================================ */
  function initRunner(){
    var root = SL.$('#trail-runner'); if (!root) return;
    function $(s){ return root.querySelector(s); }
    var cv = $('.gm-run-canvas'), ctx = cv.getContext('2d'), stage = $('.gm-run-stage');
    var ovl = $('.gm-run-ovl'), ovlBig = $('.gm-ovl-big'), ovlSmall = $('.gm-ovl-small'), ovlPlay = $('.gm-ovl-play');
    var toggle = $('.gm-run-toggle'), tgTxt = $('.gm-tg-txt'), restartBtn = $('.gm-run-restart'), jumpBtn = $('.gm-run-jump');
    var scoreEl = $('.gm-run-score'), timeEl = $('.gm-run-time'), bestEl = $('.gm-run-best'), live = $('.gm-run-live');
    if (!ctx) return;

    var W = 720, H = 300, GROUND = 248, HX = 128, ROUND = 30;
    var best = +SL.store.get('trail-runner-best', 0) || 0;
    bestEl.textContent = best;
    var state = 'idle';            // idle | count | run | pause | over
    var S = null, raf = 0, last = 0, inView = false, dist = 0, phase = 0, lastKey = 0, lastPD = 0;
    var stampEl = null;

    /* ---- scenery data ---- */
    var CLOUDS = [[80,46,1],[330,30,.8],[560,62,1.1],[860,40,.9]];
    var PINES = [];
    (function(){ var x = 0; while (x < 1400){ PINES.push([x, 46 + Math.random() * 38]); x += 34 + Math.random() * 40; } })();

    function resize(){
      var r = cv.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
      // narrow stages show a shorter stretch of trail so the sprites stay big enough to see
      if (r.width > 0 && r.height > 0){
        var narrow = r.width < 480;
        W = narrow ? 540 : 720; HX = narrow ? 100 : 128;
        H = Math.round(W * r.height / r.width); GROUND = H - 52;
      }
      var w = Math.max(1, Math.round(r.width * dpr)), h = Math.max(1, Math.round(r.height * dpr));
      if (cv.width !== w || cv.height !== h){ cv.width = w; cv.height = h; }
      ctx.setTransform(cv.width / W, 0, 0, cv.height / H, 0, 0);
      draw();
    }

    function newRound(){
      return {t:0, count:0.95, score:0, h:0, vy:0, buf:0, inv:0, slow:0, obs:[], cones:[], pops:[], nextX:dist + W + 120, jumps:0, hits:0};
    }

    /* ---------- drawing ---------- */
    function rr(x, y, w, h, r){ ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
    function ridge(off, base, a1, k1, a2, k2, color){
      ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(0, H);
      for (var x = 0; x <= W + 8; x += 8){ var X = x + off; ctx.lineTo(x, base - (Math.sin(X * k1) * a1 + Math.sin(X * k2 + 1.7) * a2) - a1 - a2); }
      ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
    }
    function drawScene(){
      var g = ctx.createLinearGradient(0, 0, 0, GROUND);
      g.addColorStop(0, '#5DB8F7'); g.addColorStop(1, '#D4EEF8');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      // sun
      ctx.fillStyle = '#FFE7A0'; ctx.beginPath(); ctx.arc(W - 108, 58, 30, 0, 7); ctx.fill();
      ctx.fillStyle = '#FFC629'; ctx.beginPath(); ctx.arc(W - 108, 58, 22, 0, 7); ctx.fill();
      // clouds
      ctx.fillStyle = '#FFFFFF';
      CLOUDS.forEach(function(c){
        var x = ((c[0] - dist * .04) % 1000 + 1000) % 1000 - 120, y = c[1], s = c[2];
        ctx.beginPath(); ctx.ellipse(x, y, 34 * s, 12 * s, 0, 0, 7); ctx.ellipse(x + 22 * s, y - 8 * s, 20 * s, 13 * s, 0, 0, 7); ctx.ellipse(x - 18 * s, y - 4 * s, 16 * s, 10 * s, 0, 0, 7); ctx.fill();
      });
      ridge(dist * .08, GROUND - 80, 26, .011, 14, .027, '#8FB3CF');      // far mountains
      ridge(dist * .18, GROUND - 52, 16, .016, 9, .041, '#6E9F57');       // hills
      // pine line
      ctx.fillStyle = '#1F5C3A';
      var po = dist * .45 % 1400;
      PINES.forEach(function(p){
        var x = p[0] - po; if (x < -40) x += 1400; if (x > W + 40) return;
        var h = p[1], b = GROUND - 2;
        ctx.beginPath(); ctx.moveTo(x, b - h); ctx.lineTo(x + h * .3, b - h * .45); ctx.lineTo(x + h * .18, b - h * .45); ctx.lineTo(x + h * .38, b); ctx.lineTo(x - h * .38, b); ctx.lineTo(x - h * .18, b - h * .45); ctx.lineTo(x - h * .3, b - h * .45); ctx.closePath(); ctx.fill();
      });
      // meadow + trail
      ctx.fillStyle = '#8DBF4A'; ctx.fillRect(0, GROUND - 8, W, 14);
      ctx.fillStyle = '#5E8C3A'; ctx.fillRect(0, GROUND - 8, W, 3);
      ctx.fillStyle = '#D8C29A'; ctx.fillRect(0, GROUND + 4, W, H - GROUND);
      ctx.fillStyle = '#1F2A22'; ctx.fillRect(0, GROUND + 3, W, 2);
      // pebbles & ruts
      ctx.fillStyle = '#B79E72';
      var ro = dist % 90;
      for (var x = -ro; x < W + 90; x += 90){ ctx.fillRect(x, GROUND + 18, 14, 3); ctx.fillRect(x + 46, GROUND + 34, 8, 3); ctx.fillRect(x + 70, GROUND + 12, 5, 3); }
      // trail-blaze posts
      var bo = dist % 520;
      for (var px = W - bo + 60; px > -40; px -= 520){
        ctx.fillStyle = '#7A4E2D'; ctx.fillRect(px, GROUND - 46, 10, 52);
        ctx.fillStyle = '#F26B21'; ctx.fillRect(px + 2, GROUND - 40, 6, 12);
        ctx.strokeStyle = '#1F2A22'; ctx.lineWidth = 2; ctx.strokeRect(px, GROUND - 46, 10, 52);
      }
    }
    function drawLog(x, y, w, h){
      ctx.lineWidth = 3; ctx.strokeStyle = '#1F2A22';
      rr(x, y, w, h, h / 2); ctx.fillStyle = '#8A5A34'; ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#5A3A1E'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x + 8, y + 9); ctx.lineTo(x + w - 18, y + 9); ctx.moveTo(x + 14, y + h - 8); ctx.lineTo(x + w - 22, y + h - 8); ctx.stroke();
      ctx.fillStyle = '#E2B97E'; ctx.strokeStyle = '#1F2A22'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(x + w - h / 2 + 2, y + h / 2, h / 2 - 2, h / 2 - 1, 0, 0, 7); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#A9733F'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(x + w - h / 2 + 2, y + h / 2, h / 4, h / 4, 0, 0, 7); ctx.stroke();
    }
    function drawRock(x, y, w, h){
      ctx.fillStyle = '#9A9C92'; ctx.strokeStyle = '#1F2A22'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(x, y + h); ctx.lineTo(x + w * .12, y + h * .35); ctx.lineTo(x + w * .45, y); ctx.lineTo(x + w * .82, y + h * .2); ctx.lineTo(x + w, y + h); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#C3C5BB'; ctx.beginPath(); ctx.moveTo(x + w * .2, y + h * .4); ctx.lineTo(x + w * .45, y + h * .1); ctx.lineTo(x + w * .55, y + h * .35); ctx.closePath(); ctx.fill();
    }
    function drawStump(x, y, w, h){
      ctx.fillStyle = '#7A4E2D'; ctx.strokeStyle = '#1F2A22'; ctx.lineWidth = 3;
      ctx.fillRect(x, y + 6, w, h - 6); ctx.strokeRect(x, y + 6, w, h - 6);
      ctx.fillStyle = '#E2B97E'; ctx.beginPath(); ctx.ellipse(x + w / 2, y + 6, w / 2, 6, 0, 0, 7); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#5A3A1E'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 9, y + 16); ctx.lineTo(x + 9, y + h - 4); ctx.moveTo(x + w - 10, y + 20); ctx.lineTo(x + w - 10, y + h - 6); ctx.stroke();
    }
    function drawCone(x, y){
      ctx.fillStyle = '#8A5A34'; ctx.strokeStyle = '#1F2A22'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(x, y - 12); ctx.bezierCurveTo(x + 10, y - 8, x + 10, y + 8, x, y + 12); ctx.bezierCurveTo(x - 10, y + 8, x - 10, y - 8, x, y - 12); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#4A2E14'; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(x - 6, y - 4); ctx.quadraticCurveTo(x, y, x + 6, y - 4); ctx.moveTo(x - 7, y + 2); ctx.quadraticCurveTo(x, y + 6, x + 7, y + 2); ctx.moveTo(x - 4, y + 8); ctx.quadraticCurveTo(x, y + 10, x + 4, y + 8); ctx.stroke();
      ctx.fillStyle = '#5E8C3A'; ctx.fillRect(x - 1.5, y - 17, 3, 6);
    }
    function drawHiker(x, foot, ph, air, flash){
      if (flash && Math.floor(S.inv * 12) % 2) ctx.globalAlpha = .4;
      var hip = foot - 24, sw = air ? .5 : Math.sin(ph) * .75, sw2 = air ? -.7 : -Math.sin(ph) * .75;
      ctx.lineCap = 'round'; ctx.strokeStyle = '#1F2A22';
      function leg(a, back){
        var kx = x + Math.sin(a) * 12, ky = hip + Math.cos(a) * 12, fx = kx + Math.sin(a - (back ? .2 : -.5)) * 12, fy = Math.min(foot, ky + 12);
        ctx.lineWidth = 7; ctx.strokeStyle = back ? '#2C3A30' : '#1F2A22';
        ctx.beginPath(); ctx.moveTo(x, hip); ctx.lineTo(kx, ky); ctx.lineTo(fx, fy); ctx.stroke();
        ctx.lineWidth = 3; ctx.strokeStyle = '#D8C29A'; ctx.beginPath(); ctx.moveTo(x, hip); ctx.lineTo(kx, ky); ctx.stroke();
        ctx.fillStyle = '#553419'; rr(fx - 4, fy - 4, 12, 7, 3); ctx.fill();
      }
      leg(sw2, true);
      // backpack
      ctx.fillStyle = '#F26B21'; ctx.strokeStyle = '#1F2A22'; ctx.lineWidth = 2.5;
      rr(x - 19, foot - 56, 13, 28, 4); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#FFC629'; ctx.fillRect(x - 17, foot - 50, 9, 3);
      // torso
      ctx.fillStyle = '#3E9C8A'; rr(x - 8, foot - 54, 17, 32, 6); ctx.fill(); ctx.stroke();
      leg(sw, false);
      // arm
      ctx.lineWidth = 6; ctx.strokeStyle = '#1F2A22';
      var ax = x + 2 + Math.sin(sw2) * 11, ay = foot - 46 + Math.cos(sw2) * 11;
      ctx.beginPath(); ctx.moveTo(x + 1, foot - 48); ctx.lineTo(ax, ay); ctx.stroke();
      ctx.lineWidth = 3; ctx.strokeStyle = '#C98D5E'; ctx.beginPath(); ctx.moveTo(x + 1, foot - 48); ctx.lineTo(ax, ay); ctx.stroke();
      // head + hat
      ctx.fillStyle = '#C98D5E'; ctx.strokeStyle = '#1F2A22'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(x + 3, foot - 63, 9, 0, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#1F2A22'; ctx.fillRect(x + 7, foot - 65, 2.5, 3);
      ctx.fillStyle = '#7A4E2D'; ctx.beginPath(); ctx.ellipse(x + 3, foot - 70, 14, 3.5, 0, 0, 7); ctx.fill(); ctx.stroke();
      rr(x - 4, foot - 79, 14, 9, 4); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#FFC629'; ctx.fillRect(x - 3, foot - 73, 12, 2);
      ctx.globalAlpha = 1;
    }
    function text(t, x, y, size, color){
      ctx.font = size + 'px "Press Start 2P", monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.lineWidth = 6; ctx.strokeStyle = '#1F2A22'; ctx.strokeText(t, x, y);
      ctx.fillStyle = color; ctx.fillText(t, x, y);
    }
    function draw(){
      drawScene();
      if (S){
        S.cones.forEach(function(c){ if (!c.got){ var x = c.x - dist; if (x > -20 && x < W + 20) drawCone(x, c.y + Math.sin((S.t * 4) + c.x) * 2.5); } });
        S.obs.forEach(function(o){
          var x = o.x - dist; if (x < -80 || x > W + 80) return;
          var y = GROUND + 5 - o.h;
          if (o.k === 'log') drawLog(x, y, o.w, o.h); else if (o.k === 'rock') drawRock(x, y, o.w, o.h); else drawStump(x, y, o.w, o.h);
        });
        drawHiker(HX, GROUND + 4 - S.h, phase, S.h > 0.5, S.inv > 0);
        S.pops.forEach(function(p){ ctx.globalAlpha = Math.max(0, Math.min(1, p.life * 2)); text(p.t, p.x, p.y, 14, p.c); ctx.globalAlpha = 1; });
        if (state === 'count') text(S.count > .4 ? 'READY…' : 'GO!', W / 2, GROUND - 140, 30, S.count > .4 ? '#FFFDF6' : '#FFC629');
      } else {
        drawHiker(HX, GROUND + 4, phase, false, false);
      }
    }

    /* ---------- update ---------- */
    function speed(){ return (300 + 170 * Math.min(1, S.t / ROUND)) * (S.slow > 0 ? .6 : 1); }
    function spawn(){
      var late = S.t > 12, r = Math.random();
      var o = r < .45 ? {k:'log', w:56, h:26} : (r < .8 || !late ? {k:'rock', w:42, h:32} : {k:'stump', w:34, h:44});
      o.x = S.nextX; S.obs.push(o);
      var gap = (330 + Math.random() * 260) * Math.sqrt(speed() / 320);
      // pinecones: a ground row before the obstacle, or an arc over it
      var c = Math.random();
      if (c < .45){ for (var i = 0; i < 3; i++) S.cones.push({x:o.x - gap * .55 + i * 34, y:GROUND - 20}); }
      else if (c < .9){ [-46, 0, 46].forEach(function(dx, i){ S.cones.push({x:o.x + o.w / 2 + dx, y:GROUND - (i === 1 ? 118 : 96)}); }); }
      S.nextX += gap;
    }
    function pop(t, x, y, c){ S.pops.push({t:t, x:x, y:y, c:c || '#FFC629', life:.8}); }
    function doJump(){
      if (!S) return;
      if (S.h <= 0.5){ S.vy = 830; S.h = 1; S.jumps++; } else S.buf = .14;
    }
    function update(dt){
      if (state === 'idle'){ dist += 70 * dt; phase += dt * 7; return; }
      if (state === 'count'){
        S.count -= dt; phase += dt * 4;
        if (S.count <= 0){ state = 'run'; }
        return;
      }
      if (state !== 'run') return;
      S.t += dt;
      var v = speed();
      dist += v * dt; phase += dt * v / 26;
      if (S.inv > 0) S.inv -= dt;
      if (S.slow > 0) S.slow -= dt;
      // physics
      if (S.h > 0){
        S.vy -= 2500 * dt; S.h += S.vy * dt;
        if (S.h <= 0){ S.h = 0; S.vy = 0; if (S.buf > 0){ S.buf = 0; doJump(); } }
      }
      if (S.buf > 0) S.buf -= dt;
      while (S.nextX < dist + W + 160) spawn();
      // collisions
      var hx1 = HX - 11, hx2 = HX + 11, hy2 = GROUND + 4 - S.h, hy1 = hy2 - 62;
      S.obs.forEach(function(o){
        if (o.hit) return;
        var x1 = o.x - dist + 6, x2 = x1 + o.w - 12, y1 = GROUND + 5 - o.h + 6;
        if (hx2 > x1 && hx1 < x2 && hy2 > y1 && S.inv <= 0){
          o.hit = true; S.hits++;
          S.inv = 1; S.slow = .6;
          if (S.score > 0){ S.score--; pop('OOF! -1', HX + 10, hy1 - 6, '#F26B21'); } else pop('OOF!', HX + 10, hy1 - 6, '#F26B21');
        }
      });
      S.cones.forEach(function(c){
        if (c.got) return;
        var dx = c.x - dist - HX, dy = c.y - (hy1 + 31);
        if (Math.abs(dx) < 22 && Math.abs(dy) < 40){ c.got = true; S.score++; pop('+1', HX + 6, c.y - 18); }
      });
      S.obs = S.obs.filter(function(o){ return o.x - dist > -120; });
      S.cones = S.cones.filter(function(c){ return !c.got && c.x - dist > -40; });
      S.pops = S.pops.filter(function(p){ p.life -= dt; p.y -= 40 * dt; return p.life > 0; });
      hud();
      if (S.t >= ROUND) finish();
    }
    var lastHud = '';
    function hud(){
      var s = S ? S.score : 0, t = S ? Math.max(0, Math.ceil(ROUND - S.t)) : ROUND, k = s + '|' + t;
      if (k === lastHud) return; lastHud = k;
      scoreEl.textContent = s; timeEl.textContent = t;
    }

    /* ---------- loop control ---------- */
    function wantsLoop(){ return state === 'run' || state === 'count' || (state === 'idle' && inView && motion() && !document.hidden); }
    function frame(t){
      raf = 0;
      var dt = last ? Math.min(.05, (t - last) / 1000) : .016; last = t;
      update(dt); draw();
      if (wantsLoop()) raf = requestAnimationFrame(frame);
    }
    function kick(){ if (!raf && wantsLoop()){ last = 0; raf = requestAnimationFrame(frame); } else if (!raf) draw(); }

    /* ---------- states ---------- */
    function setToggle(){
      tgTxt.textContent = (state === 'run' || state === 'count') ? '❚❚ Pause' : state === 'pause' ? '▶ Resume' : state === 'over' ? '▶ Play again' : '▶ Play';
    }
    function overlay(big, small, btn, stamp){
      ovlBig.textContent = big; ovlSmall.textContent = small || ''; ovlPlay.textContent = btn;
      if (stampEl){ stampEl.remove(); stampEl = null; }
      if (stamp){ stampEl = document.createElement('span'); stampEl.className = 'gm-ovl-stamp'; stampEl.textContent = stamp; ovl.insertBefore(stampEl, ovlBig); }
      ovl.hidden = false;
    }
    function start(){
      SL.trackInteract('trail-runner', 'play');
      S = newRound(); lastHud = ''; hud();
      state = 'count'; ovl.hidden = true; setToggle();
      live.textContent = 'Go! 30 seconds on the clock. Jump with Space, the up arrow, a tap, or the Jump button.';
      kick();
    }
    function pause(auto){
      if (state !== 'run' && state !== 'count') return;
      state = 'pause'; setToggle();
      overlay('Paused', auto ? 'We paused your run while you were away.' : 'Catch your breath, hiker!', '▶ Resume');
      live.textContent = 'Paused.';
      draw();
    }
    function resume(){
      if (state !== 'pause') return;
      state = 'run'; ovl.hidden = true; setToggle();
      live.textContent = 'Back on the trail!';
      kick();
    }
    function finish(){
      state = 'over'; setToggle();
      var s = S.score, isBest = s > best && s > 0;
      if (isBest){ best = s; SL.store.set('trail-runner-best', best); bestEl.textContent = best; }
      overlay('Time’s up!', 'You collected ' + s + ' pinecone' + (s === 1 ? '' : 's') + '. Best: ' + best + '.', '▶ Play again', isBest ? 'New best!' : '');
      live.textContent = 'Time’s up! You collected ' + s + ' pinecone' + (s === 1 ? '' : 's') + '. ' + (isBest ? 'That’s a new best score!' : 'Your best is ' + best + '.');
      SL.track('trail_runner_end', {score:s, best:best, hits:S.hits});
      if (isBest) SL.confettiAt(stage, {count:24, shapes:['★','●','▲'], spread:150});
      draw();
    }
    function primary(){
      if (state === 'idle' || state === 'over') start();
      else if (state === 'pause') resume();
      else pause(false);
    }
    function jump(){
      if (state === 'run') doJump();
      else if (state === 'idle' || state === 'over') start();
      else if (state === 'pause') resume();
    }

    /* ---------- input ---------- */
    toggle.addEventListener('click', function(){ if (Date.now() - lastKey < 500) return; primary(); });
    ovlPlay.addEventListener('click', function(){ primary(); });
    restartBtn.addEventListener('click', function(){ start(); });
    jumpBtn.addEventListener('pointerdown', function(e){
      if (e.button > 0) return;
      lastPD = Date.now(); jump();
      jumpBtn.classList.add('is-press'); setTimeout(function(){ jumpBtn.classList.remove('is-press'); }, 120);
    });
    jumpBtn.addEventListener('click', function(){ if (Date.now() - lastPD < 700 || Date.now() - lastKey < 500) return; jump(); });
    cv.addEventListener('pointerdown', function(e){ if (e.button > 0) return; e.preventDefault(); jump(); });
    document.addEventListener('keydown', function(e){
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      var a = document.activeElement, inR = root.contains(a), onBody = !a || a === document.body;
      if (isTyping(a)) return;
      var k = e.key;
      if (k === ' ' || k === 'Spacebar' || k === 'ArrowUp' || k === 'w' || k === 'W'){
        if (state !== 'run' && state !== 'count') return;
        if (!(inR || onBody) || (inR && (a.tagName === 'A' || a === restartBtn))) return;
        e.preventDefault(); lastKey = Date.now();
        if (!e.repeat && state === 'run') doJump();
      } else if ((k === 'p' || k === 'P') && (inR || ((onBody) && (state === 'run' || state === 'pause' || state === 'count')))){
        if (state === 'run' || state === 'count'){ e.preventDefault(); pause(false); }
        else if (state === 'pause'){ e.preventDefault(); resume(); }
      } else if (k === 'Escape' && (state === 'run' || state === 'count')){ pause(false); }
    });
    document.addEventListener('keyup', function(e){ if ((e.key === ' ' || e.key === 'Spacebar') && Date.now() - lastKey < 600) { lastKey = Date.now(); } });

    /* ---------- visibility / motion ---------- */
    if ('IntersectionObserver' in window){
      new IntersectionObserver(function(en){
        en.forEach(function(x){ inView = x.isIntersecting; });
        if (!inView && (state === 'run' || state === 'count')) pause(true);
        kick();
      }, {threshold:.2}).observe(stage);
    } else { inView = true; }
    document.addEventListener('visibilitychange', function(){ if (document.hidden) pause(true); else kick(); });
    document.addEventListener('sl:motion', function(){
      if (!motion() && (state === 'run' || state === 'count')) pause(false);
      kick();
    });
    var rT = 0;
    window.addEventListener('resize', function(){ clearTimeout(rT); rT = setTimeout(resize, 120); });

    overlay(motion() ? 'Ready to hit the trail?' : 'Tap Play to start', 'Jump the logs & rocks. Grab the pinecones! 30 seconds on the clock.', '▶ Play');
    setToggle(); hud();
    resize();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ draw(); });
  }

  /* ============================================================
     3. GAME BROWSER
     ============================================================ */
  function initBrowser(){
    var sec = SL.$('#all-games'); if (!sec) return;
    var grid = sec.querySelector('[data-gm-grid]');
    var tiles = SL.$$('.gm-tile', grid), chips = SL.$$('.gm-chip', sec);
    var count = sec.querySelector('.gm-count'), showAll = sec.querySelector('.gm-showall'), surprise = sec.querySelector('.gm-surprise');
    var firstAd = grid.querySelector('.sf-ad'); if (!firstAd) return;
    var adTpl = firstAd.cloneNode(true);
    var LABEL = {all:'', action:'action', sports:'sports', racing:'racing', puzzle:'puzzle', cub:'Cub Scout favorite'};
    var filter = 'all', expanded = false, cols = 0, picked = null;
    function limit(){ return cols >= 3 ? 15 : cols === 2 ? 12 : 10; }   // fills whole rows
    var sLive = document.createElement('p'); sLive.className = 'sr-only'; sLive.setAttribute('aria-live', 'polite'); sec.appendChild(sLive);

    function getCols(){ return getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length || 1; }
    function matches(t){ return filter === 'all' || t.getAttribute('data-types').split(' ').indexOf(filter) >= 0; }
    function adAt(b){
      if (cols >= 3) return b * 2 * cols + cols + (b % 2 ? 0 : cols - 1);     // every 2 rows, alternating sides
      if (cols === 2) return b * 6 + 2 + (b % 2 ? 0 : 1);                       // every 3 rows
      return b * 6 + 3;                                                          // phone: after 3, then every 5 cards
    }
    function layout(){
      cols = getCols();
      SL.$$('.sf-ad', grid).forEach(function(a){ a.remove(); });
      var match = tiles.filter(matches);
      var LIMIT = limit(), vis = (filter === 'all' && !expanded) ? match.slice(0, LIMIT) : match;
      var frag = document.createDocumentFragment(), cell = 0, b = 0, next = adAt(0);
      vis.forEach(function(t, i){
        if (cell === next && vis.length - i >= 1){ frag.appendChild(adTpl.cloneNode(true)); cell++; b++; next = adAt(b); }
        t.hidden = false; frag.appendChild(t); cell++;
      });
      tiles.forEach(function(t){ if (vis.indexOf(t) < 0){ t.hidden = true; frag.appendChild(t); } });
      grid.appendChild(frag);
      var lab = LABEL[filter];
      count.textContent = (filter === 'all' && !expanded && match.length > LIMIT)
        ? 'Showing ' + vis.length + ' of ' + match.length + ' games'
        : 'Showing all ' + match.length + (lab ? ' ' + lab : '') + ' games';
      showAll.hidden = !(filter === 'all' && !expanded && match.length > LIMIT);
      showAll.textContent = 'Show all ' + match.length + ' games';
    }
    chips.forEach(function(c){
      c.addEventListener('click', function(){
        filter = c.getAttribute('data-f');
        chips.forEach(function(x){ x.setAttribute('aria-pressed', x === c ? 'true' : 'false'); });
        clearPick(); layout();
        SL.track('gm_filter', {type:filter});
      });
    });
    showAll.addEventListener('click', function(){
      var before = tiles.filter(function(t){ return !t.hidden; }).length;
      expanded = true; layout();
      var vis = tiles.filter(function(t){ return !t.hidden; });
      var first = vis[before]; if (first) first.querySelector('.gm-play').focus();
      SL.track('gm_show_all', {});
    });
    var rT = 0;
    window.addEventListener('resize', function(){ clearTimeout(rT); rT = setTimeout(function(){ if (getCols() !== cols) layout(); }, 150); });

    /* ---- Surprise me! ---- */
    var PIN = '<svg class="gm-pick-pin" viewBox="0 0 34 42" aria-hidden="true" focusable="false"><path d="M17 40C17 40 4 25 4 15a13 13 0 0 1 26 0c0 10-13 25-13 25z" fill="#F26B21" stroke="#1F2A22" stroke-width="3" stroke-linejoin="round"/><circle cx="17" cy="15" r="5.5" fill="#FFFDF6" stroke="#1F2A22" stroke-width="2.5"/></svg>';
    function clearPick(){
      if (!picked) return;
      picked.classList.remove('is-picked');
      var f = picked.querySelector('.gm-pick'); if (f) f.remove();
      var inn = picked.querySelector('.gm-tile-in'); if (inn) inn.classList.remove('gm-wiggle');
      picked = null;
    }
    surprise.addEventListener('click', function(){
      var pool = tiles.filter(matches).filter(function(t){ return t !== picked; });
      if (!pool.length) return;
      var t = SL.rand(pool);
      if (t.hidden){ expanded = true; layout(); }
      clearPick();
      var m = motion();
      SL.track('gm_surprise', {game:t.getAttribute('data-slug')});
      if (m){ surprise.classList.remove('is-spin'); void surprise.offsetWidth; surprise.classList.add('is-spin'); }
      setTimeout(function(){
        picked = t; t.classList.add('is-picked');
        var flag = document.createElement('span'); flag.className = 'gm-pick' + (m ? ' is-drop' : ''); flag.setAttribute('aria-hidden', 'true');
        flag.innerHTML = PIN + '<span class="gm-pick-stamp">Try this one!</span>';
        t.appendChild(flag);
        t.scrollIntoView({behavior:m ? 'smooth' : 'auto', block:'center'});
        var title = t.querySelector('.gm-tile-title').textContent;
        sLive.textContent = 'Surprise! Try ' + title + '.';
        setTimeout(function(){
          var inn = t.querySelector('.gm-tile-in');
          if (m){ inn.classList.remove('gm-wiggle'); void inn.offsetWidth; inn.classList.add('gm-wiggle'); }
          t.querySelector('.gm-play').focus({preventScroll:true});
        }, m ? 450 : 0);
      }, m ? 650 : 0);
    });

    layout();
  }

  /* ============================================================
     4. HIGH-SCORE GHOST EGG
     ============================================================ */
  var GHOST = [
    '....XXXXXX....',
    '..XXXXXXXXXX..',
    '.XXXXXXXXXXXX.',
    '.XXKKXXXXKKXX.',
    'XXXKWXXXXKWXXX',
    'XXXKKXXXXKKXXX',
    'XOOXXXXXXXXOOX',
    'XXXXXXKKXXXXXX',
    'XXXXXXKKXXXXXX',
    'XXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXX',
    'XX.XXX..XXX.XX',
    'X...XX..XX...X'
  ];
  function ghostSVG(){
    var C = {X:'#EAF6FF', K:'#1F2A22', W:'#FFFFFF', O:'#F7A531'}, r = '';
    GHOST.forEach(function(row, y){ for (var x = 0; x < row.length; x++){ var c = C[row[x]]; if (c) r += '<rect x="' + x + '" y="' + y + '" width="1.04" height="1.04" fill="' + c + '"/>'; } });
    return '<svg viewBox="-1 -1 16 15" shape-rendering="crispEdges" aria-hidden="true" focusable="false" style="filter:drop-shadow(1.5px 0 0 #1F2A22) drop-shadow(-1.5px 0 0 #1F2A22) drop-shadow(0 1.5px 0 #1F2A22) drop-shadow(0 -1.5px 0 #1F2A22) drop-shadow(0 4px 0 rgba(31,42,34,.45))"><g class="gm-gh-body">' + r + '</g></svg>';
  }
  function initGhost(){
    var hero = SL.$('.sf-hero'), letters = SL.$$('.gm-l');
    if (!hero || letters.length !== 5) return;
    var step = 0, t = 0, lane = null, ghost = null, anim = null, endT = 0, keyBuf = '';

    function lit(i){
      var l = letters[i]; l.classList.add('is-lit');
      if (motion()){ l.classList.remove('is-pop'); void l.offsetWidth; l.classList.add('is-pop'); }
    }
    function reset(){ step = 0; letters.forEach(function(l){ l.classList.remove('is-lit', 'is-pop'); }); }
    function hit(i){
      clearTimeout(t);
      if (ghost) return;
      if (i === step){
        lit(i); step++;
        if (step === 5){ step = 0; setTimeout(summon, 220); }
        else t = setTimeout(reset, 4000);
      } else {
        reset();
        if (i === 0){ lit(0); step = 1; t = setTimeout(reset, 4000); }
      }
    }
    letters.forEach(function(l, i){ l.addEventListener('click', function(){ hit(i); }); });
    // keyboard path: type "games" anywhere on the page
    document.addEventListener('keydown', function(e){
      if (e.altKey || e.ctrlKey || e.metaKey || isTyping(document.activeElement) || !e.key || e.key.length !== 1) return;
      keyBuf = (keyBuf + e.key.toLowerCase()).slice(-5);
      if (keyBuf === 'games' && !ghost){ keyBuf = ''; letters.forEach(function(l, i){ setTimeout(function(){ lit(i); }, i * 70); }); setTimeout(summon, 420); }
    });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && ghost) dismiss(false); });

    function summon(){
      if (ghost) return;
      SL.eggFound('games-ghost');
      lane = document.createElement('div'); lane.className = 'gm-ghost-lane';
      ghost = document.createElement('button');
      ghost.type = 'button'; ghost.className = 'gm-ghost';
      ghost.setAttribute('aria-label', 'A high-score ghost! Catch it!');
      ghost.innerHTML = ghostSVG() + '<span class="gm-ghost-tag" aria-hidden="true">HI-SCORE</span>';
      ghost.addEventListener('click', caught);
      lane.appendChild(ghost); hero.appendChild(lane);
      SL.toast('A high-score ghost! Catch it!');
      var W = hero.clientWidth, H = hero.clientHeight, gw = 88;
      if (motion()){
        var ys = [.14, .34, .22].map(function(f){ return Math.round(H * f); }), frames = [], n = 0;
        // three zig-zag passes: left → right, right → left, left → right
        ys.forEach(function(y, p){
          for (var s = 0; s <= 10; s++){
            var f = s / 10, x = p % 2 ? (W + 10) - f * (W + 10 + gw + 10) : -gw - 10 + f * (W + gw + 20);
            frames.push({transform:'translate(' + Math.round(x) + 'px,' + Math.round(y + Math.sin(f * Math.PI * 4) * 22) + 'px) scaleX(' + (p % 2 ? -1 : 1) + ')', offset:(n++) / 32});
          }
        });
        frames[frames.length - 1].offset = 1;
        frames.forEach(function(fr, i){ fr.offset = i / (frames.length - 1); });
        anim = ghost.animate(frames, {duration:9000, easing:'linear', fill:'forwards'});
        anim.onfinish = function(){ dismiss(true); };
      } else {
        ghost.style.transform = 'translate(' + Math.round(W * .62) + 'px,' + Math.round(H * .16) + 'px)';
        ghost.animate([{opacity:0}, {opacity:1}], {duration:300});
        endT = setTimeout(function(){ dismiss(true); }, 12000);
      }
    }
    function dismiss(escaped){
      if (!ghost) return;
      clearTimeout(endT);
      if (anim){ anim.onfinish = null; anim.cancel(); anim = null; }
      if (lane) lane.remove();
      var hadFocus = document.activeElement === ghost;
      ghost = null; lane = null;
      if (escaped) SL.toast('The ghost got away… try again!');
      reset();
      var lead = hero.querySelector('.sf-lead');
      if (hadFocus && lead) lead.focus({preventScroll:true});
    }
    function caught(){
      if (!ghost) return;
      var g = ghost, r = g.getBoundingClientRect();
      SL.confetti(r.left + r.width / 2, r.top + r.height / 3, {count:44, shapes:['■','■','▪','■','✚'], colors:PALETTE, spread:210});
      SL.track('egg_interact', {egg_id:'games-ghost', action:'catch'});
      SL.toast('Gotcha! ★ NEW HIGH SCORE ★');
      if (anim){ anim.pause(); }
      clearTimeout(endT);
      var cur = getComputedStyle(g).transform;
      g.disabled = true;
      var done = function(){ ghost = g; dismiss(false); };
      if (motion()){
        var a = g.animate([{transform:cur + ' scale(1)', opacity:1}, {transform:cur + ' scale(1.8)', opacity:0}], {duration:320, easing:'ease-out', fill:'forwards'});
        a.onfinish = done;
      } else done();
    }
  }

  ready(function(){
    try { initCabinet(); } catch(e){ console.error('games cabinet', e); }
    try { initRunner(); } catch(e){ console.error('trail runner', e); }
    try { initBrowser(); } catch(e){ console.error('games browser', e); }
    try { initGhost(); } catch(e){ console.error('games ghost', e); }
  });
})();
