/* ============================================================
   Widget: reqfinder (Requirements Finder) — Direction C: quest log / mission select
   Mockup dataset: hand-tagged real Scout Life articles per rank/adventure/requirement.
   (Production: the Requirements taxonomy; dropdowns only list terms with content.)
   ============================================================ */
(function(){
  'use strict';
  // article id → {s: section, t: title, u: url, i: image (optional), e: emoji fallback}
  var ARTS = {"sixess":{"s":"Outdoors","t":"Don’t Forget These Cub Scout Six Essentials on Your Next Outdoor Adventure","u":"https://scoutlife.org/outdoors/161276/dont-forget-these-6-essentials-on-your-next-outdoor-adventure/","i":"assets/img/reqfinder-sixess.jpg"},
    "hikerules":{"s":"Outdoors","t":"5 Important Hiking Rules of the Trail","u":"https://scoutlife.org/outdoors/190405/5-important-hiking-rules-of-the-trail/","i":"assets/img/reqfinder-hikerules.jpg"},
    "bugs":{"s":"Outdoors","t":"Don’t Bug Me! How to Be Prepared for Biting and Stinging Insects","u":"https://scoutlife.org/outdoors/184484/dont-bug-me-how-to-be-prepared-for-biting-and-stinging-insects/","i":"assets/img/reqfinder-bugs.jpg"},
    "pwdfast":{"s":"Pinewood Derby","t":"How to Make a Fast Pinewood Derby Car","u":"https://scoutlife.org/hobbies-projects/projects/2952/fast-pinewood-derby-car/","i":"assets/img/reqfinder-pwdfast.jpg"},
    "pwdrules":{"s":"Pinewood Derby","t":"What Are the Official Cub Scout Pinewood Derby Rules?","u":"https://scoutlife.org/hobbies-projects/pinewood-derby/157283/official-rules/","i":"assets/img/reqfinder-pwdrules.jpg"},
    "pwdtemplates":{"s":"Pinewood Derby","t":"Download Free Pinewood Derby Car Design Templates","u":"https://scoutlife.org/hobbies-projects/pinewood-derby/151097/download-a-pinewood-derby-car-design-template/","i":"assets/img/reqfinder-pwdtemplates.jpg"},
    "pwdscience":{"s":"Pinewood Derby","t":"Use Science to Build the Fastest Pinewood Derby Car","u":"https://scoutlife.org/hobbies-projects/projects/138909/use-science-to-make-a-fast-pinewood-derby-car/","i":"assets/img/reqfinder-pwdscience.jpg"},
    "stretch":{"s":"Fitness","t":"How to Stretch Correctly","u":"https://scoutlife.org/fitness-first/slgym/187068/how-to-stretch-correctly/","i":"assets/img/reqfinder-stretch.jpg"},
    "pushups":{"s":"Fitness","t":"How to Do Pushups Correctly","u":"https://scoutlife.org/video-audio/27280/how-to-do-pushups-correctly/","i":"assets/img/reqfinder-pushups.jpg"},
    "captureflag":{"s":"Fun Stuff","t":"How to Play Capture the Flag","u":"https://scoutlife.org/hobbies-projects/funstuff/160235/how-to-play-capture-the-flag/","i":"assets/img/reqfinder-captureflag.jpg"},
    "herb":{"s":"Projects","t":"How to Make a Water Bottle Herb Garden","u":"https://scoutlife.org/hobbies-projects/projects/191913/how-to-make-a-water-bottle-herb-garden/","i":"assets/img/reqfinder-herb.jpg"},
    "monarch":{"s":"Projects","t":"How to Make a Monarch Butterfly Habitat","u":"https://scoutlife.org/hobbies-projects/funstuff/168358/monarch-butterfly-habitat/","i":"assets/img/reqfinder-monarch.jpg"},
    "beehotel":{"s":"Projects","t":"How to Use a Can to Make a Bee Hotel for Solitary Bees","u":"https://scoutlife.org/hobbies-projects/projects/181990/bee-hotel-for-solitary-bees/","i":"assets/img/reqfinder-beehotel.jpg"},
    "foil":{"s":"Outdoors","t":"How to Cook a Tasty Foil Dinner In the Campfire","u":"https://scoutlife.org/outdoors/182850/how-to-cook-a-tasty-foil-dinner-in-the-campfire/","i":"assets/img/reqfinder-foil.jpg"},
    "dutch":{"s":"Outdoors","t":"17 Tasty Dutch Oven Recipes","u":"https://scoutlife.org/outdoors/outdoorarticles/54956/17-tasty-dutch-oven-recipes/","i":"assets/img/reqfinder-dutch.jpg"},
    "cardtrick":{"s":"Fun Stuff","t":"How to Do the 4 Thieves Card Trick","u":"https://scoutlife.org/hobbies-projects/funstuff/157224/how-to-do-the-4-thieves-card-trick/","i":"assets/img/reqfinder-cardtrick.jpg"},
    "pencil":{"s":"Fun Stuff","t":"How to Do the Magnetic Pencil Magic Trick","u":"https://scoutlife.org/hobbies-projects/funstuff/184533/how-to-do-the-magnetic-pencil-magic-trick/","i":"assets/img/reqfinder-pencil.jpg"},
    "invink":{"s":"Fun Stuff","t":"How to Make Invisible Ink for Writing Top-Secret Messages","u":"https://scoutlife.org/hobbies-projects/funstuff/162663/how-to-make-invisible-ink-for-writing-top-secret-messages/","i":"assets/img/reqfinder-invink.jpg"},
    "morse":{"s":"Fun Stuff","t":"Learn Morse Code With This Morse Translator and Decoder","u":"https://scoutlife.org/hobbies-projects/funstuff/575/morse-code-translator/","i":"assets/img/reqfinder-morse.jpg"},
    "ssc":{"s":"Scouting Around","t":"Get to Know the Signs, Signals and Codes Merit Badge","u":"https://scoutlife.org/about-scouts/scouting-around/140258/get-to-know-the-signs-signals-and-codes-merit-badge/","i":"assets/img/reqfinder-ssc.jpg"},
    "mapcompass":{"s":"Outdoors","t":"How to Use a Compass to Orient a Map and Find Your Way","u":"https://scoutlife.org/outdoors/179442/how-to-use-a-compass-to-orient-a-map-and-find-your-way/","i":"assets/img/reqfinder-mapcompass.jpg"},
    "compassgame":{"s":"Scouting Around","t":"Use the Compass Game to Improve Your Navigation Skills","u":"https://scoutlife.org/about-scouts/scouting-around/191944/use-the-compass-game-to-improve-your-navigation-skills/","i":"assets/img/reqfinder-compassgame.jpg"},
    "declination":{"s":"Scout Essentials","t":"Understanding Declination: Why Your Compass Doesn’t Actually Point North","u":"https://scoutlife.org/outdoors/scout-essentials/187033/understanding-declination-why-your-compass-doesnt-actually-point-north/","i":"assets/img/reqfinder-declination.jpg"},
    "orient9":{"s":"Features","t":"9 Things to Know About Orienteering","u":"https://scoutlife.org/features/163874/9-things-to-know-about-orienteering/","i":"assets/img/reqfinder-orient9.jpg"},
    "steps":{"s":"Outdoors","t":"How to Measure Distance By Counting Your Steps","u":"https://scoutlife.org/outdoors/outdoorarticles/165500/how-to-measure-distance-by-counting-your-steps/","i":"assets/img/reqfinder-steps.jpg"},
    "mapdist":{"s":"Outdoors","t":"How to Determine Distance On a Map","u":"https://scoutlife.org/outdoors/165771/how-to-determine-distance-on-a-map/","i":"assets/img/reqfinder-mapdist.jpg"},
    "fishknots":{"s":"Fishing","t":"8 Fishing Knots to Know","u":"https://fishing.scoutlife.org/8-fishing-knots-to-know/","i":"assets/img/reqfinder-fishknots.jpg"},
    "startfish":{"s":"Fishing","t":"10 Steps to Start Fishing","u":"https://scoutlife.org/outdoors/outdoorarticles/1802/10-steps-to-start-fishing/","i":"assets/img/reqfinder-startfish.jpg"},
    "namefish":{"s":"Fishing","t":"Name That Fish Quiz","u":"https://fishing.scoutlife.org/name-that-fish-quiz/","e":"🐟"},
    "scoutlaw":{"s":"Scouts","t":"5 Easy Ways to Memorize the Scout Law","u":"https://scoutlife.org/about-scouts/182075/memorize-the-scout-law/","i":"assets/img/reqfinder-scoutlaw.jpg"},
    "scoutoath":{"s":"Scouts","t":"Useful Tools to Help You Memorize the Scout Oath","u":"https://scoutlife.org/about-scouts/182406/memorize-the-scout-oath/","i":"assets/img/reqfinder-scoutoath.jpg"},
    "scoutsign":{"s":"Scouting Around","t":"Signs Up! How To Make the Scout Sign","u":"https://scoutlife.org/about-scouts/scouting-around/179447/signs-up-how-to-make-the-scout-sign/","i":"assets/img/reqfinder-scoutsign.jpg"},
    "emojilaw":{"s":"Fun Stuff","t":"The Emoji Scout Law","u":"https://scoutlife.org/the-emoji-scout-law/","i":"assets/img/reqfinder-emojilaw.jpg"},
    "rankscout":{"s":"Scouting Around","t":"What You Need to Know About the Rank of Scout","u":"https://scoutlife.org/about-scouts/scouting-around/169628/what-you-need-to-know-about-the-rank-of-scout/","i":"assets/img/reqfinder-rankscout.jpg"},
    "squareknot":{"s":"Outdoors","t":"How to Tie a Square Knot","u":"https://scoutlife.org/outdoors/outdoorarticles/147528/how-to-tie-a-square-knot/","i":"assets/img/reqfinder-squareknot.jpg"},
    "knots7":{"s":"Outdoors","t":"How to Tie the 7 Basic Scout Knots","u":"https://scoutlife.org/outdoors/176401/how-to-tie-the-7-basic-scout-knots/","i":"assets/img/reqfinder-knots7.jpg"},
    "whip":{"s":"Outdoors","t":"How to Whip and Fuse the Ends of Rope","u":"https://scoutlife.org/outdoors/164973/how-to-whip-and-fuse-the-ends-of-rope/","i":"assets/img/reqfinder-whip.jpg"},
    "campchair":{"s":"Fun Stuff","t":"How to Use Lashings to Build a Comfortable Camp Chair","u":"https://scoutlife.org/hobbies-projects/funstuff/3421/build-a-camp-chair/","i":"assets/img/reqfinder-campchair.jpg"},
    "tripod":{"s":"Fun Stuff","t":"How to Build a Cooking Tripod","u":"https://scoutlife.org/hobbies-projects/funstuff/169717/how-to-build-a-cooking-tripod/","i":"assets/img/reqfinder-tripod.jpg"},
    "dryrack":{"s":"Fun Stuff","t":"How to Lash Together Your Own Clothes Drying Rack","u":"https://scoutlife.org/hobbies-projects/funstuff/159130/how-to-lash-together-your-own-clothes-drying-rack/","i":"assets/img/reqfinder-dryrack.jpg"},
    "diningfly":{"s":"Scout Essentials","t":"How to Set Up a Dining Fly","u":"https://scoutlife.org/outdoors/scout-essentials/183446/how-to-set-up-a-dining-fly/","i":"assets/img/reqfinder-diningfly.jpg"},
    "shock":{"s":"Scout Essentials","t":"How to Treat a Victim for Shock","u":"https://scoutlife.org/outdoors/scout-essentials/190399/how-to-treat-a-victim-for-shock/","i":"assets/img/reqfinder-shock.jpg"},
    "fakit":{"s":"Ask the Gear Guy","t":"What Should Be in My First-Aid Kit?","u":"https://scoutlife.org/outdoors/ask-the-gear-guy/185171/what-should-be-in-my-first-aid-kit/","i":"assets/img/reqfinder-fakit.jpg"},
    "famyths":{"s":"Outdoors","t":"4 Debunked First-Aid Myths That People Still Believe","u":"https://scoutlife.org/outdoors/183129/4-debunked-first-aid-myths-that-people-still-believe/","i":"assets/img/reqfinder-famyths.jpg"},
    "emergency":{"s":"Outdoors","t":"Create an Emergency Pack or Kit","u":"https://scoutlife.org/outdoors/outdoorarticles/16727/create-an-emergency-pack-or-kit/","i":"assets/img/reqfinder-emergency.jpg"},
    "survival":{"s":"Projects","t":"How to Make a DIY Survival Kit","u":"https://scoutlife.org/hobbies-projects/projects/180051/how-to-make-a-diy-survival-kit/","i":"assets/img/reqfinder-survival.jpg"},
    "snowcave":{"s":"Outdoors","t":"How to Build a Snow Cave","u":"https://scoutlife.org/outdoors/150860/how-to-build-a-snow-cave/","i":"assets/img/reqfinder-snowcave.jpg"},
    "water":{"s":"Gear Guides","t":"How to Treat Your Water to Stay Healthy in the Backcountry","u":"https://scoutlife.org/outdoors/13460/water-treatment-buying-guide/","i":"assets/img/reqfinder-water.jpg"},
    "campfire":{"s":"Outdoors","t":"How to Prevent Fire Damage When Building a Campfire","u":"https://scoutlife.org/outdoors/outdoorarticles/134478/how-to-build-a-campfire-safely-and-responsibly/","i":"assets/img/reqfinder-campfire.jpg"},
    "ax":{"s":"Outdoors","t":"How to Use an Ax to Chop Wood","u":"https://scoutlife.org/outdoors/157237/how-to-use-an-ax-to-chop-wood/","i":"assets/img/reqfinder-ax.jpg"},
    "swimtest":{"s":"Scouts","t":"Scouting America Swim Test Requirements","u":"https://scoutlife.org/about-scouts/182274/scouting-america-swim-test-requirements/","i":"assets/img/reqfinder-swimtest.jpg"},
    "lifejacket":{"s":"Outdoors","t":"How to Safely Wear and Use a Life Jacket","u":"https://scoutlife.org/outdoors/176752/how-to-safely-use-a-life-jacket/","i":"assets/img/reqfinder-lifejacket.jpg"},
    "ripcurrent":{"s":"Features","t":"How to Escape From a Rip Current","u":"https://scoutlife.org/features/170133/how-to-escape-from-a-rip-current/","i":"assets/img/reqfinder-ripcurrent.jpg"},
    "multisa":{"s":"Scouting Around","t":"Scouts Go the Extra Mile With the Multisport Merit Badge","u":"https://scoutlife.org/about-scouts/scouting-around/192163/scouts-go-the-extra-mile-with-the-multisport-merit-badge/","i":"assets/img/reqfinder-multisa.jpg"},
    "multiquiz":{"s":"Quizzes","t":"How Much Do You Know About the Multisport Merit Badge?","u":"https://scoutlife.org/quizzes/191897/how-much-do-you-know-about-the-multisport-merit-badge/","i":"assets/img/reqfinder-multiquiz.jpg"},
    "bikepack":{"s":"Outdoors","t":"Get Your Bicycle Ready and Grab This Gear to Go Bikepacking","u":"https://scoutlife.org/outdoors/178453/get-your-bicycle-ready-and-grab-this-gear-to-go-bikepacking/","i":"assets/img/reqfinder-bikepack.jpg"},
    "helmet":{"s":"Gear Guides","t":"How to Buy a Safe and Comfortable Helmet","u":"https://scoutlife.org/outdoors/3916/helmet-buying-guide/","i":"assets/img/reqfinder-helmet.jpg"},
    "spacequiz":{"s":"Quizzes","t":"Take the ‘Scouting in Space!’ Trivia Quiz","u":"https://scoutlife.org/quizzes/190200/take-the-scouting-in-space-trivia-quiz/","i":"assets/img/reqfinder-spacequiz.jpg"},
    "spacecamp":{"s":"Scouting Around","t":"Space Camp Takes Scouts to the Final Frontier","u":"https://scoutlife.org/about-scouts/scouting-around/158414/space-camp-takes-scouts-to-the-final-frontier/","i":"assets/img/reqfinder-spacecamp.jpg"},
    "nightsky":{"s":"Outdoors","t":"9 Things to Know About the Night Sky","u":"https://scoutlife.org/outdoors/outdoorarticles/170313/9-things-to-know-about-the-night-sky/","i":"assets/img/reqfinder-nightsky.jpg"},
    "constellation":{"s":"Quizzes","t":"Can You Name That Constellation?","u":"https://scoutlife.org/quizzes/177450/can-you-name-that-constellation/","i":"assets/img/reqfinder-constellation.jpg"},
    "flagceremony":{"s":"Scout Essentials","t":"How to Conduct a Flag Ceremony","u":"https://scoutlife.org/outdoors/scout-essentials/185223/how-to-conduct-a-flag-ceremony/","i":"assets/img/reqfinder-flagceremony.jpg"},
    "flagfold":{"s":"Video","t":"How to Display and Fold the American Flag","u":"https://scoutlife.org/video-audio/145871/how-to-display-and-fold-the-american-flag/","i":"assets/img/reqfinder-flagfold.jpg"},
    "citizen":{"s":"Features","t":"How to Be a Good Citizen Even if You Can’t Vote","u":"https://scoutlife.org/features/181961/how-to-be-a-good-citizen-even-if-you-cant-vote/","i":"assets/img/reqfinder-citizen.jpg"},
    "denchief":{"s":"Features","t":"Den Chiefs Are a Valuable Part of the Pack","u":"https://scoutlife.org/features/184820/den-chief/","i":"assets/img/reqfinder-denchief.jpg"},
    "fundraise":{"s":"Scouting Around","t":"Four Creative Fundraising Ideas for Scout Troops","u":"https://scoutlife.org/about-scouts/scouting-around/191970/creative-fundraisers/","i":"assets/img/reqfinder-fundraise.jpg"},
    "recovery":{"s":"Scouting Around","t":"Scouts Help Their Communities After Devastating Disasters","u":"https://scoutlife.org/about-scouts/scouting-around/186737/scouts-help-their-communities-after-devastating-disasters/","i":"assets/img/reqfinder-recovery.jpg"},
    "cleanwater":{"s":"Scouting Around","t":"Scouting for Clean Waterways Is a Nationwide Effort to Keep Our Water Clean","u":"https://scoutlife.org/about-scouts/scouting-around/183710/scouting-for-clean-waterways-is-a-nationwide-effort-to-keep-our-water-clean/","i":"assets/img/reqfinder-cleanwater.jpg"},
    "eaglecars":{"s":"Features","t":"Cool Jobs: These Eagle Scouts Are Helping Revolutionize the Car Industry","u":"https://scoutlife.org/features/180128/cool-jobs-these-eagle-scouts-are-helping-revolutionize-the-car-industry/","i":"assets/img/reqfinder-eaglecars.jpg"},
    "eagleprojects":{"s":"Eagle Projects","t":"Browse Awesome Eagle Scout Service Projects","u":"https://eagleprojects.scoutlife.org/","e":"🦅"},
    "knifequiz":{"s":"Quizzes","t":"Knife Safety Quiz","u":"https://scoutlife.org/quizzes/151313/knife-safety-quiz/","i":"assets/img/reqfinder-knifequiz.jpg"},
    "pocketknife":{"s":"Gear Guides","t":"How to Buy a Good Pocketknife or Multitool","u":"https://scoutlife.org/outdoors/4126/pocketknife-and-multitool-buying-guide/","i":"assets/img/reqfinder-pocketknife.jpg"},
    "sharpen":{"s":"Ask the Gear Guy","t":"How to Sharpen a Pocketknife","u":"https://scoutlife.org/outdoors/ask-the-gear-guy/179707/how-to-sharpen-a-pocketknife-2/","i":"assets/img/reqfinder-sharpen.jpg"},
    "soapcarve":{"s":"Projects","t":"How to Make a Soap Carving","u":"https://scoutlife.org/hobbies-projects/projects/171279/how-to-make-a-soap-carving/","i":"assets/img/reqfinder-soapcarve.jpg"},
    "slides":{"s":"Fun Stuff","t":"Get Inspired by These Hand-Carved Wooden Neckerchief Slides","u":"https://scoutlife.org/hobbies-projects/funstuff/187806/get-inspired-by-these-hand-carved-wooden-neckerchief-slides/","i":"assets/img/reqfinder-slides.jpg"},
    "critters":{"s":"Animals & Nature","t":"Creepy But Cool: These 5 Critters Are More Helpful Than Scary","u":"https://scoutlife.org/outdoors/animals-and-nature/192183/creepy-but-cool-these-5-critters-are-more-helpful-than-scary/","i":"assets/img/reqfinder-critters.jpg"},
    "garter":{"s":"Animals & Nature","t":"Garter Snakes Are Reptiles With a Smile","u":"https://scoutlife.org/outdoors/animals-and-nature/186648/garter-snakes-are-reptiles-with-a-smile/","i":"assets/img/reqfinder-garter.jpg"},
    "snakesquiz":{"s":"Quizzes","t":"Can You Name These Snakes?","u":"https://scoutlife.org/quizzes/186804/can-you-name-these-snakes/","i":"assets/img/reqfinder-snakesquiz.jpg"},
    "cicadas":{"s":"Animals & Nature","t":"Cicadas: Making Summer Magical","u":"https://scoutlife.org/outdoors/animals-and-nature/181932/cicadas-making-summer-magical/","i":"assets/img/reqfinder-cicadas.jpg"},
    "woodpecker":{"s":"Animals & Nature","t":"Woodpeckers Are Nature’s Drummers","u":"https://scoutlife.org/outdoors/animals-and-nature/187963/woodpeckers-are-natures-drummers/","i":"assets/img/reqfinder-woodpecker.jpg"},
    "ethics":{"s":"Outdoors","t":"9 Things to Know About Outdoor Ethics","u":"https://scoutlife.org/outdoors/outdoorarticles/168377/9-things-to-know-about-outdoor-ethics/","i":"assets/img/reqfinder-ethics.jpg"},
    "ess10":{"s":"Outdoors","t":"Every Packing List Starts With the 10 Scout Basic Outdoor Essentials","u":"https://scoutlife.org/outdoors/outdoorarticles/6976/scout-outdoor-essentials-checklist/","i":"assets/img/reqfinder-ess10.jpg"},
    "firstcamp":{"s":"Ask the Gear Guy","t":"What To Pack for Your First Summer Camp","u":"https://scoutlife.org/outdoors/ask-the-gear-guy/185179/what-to-pack-for-your-first-summer-camp/","i":"assets/img/reqfinder-firstcamp.jpg"},
    "nervous":{"s":"Ask the Gear Guy","t":"How to Overcome Nervousness About First Campout","u":"https://scoutlife.org/outdoors/ask-the-gear-guy/181430/how-to-overcome-nervousness-about-first-campout/","i":"assets/img/reqfinder-nervous.jpg"},
    "messkit":{"s":"Ask the Gear Guy","t":"Picking a Good Mess Kit for Camping","u":"https://scoutlife.org/outdoors/ask-the-gear-guy/187710/picking-a-good-mess-kit-for-camping/","i":"assets/img/reqfinder-messkit.jpg"},
    "bpfood":{"s":"Ask the Gear Guy","t":"How to Pick the Best Backpacking Food","u":"https://scoutlife.org/outdoors/ask-the-gear-guy/191443/how-to-pick-the-best-backpacking-food/","i":"assets/img/reqfinder-bpfood.jpg"},
    "spatula":{"s":"Scouting Around","t":"Patrols Vie for the Golden Spatula in Outdoor Cooking Competition","u":"https://scoutlife.org/about-scouts/scouting-around/183110/patrols-vie-for-the-golden-spatula-in-outdoor-cooking-competition/","i":"assets/img/reqfinder-spatula.jpg"},
    "derbyjokes":{"s":"Pinewood Derby","t":"25 Funny Pinewood Derby Jokes","u":"https://scoutlife.org/hobbies-projects/pinewood-derby/157334/25-funny-pinewood-derby-jokes/","i":"assets/img/reqfinder-derbyjokes.jpg"},
    "hallojokes":{"s":"Features","t":"101 Funny Halloween Jokes and Comics","u":"https://scoutlife.org/features/23079/funny-halloween-jokes/","i":"assets/img/reqfinder-hallojokes.jpg"},
    "caption":{"s":"Games","t":"Write a Funny Caption for This Photo","u":"https://scoutlife.org/games/write-a-funny-caption/192217/write-a-funny-caption-for-this-photo-175/","i":"assets/img/reqfinder-caption.jpg"}};
  // programs → ranks → items {n: name, q: search query, a: [article ids]}
  var PROGS = [
    {"id":"cub","name":"Cub Scouts","step3":"Adventure","ranks":[
    {"id":"lion","name":"Lion","e":"🦁","items":[{"n":"Mountain Lion (outdoor essentials)","q":"cub scout six essentials","a":["sixess","hikerules","bugs"]},{"n":"Fun on the Run (get moving)","q":"fitness","a":["stretch","pushups","captureflag"]},{"n":"Ready, Set, Grow (gardening)","q":"garden","a":["herb","monarch","beehotel"]},{"n":"Race Time (Pinewood Derby)","q":"pinewood derby","a":["pwdfast","pwdrules","pwdtemplates","pwdscience"]}]},
    {"id":"tiger","name":"Tiger","e":"🐯","items":[{"n":"Tigers in the Wild (hiking)","q":"hiking","a":["hikerules","sixess","critters","cicadas"]},{"n":"Curiosity, Intrigue & Magical Mysteries","q":"magic trick","a":["cardtrick","pencil","invink","morse"]},{"n":"Tiger Bites (healthy snacks)","q":"healthy snacks","a":[]},{"n":"Race Time (Pinewood Derby)","q":"pinewood derby","a":["pwdfast","pwdrules","pwdtemplates","pwdscience"]}]},
    {"id":"wolf","name":"Wolf","e":"🐺","items":[{"n":"Paws on the Path (hiking)","q":"hiking","a":["hikerules","sixess","bugs","ethics"]},{"n":"Code of the Wolf (codes & secret messages)","q":"secret codes","a":["morse","invink","ssc"]},{"n":"Finding Your Way (maps & compass)","q":"compass","a":["mapcompass","compassgame","mapdist","steps"]},{"n":"Spirit of the Water (water safety)","q":"water safety","a":["lifejacket","ripcurrent","swimtest"]},{"n":"A Wolf Goes Fishing","q":"fishing","a":["startfish","fishknots","namefish"]}]},
    {"id":"bear","name":"Bear","e":"🐻","items":[{"n":"Bear Necessities (camping)","q":"camping","a":["firstcamp","nervous","foil","diningfly"]},{"n":"Whittling (pocketknife safety)","q":"whittling","a":["knifequiz","soapcarve","pocketknife","slides"]},{"n":"Bear Habitat (nature)","q":"animals and nature","a":["critters","garter","woodpecker","beehotel"]},{"n":"Roaring Laughter (jokes!)","q":"jokes","a":["derbyjokes","hallojokes","caption"]},{"n":"Pedal Power (bikes)","q":"bike","a":["helmet","bikepack"]}]},
    {"id":"webelos","name":"Webelos","e":"","items":[{"n":"Webelos Walkabout (hiking)","q":"hiking","a":["hikerules","sixess","mapcompass","water"]},{"n":"Catch the Big One (fishing)","q":"fishing","a":["startfish","fishknots","namefish"]},{"n":"Aquanaut (swimming)","q":"swimming","a":["swimtest","lifejacket","ripcurrent"]},{"n":"Into the Wild (nature)","q":"animals and nature","a":["critters","cicadas","woodpecker","garter"]},{"n":"Art Explosion","q":"art projects","a":[]}]},
    {"id":"aol","name":"Arrow of Light","e":"","items":[{"n":"Outdoor Adventurer (camping)","q":"camping","a":["firstcamp","foil","diningfly","nervous"]},{"n":"Personal Fitness","q":"fitness","a":["stretch","pushups"]},{"n":"Knife Safety","q":"pocketknife","a":["knifequiz","sharpen","pocketknife"]},{"n":"Fishing","q":"fishing","a":["startfish","fishknots"]}]}]},
    {"id":"bsa","name":"Scouts BSA","step3":"Requirement","ranks":[
    {"id":"scout","name":"Scout","e":"","items":[{"n":"Scout Oath & Law (req. 1)","q":"scout law","a":["scoutlaw","scoutoath","emojilaw"]},{"n":"Scout sign, salute & handshake (req. 1)","q":"scout sign","a":["scoutsign","rankscout"]},{"n":"Square knot & whipping rope (req. 4)","q":"square knot","a":["squareknot","whip","knots7"]},{"n":"Pocketknife safety (req. 5)","q":"pocketknife safety","a":["knifequiz","pocketknife","sharpen"]}]},
    {"id":"tenderfoot","name":"Tenderfoot","e":"","items":[{"n":"Camping gear & setup (req. 1)","q":"camping gear","a":["ess10","firstcamp","diningfly"]},{"n":"Camp cooking (req. 2)","q":"camp cooking","a":["foil","messkit","dutch"]},{"n":"Two half-hitches & taut-line hitch (req. 3)","q":"knots","a":["knots7","diningfly","whip"]},{"n":"First aid & bug bites (req. 4)","q":"first aid","a":["bugs","shock","famyths","fakit"]},{"n":"Fitness (req. 6)","q":"fitness","a":["pushups","stretch"]},{"n":"Flag & citizenship (req. 7)","q":"flag","a":["flagfold","flagceremony"]}]},
    {"id":"second","name":"Second Class","e":"","items":[{"n":"Campfire safety & fire building (req. 2)","q":"campfire","a":["campfire","ax"]},{"n":"Map & compass (req. 3)","q":"map and compass","a":["mapcompass","mapdist","steps","declination"]},{"n":"Wildlife ID (req. 4)","q":"animals and nature","a":["critters","garter","woodpecker","cicadas"]},{"n":"Swimming & water safety (req. 5)","q":"swimming","a":["swimtest","lifejacket","ripcurrent"]},{"n":"First aid (req. 6)","q":"first aid","a":["shock","fakit","famyths"]}]},
    {"id":"first","name":"First Class","e":"","items":[{"n":"Cooking a patrol meal (req. 2)","q":"camp cooking","a":["foil","dutch","spatula","bpfood"]},{"n":"Lashings & pioneering (req. 3)","q":"lashing","a":["campchair","tripod","dryrack"]},{"n":"Orienteering & navigation (req. 4)","q":"orienteering","a":["compassgame","mapcompass","orient9","declination","steps"]},{"n":"Native plants & animals (req. 5)","q":"animals and nature","a":["critters","garter","woodpecker","cicadas"]},{"n":"First aid & emergency kit (req. 7)","q":"first aid kit","a":["emergency","fakit","shock"]}]},
    {"id":"star","name":"Star","e":"","items":[{"n":"Service hours (req. 4)","q":"service project","a":["recovery","cleanwater","fundraise"]},{"n":"Position of responsibility (req. 5)","q":"den chief","a":["denchief"]}]},
    {"id":"life","name":"Life","e":"","items":[{"n":"Service project (req. 4)","q":"service project","a":["recovery","cleanwater"]},{"n":"Teach a younger Scout (req. 6)","q":"teach scout skills","a":["denchief","knots7"]}]},
    {"id":"eagle","name":"Eagle","e":"","items":[{"n":"Eagle Scout service project (req. 5)","q":"eagle project","a":["eagleprojects","recovery","cleanwater","fundraise"]},{"n":"Eagle Scouts in action","q":"eagle scout","a":["eaglecars"]},{"n":"Board of review (req. 7)","q":"eagle board of review","a":[]}]},
    {"id":"mb","name":"Merit Badges","e":"","items":[{"n":"Astronomy","q":"astronomy","a":["nightsky","constellation"]},{"n":"Citizenship in the Nation","q":"citizenship","a":["citizen","flagfold"]},{"n":"Cooking","q":"camp cooking","a":["foil","dutch","spatula","bpfood"]},{"n":"First Aid","q":"first aid","a":["fakit","shock","famyths","emergency"]},{"n":"Fishing","q":"fishing","a":["fishknots","startfish","namefish"]},{"n":"Multisport","q":"multisport","a":["multisa","multiquiz","bikepack","swimtest"]},{"n":"Orienteering","q":"orienteering","a":["compassgame","orient9","mapcompass","declination"]},{"n":"Pioneering","q":"pioneering","a":["campchair","tripod","dryrack","knots7"]},{"n":"Reptile & Amphibian Study","q":"snakes","a":["garter","snakesquiz"]},{"n":"Signs, Signals & Codes","q":"morse code","a":["ssc","morse","invink"]},{"n":"Space Exploration","q":"space exploration","a":["spacequiz","spacecamp"]},{"n":"Wilderness Survival","q":"wilderness survival","a":["survival","snowcave","water","emergency"]}]}]}];


  SL.widget('reqfinder', function(root){
    var form = SL.$('.rf-form', root), radios = SL.$$('input[name="program"]', root),
        rankSel = SL.$('#rf-rank', root), reqSel = SL.$('#rf-req', root), l3 = SL.$('.rf-l3', root),
        s1 = SL.$('.rf-s1', root), s2 = SL.$('.rf-s2', root), s3 = SL.$('.rf-s3', root),
        board = SL.$('.rf-board', root), status = SL.$('.rf-status', root),
        trail = SL.$('.rf-trail', root), qn = SL.$('.rf-qn', root), emptyHTML = board.innerHTML;
    var prog = null, rank = null;

    function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
    function findProg(id){ return PROGS.filter(function(p){ return p.id === id; })[0]; }
    function findRank(id){ return prog && prog.ranks.filter(function(r){ return r.id === id; })[0]; }

    function setStep(n){            // n = number of completed steps (0–3)
      [s1, s2, s3].forEach(function(s, i){ s.classList.toggle('is-done', i < n); s.classList.toggle('is-on', i === n); });
      trail.style.setProperty('--pn', String(n / 3));
      trail.classList.toggle('is-there', n === 3);
      if (qn) qn.textContent = n + '/3';
    }
    function empty(msg){
      board.innerHTML = emptyHTML;
      board.classList.remove('has-results', 'is-fall');
      if (msg) SL.$('.rf-empty-msg', board).textContent = msg;
    }
    function opt(value, text){ var o = document.createElement('option'); o.value = value; o.textContent = text; return o; }

    /* ---- Step 1: program toggles ---- */
    function chooseProgram(id){
      prog = findProg(id); rank = null;
      rankSel.innerHTML = ''; rankSel.appendChild(opt('', 'Choose a rank…'));
      prog.ranks.forEach(function(r){ rankSel.appendChild(opt(r.id, (r.e ? r.e + ' ' : '') + r.name)); });
      rankSel.disabled = false;
      reqSel.innerHTML = ''; reqSel.appendChild(opt('', 'Pick a rank first')); reqSel.disabled = true;
      l3.textContent = prog.step3;
      setStep(1);
      empty('Nice! Now pick your rank.');
      SL.trackInteract('reqfinder', 'program:' + id);
    }

    /* ---- Step 2: rank ---- */
    function chooseRank(id){
      rank = findRank(id);
      reqSel.innerHTML = '';
      if (!rank){ reqSel.appendChild(opt('', 'Pick a rank first')); reqSel.disabled = true; setStep(1); empty('Nice! Now pick your rank.'); return; }
      reqSel.appendChild(opt('', rank.id === 'mb' ? 'Choose a merit badge…' : 'Choose one…'));
      rank.items.forEach(function(it, i){ reqSel.appendChild(opt(String(i), it.n)); });
      reqSel.disabled = false;
      l3.textContent = rank.id === 'mb' ? 'Merit badge' : prog.step3;
      setStep(2);
      empty('Almost there! Pick ' + (rank.id === 'mb' ? 'a merit badge' : (prog.id === 'cub' ? 'an adventure' : 'a requirement')) + '.');
      SL.trackInteract('reqfinder', 'rank:' + id);
    }

    /* ---- Step 3: results ---- */
    function related(item, exclude, n){
      var out = [];
      rank.items.forEach(function(it){ if (it !== item) it.a.forEach(function(id){ if (out.indexOf(id) < 0 && exclude.indexOf(id) < 0) out.push(id); }); });
      return out.slice(0, n);
    }
    function cardHTML(id, i, rel){
      var a = ARTS[id]; if (!a) return '';
      var img = a.i ? '<img src="' + a.i + '" alt="" width="320" height="200" loading="lazy">' : '<span class="rf-emo" aria-hidden="true">' + (a.e || '📘') + '</span>';
      return '<a class="rf-card' + (rel ? ' is-rel' : '') + '" href="' + a.u + '" style="--d:' + (i * 110) + 'ms">' +
               '<span class="rf-img">' + img + '<span class="rf-sec">' + esc(rel ? 'Related' : a.s) + '</span></span>' +
               '<span class="rf-spark" aria-hidden="true"></span>' +
               '<span class="rf-t">' + esc(a.t) + '</span></a>';
    }
    function showResults(idx){
      var item = rank && rank.items[+idx];
      if (!item){ setStep(2); empty(); return; }
      setStep(3);
      var main = item.a.filter(function(id){ return ARTS[id]; }).slice(0, 5);
      var all = 'https://scoutlife.org/?s=' + encodeURIComponent(item.q);
      var where = esc(rank.name) + ' · ' + esc(item.n);
      var motion = SL.motionOK(), html;
      if (main.length){
        var extra = main.length < 3 ? related(item, main, 3 - main.length) : [];
        html = '<div class="rf-head"><p class="rf-htxt"><b>' + main.length + (main.length === 1 ? ' find' : ' finds') + ' unlocked</b> ' + where + '</p>' +
               '<a class="rf-all" href="' + all + '">See all ▶</a></div>' +
               '<div class="rf-cards">' + main.map(function(id, i){ return cardHTML(id, i, false); }).join('') +
               extra.map(function(id, i){ return cardHTML(id, main.length + i, true); }).join('') + '</div>';
        board.className = 'rf-board has-results';
        status.textContent = 'Found ' + main.length + ' Scout Life ' + (main.length === 1 ? 'article' : 'articles') + ' for ' + rank.name + ': ' + item.n + '.';
      } else {
        var rel = related(item, [], 3);
        html = '<div class="rf-head"><p class="rf-htxt"><b>Hmm…</b> nothing pinned for ' + where + ' yet</p>' +
               '<a class="rf-all" href="' + all + '">Search the site ▶</a></div>' +
               '<div class="rf-fallrow"><div class="rf-oops"><img class="rf-scout" src="assets/mascot/scout-head.png" alt="Scout the Maileagle" width="375" height="349">' +
               '<p class="rf-bubble"><span class="rf-npc" aria-hidden="true">Hint</span>We’re still adding stuff for this one! Try these:</p></div>' +
               '<div class="rf-cards">' + rel.map(function(id, i){ return cardHTML(id, i, true); }).join('') + '</div></div>';
        board.className = 'rf-board has-results is-fall';
        status.textContent = 'No articles for ' + rank.name + ': ' + item.n + ' yet. We’re still adding stuff for this one! Showing ' + rel.length + ' related articles.';
      }
      board.innerHTML = html;
      if (motion) SL.$$('.rf-card', board).forEach(function(c){ c.classList.add('unlock'); });
      SL.trackInteract('reqfinder', 'search:' + rank.id + '/' + idx);
    }

    /* ---- Wire up (JS mode replaces the no-JS option lists) ---- */
    root.classList.add('rf-js');
    rankSel.innerHTML = ''; rankSel.appendChild(opt('', 'Choose a rank…')); rankSel.disabled = true;
    reqSel.innerHTML = ''; reqSel.appendChild(opt('', 'Pick a rank first')); reqSel.disabled = true;
    reqSel.removeAttribute('name');
    radios.forEach(function(r){ r.checked = false; r.addEventListener('change', function(){ if (r.checked) chooseProgram(r.value); }); });
    rankSel.addEventListener('change', function(){ chooseRank(rankSel.value); });
    reqSel.addEventListener('change', function(){ showResults(reqSel.value); });
    form.addEventListener('submit', function(e){ e.preventDefault(); if (reqSel.value !== '') showResults(reqSel.value); });
    setStep(0);
  });
})();
