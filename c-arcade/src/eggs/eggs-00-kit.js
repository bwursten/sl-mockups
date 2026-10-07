/* ============================================================
   EGGS kit — shared helpers for page-level Easter eggs.
   Exposed (internally) as SL._egg. Other egg files build on it.
   Owner: Agent EGGS
   ============================================================ */
(function(){
  'use strict';
  var SL = window.SL = window.SL || {};
  var K = SL._egg = SL._egg || {};
  var SVGNS = 'http://www.w3.org/2000/svg';

  /* ---- lifecycle ---- */
  K.ready = function(fn){
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn();
  };
  /** run after the page is idle (eggs never delay main content) */
  K.idle = function(fn, timeout){
    K.ready(function(){
      var run = function(){ try { fn(); } catch(err){ if (window.console) console.error('[eggs]', err); } };
      if ('requestIdleCallback' in window) window.requestIdleCallback(run, {timeout: timeout || 2500});
      else setTimeout(run, 600);
    });
  };
  /** safe wrapper so one broken egg never takes others down */
  K.safe = function(name, fn){
    return function(){ try { return fn.apply(this, arguments); } catch(err){ if (window.console) console.error('[eggs:'+name+']', err); } };
  };

  /* ---- motion ---- */
  K.motion = function(){ return SL.motionOK ? SL.motionOK() : true; };
  K.onMotion = function(fn){ document.addEventListener('sl:motion', function(e){ fn(!!(e.detail && e.detail.ok)); }); };

  /* ---- found tracking ---- */
  var foundOnce = {};
  /** fire SL.eggFound once per page view (for continuous toys) */
  K.foundOnce = function(id){ if (foundOnce[id]) return; foundOnce[id] = true; if (SL.eggFound) SL.eggFound(id); };
  K.found = function(id){ if (SL.eggFound) SL.eggFound(id); };

  /* ---- Esc stack: newest open egg closes first ---- */
  var escStack = [];
  K.onEsc = function(fn){
    escStack.push(fn);
    return function off(){ var i = escStack.indexOf(fn); if (i > -1) escStack.splice(i, 1); };
  };
  document.addEventListener('keydown', function(e){
    if ((e.key === 'Escape' || e.key === 'Esc') && escStack.length){
      var fn = escStack.pop();
      try { fn(); } catch(err){ if (window.console) console.error(err); }
    }
  });

  /* ---- typing guard ---- */
  K.isTyping = function(t){
    t = t || document.activeElement;
    if (!t || !t.tagName) return false;
    var tag = t.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || !!t.isContentEditable;
  };

  /* ---- DOM helpers ---- */
  K.el = function(tag, cls, attrs){
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (attrs) Object.keys(attrs).forEach(function(k){ n.setAttribute(k, attrs[k]); });
    return n;
  };
  /** parse an SVG/HTML string into a single element */
  K.html = function(str){
    var t = document.createElement('template'); t.innerHTML = str.trim(); return t.content.firstElementChild;
  };
  K.svgEl = function(tag, attrs){
    var n = document.createElementNS(SVGNS, tag);
    if (attrs) Object.keys(attrs).forEach(function(k){ n.setAttribute(k, attrs[k]); });
    return n;
  };
  K.SVGNS = SVGNS;
  /** make sure an element is a containing block for absolutely positioned children */
  K.ensurePositioned = function(el){
    if (el && getComputedStyle(el).position === 'static') el.style.position = 'relative';
  };

  /* ---- geometry ---- */
  K.vw = function(){ return window.innerWidth || document.documentElement.clientWidth; };
  K.vh = function(){ return window.innerHeight || document.documentElement.clientHeight; };
  K.sx = function(){ return window.pageXOffset || document.documentElement.scrollLeft || 0; };
  K.sy = function(){ return window.pageYOffset || document.documentElement.scrollTop || 0; };
  K.docW = function(){ return Math.max(document.documentElement.scrollWidth, document.body ? document.body.scrollWidth : 0); };
  K.docH = function(){ return Math.max(document.documentElement.scrollHeight, document.body ? document.body.scrollHeight : 0); };
  K.visible = function(el){
    if (!el) return false;
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  K.inView = function(r, margin){
    margin = margin || 0;
    return r.bottom > margin && r.top < K.vh() - margin && r.right > margin && r.left < K.vw() - margin && r.width > 0;
  };
  K.overlap = function(a, b, pad){
    pad = pad || 0;
    return !(a.right + pad < b.left || a.left - pad > b.right || a.bottom + pad < b.top || a.top - pad > b.bottom);
  };
  /** true if viewport rect r is within pad px of any ad slot */
  K.nearAd = function(r, pad){
    pad = pad == null ? 60 : pad;
    var ads = document.querySelectorAll('.ad-slot, .ad-box, [class*="ad-728"], [class*="ad-300"], [class*="ad-320"]');
    for (var i = 0; i < ads.length; i++){
      var ar = ads[i].getBoundingClientRect();
      if (ar.width && K.overlap(r, ar, pad)) return true;
    }
    return false;
  };
  /** bottom edge (viewport px) of whatever header bar is pinned to the top right now (0 if none) */
  K.topInset = function(){
    var b = 0;
    var h = document.getElementById('site-header');
    if (h){ var p = getComputedStyle(h).position; if (p === 'fixed' || p === 'sticky') b = Math.max(b, h.getBoundingClientRect().bottom); }
    var bars = document.querySelectorAll('.sh-sticky.is-on, [data-sticky-bar].is-on');
    for (var i = 0; i < bars.length; i++){ var r = bars[i].getBoundingClientRect(); if (r.height && r.top <= 1) b = Math.max(b, r.bottom); }
    return Math.max(0, b);
  };
  /** lowest y (viewport px) that flying things should stay below: pinned header bars + any ad near the top */
  K.ceiling = function(){
    var c = K.topInset(), vh = K.vh();
    var ads = document.querySelectorAll('.ad-slot');
    for (var i = 0; i < ads.length; i++){
      var r = ads[i].getBoundingClientRect();
      if (r.width && r.bottom > 0 && r.top < vh * 0.3) c = Math.max(c, r.bottom + 8);
    }
    return c;
  };
  /** cut holes in a fixed overlay so effects never draw on top of ads.
      (ox, oy) = the overlay's own viewport offset. */
  K.adClip = function(el, ox, oy){
    if (!el) return;
    ox = ox || 0; oy = oy || 0;
    var vw = K.vw(), vh = K.vh(), d = 'M0 0H' + (vw + 2) + 'V' + (vh + 2) + 'H0Z', any = false, pad = 10;
    var ads = document.querySelectorAll('.ad-slot');
    for (var i = 0; i < ads.length; i++){
      var r = ads[i].getBoundingClientRect();
      if (!r.width || r.bottom < 0 || r.top > vh || r.right < 0 || r.left > vw) continue;
      var l = Math.round(r.left - pad - ox), t = Math.round(r.top - pad - oy), rr = Math.round(r.right + pad - ox), b = Math.round(r.bottom + pad - oy);
      d += ' M' + l + ' ' + t + 'H' + rr + 'V' + b + 'H' + l + 'Z';
      any = true;
    }
    el.style.clipPath = any ? 'path(evenodd, "' + d + '")' : '';
  };
  K.rect = function(l, t, w, h){ return {left:l, top:t, right:l+w, bottom:t+h, width:w, height:h}; };
  K.clamp = function(v, a, b){ return Math.max(a, Math.min(b, v)); };
  K.rnd = function(a, b){ return a + Math.random() * (b - a); };

  /* ---- point-in-time pointer position (viewport coords) ---- */
  K.pointer = {x: -9999, y: -9999, t: 0};
  document.addEventListener('pointermove', function(e){ K.pointer.x = e.clientX; K.pointer.y = e.clientY; K.pointer.t = Date.now(); }, {passive:true});
  document.addEventListener('pointerdown', function(e){ K.pointer.x = e.clientX; K.pointer.y = e.clientY; K.pointer.t = Date.now(); }, {passive:true, capture:true});

  /* ---- a shared fixed overlay layer for effects (never catches clicks itself) ---- */
  var layer = null;
  K.layer = function(){
    if (!(layer && layer.isConnected)){
      layer = K.el('div', 'egg-layer', {'aria-hidden':'true'});
      document.body.appendChild(layer);
    }
    K.adClip(layer);
    return layer;
  };

  /* ---- shared live region for egg announcements ---- */
  var live = null;
  K.say = function(msg){
    if (!live){ live = K.el('div', 'sr-only egg-live', {'aria-live':'polite', 'role':'status'}); document.body.appendChild(live); }
    live.textContent = ''; setTimeout(function(){ live.textContent = msg; }, 30);
  };

  /* ---- a small requestAnimationFrame loop helper that respects motion ---- */
  K.loop = function(step){
    var raf = 0, last = 0, running = false;
    function frame(t){
      if (!running) return;
      var dt = last ? Math.min(0.05, (t - last) / 1000) : 0.016; last = t;
      if (step(dt, t) === false){ running = false; return; }
      raf = requestAnimationFrame(frame);
    }
    return {
      start: function(){ if (running) return; running = true; last = 0; raf = requestAnimationFrame(frame); },
      stop: function(){ running = false; cancelAnimationFrame(raf); },
      get running(){ return running; }
    };
  };

  /* ---- sparkle burst (small, local; used by several eggs). x,y viewport coords ---- */
  K.sparkle = function(x, y, opts){
    opts = opts || {};
    var n = opts.count || 8, color = opts.colors || ['#FFE600', '#FFFFFF', '#5CC8FF', '#3CF06E'];
    var L = K.layer();
    for (var i = 0; i < n; i++){
      var s = K.el('span', 'egg-sparkle');
      s.textContent = opts.char || '✦';
      s.style.left = x + 'px'; s.style.top = y + 'px';
      s.style.color = color[i % color.length];
      s.style.fontSize = (opts.size || 16) + Math.random() * 8 + 'px';
      L.appendChild(s);
      if (!K.motion() || !s.animate){ (function(s){ setTimeout(function(){ s.remove(); }, 500); })(s); continue; }
      var a = (i / n) * Math.PI * 2 + Math.random() * .4, d = (opts.spread || 34) + Math.random() * 20;
      var an = s.animate([
        {transform:'translate(-50%,-50%) scale(.2)', opacity:1},
        {transform:'translate(calc(-50% + '+(Math.cos(a)*d)+'px), calc(-50% + '+(Math.sin(a)*d)+'px)) scale(1)', opacity:1, offset:.6},
        {transform:'translate(calc(-50% + '+(Math.cos(a)*d*1.2)+'px), calc(-50% + '+(Math.sin(a)*d*1.2)+'px)) scale(.4)', opacity:0}
      ], {duration: 650 + Math.random()*200, easing:'cubic-bezier(.2,.8,.3,1)'});
      (function(s){ an.onfinish = function(){ s.remove(); }; })(s);
    }
  };

  /* ---- sample a cubic bezier ---- */
  K.bez = function(p0, p1, p2, p3, t){
    var u = 1 - t;
    return {
      x: u*u*u*p0.x + 3*u*u*t*p1.x + 3*u*t*t*p2.x + t*t*t*p3.x,
      y: u*u*u*p0.y + 3*u*u*t*p1.y + 3*u*t*t*p2.y + t*t*t*p3.y
    };
  };
  /** WAAPI keyframes that move an element (left/top 0, position fixed/absolute) along a cubic bezier, rotating along the tangent */
  K.bezFrames = function(p0, p1, p2, p3, steps, opts){
    opts = opts || {};
    var frames = [], prev = K.bez(p0,p1,p2,p3,0);
    for (var i = 0; i <= steps; i++){
      var t = i / steps, p = K.bez(p0,p1,p2,p3,t), n = K.bez(p0,p1,p2,p3,Math.min(1, t + 0.02));
      var ang = Math.atan2(n.y - p.y, n.x - p.x) * 180 / Math.PI;
      if (i === steps) ang = Math.atan2(p.y - prev.y, p.x - prev.x) * 180 / Math.PI;
      var rot = opts.noRotate ? (opts.rot || 0) : (ang * (opts.rotScale == null ? 1 : opts.rotScale) + (opts.rotOffset || 0));
      frames.push({transform:'translate(' + p.x.toFixed(1) + 'px,' + p.y.toFixed(1) + 'px) rotate(' + rot.toFixed(1) + 'deg)' + (opts.extra || '')});
      prev = p;
    }
    return frames;
  };

  /* ---- critter registry (max 2 critters visible at once, page-wide for our critters) ---- */
  var critters = {};
  K.critter = {
    claim: function(id){
      var n = Object.keys(critters).filter(function(k){ return critters[k] && k !== id; }).length;
      if (n >= 2) return false;
      critters[id] = true; return true;
    },
    release: function(id){ critters[id] = false; }
  };
})();
