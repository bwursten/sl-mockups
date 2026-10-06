/* ============================================================
   shell.js — header, mega menus, search, sticky bar, drawer,
   hero swipe row, video embed, pause toggle, shelves.
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
      caret.className = 'sh-nav-caret'; caret.setAttribute('aria-hidden', 'true'); caret.textContent = '▾';
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
          c2.href = all.href; c2.className = 'sh-acc-all'; c2.textContent = all.textContent.trim() + ' →';
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
       COMPASS ROSE — needle follows the cursor (mouse);
       gentle swing on touch; still when motion is off
       ========================================================= */
    var compass = $('.sh-compass'), needle = compass && $('.sh-needle', compass);
    if (compass && needle){
      var mqFine = window.matchMedia('(hover:hover) and (pointer:fine)');
      var cur = 0, goal = 0, cRaf = 0, haveMouse = false;
      var setNeedle = function(deg){ needle.style.transform = 'rotate(' + deg.toFixed(1) + 'deg)'; };
      var stepNeedle = function(){
        cRaf = 0;
        var d = ((goal - cur + 540) % 360) - 180;   // shortest way round
        cur += d * 0.14;
        setNeedle(cur);
        if (Math.abs(d) > 0.3) cRaf = requestAnimationFrame(stepNeedle);
      };
      var compassMode = function(){
        var ok = SL.motionOK();
        compass.classList.toggle('is-swing', ok && !mqFine.matches);
        if (!ok || !mqFine.matches){ cancelAnimationFrame(cRaf); cRaf = 0; needle.style.transform = ''; cur = goal = 0; }
      };
      document.addEventListener('pointermove', function(e){
        if (e.pointerType !== 'mouse' || !mqFine.matches || !SL.motionOK()) return;
        var r = compass.getBoundingClientRect();
        if (!r.width) return;
        haveMouse = true;
        goal = Math.atan2(e.clientX - (r.left + r.width / 2), (r.top + r.height / 2) - e.clientY) * 180 / Math.PI;
        if (!cRaf) cRaf = requestAnimationFrame(stepNeedle);
      }, {passive:true});
      document.addEventListener('sl:motion', compassMode);
      if (mqFine.addEventListener) mqFine.addEventListener('change', compassMode);
      compassMode();
    }

    /* =========================================================
       TRAIL LINE — a dashed trail winds from the hero down to
       the footer campfire (left gutter + switchbacks in the open
       space between sections). Draws itself as you scroll; a
       tiny hiker rides the tip. Fully drawn when motion is off.
       Hidden on phones (CSS + no build).
       ========================================================= */
    var mainEl = $('#main');
    if (mainEl && document.createElementNS){
      var NS = 'http://www.w3.org/2000/svg';
      var mk = function(tag, attrs, parent){
        var el = document.createElementNS(NS, tag);
        for (var k in attrs) if (Object.prototype.hasOwnProperty.call(attrs, k)) el.setAttribute(k, attrs[k]);
        if (parent) parent.appendChild(el);
        return el;
      };
      var trail = null;     // {svg, reveal, total, lens[], ys[], marks[], hiker, line}
      var tRaf = 0;

      var relRect = function(el, base){
        var r = el.getBoundingClientRect();
        return {left:r.left - base.left, right:r.right - base.left, top:r.top - base.top, bottom:r.bottom - base.top, width:r.width, height:r.height};
      };
      var adRects = function(base){ return $$('.ad-slot', mainEl).map(function(a){ return relRect(a, base); }).filter(function(r){ return r.width > 0; }); };
      var nearAd = function(x, y, ads, pad){
        for (var i = 0; i < ads.length; i++){
          var a = ads[i];
          if (x > a.left - pad && x < a.right + pad && y > a.top - pad && y < a.bottom + pad) return true;
        }
        return false;
      };

      // Catmull-Rom → cubic Bézier path through points
      var smoothPath = function(P){
        var d = 'M' + P[0][0].toFixed(1) + ' ' + P[0][1].toFixed(1);
        for (var i = 0; i < P.length - 1; i++){
          var p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || p2;
          // points flagged 'v' keep a vertical tangent so the curve never swings out of the gutter
          var t1x = p1[2] === 'v' ? 0 : (p2[0] - p0[0]) / 6, t2x = p2[2] === 'v' ? 0 : (p3[0] - p1[0]) / 6;
          var c1x = p1[0] + t1x, c1y = p1[1] + (p2[1] - p0[1]) / 6;
          var c2x = p2[0] - t2x, c2y = p2[1] - (p3[1] - p1[1]) / 6;
          d += 'C' + c1x.toFixed(1) + ' ' + c1y.toFixed(1) + ' ' + c2x.toFixed(1) + ' ' + c2y.toFixed(1) + ' ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1);
        }
        return d;
      };

      var PIN = function(fill, glyph){
        return '<g class="pop"><path d="M0 0C-4-9-13-14-13-24a13 13 0 0 1 26 0C13-14 4-9 0 0z" fill="' + fill + '" stroke="#1F2A22" stroke-width="2.5" stroke-linejoin="round"/>' +
          '<circle cx="0" cy="-24" r="7.5" fill="#FFFDF6" stroke="#1F2A22" stroke-width="2"/>' + glyph + '</g>';
      };
      var GLYPH = {
        start:'<path d="M-3-29v10M-3-29l7 2.5-7 2.5" fill="#F26B21" stroke="#1F2A22" stroke-width="1.6" stroke-linejoin="round"/>',
        lake:'<path d="M-5-23q2.5-3 5 0t5 0M-5-27q2.5-3 5 0t5 0" fill="none" stroke="#1F64B0" stroke-width="1.8" stroke-linecap="round"/>',
        view:'<path d="M-5-20l3.5-7 2.5 4 1.5-2 3 5z" fill="#2E7550" stroke="#1F2A22" stroke-width="1.3" stroke-linejoin="round"/>',
        camp:'<path d="M-5.5-19.5L0-29l5.5 9.5z" fill="#F26B21" stroke="#1F2A22" stroke-width="1.5" stroke-linejoin="round"/><path d="M0-24l-2 4.5h4z" fill="#FFC629"/>'
      };

      var buildTrail = function(){
        if (trail){ trail.svg.remove(); trail = null; }
        if (mqPhone.matches) return;
        var base = mainEl.getBoundingClientRect();
        var W = mainEl.clientWidth, H = mainEl.offsetHeight;
        var hero = $('.sh-hero', mainEl), heroGrid = $('.sh-hero-grid', mainEl), heroHead = $('.sh-hero-head', mainEl);
        var zones = $$('.sh-zone', mainEl), band = $('.sh-band', mainEl);
        if (!hero || !heroGrid || !heroHead) return;
        var hr = relRect(hero, base), cs = getComputedStyle(hero);
        var cL = hr.left + parseFloat(cs.paddingLeft), cR = hr.right - parseFloat(cs.paddingRight), cW = cR - cL;
        var xL = Math.max(10, cL / 2);
        var amp = Math.min(7, Math.max(0, cL / 2 - 9));   // wiggle stays inside the gutter
        var ads = adRects(base);

        // open corridors between blocks (top, bottom, how far the switchback reaches, waypoint)
        var cor = [];
        var hh = relRect(heroHead, base);
        var gridOf = function(z){ return $('.sh-grid', z); };
        var z = zones.map(function(el){ return {head:relRect($('.sh-zone-head', el), base), grid:relRect(gridOf(el), base)}; });
        var bandR = band ? relRect(band, base) : null;
        var hg = relRect(heroGrid, base);
        if (z[0]) cor.push({t:hg.bottom, b:z[0].head.top, reach:.46, mark:null});
        if (z[0] && bandR) cor.push({t:z[0].grid.bottom, b:bandR.top, reach:.62, mark:{k:'lake', fill:'#3FA9F5', label:'Lake ahead!'}});
        if (bandR && z[1]) cor.push({t:bandR.bottom, b:z[1].head.top, reach:.34, mark:null});
        if (z[1] && z[2]) cor.push({t:z[1].grid.bottom, b:z[2].head.top, reach:.56, mark:{k:'view', fill:'#8DBF4A', label:'Halfway there'}});
        var last = z[z.length - 1];
        var endY = H - 52, endX = cL + cW * 0.5;

        // points
        var P = [], marks = [];
        var startY = Math.max(30, hh.top - 20), startX = cL + Math.min(cW * 0.42, 420);
        P.push([startX, startY]);
        marks.push({x:startX, y:startY, k:'start', fill:'#FFC629', label:'Trailhead', side:1});
        P.push([(xL + startX) / 2, startY + 4]);
        P.push([xL + 22, startY + 14]);
        P.push([xL + 2, startY + 34]);
        P.push([xL, startY + 58, 'v']);
        var y = startY + 58, flip = 1;
        var runTo = function(yEnd){
          var step = 150;
          while (y + step < yEnd - 40){ y += step; flip = -flip; P.push([xL + amp * flip, y, 'v']); }
        };
        cor.forEach(function(c){
          var h = c.b - c.t; if (h < 50) return;
          runTo(c.t);
          var yT = c.t + h * 0.12, yB = c.b - h * 0.12, yM = (yT + yB) / 2;
          var far = cL + cW * c.reach;
          while (far > cL + 120 && nearAd(far, yM, ads, 50)) far -= 40;
          P.push([xL, yT, 'v']);
          P.push([xL + (far - xL) * 0.55, yT + (yM - yT) * 0.45]);
          P.push([far, yM]);
          P.push([xL + (far - xL) * 0.55, yB - (yB - yM) * 0.45]);
          P.push([xL, yB, 'v']);
          y = yB;
          if (c.mark) marks.push({x:far, y:yM, k:c.mark.k, fill:c.mark.fill, label:c.mark.label, side:1});
        });
        // last leg: down the gutter to below zone 3, then out to camp above the campfire
        var lastBottom = last ? last.grid.bottom : H - 120;
        runTo(lastBottom);
        var ex = endX;
        while (ex > cL + 120 && nearAd(ex, endY, ads, 40)) ex -= 40;
        P.push([xL, lastBottom + 20, 'v']);
        P.push([xL + (ex - xL) * 0.45, endY - 6]);
        P.push([ex, endY]);
        marks.push({x:ex, y:endY, k:'camp', fill:'#F26B21', label:'Camp', side:1});

        var svg = mk('svg', {'class':'sh-trail', width:W, height:H, viewBox:'0 0 ' + W + ' ' + H, 'aria-hidden':'true', focusable:'false'});
        svg.style.width = W + 'px'; svg.style.height = H + 'px';
        var defs = mk('defs', {}, svg);
        var mask = mk('mask', {id:'sh-trail-mask', maskUnits:'userSpaceOnUse', x:0, y:0, width:W, height:H}, defs);
        var d = smoothPath(P);
        var reveal = mk('path', {d:d, fill:'none', stroke:'#fff', 'stroke-width':26, 'stroke-linecap':'round', 'stroke-linejoin':'round'}, mask);
        var g = mk('g', {mask:'url(#sh-trail-mask)'}, svg);
        mk('path', {'class':'sh-trail-halo', d:d}, g);
        var line = mk('path', {'class':'sh-trail-line', d:d}, g);
        mainEl.insertBefore(svg, mainEl.firstChild);

        var total = line.getTotalLength();
        reveal.style.strokeDasharray = total + ' ' + (total + 50);
        // sample y along the path (y only ever increases, so we can map scroll → length)
        var lens = [], ys = [], maxY = -1e9;
        for (var L = 0; L <= total; L += 8){
          var pt = line.getPointAtLength(L); maxY = Math.max(maxY, pt.y);
          lens.push(L); ys.push(maxY);
        }
        lens.push(total); ys.push(Math.max(maxY, line.getPointAtLength(total).y));
        var lenAtY = function(yy){
          var lo = 0, hi = ys.length - 1;
          if (yy <= ys[0]) return 0;
          if (yy >= ys[hi]) return total;
          while (hi - lo > 1){ var mid = (lo + hi) >> 1; if (ys[mid] < yy) lo = mid; else hi = mid; }
          return lens[lo];
        };

        // trail blazes along the way + waypoint pins
        var markEls = [];
        var gm = mk('g', {}, svg);
        var pinLens = marks.map(function(m){ return lenAtY(m.y); });
        for (var bl = 220; bl < total - 80; bl += 300){
          var bp = line.getPointAtLength(bl);
          var close = pinLens.some(function(pl){ return Math.abs(pl - bl) < 90; });
          if (close) continue;
          var bg = mk('g', {'class':'sh-trail-mark', transform:'translate(' + bp.x.toFixed(1) + ' ' + bp.y.toFixed(1) + ')'}, gm);
          bg.innerHTML = '<g class="pop"><rect x="-5" y="-9" width="10" height="16" rx="1.5" fill="#FFC629" stroke="#1F2A22" stroke-width="2"/></g>';
          markEls.push({el:bg, at:bl});
        }
        marks.forEach(function(m, i){
          var mg = mk('g', {'class':'sh-trail-mark', transform:'translate(' + m.x.toFixed(1) + ' ' + m.y.toFixed(1) + ')'}, gm);
          mg.innerHTML = PIN(m.fill, GLYPH[m.k] || '');
          var tx = mk('text', {'class':'sh-trail-label', x:18, y:-14}, mg);
          tx.textContent = m.label;
          markEls.push({el:mg, at:i === 0 ? 0 : pinLens[i] - 4});
        });

        // the hiker
        var hk = mk('g', {'class':'sh-hiker'}, svg);
        hk.innerHTML = '<g class="sh-hiker-bob"><g transform="translate(-11 -30)">' +
          '<path d="M19 8l-2 22" stroke="#7A4E2D" stroke-width="2.4" stroke-linecap="round"/>' +
          '<rect x="2" y="9" width="8" height="11" rx="2.5" fill="#F26B21" stroke="#1F2A22" stroke-width="2"/>' +
          '<path d="M9 19l-3 9M11 19l4 9" stroke="#1F2A22" stroke-width="2.6" stroke-linecap="round"/>' +
          '<rect x="7" y="9" width="8" height="12" rx="3" fill="#1F5C3A" stroke="#1F2A22" stroke-width="2"/>' +
          '<path d="M14 13l5-3" stroke="#1F2A22" stroke-width="2.4" stroke-linecap="round"/>' +
          '<circle cx="11.5" cy="5" r="4" fill="#FFE0B8" stroke="#1F2A22" stroke-width="2"/>' +
          '<path d="M7 4h9" stroke="#1F2A22" stroke-width="2.4" stroke-linecap="round"/><path d="M8.5 3.5c0-3 6-3 6 0" fill="#FFC629" stroke="#1F2A22" stroke-width="1.8"/>' +
          '</g></g>';
        trail = {svg:svg, reveal:reveal, line:line, total:total, lenAtY:lenAtY, marks:markEls, hiker:hk, last:-1};
        updateTrail();
      };

      var updateTrail = function(){
        tRaf = 0;
        if (!trail) return;
        var drawn;
        var motion = SL.motionOK();
        if (!motion) drawn = trail.total;
        else {
          var base = mainEl.getBoundingClientRect();
          var target = (window.innerHeight || 800) * 0.62 - base.top;
          drawn = Math.max(0, Math.min(trail.total, trail.lenAtY(target)));
        }
        if (Math.abs(drawn - trail.last) < 0.5) return;
        trail.last = drawn;
        trail.reveal.style.strokeDashoffset = '0';
        trail.reveal.style.strokeDasharray = drawn.toFixed(1) + ' ' + (trail.total + 50);
        trail.marks.forEach(function(m){ m.el.classList.toggle('on', drawn >= m.at); });
        var showHiker = motion && drawn > 4 && drawn < trail.total - 2;
        trail.hiker.classList.toggle('off', !showHiker);
        if (showHiker){
          var p = trail.line.getPointAtLength(drawn), q = trail.line.getPointAtLength(Math.max(0, drawn - 6));
          var face = (p.x - q.x) < -0.6 ? -1 : 1;
          trail.hiker.setAttribute('transform', 'translate(' + p.x.toFixed(1) + ' ' + (p.y - 2).toFixed(1) + ') scale(' + face + ' 1)');
        }
      };
      var queueTrail = function(){ if (!tRaf) tRaf = requestAnimationFrame(updateTrail); };
      var rebuildT = 0;
      var queueBuild = function(){ clearTimeout(rebuildT); rebuildT = setTimeout(buildTrail, 180); };

      window.addEventListener('scroll', queueTrail, {passive:true});
      window.addEventListener('resize', queueBuild);
      document.addEventListener('sl:motion', function(){ if (trail){ trail.last = -1; } queueTrail(); });
      if ('ResizeObserver' in window){
        var lastH = 0, lastW = 0;
        new ResizeObserver(function(){
          var h = mainEl.offsetHeight, w = mainEl.clientWidth;
          if (Math.abs(h - lastH) > 2 || Math.abs(w - lastW) > 2){ lastH = h; lastW = w; queueBuild(); }
        }).observe(mainEl);
      }
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(queueBuild);
      window.addEventListener('load', queueBuild);
      buildTrail();
    }
  });

  /* =========================================================
     SECTION SHELVES — registered for analytics only
     ========================================================= */
  SL.widget('shelf-fun', function(){});
  SL.widget('shelf-scouting', function(){});
  SL.widget('shelf-outdoors', function(){});
})();
