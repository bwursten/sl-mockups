/* ============================================================
   sections.js — shared SECTION FRONT behavior (.sf-*)
   Owner: Agent DEFAULT. Runs on every page; does nothing unless
   section-front markup is present.
   - Load more: appends the next <template data-sf-batch> into the
     section's [data-sf-grid], fades it in, moves focus to the first
     new card, announces via aria-live, hides itself when done.
   - Analytics: sf_load_more, sf_card_click, sf_lead_click,
     sf_subnav_click, sf_page_click.
   - Widgets in .sf-slot get a data-slot of "sf-<page>-<n>".
   - Dev guard: console.warn if two .sf-ad cells ever touch.
   ============================================================ */
(function(){
  'use strict';
  var SL = window.SL;
  if (!SL) return;
  var $ = SL.$, $$ = SL.$$;
  var page = (document.body && document.body.getAttribute('data-page')) || '';

  function ready(fn){ if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }

  ready(function(){
    var sections = $$('.sf-stories');
    if (!sections.length && !$('.sf-hero')) return;

    /* ---------- widget slot ids for analytics ---------- */
    $$('.sf-slot > .widget').forEach(function(w, i){ w.setAttribute('data-slot', 'sf-' + (page || 'section') + '-' + (i + 1)); });

    /* ---------- Load more ---------- */
    sections.forEach(function(sec){
      var grid = $('[data-sf-grid]', sec), btn = $('[data-sf-more]', sec);
      if (!grid || !btn) return;
      var batches = $$('template[data-sf-batch]', sec);
      var more = btn.closest('.sf-more') || btn.parentNode;
      var live = document.createElement('p');
      live.className = 'sr-only';
      live.setAttribute('aria-live', 'polite');
      live.setAttribute('role', 'status');
      more.appendChild(live);
      var end = document.createElement('p');
      end.className = 'sf-end';
      end.hidden = true;
      end.textContent = 'You’ve reached the end of this trail! Keep exploring with the page links below.';
      more.insertBefore(end, btn.nextSibling);
      var loaded = 0;

      if (!batches.length){ btn.hidden = true; return; }
      if (grid.id) btn.setAttribute('aria-controls', grid.id);

      btn.addEventListener('click', function(){
        var tpl = batches.shift();
        if (!tpl) return;
        var frag = document.importNode(tpl.content, true);
        var items = Array.prototype.filter.call(frag.childNodes, function(n){ return n.nodeType === 1; });
        var motion = SL.motionOK();
        items.forEach(function(el, i){
          if (motion){ el.classList.add('sf-new'); el.style.animationDelay = (i * 70) + 'ms'; }
        });
        grid.appendChild(frag);
        loaded++;
        var cards = items.filter(function(el){ return el.classList.contains('sf-card'); });
        var firstLink = cards.length ? $('a[href]', cards[0]) : null;
        if (firstLink){
          firstLink.focus({preventScroll:true});
          var r = firstLink.getBoundingClientRect();
          var top = (window.pageYOffset || 0) + r.top - Math.max(90, (window.innerHeight || 800) * 0.18);
          window.scrollTo({top:top, behavior: motion ? 'smooth' : 'auto'});
        }
        items.forEach(function(el){ el.addEventListener('animationend', function(){ el.classList.remove('sf-new'); el.style.animationDelay = ''; }, {once:true}); });
        var msg = cards.length + ' more ' + (cards.length === 1 ? 'story' : 'stories') + ' loaded.';
        if (!batches.length){
          btn.hidden = true;
          end.hidden = false;
          msg += ' That’s everything on this page. Use the page links to see more.';
        }
        live.textContent = '';
        setTimeout(function(){ live.textContent = msg; }, 60);
        SL.track('sf_load_more', {page:page, batch:loaded, items:cards.length, remaining:batches.length});
        queueAdCheck();
      });
    });

    /* ---------- click tracking ---------- */
    document.addEventListener('click', function(e){
      var t = e.target.closest ? e.target : null;
      if (!t) return;
      var a = t.closest('.sf-card a[href]');
      if (a){
        var li = a.closest('.sf-card'), grid = li.parentNode;
        var pos = $$('.sf-card', grid).indexOf(li) + 1;
        SL.track('sf_card_click', {page:page, position:pos, destination:a.href});
        return;
      }
      if ((a = t.closest('.sf-lead[href]'))){ SL.track('sf_lead_click', {page:page, destination:a.href}); return; }
      if ((a = t.closest('.sf-chip[href]'))){ SL.track('sf_subnav_click', {page:page, chip:a.textContent.trim()}); return; }
      if ((a = t.closest('.sf-pages a[href]'))){ SL.track('sf_page_click', {page:page, to:a.textContent.trim()}); }
    }, true);

    /* ---------- dev guard: ads must never touch ---------- */
    var adT = 0;
    function checkAds(){
      $$('[data-sf-grid]').forEach(function(grid){
        var ads = $$(':scope > .sf-ad', grid).map(function(el){ return el.getBoundingClientRect(); }).filter(function(r){ return r.width; });
        var cs = getComputedStyle(grid), cg = parseFloat(cs.columnGap) || 0, rg = parseFloat(cs.rowGap) || 0;
        for (var i = 0; i < ads.length; i++) for (var j = i + 1; j < ads.length; j++){
          var a = ads[i], b = ads[j];
          var sideBySide = Math.abs(a.top - b.top) < 4 && Math.abs(Math.max(a.left, b.left) - Math.min(a.right, b.right)) <= cg + 4;
          var stacked = Math.abs(a.left - b.left) < 4 && (Math.max(a.top, b.top) - Math.min(a.bottom, b.bottom)) <= rg + 4;
          if ((sideBySide || stacked) && window.console) console.warn('[sections] two .sf-ad cells are adjacent at ' + window.innerWidth + 'px. Reorder the grid.');
        }
      });
    }
    function queueAdCheck(){ clearTimeout(adT); adT = setTimeout(checkAds, 400); }
    window.addEventListener('resize', queueAdCheck);
    window.addEventListener('load', queueAdCheck);
  });
})();
