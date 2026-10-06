/* ============================================================
   Widget: joke (Joke of the Day) — owner: Agent A
   Real jokes from jokes.scoutlife.org (mockup: hardcoded feed).
   Egg: 5 "Groan" taps in a row → widget melts into a puddle, then boings back.
   ============================================================ */
(function(){
  'use strict';
  var J = 'https://jokes.scoutlife.org/jokes/';

  // [speaker, line] pairs, credit, slug
  var TOPICS = {
    animals:{label:'🐾 Animal joke', jokes:[
      {id:'a-horses-favorite-dance', by:'Clark N., New Orleans, Louisiana', d:[['CLARK','What’s a horse’s favorite dance?'],['LIAM','I’m not sure.'],['CLARK','The neigh-neigh.']]},
      {id:'hedgehogs-never-share', by:'Axel M., Chevy Chase, Maryland', d:[['AXEL','What animal never shares a hedge?'],['THEO','Tell me.'],['AXEL','A hedgehog.']]},
      {id:'how-rabbits-travel', by:'Seth P., Melbourne, Florida', d:[['SETH','How do rabbits travel?'],['RILEY','I haven’t the foggiest.'],['SETH','On hare-planes.']]},
      {id:'when-you-put-an-alligator-in-a-vest', by:'Johnny W., Fayetteville, Tennessee', d:[['JOHNNY','What do you get when you put an alligator in a vest?'],['SAMMY','I’m not sure.'],['JOHNNY','An investigator.']]},
      {id:'a-cow-that-plays-the-guitar', by:'Mariano A., Lincoln, Nebraska', d:[['MARIANO','What do you call a cow that plays the guitar?'],['AVERY','Tell me.'],['MARIANO','A moo-sician.']]}
    ]},
    food:{label:'🍕 Food joke', jokes:[
      {id:'why-the-cheese-didnt-like-school', by:'Isaac L., Arcadia, California', d:[['ISAAC','Why didn’t the cheese want to go to school?'],['LISA','I don’t know.'],['ISAAC','Because his teacher was a tough grater.']]},
      {id:'hamburgers-hairstyle', by:'John N., Grand Junction, Colorado', d:[['JOHN','Do you know how a hamburger wears its hair?'],['WALKER','No. How?'],['JOHN','In a bun!']]},
      {id:'what-ghosts-like-to-eat', by:'Talia B., Summit, New Jersey', d:[['TALIA','What do ghosts like to eat?'],['LEORA','I’m clueless.'],['TALIA','Spook-ghetti.']]},
      {id:'cheese-that-isnt-yours-2', by:'Zachary H., Forest Lake, Minnesota', d:[['ZACHARY','What do you call cheese that isn’t yours?'],['VICTORIA','No idea.'],['ZACHARY','Nacho cheese.']]},
      {id:'the-pie-had-a-hard-time-on-the-test', by:'Sean S., Miami Lakes, Florida', d:[['AIDAN','Why did the pie have such a hard time on the test?'],['SEAN','Why?'],['AIDAN','Because it wasn’t a piece of cake.']]}
    ]},
    knock:{label:'🚪 Knock-knock', jokes:[
      {id:'knock-knock-whos-there-water-4', by:'James P., McKinney, Texas', d:[['JAMES','Knock, knock.'],['RON','Who’s there?'],['JAMES','Water.'],['RON','Water, who?'],['JAMES','Water you waiting for?']]},
      {id:'knock-knock-whos-there-lettuce-4', by:'Zeeshan N., Bridgeport, Connecticut', d:[['CASEY','Knock, knock.'],['PAT','Who’s there?'],['CASEY','Lettuce.'],['PAT','Lettuce, who?'],['CASEY','Lettuce in. It’s cold out here.']]},
      {id:'knock-knock-whos-there-cows-go-who', by:'Henry H., Lacey, Washington', d:[['HENRY','Knock, knock.'],['CINDY','Who’s there?'],['HENRY','Cows go who.'],['CINDY','Cows go who, who?'],['HENRY','No, silly! Cows go moo.']]},
      {id:'knock-knock-whos-there-carrie', by:'Louie A., Levittown, New York', d:[['LOUIE','Knock, knock.'],['LEVI','Who’s there?'],['LOUIE','Carrie.'],['LEVI','Carrie, who?'],['LOUIE','Carrie this tent to the campsite, please.']]},
      {id:'knock-knock-whos-there-beets-2', by:'Olivia M., Cumming, Georgia', d:[['OLIVIA','Knock, knock.'],['BRENDAN','Who’s there?'],['OLIVIA','Beets.'],['BRENDAN','Beets, who?'],['OLIVIA','Beats me!']]}
    ]},
    scouting:{label:'⛺ Scouting joke', jokes:[
      {id:'wears-a-uniform-and-floats-in-water', by:'Kyle S., Derwood, Maryland', d:[['KYLE','What wears a uniform and floats in water?'],['JAKE','Tell me.'],['KYLE','A buoy Scout!']]},
      {id:'what-kind-of-swamp', by:'Del R., Nisswa, Minnesota', d:[['DEL','What kind of swamp do you roast on a stick?'],['JOHN','I have no clue.'],['DEL','A marsh-mallow!']]},
      {id:'what-the-flame-said', by:'Zachery S., Washington, Illinois', d:[['ZACH','What did one flame say to the other?'],['SCOTT','Tell me.'],['ZACH','“We’re a perfect match.”']]},
      {id:'a-sunburned-scout-and-a-banana', by:'Daniel P., Overland Park, Kansas', d:[['DANIEL','What do a sunburned Scout and a banana have in common?'],['JOEL','I don’t know. What?'],['DANIEL','Neither likes peeling!']]},
      {id:'high-ranking-scout-with-a-buzz-cut', by:'Johnathan B., North Richland Hills, Texas', d:[['JOHNATHAN','What do you call a high-ranking Scout with a buzz cut?'],['BRUCE','Beats me.'],['JOHNATHAN','A “bald Eagle.”']]}
    ]},
    monsters:{label:'👾 Monster joke', jokes:[
      {id:'monsters-attacked-our-house', by:'Nathaniel H., Tabor, New Jersey', d:[['NATHANIEL','What time would it be if a monster attacked our house?'],['TIM','I’m not sure.'],['NATHANIEL','Time to move out.']]},
      {id:'monsters-use-powers-to-walk-through-walls', by:'Talia B., Summit, New Jersey', d:[['TALIA','If monsters use powers to walk through walls, what do humans use?'],['LEORA','What?'],['TALIA','A door.']]},
      {id:'the-mother-of-a-monster', by:'Abir M., Cupertino, California', d:[['ABIR','What do you call the mother of a monster?'],['BAILEY','Tell me.'],['ABIR','Mom-ster.']]},
      {id:'what-to-do-with-a-blue-monster-2', by:'Sarah R., Raleigh, North Carolina', d:[['SARAH LYNN','What do you do with a blue monster?'],['DAN','I don’t know.'],['SARAH LYNN','You cheer it up!']]}
    ]},
    space:{label:'🚀 Space joke', jokes:[
      {id:'what-the-earth-said-to-the-asteroid', by:'Gryffin R., Englewood, Colorado', d:[['GRYFFIN','What did Earth say to the asteroid?'],['JACKSON','I don’t know. What?'],['GRYFFIN','“Give me some space!”']]},
      {id:'planet-that-astronauts-sit-on', by:'Margaret T., Paxton, Massachusetts', d:[['MARGARET','Which planet does an astronaut sit on?'],['GREG','Tell me.'],['MARGARET','Saturn.']]},
      {id:'first-restaurant-on-the-moon', by:'Curren M., Virginia Beach, Virginia', d:[['CURREN','Did you hear about the first restaurant to open on the moon?'],['CRAIG','What about it?'],['CURREN','It has great food but no atmosphere.']]},
      {id:'a-cows-favorite-place-in-space', by:'Johnny B., Pittsburgh, Pennsylvania', d:[['JOHNNY','What are a cow’s favorite places in space?'],['MAX','Where?'],['JOHNNY','The Milky Way and the mooon.']]},
      {id:'why-the-astronaut-cleaned-his-room', by:'Thomas H., Louisa, Virginia', d:[['THOMAS','Why did the astronaut clean his room?'],['LAUREN','Why?'],['THOMAS','Because he wanted some space.']]}
    ]}
  };
  var FACES = ['', 'Groan…', 'Meh.', 'Heh!', 'Ha ha!', 'LOL!'];
  var FACE_NAMES = ['', 'Groan', 'Meh', 'Heh', 'Ha ha', 'LOL'];

  SL.widget('joke', function(root){
    var card = SL.$('.jk-card', root), lines = SL.$('.jk-lines', root), credit = SL.$('.jk-credit', root),
        tag = SL.$('.jk-tag', root), faces = SL.$$('.jk-face', root), facesWrap = SL.$('.jk-faces', root),
        fill = SL.$('.jk-fill', root), status = SL.$('.jk-status', root);

    var current = {id:'jotd-what-keys-unlock-a-banana'};   // Joke of the Day (static markup)
    var groans = 0, busy = false, melting = false;

    /* ---- Auto-fit: shrink type for long jokes so the card never overflows ---- */
    function fit(){
      var fs = 16; lines.style.setProperty('--jk-fs', fs+'px');
      while (lines.scrollHeight > lines.clientHeight + 1 && fs > 12){ fs -= .5; lines.style.setProperty('--jk-fs', fs+'px'); }
    }

    /* ---- Topic chips: links → real buttons (no-JS keeps the links) ---- */
    SL.$$('.jk-topic', root).forEach(function(a){
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'jk-topic'; b.innerHTML = a.innerHTML;
      b.setAttribute('data-topic', a.getAttribute('data-topic'));
      if (a.getAttribute('style')) b.setAttribute('style', a.getAttribute('style'));
      b.setAttribute('aria-pressed', 'false');
      b.setAttribute('aria-label', 'Show a random ' + a.textContent.trim() + ' joke');
      a.parentNode.replaceChild(b, a);
      b.addEventListener('click', function(){ pickTopic(b); });
    });

    function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }

    function render(joke, topicKey){
      // Long exchanges (knock-knocks) pair up the set-up lines so the whole joke fits the card
      var parts = joke.d.map(function(p){ return '<b>'+esc(p[0])+':</b> '+esc(p[1]); }), rows = [];
      if (parts.length >= 5){ rows.push(parts[0] + ' ' + parts[1], parts[2] + ' ' + parts[3]); rows = rows.concat(parts.slice(4)); }
      else rows = parts;
      lines.innerHTML = rows.map(function(r){ return '<p>' + r + '</p>'; }).join('');
      credit.innerHTML = '<a href="'+J+joke.id+'/" title="Joke by '+esc(joke.by)+'">Joke by '+esc(joke.by)+'</a>';
      tag.textContent = TOPICS[topicKey].label;
      current = joke; fit(); syncRating();
    }

    function pickTopic(btn){
      if (busy || melting) return;
      var key = btn.getAttribute('data-topic'), pool = TOPICS[key].jokes.filter(function(j){ return j.id !== current.id; });
      var joke = SL.rand(pool);
      SL.$$('.jk-topic', root).forEach(function(b){ b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
      SL.trackInteract('joke', 'topic:' + key);
      if (!SL.motionOK()){ render(joke, key); return; }
      busy = true;
      card.classList.remove('jk-in'); card.classList.add('jk-out');
      setTimeout(function(){
        render(joke, key);
        card.classList.remove('jk-out'); void card.offsetWidth; card.classList.add('jk-in');
        setTimeout(function(){ card.classList.remove('jk-in'); busy = false; }, 560);
      }, 200);
    }

    /* ---- Laugh-o-Meter: anonymous, one rating per joke per browser ---- */
    function ratings(){ return SL.store.get('joke-ratings', {}); }
    function setFill(r){
      var pct = r ? ((r - 1) / 4) * 100 : 0;
      fill.style.setProperty('--fill', pct + '%');
      fill.style.setProperty('--fill-bg', pct ? (10000 / pct) + '%' : '100%');
    }
    function syncRating(){
      var r = ratings()[current.id] || 0;
      faces.forEach(function(f){ f.setAttribute('aria-pressed', String(+f.getAttribute('data-r') === r)); });
      setFill(r);
    }
    function bubble(face, text){
      var b = document.createElement('span');
      b.className = 'jk-bubble'; b.setAttribute('aria-hidden', 'true'); b.textContent = text;
      b.style.left = (face.offsetLeft + face.offsetWidth / 2) + 'px';
      facesWrap.appendChild(b);
      setTimeout(function(){ b.remove(); }, SL.motionOK() ? 1300 : 1600);
    }
    function pop(face, cls){ face.classList.remove(cls); void face.offsetWidth; face.classList.add(cls);
      setTimeout(function(){ face.classList.remove(cls); }, 520); }

    faces.forEach(function(face){
      face.addEventListener('click', function(){
        if (melting) return;
        var r = +face.getAttribute('data-r'), all = ratings(), prev = all[current.id];
        // egg counter: Groans in a row
        groans = (r === 1) ? groans + 1 : 0;
        if (prev){
          if (r === 1 && prev === 1){ pop(face, 'jk-pop'); bubble(face, groans >= 3 ? 'Ugh…' : 'Groan…'); }
          else { pop(face, 'jk-nope'); status.textContent = 'You already rated this joke ' + FACE_NAMES[prev] + '. One rating per joke!'; bubble(face, 'Already rated!'); }
        } else {
          all[current.id] = r; SL.store.set('joke-ratings', all);
          syncRating(); pop(face, 'jk-pop'); bubble(face, FACES[r]);
          status.textContent = 'Thanks! You rated this joke ' + FACE_NAMES[r] + '.';
          SL.trackInteract('joke', 'rate:' + r);
          if (r === 5) SL.confettiAt(face, {count:14, shapes:['😂','★','●'], spread:90});
        }
        if (groans >= 5){ groans = 0; meltdown(); }
      });
    });

    /* ---- Egg: meltdown ---- */
    function meltdown(){
      melting = true;
      SL.eggFound('joke-melt');
      SL.trackInteract('joke', 'egg:melt');
      status.textContent = 'Too many groans! The joke widget melted… and bounced right back.';
      if (!SL.motionOK()){ SL.toast('😩 Groan overload! (Widget meltdown skipped — motion is paused.)'); melting = false; return; }
      var r = root.getBoundingClientRect(), p = document.createElement('div');
      p.className = 'jk-puddle'; p.setAttribute('aria-hidden', 'true');
      p.style.left = (r.left + window.scrollX - r.width * .1) + 'px';
      p.style.width = (r.width * 1.2) + 'px';
      p.style.top = (r.bottom + window.scrollY - 30) + 'px';
      document.body.appendChild(p);
      root.classList.add('jk-melting');
      setTimeout(function(){ SL.toast('😩 Groan overload! The joke melted…'); }, 900);
      setTimeout(function(){ root.classList.remove('jk-melting'); p.remove(); melting = false; }, 2750);
    }

    /* ---- Init ---- */
    fit(); syncRating();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    var rt; window.addEventListener('resize', function(){ clearTimeout(rt); rt = setTimeout(fit, 150); });
  });
})();
