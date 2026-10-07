/* ============================================================
   EGGS: hidden critters (max 2 visible at once — we own exactly these two)
   7. Ladybug chase (id 'ladybug') — a ladybug walks along the top edge of a hero card or widget
      that's on screen (never near ads). Tap/Enter → it flies to another perch. Catch it 3 times →
      victory spiral, flies off screen, comes back later. Positions are random per visit.
   8. Squirrel stash (id 'squirrel') — every so often a squirrel peeks out (tail first) behind the
      "Outdoors & Gear" nav item. Tap it → it grabs an acorn and dashes off, dropping 3 acorns below
      the header. Tap the acorns to toss them back — it pops up and catches each one with a flip.
   ============================================================ */
(function(){
  'use strict';
  var SL = window.SL, K = SL && SL._egg; if (!K) return;

  /* =========================================================
     LADYBUG
     ========================================================= */
  var LADYBUG_SVG = '<svg viewBox="0 0 40 34" width="34" height="29" aria-hidden="true">' +
    '<g class="egg-lb-wings"><path class="egg-lb-wing l" d="M20 10 C8 2 -2 12 4 20 C8 24 16 20 20 14Z" fill="#DDEFFF" stroke="#12102B" stroke-width="1.6" opacity=".9"/>' +
    '<path class="egg-lb-wing r" d="M20 10 C32 2 42 12 36 20 C32 24 24 20 20 14Z" fill="#DDEFFF" stroke="#12102B" stroke-width="1.6" opacity=".9"/></g>' +
    '<path d="M6 30 L2 33 M12 32 L10 34 M34 30 L38 33 M28 32 L30 34" stroke="#12102B" stroke-width="2" stroke-linecap="round"/>' +
    '<circle cx="31" cy="16" r="7" fill="#12102B"/><circle cx="33" cy="14" r="1.6" fill="#fff"/>' +
    '<path d="M35 10 C37 6 39 5 40 5 M33 9 C34 5 35 3 37 2" stroke="#12102B" stroke-width="1.6" fill="none" stroke-linecap="round"/>' +
    '<path d="M4 22 C4 10 14 6 21 6 C28 6 32 12 32 22 C32 30 26 32 18 32 C10 32 4 30 4 22Z" fill="#FF5A1F" stroke="#12102B" stroke-width="2.6"/>' +
    '<path d="M18 7 L18 32" stroke="#12102B" stroke-width="2"/>' +
    '<circle cx="11" cy="16" r="3" fill="#12102B"/><circle cx="25" cy="15" r="3" fill="#12102B"/><circle cx="10" cy="25" r="2.6" fill="#12102B"/><circle cx="25" cy="25" r="2.6" fill="#12102B"/>' +
    '</svg>';

  K.idle(K.safe('ladybug', function(){
    var bug = null, perchEl = null, catches = 0, busy = false;

    function headerBottom(){ return K.topInset(); }
    function findPerch(exclude){
      var hb = headerBottom(), vh = K.vh();
      var list = SL.$$('.hero-card, .widget').filter(function(el){
        if (el === exclude) return false;
        var r = el.getBoundingClientRect();
        if (r.width < 140 || r.top < hb + 30 || r.top > vh - 90) return false;
        if (el.closest('.ad-slot')) return false;
        return true;
      });
      list = SL.shuffle(list);
      for (var i = 0; i < list.length; i++){
        var r = list[i].getBoundingClientRect();
        var fx = 0.15 + Math.random() * 0.6;
        var x = r.left + r.width * fx, y = r.top;
        if (K.nearAd(K.rect(x - 60, y - 60, 120, 120), 100)) continue;
        return {el:list[i], x:x + K.sx(), y:y + K.sy(), w:r.width};
      }
      return null;
    }
    function make(){
      bug = K.el('button', 'egg-ladybug', {type:'button', 'aria-label':'A ladybug! Try to catch it'});
      bug.innerHTML = '<span class="egg-lb-walker"><span class="egg-lb-body">' + LADYBUG_SVG + '</span></span>';
      bug.addEventListener('click', onTap);
      document.body.appendChild(bug);
    }
    function placeAt(p){
      perchEl = p.el;
      bug.style.left = (p.x - 22) + 'px';
      bug.style.top = (p.y - 36) + 'px';     // sits on the top edge
      // walking range limited by perch width
      bug.style.setProperty('--walk', Math.min(60, p.w * 0.18).toFixed(0) + 'px');
    }
    function appear(){
      if (bug || !K.critter.claim('ladybug')) return schedule(15000, 30000);
      var p = findPerch(null);
      if (!p){ K.critter.release('ladybug'); return schedule(8000, 15000); }
      make(); placeAt(p);
      bug.classList.add('egg-fade-in');
      catches = 0;
    }
    var timer = 0;
    function schedule(a, b){ clearTimeout(timer); timer = setTimeout(appear, K.rnd(a, b)); }

    function onTap(){
      if (busy || !bug) return;
      catches++;
      if (catches === 1) K.found('ladybug');
      var r = bug.getBoundingClientRect();
      K.sparkle(r.left + r.width/2, r.top + r.height/2, {count:6, spread:22});
      if (catches >= 3){ victory(); return; }
      K.say(catches === 1 ? 'You caught the ladybug once! It flew away.' : 'Caught it twice! One more time!');
      var p = findPerch(perchEl);
      if (!p){ victory(); return; }
      flyTo(p);
    }
    function flyTo(p){
      var oldX = parseFloat(bug.style.left), oldY = parseFloat(bug.style.top);
      placeAt(p);
      var nx = parseFloat(bug.style.left), ny = parseFloat(bug.style.top);
      var dx = oldX - nx, dy = oldY - ny;
      if (!K.motion() || !bug.animate){
        bug.classList.remove('egg-fade-in'); void bug.offsetWidth; bug.classList.add('egg-fade-in');
        return;
      }
      busy = true; bug.classList.add('is-flying');
      var p0 = {x:dx, y:dy}, p3 = {x:0, y:0};
      var lift = -Math.min(220, 80 + Math.abs(dx) * 0.25);
      var p1 = {x:dx * 0.7, y:Math.min(dy, 0) + lift}, p2 = {x:dx * 0.2, y:lift * 0.6};
      var dist = Math.hypot(dx, dy);
      var a = bug.animate(K.bezFrames(p0, p1, p2, p3, 24, {rotScale:0.4}), {duration:Math.min(1600, 600 + dist * 0.8), easing:'ease-in-out'});
      a.onfinish = function(){ busy = false; bug && bug.classList.remove('is-flying'); };
    }
    function victory(){
      busy = true;
      SL.toast && SL.toast('🐞 You caught the ladybug 3 times!');
      K.say('You caught the ladybug three times! It did a victory spiral and flew away.');
      var r = bug.getBoundingClientRect();
      SL.confetti(r.left + r.width/2, r.top, {count:14, spread:90, shapes:['●','★']});
      var done = function(){ if (bug){ bug.remove(); bug = null; } busy = false; K.critter.release('ladybug'); schedule(60000, 120000); };
      if (!K.motion() || !bug.animate){ bug.classList.add('egg-fade-out'); setTimeout(done, 450); return; }
      bug.classList.add('is-flying');
      var frames = [], N = 36, up = r.top + 80;
      for (var i = 0; i <= N; i++){
        var t = i / N, ang = t * Math.PI * 5, rad = 10 + t * 70;
        frames.push({transform:'translate(' + (Math.sin(ang) * rad).toFixed(1) + 'px,' + (-(1 - Math.cos(ang)) * rad * 0.6 - t * t * (up + 200)).toFixed(1) + 'px) rotate(' + (-ang * 57.3).toFixed(0) + 'deg)'});
      }
      bug.animate(frames, {duration:2000, easing:'ease-in', fill:'forwards'}).onfinish = done;
    }

    // if the bug's perch scrolls far away, quietly hop to a visible perch
    setInterval(function(){
      if (!bug || busy) return;
      var r = bug.getBoundingClientRect();
      if (!K.inView(r, 0)){
        var p = findPerch(perchEl);
        if (p){ placeAt(p); bug.classList.remove('egg-fade-in'); void bug.offsetWidth; bug.classList.add('egg-fade-in'); }
      }
    }, 9000);
    window.addEventListener('resize', function(){ if (bug && !busy){ var p = findPerch(null); if (p) placeAt(p); } });

    schedule(5000, 12000);
  }));

  /* =========================================================
     SQUIRREL
     ========================================================= */
  var SQUIRREL_SVG = '<svg viewBox="0 0 80 72" width="80" height="72" aria-hidden="true">' +
    '<path class="egg-sq-tail" d="M30 66 C8 66 2 48 6 32 C10 14 26 4 38 10 C46 14 44 24 36 24 C28 24 24 32 26 40 C28 50 36 54 36 62Z" fill="#C8742F" stroke="#12102B" stroke-width="3" stroke-linejoin="round"/>' +
    '<path d="M16 30 C18 22 24 16 32 15" stroke="#E8A65E" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    '<path d="M34 70 C30 58 32 44 42 40 C52 36 62 42 62 54 C62 64 56 70 48 70Z" fill="#B5652A" stroke="#12102B" stroke-width="3" stroke-linejoin="round"/>' +
    '<path d="M44 52 C46 60 50 64 56 64" stroke="#F3D3A3" stroke-width="5" fill="none" stroke-linecap="round"/>' +
    '<path d="M46 42 C42 30 48 20 58 20 C68 20 74 28 72 36 C70 44 60 46 52 46Z" fill="#B5652A" stroke="#12102B" stroke-width="3" stroke-linejoin="round"/>' +
    '<path d="M52 22 L50 12 L58 19Z" fill="#B5652A" stroke="#12102B" stroke-width="2.5" stroke-linejoin="round"/>' +
    '<circle cx="62" cy="29" r="3.2" fill="#12102B"/><circle cx="63" cy="28" r="1" fill="#fff"/>' +
    '<circle cx="72" cy="35" r="2.4" fill="#12102B"/>' +
    '<path d="M58 50 C62 48 66 48 68 50" stroke="#12102B" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    '<g class="egg-sq-acorn"><ellipse cx="67" cy="54" rx="5" ry="6" fill="#C8742F" stroke="#12102B" stroke-width="2"/><path d="M61 51 C62 46 72 46 73 51Z" fill="#7A4A22" stroke="#12102B" stroke-width="2"/></g>' +
    '</svg>';
  var ACORN_SVG = '<svg viewBox="0 0 30 34" width="26" height="30" aria-hidden="true"><path d="M15 2 L15 7" stroke="#12102B" stroke-width="2.5" stroke-linecap="round"/>' +
    '<path d="M5 16 C5 26 10 32 15 32 C20 32 25 26 25 16Z" fill="#E09A4A" stroke="#12102B" stroke-width="2.6" stroke-linejoin="round"/>' +
    '<path d="M3 15 C3 8 9 6 15 6 C21 6 27 8 27 15Z" fill="#7A4A22" stroke="#12102B" stroke-width="2.6" stroke-linejoin="round"/>' +
    '<path d="M7 11 L11 13 M13 9 L17 11 M19 10 L23 12" stroke="#5A3418" stroke-width="1.5"/><path d="M9 20 C9 24 11 27 13 28" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" opacity=".7"/></svg>';

  K.idle(K.safe('squirrel', function(){
    var anchor = document.querySelector('[data-egg-anchor="squirrel"]');
    if (!anchor) return;

    var win = null, sq = null, dir = 'up', state = 'hidden', hideT = 0, acorns = [], caught = 0, peekT = 0;

    function anchorRect(){
      if (!anchor.getClientRects().length) return null;
      var r = anchor.getBoundingClientRect();
      // the anchor may be a 0×0 span; use its parent nav item for the edge
      var item = anchor.closest('li, a, button') || anchor.parentElement;
      var ir = item ? item.getBoundingClientRect() : r;
      if (!ir.width && !ir.height) return null;
      return {x: r.width ? r.left + r.width/2 : (r.left || ir.right - 20), top: ir.top, bottom: ir.bottom};
    }
    function build(){
      win = K.el('div', 'egg-sq-win');
      sq = K.el('button', 'egg-sq', {type:'button', 'aria-label':'A squirrel is peeking out! Tap it'});
      sq.innerHTML = '<span class="egg-sq-flip">' + SQUIRREL_SVG + '</span>';
      win.appendChild(sq);
      document.body.appendChild(win);
      sq.addEventListener('click', onTap);
    }
    function position(){
      var a = anchorRect();
      if (!a || !win) return false;
      var W = 80, H = 72, vh = K.vh();
      var upOK = a.top - H > 0 && !K.nearAd(K.rect(a.x - W/2, a.top - H, W, H), 20);
      var downOK = a.bottom + H < vh && !K.nearAd(K.rect(a.x - W/2, a.bottom, W, H), 20);
      if (state === 'hidden') dir = upOK ? 'up' : (downOK ? 'down' : null);
      if (!dir || a.top > vh || a.bottom < 0) return false;
      win.classList.toggle('is-down', dir === 'down');
      win.style.left = (a.x - W/2) + 'px';
      win.style.top = (dir === 'up' ? a.top + 6 - H : a.bottom - 6) + 'px';
      return true;
    }
    function schedulePeek(a, b){ clearTimeout(peekT); peekT = setTimeout(peek, K.rnd(a, b)); }
    function peek(){
      if (state !== 'hidden' || document.hidden) return schedulePeek(20000, 40000);
      if (!win) build();
      if (!position() || !K.critter.claim('squirrel')){ return schedulePeek(15000, 30000); }
      state = 'peek';
      win.classList.remove('is-tail', 'is-up', 'is-gone');
      win.classList.add('is-shown');
      if (K.motion()){
        win.classList.add('is-tail');                         // tail first…
        setTimeout(function(){ if (state === 'peek') win.classList.add('is-up'); }, 900);   // …then the face
      } else win.classList.add('is-up');
      sq.classList.add('has-acorn');
      clearTimeout(hideT);
      hideT = setTimeout(function(){ if (state === 'peek') retreat(); }, 6000);
    }
    function retreat(){
      state = 'hidden';
      if (win){ win.classList.remove('is-up', 'is-tail'); setTimeout(function(){ if (state === 'hidden' && win) win.classList.remove('is-shown'); }, 450); }
      K.critter.release('squirrel');
      schedulePeek(25000, 45000);
    }
    window.addEventListener('scroll', function(){ if (state !== 'hidden' && win && !position()) { if (state === 'peek') retreat(); } }, {passive:true});

    function onTap(){
      if (state !== 'peek') return;
      clearTimeout(hideT);
      K.found('squirrel');
      K.say('The squirrel grabbed an acorn and dashed off, dropping three acorns! Tap the acorns to toss them back.');
      state = 'dash';
      caught = 0;
      var r = sq.getBoundingClientRect();
      win.classList.remove('is-up', 'is-tail', 'is-shown');
      sq.classList.remove('has-acorn');
      // free-running squirrel dashing to the right
      var runner = K.el('div', 'egg-sq-runner', {'aria-hidden':'true'});
      runner.innerHTML = SQUIRREL_SVG;
      runner.style.left = r.left + 'px'; runner.style.top = r.top + 'px';
      document.body.appendChild(runner);
      var vw = K.vw(), dist = vw - r.left + 100;
      var hb = (function(){ var h = document.getElementById('site-header'); return h ? h.getBoundingClientRect().bottom : r.bottom; })();
      var restY = Math.max(r.bottom, hb) + 26;
      if (!K.motion() || !runner.animate){
        runner.classList.add('egg-fade-out'); setTimeout(function(){ runner.remove(); }, 450);
        for (var i = 0; i < 3; i++) dropAcorn(K.clamp(r.left + 40 + i * 70, 20, vw - 40), restY + i * 8, restY + i * 8);
        state = 'game';
        return;
      }
      var frames = [], N = 16;
      for (var i = 0; i <= N; i++){
        var t = i / N;
        frames.push({transform:'translate(' + (t * dist).toFixed(0) + 'px,' + (-Math.abs(Math.sin(t * Math.PI * 6)) * 18 + t * (restY - r.top - 40)).toFixed(0) + 'px)'});
      }
      runner.animate(frames, {duration:1500, easing:'ease-in'}).onfinish = function(){ runner.remove(); };
      [0.18, 0.36, 0.54].forEach(function(t, i){
        setTimeout(function(){
          var x = r.left + t * dist + 40, y = r.top + 30 + t * (restY - r.top - 40);
          dropAcorn(K.clamp(x, 20, vw - 50), y, restY + (i % 2) * 14);
        }, 1500 * t);
      });
      state = 'game';
      setTimeout(function(){ if (state === 'game') K.critter.release('squirrel'); }, 1600);
    }

    function dropAcorn(x, fromY, restY){
      var b = K.el('button', 'egg-acorn', {type:'button', 'aria-label':'Acorn. Toss it back to the squirrel'});
      b.innerHTML = ACORN_SVG;
      b.style.left = (x + K.sx() - 22) + 'px';
      b.style.top = (restY + K.sy() - 22) + 'px';
      document.body.appendChild(b);
      acorns.push(b);
      b.addEventListener('click', function(){ toss(b); });
      if (K.motion() && b.animate){
        b.animate([
          {transform:'translateY(' + (fromY - restY) + 'px) rotate(0deg)'},
          {transform:'translateY(0) rotate(160deg)', offset:.55, easing:'ease-out'},
          {transform:'translateY(-16px) rotate(200deg)', offset:.75, easing:'ease-in'},
          {transform:'translateY(0) rotate(220deg)'}
        ], {duration:800, easing:'ease-in', fill:'forwards'});
      } else b.classList.add('egg-fade-in');
      // acorns don't stay forever
      setTimeout(function(){ if (b.isConnected){ b.classList.add('egg-fade-out'); setTimeout(function(){ b.remove(); }, 450); acorns = acorns.filter(function(a){ return a !== b; }); if (!acorns.length && state === 'game') endGame(false); } }, 45000);
    }

    function popUpForCatch(){
      if (!win) build();
      if (!position()){ return false; }
      win.classList.add('is-shown', 'is-up');
      win.classList.remove('is-tail');
      return true;
    }
    function toss(b){
      if (!b.isConnected || b.dataset.flying) return;
      b.dataset.flying = '1';
      var visible = popUpForCatch();
      var ar = b.getBoundingClientRect();
      acorns = acorns.filter(function(a){ return a !== b; });
      b.remove();
      if (!visible){ caught++; afterCatch(); return; }
      var fly = K.el('div', 'egg-acorn-fly', {'aria-hidden':'true'}); fly.innerHTML = ACORN_SVG;
      document.body.appendChild(fly);
      var sr = sq.getBoundingClientRect();
      var tx = sr.left + sr.width * 0.8, ty = sr.top + sr.height * 0.7;
      var sx = ar.left + ar.width/2, sy = ar.top + ar.height/2;
      if (!K.motion() || !fly.animate){
        fly.remove(); catchIt(); return;
      }
      var p0 = {x:sx - 13, y:sy - 15}, p3 = {x:tx - 13, y:ty - 15};
      var peak = Math.min(sy, ty) - 110;
      var p1 = {x:p0.x + (p3.x - p0.x) * 0.3, y:peak}, p2 = {x:p0.x + (p3.x - p0.x) * 0.7, y:peak};
      var frames = K.bezFrames(p0, p1, p2, p3, 20, {noRotate:false, rotScale:2});
      fly.animate(frames, {duration:650, easing:'ease-in-out'}).onfinish = function(){ fly.remove(); catchIt(); };
    }
    function catchIt(){
      caught++;
      sq.classList.add('has-acorn');
      var f = sq.querySelector('.egg-sq-flip');
      if (K.motion() && f.animate){
        f.animate([
          {transform:'translateY(0) rotate(0deg)'},
          {transform:'translateY(-46px) rotate(-180deg)', offset:.5},
          {transform:'translateY(0) rotate(-360deg)'}
        ], {duration:650, easing:'ease-in-out'});
      }
      var r = sq.getBoundingClientRect(); K.sparkle(r.left + r.width/2, r.top + 10, {count:6});
      afterCatch();
    }
    function afterCatch(){
      K.say('Caught ' + caught + ' of 3 acorns!');
      if (caught >= 3 || !acorns.length) endGame(caught >= 3);
      else { clearTimeout(hideT); hideT = setTimeout(function(){ if (state === 'game') { win.classList.remove('is-up'); } }, 4000); }
    }
    function endGame(won){
      state = 'end';
      clearTimeout(hideT);
      if (won){
        var r = sq.getBoundingClientRect();
        SL.confetti(r.left + r.width/2, r.top + 20, {count:12, spread:80, shapes:['●','▲','★']});
        SL.toast && SL.toast('🐿️ Stash complete: 3 for 3!');
      }
      setTimeout(function(){ state = 'peek'; retreat(); sq.classList.remove('has-acorn'); }, 1400);
    }

    schedulePeek(9000, 18000);
  }));
})();
