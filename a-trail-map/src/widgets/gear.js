/* ============================================================
   Gear Guide widget — swipeable carousel (pointer drag, arrows,
   dots, keyboard; no auto-advance).
   Egg: try to go past the last card → backpack bursts open,
   gear spills out, bounces, settles, then gets sucked back in.
   Owner: Agent C
   ============================================================ */
(function(){
  'use strict';
  var SL = window.SL;
  if (!SL) return;
  var WID = 'gear';

  /* ---- gear icons for the burst (inline SVG, palette colors) ---- */
  var INK = '#1F2A22';
  var ICONS = {
    tent: '<svg viewBox="0 0 46 46"><path d="M4 40 23 6l19 34z" fill="#8DBF4A" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/><path d="M23 6v34M15 40l8-14 8 14z" fill="#2E7550" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/><path d="M2 41h42" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/></svg>',
    flashlight: '<svg viewBox="0 0 46 46"><path d="M30 6l10 10-6 3-7-7z" fill="#F6EEDC" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/><path d="M27 12l7 7-18 18a5 5 0 0 1-7-7z" fill="#1F64B0" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/><path d="M29 14l6 6" stroke="#FFC629" stroke-width="4"/><path d="M38 4l3-3M42 8l3-1M35 2l0-2" stroke="#FFC629" stroke-width="2.5" stroke-linecap="round"/></svg>',
    compass: '<svg viewBox="0 0 46 46"><circle cx="23" cy="24" r="18" fill="#fff" stroke="' + INK + '" stroke-width="3"/><circle cx="23" cy="24" r="12" fill="none" stroke="#3E9C8A" stroke-width="2" stroke-dasharray="2 3"/><path d="M23 10l5 14h-10z" fill="#F26B21" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/><path d="M23 38l-5-14h10z" fill="#F6EEDC" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/><rect x="20" y="1" width="6" height="5" rx="2" fill="#FFC629" stroke="' + INK + '" stroke-width="2"/></svg>',
    bottle: '<svg viewBox="0 0 46 46"><rect x="13" y="11" width="20" height="32" rx="6" fill="#3FA9F5" stroke="' + INK + '" stroke-width="3"/><rect x="16" y="3" width="14" height="9" rx="3" fill="#3E9C8A" stroke="' + INK + '" stroke-width="3"/><path d="M17 22h12M17 28h12" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/></svg>',
    map: '<svg viewBox="0 0 46 46"><path d="M3 9l13-4 14 4 13-4v32l-13 4-14-4-13 4z" fill="#FFC629" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/><path d="M16 5v32M30 9v32" stroke="' + INK + '" stroke-width="2"/><path d="M8 30c5-2 6-10 12-9s7 7 13 4" fill="none" stroke="#F26B21" stroke-width="2.5" stroke-dasharray="3 3"/><path d="M34 13l4 4M38 13l-4 4" stroke="#F26B21" stroke-width="2.5" stroke-linecap="round"/></svg>',
    boots: '<svg viewBox="0 0 46 46"><path d="M10 4h15v20l13 6c4 2 5 5 5 8v2H6V8z" fill="#F7A531" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/><path d="M5 40h38v3H5z" fill="' + INK + '"/><path d="M14 12h7M14 18h7M14 24h9" stroke="' + INK + '" stroke-width="2.5" stroke-linecap="round"/><path d="M10 4h15v6H10z" fill="#D8C29A" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/></svg>'
  };
  var PACK_SVG = '<svg viewBox="0 0 120 130" aria-hidden="true" focusable="false">' +
    '<path d="M24 46c-14 10-14 50 0 64M96 46c14 10 14 50 0 64" fill="none" stroke="' + INK + '" stroke-width="6" stroke-linecap="round"/>' +
    '<rect x="50" y="20" width="20" height="16" rx="7" fill="none" stroke="' + INK + '" stroke-width="4.5"/>' +
    '<rect x="18" y="36" width="84" height="90" rx="22" fill="#F7A531" stroke="' + INK + '" stroke-width="4"/>' +
    '<ellipse class="gc-mouth" cx="60" cy="44" rx="38" ry="9" fill="' + INK + '"/>' +
    '<rect x="34" y="80" width="52" height="34" rx="10" fill="#D8C29A" stroke="' + INK + '" stroke-width="3.5"/>' +
    '<path d="M36 92h48" stroke="' + INK + '" stroke-width="2.5" stroke-dasharray="4 3"/>' +
    '<circle cx="46" cy="70" r="4" fill="#fff" stroke="' + INK + '" stroke-width="2"/><circle cx="74" cy="70" r="4" fill="#fff" stroke="' + INK + '" stroke-width="2"/>' +
    '<path d="M50 72q10 8 20 0" fill="none" stroke="' + INK + '" stroke-width="2.5" stroke-linecap="round"/>' +
    '<g class="gc-flap"><path d="M16 52Q16 30 60 30Q104 30 104 52v8Q60 68 16 60z" fill="#3E9C8A" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/>' +
    '<rect x="53" y="58" width="14" height="11" rx="2" fill="#FFC629" stroke="' + INK + '" stroke-width="2.5"/></g></svg>';

  SL.widget(WID, function(root){
    var car = SL.$('.gc-car', root), vp = SL.$('.gc-viewport', root), track = SL.$('.gc-track', root);
    var slides = SL.$$('.gc-slide', root), prev = SL.$('.gc-prev', root), next = SL.$('.gc-next', root);
    var dotsWrap = SL.$('.gc-dots', root), status = SL.$('.gc-status', root), layer = SL.$('.gc-burst', root);
    if (!car || !slides.length) return;
    root.classList.add('gc-js');
    vp.scrollLeft = 0;

    var n = slides.length, per = 2, index = 0, maxIndex = 0, dots = [];
    var bursting = false, eggDone = false;

    slides.forEach(function(s, i){
      s.setAttribute('role', 'group');
      s.setAttribute('aria-roledescription', 'slide');
      s.setAttribute('aria-label', (i + 1) + ' of ' + n);
    });

    function readPer(){ var v = parseInt(getComputedStyle(car).getPropertyValue('--gc-per'), 10); return v > 0 ? v : 1; }
    function offsetFor(i){ return slides[i].offsetLeft - slides[0].offsetLeft; }

    function buildDots(){
      dotsWrap.innerHTML = ''; dots = [];
      for (var i = 0; i <= maxIndex; i++){
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'gc-dot';
        b.setAttribute('aria-label', per > 1 ? 'Show cards ' + (i + 1) + ' and ' + (i + 2) : 'Show card ' + (i + 1));
        (function(i){ b.addEventListener('click', function(){ go(i); SL.trackInteract(WID, 'dot'); }); })(i);
        dotsWrap.appendChild(b); dots.push(b);
      }
    }

    function setX(x, animate){
      track.style.transition = (animate && SL.motionOK()) ? '' : 'none';
      track.style.transform = 'translateX(' + (-x) + 'px)';
    }

    function go(i, instant){
      index = Math.max(0, Math.min(maxIndex, i));
      setX(offsetFor(index), !instant);
      update(!instant);
    }

    function update(announce){
      dots.forEach(function(d, i){ if (i === index) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current'); });
      slides.forEach(function(s, i){
        var vis = i >= index && i < index + per;
        if (vis){ s.removeAttribute('inert'); s.removeAttribute('aria-hidden'); }
        else { s.setAttribute('inert', ''); s.setAttribute('aria-hidden', 'true'); }
      });
      prev.setAttribute('aria-disabled', index === 0 ? 'true' : 'false');
      next.setAttribute('aria-label', index >= maxIndex ? 'Next card (that’s the last one!)' : 'Next card');
      if (announce){
        status.textContent = per > 1 ? 'Showing cards ' + (index + 1) + ' and ' + (index + 2) + ' of ' + n : 'Showing card ' + (index + 1) + ' of ' + n;
      }
    }

    function measure(){
      per = readPer();
      maxIndex = Math.max(0, n - per);
      if (index > maxIndex) index = maxIndex;
      buildDots();
      go(index, true);
    }

    function goNext(how){
      if (index >= maxIndex){ burst(); return; }
      go(index + 1); SL.trackInteract(WID, how || 'next');
    }
    function goPrev(how){
      if (index <= 0){ prev.classList.remove('is-bump'); void prev.offsetWidth; prev.classList.add('is-bump'); return; }
      go(index - 1); SL.trackInteract(WID, how || 'prev');
    }

    prev.addEventListener('click', function(){ goPrev('prev'); });
    next.addEventListener('click', function(){ goNext('next'); });

    car.addEventListener('keydown', function(e){
      if (e.target.closest('.gc-dot')) {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      }
      if (e.key === 'ArrowRight'){ e.preventDefault(); goNext('key_next'); }
      else if (e.key === 'ArrowLeft'){ e.preventDefault(); goPrev('key_prev'); }
      else if (e.key === 'Home'){ e.preventDefault(); go(0); }
      else if (e.key === 'End'){ e.preventDefault(); go(maxIndex); }
    });

    /* ---- pointer drag / swipe ---- */
    var drag = null, suppressClick = false;
    vp.addEventListener('pointerdown', function(e){
      if (e.button !== 0 || bursting) return;
      drag = { x: e.clientX, y: e.clientY, dx: 0, moved: false, id: e.pointerId, base: offsetFor(index) };
    });
    vp.addEventListener('pointermove', function(e){
      if (!drag || e.pointerId !== drag.id) return;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.moved){
        if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)){
          drag.moved = true;
          try { vp.setPointerCapture(e.pointerId); } catch(err){}
          vp.classList.add('is-dragging');
        } else if (Math.abs(dy) > 10){ drag = null; return; }
        else return;
      }
      drag.dx = dx;
      var pull = dx;
      if ((index >= maxIndex && dx < 0) || (index <= 0 && dx > 0)) pull = dx * 0.35;   // rubber band at the ends
      setX(drag.base - pull, false);
    });
    function endDrag(e){
      if (!drag || (e && e.pointerId !== drag.id)) return;
      var d = drag; drag = null;
      vp.classList.remove('is-dragging');
      if (!d.moved) return;
      suppressClick = true; setTimeout(function(){ suppressClick = false; }, 60);
      var th = Math.min(70, vp.offsetWidth * 0.15);
      var before = index;
      if (d.dx < -th) goNext('swipe');
      else if (d.dx > th) goPrev('swipe');
      if (index === before) setX(offsetFor(index), true);   // snap back (or stay at the end while the pack bursts)
    }
    vp.addEventListener('pointerup', endDrag);
    vp.addEventListener('pointercancel', endDrag);
    vp.addEventListener('click', function(e){ if (suppressClick){ e.preventDefault(); e.stopPropagation(); } }, true);
    vp.addEventListener('dragstart', function(e){ e.preventDefault(); });

    /* ---- Egg: backpack burst ---- */
    function burst(){
      if (bursting) return;
      bursting = true;
      if (!eggDone){ eggDone = true; SL.eggFound('backpack-burst'); }
      SL.trackInteract(WID, 'backpack_burst');
      status.textContent = 'Whoa! You reached the end and the backpack burst open, spilling gear everywhere.';
      next.classList.remove('is-bump'); void next.offsetWidth; next.classList.add('is-bump');

      layer.innerHTML = '';
      layer.classList.add('is-on');
      var W = layer.offsetWidth, H = layer.offsetHeight;
      var pack = document.createElement('div'); pack.className = 'gc-pack'; pack.innerHTML = PACK_SVG;
      layer.appendChild(pack);
      var whoa = document.createElement('span'); whoa.className = 'gc-whoa'; whoa.textContent = 'Too much gear!';
      var packW = 116, packH = 126, packL = W / 2 - packW / 2, packT = H - 4 - packH;
      var mouth = { x: packL + packW / 2, y: packT + packH * (44 / 130) };
      var names = Object.keys(ICONS), S = 46;
      var items = names.map(function(k){
        var el = document.createElement('span'); el.className = 'gc-item'; el.innerHTML = ICONS[k];
        el.style.opacity = '0';
        layer.appendChild(el);
        return { el: el, x: mouth.x - S / 2, y: mouth.y - S / 2, vx: 0, vy: 0, r: 0, vr: 0 };
      });

      function place(it, sc){ it.el.style.transform = 'translate(' + it.x.toFixed(1) + 'px,' + it.y.toFixed(1) + 'px) rotate(' + it.r.toFixed(1) + 'deg)' + (sc ? ' scale(' + sc + ')' : ''); }
      function cleanup(){ layer.classList.remove('is-on'); layer.innerHTML = ''; bursting = false; }

      if (!SL.motionOK()){
        pack.classList.add('is-open');
        layer.appendChild(whoa);
        items.forEach(function(it, i){
          var ang = Math.PI + (i + 0.5) * (Math.PI / items.length);
          it.x = mouth.x - S / 2 + Math.cos(ang) * 135; it.y = mouth.y - S / 2 + Math.sin(ang) * 85; it.r = 0;
          it.el.style.opacity = '1'; place(it);
        });
        setTimeout(cleanup, 2200);
        return;
      }

      pack.animate([{ transform: 'translateY(140px)' }, { transform: 'translateY(-10px)', offset: .7 }, { transform: 'translateY(0)' }], { duration: 420, easing: 'ease-out' });
      setTimeout(function(){ pack.classList.add('is-shake'); }, 430);
      setTimeout(function(){
        pack.classList.remove('is-shake'); pack.classList.add('is-open');
        layer.appendChild(whoa);
        items.forEach(function(it, i){
          it.el.style.opacity = '1';
          it.vx = (i - (items.length - 1) / 2) * 2.4 + (Math.random() - 0.5) * 2.5;
          it.vy = -(10 + Math.random() * 4);
          it.vr = (Math.random() - 0.5) * 22;
        });
        physics();
      }, 760);

      function physics(){
        var t0 = performance.now(), last = t0, raf = 0;
        var floor = H - 6 - S, g = 0.55;
        function step(now){
          var dt = Math.min(2.5, (now - last) / 16.67); last = now;
          var stillMoving = false;
          items.forEach(function(it){
            it.vy += g * dt; it.x += it.vx * dt; it.y += it.vy * dt; it.r += it.vr * dt;
            if (it.y > floor){ it.y = floor; it.vy *= -0.5; it.vx *= 0.8; it.vr *= 0.7; if (Math.abs(it.vy) < 1.2) it.vy = 0; }
            if (it.x < 4){ it.x = 4; it.vx = Math.abs(it.vx) * 0.6; }
            if (it.x > W - S - 4){ it.x = W - S - 4; it.vx = -Math.abs(it.vx) * 0.6; }
            if (it.y >= floor){ it.vx *= 0.94; it.vr *= 0.9; }
            if (Math.abs(it.vx) > 0.15 || Math.abs(it.vy) > 0.15) stillMoving = true;
            place(it);
          });
          if (!SL.motionOK()){ suck(); return; }
          if ((stillMoving && now - t0 < 2600) || now - t0 < 900) raf = requestAnimationFrame(step);
          else setTimeout(suck, 500);
        }
        raf = requestAnimationFrame(step);
      }

      function suck(){
        if (whoa.parentNode) whoa.remove();
        var left = items.length;
        items.forEach(function(it, i){
          var from = it.el.style.transform;
          var to = 'translate(' + (mouth.x - S / 2) + 'px,' + (mouth.y - S / 2) + 'px) rotate(' + (it.r + 360) + 'deg) scale(.15)';
          var a = it.el.animate([{ transform: from }, { transform: to }], { duration: 420, delay: i * 70, easing: 'cubic-bezier(.6,0,.9,.5)', fill: 'forwards' });
          a.onfinish = function(){ it.el.style.opacity = '0'; if (--left === 0) closePack(); };
        });
      }
      function closePack(){
        pack.classList.remove('is-open');
        setTimeout(function(){
          var a = pack.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-18px) rotate(-6deg)', offset: .35 }, { transform: 'translateY(150px)' }], { duration: 650, easing: 'ease-in' });
          a.onfinish = cleanup;
        }, 260);
      }
    }

    document.addEventListener('sl:motion', function(){ go(index, true); });

    if ('ResizeObserver' in window){
      var rw = 0;
      new ResizeObserver(function(){ var w = car.offsetWidth; if (w !== rw){ rw = w; measure(); } }).observe(car);
    } else {
      window.addEventListener('resize', measure);
    }
    measure();
  });
})();
