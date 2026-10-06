/* ============================================================
   core.js — shared helpers on window.SL (owned by lead)
   Loaded FIRST, before shell/widgets/eggs.
   ============================================================ */
(function(){
  'use strict';
  var html = document.documentElement;
  html.classList.remove('no-js'); html.classList.add('js');

  var SL = window.SL = window.SL || {};
  SL.events = [];

  /* ---- Storage (safe) ---- */
  SL.store = {
    get:function(k,def){ try{ var v=localStorage.getItem('sl:'+k); return v===null?def:JSON.parse(v);}catch(e){return def;} },
    set:function(k,v){ try{ localStorage.setItem('sl:'+k, JSON.stringify(v)); }catch(e){} }
  };

  /* ---- Motion ---- */
  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : {matches:false};
  SL.paused = !!SL.store.get('paused', false);
  function applyMotion(){ html.classList.toggle('motion-off', SL.paused || mq.matches); }
  applyMotion();
  /** true when it's OK to run JS-driven animation */
  SL.motionOK = function(){ return !(SL.paused || mq.matches); };
  SL.setPaused = function(p){
    SL.paused = !!p; SL.store.set('paused', SL.paused); applyMotion();
    document.dispatchEvent(new CustomEvent('sl:motion', {detail:{ok:SL.motionOK()}}));
  };
  if (mq.addEventListener) mq.addEventListener('change', function(){ applyMotion(); document.dispatchEvent(new CustomEvent('sl:motion',{detail:{ok:SL.motionOK()}})); });

  /* ---- Analytics stub (mockup: logs to console) ---- */
  SL.track = function(name, params){
    var e = {event:name, params:params||{}, t:Date.now()};
    SL.events.push(e);
    if (window.console) console.log('%c[track] '+name, 'color:#2D6BEA;font-weight:bold', params||{});
  };
  SL.eggFound = function(id){
    SL.track('egg_found', {egg_id:id});
    document.dispatchEvent(new CustomEvent('sl:egg', {detail:{id:id}}));
  };

  /* ---- Utils ---- */
  SL.rand = function(arr){ return arr[Math.floor(Math.random()*arr.length)]; };
  SL.shuffle = function(arr){ var a=arr.slice(); for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)); var t=a[i];a[i]=a[j];a[j]=t;} return a; };
  SL.$ = function(sel, root){ return (root||document).querySelector(sel); };
  SL.$$ = function(sel, root){ return Array.prototype.slice.call((root||document).querySelectorAll(sel)); };
  SL.wait = function(ms){ return new Promise(function(r){ setTimeout(r, ms); }); };

  /** Run fn once when el is near the viewport */
  SL.lazy = function(el, fn){
    if (!el) return;
    if (!('IntersectionObserver' in window)) { fn(el); return; }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if (en.isIntersecting){ io.disconnect(); fn(el); } });
    }, {rootMargin:'300px 0px'});
    io.observe(el);
  };

  /** Fires widget_view when a widget is 50% visible for 1s */
  SL.watchWidget = function(el, id){
    if (!('IntersectionObserver' in window)) return;
    var timer=null, done=false;
    var io = new IntersectionObserver(function(en){
      en.forEach(function(e){
        if (done) return;
        if (e.isIntersecting){ timer=setTimeout(function(){ done=true; io.disconnect();
          SL.track('widget_view',{widget_id:id, slot:el.getAttribute('data-slot')||'', size:el.classList.contains('slot-W')?'W':'S'}); },1000); }
        else clearTimeout(timer);
      });
    }, {threshold:.5});
    io.observe(el);
  };

  /* ---- Confetti burst (sticker shapes). x,y = viewport coords ---- */
  var COLORS = ['#FF5A36','#FFC83D','#12B5A5','#2D6BEA','#7CC444','#FF8A1F','#6CC8F0'];
  SL.confetti = function(x, y, opts){
    opts = opts||{};
    var n = opts.count || 26, shapes = opts.shapes || ['★','●','▲','■','✚'];
    if (!SL.motionOK()) n = Math.min(n, 8);
    for (var i=0;i<n;i++){
      var s = document.createElement('span');
      s.className = 'sl-confetti'; s.setAttribute('aria-hidden','true');
      s.textContent = SL.rand(shapes);
      s.style.color = SL.rand(opts.colors||COLORS);
      s.style.left = x+'px'; s.style.top = y+'px';
      s.style.fontSize = (14+Math.random()*16)+'px';
      document.body.appendChild(s);
      (function(s){
        var ang = Math.random()*Math.PI*2, dist = 60+Math.random()*(opts.spread||160);
        var dx = Math.cos(ang)*dist, dy = Math.sin(ang)*dist - 40, rot = (Math.random()-.5)*720;
        if (!SL.motionOK()){ s.style.transform='translate('+dx*.4+'px,'+dy*.4+'px)'; setTimeout(function(){s.remove();},600); return; }
        var anim = s.animate([
          {transform:'translate(0,0) rotate(0)', opacity:1},
          {transform:'translate('+dx+'px,'+dy+'px) rotate('+rot/2+'deg)', opacity:1, offset:.6},
          {transform:'translate('+dx*1.1+'px,'+(dy+140)+'px) rotate('+rot+'deg)', opacity:0}
        ], {duration:1100+Math.random()*500, easing:'cubic-bezier(.2,.8,.3,1)'});
        anim.onfinish = function(){ s.remove(); };
      })(s);
    }
  };
  /** Confetti from the center of an element */
  SL.confettiAt = function(el, opts){ var r=el.getBoundingClientRect(); SL.confetti(r.left+r.width/2, r.top+r.height/2, opts); };

  /* ---- Toast ---- */
  var toastEl, toastT;
  SL.toast = function(msg, ms){
    if (!toastEl){ toastEl=document.createElement('div'); toastEl.className='sl-toast'; toastEl.setAttribute('role','status'); document.body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(function(){ toastEl.classList.remove('show'); }, ms||2200);
  };

  /* ---- Search + search-word eggs ----
     Eggs register: SL.searchEggs['pizza'] = function(query){ return Promise };
     Shell calls SL.runSearch(q) on submit. */
  SL.searchEggs = SL.searchEggs || {};
  SL.runSearch = function(q){
    q = (q||'').trim();
    SL.track('search_submit', {});
    var key = q.toLowerCase().replace(/\s+/g,' ');
    var url = 'https://scoutlife.org/?s=' + encodeURIComponent(q);
    var egg = SL.searchEggs[key];
    if (egg){
      SL.eggFound('search-'+key.replace(/\s/g,'-'));
      Promise.resolve(egg(q)).then(function(){ return SL.wait(250); }).then(function(){ window.location.href = url; });
    } else if (q) { window.location.href = url; }
  };

  /* ---- Widget registry: widgets call SL.widget('id', fn) ---- */
  SL.widget = function(id, init){
    function run(){ SL.$$('[data-widget="'+id+'"]').forEach(function(el){
      try { SL.watchWidget(el, id); init(el); } catch(err){ console.error('Widget '+id+' failed', err); }
    }); }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  };
  SL.trackInteract = function(id, action){ SL.track('widget_interact', {widget_id:id, action:action}); };
  /* Auto-track click-throughs on any link inside a widget */
  document.addEventListener('click', function(e){
    var a = e.target.closest && e.target.closest('[data-widget] a[href]');
    if (a){ var w=a.closest('[data-widget]'); SL.track('widget_clickthrough',{widget_id:w.getAttribute('data-widget'), destination:a.href}); }
  }, true);
})();
