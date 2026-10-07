/* ============================================================
   Widget: poll (Today's Poll) — Direction C: versus / choose-your-team
   Anonymous, one vote per browser (SL.store). Mockup: fake baseline counts.
   ============================================================ */
(function(){
  'use strict';
  var POLL_ID = 'poll:2026-10-campfire-snack';
  var BASE = {smores:1342, hotdogs:788, bananaboats:409, popcorn:517};

  SL.widget('poll', function(root){
    var form = SL.$('.pl-form', root), opts = SL.$$('.pl-opt', root), meta = SL.$('.pl-meta', root);

    function labelOf(b){ return SL.$('.pl-label', b).textContent; }

    function showResults(mine, animate){
      var counts = {}, total = 0;
      Object.keys(BASE).forEach(function(k){ counts[k] = BASE[k] + (k === mine ? 1 : 0); total += counts[k]; });
      form.classList.add('pl-voted');
      var summary = [], top = Object.keys(counts).sort(function(a, b){ return counts[b] - counts[a]; })[0];
      opts.forEach(function(b, i){
        var k = b.value, pct = Math.round(counts[k] / total * 100), bar = SL.$('.pl-bar', b), out = SL.$('.pl-pct', b);
        b.setAttribute('aria-disabled', 'true');
        b.setAttribute('aria-label', labelOf(b) + ': ' + pct + ' percent' + (k === mine ? ' (your pick)' : ''));
        if (k === mine){
          b.classList.add('is-mine');
          if (!SL.$('.pl-mine', b)){ var t = document.createElement('span'); t.className = 'pl-mine'; t.setAttribute('aria-hidden','true'); t.textContent = 'YOU';
            b.appendChild(t); }
        }
        if (k === top && !SL.$('.pl-lead', b)){ var L = document.createElement('span'); L.className = 'pl-lead'; L.setAttribute('aria-hidden','true'); L.textContent = '1ST'; b.appendChild(L); }
        summary.push(labelOf(b) + ' ' + pct + '%');
        if (!animate || !SL.motionOK()){ bar.style.width = pct + '%'; out.textContent = pct + '%'; return; }
        setTimeout(function(){
          bar.style.width = pct + '%';
          var t0 = performance.now(), dur = 1000;
          (function tick(now){
            var p = Math.min(1, (now - t0) / dur); out.textContent = Math.round(pct * (1 - Math.pow(1 - p, 3))) + '%';
            if (p < 1) requestAnimationFrame(tick);
          })(t0);
        }, 120 + i * 110);
      });
      meta.innerHTML = '<strong>Thanks for voting!</strong> ' + total.toLocaleString() + ' Scouts have voted.';
      var sr = document.createElement('span'); sr.className = 'sr-only'; sr.textContent = ' Results: ' + summary.join(', ') + '.';
      meta.appendChild(sr);
    }

    var saved = SL.store.get(POLL_ID, null);
    if (saved && BASE[saved]) showResults(saved, false);

    form.addEventListener('submit', function(e){ e.preventDefault(); });
    opts.forEach(function(b){
      b.addEventListener('click', function(e){
        e.preventDefault();
        if (form.classList.contains('pl-voted')){ return; }
        var k = b.value;
        SL.store.set(POLL_ID, k);
        SL.trackInteract('poll', 'vote:' + k);
        if (SL.motionOK()){ b.classList.add('pl-thunk'); setTimeout(function(){ b.classList.remove('pl-thunk'); }, 460);
          SL.confettiAt(b, {count:12, shapes:['■', '★', '▲'], spread:80}); }
        showResults(k, true);
      });
    });
  });
})();
