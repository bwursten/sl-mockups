/* ============================================================
   shell.js — header, mega menus, search, sticky bar, drawer,
   hero swipe row, video embed, pause toggle, shelves,
   player HUD (XP / level) and WORLD-banner stage squares.
   Owner: Agent SHELL. Runs after core.js (window.SL).
   ============================================================ */
(function(){
  'use strict';
  var SL = window.SL;
  var $ = SL.$, $$ = SL.$$;
  var mqDesktop = window.matchMedia('(min-width:1024px)');
  var mqPhone = window.matchMedia('(max-width:639px)');

  function ready(fn){ if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }

  /* ---------- focus helpers ---------- */
  var FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),iframe,[tabindex]:not([tabindex="-1"])';
  function focusables(root){
    return $$(FOCUSABLE, root).filter(function(el){ return el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement; });
  }
  function trapTab(e, root){
    if (e.key !== 'Tab') return;
    var f = focusables(root); if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && (document.activeElement === first || !root.contains(document.activeElement))){ e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
  }
  var scrollLocks = 0;
  function lockScroll(on){
    scrollLocks = Math.max(0, scrollLocks + (on ? 1 : -1));
    document.documentElement.style.overflow = scrollLocks ? 'hidden' : '';
  }

  ready(function(){

    /* =========================================================
       PAUSE ANIMATIONS (header #pause-anim + footer mirror)
       ========================================================= */
    var pauseBtns = $$('#pause-anim, .sh-pause-mirror');
    function syncPause(){ pauseBtns.forEach(function(b){ b.setAttribute('aria-pressed', SL.paused ? 'true' : 'false'); }); }
    pauseBtns.forEach(function(b){
      b.addEventListener('click', function(){
        SL.setPaused(!SL.paused); syncPause();
        SL.toast(SL.paused ? 'Animations paused' : 'Animations back on');
        SL.track('pause_toggle', {paused:SL.paused});
      });
    });
    document.addEventListener('sl:motion', syncPause);
    syncPause();

    /* =========================================================
       MEGA MENUS
       ========================================================= */
    var nav = $('.sh-nav');
    var items = $$('.sh-nav-item');
    var openItem = null, openT = null, closeT = null;
    var sections = []; // reused by the drawer

    items.forEach(function(li){
      var a = $('.sh-nav-link', li), panel = $('.sh-mega', li);
      if (!a || !panel) return;
      var label = a.textContent.trim();
      sections.push({
        key: li.getAttribute('data-sec'), label: label, href: a.getAttribute('href'),
        style: li.getAttribute('style') || '', panel: panel
      });
      // swap the plain link for a toggle button (keeps child nodes, incl. the squirrel anchor span)
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = a.className;
      while (a.firstChild) btn.appendChild(a.firstChild);
      var caret = document.createElement('span');
      caret.className = 'sh-nav-caret'; caret.setAttribute('aria-hidden', 'true'); caret.textContent = '▼';
      btn.appendChild(caret);
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-controls', panel.id);
      a.parentNode.replaceChild(btn, a);
      li._btn = btn; li._panel = panel;

      btn.addEventListener('click', function(){
        clearTimeout(openT); clearTimeout(closeT);
        if (openItem === li) closeMega(li, false); else openMega(li, 'click');
      });
      btn.addEventListener('keydown', function(e){
        var k = e.key, idx = items.indexOf(li);
        if (k === 'ArrowDown'){ e.preventDefault(); openMega(li, 'key'); var f = focusables(panel)[0]; if (f) f.focus(); }
        else if (k === 'ArrowRight' || k === 'ArrowLeft'){
          e.preventDefault();
          var n = items[(idx + (k === 'ArrowRight' ? 1 : -1) + items.length) % items.length];
          var wasOpen = !!openItem;
          if (n && n._btn){ n._btn.focus(); if (wasOpen) openMega(n, 'key'); }
        }
        else if (k === 'Escape' && openItem === li){ e.preventDefault(); closeMega(li, true); }
      });
      panel.addEventListener('keydown', function(e){
        if (e.key === 'Escape'){ e.preventDefault(); e.stopPropagation(); closeMega(li, true); return; }
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp'){
          var f = focusables(panel), i = f.indexOf(document.activeElement);
          if (i < 0) return;
          e.preventDefault();
          var j = e.key === 'ArrowDown' ? Math.min(f.length - 1, i + 1) : i - 1;
          if (j < 0) btn.focus(); else f[j].focus();
        }
      });
      // hover (mouse only, desktop): ~150ms open delay, ~300ms close grace
      li.addEventListener('pointerenter', function(e){
        if (e.pointerType !== 'mouse' || !mqDesktop.matches) return;
        clearTimeout(closeT); clearTimeout(openT);
        if (openItem && openItem !== li) openMega(li, 'hover');
        else if (!openItem) openT = setTimeout(function(){ openMega(li, 'hover'); }, 150);
      });
      li.addEventListener('pointerleave', function(e){
        if (e.pointerType !== 'mouse') return;
        clearTimeout(openT);
        if (openItem === li) closeT = setTimeout(function(){ closeMega(li, false); }, 300);
      });
      li.addEventListener('focusout', function(e){
        if (openItem === li && e.relatedTarget && !li.contains(e.relatedTarget)) closeMega(li, false);
      });
    });

    function openMega(li, how){
      if (openItem === li) return;
      if (openItem) closeMega(openItem, false);
      li.classList.add('is-open');
      li._btn.setAttribute('aria-expanded', 'true');
      openItem = li;
      SL.track('nav_menu_open', {section:li.getAttribute('data-sec'), via:how});
    }
    function closeMega(li, refocus){
      li = li || openItem; if (!li) return;
      li.classList.remove('is-open');
      li._btn.setAttribute('aria-expanded', 'false');
      if (openItem === li) openItem = null;
      if (refocus) li._btn.focus();
    }
    document.addEventListener('click', function(e){
      if (openItem && nav && !nav.contains(e.target)) closeMega(openItem, false);
    });
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape' && openItem) closeMega(openItem, nav.contains(document.activeElement));
    });
    var onBp = function(){ if (!mqDesktop.matches && openItem) closeMega(openItem, false); };
    if (mqDesktop.addEventListener) mqDesktop.addEventListener('change', onBp); else if (mqDesktop.addListener) mqDesktop.addListener(onBp);

    /* =========================================================
       SEARCH PANEL
       ========================================================= */
    var sp = $('#search-panel'), sForm = $('#search-form'), sInput = $('#search-input');
    var searchTriggers = $$('.sh-search-btn, .sh-sticky-search');
    var searchReturn = null;
    if (sp){
      sp.setAttribute('role', 'dialog');
      sp.setAttribute('aria-modal', 'true');
      sp.setAttribute('aria-label', 'Search Scout Life');
      $$('.sh-search-btn').forEach(function(b){ b.setAttribute('role', 'button'); });
      searchTriggers.forEach(function(t){
        t.addEventListener('click', function(e){ e.preventDefault(); openSearch(t); });
        t.addEventListener('keydown', function(e){ if (e.key === ' ' && t.tagName === 'A'){ e.preventDefault(); openSearch(t); } });
      });
      $('.sh-search-close', sp).addEventListener('click', closeSearch);
      sp.addEventListener('click', function(e){ if (e.target === sp) closeSearch(); });
      sp.addEventListener('keydown', function(e){
        if (e.key === 'Escape'){ e.preventDefault(); closeSearch(); return; }
        trapTab(e, sp);
      });
    }
    function openSearch(trigger){
      if (openItem) closeMega(openItem, false);
      searchReturn = trigger || document.activeElement;
      sp.classList.add('is-open');
      searchTriggers.forEach(function(t){ t.setAttribute('aria-expanded', 'true'); });
      lockScroll(true);
      setTimeout(function(){ sInput.focus(); }, 40);
      SL.track('search_open', {});
    }
    function closeSearch(){
      if (!sp.classList.contains('is-open')) return;
      sp.classList.remove('is-open');
      searchTriggers.forEach(function(t){ t.setAttribute('aria-expanded', 'false'); });
      lockScroll(false);
      if (searchReturn && searchReturn.focus) searchReturn.focus();
    }
    function doSearch(q, fromEl){
      q = (q || '').trim();
      if (!q){ SL.toast('Type something to search for!'); if (fromEl) fromEl.focus(); return; }
      SL.runSearch(q);
    }
    if (sForm){
      sForm.addEventListener('submit', function(e){ e.preventDefault(); doSearch(sInput.value, sInput); });
      $$('.sh-chips .chip', sp).forEach(function(c){
        c.addEventListener('click', function(e){
          e.preventDefault();
          var q = c.getAttribute('data-q') || c.textContent;
          sInput.value = q;
          SL.track('search_chip', {chip:q});
          doSearch(q, sInput);
        });
      });
    }

    /* =========================================================
       DRAWER (tablet/phone menu; also used by the sticky bar)
       ========================================================= */
    var drawer = $('#sh-drawer');
    var menuTriggers = $$('.sh-menu-btn, .sh-sticky-menu');
    var drawerReturn = null;
    if (drawer){
      var acc = $('[data-acc]', drawer);
      sections.forEach(function(s){
        if (s.key === 'contact') return; // Contact has its own button at the bottom of the drawer
        var sec = document.createElement('div');
        sec.className = 'sh-acc-sec';
        sec.setAttribute('style', s.style);
        var pid = 'acc-' + s.key;
        var h = document.createElement('h2'); h.style.margin = '0';
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'sh-acc-btn';
        b.setAttribute('aria-expanded', 'false'); b.setAttribute('aria-controls', pid);
        b.innerHTML = '<span></span><span class="sh-acc-plus" aria-hidden="true">+</span>';
        b.firstChild.textContent = s.label;
        h.appendChild(b);
        var p = document.createElement('div');
        p.className = 'sh-acc-panel'; p.id = pid; p.hidden = true;
        var ul = document.createElement('ul');
        $$('.sh-mega-links a', s.panel).forEach(function(a){
          var li = document.createElement('li'); var c = document.createElement('a');
          c.href = a.href; c.textContent = a.firstChild ? a.firstChild.textContent.trim() : a.textContent.trim();
          li.appendChild(c); ul.appendChild(li);
        });
        var all = $('.sh-mega-all', s.panel);
        if (all){
          var li2 = document.createElement('li'); var c2 = document.createElement('a');
          c2.href = all.href; c2.className = 'sh-acc-all'; c2.textContent = all.textContent.trim() + ' ▶';
          li2.appendChild(c2); ul.appendChild(li2);
        }
        p.appendChild(ul);
        sec.appendChild(h); sec.appendChild(p);
        acc.appendChild(sec);
        b.addEventListener('click', function(){
          var open = b.getAttribute('aria-expanded') === 'true';
          b.setAttribute('aria-expanded', open ? 'false' : 'true');
          p.hidden = open;
          if (!open) SL.track('drawer_section_open', {section:s.key});
        });
      });

      menuTriggers.forEach(function(t){ t.addEventListener('click', function(){ openDrawer(t); }); });
      $('.sh-drawer-close', drawer).addEventListener('click', closeDrawer);
      drawer.addEventListener('keydown', function(e){
        if (e.key === 'Escape'){ e.preventDefault(); closeDrawer(); return; }
        trapTab(e, drawer);
      });
      var dForm = $('.sh-drawer-search', drawer);
      dForm.addEventListener('submit', function(e){
        e.preventDefault();
        var inp = $('input', dForm), q = inp.value.trim();
        if (!q){ SL.toast('Type something to search for!'); inp.focus(); return; }
        closeDrawer(); doSearch(q);
      });
    }
    function openDrawer(trigger){
      if (openItem) closeMega(openItem, false);
      drawerReturn = trigger || document.activeElement;
      drawer.hidden = false;
      drawer.classList.add('is-open');
      menuTriggers.forEach(function(t){ t.setAttribute('aria-expanded', 'true'); });
      lockScroll(true);
      setTimeout(function(){ $('.sh-drawer-close', drawer).focus(); }, 30);
      SL.track('drawer_open', {});
    }
    function closeDrawer(){
      if (drawer.hidden) return;
      drawer.hidden = true;
      drawer.classList.remove('is-open');
      menuTriggers.forEach(function(t){ t.setAttribute('aria-expanded', 'false'); });
      lockScroll(false);
      if (drawerReturn && drawerReturn.focus && drawerReturn.offsetParent !== null) drawerReturn.focus();
      else { var m = $('.sh-menu-btn'); if (m && m.offsetParent !== null) m.focus(); }
    }

    /* =========================================================
       STICKY COMPACT BAR
       ========================================================= */
    var header = $('#site-header'), sticky = $('.sh-sticky');
    function setSticky(on){
      if (!sticky) return;
      sticky.classList.toggle('is-on', on);
      if ('inert' in sticky) sticky.inert = !on;
      sticky.setAttribute('aria-hidden', on ? 'false' : 'true');
      if (on && openItem) closeMega(openItem, false);
    }
    if (header && sticky){
      setSticky(false);
      if ('IntersectionObserver' in window){
        new IntersectionObserver(function(en){
          en.forEach(function(x){ setSticky(!x.isIntersecting && x.boundingClientRect.top < 0); });
        }, {threshold:0}).observe(header);
      } else {
        window.addEventListener('scroll', function(){
          var r = header.getBoundingClientRect(); setSticky(r.bottom < 0);
        }, {passive:true});
      }
    }

    /* =========================================================
       SUBSCRIBE WIGGLE — gentle, at most 3 times per visit
       ========================================================= */
    var WKEY = 'sl:subWiggles', wiggles = 0;
    try { wiggles = +sessionStorage.getItem(WKEY) || 0; } catch(e){}
    function wiggleOnce(){
      if (wiggles >= 3) return;
      if (!SL.motionOK() || document.hidden){ scheduleWiggle(); return; }
      var target = (sticky && sticky.classList.contains('is-on')) ? $('.sh-subscribe', sticky) : $('#site-header .sh-subscribe');
      if (!target) return;
      target.classList.remove('is-wiggling'); void target.offsetWidth;
      target.classList.add('is-wiggling');
      wiggles++;
      try { sessionStorage.setItem(WKEY, String(wiggles)); } catch(e){}
      if (wiggles < 3) scheduleWiggle();
    }
    function scheduleWiggle(){ setTimeout(wiggleOnce, 9000 + Math.random() * 6000); }
    $$('.sh-subscribe').forEach(function(s){ s.addEventListener('animationend', function(){ s.classList.remove('is-wiggling'); }); });
    if (wiggles < 3) setTimeout(wiggleOnce, 3500);

    /* Subscribe CTA tracking (placement from utm_campaign) */
    document.addEventListener('click', function(e){
      var a = e.target.closest && e.target.closest('a[href*="subscribe.scoutlife.org"]');
      if (!a) return;
      var m = /utm_campaign=([\w-]+)/.exec(a.href);
      SL.track('subscribe_click', {placement: m ? m[1] : 'unknown'});
    }, true);

    /* =========================================================
       HERO — click tracking + phone swipe row controls
       ========================================================= */
    $$('.hero-card').forEach(function(c, i){
      c.addEventListener('click', function(){ SL.track('hero_click', {slot:i + 1, destination:c.href}); });
    });
    var track = $('#hero-side'), dotsWrap = $('.sh-hero-dots');
    if (track && dotsWrap){
      var cards = $$('.hero-sm', track), dots = [];
      cards.forEach(function(c, i){
        var d = document.createElement('button');
        d.type = 'button'; d.className = 'sh-hero-dot';
        d.setAttribute('aria-label', 'Show story ' + (i + 1) + ' of ' + cards.length);
        d.setAttribute('aria-controls', 'hero-side');
        d.innerHTML = '<span aria-hidden="true"></span>';
        d.addEventListener('click', function(){ goTo(i); });
        dotsWrap.appendChild(d); dots.push(d);
      });
      var arrows = $$('.sh-hero-arrow');
      arrows.forEach(function(a){
        a.addEventListener('click', function(){ goTo(current() + (+a.getAttribute('data-dir'))); });
      });
      function current(){
        var tl = track.getBoundingClientRect().left, best = 0, bestD = Infinity;
        cards.forEach(function(c, i){ var d = Math.abs(c.getBoundingClientRect().left - tl - 16); if (d < bestD){ bestD = d; best = i; } });
        return best;
      }
      function goTo(i){
        i = Math.max(0, Math.min(cards.length - 1, i));
        var left = cards[i].getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft - 16;
        track.scrollTo({left:left, behavior:SL.motionOK() ? 'smooth' : 'auto'});
        SL.track('hero_swipe', {to:i + 1});
      }
      var raf = 0;
      function update(){
        raf = 0;
        var i = current();
        var atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
        if (atEnd) i = cards.length - 1;
        dots.forEach(function(d, j){ if (j === i) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current'); });
        if (arrows[0]) arrows[0].disabled = track.scrollLeft <= 4;
        if (arrows[1]) arrows[1].disabled = atEnd;
      }
      track.addEventListener('scroll', function(){ if (!raf) raf = requestAnimationFrame(update); }, {passive:true});
      window.addEventListener('resize', function(){ if (!raf) raf = requestAnimationFrame(update); });
      update();
    }

    /* =========================================================
       VIDEO OF THE WEEK — load youtube-nocookie only on click
       ========================================================= */
    $$('.sh-video-frame[data-yt]').forEach(function(fr){
      var poster = $('.sh-video-poster', fr);
      if (!poster) return;
      poster.addEventListener('click', function(e){
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return; // let "open in new tab" work
        e.preventDefault();
        var id = fr.getAttribute('data-yt');
        var ifr = document.createElement('iframe');
        ifr.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0&modestbranding=1';
        ifr.title = 'Video of the Week: Tales From the Campfire';
        ifr.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
        ifr.setAttribute('allowfullscreen', '');
        ifr.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
        fr.innerHTML = '';
        fr.appendChild(ifr);
        ifr.focus();
        SL.track('video_play', {video_id:id});
      });
    });

    /* =========================================================
       PLAYER HUD — XP counter + LEVEL + segmented bar
       (header + sticky mini). Driven by SL.xp / SL.level() and
       the 'sl:xp' event from core.js. No XP is awarded here.
       ========================================================= */
    var huds = $$('[data-hud]');
    var live = document.createElement('p');
    live.className = 'sr-only'; live.setAttribute('aria-live', 'polite');
    document.body.appendChild(live);
    var shownXP = SL.xp || 0, countRaf = 0, gainT = 0, upT = 0;
    function pad(n){ n = Math.max(0, Math.round(n)); return n > 9999 ? String(n) : ('0000' + n).slice(-4); }
    function paintHud(xpVal){
      var lvl = SL.level(SL.xp), into = SL.xp - (lvl - 1) * 100;   // bar always reflects the real total
      huds.forEach(function(h){
        var lv = $('[data-hud-lv]', h), xp = $('[data-hud-xp]', h), bar = $('.sh-hud-bar', h), fill = $('.sh-hud-fill', h);
        if (lv) lv.textContent = lvl;
        if (xp) xp.textContent = pad(xpVal);
        if (fill) fill.style.setProperty('--p', into + '%');
        if (bar){ bar.setAttribute('aria-valuenow', String(into)); bar.setAttribute('aria-valuetext', into + ' of 100 XP to level ' + (lvl + 1)); }
        h.classList.toggle('has-xp', SL.xp > 0);
      });
    }
    function countTo(target){
      cancelAnimationFrame(countRaf);
      if (!SL.motionOK()){ shownXP = target; paintHud(target); return; }
      var from = shownXP, t0 = performance.now(), dur = 600;
      (function step(now){
        var k = Math.min(1, (now - t0) / dur);
        shownXP = from + (target - from) * k;
        paintHud(Math.floor(shownXP));
        if (k < 1) countRaf = requestAnimationFrame(step);
      })(t0);
    }
    function visibleHud(){
      var s = sticky && sticky.classList.contains('is-on');
      return huds.filter(function(h){ return s ? sticky.contains(h) : !sticky || !sticky.contains(h); })[0];
    }
    paintHud(shownXP);
    document.addEventListener('sl:xp', function(e){
      var d = e.detail || {};
      countTo(SL.xp);
      huds.forEach(function(h){ h.classList.add('is-gain'); });
      clearTimeout(gainT);
      gainT = setTimeout(function(){ huds.forEach(function(h){ h.classList.remove('is-gain'); }); }, 700);
      if (d.levelUp){
        huds.forEach(function(h){ h.classList.add('is-levelup'); });
        clearTimeout(upT);
        upT = setTimeout(function(){ huds.forEach(function(h){ h.classList.remove('is-levelup'); }); }, 2400);
        live.textContent = 'Level up! You reached level ' + d.level + '.';
        var h = visibleHud();
        if (h && h.offsetParent !== null){
          var r = h.getBoundingClientRect();
          if (r.bottom > 0 && r.top < window.innerHeight){
            SL.confetti(r.left + r.width / 2, r.top + r.height / 2, {count:18, spread:110, shapes:['■','■','✚','★'],
              colors:['#FFE600','#3CF06E','#00E5FF','#FF9F1C','#FFFFFF']});
          } else { SL.toast('LEVEL UP! LV ' + d.level); }
        } else { SL.toast('LEVEL UP! LV ' + d.level); }
        SL.track('level_up', {level:d.level});
      }
    });

    /* =========================================================
       WORLD BANNERS — one stage square per widget in the zone;
       a square lights up once that widget has been on screen.
       ========================================================= */
    $$('.sh-zone').forEach(function(zone){
      var holder = $('.sh-stages', zone); if (!holder) return;
      var ws = $$('.sh-grid > .widget', zone), sq = [];
      ws.forEach(function(){ var i = document.createElement('i'); holder.appendChild(i); sq.push(i); });
      if (!('IntersectionObserver' in window)) return;
      var io = new IntersectionObserver(function(en){
        en.forEach(function(x){
          if (!x.isIntersecting) return;
          var i = ws.indexOf(x.target);
          if (i > -1) sq[i].classList.add('on');
          io.unobserve(x.target);
        });
      }, {threshold:.5});
      ws.forEach(function(w){ io.observe(w); });
    });
  });

  /* =========================================================
     SECTION SHELVES — registered for analytics only
     ========================================================= */
  SL.widget('shelf-fun', function(){});
  SL.widget('shelf-scouting', function(){});
  SL.widget('shelf-outdoors', function(){});
})();
