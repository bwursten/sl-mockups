/* ============ Arcade cabinet — Agent B ============ */
(function(){
  'use strict';
  var SL = window.SL;
  var G = 'https://scoutlife.org/games/mobile-games/';
  /* Editor-picked games (real Scout Life Arcade titles) */
  var GAMES = [
    {t:"Scout Life's Gaga Brawl", u:G+'191713/gaga-brawl/', img:'gagabrawl', d:'Will you be the last brawler standing? Dodge the red-hot ball in this online gaga ball video game.'},
    {t:'Bike Blitz', u:G+'178477/bike-blitz/', img:'bikeblitz', d:'Experience the thrill of competitive cycling! Customize your bike and race through Italy, France and Spain.'},
    {t:'Cat Stack', u:G+'179013/cat-stack/', img:'catstack', d:'Can you fit these bitty kitties into the puzzle purrfectly? Just because cats have nine lives doesn’t mean you do!'},
    {t:"Tiger's Backyard Bounce", u:G+'137281/tigers-backyard-bounce/', img:'tigerbounce', d:'How far can Tiger bounce, fly and roll? Help him in Tiger’s Backyard Bounce.'},
    {t:"Pee Wee's Basketball Madness", u:G+'139995/pee-wees-basketball-madness/', img:'basketball', d:'Test your basketball skills against Pee Wee and the rest of the gang in Pee Wee’s Basketball Madness.'},
    {t:"Dredd Speed's Cosmic Air Hockey", u:G+'161644/dredd-speeds-cosmic-air-hockey/', img:'airhockey', d:'Guard your goal! Challenge Dredd Speed to a fun game of air hockey.'}
  ];
  var DIRS = ['U','R','D','L'];

  SL.widget('arcade', function(root){
    function $(s){ return root.querySelector(s); }
    var screen = $('.ac-screen'), shot = $('.ac-shot'), canvas = $('.ac-canvas'), hud = $('.ac-hud'), msg = $('.ac-msg');
    var marquee = $('.ac-marquee-txt'), title = $('.ac-title'), desc = $('.ac-desc'), start = $('.ac-start'), count = $('.ac-count');
    var stick = $('.ac-stick'), thumbsEl = $('.ac-thumbs'), live = $('.ac-live');
    var idx = 0, game = null; // game = mini-game state when running

    /* preload images */
    GAMES.forEach(function(g){ var i = new Image(); i.src = 'assets/img/arcade-'+g.img+'.jpg'; });

    /* thumbnails (W layout) */
    var thumbs = GAMES.map(function(g, i){
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'ac-thumb'; b.setAttribute('aria-label', g.t);
      b.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
      b.innerHTML = '<img src="assets/img/arcade-'+g.img+'.jpg" alt="" width="58" height="44" loading="lazy">';
      b.addEventListener('click', function(){ go(i - idx); });
      thumbsEl.appendChild(b);
      return b;
    });

    function apply(){
      var g = GAMES[idx];
      shot.src = 'assets/img/arcade-'+g.img+'.jpg';
      shot.alt = g.t + ' game title screen';
      marquee.textContent = g.t; title.textContent = g.t; desc.textContent = g.d;
      start.href = g.u; start.setAttribute('aria-label', 'Press start: play ' + g.t);
      count.textContent = (idx+1) + ' of ' + GAMES.length;
      thumbs.forEach(function(b, i){ b.setAttribute('aria-pressed', i === idx ? 'true' : 'false'); });
    }
    function go(delta){
      if (game || !delta) return;
      idx = (idx + delta + GAMES.length) % GAMES.length;
      SL.trackInteract('arcade', delta > 0 ? 'next' : 'prev');
      live.textContent = 'Game ' + (idx+1) + ' of ' + GAMES.length + ': ' + GAMES[idx].t;
      if (SL.motionOK()){
        var a = screen.animate([
          {transform:'scale(1,1)', filter:'brightness(1)'},
          {transform:'scale(1,.03)', filter:'brightness(2.2)', offset:.45},
          {transform:'scale(1,.03)', filter:'brightness(2.2)', offset:.55},
          {transform:'scale(1,1)', filter:'brightness(1)'}
        ], {duration:300, easing:'ease-in-out'});
        setTimeout(apply, 140);
        marquee.animate([{transform:'translateX('+(delta>0?40:-40)+'px)', opacity:0},{transform:'none', opacity:1}], {duration:280, delay:120, easing:'ease-out', fill:'backwards'});
      } else {
        apply();
        screen.animate([{opacity:.3},{opacity:1}], {duration:200});
      }
    }
    function press(btn){ btn.classList.add('is-press'); setTimeout(function(){ btn.classList.remove('is-press'); }, 140); }
    $('.ac-prev').addEventListener('click', function(){ go(-1); });
    $('.ac-next').addEventListener('click', function(){ go(1); });

    /* ---------- joystick ---------- */
    function setKnob(x, y, spring){
      stick.classList.toggle('is-spring', !!spring);
      stick.style.setProperty('--kx', x + 'px'); stick.style.setProperty('--ky', y + 'px');
      stick.style.setProperty('--tilt-x', (x * 1.6) + 'deg');
    }
    function nudge(dir){
      var v = {U:[0,-9], D:[0,7], L:[-11,0], R:[11,0]}[dir];
      setKnob(v[0], v[1], true);
      setTimeout(function(){ setKnob(0, 0, true); }, 160);
    }
    function isCircle(seq){
      if (seq.length < 4) return false;
      var s = seq.slice(-4).map(function(d){ return DIRS.indexOf(d); });
      var step = (s[1] - s[0] + 4) % 4;
      if (step !== 1 && step !== 3) return false;
      for (var i = 2; i < 4; i++) if ((s[i] - s[i-1] + 4) % 4 !== step) return false;
      return true;
    }
    function dirOf(dx, dy){
      return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'R' : 'L') : (dy > 0 ? 'D' : 'U');
    }

    var drag = null;
    stick.addEventListener('pointerdown', function(e){
      if (game) return;
      e.preventDefault();
      try { stick.setPointerCapture(e.pointerId); } catch(_){}
      drag = {x:e.clientX, y:e.clientY, id:e.pointerId, moved:false, seq:[], fired:false};
      stick.classList.remove('is-spring');
    });
    stick.addEventListener('pointermove', function(e){
      if (!drag || e.pointerId !== drag.id) return;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y, dist = Math.sqrt(dx*dx + dy*dy), max = 13;
      var k = dist > max ? max / dist : 1;
      setKnob(dx * k, dy * k * .7, false);
      if (dist > 6) drag.moved = true;
      if (dist > 10){
        var d = dirOf(dx, dy);
        if (drag.seq[drag.seq.length-1] !== d){
          drag.seq.push(d);
          if (!drag.fired && isCircle(drag.seq)){ drag.fired = true; startGame('joystick'); }
        }
      }
    });
    function endDrag(e){
      if (!drag || (e && e.pointerId !== drag.id)) return;
      var d = drag; drag = null;
      setKnob(0, 0, true);
      if (d.fired) return;
      if (!d.moved){ go(1); return; }
      var last = d.seq[d.seq.length-1];
      if (last === 'R') go(1); else if (last === 'L') go(-1);
    }
    stick.addEventListener('pointerup', endDrag);
    stick.addEventListener('pointercancel', endDrag);
    stick.addEventListener('click', function(e){ if (e.detail === 0 && !game) go(1); }); // keyboard Enter/Space

    var keySeq = [], keyT = 0, keyIdx = 0;
    stick.addEventListener('keydown', function(e){
      var map = {ArrowUp:'U', ArrowRight:'R', ArrowDown:'D', ArrowLeft:'L'};
      var d = map[e.key];
      if (!d || game) return;
      e.preventDefault();
      nudge(d);
      var now = Date.now();
      if (now - keyT > 1500 || !keySeq.length){ keySeq = []; keyIdx = idx; }
      keyT = now;
      if (keySeq[keySeq.length-1] !== d) keySeq.push(d);
      if (isCircle(keySeq)){
        keySeq = [];
        if (idx !== keyIdx){ idx = keyIdx; apply(); } // undo any game flips made while circling
        startGame('keys'); return;
      }
      if (d === 'R') go(1); else if (d === 'L') go(-1);
    });

    /* touch-friendly alternative: the swirly sticker spins the joystick for you */
    $('.ac-swirl').addEventListener('click', function(){
      if (game) return;
      if (!SL.motionOK()){ startGame('swirl'); return; }
      var seq = ['U','R','D','L','U'], i = 0;
      (function step(){
        if (i >= seq.length){ setKnob(0,0,true); startGame('swirl'); return; }
        var v = {U:[0,-9], D:[0,7], L:[-11,0], R:[11,0]}[seq[i++]];
        setKnob(v[0], v[1], true); setTimeout(step, 130);
      })();
    });

    /* ---------- secret mini-game: catch the acorns ---------- */
    var W = 94, H = 65, ctx = canvas.getContext('2d');
    var AC = ['..b..','.bbb.','bbbbb','ooooo','ooooo','.ooo.','..o..']; // acorn sprite
    function px(x, y, w, h, c){ ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), w, h); }
    function drawAcorn(x, y){
      for (var r = 0; r < AC.length; r++) for (var c = 0; c < 5; c++){
        var ch = AC[r][c]; if (ch === '.') continue;
        px(x + c, y + r, 1, 1, ch === 'b' ? '#6B3F1D' : '#F7A531');
      }
    }
    function drawBasket(x, y){
      px(x - 8, y, 16, 1, '#1F2A22');
      px(x - 7, y + 1, 14, 5, '#D8C29A');
      for (var i = -6; i < 7; i += 3) px(x + i, y + 1, 1, 5, '#B07A3A');
      px(x - 7, y + 3, 14, 1, '#B07A3A');
      px(x - 6, y + 6, 12, 1, '#1F2A22');
    }
    var STARS = [[8,6],[20,14],[37,5],[52,12],[70,7],[84,15],[30,22],[62,20]];
    function drawScene(){
      px(0, 0, W, H, '#154A85');
      px(0, H - 22, W, 22, '#1F64B0');
      STARS.forEach(function(s){ px(s[0], s[1], 1, 1, '#FFC629'); });
      // pixel trees
      [[6,H-20],[86,H-24]].forEach(function(t){
        px(t[0]-3, t[1], 7, 3, '#2E7550'); px(t[0]-4, t[1]+3, 9, 4, '#2E7550'); px(t[0]-5, t[1]+7, 11, 5, '#2E7550'); px(t[0]-1, t[1]+12, 2, 4, '#6B3F1D');
      });
      px(0, H - 5, W, 5, '#8DBF4A'); px(0, H - 5, W, 1, '#2E7550');
    }
    function showMsg(big, small, pop){
      msg.querySelector('.ac-msg-big').textContent = big;
      msg.querySelector('.ac-msg-small').textContent = small || '';
      msg.hidden = false; msg.classList.toggle('is-pop', !!pop && SL.motionOK());
    }
    function endGame(){
      if (!game) return;
      var g = game;
      cancelAnimationFrame(g.raf); clearTimeout(g.timer);
      window.removeEventListener('keydown', g.onKey, true); window.removeEventListener('keyup', g.onKeyUp, true);
      hud.hidden = true;
      showMsg('NICE!', g.score + ' ACORN' + (g.score === 1 ? '' : 'S') + '!', true);
      live.textContent = 'Nice! You caught ' + g.score + ' acorn' + (g.score === 1 ? '' : 's') + '. Back to the games.';
      setTimeout(function(){
        msg.hidden = true; canvas.hidden = true; shot.hidden = false;
        screen.removeAttribute('tabindex'); screen.setAttribute('aria-label', 'Game preview');
        game = null; stick.focus({preventScroll:true});
      }, 2400);
      g.over = true;
    }
    function startGame(source){
      if (game) return;
      SL.eggFound('arcade-minigame');
      SL.trackInteract('arcade', 'minigame_' + source);
      if (!SL.motionOK()){
        // reduced motion: no falling things, just a static pixel "Nice!"
        game = {static:true};
        showMsg('NICE!', 'YOU FOUND THE SECRET GAME!');
        live.textContent = 'Nice! You found the secret arcade game.';
        setTimeout(function(){ msg.hidden = true; game = null; }, 2600);
        return;
      }
      game = {score:0, t0:0, last:0, bx:W/2, target:W/2, keys:0, acorns:[], spawn:300, pops:[], over:false, raf:0};
      shot.hidden = true; canvas.hidden = false; hud.hidden = false; msg.hidden = true;
      screen.setAttribute('tabindex', '0');
      screen.setAttribute('aria-label', 'Secret mini-game: catch the falling acorns. Use left and right arrow keys, or tap the left or right side of the screen.');
      live.textContent = 'Secret mini-game! Catch the falling acorns in the basket for 10 seconds. Use the left and right arrow keys, or tap either side of the screen.';
      screen.focus({preventScroll:true});
      var g = game;
      g.onKey = function(e){
        if (e.key === 'ArrowLeft'){ g.keys = -1; e.preventDefault(); }
        else if (e.key === 'ArrowRight'){ g.keys = 1; e.preventDefault(); }
        else if (e.key === 'Escape'){ g.t0 = -1e9; }
      };
      g.onKeyUp = function(e){ if ((e.key === 'ArrowLeft' && g.keys < 0) || (e.key === 'ArrowRight' && g.keys > 0)) g.keys = 0; };
      window.addEventListener('keydown', g.onKey, true); window.addEventListener('keyup', g.onKeyUp, true);
      showMsg('READY?', 'CATCH THE ACORNS!', true);
      drawScene(); drawBasket(g.bx, H - 12);
      g.timer = setTimeout(function(){
        msg.hidden = true;
        g.raf = requestAnimationFrame(loop);
      }, 1100);
    }
    function pointerToX(e){ var r = canvas.getBoundingClientRect(); return (e.clientX - r.left) / r.width * W; }
    canvas.addEventListener('pointerdown', function(e){ if (game && !game.over){ e.preventDefault(); game.target = pointerToX(e); game.keys = 0; } });
    canvas.addEventListener('pointermove', function(e){ if (game && !game.over && (e.pointerType === 'mouse' || e.buttons)) { game.target = pointerToX(e); game.keys = 0; } });

    function loop(t){
      var g = game; if (!g || g.over) return;
      if (!SL.motionOK()){ endGame(); return; }
      if (!g.t0) g.t0 = t;
      var dt = g.last ? Math.min(40, t - g.last) : 16; g.last = t;
      var left = 10000 - (t - g.t0);
      if (left <= 0){ endGame(); return; }
      // move basket
      if (g.keys){ g.target = g.bx + g.keys * 20; }
      var diff = g.target - g.bx, sp = .11 * dt;
      g.bx += Math.max(-sp, Math.min(sp, diff));
      g.bx = Math.max(8, Math.min(W - 8, g.bx));
      // spawn
      g.spawn -= dt;
      if (g.spawn <= 0){
        g.acorns.push({x:4 + Math.random() * (W - 13), y:-7, v:.022 + Math.random() * .012 + (10000 - left) / 10000 * .02});
        g.spawn = 520 - (10000 - left) / 10000 * 220;
      }
      drawScene();
      var by = H - 12;
      g.acorns = g.acorns.filter(function(a){
        a.y += a.v * dt;
        if (a.y + 7 >= by && a.y + 7 <= by + 5 && Math.abs(a.x + 2.5 - g.bx) <= 9){
          g.score++; g.pops.push({x:a.x, y:by - 6, life:500});
          return false;
        }
        if (a.y > H) return false;
        drawAcorn(a.x, a.y);
        return true;
      });
      drawBasket(g.bx, by);
      ctx.fillStyle = '#FFC629'; ctx.font = '6px monospace';
      g.pops = g.pops.filter(function(p){
        p.life -= dt; p.y -= dt * .015;
        px(p.x, p.y, 1, 3, '#FFC629'); px(p.x - 1, p.y + 1, 3, 1, '#FFC629'); px(p.x + 3, p.y, 1, 3, '#FFC629');
        return p.life > 0;
      });
      hud.querySelector('.ac-score').textContent = 'SCORE ' + g.score;
      hud.querySelector('.ac-time').textContent = 'TIME ' + Math.ceil(left / 1000);
      g.raf = requestAnimationFrame(loop);
    }
    document.addEventListener('sl:motion', function(){ if (game && !game.static && !game.over && !SL.motionOK()) endGame(); });
  });
})();
