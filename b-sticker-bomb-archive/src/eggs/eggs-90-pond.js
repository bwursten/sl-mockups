/* ============================================================
   EGGS: 13. Stone skipping (id 'stone-skip')
   On the pond in the Outdoors shelf ([data-egg-anchor="pond"]): swipe/flick sideways across the
   water to skip a stone. Faster + flatter flicks = more skips. Ripples at every bounce and a
   counter ("4 skips!"); your best is remembered in SL.store. Keyboard/tap alternative: the small
   "Skip a stone" button in the corner of the pond throws a random stone.
   ============================================================ */
(function(){
  'use strict';
  var SL = window.SL, K = SL && SL._egg; if (!K) return;

  K.idle(K.safe('pond', function(){
    var pond = document.querySelector('[data-egg-anchor="pond"]');
    if (!pond) return;
    K.ensurePositioned(pond);
    // the shell marks the pond wrapper aria-hidden (decoration); our controls must be reachable,
    // so move aria-hidden down onto the purely decorative children instead.
    var hid = pond.closest('[aria-hidden="true"]');
    if (hid){
      hid.removeAttribute('aria-hidden');
      Array.prototype.forEach.call(hid.children, function(c){ if (c !== pond && !c.contains(pond)) c.setAttribute('aria-hidden', 'true'); });
    }
    Array.prototype.forEach.call(pond.children, function(c){ c.setAttribute('aria-hidden', 'true'); });

    var ui = K.el('div', 'egg-pond');
    ui.innerHTML =
      '<div class="egg-pond-water" aria-hidden="true"></div>' +
      '<p class="egg-pond-count" aria-live="polite"></p>' +
      '<button type="button" class="egg-pond-btn">Skip a stone</button>';
    pond.appendChild(ui);
    var water = ui.querySelector('.egg-pond-water'), count = ui.querySelector('.egg-pond-count'), btn = ui.querySelector('.egg-pond-btn');
    var best = SL.store.get('egg-stone-best', 0);
    var busy = false;

    var down = null;
    water.addEventListener('pointerdown', function(e){
      if (e.button !== 0) return;
      down = {id:e.pointerId, samples:[{x:e.clientX, y:e.clientY, t:performance.now()}]};
      try { water.setPointerCapture(e.pointerId); } catch(err){}
    });
    water.addEventListener('pointermove', function(e){
      if (!down || e.pointerId !== down.id) return;
      var now = performance.now();
      down.samples.push({x:e.clientX, y:e.clientY, t:now});
      while (down.samples.length > 2 && now - down.samples[0].t > 110) down.samples.shift();
    });
    function up(e){
      if (!down || e.pointerId !== down.id) return;
      var s = down.samples; down = null;
      var a = s[0], b = s[s.length - 1];
      var dist = Math.hypot(b.x - a.x, b.y - a.y);
      if (dist < 12) return;   // not a flick
      var dt = Math.max(16, b.t - a.t);
      var r = water.getBoundingClientRect();
      skip((b.x - a.x) / dt, (b.y - a.y) / dt, a.x - r.left, a.y - r.top);
    }
    water.addEventListener('pointerup', up);
    water.addEventListener('pointercancel', function(){ down = null; });

    btn.addEventListener('click', function(){
      var dir = Math.random() < .5 ? 1 : -1, W = water.clientWidth, H = water.clientHeight;
      skip(dir * K.rnd(0.8, 3.6), K.rnd(-0.3, 0.3), dir > 0 ? W * 0.12 : W * 0.88, H * K.rnd(0.35, 0.65));
    });

    function skip(vx, vy, sx, sy){
      if (busy) return;
      busy = true;
      K.foundOnce('stone-skip');
      var W = water.clientWidth, H = water.clientHeight;
      var speed = Math.hypot(vx, vy), flat = Math.abs(vx) / (speed || 1);
      var n = speed < 0.3 ? 0 : Math.round(K.clamp(speed * 2.5 * flat * flat, 1, 12));
      var dir = vx >= 0 ? 1 : -1;
      var startX = dir > 0 ? Math.min(sx, W * 0.3) : Math.max(sx, W * 0.7);
      startX = K.clamp(startX, 12, W - 12);
      var y0 = K.clamp(sy, 18, H - 16);
      var drift = K.clamp((vy / (speed || 1)) * 30, -H * 0.3, H * 0.3);
      // touch points: geometric shrinking hops toward the far edge
      var span = dir > 0 ? (W - 12 - startX) : (startX - 12);
      var pts = [{x:startX, y:y0}];
      if (n > 0){
        var r = 0.72, seg0 = span * (1 - r) / (1 - Math.pow(r, n)), x = startX, seg = seg0;
        for (var i = 1; i <= n; i++){ x += dir * seg; pts.push({x:x, y:K.clamp(y0 + drift * (i / n), 14, H - 12)}); seg *= r; }
      }
      var msg = n === 0 ? 'Plunk! Flick faster.' : (n === 1 ? '1 skip!' : n + ' skips!');
      if (n > best){ best = n; SL.store.set('egg-stone-best', best); if (n > 1) msg += ' New best!'; }
      else if (best && n) msg += ' (best ' + best + ')';

      if (!K.motion()){
        pts.forEach(function(p, i){ ripple(p.x, p.y, i === pts.length - 1, 0); });
        count.textContent = msg;
        setTimeout(function(){ busy = false; }, 500);
        return;
      }
      var stone = K.el('span', 'egg-stone', {'aria-hidden':'true'});
      ui.appendChild(stone);
      // timeline: drop in → hops → sink
      var frames = [], times = [], T = 0, drop = 220;
      frames.push({t:0, x:startX - dir * 30, y:y0 - 40, s:1.2});
      T += drop; frames.push({t:T, x:startX, y:y0, s:1}); times.push(T);
      var prevSeg = null;
      for (var j = 1; j < pts.length; j++){
        var A = pts[j-1], B = pts[j], seg = Math.abs(B.x - A.x), dur = 120 + Math.sqrt(seg) * 26, arc = 6 + seg * 0.28;
        for (var k = 1; k <= 6; k++){
          var t = k / 6;
          frames.push({t:T + dur * t, x:A.x + (B.x - A.x) * t, y:A.y + (B.y - A.y) * t - Math.sin(t * Math.PI) * arc, s:1 + Math.sin(t * Math.PI) * 0.15});
        }
        T += dur; times.push(T);
      }
      var end = pts[pts.length - 1];
      frames.push({t:T + 260, x:end.x + dir * 4, y:end.y + 3, s:0.2, o:0});
      T += 260;
      var kf = frames.map(function(f){
        return {offset:f.t / T, transform:'translate(' + (f.x - 7).toFixed(1) + 'px,' + (f.y - 5).toFixed(1) + 'px) scale(' + f.s.toFixed(2) + ')', opacity:f.o == null ? 1 : f.o};
      });
      stone.animate(kf, {duration:T, easing:'linear', fill:'forwards'}).onfinish = function(){ stone.remove(); };
      times.forEach(function(t, i){
        setTimeout(function(){ ripple(pts[i].x, pts[i].y, i === pts.length - 1, i); }, t);
      });
      setTimeout(function(){
        count.textContent = msg;
        count.classList.remove('pop'); void count.offsetWidth; count.classList.add('pop');
        if (n >= 6){ var r = water.getBoundingClientRect(); SL.confetti(r.left + end.x, r.top + end.y, {count:12, spread:70, shapes:['●','✦']}); }
        busy = false;
      }, T);
    }

    function ripple(x, y, last, i){
      var rp = K.el('span', 'egg-ripple' + (last ? ' is-last' : ''), {'aria-hidden':'true'});
      rp.style.left = x + 'px'; rp.style.top = y + 'px';
      ui.appendChild(rp);
      if (last && K.motion()){
        var sp = K.el('span', 'egg-splash', {'aria-hidden':'true'}); sp.style.left = x + 'px'; sp.style.top = y + 'px';
        ui.appendChild(sp); setTimeout(function(){ sp.remove(); }, 700);
      }
      setTimeout(function(){ rp.remove(); }, K.motion() ? 1300 : 1600);
    }
  }));
})();
