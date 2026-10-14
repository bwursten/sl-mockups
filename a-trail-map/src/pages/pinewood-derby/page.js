/* ============================================================
   Pinewood Derby HQ — section front (Agent PINEWOOD)
   Design-your-car builder + race, build trail, Hall of Fame gallery,
   eggs: pd-honk (tap car 5x) and pd-slowmo (hold Space / slow-mo button during a race)
   ============================================================ */
(function(){
  'use strict';

  /* ---------------- Car renderer (pure; viewBox 0 0 220 80, car faces right) ---------------- */
  var INK = '#1F2A22', CARD = '#FFFDF6', SUNNY = '#FFC629';
  var PAINTS = {
    tomato:{hex:'#F26B21', name:'Trail Orange', light:false},
    orange:{hex:'#F7A531', name:'Campfire', light:true},
    sunny:{hex:'#FFC629', name:'Sunshine', light:true},
    lime:{hex:'#8DBF4A', name:'Meadow', light:true},
    forest:{hex:'#1F5C3A', name:'Forest', light:false},
    teal:{hex:'#3E9C8A', name:'Pine Lake', light:false},
    sky:{hex:'#3FA9F5', name:'Sky', light:true},
    cobalt:{hex:'#1F64B0', name:'Deep Lake', light:false},
    bark:{hex:'#7A4E2D', name:'Bark', light:false},
    birch:{hex:'#FFFDF6', name:'Birch White', light:true}
  };
  var SHAPES = {
    wedge:{name:'Wedge', noun:'Wedge', body:'M14 58 L14 24 Q14 20 18 20 L34 20 L204 48 Q210 50 210 55 L210 58 Z', d:{cx:78, cy:45, r:9}, sy:44, tail:16},
    hotdog:{name:'Hot Dog', noun:'Hot Dog', body:'M12 50 Q12 40 26 40 L194 40 Q208 40 208 50 Q208 60 194 60 L26 60 Q12 60 12 50 Z', d:{cx:110, cy:50.5, r:6.5}, sy:48, tail:14},
    rocket:{name:'Rocket', noun:'Rocket', body:'M16 32 L146 32 Q200 34 212 47 Q200 60 146 60 L16 60 Z', d:{cx:92, cy:46, r:10}, sy:42, tail:18},
    shark:{name:'Shark', noun:'Shark', body:'M12 47 Q36 30 118 30 Q186 30 212 50 Q198 60 160 60 L30 60 Q14 58 12 47 Z', d:{cx:96, cy:44, r:9.5}, sy:40, tail:24},
    bus:{name:'Bus', noun:'Bus', body:'M12 22 Q12 16 18 16 L196 16 Q208 16 208 28 L208 54 Q208 60 202 60 L18 60 Q12 60 12 54 Z', d:{cx:96, cy:49, r:7.5}, sy:41, tail:14}
  };
  var DECALS = {none:'None', number:'Number', stars:'Stars', stripes:'Stripes', bolt:'Lightning bolt', paw:'Paw print', checkers:'Checkers'};
  var WHEELS = {standard:'Standard', racing:'Racing', glow:'Glow'};
  var DEFAULT = {shape:'wedge', paint:'cobalt', decal:'stars', wheels:'standard', num:7};

  function contrast(p){ return PAINTS[p] && PAINTS[p].light ? INK : CARD; }
  function star(cx, cy, r){
    var pts = [];
    for (var i = 0; i < 10; i++){
      var a = -Math.PI/2 + i*Math.PI/5, rr = i % 2 ? r*.45 : r;
      pts.push((cx + Math.cos(a)*rr).toFixed(1) + ' ' + (cy + Math.sin(a)*rr).toFixed(1));
    }
    return '<path d="M' + pts.join('L') + 'Z" fill="' + SUNNY + '" stroke="' + INK + '" stroke-width="1.6" stroke-linejoin="round"/>';
  }
  function decalSVG(d, sh, col){
    var a = sh.d, cx = a.cx, cy = a.cy, r = a.r, out = '', i, j;
    switch (d.decal){
      case 'number':
        out = '<circle cx="'+cx+'" cy="'+cy+'" r="'+(r+2.5)+'" fill="'+CARD+'" stroke="'+INK+'" stroke-width="2"/>' +
          '<text x="'+cx+'" y="'+(cy + r*.52)+'" text-anchor="middle" font-family="Alfa Slab One, Rockwell, Georgia, serif" font-size="'+(r*(String(d.num).length > 1 ? 1.25 : 1.5)).toFixed(1)+'" fill="'+INK+'">'+(d.num||7)+'</text>';
        break;
      case 'stars':
        out = star(cx - r*2.3, cy + 1, r*.75) + star(cx, cy, r) + star(cx + r*2.3, cy + 1, r*.75);
        break;
      case 'stripes':
        out = '<rect x="0" y="'+sh.sy+'" width="220" height="3.6" fill="'+col+'"/><rect x="0" y="'+(sh.sy+6.4)+'" width="220" height="3.6" fill="'+col+'"/>';
        break;
      case 'bolt':
        var k = r*1.25, P = [[-.25,-1],[.55,-1],[.12,-.18],[.6,-.18],[-.4,1],[-.02,.12],[-.5,.12]];
        out = '<path d="M' + P.map(function(p){ return (cx + p[0]*k).toFixed(1) + ' ' + (cy + p[1]*k).toFixed(1); }).join('L') + 'Z" fill="'+SUNNY+'" stroke="'+INK+'" stroke-width="1.8" stroke-linejoin="round"/>';
        break;
      case 'paw':
        out = '<ellipse cx="'+cx+'" cy="'+(cy + r*.35)+'" rx="'+(r*.62)+'" ry="'+(r*.5)+'" fill="'+col+'"/>';
        [[-.78,-.32],[-.28,-.78],[.28,-.78],[.78,-.32]].forEach(function(t){
          out += '<ellipse cx="'+(cx + t[0]*r).toFixed(1)+'" cy="'+(cy + t[1]*r).toFixed(1)+'" rx="'+(r*.24).toFixed(1)+'" ry="'+(r*.3).toFixed(1)+'" fill="'+col+'"/>';
        });
        break;
      case 'checkers':
        var x0 = sh.tail, s = 6;
        for (i = 0; i < 4; i++) for (j = 0; j < 14; j++){
          out += '<rect x="'+(x0 + i*s)+'" y="'+(j*s)+'" width="'+s+'" height="'+s+'" fill="'+((i + j) % 2 ? CARD : INK)+'"/>';
        }
        break;
    }
    return out;
  }
  function wheelSVG(cx, cy, type, uid){
    var g = '<g class="pd-wheel">';
    if (type === 'racing'){
      g += '<circle cx="'+cx+'" cy="'+cy+'" r="12" fill="'+INK+'"/><circle cx="'+cx+'" cy="'+cy+'" r="8" fill="'+CARD+'" stroke="'+INK+'" stroke-width="1.5"/>';
      for (var i = 0; i < 5; i++){
        var a = i*Math.PI*2/5 - Math.PI/2;
        g += '<path d="M'+cx+' '+cy+'L'+(cx + Math.cos(a)*7.4).toFixed(1)+' '+(cy + Math.sin(a)*7.4).toFixed(1)+'" stroke="#F26B21" stroke-width="2.2" stroke-linecap="round"/>';
      }
      g += '<circle cx="'+cx+'" cy="'+cy+'" r="2.2" fill="'+INK+'"/>';
    } else if (type === 'glow'){
      g += '<circle cx="'+cx+'" cy="'+cy+'" r="15" fill="#C6FF6B" opacity=".75" filter="url(#pdg-'+uid+')"/>' +
        '<circle cx="'+cx+'" cy="'+cy+'" r="12" fill="#B8F25C" stroke="'+INK+'" stroke-width="2"/>' +
        '<circle cx="'+cx+'" cy="'+cy+'" r="7.5" fill="none" stroke="#E9FFC7" stroke-width="1.6" stroke-dasharray="3 3"/>' +
        '<circle cx="'+cx+'" cy="'+cy+'" r="3.6" fill="'+CARD+'" stroke="'+INK+'" stroke-width="1.2"/>';
    } else {
      g += '<circle cx="'+cx+'" cy="'+cy+'" r="12" fill="'+INK+'"/><circle cx="'+cx+'" cy="'+cy+'" r="5" fill="#D8D2C4" stroke="'+INK+'" stroke-width="1"/>' +
        '<rect x="'+(cx - 1)+'" y="'+(cy - 10.5)+'" width="2" height="4" rx="1" fill="#6B6B6B"/>';
    }
    return g + '</g>';
  }
  function carSVG(d, uid){
    d = d || DEFAULT;
    var sh = SHAPES[d.shape] || SHAPES.wedge, P = PAINTS[d.paint] || PAINTS.cobalt, col = contrast(d.paint);
    var hex = P.hex, st = ' stroke="'+INK+'" stroke-width="3" stroke-linejoin="round"';
    var behind = '', front = '';
    if (d.shape === 'hotdog'){
      behind = '<rect x="6" y="28" width="208" height="18" rx="9" fill="#C8553D"'+st+'/>' +
        '<path d="M20 34' + (function(){ var s=''; for (var x = 20; x < 196; x += 12) s += ' q3 -5 6 0 t6 0'; return s; })() + '" fill="none" stroke="'+SUNNY+'" stroke-width="3" stroke-linecap="round"/>';
    } else if (d.shape === 'rocket'){
      var fin = (d.paint === 'sunny' || d.paint === 'orange') ? '#1F64B0' : SUNNY;
      behind = '<path d="M18 32 L8 10 L30 10 L58 32 Z" fill="'+fin+'"'+st+'/>';
      front = '<path d="M178 36 Q188 47 178 58" fill="none" stroke="'+col+'" stroke-width="3" stroke-linecap="round" opacity=".85"/>' +
        '<circle cx="150" cy="44" r="7.5" fill="#BFE3FB" stroke="'+INK+'" stroke-width="2.4"/><path d="M146 41 q3 -3 7 -1" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round"/>';
    } else if (d.shape === 'shark'){
      behind = '<path d="M86 32 L110 4 L130 32 Z" fill="'+hex+'"'+st+'/><path d="M20 46 L2 22 Q9 38 10 46 Q9 54 2 70 Z" fill="'+hex+'"'+st+'/>';
      front = '<path d="M34 59 Q120 52 208 52 Q196 60 160 60 L34 60 Z" fill="'+CARD+'" stroke="'+INK+'" stroke-width="1.5" stroke-linejoin="round"/>' +
        '<path d="M156 38 q-3 6 0 11 M164 38 q-3 6 0 11" stroke="'+INK+'" stroke-width="2" fill="none" stroke-linecap="round" opacity=".7"/>' +
        '<circle cx="186" cy="42" r="3.4" fill="'+INK+'"/><circle cx="187.2" cy="40.8" r="1.1" fill="#fff"/>' +
        '<path d="M190 50 q8 4 15 -1" stroke="'+INK+'" stroke-width="2" fill="none" stroke-linecap="round"/>';
    } else if (d.shape === 'bus'){
      var w = ''; [22, 48, 74, 100, 126].forEach(function(x){ w += '<rect x="'+x+'" y="22" width="21" height="13" rx="2.5" fill="#BFE3FB" stroke="'+INK+'" stroke-width="2"/>'; });
      front = w + '<path d="M156 22 H192 Q200 22 201 30 L202 36 H156 Z" fill="#BFE3FB" stroke="'+INK+'" stroke-width="2" stroke-linejoin="round"/>' +
        '<rect x="200" y="44" width="9" height="6" rx="2" fill="'+SUNNY+'" stroke="'+INK+'" stroke-width="1.5"/>';
    } else {
      front = '<path d="M60 23.5 L92 29 L92 33 L60 33 Z" fill="#BFE3FB" stroke="'+INK+'" stroke-width="2" stroke-linejoin="round"/>' +
        '<rect x="12" y="15" width="22" height="6" rx="2" fill="'+INK+'"/><path d="M18 21v-6M28 21v-6" stroke="'+INK+'" stroke-width="3"/>';
    }
    return '<defs><clipPath id="pdc-'+uid+'"><path d="'+sh.body+'"/></clipPath>' +
      (d.wheels === 'glow' ? '<filter id="pdg-'+uid+'" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="3"/></filter>' : '') + '</defs>' +
      '<ellipse cx="110" cy="75.5" rx="96" ry="3.6" fill="rgba(31,42,34,.22)"/>' +
      behind +
      '<path class="pd-body" d="'+sh.body+'" fill="'+hex+'"'+st+'/>' +
      '<path d="'+sh.body+'" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="1.4" transform="translate(1.5 2) scale(.985)" clip-path="url(#pdc-'+uid+')"/>' +
      '<g clip-path="url(#pdc-'+uid+')">' + decalSVG(d, sh, col) + '</g>' +
      front +
      '<path d="'+sh.body+'" fill="none"'+st+'/>' +
      wheelSVG(50, 62, d.wheels, uid) + wheelSVG(170, 62, d.wheels, uid);
  }
  var ICON_SHAPE = {body:'M8 8 H112 Q118 8 118 14 V40 Q118 46 112 46 H8 Q2 46 2 40 V14 Q2 8 8 8 Z', d:{cx:60, cy:27, r:11}, sy:21, tail:30};
  function decalIcon(k, d){
    var id = 'di' + Math.random().toString(36).slice(2, 8);
    return '<svg viewBox="-2 4 124 46" aria-hidden="true" focusable="false"><defs><clipPath id="pdc-'+id+'"><path d="'+ICON_SHAPE.body+'"/></clipPath></defs>' +
      '<path d="'+ICON_SHAPE.body+'" fill="'+PAINTS[d.paint].hex+'"/>' +
      '<g clip-path="url(#pdc-'+id+')">' + (k === 'none' ? '<path d="M44 14 L76 40" stroke="'+contrast(d.paint)+'" stroke-width="3" stroke-linecap="round" opacity=".5"/>' : decalSVG({decal:k, num:d.num}, ICON_SHAPE, contrast(d.paint))) + '</g>' +
      '<path d="'+ICON_SHAPE.body+'" fill="none" stroke="'+INK+'" stroke-width="3" stroke-linejoin="round"/></svg>';
  }
  function carName(d){
    var n = 'The ' + PAINTS[d.paint].name + ' ' + SHAPES[d.shape].noun;
    return d.decal === 'number' ? n + ' #' + d.num : n;
  }
  var api = {carSVG:carSVG, carName:carName, DEFAULT:DEFAULT};
  if (typeof window === 'undefined'){ if (typeof module !== 'undefined') module.exports = api; return; }

  var SL = window.SL;
  if (!SL || document.body.getAttribute('data-page') !== 'pinewood-derby') return;
  var $ = function(s, r){ return (r||document).querySelector(s); };
  var $$ = function(s, r){ return Array.prototype.slice.call((r||document).querySelectorAll(s)); };
  var uidN = 0;
  function svgWrap(d, cls, vb){
    var id = 'c' + (++uidN);
    return '<svg class="'+(cls||'')+'" viewBox="'+(vb||'-4 0 228 80')+'" aria-hidden="true" focusable="false">' + carSVG(d, id) + '</svg>';
  }
  function valid(d){
    return d && SHAPES[d.shape] && PAINTS[d.paint] && DECALS[d.decal] && WHEELS[d.wheels] && d.num >= 1 && d.num <= 99;
  }

  function onReady(fn){ if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }

  onReady(function(){
    var root = $('[data-pd-builder]');
    if (root) initBuilder(root);
    var trail = $('[data-pd-trail]');
    if (trail) initTrail(trail);
    var hof = $('[data-pd-hof]');
    if (hof) initGallery(hof);
  });

  /* =================================================================
     BUILDER + RACE
     ================================================================= */
  function initBuilder(root){
    SL.watchWidget && SL.watchWidget(root, 'pd-builder');
    var form = $('[data-pd-form]', root), benchBtn = $('[data-pd-car]', root), nameEl = $('[data-pd-name]', root);
    var noteEl = $('[data-pd-note]', root), numWrap = $('[data-pd-num]', root), numOut = $('[data-pd-numout]', root);
    var resultEl = $('[data-pd-result]', root), board = $('[data-pd-board]', root);
    var raceBtns = $$('[data-pd-race]', root), slowBtn = $('[data-pd-slowmo]', root);
    var trackWrap = $('.pd-trackwrap', root), carsG = $('[data-pd-cars]', root), countEl = $('.pd-count', root);
    var ribbon = $('.pd-ribbon', root), stamp = $('.pd-stamp', root), gate = $('.pd-gate', root), legendVals = {};
    $$('[data-pd-legend]', root).forEach(function(el){ legendVals[el.getAttribute('data-pd-legend')] = el; });

    var design = SL.store.get('pd-design', null);
    if (!valid(design)) design = JSON.parse(JSON.stringify(DEFAULT));
    form.addEventListener('submit', function(e){ e.preventDefault(); });

    /* ---- tile icons ---- */
    function paintIcons(){
      $$('[data-ico-shape]', root).forEach(function(el){
        el.innerHTML = svgWrap({shape:el.getAttribute('data-ico-shape'), paint:design.paint, decal:'none', wheels:'standard', num:1});
      });
      $$('[data-ico-decal]', root).forEach(function(el){
        el.innerHTML = decalIcon(el.getAttribute('data-ico-decal'), design);
      });
      $$('[data-ico-wheels]', root).forEach(function(el){
        var id = 'w' + (++uidN);
        el.innerHTML = '<svg viewBox="30 42 40 40" aria-hidden="true" focusable="false"><defs><filter id="pdg-'+id+'" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="3"/></filter></defs>' + wheelSVG(50, 62, el.getAttribute('data-ico-wheels'), id) + '</svg>';
      });
    }
    var NOTES = {
      wedge:'Wedge = aerodynamic! (small speed boost)',
      hotdog:'Relish the ride! Hot dogs are a classic.',
      rocket:'3… 2… 1… blast off down the track!',
      shark:'Fin-tastic! Keep the nose blunt for the start pin.',
      bus:'Boxy cars catch more air, but they look awesome.'
    };
    function render(){
      var name = carName(design);
      benchBtn.innerHTML = svgWrap(design, 'pd-benchsvg');
      benchBtn.setAttribute('aria-label', 'Your car: ' + name + '. Tap it to beep the horn.');
      nameEl.textContent = name;
      if (noteEl) noteEl.textContent = NOTES[design.shape];
      numWrap.hidden = design.decal !== 'number';
      numOut.textContent = design.num;
      if (legendVals.shape) legendVals.shape.textContent = SHAPES[design.shape].name;
      if (legendVals.paint) legendVals.paint.textContent = PAINTS[design.paint].name;
      if (legendVals.decal) legendVals.decal.textContent = DECALS[design.decal];
      if (legendVals.wheels) legendVals.wheels.textContent = WHEELS[design.wheels];
      ['shape','paint','decal','wheels'].forEach(function(k){
        var inp = form.querySelector('input[name="pd-'+k+'"][value="'+design[k]+'"]');
        if (inp) inp.checked = true;
      });
      paintIcons();
      if (!racing) placeCarsAtStart(true);
    }
    function save(){ SL.store.set('pd-design', design); }

    form.addEventListener('change', function(e){
      var t = e.target; if (!t.name || t.name.indexOf('pd-') !== 0) return;
      var k = t.name.slice(3);
      design[k] = t.value; save(); render();
      SL.trackInteract('pd-builder', k + '_' + t.value);
      hop();
    });
    $$('[data-pd-step]', root).forEach(function(b){
      b.addEventListener('click', function(){
        var n = design.num + parseInt(b.getAttribute('data-pd-step'), 10);
        design.num = n < 1 ? 99 : n > 99 ? 1 : n; save(); render();
        SL.trackInteract('pd-builder', 'number');
      });
    });
    var rnd = $('[data-pd-random]', root);
    if (rnd) rnd.addEventListener('click', function(){
      var pick = function(o){ return SL.rand(Object.keys(o)); };
      design = {shape:pick(SHAPES), paint:pick(PAINTS), decal:pick(DECALS), wheels:pick(WHEELS), num:1 + Math.floor(Math.random()*99)};
      save(); render(); hop();
      SL.trackInteract('pd-builder', 'surprise');
      resultEl.textContent = 'Surprise! Meet ' + carName(design) + '.';
    });
    function hop(){
      if (!SL.motionOK()) return;
      benchBtn.classList.remove('is-hop'); void benchBtn.offsetWidth; benchBtn.classList.add('is-hop');
    }

    /* ---- Track geometry (viewBox 0 0 1000 340) ---- */
    var lanes = $$('.pd-lane', root);
    var CAR_S = .52, HALF = 110*CAR_S, FINISH_X = 900, START_X = 84, END_X = 948;
    var laneInfo = lanes.map(function(p){
      var len = p.getTotalLength();
      function sAtX(x){ var lo = 0, hi = len; for (var k = 0; k < 26; k++){ var m = (lo+hi)/2; if (p.getPointAtLength(m).x < x) lo = m; else hi = m; } return lo; }
      return {p:p, len:len, s0:sAtX(START_X), sF:sAtX(FINISH_X - HALF), sEnd:sAtX(END_X - HALF)};
    });
    var RIVALS = [
      {name:'Trail Blazer', shape:'rocket', paint:'tomato', decal:'stripes', wheels:'racing', num:3},
      {name:'Moose Express', shape:'bus', paint:'sunny', decal:'number', wheels:'standard', num:12},
      {name:'Lake Zoomer', shape:'shark', paint:'teal', decal:'stars', wheels:'standard', num:5},
      {name:'Hot Diggity', shape:'hotdog', paint:'orange', decal:'none', wheels:'glow', num:8},
      {name:'Pine Comet', shape:'wedge', paint:'forest', decal:'checkers', wheels:'racing', num:9},
      {name:'Sky Paws', shape:'wedge', paint:'sky', decal:'paw', wheels:'standard', num:4}
    ];
    var field = [];   // [{d, name, mine, el, lane}]
    function pickRivals(){
      var r = SL.shuffle(RIVALS).slice(0, 2);
      field = [
        {d:r[0], name:r[0].name, mine:false},
        {d:design, name:'You', mine:true},
        {d:r[1], name:r[1].name, mine:false}
      ];
    }
    pickRivals();
    function buildCars(){
      carsG.innerHTML = field.map(function(c, i){
        var tag = c.mine ? '<g class="pd-youtag" transform="translate(0 -52)"><path d="M-22 -16h44v16h-14l-8 8-8-8h-14z" fill="'+SUNNY+'" stroke="'+INK+'" stroke-width="2.4" stroke-linejoin="round"/><text x="0" y="-3.5" text-anchor="middle">YOU</text></g>' : '';
        return '<g class="pd-tcar'+(c.mine ? ' is-mine' : '')+'" data-lane="'+i+'"><g transform="scale('+CAR_S+') translate(-110 -76)">' + carSVG(c.d, 't' + (++uidN) + i) + '</g>' + tag + '</g>';
      }).join('');
      field.forEach(function(c, i){ c.el = carsG.children[i]; c.lane = laneInfo[i]; });
    }
    function put(c, s){
      var L = c.lane, p = L.p.getPointAtLength(s), q = L.p.getPointAtLength(Math.min(L.len, s + 2));
      var a = Math.atan2(q.y - p.y, q.x - p.x) * 180 / Math.PI;
      c.el.setAttribute('transform', 'translate(' + p.x.toFixed(1) + ' ' + p.y.toFixed(1) + ') rotate(' + a.toFixed(2) + ')');
      var tag = c.el.querySelector('.pd-youtag'); if (tag) tag.setAttribute('transform', 'rotate(' + (-a).toFixed(2) + ') translate(0 -52)');
    }
    function placeCarsAtStart(rebuild){
      field[1].d = design;
      if (rebuild) buildCars();
      field.forEach(function(c){ put(c, c.lane.s0); });
    }

    /* ---- Race ---- */
    var racing = false, raced = false, raf = 0, slow = false, slowUsed = false, photo = false, flashT = 0, timers = [];
    var ORD = ['1st','2nd','3rd'];
    function later(fn, ms){ var t = setTimeout(fn, ms); timers.push(t); return t; }
    function setRacing(on){
      racing = on;
      raceBtns.forEach(function(b){ if (on) b.setAttribute('aria-disabled', 'true'); else b.removeAttribute('aria-disabled'); });
      slowBtn.hidden = !on;
      root.classList.toggle('is-racing', on);
      if (!on) setSlow(false);
    }
    function setSlow(on){
      if (slow === on) return;
      slow = on;
      slowBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
      trackWrap.classList.toggle('is-slow', on);
      if (on && racing){
        slowUsed = true;
        if (SL.motionOK()) flashLoop();
      } else { clearTimeout(flashT); }
    }
    function flashLoop(){
      clearTimeout(flashT);
      if (!slow || !racing || !SL.motionOK()) return;
      var f = document.createElement('span');
      f.className = 'pd-flash'; f.setAttribute('aria-hidden', 'true');
      f.style.left = (8 + Math.random()*84) + '%'; f.style.top = (6 + Math.random()*40) + '%';
      trackWrap.appendChild(f);
      setTimeout(function(){ f.remove(); }, 420);
      flashT = setTimeout(flashLoop, 420);   // ≤ 2.4 flashes per second
    }
    function hideResult(){
      ribbon.hidden = true; stamp.hidden = true; trackWrap.classList.remove('has-ribbon');
      board.innerHTML = ''; board.hidden = true;
    }
    function race(){
      if (racing) return;
      SL.trackInteract('pd-builder', raced ? 'race_again' : 'race');
      pickRivals(); placeCarsAtStart(true); hideResult();
      setRacing(true); slowUsed = false; photo = false;
      gate.classList.remove('is-open');
      // finish times (seconds): a little random, wedge gets a tiny "aerodynamic" bonus
      var times = field.map(function(c){
        var t = 2.55 + Math.random()*.55;
        if (c.d.shape === 'wedge') t -= .1;
        if (c.d.wheels === 'racing') t -= .03;
        return t;
      });
      var order = field.map(function(c, i){ return {i:i, t:times[i]}; }).sort(function(a, b){ return a.t - b.t; });
      var motion = SL.motionOK();
      var trackTop = trackWrap.getBoundingClientRect();
      if (trackTop.top < 0 || trackTop.bottom > window.innerHeight){
        trackWrap.scrollIntoView({block:'center', behavior: motion ? 'smooth' : 'auto'});
      }
      resultEl.textContent = 'On your marks… 3, 2, 1…';
      countEl.hidden = false;
      var steps = ['3','2','1','GO!'], k = 0;
      function tick(){
        countEl.firstElementChild.textContent = steps[k];
        countEl.className = 'pd-count' + (steps[k] === 'GO!' ? ' is-go' : '');
        if (motion){ countEl.firstElementChild.classList.remove('is-pop'); void countEl.offsetWidth; countEl.firstElementChild.classList.add('is-pop'); }
        if (k === 3){
          gate.classList.add('is-open');
          later(function(){ countEl.hidden = true; }, 520);
          resultEl.textContent = 'And they’re off!';
          if (motion) run(times, order); else instant(order);
          return;
        }
        k++; later(tick, 650);
      }
      tick();
    }
    function instant(order){
      // reduced motion: no movement; cars appear at the finish in order
      field.forEach(function(c){ c.el.classList.remove('is-rolling'); });
      later(function(){
        order.forEach(function(o, rank){
          var c = field[o.i]; put(c, rank === 0 ? c.lane.sF + 30 : c.lane.sF - rank*58);
        });
        photo = slowUsed || slow;
        finish(order);
      }, 900);
    }
    function run(times, order){
      field.forEach(function(c){ c.el.classList.add('is-rolling'); });
      var t = 0, last = 0, total = Math.max.apply(null, times) + .9, leaderT = order[0].t;
      function frame(now){
        if (!last) last = now;
        var dt = Math.min(.05, (now - last) / 1000); last = now;
        if (!SL.motionOK()){ cancelAnimationFrame(raf); field.forEach(function(c){ c.el.classList.remove('is-rolling'); });
          order.forEach(function(o, rank){ var c = field[o.i]; put(c, rank === 0 ? c.lane.sF + 30 : c.lane.sF - rank*58); });
          photo = slowUsed; finish(order); return; }
        var near = t > leaderT - .55 && t < leaderT + .3;
        var scale = slow && near ? .25 : 1;
        trackWrap.classList.toggle('is-slowing', slow && near);
        t += dt*scale;
        if (slow && Math.abs(t - leaderT) < .18) photo = true;
        field.forEach(function(c, i){
          var T = times[i], L = c.lane, s;
          if (t <= T) s = L.s0 + (L.sF - L.s0) * Math.pow(t / T, 1.7);
          else s = L.sF + (L.sEnd - L.sF) * (1 - Math.exp(-(t - T) * 3.2));
          put(c, Math.min(s, L.sEnd));
        });
        if (t < total) raf = requestAnimationFrame(frame);
        else { field.forEach(function(c){ c.el.classList.remove('is-rolling'); }); finish(order); }
      }
      raf = requestAnimationFrame(frame);
    }
    var LINES = {
      0:['Blue-ribbon speed! %s took 1st!', '1st place! %s was flying!', 'Zoom! %s took 1st by a nose!'],
      1:['So close! %s took 2nd, just a nose behind.', '%s took 2nd! What a race!', '2nd place for %s! Try polishing those axles.'],
      2:['%s took 3rd. Great paint job, though!', '%s took 3rd. Check the Build Trail for speed tips!', '3rd place for %s. Next time, add weight near the back!']
    };
    function finish(order){
      trackWrap.classList.remove('is-slowing');
      var myRank = 0;
      order.forEach(function(o, r){ if (field[o.i].mine) myRank = r; });
      var nm = carName(design);
      var line = SL.rand(LINES[myRank]).replace('%s', nm);
      if (design.shape === 'wedge' && myRank === 0) line += ' (Wedge bonus: aerodynamic!)';
      ribbon.className = 'pd-ribbon p' + (myRank + 1);
      ribbon.querySelector('.pd-ribbon-n').textContent = ORD[myRank];
      ribbon.hidden = false; trackWrap.classList.add('has-ribbon');
      board.innerHTML = order.map(function(o, r){
        var c = field[o.i];
        return '<li' + (c.mine ? ' class="is-mine"' : '') + '><span class="pd-board-n">' + ORD[r] + '</span> ' + (c.mine ? 'You: ' + nm : c.name) + ' <span class="pd-board-l">(lane ' + (o.i + 1) + ')</span></li>';
      }).join('');
      board.hidden = false;
      resultEl.textContent = line;
      if (SL.motionOK()){
        ribbon.animate([{transform:'translateY(-30px) scale(0)'}, {transform:'translateY(4px) scale(1.12)', offset:.6}, {transform:'none'}], {duration:480, easing:'ease-out'});
        if (myRank === 0) SL.confettiAt(ribbon, {count:20, spread:130, shapes:['★','●','■']});
      }
      if (photo){
        stamp.hidden = false;
        if (SL.motionOK()) stamp.animate([{transform:'rotate(-9deg) scale(2.2)', opacity:0}, {transform:'rotate(-9deg) scale(.92)', opacity:1, offset:.7}, {transform:'rotate(-9deg) scale(1)', opacity:1}], {duration:420, easing:'ease-out'});
        resultEl.textContent = 'PHOTO FINISH! ' + line;
        SL.eggFound('pd-slowmo');
      }
      setRacing(false); raced = true;
      raceBtns.forEach(function(b){ var l = b.querySelector('[data-pd-label]'); if (l) l.textContent = l.getAttribute('data-again') || 'Race again!'; });
    }
    raceBtns.forEach(function(b){ b.addEventListener('click', race); });

    /* slow-mo: hold Space during a race, or press-and-hold the slow-mo button */
    var spaceHeld = false;
    function isField(el){ return el && (el.tagName === 'INPUT' && el.type !== 'radio' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable); }
    document.addEventListener('keydown', function(e){
      if ((e.key === ' ' || e.code === 'Space') && racing && !isField(e.target)){ e.preventDefault(); spaceHeld = true; setSlow(true); }
      if (e.key === 'Escape'){ setSlow(false); stopLap(); hideHonk(); }
    });
    document.addEventListener('keyup', function(e){
      if (e.key === ' ' || e.code === 'Space'){ if (racing || spaceHeld) e.preventDefault(); spaceHeld = false; setSlow(false); }
    });
    slowBtn.addEventListener('pointerdown', function(e){ e.preventDefault(); try { slowBtn.setPointerCapture(e.pointerId); } catch(err){} setSlow(true); });
    ['pointerup','pointercancel','lostpointercapture'].forEach(function(ev){ slowBtn.addEventListener(ev, function(){ setSlow(false); }); });
    slowBtn.addEventListener('keydown', function(e){ if (e.key === 'Enter'){ e.preventDefault(); setSlow(true); } });
    slowBtn.addEventListener('keyup', function(e){ if (e.key === 'Enter') setSlow(false); });
    slowBtn.addEventListener('contextmenu', function(e){ e.preventDefault(); });

    /* =============== Egg: honk & vroom (tap the bench car 5 times) =============== */
    var taps = 0, tapT = 0, honkEl = $('.pd-honk', root), beepEl = $('.pd-beep', root), honkT = 0, lap = null;
    benchBtn.addEventListener('click', function(){
      if (lap) { stopLap(); return; }
      var now = Date.now();
      taps = now - tapT < 1500 ? taps + 1 : 1; tapT = now;
      hop();
      if (taps < 5){
        beepEl.textContent = taps >= 3 ? 'beep beep!' : 'beep!';
        beepEl.hidden = false; beepEl.classList.remove('is-pop'); void beepEl.offsetWidth; beepEl.classList.add('is-pop');
        clearTimeout(honkT); honkT = setTimeout(function(){ beepEl.hidden = true; }, 900);
        return;
      }
      taps = 0; beepEl.hidden = true;
      honk();
    });
    function hideHonk(){ honkEl.hidden = true; root.classList.remove('is-honking'); }
    function honk(){
      SL.eggFound('pd-honk');
      SL.trackInteract('pd-builder', 'honk');
      honkEl.hidden = false;
      clearTimeout(honkT);
      if (!SL.motionOK()){ honkT = setTimeout(hideHonk, 2200); return; }
      root.classList.add('is-honking');
      puffs();
      honkT = setTimeout(function(){ hideHonk(); startLap(); }, 1100);
    }
    function puffs(){
      var bench = $('.pd-bench', root), br = bench.getBoundingClientRect(), cr = benchBtn.getBoundingClientRect();
      for (var i = 0; i < 6; i++){
        (function(i){
          setTimeout(function(){
            var p = document.createElement('span');
            p.className = 'pd-puff'; p.setAttribute('aria-hidden', 'true');
            p.style.left = (cr.left - br.left + cr.width*.06) + 'px';
            p.style.top = (cr.top - br.top + cr.height*.62 + (Math.random()*10 - 5)) + 'px';
            bench.appendChild(p);
            setTimeout(function(){ p.remove(); }, 1000);
          }, i*140);
        })(i);
      }
    }
    function startLap(){
      if (!SL.motionOK() || lap) return;
      var el = document.createElement('div');
      el.className = 'pd-lap'; el.setAttribute('aria-hidden', 'true'); el.title = 'Click to park';
      el.innerHTML = svgWrap(design, '');
      document.body.appendChild(el);
      el.addEventListener('click', stopLap);
      benchBtn.classList.add('is-away');
      var cw = el.offsetWidth, ch = el.offsetHeight, t0 = 0, DUR = 5200;
      lap = {el:el, raf:0};
      function geo(){
        var W = document.documentElement.clientWidth, H = window.innerHeight, L = 6 + ch/2, R = Math.min(70, W/5, H/5);
        var segs = [
          {t:'l', x0:L+R, y0:H-L, x1:W-L-R, y1:H-L, a0:0, a1:0},
          {t:'a', cx:W-L-R, cy:H-L-R, s:Math.PI/2, e:0, a0:0, a1:-90},
          {t:'l', x0:W-L, y0:H-L-R, x1:W-L, y1:L+R, a0:-90, a1:-90},
          {t:'a', cx:W-L-R, cy:L+R, s:0, e:-Math.PI/2, a0:-90, a1:-180},
          {t:'l', x0:W-L-R, y0:L, x1:L+R, y1:L, a0:-180, a1:-180},
          {t:'a', cx:L+R, cy:L+R, s:-Math.PI/2, e:-Math.PI, a0:-180, a1:-270},
          {t:'l', x0:L, y0:L+R, x1:L, y1:H-L-R, a0:-270, a1:-270},
          {t:'a', cx:L+R, cy:H-L-R, s:-Math.PI, e:-Math.PI*1.5, a0:-270, a1:-360}
        ];
        var tot = 0;
        segs.forEach(function(sg){ sg.len = sg.t === 'l' ? Math.hypot(sg.x1-sg.x0, sg.y1-sg.y0) : R*Math.PI/2; tot += sg.len; });
        return {segs:segs, tot:tot, R:R};
      }
      function frame(now){
        if (!lap) return;
        var G = geo();
        if (!SL.motionOK()){ stopLap(); return; }
        if (!t0) t0 = now;
        var u = Math.min(1, (now - t0) / DUR), ease = u < .5 ? 2*u*u : 1 - Math.pow(-2*u + 2, 2)/2;
        var dist = ease * G.tot, x = 0, y = 0, a = 0;
        for (var i = 0; i < G.segs.length; i++){
          var sg = G.segs[i];
          if (dist <= sg.len || i === G.segs.length - 1){
            var f = Math.max(0, Math.min(1, dist / sg.len));
            if (sg.t === 'l'){ x = sg.x0 + (sg.x1 - sg.x0)*f; y = sg.y0 + (sg.y1 - sg.y0)*f; }
            else { var ang = sg.s + (sg.e - sg.s)*f; x = sg.cx + Math.cos(ang)*G.R; y = sg.cy + Math.sin(ang)*G.R; }
            a = sg.a0 + (sg.a1 - sg.a0)*f;
            break;
          }
          dist -= sg.len;
        }
        var wheelie = u < .16 ? -22*Math.sin(u/.16*Math.PI) : (u > .9 ? -10*Math.sin((u-.9)/.1*Math.PI) : 0);
        el.style.transform = 'translate(' + (x - cw/2).toFixed(1) + 'px,' + (y - ch/2).toFixed(1) + 'px) rotate(' + (a + wheelie).toFixed(1) + 'deg)';
        if (u < 1) lap.raf = requestAnimationFrame(frame); else stopLap();
      }
      lap.raf = requestAnimationFrame(frame);
    }
    function stopLap(){
      if (!lap) return;
      cancelAnimationFrame(lap.raf);
      var el = lap.el; lap = null;
      if (SL.motionOK()){ el.style.transition = 'opacity .25s'; el.style.opacity = '0'; setTimeout(function(){ el.remove(); }, 260); }
      else el.remove();
      benchBtn.classList.remove('is-away');
      hop();
    }

    document.addEventListener('sl:motion', function(e){
      if (!e.detail.ok){ stopLap(); clearTimeout(flashT); }
    });

    render();
  }

  /* =================================================================
     BUILD TRAIL (checkpoints with aria-expanded)
     ================================================================= */
  function initTrail(root){
    var btns = $$('.pd-cp-btn', root), done = $('.pd-trail-done', root), seen = {};
    function open(b, track){
      btns.forEach(function(x){
        var on = x === b;
        x.setAttribute('aria-expanded', on ? 'true' : 'false');
        document.getElementById(x.getAttribute('aria-controls')).hidden = !on;
        x.parentNode.classList.toggle('is-open', on);
      });
      seen[b.getAttribute('aria-controls')] = 1;
      b.parentNode.classList.add('is-seen');
      if (track){
        SL.trackInteract('pd-trail', 'checkpoint_' + b.getAttribute('data-cp'));
        if (Object.keys(seen).length === btns.length && done && done.hidden){
          done.hidden = false;
          if (SL.motionOK()) done.animate([{transform:'rotate(-8deg) scale(1.8)', opacity:0}, {transform:'rotate(-8deg) scale(1)', opacity:1}], {duration:380, easing:'ease-out'});
          SL.trackInteract('pd-trail', 'complete');
        }
      }
    }
    btns.forEach(function(b, i){
      b.addEventListener('click', function(){
        if (b.getAttribute('aria-expanded') === 'true' && window.matchMedia('(max-width:799px)').matches){
          b.setAttribute('aria-expanded', 'false'); document.getElementById(b.getAttribute('aria-controls')).hidden = true; b.parentNode.classList.remove('is-open'); return;
        }
        open(b, true);
      });
      b.addEventListener('keydown', function(e){
        var k = e.key, j = -1;
        if (k === 'ArrowRight' || k === 'ArrowDown') j = (i + 1) % btns.length;
        else if (k === 'ArrowLeft' || k === 'ArrowUp') j = (i - 1 + btns.length) % btns.length;
        else if (k === 'Home') j = 0; else if (k === 'End') j = btns.length - 1;
        if (j >= 0){ e.preventDefault(); btns[j].focus(); }
      });
    });
    root.classList.add('is-ready');
    open(btns[0], false);
  }

  /* =================================================================
     HALL OF FAME gallery (scroll-snap; arrows, drag, dots, keyboard; no auto-advance)
     ================================================================= */
  function initGallery(root){
    var track = $('.pd-hof-track', root), slides = $$('.pd-hof-slide', root);
    var prev = $('[data-dir="-1"]', root), next = $('[data-dir="1"]', root), dotsEl = $('.pd-hof-dots', root), live = $('.pd-hof-live', root);
    var count = $('.pd-hof-count', root);
    var idx = 0, per = 1, max = 0, dots = [];
    root.classList.add('is-ready');
    function step(){ return slides.length > 1 ? slides[1].offsetLeft - slides[0].offsetLeft : track.clientWidth; }
    function measure(){
      var st = step();
      per = Math.max(1, Math.round((track.clientWidth + 4) / st));
      max = Math.max(0, slides.length - per);
      if (dots.length !== max + 1){
        dotsEl.innerHTML = '';
        dots = [];
        for (var i = 0; i <= max; i++){
          var b = document.createElement('button');
          b.type = 'button'; b.className = 'pd-hof-dot';
          b.setAttribute('aria-label', 'Show ' + slides[i].getAttribute('data-name'));
          (function(i){ b.addEventListener('click', function(){ go(i, true); SL.trackInteract('pd-hof', 'dot'); }); })(i);
          dotsEl.appendChild(b); dots.push(b);
        }
      }
      sync();
    }
    function current(){ return Math.max(0, Math.min(max, Math.round(track.scrollLeft / step()))); }
    function sync(){
      idx = current();
      dots.forEach(function(d, i){ if (i === idx) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current'); });
      prev.setAttribute('aria-disabled', idx <= 0 ? 'true' : 'false');
      next.setAttribute('aria-disabled', idx >= max ? 'true' : 'false');
      var a = idx + 1, b = Math.min(slides.length, idx + per);
      count.textContent = (a === b ? a : a + '–' + b) + ' of ' + slides.length;
      slides.forEach(function(s, i){ s.classList.toggle('is-in', i >= idx && i < idx + per); });
    }
    function go(i, announce){
      i = Math.max(0, Math.min(max, i));
      track.scrollTo({left: slides[i].offsetLeft - slides[0].offsetLeft, behavior: SL.motionOK() ? 'smooth' : 'auto'});
      if (announce){
        var b = Math.min(slides.length, i + per);
        live.textContent = 'Showing ' + slides[i].getAttribute('data-name') + (per > 1 ? ' and ' + (b - i - 1) + ' more' : '') + ', ' + (i + 1) + ' of ' + slides.length + '.';
      }
    }
    prev.addEventListener('click', function(){ if (idx > 0){ go(idx - 1, true); SL.trackInteract('pd-hof', 'prev'); } });
    next.addEventListener('click', function(){ if (idx < max){ go(idx + 1, true); SL.trackInteract('pd-hof', 'next'); } });
    var st = 0;
    track.addEventListener('scroll', function(){ cancelAnimationFrame(st); st = requestAnimationFrame(sync); }, {passive:true});
    root.addEventListener('keydown', function(e){
      if (e.target.closest && e.target.closest('.pd-hof-ctrl')) return;
      var k = e.key;
      if (k === 'ArrowRight'){ e.preventDefault(); go(idx + 1, true); }
      else if (k === 'ArrowLeft'){ e.preventDefault(); go(idx - 1, true); }
      else if (k === 'Home'){ e.preventDefault(); go(0, true); }
      else if (k === 'End'){ e.preventDefault(); go(max, true); }
    });
    // keep focused slide links fully in view
    track.addEventListener('focusin', function(e){
      var s = e.target.closest('.pd-hof-slide'); if (!s) return;
      var i = slides.indexOf(s);
      if (i < idx || i >= idx + per) go(i - (i >= idx + per ? per - 1 : 0), false);
    });
    // mouse drag (touch uses native swipe)
    var drag = null, moved = false;
    track.addEventListener('pointerdown', function(e){
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      drag = {x:e.clientX, s:track.scrollLeft}; moved = false;
      track.classList.add('is-drag');
    });
    window.addEventListener('pointermove', function(e){
      if (!drag) return;
      var dx = e.clientX - drag.x;
      if (Math.abs(dx) > 5) moved = true;
      track.scrollLeft = drag.s - dx;
    });
    window.addEventListener('pointerup', function(e){
      if (!drag) return;
      var dx = e.clientX - drag.x; drag = null;
      track.classList.remove('is-drag');
      if (moved){
        var base = Math.round((track.scrollLeft) / step());
        if (Math.abs(dx) > 40) base = dx < 0 ? Math.ceil(track.scrollLeft / step() - .15) : Math.floor(track.scrollLeft / step() + .15);
        go(base, false); SL.trackInteract('pd-hof', 'drag');
      }
    });
    track.addEventListener('click', function(e){ if (moved){ e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    track.addEventListener('dragstart', function(e){ e.preventDefault(); });
    var rt = 0;
    window.addEventListener('resize', function(){ clearTimeout(rt); rt = setTimeout(measure, 120); });
    measure();
    SL.watchWidget && SL.watchWidget(root, 'pd-hof');
  }
})();
