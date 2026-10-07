/* ============================================================
   EGGS: logo eggs
   1. Jelly logo      — hover/tap jiggles; DRAG the logo and it stretches, then springs back (id 'jelly-logo', fires on drag)
   2. Color pop       — each tap/click (or Enter) = next official color + paint splat; 10 taps in a row = rainbow spin (id 'color-pop')
   3. Maileagle flyby — 5 quick taps (within 2 s) = Scout swoops across the header; tap him = loop-de-loop;
                        a feather floats down that you can "blow" around with the cursor/finger (id 'maileagle-flyby')
   6. (trigger only)  — Morse SOS on the logo (··· − − − ···): short tap < 300 ms, long press ≥ 300 ms.
                        Keyboard: focus the logo and use Space (short/long). Starts Flashlight hunt (eggs-40).
   ============================================================ */
(function(){
  'use strict';
  var SL = window.SL, K = SL && SL._egg; if (!K) return;

  var COLORS = [
    {n:'red',     c:'#E4202D'},
    {n:'orange',  c:'#FF9F1C'},
    {n:'yellow',  c:'#FFE600'},
    {n:'green',   c:'#3DA543'},
    {n:'lt-blue', c:'#5CC8FF'},
    {n:'dk-blue', c:'#2A3FC2'},
    {n:'black',   c:'#12102B'}   /* (purple variant dropped: Direction C is purple-free) */
  ];
  var SRC = function(n){ return 'assets/logo/logo-' + n + '.png'; };
  var SCOUT_SRC = 'assets/mascot/scout-pointing.png';

  K.ready(K.safe('logo', function(){
    var logo = document.getElementById('site-logo');
    var img = document.getElementById('site-logo-img');
    if (!logo || !img) return;

    /* ---------- setup ---------- */
    logo.classList.add('egg-logo');
    img.classList.add('egg-logo-img');
    img.draggable = false;
    logo.addEventListener('dragstart', function(e){ e.preventDefault(); });
    logo.addEventListener('contextmenu', function(e){ if (pressing || Date.now() - lastUp < 600) e.preventDefault(); });
    // paint splats behind the logo image but on top of its white sticker
    var splatHost = img.parentElement || logo;
    K.ensurePositioned(splatHost);
    splatHost.style.isolation = 'isolate';

    var colorIdx = 0;
    COLORS.forEach(function(c, i){ if ((img.getAttribute('src') || '').indexOf('logo-' + c.n + '.') > -1) colorIdx = i; });

    var preloaded = false;
    function preload(){
      if (preloaded) return; preloaded = true;
      COLORS.forEach(function(c){ var i = new Image(); i.src = SRC(c.n); });
      var s = new Image(); s.src = SCOUT_SRC;
    }
    logo.addEventListener('pointerenter', preload);
    logo.addEventListener('focus', preload);

    /* ---------- 1. JELLY ---------- */
    function jiggle(){
      if (!K.motion() || rainbowing || dragging || springing) return;
      img.classList.remove('egg-jiggle'); void img.offsetWidth; img.classList.add('egg-jiggle');
    }
    img.addEventListener('animationend', function(){ img.classList.remove('egg-jiggle'); });
    logo.addEventListener('pointerenter', function(e){ if (e.pointerType === 'mouse') jiggle(); });
    logo.addEventListener('focus', jiggle);

    var down = null, dragging = false, springing = false, suppressClick = false, pressing = false, lastUp = 0;
    var stretch = {tx:0, ty:0, a:0, s:1};
    function applyStretch(f){
      // f = 1 → full stretch; negative f = overshoot (squash the other way)
      var s = 1 + (stretch.s - 1) * f;
      if (s < .6) s = .6;
      img.style.transform = 'translate(' + (stretch.tx*f).toFixed(1) + 'px,' + (stretch.ty*f).toFixed(1) + 'px) rotate(' + stretch.a + 'rad) scale(' + s.toFixed(3) + ',' + (1/Math.sqrt(s)).toFixed(3) + ') rotate(' + (-stretch.a) + 'rad)';
    }
    function springBack(){
      if (!K.motion() || !window.requestAnimationFrame){ img.style.transform = ''; return; }
      springing = true;
      var x = 1, v = 0, k = 320, c = 9;
      var lp = K.loop(function(dt){
        // two sub-steps for stability
        for (var i = 0; i < 2; i++){ var h = dt/2; v += (-k*x - c*v) * h; x += v * h; }
        applyStretch(x);
        if (Math.abs(x) < 0.003 && Math.abs(v) < 0.02){ img.style.transform = ''; springing = false; return false; }
      });
      lp.start();
      // "boing" text sticker
      boing();
    }
    function boing(){
      var r = logo.getBoundingClientRect();
      var b = K.el('span', 'egg-boing'); b.textContent = 'BOING!';
      b.style.left = (r.left + r.width*0.7) + 'px'; b.style.top = (r.top + 4) + 'px';
      K.layer().appendChild(b);
      if (b.animate){
        b.animate([{transform:'scale(.2) rotate(-12deg)', opacity:0},{transform:'scale(1.15) rotate(-6deg)', opacity:1, offset:.3},{transform:'scale(1) rotate(-8deg) translateY(-18px)', opacity:0}], {duration:900, easing:'ease-out'}).onfinish = function(){ b.remove(); };
      } else setTimeout(function(){ b.remove(); }, 900);
    }

    logo.style.touchAction = 'none';
    logo.addEventListener('pointerdown', function(e){
      if (e.button !== 0) return;
      preload();
      down = {x:e.clientX, y:e.clientY, t:Date.now(), id:e.pointerId};
      dragging = false; pressing = true;
      try { logo.setPointerCapture(e.pointerId); } catch(err){}
    });
    logo.addEventListener('pointermove', function(e){
      if (!down || e.pointerId !== down.id) return;
      var dx = e.clientX - down.x, dy = e.clientY - down.y, d = Math.sqrt(dx*dx + dy*dy);
      if (!dragging && d > 10){
        dragging = true; suppressClick = true;
        img.classList.remove('egg-jiggle');
        K.found('jelly-logo');
      }
      if (dragging){
        var lim = 90, k = lim / (lim + d * 0.6);       // rubber-band resistance
        stretch.tx = dx * 0.5 * k; stretch.ty = dy * 0.5 * k;
        stretch.a = Math.atan2(dy, dx);
        stretch.s = 1 + Math.min(d, 260) / 420;
        if (K.motion()) applyStretch(1);
      }
    });
    function endPress(e, cancelled){
      if (!down || (e && e.pointerId !== down.id)) return;
      var dur = Date.now() - down.t;
      pressing = false; lastUp = Date.now();
      if (dragging){ dragging = false; springBack(); }
      else if (!cancelled){ lastPressLong = dur >= 300; sos(dur); }
      down = null;
    }
    logo.addEventListener('pointerup', function(e){ endPress(e, false); });
    logo.addEventListener('pointercancel', function(e){ endPress(e, true); });

    /* ---------- click (tap / Enter) → color pop + flyby counter ---------- */
    var lastPressLong = false;
    logo.addEventListener('click', function(e){
      e.preventDefault();
      if (suppressClick){ suppressClick = false; return; }
      if (lastPressLong){ lastPressLong = false; return; }  // long presses are Morse dashes, not taps
      tap();
    });

    /* ---------- Space = Morse key when the logo is focused ---------- */
    var spaceDown = 0;
    logo.addEventListener('keydown', function(e){
      if (e.key === ' ' || e.code === 'Space'){
        e.preventDefault();
        if (!e.repeat && !spaceDown) spaceDown = Date.now();
      }
    });
    logo.addEventListener('keyup', function(e){
      if ((e.key === ' ' || e.code === 'Space') && spaceDown){
        e.preventDefault();
        var dur = Date.now() - spaceDown; spaceDown = 0;
        sos(dur);
        jiggle();
      }
    });

    /* ---------- 2. COLOR POP ---------- */
    var tapTimes = [], streak = 0, lastTap = 0, rainbowing = false;
    function tap(){
      var now = Date.now();
      streak = (now - lastTap < 1300) ? streak + 1 : 1;
      lastTap = now;
      if (!rainbowing){
        nextColor();
        jiggle();
      }
      if (streak >= 10){ streak = 0; rainbow(); }
      // flyby: 5 taps within 2 s
      tapTimes.push(now);
      tapTimes = tapTimes.filter(function(t){ return now - t < 2000; });
      if (tapTimes.length >= 5){ tapTimes = []; flyby(); }
    }
    function setColor(i){
      colorIdx = (i + COLORS.length) % COLORS.length;
      img.src = SRC(COLORS[colorIdx].n);
    }
    function nextColor(){
      setColor(colorIdx + 1);
      splat(COLORS[colorIdx].c);
    }
    var SPLAT_PATH = 'M50 8c6 0 7 12 13 13s12-9 17-4-4 12 0 17 15 1 15 9-12 7-12 13 10 12 5 17-12-3-17 1-4 15-11 15-8-11-14-11-11 9-17 4 2-12-3-17-14 1-15-6 9-8 9-14S2 41 5 35s13 1 16-4-5-14 1-18 10 6 15 4 7-9 13-9z';
    function splat(color){
      var s = K.el('span', 'egg-splat', {'aria-hidden':'true'});
      var rot = Math.floor(Math.random()*360);
      s.innerHTML = '<svg viewBox="0 0 100 100" width="100%" height="100%"><path d="' + SPLAT_PATH + '" fill="' + color + '" stroke="#12102B" stroke-width="2.5" transform="rotate(' + rot + ' 50 50)"/>' +
        '<circle cx="' + (8 + Math.random()*10) + '" cy="' + (10 + Math.random()*15) + '" r="4" fill="' + color + '"/><circle cx="' + (85 + Math.random()*8) + '" cy="' + (80 + Math.random()*10) + '" r="5" fill="' + color + '"/></svg>';
      s.style.left = (15 + Math.random()*60) + '%';
      splatHost.appendChild(s);
      if (!K.motion() || !s.animate){
        s.style.opacity = '.5'; setTimeout(function(){ s.remove(); }, 400); return;
      }
      s.animate([
        {transform:'translate(-50%,-50%) scale(.2)', opacity:.95},
        {transform:'translate(-50%,-50%) scale(1.15)', opacity:.9, offset:.35},
        {transform:'translate(-50%,-50%) scale(1.25)', opacity:0}
      ], {duration:700, easing:'cubic-bezier(.2,.9,.3,1)'}).onfinish = function(){ s.remove(); };
    }
    function rainbow(){
      K.found('color-pop');
      K.say('Full rainbow!');
      rainbowing = true;
      img.classList.remove('egg-jiggle');
      var i = 0, steps = COLORS.length + 1;
      var iv = setInterval(function(){
        setColor(colorIdx + 1);
        splat(COLORS[colorIdx].c);
        if (++i >= steps){ clearInterval(iv); }
      }, K.motion() ? 140 : 220);
      var done = function(){ rainbowing = false; setColor(0); };
      if (K.motion() && img.animate){
        // spin around the vertical axis so the wide logo stays on its sticker (and away from the ad above)
        var a = img.animate([
          {transform:'perspective(700px) rotateY(0deg) scale(1)'},
          {transform:'perspective(700px) rotateY(380deg) scale(1.08)', offset:.55},
          {transform:'perspective(700px) rotateY(720deg) scale(1)'}
        ], {duration:1400, easing:'cubic-bezier(.45,0,.3,1)'});
        a.onfinish = done;
        var r = logo.getBoundingClientRect();
        setTimeout(function(){ SL.confetti(r.left + r.width/2, r.top + r.height/2, {count:20, spread:120}); }, 900);
      } else setTimeout(done, steps * 220 + 50);
    }

    /* ---------- 6. SOS detector (forgiving) ---------- */
    var seq = '', lastPress = 0;
    function sos(dur){
      var now = Date.now();
      if (now - lastPress > 2200) seq = '';
      lastPress = now;
      seq += dur < 300 ? 'S' : 'L';
      if (seq.length > 24) seq = seq.slice(-24);
      // ···−−−··· : accept 2+ dots, 2–4 dashes, then 2+ dots (kids miscount)
      if (/S{2,}L{2,4}S{2}$/.test(seq)){
        seq = '';
        if (K.flashlight && K.flashlight.start){ tapTimes = []; K.flashlight.start(); }
      }
    }

    /* ---------- 3. MAILEAGLE FLYBY ---------- */
    var flying = null;
    function flyby(){
      if (flying) return;
      var header = document.getElementById('site-header');
      var hr = header ? header.getBoundingClientRect() : K.rect(0, 0, K.vw(), 120);
      var top = Math.max(0, hr.top, K.ceiling()), bot = Math.max(top + 110, Math.min(hr.bottom, K.vh() * 0.5));
      K.found('maileagle-flyby');
      K.say('Scout the Maileagle swoops by!');

      var wrap = K.el('div', 'egg-scout');
      var btn = K.el('button', 'egg-scout-btn', {type:'button', 'aria-label':'Scout the Maileagle. Tap for a loop-de-loop!', tabindex:'-1'});
      btn.innerHTML = '<span class="egg-scout-lines" aria-hidden="true"></span><img alt="" src="' + SCOUT_SRC + '" draggable="false">';
      wrap.appendChild(btn);
      document.body.appendChild(wrap);
      var vw = K.vw(), W = 140;
      var feathers = 0;
      var off;
      function finish(){
        if (!flying) return;
        flying = null; off && off();
        wrap.remove();
      }
      off = K.onEsc(function(){ off = null; finish(); clearFeathers(); });

      if (!K.motion() || !wrap.animate){
        // gentle version: fade in at the header, drop a feather, fade out
        wrap.classList.add('egg-scout-still');
        wrap.style.transform = 'translate(' + (vw - W - 40) + 'px,' + (top + 10) + 'px)';
        flying = {anim:null};
        setTimeout(function(){ var r = btn.getBoundingClientRect(); dropFeather(r.left + r.width/2, r.top + r.height*0.7); }, 600);
        setTimeout(function(){ wrap.classList.add('egg-fade-out'); setTimeout(finish, 450); }, 2200);
        btn.addEventListener('click', function(){ K.sparkle(K.pointer.x, K.pointer.y); });
        return;
      }

      // path = top-left corner of the 140px-tall mascot; stays below the ceiling (ads / pinned bars)
      var p0 = {x:-W-30, y:bot - 100}, p1 = {x:vw*0.3, y:bot + 10}, p2 = {x:vw*0.62, y:top - 30}, p3 = {x:vw + 40, y:top + 4};
      var frames = K.bezFrames(p0, p1, p2, p3, 30, {rotScale:0.35});
      var anim = wrap.animate(frames, {duration:3600, easing:'linear', fill:'forwards'});
      flying = {anim:anim};
      anim.onfinish = finish;

      // drop a feather on the way
      setTimeout(function(){ if (!flying) return; var r = btn.getBoundingClientRect(); dropFeather(r.left + r.width*0.4, r.top + r.height*0.75); }, 1500);

      var looping = false;
      btn.addEventListener('click', function(){
        if (looping || !flying) return;
        looping = true;
        anim.pause();
        var l = btn.animate([{transform:'rotate(0deg)'}, {transform:'rotate(-360deg)'}], {duration:1000, easing:'cubic-bezier(.5,0,.5,1)'});
        l.onfinish = function(){
          looping = false;
          if (flying) anim.play();
        };
        setTimeout(function(){ var r = btn.getBoundingClientRect(); K.sparkle(r.left + r.width/2, r.top + r.height/2, {count:10}); if (feathers < 3){ feathers++; dropFeather(r.left + r.width/2, r.top + r.height/2); } }, 500);
      });
    }

    /* ---------- feather: floats down, gets "blown" away from the pointer ---------- */
    var featherList = [], featherLoop = null;
    var FEATHER_SVG = '<svg viewBox="0 0 30 80" width="30" height="80" aria-hidden="true"><path d="M15 78 C14 60 15 30 16 4" stroke="#12102B" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
      '<path d="M16 6 C26 16 28 34 24 52 C21 60 18 64 15 66 C11 60 5 50 5 36 C5 22 9 12 16 6Z" fill="#FFFFFF" stroke="#12102B" stroke-width="2.4"/>' +
      '<path d="M15 20 L23 16 M15 30 L25 26 M15 40 L24 37 M15 50 L22 48 M15 25 L7 21 M15 35 L6 32 M15 45 L7 44" stroke="#8B5A2B" stroke-width="1.6" stroke-linecap="round"/></svg>';
    function dropFeather(x, y){
      var f = K.el('div', 'egg-feather', {'aria-hidden':'true'});
      f.innerHTML = FEATHER_SVG;
      document.body.appendChild(f);
      var F = {el:f, x:x, y:y, vx:(Math.random()-.5)*40, vy:10, ph:Math.random()*6, born:Date.now(), life:9000, gone:false};
      featherList.push(F);
      place(F, 0);
      if (!K.motion()){
        f.classList.add('egg-feather-still');
        setTimeout(function(){ killFeather(F); }, 3500);
        return;
      }
      if (!featherLoop) featherLoop = K.loop(stepFeathers);
      featherLoop.start();
    }
    function place(F, rot){ F.el.style.transform = 'translate(' + (F.x - 15).toFixed(1) + 'px,' + (F.y - 40).toFixed(1) + 'px) rotate(' + rot.toFixed(1) + 'deg)'; }
    function killFeather(F){
      if (F.gone) return; F.gone = true;
      F.el.classList.add('egg-fade-out');
      setTimeout(function(){ F.el.remove(); }, 500);
      featherList = featherList.filter(function(o){ return o !== F; });
    }
    function clearFeathers(){ featherList.slice().forEach(killFeather); featherLoop && featherLoop.stop(); }
    function stepFeathers(dt){
      var now = Date.now(), vw = K.vw(), vh = K.vh(), t = now / 1000;
      featherList.slice().forEach(function(F){
        if (now - F.born > F.life){ killFeather(F); return; }
        // gravity + sway
        F.vy += 26 * dt;
        F.vx += Math.sin(t * 2.2 + F.ph) * 60 * dt;
        // "blow": push away from the pointer (only if the pointer moved recently)
        var px = K.pointer.x, py = K.pointer.y;
        if (now - K.pointer.t < 1500){
          var dx = F.x - px, dy = F.y - py, d = Math.sqrt(dx*dx + dy*dy) || 1;
          if (d < 140){ var force = (1 - d/140) * 1700; F.vx += dx/d * force * dt; F.vy += dy/d * force * dt; }
        }
        // air drag
        F.vx *= (1 - 1.8*dt); F.vy *= (1 - 1.4*dt);
        if (F.vy > 70) F.vy = 70;
        F.x += F.vx * dt; F.y += F.vy * dt;
        // soft walls
        if (F.x < 15){ F.x = 15; F.vx = Math.abs(F.vx)*.5; }
        if (F.x > vw - 15){ F.x = vw - 15; F.vx = -Math.abs(F.vx)*.5; }
        if (F.y < 30){ F.y = 30; F.vy = Math.abs(F.vy)*.5; }
        if (F.y > vh - 30){ F.y = vh - 30; F.vy = 0; F.vx *= .9; }
        place(F, Math.sin(t * 2.2 + F.ph) * 28 + F.vx * .15);
      });
      if (!featherList.length) return false;
    }
    K.onMotion(function(ok){
      if (!featherLoop) return;
      if (ok && featherList.length) featherLoop.start(); else featherLoop.stop();
    });
  }));
})();
