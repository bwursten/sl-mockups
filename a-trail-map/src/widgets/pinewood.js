/* ============ Pinewood Derby mini-race — Agent B ============ */
(function(){
  'use strict';
  var SL = window.SL;
  var NAMES = {hotdog:'Hot Dog', rocket:'Rocket', shark:'Shark Fin'};
  var LINES = {
    1:['Your car took 1st! What a zoom!', 'Your car took 1st! Blue-ribbon speed!', '1st place! That car was flying!'],
    2:['Your car took 2nd! So close!', 'Your car took 2nd! By a whisker!', '2nd place! Just a nose behind!'],
    3:['Your car took 3rd! Great paint job, though!', 'Your car took 3rd! Time for some speed tips?', '3rd place! Next time, add more weight in back!']
  };
  var ORD = {1:'1st', 2:'2nd', 3:'3rd'};
  var FINISH_X = 276, CAR_HALF = 20, START_S = 24, MAX_X = 298;

  SL.widget('pinewood', function(root){
    function $(s){ return root.querySelector(s); }
    var pickBtns = SL.$$('.pw-pickbtn', root), pick = $('.pw-pick');
    var raceBtn = $('.pw-race'), raceLabel = $('.pw-race-label'), result = $('.pw-result'), place = $('.pw-place');
    var cars = SL.$$('.pw-car', root).map(function(g, i){
      var lane = root.querySelector('.pw-lane[data-lane="'+i+'"]');
      var len = lane.getTotalLength();
      // find the path length where the car's nose touches the finish line, and where it stops
      function sAtX(x){ var lo = 0, hi = len; for (var k=0;k<24;k++){ var m=(lo+hi)/2; if (lane.getPointAtLength(m).x < x) lo = m; else hi = m; } return lo; }
      return {el:g, id:g.getAttribute('data-car'), lane:lane, len:len, sF:sAtX(FINISH_X - CAR_HALF), sEnd:sAtX(MAX_X - CAR_HALF)};
    });
    var mine = null, racing = false, raced = false, raf = 0;

    function place_(c, s){
      var p = c.lane.getPointAtLength(s), q = c.lane.getPointAtLength(Math.min(c.len, s + 1));
      var a = Math.atan2(q.y - p.y, q.x - p.x) * 180 / Math.PI;
      c.el.setAttribute('transform', 'translate('+p.x.toFixed(2)+' '+p.y.toFixed(2)+') rotate('+a.toFixed(2)+')');
    }
    function resetCars(){ cars.forEach(function(c){ place_(c, START_S); }); }
    resetCars();

    pickBtns.forEach(function(b){
      b.addEventListener('click', function(){
        if (racing) return;
        mine = b.getAttribute('data-car');
        pickBtns.forEach(function(x){ x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        cars.forEach(function(c){ c.el.classList.toggle('is-mine', c.id === mine); });
        if (raced){ resetCars(); place.hidden = true; place.parentNode.classList.remove('has-place'); raced = false; raceLabel.textContent = 'Race!'; }
        result.textContent = 'You picked ' + NAMES[mine] + '. Ready? Hit Race!';
        SL.trackInteract('pinewood', 'pick_' + mine);
      });
    });

    function finish(order){
      var p = order.indexOf(mine) + 1;
      var line = SL.rand(LINES[p]);
      place.className = 'pw-place p' + p;
      place.querySelector('.pw-place-n').textContent = ORD[p];
      place.hidden = false; place.parentNode.classList.add('has-place');
      result.textContent = line;
      if (SL.motionOK()){
        place.animate([{transform:'translateY(-30px) scale(0)'},{transform:'translateY(4px) scale(1.15)', offset:.6},{transform:'none'}], {duration:480, easing:'ease-out'});
        if (p === 1) SL.confettiAt(place, {count:18, spread:110, shapes:['★','●','■']});
      }
      racing = false; raced = true;
      raceBtn.removeAttribute('aria-disabled');
      raceLabel.textContent = 'Race again!';
    }

    function race(){
      if (racing) return;
      if (!mine){
        result.textContent = 'Pick a car first!';
        pick.classList.remove('is-nudge'); void pick.offsetWidth; pick.classList.add('is-nudge');
        pickBtns[0].focus();
        return;
      }
      racing = true; place.hidden = true; place.parentNode.classList.remove('has-place');
      raceBtn.setAttribute('aria-disabled', 'true');
      SL.trackInteract('pinewood', raced ? 'race_again' : 'race');
      // random finish times (seconds); lowest wins
      var times = cars.map(function(){ return 2.3 + Math.random() * .6; });
      var order = cars.map(function(c, i){ return {id:c.id, t:times[i]}; }).sort(function(a,b){ return a.t - b.t; }).map(function(o){ return o.id; });

      if (!SL.motionOK()){
        // reduced motion: jump straight to the final positions
        cars.forEach(function(c){
          var rank = order.indexOf(c.id);
          place_(c, rank === 0 ? c.sF + 16 : c.sF - rank * 26);
        });
        result.textContent = 'And they’re off…';
        setTimeout(function(){ finish(order); }, 60);
        return;
      }
      result.textContent = 'And they’re off!';
      resetCars();
      var t0 = 0, total = Math.max.apply(null, times) + .55;
      function frame(now){
        if (!t0) t0 = now;
        var t = (now - t0) / 1000;
        if (!SL.motionOK()){ t = total; }
        cars.forEach(function(c, i){
          var T = times[i], s;
          if (t <= T){ var p = t / T; s = START_S + (c.sF - START_S) * Math.pow(p, 1.65); }
          else { s = c.sF + (c.sEnd - c.sF) * (1 - Math.exp(-(t - T) * 4)); }
          place_(c, Math.min(s, c.sEnd));
        });
        if (t < total){ raf = requestAnimationFrame(frame); }
        else { finish(order); }
      }
      raf = requestAnimationFrame(frame);
    }
    raceBtn.addEventListener('click', race);
  });
})();
