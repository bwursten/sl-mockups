/* ============================================================
   Widget: quiz (Quiz Teaser) — owner: Agent A
   One real question from Scout Life's "How Much Do You Know About the
   Multisport Merit Badge?" quiz. Instant Correct!/Nope! feedback.
   ============================================================ */
(function(){
  'use strict';
  var CORRECT = 1;
  var EXPLAIN = {
    ok:  'A duathlon goes run → bike → run. Add a swim and you’ve got a triathlon!',
    no:  'It’s running and cycling: run → bike → run. Add a swim and it’s a triathlon.',
    silly:'Ha! Fun, but no. A duathlon is running and cycling: run → bike → run.'
  };

  SL.widget('quiz', function(root){
    var wrap = SL.$('.qz-answers', root), btns = SL.$$('.qz-a', root), fb = SL.$('.qz-fb', root), full = SL.$('.qz-full', root);
    var done = false;

    function answer(btn){
      if (done) return;
      done = true;
      var pick = +btn.getAttribute('data-a'), ok = pick === CORRECT, motion = SL.motionOK();
      root.classList.add('qz-done'); wrap.classList.add('qz-done');
      btns.forEach(function(b){
        var i = +b.getAttribute('data-a');
        b.setAttribute('aria-disabled', 'true');
        if (i === CORRECT){ b.classList.add('is-right'); b.setAttribute('aria-label', SL.$('.qz-at', b).textContent + ' (correct answer)'); }
        else if (i === pick){ b.classList.add('is-wrong'); b.setAttribute('aria-label', SL.$('.qz-at', b).textContent + ' (your answer, not correct)'); }
        else b.classList.add('is-dim');
      });
      var text = ok ? EXPLAIN.ok : (pick === 3 ? EXPLAIN.silly : EXPLAIN.no);
      fb.innerHTML = '<span class="qz-stamp ' + (ok ? 'ok' : 'no') + (motion ? ' slam' : '') + '">' + (ok ? '<b>CORRECT!</b><small>Ranger approved</small>' : '<b>NOPE!</b><small>Wrong trail</small>') + '</span>' +
                     '<p class="qz-exp">' + text + '</p>';
      if (motion){
        btn.classList.add(ok ? 'qz-pop' : 'qz-shake');
        if (ok) setTimeout(function(){ SL.confettiAt(btn, {count:22, shapes:['★','●','✚','🏃','🚴'], spread:120}); }, 120);
      }
      full.classList.add('qz-nudge');
      SL.trackInteract('quiz', ok ? 'answer:correct' : 'answer:wrong');
    }

    btns.forEach(function(b){ b.addEventListener('click', function(){ answer(b); }); });
  });
})();
