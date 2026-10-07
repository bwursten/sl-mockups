/* ============================================================
   EGGS: 12. Paper airplane (id 'paper-airplane')
   A tiny folded paper airplane sits in the hero corner ([data-egg-anchor="airplane"]).
   Drag & release to throw it (speed + direction come from your flick). It glides with simple
   lift/drag physics (strong throws loop-the-loop) and lands somewhere else on the page; throw it
   again from there. Tap/click without dragging, or focus it + Enter/Space = random throw.
   Esc during a flight lands it immediately.
   ============================================================ */
(function(){
  'use strict';
  var SL = window.SL, K = SL && SL._egg; if (!K) return;

  var PLANE_SVG = '<svg viewBox="0 0 64 38" width="54" height="32" aria-hidden="true">' +
    '<path d="M2 17 L62 4 L26 22Z" fill="#FFFFFF" stroke="#12102B" stroke-width="2.6" stroke-linejoin="round"/>' +
    '<path d="M26 22 L62 4 L32 34Z" fill="#DCE9F5" stroke="#12102B" stroke-width="2.6" stroke-linejoin="round"/>' +
    '<path d="M26 22 L32 34 L22 27Z" fill="#B8CCE0" stroke="#12102B" stroke-width="2.2" stroke-linejoin="round"/>' +
    '<path d="M12 16 L40 10" stroke="#5CC8FF" stroke-width="2" stroke-linecap="round"/></svg>';

  K.idle(K.safe('airplane', function(){
    var anchor = document.querySelector('[data-egg-anchor="airplane"]');
    if (!anchor) return;

    var plane = K.el('button', 'egg-plane', {type:'button', 'aria-label':'Paper airplane. Drag and let go to throw it, or press Enter'});
    plane.innerHTML = '<span class="egg-plane-inner">' + PLANE_SVG + '</span>';
    // live at body level (the anchor is aria-hidden + pointer-events:none); park it over the anchor
    document.body.appendChild(plane);
    var inner = plane.querySelector('.egg-plane-inner');
    function parkHome(){
      var r = anchor.getBoundingClientRect();
      if (!r.width && !r.height){ plane.hidden = true; return; }
      plane.hidden = false;
      plane.style.position = 'absolute';
      plane.style.left = (r.left + K.sx() + r.width/2 - 30) + 'px';
      plane.style.top = (r.top + K.sy() + r.height/2 - 22) + 'px';
      plane.style.transform = '';
    }
    parkHome();
    window.addEventListener('resize', function(){ if (mode === 'home') parkHome(); });

    var mode = 'home';   // home | doc | drag | fly
    var P = {x:0, y:0, vx:0, vy:0, sign:1, t:0, land:3};
    var drag = null, loop = null, offEsc = null, suppressClick = false;

    function headerBottom(){ return K.topInset(); }
    function toFixed(){
      var r = plane.getBoundingClientRect();
      plane.classList.add('is-free'); plane.classList.remove('is-doc');
      plane.style.position = 'fixed';
      P.x = r.left + r.width/2; P.y = r.top + r.height/2;
      render(0);
    }
    function toDoc(){
      plane.classList.add('is-doc');
      plane.style.position = 'absolute';
      plane.style.left = '0px'; plane.style.top = '0px';
      render(0, true);
    }
    function render(angle, docCoords){
      var x = P.x - 27 + (docCoords ? K.sx() : 0), y = P.y - 16 + (docCoords ? K.sy() : 0);
      plane.style.left = '0px'; plane.style.top = '0px';
      plane.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
      inner.style.transform = 'rotate(' + angle.toFixed(1) + 'deg)' + (P.sign < 0 ? ' scaleY(-1)' : '');
    }

    /* ---- drag to throw ---- */
    plane.style.touchAction = 'none';
    plane.addEventListener('pointerdown', function(e){
      if (e.button !== 0 || mode === 'fly') return;
      drag = {id:e.pointerId, sx:e.clientX, sy:e.clientY, moved:false, samples:[{x:e.clientX, y:e.clientY, t:performance.now()}]};
      try { plane.setPointerCapture(e.pointerId); } catch(err){}
    });
    plane.addEventListener('pointermove', function(e){
      if (!drag || e.pointerId !== drag.id) return;
      var now = performance.now();
      drag.samples.push({x:e.clientX, y:e.clientY, t:now});
      while (drag.samples.length > 2 && now - drag.samples[0].t > 120) drag.samples.shift();
      if (!drag.moved && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 6){
        drag.moved = true; suppressClick = true; mode = 'drag';
        toFixed();
        plane.classList.add('is-held');
      }
      if (drag.moved){
        var s0 = drag.samples[0], vx = e.clientX - s0.x;
        if (Math.abs(vx) > 4) P.sign = vx >= 0 ? 1 : -1;
        P.x = e.clientX; P.y = e.clientY;
        render(P.sign > 0 ? -12 : 192 - 360);
      }
    });
    function release(e){
      if (!drag || (e && e.pointerId !== drag.id)) return;
      var d = drag; drag = null;
      plane.classList.remove('is-held');
      if (!d.moved) return;   // a plain tap → click handler throws randomly
      var a = d.samples[0], b = d.samples[d.samples.length - 1], dt = Math.max(16, b.t - a.t) / 1000;
      var vx = (b.x - a.x) / dt, vy = (b.y - a.y) / dt, sp = Math.hypot(vx, vy);
      if (sp > 2600){ vx *= 2600 / sp; vy *= 2600 / sp; }
      if (sp < 200){ vx = P.sign * 260; vy = -40; }
      throwIt(vx, vy);
    }
    plane.addEventListener('pointerup', release);
    plane.addEventListener('pointercancel', release);
    plane.addEventListener('click', function(e){
      e.preventDefault();
      if (suppressClick){ suppressClick = false; return; }
      if (mode === 'fly') return;
      randomThrow();
    });

    function randomThrow(){
      if (mode === 'home' || mode === 'doc') toFixed();
      var room = P.x < K.vw() / 2 ? 1 : -1;
      throwIt(room * K.rnd(650, 1150), -K.rnd(150, 420));
    }

    function throwIt(vx, vy){
      K.foundOnce('paper-airplane');
      if (!K.motion()){
        // gentle version: fade out, reappear somewhere else
        plane.classList.add('egg-fade-out');
        setTimeout(function(){
          P.x = K.rnd(60, K.vw() - 60); P.y = K.rnd(headerBottom() + 60, K.vh() - 60);
          P.sign = vx >= 0 ? 1 : -1;
          safeSpot(); toDoc(); mode = 'doc';
          plane.classList.remove('egg-fade-out'); plane.classList.add('egg-fade-in');
          setTimeout(function(){ plane.classList.remove('egg-fade-in'); }, 500);
        }, 420);
        return;
      }
      mode = 'fly';
      plane.classList.add('is-flying');
      P.vx = vx; P.vy = vy; P.sign = vx >= 0 ? 1 : -1; P.t = 0; P.land = K.rnd(2.2, 3.4);
      offEsc = K.onEsc(function(){ offEsc = null; land(); });
      if (!loop) loop = K.loop(fly);
      loop.start();
    }
    var L = 0.004, D = 0.002, G = 620, CAP = 2200;
    function fly(dt){
      if (mode !== 'fly') return false;
      var vw = K.vw(), vh = K.vh(), top = K.ceiling() + 8;
      var steps = 3, h = dt / steps;
      for (var i = 0; i < steps; i++){
        var s = Math.hypot(P.vx, P.vy) || 1;
        var lift = Math.min(L * s * s, CAP);
        var px = P.sign * P.vy / s, py = -P.sign * P.vx / s;
        P.vx += (px * lift - D * s * P.vx) * h;
        P.vy += (py * lift - D * s * P.vy + G) * h;
        P.x += P.vx * h; P.y += P.vy * h;
        if (P.x < 30){ P.x = 30; P.vx = Math.abs(P.vx) * 0.5; P.sign = 1; }
        if (P.x > vw - 30){ P.x = vw - 30; P.vx = -Math.abs(P.vx) * 0.5; P.sign = -1; }
        if (P.y < top + 20){ P.y = top + 20; P.vy = Math.abs(P.vy) * 0.3; }
      }
      P.t += dt;
      render(Math.atan2(P.vy, P.vx) * 180 / Math.PI);
      if (P.y > vh - 40 || (P.t > P.land && P.vy > 0) || P.t > 6){ land(); return false; }
    }
    function safeSpot(){
      var vw = K.vw(), vh = K.vh(), top = K.ceiling() + 30;
      P.x = K.clamp(P.x, 40, vw - 40); P.y = K.clamp(P.y, top, vh - 40);
      for (var i = 0; i < 40 && K.nearAd(K.rect(P.x - 30, P.y - 20, 60, 40), 24); i++){
        P.x += (P.x < vw / 2 ? 30 : -30); if (i % 4 === 3) P.y -= 30;
        P.y = Math.max(top, P.y);
      }
    }
    function land(){
      if (mode !== 'fly') return;
      loop && loop.stop();
      offEsc && offEsc(); offEsc = null;
      safeSpot();
      mode = 'doc';
      plane.classList.remove('is-flying');
      toDoc();
      inner.style.transform = 'rotate(' + (P.sign > 0 ? 8 : 172) + 'deg)' + (P.sign < 0 ? ' scaleY(-1)' : '');
      if (inner.animate){
        inner.animate([{translate:'0 -6px'}, {translate:'0 2px'}, {translate:'0 0'}], {duration:300, easing:'ease-out'});
      }
      K.say('The paper airplane landed. Throw it again!');
    }
    K.onMotion(function(ok){ if (!ok && mode === 'fly') land(); });
  }));
})();
