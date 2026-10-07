/* ============================================================
   EGGS: footer campfire band (#campfire)
   10. S'mores toaster (id 'smores') — press and HOLD the "Hold to toast" button (or the marshmallow;
       keyboard: hold Space/Enter on the button). White → golden → brown → on fire.
       Let go at golden-brown → "Perfect!" + happy marshmallow dance + confetti.
       Hold too long → it catches fire: tap fast (or press Space/Enter fast) to blow it out.
   11. Constellation builder (id 'constellation') — tap stars to connect them (Big Dipper, Cassiopeia,
       Orion's Belt). A finished constellation lights up and animates (the Big Dipper pours sparkles).
       Keyboard: focus the star map, arrow keys pick a star, Enter connects.
       Fireflies blink and drift toward the cursor/finger.
   Also fills #egg-hint if the shell left it empty.
   ============================================================ */
(function(){
  'use strict';
  var SL = window.SL, K = SL && SL._egg; if (!K) return;

  K.ready(function(){
    var hint = document.getElementById('egg-hint');
    if (hint && !hint.textContent.trim()) hint.textContent = 'Psst… there are secrets hidden on this page.';
  });

  var host;
  K.ready(function(){
    host = document.getElementById('campfire');
    if (!host) return;
    // build when it gets near the viewport (lazy), never before the page is idle
    K.idle(function(){ SL.lazy(host, K.safe('campfire', build)); });
  });

  /* ---------------- helpers ---------------- */
  function hex(h){ h = h.replace('#',''); return [parseInt(h.substr(0,2),16), parseInt(h.substr(2,2),16), parseInt(h.substr(4,2),16)]; }
  function mix(a, b, t){ var A = hex(a), B = hex(b); return 'rgb(' + A.map(function(v, i){ return Math.round(v + (B[i] - v) * t); }).join(',') + ')'; }
  var TOAST = [[0,'#FFFDF5'],[0.3,'#F6E3A8'],[0.55,'#E8B460'],[0.7,'#C98A3E'],[0.85,'#8A5426'],[1,'#3A2416']];
  function toastColor(L){
    L = K.clamp(L, 0, 1);
    for (var i = 1; i < TOAST.length; i++){
      if (L <= TOAST[i][0]){ var a = TOAST[i-1], b = TOAST[i]; return mix(a[1], b[1], (L - a[0]) / (b[0] - a[0])); }
    }
    return TOAST[TOAST.length-1][1];
  }

  var FIRE_SVG =
    '<svg class="egg-fire-svg" viewBox="0 0 300 190" aria-hidden="true">' +
    '<ellipse class="egg-fire-glow" cx="100" cy="168" rx="95" ry="20" fill="#FFE600" opacity=".35"/>' +
    // stones
    '<g fill="#7A7A88" stroke="#12102B" stroke-width="2.5"><ellipse cx="40" cy="172" rx="14" ry="9"/><ellipse cx="66" cy="178" rx="14" ry="9"/><ellipse cx="100" cy="180" rx="15" ry="9"/><ellipse cx="134" cy="178" rx="14" ry="9"/><ellipse cx="160" cy="172" rx="14" ry="9"/></g>' +
    // logs
    '<g stroke="#12102B" stroke-width="3"><rect x="42" y="150" width="116" height="18" rx="9" fill="#8B5A2B" transform="rotate(-12 100 159)"/><rect x="42" y="150" width="116" height="18" rx="9" fill="#A86B34" transform="rotate(12 100 159)"/>' +
    '<circle cx="47" cy="146" r="6" fill="#E8B867" stroke-width="2"/><circle cx="153" cy="146" r="6" fill="#E8B867" stroke-width="2"/></g>' +
    // flames
    '<g class="egg-flames">' +
    '<path class="egg-flame f1" d="M100 34 C122 66 142 88 140 120 C138 146 122 158 100 158 C78 158 62 146 60 120 C58 94 76 82 82 58 C88 74 92 80 96 86 C98 68 98 52 100 34Z" fill="#FF5A1F" stroke="#12102B" stroke-width="3" stroke-linejoin="round"/>' +
    '<path class="egg-flame f2" d="M100 68 C114 88 126 104 124 126 C122 144 112 154 100 154 C88 154 78 144 76 126 C75 110 86 100 90 86 C94 96 96 100 98 102 C99 90 99 80 100 68Z" fill="#FF9F1C"/>' +
    '<path class="egg-flame f3" d="M100 100 C108 112 114 120 113 132 C112 144 106 152 100 152 C94 152 88 144 87 132 C87 122 94 116 100 100Z" fill="#FFE600"/>' +
    '</g>' +
    // stick + marshmallow
    '<g class="egg-stick"><path d="M300 22 L128 78" stroke="#12102B" stroke-width="9" stroke-linecap="round"/><path d="M300 22 L128 78" stroke="#A86B34" stroke-width="5" stroke-linecap="round"/>' +
    '<g class="egg-mallow" tabindex="-1">' +
    '<rect class="egg-mallow-body" x="94" y="64" width="34" height="28" rx="9" fill="#FFFDF5" stroke="#12102B" stroke-width="3" transform="rotate(-18 111 78)"/>' +
    '<g class="egg-mallow-face" transform="rotate(-18 111 78)"><circle cx="104" cy="75" r="2.2" fill="#12102B"/><circle cx="117" cy="75" r="2.2" fill="#12102B"/>' +
    '<path class="egg-mouth-happy" d="M105 81 Q110.5 86 116 81" stroke="#12102B" stroke-width="2" fill="none" stroke-linecap="round"/>' +
    '<path class="egg-mouth-worried" d="M105 84 Q110.5 79 116 84" stroke="#12102B" stroke-width="2" fill="none" stroke-linecap="round"/></g>' +
    '<g class="egg-mallow-fire"><path d="M111 30 C122 44 130 54 128 66 C126 74 118 78 111 78 C104 78 96 74 94 66 C92 56 102 48 106 40 C108 46 109 48 110 50 C110 42 110 36 111 30Z" fill="#FF9F1C" stroke="#12102B" stroke-width="2.5"/>' +
    '<path d="M111 50 C116 58 119 62 118 68 C117 73 114 75 111 75 C108 75 104 73 104 68 C104 62 108 58 111 50Z" fill="#FFE600"/></g>' +
    '</g></g>' +
    '</svg>';

  function build(){
    if (host.querySelector('.egg-camp')) return;
    K.ensurePositioned(host);
    var camp = K.el('div', 'egg-camp');
    camp.innerHTML =
      '<svg class="egg-sky" tabindex="0" role="group" aria-label="Star map. Use the arrow keys to pick a star and Enter to connect it to the last one. Tap stars to draw constellations."></svg>' +
      '<div class="egg-fireflies" aria-hidden="true"></div>' +
      '<div class="egg-fire">' + FIRE_SVG + '<div class="egg-embers" aria-hidden="true">' + new Array(9).join('<span class="egg-ember"></span>') + '</div></div>' +
      '<div class="egg-smores-ui">' +
        '<button type="button" class="egg-toast-btn">🔥 Hold to toast</button>' +
        '<div class="egg-toast-meter" aria-hidden="true"><span></span></div>' +
        '<p class="egg-toast-status" aria-live="polite">Toast a marshmallow!</p>' +
      '</div>' +
      '<p class="egg-star-status sr-only" aria-live="polite"></p>';
    host.appendChild(camp);
    SL.$$('.egg-ember', camp).forEach(function(e, i){
      e.style.left = (40 + Math.random() * 40) + '%';
      e.style.animationDelay = (-Math.random() * 3).toFixed(2) + 's';
      e.style.animationDuration = (1.8 + Math.random() * 1.6).toFixed(2) + 's';
      e.style.setProperty('--dx', ((Math.random() - .5) * 40).toFixed(0) + 'px');
    });
    smores(camp);
    stars(camp);
    fireflies(camp);
  }

  /* =========================================================
     S'MORES
     ========================================================= */
  function smores(camp){
    var btn = camp.querySelector('.egg-toast-btn'), status = camp.querySelector('.egg-toast-status');
    var meter = camp.querySelector('.egg-toast-meter span');
    var mallow = camp.querySelector('.egg-mallow'), body = camp.querySelector('.egg-mallow-body');
    var fireWrap = camp.querySelector('.egg-fire');
    var L = 0, holding = false, state = 'ready', fire = 0, blows = 0, iv = 0, last = 0, resetT = 0;

    function paint(){
      body.setAttribute('fill', state === 'charred' ? '#2A1A10' : toastColor(L));
      meter.style.width = (100 - Math.round(K.clamp(L, 0, 1) * 100)) + '%';   // dark cover shrinks to reveal the toast gradient
      mallow.style.setProperty('--fire', state === 'fire' ? K.clamp(fire, .2, 1.3).toFixed(2) : 0);
      fireWrap.classList.toggle('is-burning', state === 'fire');
      fireWrap.classList.toggle('is-worried', state === 'fire' || state === 'charred');
    }
    function setStatus(t){ status.textContent = t; }
    function tick(){
      var now = performance.now(), dt = Math.min(0.1, (now - last) / 1000); last = now;
      if (state === 'toasting' && holding){
        L += dt / 2.8;
        if (L >= 1){ catchFire(); }
      } else if (state === 'fire'){
        fire = Math.min(1.3, fire + dt * 0.28);
      }
      paint();
      if (!holding && state !== 'fire'){ clearInterval(iv); iv = 0; }
    }
    function run(){ if (!iv){ last = performance.now(); iv = setInterval(tick, 40); } }

    function startHold(){
      if (state === 'fire'){ blow(); return; }
      if (state !== 'ready' && state !== 'toasting') return;
      K.foundOnce('smores');
      clearTimeout(resetT);
      holding = true; state = 'toasting';
      fireWrap.classList.add('is-toasting');
      btn.classList.add('is-holding');
      setStatus('Toasting… let go at golden-brown!');
      run();
    }
    function endHold(){
      if (!holding) return;
      holding = false;
      fireWrap.classList.remove('is-toasting');
      btn.classList.remove('is-holding');
      if (state !== 'toasting') return;
      if (L < 0.25) setStatus('Keep holding to toast it.');
      else if (L < 0.55) setStatus('Getting warm… hold a bit longer.');
      else if (L <= 0.78) perfect();
      else { setStatus('A little crispy! Still tasty. Try for golden-brown.'); state = 'done'; resetLater(2200); }
    }
    function perfect(){
      state = 'done';
      setStatus('Perfect! Golden-brown! 🎉');
      fireWrap.classList.add('is-happy');
      var r = mallow.getBoundingClientRect();
      SL.confetti(r.left + r.width/2, r.top + r.height/2, {count:22, spread:130, shapes:['★','●','■']});
      resetLater(2600);
    }
    function catchFire(){
      state = 'fire'; holding = false; fire = 1; blows = 0;
      btn.classList.remove('is-holding'); fireWrap.classList.remove('is-toasting');
      btn.textContent = '💨 Blow! (tap fast)';
      setStatus('Uh oh, it caught fire! Tap fast to blow it out!');
      run();
    }
    function blow(){
      blows++;
      fire -= 0.16;
      var r = mallow.getBoundingClientRect();
      K.sparkle(r.left + r.width/2, r.top, {count:4, spread:26, char:'～', colors:['#DDEFFF','#FFFFFF']});
      if (fire <= 0){
        state = 'charred'; fire = 0;
        clearInterval(iv); iv = 0;
        setStatus('Phew! Blown out with ' + blows + ' puffs. Crunchy! Try again.');
        btn.textContent = '🔥 Hold to toast';
        paint();
        resetLater(2400);
      } else setStatus('Blow! ' + blows + ' puff' + (blows === 1 ? '' : 's') + '…');
      paint();
    }
    function resetLater(ms){
      clearTimeout(resetT);
      resetT = setTimeout(function(){
        L = 0; state = 'ready'; fire = 0;
        fireWrap.classList.remove('is-happy', 'is-burning', 'is-worried');
        btn.textContent = '🔥 Hold to toast';
        setStatus('Fresh marshmallow! Hold to toast.');
        paint();
      }, ms);
    }

    function down(e){
      if (e.button != null && e.button !== 0) return;
      e.preventDefault();
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch(err){}
      startHold();
    }
    [btn, mallow].forEach(function(t){
      t.addEventListener('pointerdown', down);
      t.addEventListener('pointerup', endHold);
      t.addEventListener('pointercancel', endHold);
      t.addEventListener('lostpointercapture', endHold);
      t.addEventListener('contextmenu', function(e){ e.preventDefault(); });
    });
    mallow.style.cursor = 'pointer';
    btn.addEventListener('keydown', function(e){
      if (e.key !== ' ' && e.key !== 'Enter') return;
      e.preventDefault();
      if (e.repeat) return;
      startHold();
    });
    btn.addEventListener('keyup', function(e){
      if (e.key !== ' ' && e.key !== 'Enter') return;
      e.preventDefault(); endHold();
    });
    btn.addEventListener('click', function(e){ e.preventDefault(); });
    paint();
  }

  /* =========================================================
     CONSTELLATIONS
     ========================================================= */
  var CONST = [
    {id:'dipper', name:'Big Dipper', ar:.46,
      stars:[[0,.22],[.17,.08],[.31,.15],[.47,.24],[.5,.62],[.86,.7],[.9,.24]],
      edges:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,3]]},
    {id:'belt', name:"Orion's Belt", ar:.36,
      stars:[[0,.9],[.5,.5],[1,.1]],
      edges:[[0,1],[1,2]]},
    {id:'cassi', name:'Cassiopeia', ar:.5,
      stars:[[0,.15],[.24,.85],[.5,.38],[.76,.95],[1,.2]],
      edges:[[0,1],[1,2],[2,3],[3,4]]}
  ];

  /* where each constellation goes, so they dodge the shell's hint text (top-left), the moon (top-right),
     the campfire (bottom-center) and the toast controls. W/H = sky size (top 62% of the band). */
  function boxes(W, H){
    var moonLeft = W * 0.93 - 54;
    if (W < 640){
      return {dipper:{x:W * .04, y:H * .45, w:W * .5}, belt:{x:W * .62, y:H * .06, w:Math.min(64, W * .16)}, cassi:{x:W * .55, y:H * .45, w:W * .4}};
    }
    if (W < 1000){
      var dw = Math.min(220, W * .25), cw = Math.min(200, W * .17);
      return {dipper:{x:320, y:H * .07, w:dw}, belt:{x:Math.max(24, W * .04), y:H * .58, w:80}, cassi:{x:Math.max(320 + dw + 16, moonLeft - cw - 16), y:H * .07, w:cw}};
    }
    var dx = Math.max(W * .2, 330), dW = Math.min(240, W * .22), cW = Math.min(200, W * .17), cx = moonLeft - cW - 30;
    var gapMid = (dx + dW + cx) / 2, bW = Math.min(110, W * .09);
    return {dipper:{x:dx, y:H * .07, w:dW}, belt:{x:gapMid - bW / 2, y:H * .1, w:bW}, cassi:{x:cx, y:H * .08, w:cW}};
  }

  function stars(camp){
    var svg = camp.querySelector('.egg-sky'), live = camp.querySelector('.egg-star-status');
    var S = [], lines = {}, sel = null, cursor = 0, doneCount = 0, W = 0, H = 0;
    var gFill, gLines, gStars, gFx, temp;

    function key(a, b){ return a < b ? a + '-' + b : b + '-' + a; }
    function layout(){
      W = svg.clientWidth || host.clientWidth; H = svg.clientHeight || 180;
      if (!W) return;
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      svg.innerHTML = '';
      gFill = K.svgEl('g', {'class':'egg-fillstars'});
      gLines = K.svgEl('g', {'class':'egg-lines'});
      gFx = K.svgEl('g', {'class':'egg-starfx'});
      gStars = K.svgEl('g', {'class':'egg-stars'});
      [gFill, gLines, gFx, gStars].forEach(function(g){ svg.appendChild(g); });
      // filler stars (decorative)
      var seed = 7;
      function rnd(){ seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
      var n = Math.round(W / 22);
      for (var i = 0; i < n; i++){
        var c = K.svgEl('circle', {cx:(rnd() * W).toFixed(1), cy:(rnd() * H * 0.92).toFixed(1), r:(0.7 + rnd() * 1.2).toFixed(1), 'class':'egg-fstar' + (rnd() < .35 ? ' tw' : '')});
        c.style.animationDelay = (-rnd() * 4).toFixed(2) + 's';
        gFill.appendChild(c);
      }
      // constellation stars
      var old = S; S = [];
      var B = boxes(W, H);
      CONST.forEach(function(C, ci){
        var bw = B[C.id].w, bh = bw * C.ar, bx = B[C.id].x, by = B[C.id].y;
        C._box = {x:bx, y:by, w:bw, h:bh};
        C._idx = [];
        C.stars.forEach(function(p, si){
          var s = {c:C, ci:ci, si:si, x:bx + p[0] * bw, y:by + p[1] * bh};
          s.idx = S.length; C._idx.push(s.idx); S.push(s);
          var g = K.svgEl('g', {'class':'egg-star'});
          g.appendChild(K.svgEl('circle', {cx:s.x, cy:s.y, r:12, 'class':'egg-star-halo'}));
          g.appendChild(K.svgEl('path', {d:starPath(s.x, s.y, 5.5, 2.4), 'class':'egg-star-shape'}));
          s.el = g;
          gStars.appendChild(g);
        });
        if (C._done) markDone(C, true);
      });
      // redraw existing lines
      Object.keys(lines).forEach(function(k){ var p = k.split('-'); drawLine(S[+p[0]], S[+p[1]], false); });
      if (sel != null && S[sel]) S[sel].el.classList.add('is-sel');
      showCursor(false);
    }
    function starPath(x, y, R, r){
      var d = '';
      for (var i = 0; i < 10; i++){
        var a = -Math.PI/2 + i * Math.PI / 5, rr = i % 2 ? r : R;
        d += (i ? 'L' : 'M') + (x + Math.cos(a) * rr).toFixed(1) + ' ' + (y + Math.sin(a) * rr).toFixed(1);
      }
      return d + 'Z';
    }
    function isEdge(a, b){
      if (S[a].ci !== S[b].ci) return false;
      var C = S[a].c, i = S[a].si, j = S[b].si;
      return C.edges.some(function(e){ return (e[0] === i && e[1] === j) || (e[0] === j && e[1] === i); });
    }
    function drawLine(a, b, animate){
      var l = K.svgEl('line', {x1:a.x, y1:a.y, x2:b.x, y2:b.y, 'class':'egg-cline c-' + a.c.id});
      gLines.appendChild(l);
      if (animate && K.motion() && l.animate){
        var len = Math.hypot(b.x - a.x, b.y - a.y);
        l.style.strokeDasharray = len; l.animate([{strokeDashoffset:len}, {strokeDashoffset:0}], {duration:260, easing:'ease-out'});
      }
      return l;
    }
    function wrongLine(a, b){
      var l = K.svgEl('line', {x1:a.x, y1:a.y, x2:b.x, y2:b.y, 'class':'egg-cline-wrong'});
      gLines.appendChild(l);
      setTimeout(function(){ l.remove(); }, 700);
    }
    function hintNeighbors(i){
      SL.$$('.egg-star.is-hint', svg).forEach(function(g){ g.classList.remove('is-hint'); });
      var C = S[i].c;
      C.edges.forEach(function(e){
        var a = C._idx[e[0]], b = C._idx[e[1]];
        if (lines[key(a, b)]) return;
        if (a === i) S[b].el.classList.add('is-hint');
        if (b === i) S[a].el.classList.add('is-hint');
      });
    }
    function pick(i){
      var s = S[i];
      if (sel === null){ select(i); live.textContent = s.c.name + ' star selected'; return; }
      if (sel === i){ S[sel].el.classList.remove('is-sel'); sel = null; SL.$$('.egg-star.is-hint', svg).forEach(function(g){ g.classList.remove('is-hint'); }); return; }
      var a = sel;
      if (isEdge(a, i)){
        var k = key(a, i);
        if (!lines[k]){
          lines[k] = true;
          drawLine(S[a], s, true);
          live.textContent = 'Connected!';
          checkDone(s.c);
        }
      } else {
        wrongLine(S[a], s);
        live.textContent = 'Those stars are not neighbors. Try another.';
      }
      select(i);
    }
    function select(i){
      if (sel !== null && S[sel]) S[sel].el.classList.remove('is-sel');
      sel = i; S[i].el.classList.add('is-sel');
      hintNeighbors(i);
      if (K.motion()) K.sparkle(svgToClient(S[i]).x, svgToClient(S[i]).y, {count:4, spread:14, size:10});
    }
    function svgToClient(s){
      var r = svg.getBoundingClientRect();
      return {x:r.left + s.x * (r.width / W), y:r.top + s.y * (r.height / H)};
    }
    function checkDone(C){
      if (C._done) return;
      var all = C.edges.every(function(e){ return lines[key(C._idx[e[0]], C._idx[e[1]])]; });
      if (!all) return;
      C._done = true; doneCount++;
      K.foundOnce('constellation');
      markDone(C, false);
      live.textContent = 'You drew ' + C.name + '!';
      SL.toast && SL.toast('✨ ' + C.name + '!');
      if (C.id === 'dipper') pour(C);
      if (C.id === 'belt') shootingStar(C);
      if (doneCount === CONST.length){
        setTimeout(function(){ var r = svg.getBoundingClientRect(); SL.confetti(r.left + r.width/2, r.top + 60, {count:30, spread:200, shapes:['★','✦']}); SL.toast && SL.toast('🌌 You mapped the whole sky!'); }, 1200);
      }
    }
    function markDone(C, quiet){
      C._idx.forEach(function(i, n){ S[i].el.classList.add('is-done'); S[i].el.style.setProperty('--d', (n * 0.12) + 's'); });
      SL.$$('.egg-cline.c-' + C.id, svg).forEach(function(l){ l.classList.add('is-done'); });
      var b = C._box;
      var t = K.svgEl('text', {x:b.x + b.w / 2, y:Math.min(H - 8, b.y + b.h + 22), 'class':'egg-cname', 'text-anchor':'middle'});
      t.textContent = C.name; gFx.appendChild(t);
    }
    function pour(C){
      // sparkles pour from the bowl's lip (Dubhe) and fall like water
      var lip = S[C._idx[6]], n = K.motion() ? 26 : 6;
      for (var i = 0; i < n; i++){
        (function(i){
          setTimeout(function(){
            var c = K.svgEl('path', {d:starPath(lip.x, lip.y, 4, 1.7), 'class':'egg-pour'});
            gFx.appendChild(c);
            if (!K.motion() || !c.animate){ setTimeout(function(){ c.remove(); }, 900); return; }
            var dx = 18 + Math.random() * 40, dy = H - lip.y - 40 - Math.random() * 30;
            c.animate([
              {transform:'translate(0,0)', opacity:1},
              {transform:'translate(' + dx * .6 + 'px,' + dy * .35 + 'px)', opacity:1, offset:.4},
              {transform:'translate(' + dx + 'px,' + dy + 'px)', opacity:0}
            ], {duration:1300 + Math.random() * 500, easing:'cubic-bezier(.4,0,.9,.6)'}).onfinish = function(){ c.remove(); };
          }, i * 80);
        })(i);
      }
    }
    function shootingStar(C){
      if (!K.motion()) return;
      var b = C._box, l = K.svgEl('line', {x1:b.x + b.w + 40, y1:b.y - 10, x2:b.x + b.w + 70, y2:b.y - 22, 'class':'egg-shoot'});
      gFx.appendChild(l);
      if (!l.animate){ l.remove(); return; }
      l.animate([{transform:'translate(0,0)', opacity:0}, {opacity:1, offset:.2}, {transform:'translate(-' + (b.w + 200) + 'px,' + 90 + 'px)', opacity:0}], {duration:1100, easing:'ease-in'}).onfinish = function(){ l.remove(); };
    }

    // pointer: nearest star within reach
    svg.addEventListener('pointerdown', function(e){
      var r = svg.getBoundingClientRect(), x = (e.clientX - r.left) * (W / r.width), y = (e.clientY - r.top) * (H / r.height);
      var best = -1, bd = 26;
      S.forEach(function(s, i){ var d = Math.hypot(s.x - x, s.y - y); if (d < bd){ bd = d; best = i; } });
      if (best > -1){ cursor = best; pick(best); }
    });
    // keyboard: arrows move a cursor between stars, Enter/Space picks
    function showCursor(on){
      SL.$$('.egg-star.is-cursor', svg).forEach(function(g){ g.classList.remove('is-cursor'); });
      if (on && S[cursor]) S[cursor].el.classList.add('is-cursor');
    }
    svg.addEventListener('focus', function(){ showCursor(true); });
    svg.addEventListener('blur', function(){ showCursor(false); });
    svg.addEventListener('keydown', function(e){
      var k = e.key;
      if (k === 'ArrowRight' || k === 'ArrowDown'){ cursor = (cursor + 1) % S.length; }
      else if (k === 'ArrowLeft' || k === 'ArrowUp'){ cursor = (cursor - 1 + S.length) % S.length; }
      else if (k === 'Enter' || k === ' '){ e.preventDefault(); pick(cursor); return; }
      else return;
      e.preventDefault();
      showCursor(true);
      var s = S[cursor];
      live.textContent = s.c.name + ', star ' + (s.si + 1) + ' of ' + s.c.stars.length;
    });

    layout();
    var rt = 0;
    window.addEventListener('resize', function(){ clearTimeout(rt); rt = setTimeout(function(){ if (svg.clientWidth !== W) layout(); }, 200); });
  }

  /* =========================================================
     FIREFLIES
     ========================================================= */
  function fireflies(camp){
    var box = camp.querySelector('.egg-fireflies');
    var n = K.vw() < 640 ? 5 : 8, F = [];
    for (var i = 0; i < n; i++){
      var el = K.el('span', 'egg-firefly');
      el.style.animationDelay = (-Math.random() * 3).toFixed(2) + 's';
      el.style.animationDuration = (2.2 + Math.random() * 1.8).toFixed(2) + 's';
      box.appendChild(el);
      F.push({el:el, x:Math.random(), y:0.3 + Math.random() * 0.55, vx:0, vy:0, ph:Math.random() * 6});
    }
    var W = 1, H = 1;
    function size(){ W = host.clientWidth || 1; H = host.clientHeight || 300; }
    function place(f){ f.el.style.transform = 'translate(' + (f.x * W).toFixed(1) + 'px,' + (f.y * H).toFixed(1) + 'px)'; }
    size(); F.forEach(place);

    var inView = false;
    var loop = K.loop(function(dt, t){
      var r = host.getBoundingClientRect(), px = K.pointer.x - r.left, py = K.pointer.y - r.top;
      var near = px > -40 && px < W + 40 && py > -40 && py < H + 40 && Date.now() - K.pointer.t < 4000;
      F.forEach(function(f){
        var ts = t / 1000;
        // gentle wander
        f.vx += Math.cos(ts * 0.7 + f.ph) * 0.01 * dt;
        f.vy += Math.sin(ts * 0.9 + f.ph * 1.3) * 0.02 * dt;
        if (near){
          var dx = px / W - f.x, dy = py / H - f.y, d = Math.hypot(dx * W, dy * H);
          if (d > 30){ f.vx += dx * 0.12 * dt; f.vy += dy * 0.3 * dt; }
        }
        f.vx *= (1 - 1.2 * dt); f.vy *= (1 - 1.2 * dt);
        f.x = K.clamp(f.x + f.vx * dt * 6, 0.01, 0.98);
        f.y = K.clamp(f.y + f.vy * dt * 6, 0.05, 0.92);
        place(f);
      });
    });
    function sync(){ if (inView && K.motion()) loop.start(); else loop.stop(); }
    if ('IntersectionObserver' in window){
      new IntersectionObserver(function(en){ inView = en[0].isIntersecting; sync(); }).observe(host);
    } else { inView = true; sync(); }
    K.onMotion(sync);
    window.addEventListener('resize', function(){ size(); F.forEach(place); });
  }
})();
