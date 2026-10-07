/* ============================================================
   EGGS: 9. Search secrets (SL.searchEggs). Each returns a Promise that resolves when the gag
   ends (~3 s), then core navigates to the search results. Esc ends a gag early.
   - "pizza"            slices rain down; tap them to take bites
   - "pinewood"         a track draws itself over the search bar; a derby car zooms to a checkered finish
   - "do a barrel roll" the page spins once (a small wiggle under reduced motion / paused)
   - "bigfoot"          giant footprints stomp across the screen, shaking cards as they pass
   - "knot"             the search bar ties itself into a square knot; tap to untie
   ============================================================ */
(function(){
  'use strict';
  var SL = window.SL, K = SL && SL._egg; if (!K) return;
  SL.searchEggs = SL.searchEggs || {};

  /* shared gag runner: builds a layer, runs setup, ends after ms or on Esc / early done() */
  function gag(ms, setup){
    return new Promise(function(resolve){
      var layer = K.el('div', 'egg-gag', {'aria-hidden':'true'});
      document.body.appendChild(layer);
      var ended = false, cleanups = [], t;
      function done(){
        if (ended) return; ended = true;
        clearTimeout(t); offEsc && offEsc();
        cleanups.forEach(function(fn){ try { fn(); } catch(e){} });
        layer.classList.add('egg-fade-out');
        setTimeout(function(){ layer.remove(); resolve(); }, 300);
      }
      var offEsc = K.onEsc(function(){ offEsc = null; done(); });
      // never draw over ads
      K.adClip(layer);
      var onScroll = function(){ K.adClip(layer); };
      window.addEventListener('scroll', onScroll, {passive:true});
      cleanups.push(function(){ window.removeEventListener('scroll', onScroll); });
      t = setTimeout(done, ms);
      try { setup(layer, done, function(fn){ cleanups.push(fn); }, function(newMs){ clearTimeout(t); t = setTimeout(done, newMs); }); }
      catch(err){ if (window.console) console.error('[eggs:search]', err); done(); }
    });
  }
  function formRect(){
    var f = document.getElementById('search-form') || document.getElementById('search-input');
    var r = f && f.getBoundingClientRect();
    if (r && r.width > 40 && r.bottom > 0 && r.top < K.vh()) return {el:f, r:r};
    var w = Math.min(520, K.vw() - 40);
    return {el:null, r:K.rect((K.vw() - w)/2, Math.max(80, K.vh() * 0.25), w, 52)};
  }

  /* ---------------- PIZZA ---------------- */
  var sliceN = 0;
  function sliceSVG(id){
    return '<svg viewBox="0 0 60 72" width="60" height="72" aria-hidden="true"><defs><mask id="' + id + '" maskUnits="userSpaceOnUse" x="-5" y="-5" width="70" height="82"><rect x="-5" y="-5" width="70" height="82" fill="#fff"/><g class="bites"></g></mask></defs>' +
      '<g mask="url(#' + id + ')"><path d="M5 12 Q30 2 55 12 L30 69Z" fill="#FFE600" stroke="#12102B" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M3 9 Q30 -2 57 9 L54 17 Q30 7 6 17Z" fill="#D98A3A" stroke="#12102B" stroke-width="3" stroke-linejoin="round"/>' +
      '<circle cx="22" cy="24" r="5.5" fill="#FF5A1F" stroke="#12102B" stroke-width="2"/><circle cx="38" cy="27" r="5" fill="#FF5A1F" stroke="#12102B" stroke-width="2"/><circle cx="30" cy="43" r="4.5" fill="#FF5A1F" stroke="#12102B" stroke-width="2"/>' +
      '<path d="M14 30 l3 3 M42 38 l-2 3 M26 33 l2 -2" stroke="#3CF06E" stroke-width="2.5" stroke-linecap="round"/></g></svg>';
  }
  SL.searchEggs['pizza'] = function(){
    return gag(3200, function(layer){
      var vw = K.vw(), vh = K.vh(), n = vw < 640 ? 9 : 14;
      for (var i = 0; i < n; i++){
        var id = 'egg-pz-' + (++sliceN);
        var s = K.el('div', 'egg-pizza'); s.innerHTML = sliceSVG(id);
        s.style.left = K.rnd(10, vw - 70) + 'px';
        layer.appendChild(s);
        (function(s){
          var bites = 0;
          s.addEventListener('pointerdown', function(e){
            e.preventDefault();
            if (bites >= 3) return;
            var g = s.querySelector('.bites'), cy = 70 - bites * 20;
            [-9, 0, 9].forEach(function(dx){ g.appendChild(K.svgEl('circle', {cx:30 + dx, cy:cy - Math.abs(dx) * 0.3, r:9, fill:'#000'})); });
            bites++;
            K.sparkle(e.clientX, e.clientY, {count:5, spread:18, char:'•', colors:['#D98A3A','#FFE600']});
            if (bites >= 3){ s.classList.add('is-eaten'); }
          });
          if (K.motion() && s.animate){
            var dur = K.rnd(2100, 2900), delay = K.rnd(0, 700), rot = K.rnd(-200, 200);
            s.animate([
              {transform:'translateY(-100px) rotate(0deg)'},
              {transform:'translateY(' + (vh + 100) + 'px) rotate(' + rot + 'deg)'}
            ], {duration:dur, delay:delay, easing:'cubic-bezier(.35,.1,.7,.9)', fill:'both'});
          } else {
            s.style.top = K.rnd(80, vh - 120) + 'px';
            s.style.transform = 'rotate(' + K.rnd(-30, 30) + 'deg)';
            s.classList.add('egg-fade-in');
          }
        })(s);
      }
      K.say('Pizza! Tap the slices to take a bite.');
    });
  };

  /* ---------------- PINEWOOD ---------------- */
  SL.searchEggs['pinewood'] = function(){
    return gag(2900, function(layer){
      var f = formRect(), r = f.r;
      var W = Math.max(260, r.width + 30), H = 70;
      var x = r.left + r.width/2 - W/2, y = r.top + r.height/2 - H/2;
      var finX = W - 34;
      var svg = K.html('<svg class="egg-derby" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '">' +
        '<defs><pattern id="egg-checker" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="#fff"/><rect width="5" height="5" fill="#12102B"/><rect x="5" y="5" width="5" height="5" fill="#12102B"/></pattern></defs>' +
        '<rect class="egg-derby-bed" x="2" y="34" width="' + (W - 4) + '" height="22" rx="4" fill="#C9D3E3" stroke="#12102B" stroke-width="3" style="transform-box:fill-box;transform-origin:0 50%"/>' +
        '<path class="egg-derby-rail" d="M6 45 L' + (W - 6) + ' 45" stroke="#12102B" stroke-width="3" stroke-dasharray="1" pathLength="1"/>' +
        '<rect x="' + finX + '" y="8" width="20" height="50" fill="url(#egg-checker)" stroke="#12102B" stroke-width="2.5"/>' +
        '<g class="egg-derby-car"><path d="M4 42 L10 30 L44 33 L60 40 L60 46 L4 46Z" fill="#FF5A1F" stroke="#12102B" stroke-width="3" stroke-linejoin="round"/>' +
        '<rect x="20" y="33" width="10" height="6" fill="#5CC8FF" stroke="#12102B" stroke-width="2"/>' +
        '<text class="egg-derby-num" x="38" y="44" font-family="Press Start 2P, monospace" font-size="7" fill="#12102B">42</text>' +
        '<circle cx="14" cy="48" r="6" fill="#12102B"/><circle cx="14" cy="48" r="2" fill="#FFE600"/><circle cx="50" cy="48" r="6" fill="#12102B"/><circle cx="50" cy="48" r="2" fill="#FFE600"/></g>' +
        '</svg>');
      svg.style.left = x + 'px'; svg.style.top = y + 'px';
      layer.appendChild(svg);
      var car = svg.querySelector('.egg-derby-car'), rail = svg.querySelector('.egg-derby-rail'), bed = svg.querySelector('.egg-derby-bed');
      var endX = finX + 4;
      var finish = function(){
        var cr = svg.getBoundingClientRect();
        SL.confetti(cr.left + finX + 10, cr.top + 30, {count:16, spread:90, shapes:['■','★']});
        var tag = K.el('span', 'egg-derby-tag'); tag.textContent = 'FINISH!';
        tag.style.left = (cr.left + finX - 40) + 'px'; tag.style.top = (cr.top - 26) + 'px';
        layer.appendChild(tag);
      };
      if (!K.motion() || !car.animate){
        car.setAttribute('transform', 'translate(' + (endX - 60) + ' 0)');
        setTimeout(finish, 300);
        return;
      }
      bed.animate([{opacity:0, transform:'scaleX(.05)'}, {opacity:1, transform:'scaleX(1)'}], {duration:550, easing:'ease-out', fill:'both'});
      rail.animate([{strokeDashoffset:1}, {strokeDashoffset:0}], {duration:600, fill:'both'});
      car.animate([
        {transform:'translateX(-70px)', opacity:0},
        {transform:'translateX(-60px)', opacity:1, offset:.05},
        {transform:'translateX(' + (endX - 60) + 'px)'}
      ], {duration:1300, delay:550, easing:'cubic-bezier(.55,0,.85,.6)', fill:'both'}).onfinish = function(){
        car.animate([{transform:'translateX(' + (endX - 60) + 'px) rotate(0)'}, {transform:'translateX(' + (endX - 54) + 'px) rotate(-6deg)'}, {transform:'translateX(' + (endX - 60) + 'px) rotate(0)'}], {duration:300, fill:'forwards'});
        finish();
      };
      K.say('Pinewood derby! And they’re off!');
    });
  };

  /* ---------------- BARREL ROLL ---------------- */
  SL.searchEggs['do a barrel roll'] = function(){
    return gag(1800, function(layer, done, onEnd){
      var b = document.body, de = document.documentElement;
      if (!b.animate){ done(); return; }
      var prevOX = de.style.overflowX;
      de.style.overflowX = 'hidden';
      b.style.transformOrigin = '50% ' + (K.sy() + K.vh()/2) + 'px';
      var a;
      if (K.motion()){
        a = b.animate([{transform:'rotate(0deg)'}, {transform:'rotate(360deg)'}], {duration:1400, easing:'cubic-bezier(.5,0,.3,1)'});
      } else {
        a = b.animate([{transform:'rotate(0deg)'}, {transform:'rotate(-1.2deg)'}, {transform:'rotate(1.2deg)'}, {transform:'rotate(0deg)'}], {duration:600});
      }
      onEnd(function(){ a.cancel(); b.style.transformOrigin = ''; de.style.overflowX = prevOX; });
      a.onfinish = function(){ setTimeout(done, 150); };
    });
  };

  /* ---------------- BIGFOOT ---------------- */
  var FOOT = '<svg viewBox="0 0 80 120" width="80" height="120" aria-hidden="true">' +
    '<path d="M40 30 C62 30 70 50 66 72 C62 92 58 116 38 116 C20 116 16 98 18 80 C20 62 16 32 40 30Z" fill="#4A3424" stroke="#12102B" stroke-width="3"/>' +
    '<ellipse cx="18" cy="26" rx="7" ry="9" fill="#4A3424" stroke="#12102B" stroke-width="2.5"/><ellipse cx="31" cy="14" rx="7" ry="9" fill="#4A3424" stroke="#12102B" stroke-width="2.5"/>' +
    '<ellipse cx="45" cy="11" rx="7" ry="9" fill="#4A3424" stroke="#12102B" stroke-width="2.5"/><ellipse cx="58" cy="16" rx="6" ry="8" fill="#4A3424" stroke="#12102B" stroke-width="2.5"/>' +
    '<ellipse cx="68" cy="27" rx="5" ry="7" fill="#4A3424" stroke="#12102B" stroke-width="2.5"/></svg>';
  SL.searchEggs['bigfoot'] = function(){
    return gag(3300, function(layer, done, onEnd){
      var vw = K.vw(), vh = K.vh(), steps = vw < 640 ? 6 : 8;
      var a = {x:-40, y:vh * 0.85}, b = {x:vw + 40, y:vh * 0.25};
      var ang = Math.atan2(b.y - a.y, b.x - a.x), nx = -Math.sin(ang), ny = Math.cos(ang);
      var cards = SL.$$('.hero-card, .widget').filter(function(el){ return K.inView(el.getBoundingClientRect(), 0); });
      var timers = [], anims = [];
      onEnd(function(){ timers.forEach(clearTimeout); anims.forEach(function(x){ try { x.cancel(); } catch(e){} }); });
      for (var i = 1; i <= steps; i++){
        (function(i){
          timers.push(setTimeout(function(){
            var t = i / (steps + 1), side = i % 2 ? 1 : -1;
            var x = a.x + (b.x - a.x) * t + nx * 34 * side, y = a.y + (b.y - a.y) * t + ny * 34 * side;
            var f = K.el('div', 'egg-foot'); f.innerHTML = FOOT;
            f.style.left = (x - 40) + 'px'; f.style.top = (y - 60) + 'px';
            var rot = ang * 57.3 + 90;
            f.style.transform = 'rotate(' + rot + 'deg)' + (side < 0 ? ' scaleX(-1)' : '');
            layer.appendChild(f);
            if (K.motion() && f.animate){
              f.animate([{transform:'rotate(' + rot + 'deg) scale(1.7)' + (side < 0 ? ' scaleX(-1)' : ''), opacity:0}, {transform:f.style.transform, opacity:1}], {duration:140, easing:'ease-in'});
              K.sparkle(x, y + 30, {count:6, spread:40, char:'●', colors:['#C9B48A','#A8956C'], size:10});
              cards.forEach(function(c){
                var r = c.getBoundingClientRect(), cx = r.left + r.width/2, cy = r.top + r.height/2;
                var d = Math.hypot(cx - x, cy - y);
                if (d < Math.max(r.width, r.height) * 0.6 + 120){
                  anims.push(c.animate([{translate:'0 0'}, {translate:'-5px 3px'}, {translate:'5px -3px'}, {translate:'-3px 2px'}, {translate:'0 0'}], {duration:320, delay:100}));
                }
              });
            } else f.classList.add('egg-fade-in');
          }, 330 * (i - 1)));
        })(i);
      }
      K.say('Stomp! Stomp! Bigfoot walked across the page.');
    });
  };

  /* ---------------- KNOT ---------------- */
  SL.searchEggs['knot'] = function(){
    return gag(4200, function(layer, done, onEnd, extend){
      var f = formRect(), r = f.r;
      var W = Math.max(240, r.width), H = Math.max(64, r.height + 20);
      var vbH = 100, vbW = Math.round(vbH * W / H), cx = vbW / 2;
      var btn = K.el('button', 'egg-knot', {type:'button', 'aria-label':'The search bar tied itself in a knot! Tap to untie it'});
      btn.style.left = (r.left + r.width/2 - W/2) + 'px'; btn.style.top = (r.top + r.height/2 - H/2) + 'px';
      btn.style.width = W + 'px'; btn.style.height = H + 'px';
      function rope(d, color, cls){
        return '<g class="' + cls + '"><path d="' + d + '" fill="none" stroke="#12102B" stroke-width="15" stroke-linecap="round" stroke-linejoin="round" pathLength="1"/>' +
          '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" pathLength="1"/></g>';
      }
      var e = 8;
      var straightA = 'M' + e + ' 50 L' + cx + ' 50';
      var straightB = 'M' + cx + ' 50 L' + (vbW - e) + ' 50';
      var knotA = 'M' + e + ' 34 L' + (cx - 12) + ' 34 C' + (cx + 34) + ' 34 ' + (cx + 34) + ' 66 ' + (cx - 12) + ' 66 L' + e + ' 66';
      var knotB = 'M' + (vbW - e) + ' 38 L' + (cx + 12) + ' 38 C' + (cx - 34) + ' 38 ' + (cx - 34) + ' 62 ' + (cx + 12) + ' 62 L' + (vbW - e) + ' 62';
      btn.innerHTML = '<svg viewBox="0 0 ' + vbW + ' ' + vbH + '" width="100%" height="100%" aria-hidden="true">' +
        rope(straightA, '#E8B867', 'egg-k-straight') + rope(straightB, '#00E5FF', 'egg-k-straight') +
        rope(knotB, '#00E5FF', 'egg-k-knot') + rope(knotA, '#E8B867', 'egg-k-knot') +
        '</svg><span class="egg-knot-hint">tap to untie!</span>';
      layer.appendChild(btn);
      var straight = SL.$$('.egg-k-straight', btn), knot = SL.$$('.egg-k-knot path', btn), knotG = SL.$$('.egg-k-knot', btn);
      var formAnim = null;
      if (f.el && f.el.animate){ formAnim = f.el.animate([{opacity:1}, {opacity:.12}], {duration:300, fill:'forwards'}); }
      onEnd(function(){ formAnim && formAnim.cancel(); });
      var M = K.motion() && btn.animate;
      knot.forEach(function(p){ p.style.strokeDasharray = '1'; });
      if (M){
        knot.forEach(function(p){ p.animate([{strokeDashoffset:1}, {strokeDashoffset:0}], {duration:800, delay:350, easing:'ease-in-out', fill:'both'}); });
        straight.forEach(function(g){ g.animate([{opacity:1}, {opacity:1, offset:.3}, {opacity:0}], {duration:1100, fill:'forwards'}); });
        btn.animate([{transform:'scale(1)'}, {transform:'scale(1.06) rotate(-1deg)', offset:.7}, {transform:'scale(1)'}], {duration:1200, delay:300});
      } else {
        straight.forEach(function(g){ g.style.opacity = 0; });
      }
      var untied = false;
      btn.addEventListener('click', function(){
        if (untied) return; untied = true;
        K.sparkle(r.left + r.width/2, r.top + r.height/2, {count:8});
        btn.classList.add('is-untied');
        if (M){
          knot.forEach(function(p){ p.animate([{strokeDashoffset:0}, {strokeDashoffset:1}], {duration:500, fill:'forwards'}); });
          straight.forEach(function(g){ g.animate([{opacity:0}, {opacity:1}], {duration:400, delay:250, fill:'forwards'}); });
          knotG.forEach(function(g){ g.animate([{opacity:1}, {opacity:0}], {duration:300, delay:450, fill:'forwards'}); });
        } else { knotG.forEach(function(g){ g.style.opacity = 0; }); straight.forEach(function(g){ g.style.opacity = 1; }); }
        extend(900);
      });
      K.say('Uh oh, the search bar tied itself in a knot. Tap it to untie.');
    });
  };
})();
