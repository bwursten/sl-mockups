/* ============ Idea Machine (Boredom Buster) — Agent B ============ */
(function(){
  'use strict';
  var SL = window.SL;
  var TYPES = {craft:'Craft', science:'Science', outdoors:'Outdoors', art:'Art', recipe:'Recipe', build:'Build'};
  var KEYS = Object.keys(TYPES);
  var U = 'https://scoutlife.org/hobbies-projects/';
  /* Editor-maintained pool (real Scout Life projects). time = editor estimate */
  var IDEAS = [
    {t:'How to Make a Ghost Decoration Using a Cardboard Tube', u:U+'projects/192234/how-to-make-a-ghost-decoration-using-a-cardboard-tube/', img:'ghost', type:'craft', time:'about 20 min'},
    {t:'10 Amazing Duct Tape Creations You Can Make Right Now', u:U+'funstuff/157997/10-amazing-duct-tape-creations-you-can-make-right-now/', img:'ducttape', type:'craft', time:'about 1 hour'},
    {t:'How to Make a Super-Cool Paper Airplane', u:U+'funstuff/183466/how-to-make-a-super-cool-paper-airplane/', img:'paperairplane', type:'craft', time:'about 10 min'},
    {t:'How to Make Invisible Ink for Writing Top-Secret Messages', u:U+'funstuff/162663/how-to-make-invisible-ink-for-writing-top-secret-messages/', img:'invisibleink', type:'science', time:'about 15 min'},
    {t:'Learn Morse Code With This Morse Translator and Decoder', u:U+'funstuff/575/morse-code-translator/', img:'morse', type:'science', time:'about 15 min'},
    {t:'How to Easily Take Fingerprints With Household Items', u:U+'funstuff/178282/how-to-easily-take-fingerprints-with-household-items/', img:'fingerprints', type:'science', time:'about 15 min'},
    {t:'How To Make a Glow-in-the-Dark Galaxy Jar', u:U+'projects/173809/how-to-make-a-glow-in-the-dark-galaxy-jar/', img:'galaxyjar', type:'science', time:'about 30 min'},
    {t:'How to Make a DIY Survival Kit', u:U+'projects/180051/how-to-make-a-diy-survival-kit/', img:'survivalkit', type:'outdoors', time:'about 1 hour'},
    {t:'How to Use a Can to Make a Bee Hotel for Solitary Bees', u:U+'projects/181990/bee-hotel-for-solitary-bees/', img:'beehotel', type:'outdoors', time:'about 45 min'},
    {t:'How to Make a Faux Stained-Glass Pumpkin', u:U+'projects/182598/how-to-make-a-faux-stained-glass-pumpkin/', img:'stainedglass', type:'art', time:'about 45 min'},
    {t:'How to Make Beautiful Bean Art', u:U+'projects/191033/how-to-make-beautiful-bean-art/', img:'beanart', type:'art', time:'about 30 min'},
    {t:'How to Do the 4 Thieves Card Trick', u:U+'funstuff/157224/how-to-do-the-4-thieves-card-trick/', img:'cardtrick', type:'art', time:'about 15 min'},
    {t:'How to Cook Campfire Nachos', u:U+'funstuff/183415/how-to-cook-campfire-nachos/', img:'nachos', type:'recipe', time:'about 30 min'},
    {t:'How to Make the Perfect Jar of Hot Chocolate Mix', u:U+'funstuff/161659/how-to-make-the-perfect-hot-chocolate-mix/', img:'hotchocolate', type:'recipe', time:'about 15 min'},
    {t:'How to Build a Backyard Mini Golf Course', u:U+'projects/718/fore/', img:'minigolf', type:'build', time:'an afternoon'},
    {t:'How to Make a Rube Goldberg Machine', u:U+'projects/159359/how-to-make-a-rube-goldberg-machine/', img:'rubegoldberg', type:'build', time:'1–2 hours'}
  ];
  var CELL = 52, HUB = [254, 116];

  SL.widget('ideamachine', function(root){
    function $(s){ return root.querySelector(s); }
    var machine = $('.im-machine'), shaker = $('.im-shaker'), crankArm = $('.im-crank-arm'), needle = $('.im-needle');
    var hit = $('.im-crank-hit'), btn = $('.im-crank-btn'), puffs = $('.im-puffs'), ticket = $('.im-ticket');
    var card = $('.im-card'), live = $('.im-live'), title = $('.im-card-title');
    var wins = SL.$$('.im-win', root);
    var gears = SL.$$('.im-gear', root).map(function(g){
      var c = g.getAttribute('data-c').split(' ').map(Number);
      return {el:g, cx:c[0], cy:c[1], k:parseFloat(g.getAttribute('data-k'))};
    });
    var pops = SL.$$('.im-gear-pop', root);

    var st = {busy:false, count:0, last:-1, eggSeen:false, crankA:0, gearA:0, loop:0, lastT:0, puffT:0, speed:0};

    function icon(type){ return '<span class="im-cell"><svg viewBox="0 0 40 40" aria-hidden="true" focusable="false"><use href="#im-i-'+type+'"/></svg></span>'; }
    function render(){
      crankArm.setAttribute('transform','rotate('+(st.crankA%360).toFixed(1)+' '+HUB[0]+' '+HUB[1]+')');
      gears.forEach(function(g){ g.el.setAttribute('transform','rotate('+((st.gearA*g.k)%360).toFixed(1)+' '+g.cx+' '+g.cy+')'); });
      var n = st.speed ? Math.sin(st.gearA/18)*50 : 0;
      needle.setAttribute('transform','rotate('+n.toFixed(1)+' 11 123)');
    }

    /* ---------- running loop: gears, crank, steam ---------- */
    function startLoop(crankSpeed){
      st.speed = crankSpeed; st.lastT = 0;
      if (!SL.motionOK() || st.loop) return;
      function tick(t){
        if (!st.speed || !SL.motionOK()){ st.loop = 0; return; }
        var dt = st.lastT ? Math.min(50, t - st.lastT) : 16; st.lastT = t;
        st.crankA += dt * st.speed; st.gearA += dt * st.speed * .8;
        render();
        st.puffT -= dt; if (st.puffT <= 0){ puff(); st.puffT = 230; }
        st.loop = requestAnimationFrame(tick);
      }
      st.loop = requestAnimationFrame(tick);
    }
    function stopLoop(){ st.speed = 0; if (st.loop) cancelAnimationFrame(st.loop); st.loop = 0; render(); }
    document.addEventListener('sl:motion', function(){ if (!SL.motionOK()){ machine.classList.remove('is-shaking'); } });

    function puff(){
      if (!SL.motionOK()) return;
      var p = document.createElement('span'); p.className = 'im-puff';
      puffs.appendChild(p);
      var dx = (Math.random()-.5)*26, s = .6 + Math.random()*.7;
      var a = p.animate([
        {transform:'translate(0,6px) scale(.3)', opacity:0},
        {transform:'translate('+dx*.4+'px,-14px) scale('+s+')', opacity:1, offset:.25},
        {transform:'translate('+dx+'px,-46px) scale('+(s*1.5)+')', opacity:0}
      ], {duration:900, easing:'ease-out'});
      a.onfinish = function(){ p.remove(); };
    }

    /* ---------- reels ---------- */
    function spinWindow(win, finalType, i){
      var strip = win.querySelector('.im-strip');
      var cur = strip.querySelector('use').getAttribute('href').replace('#im-i-','');
      var n = 10 + i*4, html = icon(cur);
      for (var k=0;k<n;k++) html += icon(SL.rand(KEYS));
      html += icon(finalType) + icon(SL.rand(KEYS));
      strip.innerHTML = html;
      var end = (n+1) * CELL;
      win.classList.add('is-spinning');
      return new Promise(function(res){
        var a = strip.animate([
          {transform:'translateY(0)', easing:'cubic-bezier(.3,.05,.4,1)'},
          {transform:'translateY(-'+(end+14)+'px)', offset:.88, easing:'ease-in-out'},
          {transform:'translateY(-'+end+'px)'}
        ], {duration:1050 + i*420, fill:'forwards'});
        setTimeout(function(){ win.classList.remove('is-spinning'); }, 900 + i*420);
        a.onfinish = function(){
          strip.innerHTML = icon(finalType); a.cancel();
          if (SL.motionOK()) shaker.animate([{transform:'translateY(0)'},{transform:'translateY(3px)'},{transform:'translateY(0)'}],{duration:140});
          res();
        };
      });
    }
    function fadeWindows(finals){
      wins.forEach(function(w,i){
        var strip = w.querySelector('.im-strip'); strip.innerHTML = icon(finals[i]);
        strip.animate([{opacity:0},{opacity:1}], {duration:350, delay:i*120, fill:'backwards'});
      });
      return SL.wait(750);
    }

    /* ---------- happy dance (egg: three of a kind) ---------- */
    function dance(){
      SL.eggFound('ideamachine-dance');
      machine.classList.add('is-happy');
      live.textContent = 'All three windows match! The Idea Machine does a happy dance.';
      if (!SL.motionOK()) return SL.wait(1300).then(function(){ machine.classList.remove('is-happy'); });
      shaker.animate([
        {transform:'translateY(0) scale(1,1)'},
        {transform:'translateY(4px) scale(1.06,.92)', offset:.1},
        {transform:'translateY(-24px) scale(.96,1.05) rotate(-3deg)', offset:.25},
        {transform:'translateY(3px) scale(1.05,.94)', offset:.4},
        {transform:'translateY(-16px) scale(.97,1.04) rotate(3deg)', offset:.56},
        {transform:'translateY(2px) scale(1.04,.95)', offset:.72},
        {transform:'translateY(-6px) rotate(-1deg)', offset:.86},
        {transform:'translateY(0) scale(1,1)'}
      ], {duration:1500, easing:'ease-in-out'});
      // smokestack toots a bubble ring (or two)
      [0, 380].forEach(function(d){
        var r = document.createElement('span'); r.className = 'im-ring'; puffs.appendChild(r);
        var a = r.animate([
          {transform:'translateY(4px) scale(.4)', opacity:0},
          {transform:'translateY(-8px) scale(.9)', opacity:1, offset:.2},
          {transform:'translateY(-60px) scale(1.9)', opacity:0}
        ], {duration:1300, delay:d, easing:'ease-out', fill:'backwards'});
        a.onfinish = function(){ r.remove(); };
      });
      // gears pop out, spin, and pop back in
      pops.forEach(function(p){
        var d = p.getAttribute('data-pop').split(' ').map(Number);
        p.animate([
          {transform:'translate(0,0)'},
          {transform:'translate('+d[0]+'px,'+d[1]+'px)', offset:.3, easing:'ease-in-out'},
          {transform:'translate('+d[0]*1.1+'px,'+d[1]*1.1+'px)', offset:.65, easing:'cubic-bezier(.34,1.56,.64,1)'},
          {transform:'translate(0,0)'}
        ], {duration:1500});
      });
      st.speed = .9; startLoop(.9);
      return SL.wait(1550).then(function(){ stopLoop(); machine.classList.remove('is-happy'); });
    }

    /* ---------- ticket + card ---------- */
    function popTicket(){
      if (!SL.motionOK()) return Promise.resolve();
      return new Promise(function(res){
        var a = ticket.animate([
          {height:'0px', opacity:1},
          {height:'46px', opacity:1, offset:.55, easing:'cubic-bezier(.34,1.56,.64,1)'},
          {height:'40px', opacity:1, transform:'rotate(4deg)'}
        ], {duration:600});
        a.onfinish = res;
      });
    }
    function showCard(idea){
      card.querySelector('img').src = 'assets/img/ideamachine-'+idea.img+'.jpg';
      card.querySelector('.im-type use').setAttribute('href','#im-i-'+idea.type);
      card.querySelector('.im-type span').textContent = TYPES[idea.type];
      card.querySelector('.im-time span').textContent = idea.time;
      title.textContent = idea.t;
      card.querySelector('.im-go').href = idea.u;
      card.hidden = false;
      if (SL.motionOK()){
        card.animate([
          {clipPath:'inset(0 42% 100% 42% round 10px)', transform:'translateY(60px) scale(.9)'},
          {clipPath:'inset(0 38% 0 38% round 10px)', transform:'translateY(0) scale(1)', offset:.45},
          {clipPath:'inset(0 0 0 0 round 10px)', transform:'none'}
        ], {duration:650, easing:'cubic-bezier(.3,.7,.3,1)'});
      } else {
        card.animate([{opacity:0},{opacity:1}], {duration:250});
      }
      live.textContent = "Here's an idea! " + idea.t + '. ' + TYPES[idea.type] + ' project, time needed: ' + idea.time + '.';
      title.focus({preventScroll:true});
    }
    function hideCard(){
      if (card.hidden) return Promise.resolve();
      return new Promise(function(res){
        function done(){ card.hidden = true; res(); }
        if (!SL.motionOK()){ done(); return; }
        var a = card.animate([
          {clipPath:'inset(0 0 0 0 round 10px)', opacity:1},
          {clipPath:'inset(0 0 100% 0 round 10px)', opacity:.6}
        ], {duration:260, easing:'ease-in'});
        a.onfinish = done;
      });
    }

    /* ---------- main crank sequence ---------- */
    function pickIdea(){
      var i; do { i = Math.floor(Math.random()*IDEAS.length); } while (i === st.last && IDEAS.length > 1);
      st.last = i; return IDEAS[i];
    }
    function crank(source){
      if (st.busy) return;
      st.busy = true; st.count++;
      btn.setAttribute('aria-disabled','true');
      machine.classList.add('was-cranked');
      machine.classList.remove('is-lit');
      wins.forEach(function(w){ w.classList.remove('is-match'); });
      SL.trackInteract('ideamachine', source === 'drag' ? 'crank_drag' : (source === 'again' ? 'try_another' : 'crank'));
      var idea = pickIdea(), t = idea.type;
      // ~1 in 6 cranks all windows match (guaranteed by the 4th crank so reviewers see it)
      var match = Math.random() < 1/6 || (st.count >= 4 && !st.eggSeen);
      var finals;
      if (match){ finals = [t,t,t]; st.eggSeen = true; }
      else {
        var others = KEYS.filter(function(k){ return k !== t; });
        finals = [SL.rand(KEYS), t, SL.rand(others)];
      }
      live.textContent = 'Cranking the Camp Idea-O-Matic…';
      var motion = SL.motionOK();
      ticket.getAnimations().forEach(function(a){ a.cancel(); });
      hideCard().then(function(){
        if (motion){
          machine.classList.add('is-shaking');
          startLoop(.75);
          return Promise.all(wins.map(function(w,i){ return spinWindow(w, finals[i], i); }));
        }
        return fadeWindows(finals);
      }).then(function(){
        machine.classList.remove('is-shaking'); stopLoop();
        if (match){ wins.forEach(function(w){ w.classList.add('is-match'); }); return dance(); }
      }).then(function(){
        machine.classList.add('is-lit');
        return popTicket();
      }).then(function(){ return SL.wait(motion ? 120 : 0); })
      .then(function(){
        showCard(idea);
        st.busy = false; btn.removeAttribute('aria-disabled');
      });
    }

    btn.addEventListener('click', function(){ if (!st.busy) crank('button'); });
    $('.im-again').addEventListener('click', function(){ crank('again'); });
    $('.im-card-close').addEventListener('click', function(){
      hideCard().then(function(){ ticket.getAnimations().forEach(function(a){ a.cancel(); }); btn.focus(); live.textContent = 'Back to the Idea Machine.'; });
    });
    card.addEventListener('keydown', function(e){ if (e.key === 'Escape'){ $('.im-card-close').click(); } });

    /* ---------- turn the crank by hand (pointer drag) ---------- */
    var drag = null;
    function angleAt(e){
      var r = machine.getBoundingClientRect();
      var cx = r.left + HUB[0] * r.width / 300, cy = r.top + HUB[1] * r.height / 225;
      return Math.atan2(e.clientY - cy, e.clientX - cx) * 180 / Math.PI;
    }
    hit.addEventListener('pointerdown', function(e){
      if (st.busy) return;
      e.preventDefault();
      try { hit.setPointerCapture(e.pointerId); } catch(_){}
      drag = {a:angleAt(e), total:0, id:e.pointerId};
    });
    hit.addEventListener('pointermove', function(e){
      if (!drag || e.pointerId !== drag.id) return;
      var a = angleAt(e), d = a - drag.a;
      if (d > 180) d -= 360; if (d < -180) d += 360;
      drag.a = a; drag.total += d;
      st.crankA += d; st.gearA += d * .8; render();
      if (Math.abs(drag.total) > 90 && SL.motionOK() && Math.random() < .12) puff();
      if (Math.abs(drag.total) >= 300){ drag = null; crank('drag'); }
    });
    function endDrag(){ drag = null; }
    hit.addEventListener('pointerup', endDrag);
    hit.addEventListener('pointercancel', endDrag);

    render();
  });
})();
