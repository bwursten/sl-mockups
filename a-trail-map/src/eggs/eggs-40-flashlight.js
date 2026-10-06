/* ============================================================
   EGGS: 6. Flashlight hunt (id 'flashlight-hunt')
   Trigger: tap the logo in Morse SOS  ··· − − − ···  (detector lives in eggs-10-logo.js;
            short tap < 300 ms, long press ≥ 300 ms; keyboard: focus logo, use Space short/long).
   Effect: page goes dark, pointer/finger becomes a flashlight beam (arrow keys move it too).
           Find 5 glowing critters (firefly, owl, raccoon, frog, moth) — tap/click them inside the beam
           (keyboard: Enter looks at the beam's center). "Lights on" button or Esc ends it.
   ============================================================ */
(function(){
  'use strict';
  var SL = window.SL, K = SL && SL._egg; if (!K) return;

  var CRITTERS = [
    {id:'firefly', name:'firefly', svg:'<svg viewBox="0 0 60 60" aria-hidden="true"><ellipse cx="22" cy="22" rx="11" ry="7" fill="#DDEFFF" stroke="#1F2A22" stroke-width="2.5" transform="rotate(-30 22 22)"/><ellipse cx="38" cy="22" rx="11" ry="7" fill="#DDEFFF" stroke="#1F2A22" stroke-width="2.5" transform="rotate(30 38 22)"/><ellipse cx="30" cy="30" rx="7" ry="13" fill="#3A3A4A" stroke="#1F2A22" stroke-width="2.5"/><circle cx="30" cy="45" r="8" fill="#D8FF5A" stroke="#1F2A22" stroke-width="2.5"/><circle cx="30" cy="17" r="5" fill="#F26B21" stroke="#1F2A22" stroke-width="2"/></svg>', glow:'#D8FF5A'},
    {id:'owl', name:'owl', svg:'<svg viewBox="0 0 60 60" aria-hidden="true"><path d="M10 14 L18 22 L42 22 L50 14 L50 44 C50 54 40 58 30 58 C20 58 10 54 10 44Z" fill="#8B5A2B" stroke="#1F2A22" stroke-width="2.5" stroke-linejoin="round"/><circle cx="21" cy="32" r="9" fill="#FFC629" stroke="#1F2A22" stroke-width="2.5"/><circle cx="39" cy="32" r="9" fill="#FFC629" stroke="#1F2A22" stroke-width="2.5"/><circle cx="21" cy="32" r="4" fill="#1F2A22"/><circle cx="39" cy="32" r="4" fill="#1F2A22"/><path d="M27 40 L33 40 L30 46Z" fill="#F7A531" stroke="#1F2A22" stroke-width="1.8" stroke-linejoin="round"/></svg>', glow:'#FFC629'},
    {id:'raccoon', name:'raccoon', svg:'<svg viewBox="0 0 60 60" aria-hidden="true"><path d="M12 10 L22 20 L38 20 L48 10 L50 30 C50 46 40 54 30 54 C20 54 10 46 10 30Z" fill="#9A9AA8" stroke="#1F2A22" stroke-width="2.5" stroke-linejoin="round"/><path d="M12 30 C18 24 26 26 30 31 C34 26 42 24 48 30 C44 36 36 37 30 34 C24 37 16 36 12 30Z" fill="#1F2A22"/><circle cx="21" cy="30" r="3" fill="#FFF"/><circle cx="39" cy="30" r="3" fill="#FFF"/><path d="M22 42 C26 38 34 38 38 42 C36 48 24 48 22 42Z" fill="#FFF" stroke="#1F2A22" stroke-width="2"/><circle cx="30" cy="41" r="2.6" fill="#1F2A22"/></svg>', glow:'#FFFFFF'},
    {id:'frog', name:'frog', svg:'<svg viewBox="0 0 60 60" aria-hidden="true"><ellipse cx="30" cy="38" rx="22" ry="15" fill="#8DBF4A" stroke="#1F2A22" stroke-width="2.5"/><circle cx="19" cy="22" r="8" fill="#8DBF4A" stroke="#1F2A22" stroke-width="2.5"/><circle cx="41" cy="22" r="8" fill="#8DBF4A" stroke="#1F2A22" stroke-width="2.5"/><circle cx="19" cy="22" r="4" fill="#F6EEDC"/><circle cx="41" cy="22" r="4" fill="#F6EEDC"/><circle cx="20" cy="22" r="2.2" fill="#1F2A22"/><circle cx="42" cy="22" r="2.2" fill="#1F2A22"/><path d="M18 40 C24 46 36 46 42 40" stroke="#1F2A22" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>', glow:'#B6FF8A'},
    {id:'moth', name:'moth', svg:'<svg viewBox="0 0 60 60" aria-hidden="true"><path d="M30 22 C20 6 4 10 6 24 C7 34 18 36 28 32Z" fill="#D8C29A" stroke="#1F2A22" stroke-width="2.5" stroke-linejoin="round"/><path d="M30 22 C40 6 56 10 54 24 C53 34 42 36 32 32Z" fill="#D8C29A" stroke="#1F2A22" stroke-width="2.5" stroke-linejoin="round"/><path d="M28 32 C20 36 14 46 20 50 C25 52 28 44 29 36Z" fill="#D9B98A" stroke="#1F2A22" stroke-width="2.2"/><path d="M32 32 C40 36 46 46 40 50 C35 52 32 44 31 36Z" fill="#D9B98A" stroke="#1F2A22" stroke-width="2.2"/><circle cx="17" cy="21" r="4" fill="#F7A531" stroke="#1F2A22" stroke-width="1.6"/><circle cx="43" cy="21" r="4" fill="#F7A531" stroke="#1F2A22" stroke-width="1.6"/><ellipse cx="30" cy="32" rx="3.5" ry="13" fill="#6B4A2B" stroke="#1F2A22" stroke-width="2"/><path d="M28 19 C26 14 23 12 21 12 M32 19 C34 14 37 12 39 12" stroke="#1F2A22" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg>', glow:'#FFE7B0'}
  ];

  var A = null;
  K.flashlight = { start: function(){ start(); }, stop: function(){ stop(); } };

  function start(){
    if (A) return;
    K.found('flashlight-hunt');
    var vw = K.vw(), vh = K.vh(), R = vw < 640 ? 80 : 100, HIT = 46;

    var root = K.el('div', 'egg-fl');
    var stage = K.el('div', 'egg-fl-stage', {'aria-hidden':'true'});
    var dark = K.el('div', 'egg-fl-dark', {tabindex:'0', 'aria-label':'Dark page. Move the flashlight with your mouse, finger or arrow keys. Press Enter to look closer.'});
    var glows = K.el('div', 'egg-fl-glows', {'aria-hidden':'true'});
    var hud = K.html('<div class="egg-fl-hud" role="region" aria-label="Flashlight hunt">' +
      '<span class="egg-fl-title">🔦 Flashlight hunt</span>' +
      '<span class="egg-fl-count" aria-live="polite">0 of 5 found</span>' +
      '<button type="button" class="egg-fl-btn">Lights on</button></div>');
    root.appendChild(stage); root.appendChild(dark); root.appendChild(glows); root.appendChild(hud);
    document.body.appendChild(root);
    var countEl = hud.querySelector('.egg-fl-count');

    // place critters in the visible viewport, away from ads, the HUD, and each other
    var hudR = K.rect(vw/2 - 230, 0, 460, 90), spots = [];
    CRITTERS.forEach(function(c){
      var best = null;
      for (var tries = 0; tries < 250; tries++){
        var x = K.rnd(50, vw - 50), y = K.rnd(110, vh - 50), r = K.rect(x - 34, y - 34, 68, 68);
        if (K.overlap(r, hudR, 10) || K.nearAd(r, 30)) continue;
        if (spots.some(function(s){ return Math.hypot(s.x - x, s.y - y) < 130; })) continue;
        best = {x:x, y:y}; break;
      }
      if (!best) best = {x:K.rnd(50, vw - 50), y:K.rnd(110, vh - 50)};
      var el = K.el('div', 'egg-fl-critter egg-fl-' + c.id); el.innerHTML = c.svg;
      el.style.left = best.x + 'px'; el.style.top = best.y + 'px';
      el.style.setProperty('--tilt', (Math.random()*30 - 15).toFixed(0) + 'deg');
      stage.appendChild(el);
      var g = K.el('span', 'egg-fl-glow'); g.style.left = best.x + 'px'; g.style.top = best.y + 'px';
      g.style.setProperty('--glow', c.glow); g.style.animationDelay = (-Math.random()*3).toFixed(2) + 's';
      glows.appendChild(g);
      spots.push({x:best.x, y:best.y, c:c, el:el, glow:g, found:false});
    });

    var beam = {x:vw/2, y:vh/2};
    function setBeam(x, y){
      beam.x = K.clamp(x, 0, K.vw()); beam.y = K.clamp(y, 0, K.vh());
      dark.style.setProperty('--bx', beam.x + 'px');
      dark.style.setProperty('--by', beam.y + 'px');
      // critters only show inside the beam (their faint glow is the only hint in the dark)
      if (spots) spots.forEach(function(s){ if (!s.found) s.el.classList.toggle('is-lit', Math.hypot(s.x - beam.x, s.y - beam.y) < R * 0.9); });
    }
    dark.style.setProperty('--br', R + 'px');
    setBeam(K.pointer.t ? K.pointer.x : vw/2, K.pointer.t ? K.pointer.y : vh/2);

    var found = 0;
    function look(x, y){
      var hit = null, bd = 1e9;
      spots.forEach(function(s){ if (s.found) return; var d = Math.hypot(s.x - x, s.y - y); if (d < HIT && d < bd){ bd = d; hit = s; } });
      if (!hit) return;
      hit.found = true; found++;
      hit.el.classList.add('is-found'); hit.glow.remove();
      K.sparkle(hit.x, hit.y, {count:10});
      countEl.textContent = found + ' of 5 found' + (found < 5 ? ' (you found a ' + hit.c.name + '!)' : '');
      if (found >= 5){
        countEl.textContent = 'All 5 found! Lights on…';
        setTimeout(function(){ if (!A) return; stop(); SL.confetti(K.vw()/2, K.vh()/2, {count:34, spread:220}); SL.toast && SL.toast('🔦 You found all 5 critters!'); }, 1100);
      }
    }

    dark.addEventListener('pointermove', function(e){ setBeam(e.clientX, e.clientY); });
    dark.addEventListener('pointerdown', function(e){ setBeam(e.clientX, e.clientY); look(e.clientX, e.clientY); });
    var onKey = function(e){
      var step = e.shiftKey ? 80 : 36, k = e.key;
      if (k === 'ArrowLeft'){ setBeam(beam.x - step, beam.y); e.preventDefault(); }
      else if (k === 'ArrowRight'){ setBeam(beam.x + step, beam.y); e.preventDefault(); }
      else if (k === 'ArrowUp'){ setBeam(beam.x, beam.y - step); e.preventDefault(); }
      else if (k === 'ArrowDown'){ setBeam(beam.x, beam.y + step); e.preventDefault(); }
      else if ((k === 'Enter' || k === ' ') && document.activeElement === dark){ e.preventDefault(); look(beam.x, beam.y); }
    };
    document.addEventListener('keydown', onKey);
    hud.querySelector('.egg-fl-btn').addEventListener('click', function(){ stop(); });
    var offEsc = K.onEsc(function(){ offEsc = null; stop(); });

    var prevFocus = document.activeElement;
    A = {root:root, cleanup:function(){
      document.removeEventListener('keydown', onKey);
      offEsc && offEsc();
      root.classList.add('egg-fade-out');
      setTimeout(function(){ root.remove(); }, 500);
      if (prevFocus && prevFocus.focus) try { prevFocus.focus({preventScroll:true}); } catch(e){}
    }};
    requestAnimationFrame(function(){ root.classList.add('is-on'); try { dark.focus({preventScroll:true}); } catch(e){} });
    K.say('Lights out! Find 5 hidden critters with your flashlight.');
  }

  function stop(){
    if (!A) return;
    var a = A; A = null; a.cleanup();
  }
})();
