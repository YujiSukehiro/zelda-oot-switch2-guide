import type { RouteChapter, RouteStep } from '../types/zelda';

export const OPTIMAL_ROUTE_CHAPTERS: RouteChapter[] = [
  {
    id: 'ch-01',
    number: 1,
    title: 'Kokiri Awakening & Inside the Great Deku Tree',
    subtitle: 'Sword, Shield, Fairy Slingshot, First 4 Gold Skulltulas & Queen Gohma',
    era: 'child',
    primaryRegionId: 'kokiri-forest',
    estimatedMinutes: 30,
    summary:
      'Gear up in Kokiri Forest using Switch 2 bonus Rupees and bed-sleeping, clear Inside the Great Deku Tree for the Kokiri\'s Emerald, and receive the Fairy Ocarina from Saria.',
    steps: [
      {
        id: 'ch-01-step-01',
        title: 'Kokiri Sword, 40-Rupee Shield & Deku Sticks',
        regionId: 'kokiri-forest',
        era: 'child',
        kind: 'story',
        instructions:
          'Crawl through the narrow hole along the SW training fence, dodge the rolling boulder, and open the chest for the Kokiri Sword. Collect 40 Rupees across Kokiri Forest (clear rocks for Kokiri kids for Switch 2 bonus Rupees, grab the Blue Rupee behind Mido\'s house, and hop the river stepping stones), buy the Deku Shield at the Kokiri Shop, and harvest Deku Sticks from Deku Babas on the Great Deku Tree path.',
        proTip:
          'Switch 2 starts your Kokiri Wallet capacity at 200 Rupees (doubled from 99 on N64), so never pass up early Blue Rupees!',
        secretIds: ['eq-kokiri-sword', 'eq-deku-shield'],
        requiredIds: [],
        unlocksRequirementIds: [
          'era-child',
          'time-day',
          'rupees-100',
          'kokiri-sword',
          'deku-shield',
          'deku-sticks',
        ],
      },
      {
        id: 'ch-01-step-02',
        title: 'Sleep Until Night & Know-It-All House Skulltula',
        regionId: 'kokiri-forest',
        era: 'child',
        kind: 'switch2',
        instructions:
          'Use Switch 2\'s bed-sleeping mechanic inside Link\'s House to rest until nightfall (and top off hearts). Walk behind the Know-It-All Brothers\' House in SW Kokiri Forest—tucked slightly deeper against the treehouse wall in the remake—and jump-slash Gold Skulltula #1.',
        proTip:
          'In the Switch 2 Remake, nighttime Skulltula spots display a faint golden web shimmer during the day so you can scout them ahead of time.',
        secretIds: ['gs-001'],
        requiredIds: ['era-child', 'kokiri-sword'],
        unlocksRequirementIds: ['time-night'],
      },
      {
        id: 'ch-01-step-03',
        title: 'Great Deku Tree 2F–3F: Fairy Slingshot & Compass Skulltula',
        regionId: 'deku-tree',
        era: 'child',
        kind: 'dungeon',
        instructions:
          'Show your equipped Sword and Shield to Mido to reach the Great Deku Tree. Climb the central trunk vines to 2F and clear the west side room for the Fairy Slingshot, shooting the ladder down to exit. Ascend to the 3F Compass room, open the Compass chest, and climb the left stone blocks to slash Gold Skulltula #57.',
        proTip:
          'Toggle gyro fine-aiming in Switch 2 Settings—over-the-shoulder Slingshot shots make ceiling Skullwalltulas effortless.',
        secretIds: ['eq-slingshot', 'gs-057'],
        requiredIds: ['era-child', 'kokiri-sword', 'deku-shield'],
        unlocksRequirementIds: ['slingshot'],
      },
      {
        id: 'ch-01-step-04',
        title: '3F Web Drop & B1 Basement Skulltulas',
        regionId: 'deku-tree',
        era: 'child',
        kind: 'dungeon',
        instructions:
          'Step off the 3F ledge directly onto the center of the 1F floor web to smash straight into B1. Jump-slash Gold Skulltula #58 on the sewer grate by the water, shoot Gold Skulltula #59 on the climbable vines behind the torch switch with the Slingshot, and carry fire from the lit torch via a Deku Stick across the shallow pool to burn the lower web.',
        proTip:
          'Leave the cracked stone wall behind the B1 3-Scrub room for Chapter 7 once you have both Bombs and the Boomerang.',
        secretIds: ['gs-058', 'gs-059'],
        requiredIds: ['era-child', 'kokiri-sword', 'slingshot', 'deku-sticks'],
      },
      {
        id: 'ch-01-step-05',
        title: '2–3–1 Scrub Order & Boss: Queen Gohma',
        regionId: 'deku-tree',
        era: 'child',
        kind: 'boss',
        instructions:
          'Push the B1 stone block into the trench, carry fire through the spiked-roller room to burn the floor web, and shield-deflect the three Deku Scrubs in Middle → Right → Left (2–3–1) order. Drop into the lair, look up to trigger Queen Gohma, stun her red eye with a Slingshot seed or Deku Nut, and finish her with Deku Stick jump-slashes for Boss Heart Container #1 and the Kokiri\'s Emerald.',
        proTip:
          'One Deku Stick jump-slash deals the same damage as four Kokiri Sword slashes—crouch-stab after a jump-slash to melt Gohma before she climbs the ceiling!',
        secretIds: ['boss-hc-deku', 'stone-emerald'],
        requiredIds: ['era-child', 'kokiri-sword', 'deku-shield', 'slingshot', 'deku-sticks'],
        unlocksRequirementIds: ['stone-emerald'],
      },
      {
        id: 'ch-01-step-06',
        title: 'Kokiri Bridge Farewell & Fairy Ocarina',
        regionId: 'kokiri-forest',
        era: 'child',
        kind: 'story',
        instructions:
          'After the Great Deku Tree\'s parting words, cross Kokiri Forest and exit through the western tree trunk toward Hyrule Field. Saria meets you on the wooden bridge and gifts you the Fairy Ocarina.',
        proTip:
          'Switch 2 maps Ocarina notes to L, R, A, Y, and X—or enable Ocarina Mic Input to play melodies with your voice or a real instrument!',
        secretIds: ['eq-ocarina'],
        requiredIds: ['era-child', 'slingshot', 'stone-emerald'],
        unlocksRequirementIds: ['ocarina'],
      },
    ],
  },
  {
    id: 'ch-02',
    number: 2,
    title: 'Hyrule Field, Castle Town, Hyrule Castle & Lon Lon Ranch',
    subtitle: 'Zelda Notes, Market Minigames, Zelda\'s Lullaby, Bottle #1 & Epona\'s Song',
    era: 'child',
    primaryRegionId: 'market',
    estimatedMinutes: 35,
    summary:
      'Cross Hyrule Field into Castle Town Market, sneak into Hyrule Castle Courtyard to learn Zelda\'s Lullaby, then sweep Lon Lon Ranch for Empty Bottle #1, Epona\'s Song, and early Heart Pieces.',
    steps: [
      {
        id: 'ch-02-step-01',
        title: 'Hyrule Field Entry, Zelda Notes & East Lone Tree Skulltula',
        regionId: 'hyrule-field',
        era: 'child',
        kind: 'switch2',
        instructions:
          'Listen to Kaepora Gaebora outside Kokiri Forest and link the free Zelda Notes mobile companion module (live GPS map + Gossip Quests). Immediately roll into the softly glowing lone tree just ahead in eastern Hyrule Field to knock down Gold Skulltula #8, then dash (Hold A) across the field to beat the sunset drawbridge!',
        proTip:
          'Trees hiding Gold Skulltulas or Rupees emit a subtle ambient shimmer in Switch 2—roll into glowing trunks whenever you spot one.',
        secretIds: ['sw2-zelda-notes', 'gs-008'],
        requiredIds: ['era-child', 'kokiri-sword'],
      },
      {
        id: 'ch-02-step-02',
        title: 'Market Arrival, Threads of Time, Guardhouse Crate & Shooting Gallery',
        regionId: 'market',
        era: 'child',
        kind: 'sweep',
        instructions:
          'Press Minus (-) to open the Threads of Time quest log (and Y for the dual-era Tapestry). Duck into the Guardhouse right inside the gate to smash pots for Rupees and roll into the corner crate for Gold Skulltula #14. Before dusk, pay 20 Rupees at the Market Shooting Gallery and score a perfect 10/10 round for the 50-Seed Biggest Bullet Bag.',
        proTip:
          'Win the Shooting Gallery Bullet Bag during daytime now; Bombchu Bowling across the square unlocks in Chapter 5 right after you earn the Bomb Bag!',
        secretIds: ['sw2-threads-of-time', 'gs-014', 'cap-seeds-50'],
        requiredIds: ['era-child', 'slingshot', 'rupees-100'],
      },
      {
        id: 'ch-02-step-03',
        title: 'Market Night: Rescue Richard the Lost White Dog',
        regionId: 'market',
        era: 'child',
        kind: 'quest',
        instructions:
          'Once night falls in Market Square, walk behind the closed Bazaar stall until the small white dog (Richard) barks and trots after you. Lead him into the Back Alley and step inside the lit apartment door to return him to the Dog Lady for Piece of Heart #1.',
        secretIds: ['hp-02'],
        requiredIds: ['era-child', 'time-night'],
      },
      {
        id: 'ch-02-step-04',
        title: 'Hyrule Castle Grounds, First Tree Skulltula & Wake Talon',
        regionId: 'hyrule-castle',
        era: 'child',
        kind: 'story',
        instructions:
          'Head north from Market to Hyrule Castle Grounds, speak to Malon by the vine wall to receive the Weird Egg, climb over the gate, and roll into the very first tree on the path for Gold Skulltula #15. Wait until morning so the Weird Egg hatches into a Pocket Cucco, then use it to wake sleeping Talon beside the castle moat drain.',
        secretIds: ['gs-015'],
        requiredIds: ['era-child'],
        unlocksRequirementIds: ['weird-egg'],
      },
      {
        id: 'ch-02-step-05',
        title: 'Courtyard Stealth, Zelda\'s Letter & Zelda\'s Lullaby',
        regionId: 'hyrule-castle',
        era: 'child',
        kind: 'story',
        instructions:
          'Push the milk crates into the castle moat, crawl inside, and slip past the daytime garden sentries into the Sanctuary Courtyard. Speak with Princess Zelda to receive Zelda\'s Letter, then learn Zelda\'s Lullaby (Y → X → A → Y → X → A) from Impa, who escorts you directly back out to Hyrule Field.',
        proTip:
          'Shoot Slingshot seeds at the courtyard castle windows before talking to Zelda for a fun Mario Easter egg and free recovery hearts.',
        secretIds: ['song-lullaby'],
        requiredIds: ['era-child', 'ocarina', 'weird-egg'],
        unlocksRequirementIds: ['zeldas-letter', 'song-lullaby'],
      },
      {
        id: 'ch-02-step-06',
        title: 'Lon Lon Ranch: Talon\'s Super Cuccos (Bottle #1) & Epona\'s Song',
        regionId: 'lon-lon-ranch',
        era: 'child',
        kind: 'quest',
        instructions:
          'Enter Lon Lon Ranch in central Hyrule Field during the day. Step inside Talon\'s farmhouse, pay 10 Rupees, and find his 3 Super Cuccos in 30 seconds to earn Empty Bottle #1 (filled with Lon Lon Milk!). Walk out to the central corral, pull out your Ocarina in front of Malon to learn Epona\'s Song (X → Y → A → X → Y → A), and play it beside the ranch cows for free refills anytime.',
        proTip:
          'Toss all regular Cuccos into a corner before paying Talon—when the round starts, only the 3 Super Cuccos will be roaming the center floor!',
        secretIds: ['bottle-02', 'song-epona', 'cow-lon-lon'],
        requiredIds: ['era-child', 'ocarina', 'weird-egg', 'rupees-100'],
        unlocksRequirementIds: ['bottle', 'song-epona'],
      },
      {
        id: 'ch-02-step-07',
        title: 'Lon Lon Storage Shed Heart Piece & NE Tree Skulltula',
        regionId: 'lon-lon-ranch',
        era: 'child',
        kind: 'sweep',
        instructions:
          'Walk to the far southwest corner of Lon Lon Ranch and enter the crumbling brick storage shed. Pull the milk crates aside to uncover the hidden crawlspace and grab Piece of Heart #2 inside the nest, then step outside behind the corral and roll into the lone NE tree for Gold Skulltula #11.',
        proTip:
          'The remaining 2 nighttime Ranch Skulltulas cling high on walls—you\'ll sweep both effortlessly with the Boomerang in Chapter 7.',
        secretIds: ['hp-01', 'gs-011'],
        requiredIds: ['era-child'],
      },
    ],
  },
  {
    id: 'ch-03',
    number: 3,
    title: 'Kakariko Village, Graveyard, Lost Woods & Saria\'s Song',
    subtitle: 'Bottle #2, 5 Kakariko Skulltulas, Sun\'s Song, Free Hylian Shield, Woods Upgrades & Masks #1–#2',
    era: 'child',
    primaryRegionId: 'kakariko-village',
    estimatedMinutes: 40,
    summary:
      'Round up Anju\'s Cuccos for Bottle #2, sweep Kakariko and the Graveyard for Sun\'s Song and a free Hylian Shield, start the Happy Mask quest, and learn Saria\'s Song while maxing Deku Sticks in the Lost Woods.',
    steps: [
      {
        id: 'ch-03-step-01',
        title: 'Kakariko Daytime: Anju\'s 7 Cuccos (Bottle #2) & Impa\'s Cow Cage',
        regionId: 'kakariko-village',
        era: 'child',
        kind: 'quest',
        instructions:
          'Enter Kakariko Village during the day and toss all 7 scattered Cuccos into Anju\'s pen near the Graveyard exit to win Empty Bottle #2. Before penning the last Cucco, carry one up the unfinished brick scaffolding, hop onto the slanted wooden beam, and glide diagonally onto the back ledge of Impa\'s House to crawl inside for Piece of Heart #3. Finally, show Zelda\'s Letter to the Death Mountain gate guard to open both the mountain gate and the Market Happy Mask Shop!',
        proTip:
          'Scoop bugs found under small Kakariko rocks into one of your two Empty Bottles now—1 jar of Bottled Bugs can be dropped and re-scooped infinitely for all 9 Soft Soil Skulltulas!',
        secretIds: ['bottle-03', 'hp-07'],
        requiredIds: ['era-child', 'zeldas-letter'],
        unlocksRequirementIds: ['bottled-bug'],
      },
      {
        id: 'ch-03-step-02',
        title: 'Kakariko Village: All 5 Child Gold Skulltulas',
        regionId: 'kakariko-village',
        era: 'child',
        kind: 'sweep',
        instructions:
          'Roll into the central Kakariko entrance tree for Gold Skulltula #18, then sleep in the Kakariko bed (or wait) until nightfall to sweep 4 more tokens in 60 seconds: #19 on the outer wall of the House of Skulltula, #20 on the red brick construction pile, #21 on the house wall by the Cucco pen, and #22 high up the tall wooden watchtower ladder (shoot with Slingshot and climb up).',
        secretIds: ['gs-018', 'gs-019', 'gs-020', 'gs-021', 'gs-022'],
        requiredIds: ['era-child', 'time-night', 'slingshot'],
        unlocksRequirementIds: ['tokens-10'],
      },
      {
        id: 'ch-03-step-03',
        title: 'Graveyard: Dampé\'s Tour, Royal Family\'s Tomb (Sun\'s Song) & Free Hylian Shield',
        regionId: 'graveyard',
        era: 'child',
        kind: 'story',
        instructions:
          'Enter Kakariko Graveyard during early night (18:00–21:00) and pay Dampé 10 Rupees when he stands directly on soft dirt patches until he unearths Piece of Heart #4. Pull back the 1st-row grave with flowers for a FREE Hylian Shield! Next, play Zelda\'s Lullaby on the back Triforce slab to enter the Royal Family\'s Tomb, read the carved tablet for the Sun\'s Song (A → R → X → A → R → X), then pull the 4th front-row grave from the right, defeat the ReDead, and play Sun\'s Song for Piece of Heart #5.',
        proTip:
          'Sun\'s Song swaps Day and Night on demand AND freezes ReDeads solid—never wait around for nightfall again!',
        secretIds: ['hp-12', 'eq-hylian-shield', 'song-sun', 'hp-11'],
        requiredIds: ['era-child', 'time-night', 'ocarina', 'song-lullaby', 'rupees-100'],
        unlocksRequirementIds: ['song-sun'],
      },
      {
        id: 'ch-03-step-04',
        title: 'Happy Mask #1: Keaton Mask Delivery & Borrow Skull Mask',
        regionId: 'kakariko-village',
        era: 'child',
        kind: 'quest',
        instructions:
          'Play Sun\'s Song for daytime, pop down to the newly opened Happy Mask Shop in Castle Town Market to borrow the Keaton Mask, and sell it to the Death Mountain Trail gate guard in Kakariko Village. Run back to the Happy Mask Shop, pay the 10-Rupee fee, and borrow Mask #2: the Skull Mask.',
        secretIds: ['mask-step-1'],
        requiredIds: ['era-child', 'zeldas-letter'],
        unlocksRequirementIds: ['skull-mask'],
      },
      {
        id: 'ch-03-step-05',
        title: 'Sacred Forest Meadow Maze & Saria\'s Song',
        regionId: 'sacred-forest-meadow',
        era: 'child',
        kind: 'story',
        instructions:
          'Head through Kokiri Forest into the Lost Woods and follow the musical tunnel cues (Right, Left, Right, Left, Straight, Left, Right) to Sacred Forest Meadow. Defeat the Wolfos at the gate, weave past the Mad Scrubs in the hedge maze, and meet Saria on her stump to learn Saria\'s Song (R → A → Y → R → A → Y).',
        secretIds: ['song-saria'],
        requiredIds: ['era-child', 'ocarina', 'zeldas-letter'],
        unlocksRequirementIds: ['song-saria'],
      },
      {
        id: 'ch-03-step-06',
        title: 'Lost Woods Sweep: Forest Stage, Target Shooting, Both Skull Kids & Mask #2',
        regionId: 'lost-woods',
        era: 'child',
        kind: 'sweep',
        instructions:
          'Step back into the Lost Woods from Sacred Forest Meadow: (1) Drop into the hidden grotto among the butterflies in the Forest Stage clearing while WEARING the Skull Mask so the Scrub elders upgrade you to 30 Deku Sticks! (2) Navigate to the eastern target tree (Right from Kokiri entrance), shoot three 100-point bullseyes for the 40-Seed Bullet Bag, and climb down to repeat the Two Skull Kids\' Ocarina memory tune for Piece of Heart #6. (3) Go Left from the Kokiri entrance: play Saria\'s Song for the Lone Skull Kid for Piece of Heart #7, sell him the Skull Mask, and go Left once more to buy the 20-Stick upgrade (or collect in reverse order to reach 30 Sticks max) from the under-bridge Business Scrub!',
        proTip:
          'Wearing the Skull Mask at the Forest Stage BEFORE selling it to the Skull Kid saves an extra trip back to Market!',
        secretIds: ['cap-sticks-30', 'cap-seeds-40', 'hp-16', 'hp-15', 'mask-step-2', 'cap-sticks-20'],
        requiredIds: ['era-child', 'ocarina', 'song-saria', 'slingshot', 'deku-shield', 'skull-mask', 'rupees-100'],
      },
    ],
  },
  {
    id: 'ch-04',
    number: 4,
    title: 'Death Mountain Trail, Goron City & Dodongo\'s Cavern',
    subtitle: 'Goron\'s Bracelet, Bomb Bag, 4 Mountain/Dungeon Skulltulas & King Dodongo',
    era: 'child',
    primaryRegionId: 'dodongos-cavern',
    estimatedMinutes: 35,
    summary:
      'Climb Death Mountain Trail via the Lost Woods or Kakariko gate, dance Darunia out of his funk with Saria\'s Song for the Goron\'s Bracelet, and conquer Dodongo\'s Cavern for Bombs and Goron\'s Ruby.',
    steps: [
      {
        id: 'ch-04-step-01',
        title: 'Goron City: Cheer Up Darunia for the Goron\'s Bracelet',
        regionId: 'goron-city',
        era: 'child',
        kind: 'story',
        instructions:
          'Ascend Death Mountain Trail to Goron City and drop to the bottom floor. Stand on the rug before the sealed door, play Zelda\'s Lullaby to enter Darunia\'s chamber, and play Saria\'s Song (R → A → Y → R → A → Y) to make the Goron chief dance and award you the Goron\'s Bracelet.',
        proTip:
          'Before leaving Darunia\'s chamber, light a Deku Stick on his torch and ignite all 4 torches around the giant Goron Urn outside so it\'s already spinning when you come back with Bombs!',
        secretIds: ['eq-goron-bracelet'],
        requiredIds: ['era-child', 'zeldas-letter', 'song-lullaby', 'song-saria'],
        unlocksRequirementIds: ['goron-bracelet'],
      },
      {
        id: 'ch-04-step-02',
        title: 'Open Dodongo\'s Cavern & Entrance Soil Skulltula',
        regionId: 'death-mountain-trail',
        era: 'child',
        kind: 'story',
        instructions:
          'Step outside Goron City, pull up the Bomb Flower beside the Goron overlooking the cliff, and throw it over the fence to shatter the boulder sealing Dodongo\'s Cavern. Climb down to the entrance and drop Bottled Bugs into the soft soil patch right outside the cave mouth for Gold Skulltula #26 (remember to re-scoop one bug back into your Bottle!).',
        secretIds: ['gs-026'],
        requiredIds: ['era-child', 'goron-bracelet', 'bottle', 'bottled-bug'],
      },
      {
        id: 'ch-04-step-03',
        title: 'Dodongo\'s Cavern East Wing, Baby Dodongo Wall & Bomb Bag',
        regionId: 'dodongos-cavern',
        era: 'child',
        kind: 'dungeon',
        instructions:
          'Use Bomb Flowers to blast open the main hall and enter the 1F lower-east corridor. Lure a burrowing Baby Dodongo to detonate beside the discolored side wall for Gold Skulltula #61, press the switch at the end of the hall, defeat the two Lizalfos mini-bosses across the lava rooms, and light the torches to open the central west path and claim the Bomb Bag!',
        secretIds: ['gs-061', 'eq-bomb-bag'],
        requiredIds: ['era-child', 'goron-bracelet'],
        unlocksRequirementIds: ['bombs'],
      },
      {
        id: 'ch-04-step-04',
        title: '2F Bomb-Flower Staircase & Pre-Boss Armos Skulltulas',
        regionId: 'dodongos-cavern',
        era: 'child',
        kind: 'dungeon',
        instructions:
          'Drop a Bomb into the gap along the 1F west Bomb Flower staircase to lower the stone steps, then climb up and slash Gold Skulltula #63 on the 2F vines. Cross the giant Dodongo skull\'s bridge to drop Bombs into both eye sockets, navigate the 2F blade and block halls, and bomb the cracked wall behind the lone northern Armos statue before the boss room for Gold Skulltula #64.',
        proTip:
          'Leave the two high-alcove Dodongo\'s Cavern Skulltulas (#62 and #65) for Chapter 11 when Adult Link passes right back by with the Hookshot and Scarecrow\'s Song.',
        secretIds: ['gs-063', 'gs-064'],
        requiredIds: ['era-child', 'bombs'],
      },
      {
        id: 'ch-04-step-05',
        title: 'Boss: King Dodongo & Goron\'s Ruby',
        regionId: 'dodongos-cavern',
        era: 'child',
        kind: 'boss',
        instructions:
          'Open the chest for a free refill of Bombs, blow open the cracked center floor tile, and drop into the magma chamber. Whenever King Dodongo inhales deeply, toss a Bomb straight into his mouth, follow with a Deku Stick jump-slash, and hold your Hylian Shield (crouching like a turtle!) as he rolls past. Repeat to claim Boss Heart Container #2 and the Goron\'s Ruby.',
        secretIds: ['boss-hc-dodongo', 'stone-ruby'],
        requiredIds: ['era-child', 'bombs', 'deku-shield'],
        unlocksRequirementIds: ['stone-ruby'],
      },
    ],
  },
  {
    id: 'ch-05',
    number: 5,
    title: 'Post-Bombs Child Power Sweep',
    subtitle: 'Summit Din\'s Fire, 2 Crater Heart Pieces, 30–40 Bombs, 500-Rupee Wallet & Mask #3',
    era: 'child',
    primaryRegionId: 'death-mountain-trail',
    estimatedMinutes: 30,
    summary:
      'Put your new Bomb Bag to immediate work: unlock Magic & Din\'s Fire on Death Mountain Summit, grab Switch 2\'s relocated Crater Scrub Heart Piece, max your Bomb Bag to 40, claim the 500-Rupee Adult\'s Wallet, and deliver Mask #3.',
    steps: [
      {
        id: 'ch-05-step-01',
        title: 'Death Mountain Summit Great Fairy #1: Magic Meter & Din\'s Fire',
        regionId: 'death-mountain-trail',
        era: 'child',
        kind: 'switch2',
        instructions:
          'Climb the boulder-strewn upper Death Mountain Trail (blasting rocks with Bombs and holding your Hylian Shield crouched when the volcano erupts) to the summit. Bomb the boulder blocking the left doorway, play Zelda\'s Lullaby on the Triforce mark, and pay 25 Rupees to Great Fairy #1.',
        proTip:
          'MAJOR SWITCH 2 CHANGE: Great Fairies now charge Rupees (25 → 500), and Summit swapped rewards with Hyrule Castle—so 25 Rupees here unlocks BOTH your Magic Meter AND Din\'s Fire immediately!',
        secretIds: ['gf-01'],
        requiredIds: ['era-child', 'bombs', 'song-lullaby', 'rupees-100'],
        unlocksRequirementIds: ['magic-meter', 'dins-fire'],
      },
      {
        id: 'ch-05-step-02',
        title: 'Death Mountain Crater Summit Dip: Crate Skulltula & 2 Heart Pieces',
        regionId: 'death-mountain-crater',
        era: 'child',
        kind: 'switch2',
        instructions:
          'With full hearts, step inside the Death Mountain Crater summit cave as Child Link (you have plenty of time on the heat timer!): (1) Immediately roll into the wooden crate on your right for Gold Skulltula #32. (2) Drop onto the lower-left ledge, stun the NEW Switch 2 Business Scrub with your Slingshot, and buy Piece of Heart #8 for 100 Rupees! (3) Re-enter to reset the timer, run forward to the northern cliff lip, and climb partway down into the rock alcove for Piece of Heart #9.',
        proTip:
          'This 100-Rupee Crater Business Scrub is brand-new in the Switch 2 Remake, replacing the removed Ice Cavern Red Ice Heart Piece—there are zero Heart Pieces inside dungeons now!',
        secretIds: ['gs-032', 'hp-21', 'hp-19'],
        requiredIds: ['era-child', 'slingshot', 'rupees-100'],
      },
      {
        id: 'ch-05-step-03',
        title: 'Goron City Sweep: 30-Bomb Bag, Spinning Urn Heart Piece & Boulder Maze',
        regionId: 'goron-city',
        era: 'child',
        kind: 'sweep',
        instructions:
          'Return to Goron City: detonate a Bomb inside the 3F rock tunnel right as Hot Rodder Goron rolls through to earn the Bigger Bomb Bag (30). Toss Bombs into the top of the lit, spinning Giant Goron Urn from 2F until it lands on the smiling face for Piece of Heart #10. Finally, blast through the top-floor boulder maze to smash the back-left crate for Gold Skulltula #30, and bomb open the 2F cracked wall shortcut to the Lost Woods!',
        secretIds: ['cap-bombs-30', 'hp-17', 'gs-030'],
        requiredIds: ['era-child', 'bombs', 'song-lullaby', 'deku-sticks'],
      },
      {
        id: 'ch-05-step-04',
        title: 'Lost Woods Shortcut Dip: Deku Nut Upgrade #1 (30)',
        regionId: 'lost-woods',
        era: 'child',
        kind: 'sweep',
        instructions:
          'Step straight through the newly bombed Goron City ↔ Lost Woods tunnel, navigate just outside Sacred Forest Meadow (Right, Left, Straight, Right from the Goron shortcut or standard SFM approach), bomb the gray boulder, deflect the right-hand Business Scrub\'s shot, and buy Deku Nut Upgrade #1 (30) for 40 Rupees.',
        secretIds: ['cap-nuts-30'],
        requiredIds: ['era-child', 'bombs', 'rupees-100'],
      },
      {
        id: 'ch-05-step-05',
        title: 'House of Skulltula: Claim 500-Rupee Adult\'s Wallet (10 Tokens)',
        regionId: 'kakariko-village',
        era: 'child',
        kind: 'quest',
        instructions:
          'Ride Kaepora Gaebora down from Death Mountain Summit (or exit Lost Woods) to Kakariko Village with 19 Gold Skulltula Tokens already in hand! Enter the House of Skulltula and speak to the first freed brother to claim the Adult\'s Wallet—boosted to hold 500 Rupees in the Switch 2 Remake.',
        proTip:
          'Holding 500 Rupees as Child Link lets you fund the entire Child Magic Bean tour in Chapter 6 in one clean sweep without running dry!',
        secretIds: ['skr-10'],
        requiredIds: ['tokens-10'],
        unlocksRequirementIds: ['adults-wallet'],
      },
      {
        id: 'ch-05-step-06',
        title: 'Market Bombchu Bowling: Heart Piece & 40-Bomb Biggest Bomb Bag',
        regionId: 'market',
        era: 'child',
        kind: 'quest',
        instructions:
          'Head to Castle Town Market: pay the 20-Rupee Skull Mask fee at the Happy Mask Shop and borrow Mask #3 (the Spooky Mask). Next door, enter the newly opened Bombchu Bowling Alley (30 Rupees per round) and win both randomized grand prizes—Piece of Heart #11 and the Biggest Bomb Bag (40)!',
        proTip:
          'Exit and re-enter Bombchu Bowling for free to reroll what prize the operator announces before paying 30 Rupees.',
        secretIds: ['hp-03', 'cap-bombs-40'],
        requiredIds: ['era-child', 'bombs', 'rupees-100'],
      },
      {
        id: 'ch-05-step-07',
        title: 'Happy Mask #3: Sell Spooky Mask in Kakariko Graveyard',
        regionId: 'graveyard',
        era: 'child',
        kind: 'quest',
        instructions:
          'Ensure it is daytime (play Sun\'s Song if needed), enter Kakariko Graveyard, and speak to the Graveyard Boy patrolling with a stick while wearing the Spooky Mask to sell it on the spot.',
        proTip:
          'Mask #4 (the Bunny Hood) unlocks back at the Happy Mask Shop right after you claim the 3rd Spiritual Stone in Chapter 6.',
        secretIds: ['mask-step-3'],
        requiredIds: ['era-child', 'time-day'],
      },
    ],
  },
  {
    id: 'ch-06',
    number: 6,
    title: 'Zora\'s River, Zora\'s Domain & Jabu-Jabu\'s Belly',
    subtitle: 'Magic Beans #1–#8 + Soil Skulltulas, Silver Scale, Bottle #3, Boomerang & Barinade',
    era: 'child',
    primaryRegionId: 'jabu-jabus-belly',
    estimatedMinutes: 45,
    summary:
      'Stock up on Magic Beans #1–#8 (pairing every Soft Soil plot with Bottled Bugs!), earn the Silver Scale and Ruto\'s Letter Bottle #3 via Zora\'s Domain underwater shortcuts, and clear Inside Jabu-Jabu\'s Belly for the Boomerang and Zora\'s Sapphire.',
    steps: [
      {
        id: 'ch-06-step-01',
        title: 'Zora\'s River: Buy Magic Beans #1–#8, River Skulltulas & 2 Cucco Heart Pieces',
        regionId: 'zoras-river',
        era: 'child',
        kind: 'sweep',
        instructions:
          'Bomb the boulders at the Zora\'s River entrance, roll into the lone entrance tree for Gold Skulltula #34, and buy Magic Beans #1–#8 (360 Rupees total—easy with your 500-Rupee Adult\'s Wallet, or grab 4–5 now and top up via Zora\'s Domain\'s Lost Woods/Lake shortcuts!). Plant Magic Bean #1 right beside the Bean Seller. Next, carry the entrance Cucco halfway up the river to glide onto the freestanding lower pillar for Piece of Heart #12, carry a second Cucco all the way to the waterfall platform to glide onto the high corner ledge for Piece of Heart #13, and at night slash Gold Skulltula #35 on the waterfall ladder.',
        proTip:
          'You crossed 20 Gold Skulltula Tokens here—anytime you pass through Kakariko, you can optionally grab the Echo Gem radar early, or claim all remaining token tiers together in Chapter 17!',
        secretIds: ['bean-01', 'gs-034', 'gs-035', 'hp-22', 'hp-23'],
        requiredIds: ['era-child', 'bombs', 'time-night', 'rupees-100'],
        unlocksRequirementIds: ['magic-beans', 'tokens-20'],
      },
      {
        id: 'ch-06-step-02',
        title: 'Zora\'s Domain: Waterfall Torch Chest & Silver Scale Diving Game',
        regionId: 'zoras-domain',
        era: 'child',
        kind: 'story',
        instructions:
          'Stand on the stone seal before the waterfall, play Zelda\'s Lullaby, and enter Zora\'s Domain. Light a Deku Stick at the shop brazier and ignite all 4 lower torches (stairs, shallow pool, and two behind the waterfall—or cast Din\'s Fire behind the cascade!) to spawn Piece of Heart #14. Then climb to the top waterfall ledge, pay 20 Rupees, and dive for all 5 Rupees in 50 seconds to earn the Silver Scale!',
        proTip:
          'With the Silver Scale equipped, two massive time-saving underwater warp tunnels open immediately: the pool below Zora\'s Domain warps to Lake Hylia, and the deep West Zora\'s Domain alcove warps straight to the Lost Woods!',
        secretIds: ['hp-26', 'eq-silver-scale'],
        requiredIds: ['era-child', 'song-lullaby', 'deku-sticks', 'rupees-100'],
        unlocksRequirementIds: ['silver-scale'],
      },
      {
        id: 'ch-06-step-03',
        title: 'Lake Hylia Shortcut: Ruto\'s Letter (Bottle #3), Bean #7 & Lake Skulltulas',
        regionId: 'lake-hylia',
        era: 'child',
        kind: 'quest',
        instructions:
          'Dive into the underwater tunnel at the bottom of Zora\'s Domain to warp directly into Lake Hylia! Dive immediately in front of the warp pillars to retrieve Empty Bottle #3 (containing Ruto\'s Letter). Swim ashore to the Lakeside Laboratory, drop Bottled Bugs into the soft soil patch for Gold Skulltula #44 (re-scoop a bug!), plant Magic Bean #7, and at night swim to the southern two-pillar island to slash Gold Skulltula #42.',
        secretIds: ['bottle-04', 'gs-044', 'bean-07', 'gs-042'],
        requiredIds: ['era-child', 'silver-scale', 'magic-beans', 'bottle', 'bottled-bug', 'time-night'],
      },
      {
        id: 'ch-06-step-04',
        title: 'Lost Woods Shortcut: Plant Magic Beans #3–#4 & Woods Soil Skulltulas',
        regionId: 'lost-woods',
        era: 'child',
        kind: 'sweep',
        instructions:
          'Swim back through the tunnel to Zora\'s Domain and dive down the west pool tunnel straight into the Lost Woods! Visit the two Lost Woods soft soil plots—the Bridge clearing (Left from standard entrance) and the Forest Stage butterfly clearing—releasing Bottled Bugs first for Gold Skulltulas #4 and #5, then planting Magic Beans #3 and #4.',
        secretIds: ['gs-004', 'bean-03', 'gs-005', 'bean-04'],
        requiredIds: ['era-child', 'magic-beans', 'bottle', 'bottled-bug'],
      },
      {
        id: 'ch-06-step-05',
        title: 'Kokiri Forest Dip: Plant Magic Bean #2 & Shop Soil Skulltula',
        regionId: 'kokiri-forest',
        era: 'child',
        kind: 'sweep',
        instructions:
          'Step briefly out of the Lost Woods into Kokiri Forest, walk behind the Kokiri Shop, drop Bottled Bugs onto the soft soil for Gold Skulltula #2 (re-scooping a bug!), and plant Magic Bean #2.',
        secretIds: ['gs-002', 'bean-02'],
        requiredIds: ['era-child', 'magic-beans', 'bottle', 'bottled-bug'],
      },
      {
        id: 'ch-06-step-06',
        title: 'Graveyard, Trail & Gorge Planting Loop: Beans #5, #6 & #8',
        regionId: 'graveyard',
        era: 'child',
        kind: 'sweep',
        instructions:
          'Take the Lost Woods ↔ Goron City shortcut down toward Kakariko Graveyard: release Bottled Bugs into the left cliffside soil patch for Gold Skulltula #24 and plant Magic Bean #5.',
        secretIds: ['gs-024', 'bean-05'],
        requiredIds: ['era-child', 'magic-beans', 'bottle', 'bottled-bug'],
      },
      {
        id: 'ch-06-step-07',
        title: 'Death Mountain Trail Entrance: Plant Magic Bean #6',
        regionId: 'death-mountain-trail',
        era: 'child',
        kind: 'sweep',
        instructions:
          'Step through the Kakariko gate up to the Dodongo\'s Cavern entrance (where you already cleared the soil Skulltula in Chapter 4) and plant Magic Bean #6 in the soft soil.',
        secretIds: ['bean-06'],
        requiredIds: ['era-child', 'magic-beans'],
      },
      {
        id: 'ch-06-step-08',
        title: 'Gerudo Valley Canyon Floor: Plant Magic Bean #8 & Gorge Soil Skulltula',
        regionId: 'gerudo-valley',
        era: 'child',
        kind: 'sweep',
        instructions:
          'Run west across Hyrule Field to Gerudo Valley, grab the entrance Cucco, and glide down to the lower stone ledge beside the canyon cow. Drop Bottled Bugs into the soft soil for Gold Skulltula #48 and plant Magic Bean #8 (completing all 8 Child-accessible Magic Beans—#9 and #10 wait for Adult warp songs!), then ride the river current straight into Lake Hylia and warp back up to Zora\'s Domain!',
        proTip:
          'Jumping into the Gerudo Valley river washes you directly into Lake Hylia right beside the Zora\'s Domain underwater warp—zero walking back across Hyrule Field!',
        secretIds: ['gs-048', 'bean-08'],
        requiredIds: ['era-child', 'magic-beans', 'bottle', 'bottled-bug'],
      },
      {
        id: 'ch-06-step-09',
        title: 'Show Ruto\'s Letter, Zora\'s Fountain SE Tree & Enter Jabu-Jabu',
        regionId: 'zoras-fountain',
        era: 'child',
        kind: 'story',
        instructions:
          'Present Ruto\'s Letter to King Zora (keeping Empty Bottle #3!) and scoop a fish from the shallow Zora\'s Domain pool. Step behind the throne into Zora\'s Fountain, swim to the SE corner island to roll into the tree for Gold Skulltula #39, and drop the bottled fish in front of Lord Jabu-Jabu to get swallowed inside.',
        secretIds: ['gs-039'],
        requiredIds: ['era-child', 'bottle'],
      },
      {
        id: 'ch-06-step-10',
        title: 'Inside Jabu-Jabu\'s Belly: Boomerang, All 4 Skulltulas & Barinade',
        regionId: 'jabu-jabus-belly',
        era: 'child',
        kind: 'dungeon',
        instructions:
          'Carry Princess Ruto through the pit floor, hit the B1 water-level switch to slash Gold Skulltula #66 on the vines, and clear the upper Stinger room for the Boomerang! Destroy the red, blue, and green parasitic tentacles, grab Gold Skulltulas #67 and #68 together in the B1 Sapphire pit after Big Octo, snag #69 on the 1F pre-boss vine climb, and sever Barinade\'s tentacles and Bari ring with Z/ZL-targeted Boomerang throws for Boss Heart Container #3 and Zora\'s Sapphire!',
        proTip:
          'Jabu-Jabu\'s Belly is Child-only (vanishes in the Adult era)—grabbing all 4 Gold Skulltulas right now permanently completes the dungeon 100%!',
        secretIds: [
          'eq-boomerang',
          'gs-066',
          'gs-067',
          'gs-068',
          'gs-069',
          'boss-hc-jabu',
          'stone-sapphire',
        ],
        requiredIds: ['era-child', 'slingshot'],
        unlocksRequirementIds: ['boomerang', 'stone-sapphire', 'tokens-30'],
      },
    ],
  },
  {
    id: 'ch-07',
    number: 7,
    title: 'Three Spiritual Stones Cleanup & Temple of Time',
    subtitle: 'Boomerang Skulltulas, Gorge & Pond Heart Pieces, Bottle #4, Song of Time, Spin Attack & Mask of Truth',
    era: 'child',
    primaryRegionId: 'market',
    estimatedMinutes: 40,
    summary:
      'Use your new Boomerang to sweep every remaining Child Skulltula across Hyrule, grab Empty Bottle #4 in Market\'s Potion Shop, claim the Ocarina of Time and Charged Spin Attack, finish the Happy Mask Quest for 40 Deku Nuts, and pull the Master Sword.',
    steps: [
      {
        id: 'ch-07-step-01',
        title: 'Deku Tree Backtrack: Final B1 Bomb-Wall Skulltula',
        regionId: 'deku-tree',
        era: 'child',
        kind: 'sweep',
        instructions:
          'From Zora\'s Fountain (snagging #40 on the fallen log wall at night before leaving, or right here via Zora\'s Domain\'s Lost Woods warp!), dive to the Lost Woods and pop into Inside the Great Deku Tree. Drop to B1, burn the web behind the 3-Scrub room, crawl through, bomb the cracked stone wall on the far side, and Boomerang Gold Skulltula #60 to finish the Deku Tree 100%!',
        secretIds: ['gs-060'],
        requiredIds: ['era-child', 'bombs', 'boomerang', 'deku-sticks'],
      },
      {
        id: 'ch-07-step-02',
        title: 'Zora\'s Fountain Fallen Log Night Skulltula',
        regionId: 'zoras-fountain',
        era: 'child',
        kind: 'sweep',
        instructions:
          'At night in Zora\'s Fountain (right outside Jabu-Jabu\'s Belly after Barinade\'s warp), walk out onto the partially submerged fallen log in the SW corner and throw the Boomerang at the right cliff wall to pull in Gold Skulltula #40.',
        secretIds: ['gs-040'],
        requiredIds: ['era-child', 'time-night', 'boomerang'],
      },
      {
        id: 'ch-07-step-03',
        title: 'Death Mountain Trail Alcove & Graveyard East Wall Skulltulas',
        regionId: 'death-mountain-trail',
        era: 'child',
        kind: 'sweep',
        instructions:
          'Pass through Kakariko\'s mountain gate onto lower Death Mountain Trail, bomb the discolored brown rock wall on the right, and use the Boomerang to retrieve Gold Skulltula #27 from the high alcove.',
        secretIds: ['gs-027'],
        requiredIds: ['era-child', 'bombs', 'boomerang'],
      },
      {
        id: 'ch-07-step-04',
        title: 'Kakariko Graveyard East Wall Night Skulltula',
        regionId: 'graveyard',
        era: 'child',
        kind: 'sweep',
        instructions:
          'Play Sun\'s Song for nightfall inside Kakariko Graveyard, walk past the rows of headstones to the far east stone wall, and Boomerang Gold Skulltula #25.',
        secretIds: ['gs-025'],
        requiredIds: ['era-child', 'time-night', 'boomerang'],
      },
      {
        id: 'ch-07-step-05',
        title: 'Lon Lon Ranch Night Sweep: Window & Shed Wall Skulltulas',
        regionId: 'lon-lon-ranch',
        era: 'child',
        kind: 'sweep',
        instructions:
          'Enter Lon Lon Ranch at night with your Boomerang to complete all 3 Ranch Gold Skulltulas: throw the Boomerang at the upper racetrack-facing window of Talon\'s farmhouse for #12, then run to the outer brick wall of the SW storage shed for #13.',
        proTip:
          'Switch 2 relocated N64\'s 4th Ranch Skulltula to the SE Peahat Wetland cross-era grotto in Hyrule Field, so Lon Lon Ranch\'s Skulltula counter is now 3/3!',
        secretIds: ['gs-012', 'gs-013'],
        requiredIds: ['era-child', 'time-night', 'boomerang'],
      },
      {
        id: 'ch-07-step-06',
        title: 'Lake Hylia: 10-Pound Lunker Heart Piece & Lab Back Wall Skulltula',
        regionId: 'lake-hylia',
        era: 'child',
        kind: 'quest',
        instructions:
          'Head south to Lake Hylia: pay 20 Rupees at the Fishing Pond and cast near the submerged middle-right log to land a 10+ pound fish for Piece of Heart #15. At night, walk behind the Lakeside Laboratory and Boomerang Gold Skulltula #43 off the back stone wall.',
        secretIds: ['hp-29', 'gs-043'],
        requiredIds: ['era-child', 'time-night', 'boomerang', 'rupees-100'],
      },
      {
        id: 'ch-07-step-07',
        title: 'Gerudo Valley: Gorge Chest, Waterfall Alcove & Cascade Skulltula',
        regionId: 'gerudo-valley',
        era: 'child',
        kind: 'sweep',
        instructions:
          'Enter Gerudo Valley from western Hyrule Field: (1) Carry the entrance Cucco onto the bridge/outcrop and glide to the narrow south cliff ledge to open Switch 2\'s updated Treasure Chest for Piece of Heart #16. (2) Drop into the canyon river, swim north straight through the tall waterfall curtain, and climb the hidden ladder for Piece of Heart #17. (3) Return to the eastern plank entrance at night and Boomerang Gold Skulltula #47 inside the small right-hand waterfall.',
        proTip:
          'Switch 2 replaced Gerudo Valley\'s old wooden crate with a visible Treasure Chest so Adult Link can also Hookshot straight onto it if missed!',
        secretIds: ['hp-33', 'hp-32', 'gs-047'],
        requiredIds: ['era-child', 'time-night', 'boomerang'],
      },
      {
        id: 'ch-07-step-08',
        title: 'Market: Golden Bug Bottle #4, Ocarina of Time & Song of Time',
        regionId: 'market',
        era: 'child',
        kind: 'switch2',
        instructions:
          'Approach Castle Town\'s drawbridge with all 3 Spiritual Stones to trigger Ganondorf\'s pursuit, then dive into the moat for the Ocarina of Time and learn the Song of Time (A → L → R → A → L → R). Step inside Market during the day: enter the east Potion Shop, catch the panicked shopkeeper\'s escaped Golden Bug on the floor, and keep NEW Switch 2 Empty Bottle #4 (+ free Red Potion!). Before leaving Market, pay 30 Rupees at the Happy Mask Shop and borrow Mask #4: the Bunny Hood.',
        proTip:
          'This Market Potion Shop Golden Bug encounter is a brand-new 5th Empty Bottle exclusive to the Switch 2 Remake!',
        secretIds: ['song-time', 'bottle-01'],
        requiredIds: ['era-child', 'slingshot', 'bombs', 'boomerang'],
        unlocksRequirementIds: ['song-time', 'tokens-40'],
      },
      {
        id: 'ch-07-step-09',
        title: 'Hyrule Castle Great Fairy #2: Charged Spin Attack',
        regionId: 'hyrule-castle',
        era: 'child',
        kind: 'switch2',
        instructions:
          'Walk up to Hyrule Castle Grounds, follow the right-hand path past the gate to the dead-end boulder, blow it up with a Bomb, crawl inside, play Zelda\'s Lullaby, and offer 50 Rupees to Great Fairy #2 for the magic-powered Charged Spin Attack.',
        secretIds: ['gf-02'],
        requiredIds: ['era-child', 'bombs', 'magic-meter', 'song-lullaby', 'rupees-100'],
      },
      {
        id: 'ch-07-step-10',
        title: 'Bunny Hood Sale, Cow Fire Grotto & Unlock Mask of Truth',
        regionId: 'hyrule-field',
        era: 'child',
        kind: 'quest',
        instructions:
          'Step into Hyrule Field: bomb the circle of stones before Gerudo Valley, burn the inner spiderwebs with Din\'s Fire, play Epona\'s Song for the Cow, and Boomerang Gold Skulltula #9 behind it. Next, wait along the Lon Lon Ranch perimeter path at dusk until the Running Man sits down, sell him the Bunny Hood (filling your entire 500-Rupee Wallet!), and pay 50 Rupees at the Happy Mask Shop to permanently unlock the Mask of Truth before walking into the Temple of Time!',
        proTip:
          'Selling the Bunny Hood instantly tops your Adult\'s Wallet up to 500 Rupees—perfect seed money for Adult Link!',
        secretIds: ['cow-hyrule-field', 'gs-009', 'mask-step-4'],
        requiredIds: ['era-child', 'bombs', 'dins-fire', 'magic-meter', 'boomerang', 'song-epona'],
        unlocksRequirementIds: ['mask-of-truth'],
      },
    ],
  },
  {
    id: 'ch-08',
    number: 8,
    title: 'Seven Years Later: Epona, Hookshot & Song of Storms',
    subtitle: 'Master Sword Awakening, Epona & Link\'s Cow, Dampé\'s Hookshot & Kakariko Windmill',
    era: 'adult',
    primaryRegionId: 'graveyard',
    estimatedMinutes: 30,
    summary:
      'Open the Door of Time, awaken seven years in the future as Adult Link, rescue Epona from Ingo, race Dampé\'s ghost for the Hookshot and a sub-1:00 Heart Piece, and learn the Song of Storms.',
    steps: [
      {
        id: 'ch-08-step-01',
        title: 'Temple of Time: Door of Time, Master Sword & Adult Awakening',
        regionId: 'market',
        era: 'adult',
        kind: 'story',
        instructions:
          'Enter the Temple of Time, play the Song of Time before the altar to open the Door of Time, and pull the Master Sword from the Pedestal of Time! Receive the Light Medallion from Rauru in the Chamber of Sages and meet Sheik, who directs you toward Kakariko Village and the Forest Temple.',
        secretIds: ['medallion-light'],
        requiredIds: ['stone-emerald', 'stone-ruby', 'stone-sapphire', 'song-time'],
        unlocksRequirementIds: ['era-adult'],
      },
      {
        id: 'ch-08-step-02',
        title: 'Lon Lon Ranch: Free Epona from Ingo',
        regionId: 'lon-lon-ranch',
        era: 'adult',
        kind: 'quest',
        instructions:
          'Head straight to Lon Lon Ranch during the day with at least 60 Rupees. Pay Ingo 10 Rupees to enter the corral, play Epona\'s Song (X → Y → A → X → Y → A) to mount Epona, speak to Ingo while mounted to wager 50 Rupees, hug the inner fence to beat him in two consecutive races, and leap straight over the locked front ranch gate!',
        proTip:
          'Never burn your last carrot icon—space dashes evenly and pull ahead on the inner rail to block Ingo from passing.',
        secretIds: ['eq-epona'],
        requiredIds: ['era-adult', 'song-epona', 'rupees-100'],
        unlocksRequirementIds: ['epona'],
      },
      {
        id: 'ch-08-step-03',
        title: 'Malon\'s Obstacle Course: Ship a Personal Cow to Link\'s House',
        regionId: 'kokiri-forest',
        era: 'adult',
        kind: 'quest',
        instructions:
          'Re-enter Lon Lon Ranch now that Malon is back in charge and clear her equestrian obstacle course in under 0:50. She delivers a personal Cow straight into Link\'s House in Kokiri Forest—play Epona\'s Song beside your bed anytime for free Lon Lon Milk!',
        secretIds: ['cow-links-house'],
        requiredIds: ['era-adult', 'epona', 'song-epona'],
      },
      {
        id: 'ch-08-step-04',
        title: 'Kakariko Graveyard: Dampé\'s Ghost Race #1 (The Hookshot)',
        regionId: 'graveyard',
        era: 'adult',
        kind: 'story',
        instructions:
          'Ride Epona to Kakariko Graveyard, pull back Dampé\'s flower-adorned grave on the left side, drop into the catacombs, and follow Dampé\'s ghost through the falling-flame corridors to open the chest containing the Hookshot.',
        secretIds: ['eq-hookshot'],
        requiredIds: ['era-adult'],
        unlocksRequirementIds: ['hookshot'],
      },
      {
        id: 'ch-08-step-05',
        title: 'Windmill Upper Heart Piece, Song of Storms & Night Rooftop Skulltula',
        regionId: 'kakariko-village',
        era: 'adult',
        kind: 'story',
        instructions:
          'Play the Song of Time behind Dampé\'s treasure chest to clear the blue stone block and climb the stairs directly onto the upper Kakariko Windmill ledge for Piece of Heart #18! Hop down inside the Windmill and pull out your Ocarina before Guru-Guru to learn the Song of Storms (L → R → X → L → R → X). Outside at night, Hookshot onto the village rooftops and grapple Gold Skulltula #23 on the high wall overlooking Impa\'s House.',
        secretIds: ['hp-09', 'song-storms', 'gs-023'],
        requiredIds: ['era-adult', 'hookshot', 'song-time', 'ocarina', 'time-night'],
        unlocksRequirementIds: ['song-storms'],
      },
      {
        id: 'ch-08-step-06',
        title: 'Graveyard Cleanup: Sub-1:00 Ghost Rematch & Magic Bean Cliff Crate',
        regionId: 'graveyard',
        era: 'adult',
        kind: 'sweep',
        instructions:
          'Step back into Kakariko Graveyard: ride your grown Magic Bean leaf platform on the left cliff wall up to smash the wooden crate for Piece of Heart #19, then drop back into Dampé\'s grave and beat his ghost race in 1:00 or less (rolling along inside corners and Hookshotting the final torch!) for Piece of Heart #20.',
        secretIds: ['hp-13', 'hp-14'],
        requiredIds: ['era-adult', 'hookshot', 'magic-beans'],
      },
      {
        id: 'ch-08-step-07',
        title: 'Death Mountain Trail Dip: Bean Cliff Heart Piece & Storm Cow Grotto',
        regionId: 'death-mountain-trail',
        era: 'adult',
        kind: 'sweep',
        instructions:
          'Walk through Kakariko\'s north gate onto Death Mountain Trail: ride the Magic Bean leaf outside Dodongo\'s Cavern up to the rock arch for Piece of Heart #21, then climb to the ring of stones near Goron City and play the Song of Storms to open the hidden Death Mountain Cow Grotto.',
        secretIds: ['hp-18', 'cow-dmt'],
        requiredIds: ['era-adult', 'magic-beans', 'bombs', 'song-storms', 'song-epona'],
      },
    ],
  },
  {
    id: 'ch-09',
    number: 9,
    title: 'Sacred Forest Meadow, Forest Temple & Big Poe Hunt',
    subtitle: 'Minuet of Forest, Fairy Bow, Phantom Ganon, 10 Big Poes (Bottle #5) & Prelude of Light',
    era: 'adult',
    primaryRegionId: 'forest-temple',
    estimatedMinutes: 45,
    summary:
      'Learn the Minuet of Forest, conquer the Forest Temple for the Fairy Bow and Forest Medallion, hunt all 10 Hyrule Field Big Poes on Epona for Switch 2\'s 500-point Bottle #5, and learn the Prelude of Light to unlock Time Travel.',
    steps: [
      {
        id: 'ch-09-step-01',
        title: 'Kokiri Forest Night Skulltula',
        regionId: 'kokiri-forest',
        era: 'adult',
        kind: 'sweep',
        instructions:
          'Enter monster-overrun Kokiri Forest at night as Adult Link, stand before the House of Twins in the SE corner, Z/ZL-target Gold Skulltula #3 tucked between the two roof peaks, and Hookshot it.',
        secretIds: ['gs-003'],
        requiredIds: ['era-adult', 'time-night', 'hookshot'],
      },
      {
        id: 'ch-09-step-02',
        title: 'Lost Woods Night Bean Ride: Forest Stage High Ledge Skulltula',
        regionId: 'lost-woods',
        era: 'adult',
        kind: 'sweep',
        instructions:
          'Navigate into the Lost Woods at night (telling Mido Saria\'s Song when he blocks the Sacred Forest Meadow tunnel!), stop at the Forest Stage butterfly clearing, and ride your Magic Bean leaf platform up to the high ledge to slash Gold Skulltula #6.',
        secretIds: ['gs-006'],
        requiredIds: ['era-adult', 'magic-beans', 'time-night'],
      },
      {
        id: 'ch-09-step-03',
        title: 'Sacred Forest Meadow: Moblin Maze, Wall Skulltula & Minuet of Forest',
        regionId: 'sacred-forest-meadow',
        era: 'adult',
        kind: 'story',
        instructions:
          'Hookshot past the spear Moblins through the hedge maze (climbing the ladder at night to Hookshot Gold Skulltula #7 high on the east stone wall), defeat the club-pounding giant Moblin on the temple steps, and learn the Minuet of Forest (L → X → Y → A → Y → A) from Sheik.',
        secretIds: ['gs-007', 'song-minuet'],
        requiredIds: ['era-adult', 'hookshot', 'time-night'],
        unlocksRequirementIds: ['song-minuet'],
      },
      {
        id: 'ch-09-step-04',
        title: 'Forest Temple First Half: 3 Skulltulas & the Fairy Bow',
        regionId: 'forest-temple',
        era: 'adult',
        kind: 'dungeon',
        instructions:
          'Grapple the tree branch into the Forest Temple: (1) Climb/Hookshot the right-hand entrance vines for Gold Skulltula #70. (2) In the central 4-torch hall after the Poe cutscene, Hookshot Gold Skulltula #71 beside the north stairs. (3) Enter the NE courtyard upper balcony to Hookshot the island chest and Gold Skulltula #72, push the colored blocks up to the 2F gallery, and defeat the three Stalfos knights to claim the Fairy Bow!',
        proTip:
          'Stand between fallen Stalfos skeletons once you down the second knight so the first doesn\'t resurrect while you finish off the pair.',
        secretIds: ['gs-070', 'gs-071', 'gs-072', 'eq-bow'],
        requiredIds: ['era-adult', 'hookshot'],
        unlocksRequirementIds: ['bow'],
      },
      {
        id: 'ch-09-step-05',
        title: 'Twisted Corridors, 4 Poe Sisters & Final 2 Forest Skulltulas',
        regionId: 'forest-temple',
        era: 'adult',
        kind: 'dungeon',
        instructions:
          'Shoot the twisted-hallway eye switches with your new Fairy Bow to grab the Boss Key and reach the upper NW courtyard walkway, Hookshotting Gold Skulltula #73 behind the hearts pillar. Defeat Joelle, Beth, Amy (ice-block picture puzzle), and Meg (spin once and shoot the real Poe!) to restore all 4 flames, ride the elevator down to B2, and rotate the chamber walls until the niche holding Gold Skulltula #74 opens.',
        secretIds: ['gs-073', 'gs-074'],
        requiredIds: ['era-adult', 'hookshot', 'bow'],
        unlocksRequirementIds: ['tokens-50'],
      },
      {
        id: 'ch-09-step-06',
        title: 'Boss: Phantom Ganon & Forest Medallion',
        regionId: 'forest-temple',
        era: 'adult',
        kind: 'boss',
        instructions:
          'Ascend the B2 central staircase into the haunted gallery. Shoot Phantom Ganon with the Fairy Bow right as he emerges from the brighter, purple-vortex painting (ignoring the paler decoy!). In Phase 2, bat his magic orbs back with sword slashes and punish every stun with jump-slashes to earn Boss Heart Container #4 and the Forest Medallion—sprouting the Deku Tree Sprout and clearing Kokiri Forest!',
        secretIds: ['boss-hc-forest', 'medallion-forest'],
        requiredIds: ['era-adult', 'hookshot', 'bow'],
      },
      {
        id: 'ch-09-step-07',
        title: 'Hyrule Field Horseback Hunt: All 10 Big Poes',
        regionId: 'hyrule-field',
        era: 'adult',
        kind: 'switch2',
        instructions:
          'Summon Epona outside Kokiri Forest with your new Fairy Bow and 4 Empty Bottles ready! Ride a clockwise loop around Hyrule Field shooting all 10 fixed Big Poe spawns (2 arrows each while mounted, then hop off to bottle their purple flames): #1 West of Drawbridge Tree, #2 North Ranch T-Junction Sign, #3 Kakariko Stairs Wall, #4 East Ranch Boulder, #5 Kokiri Wall Bushes, #6 SE Wetland Grove, #7 Lake Hylia North Plain, #8 Western River V-Fork, #9 Gerudo Red Canyon Overhang, and #10 NW Gerudo Lone Tree.',
        proTip:
          'Selling your first 5 Big Poes (500 pts) at the Castle Town Guardhouse already awards Empty Bottle #5 in the Switch 2 Remake (cut in half from N64\'s 1,000 pts!), and turning in the remaining 5 (1,000 pts) nets a bonus 200-Rupee Gold Rupee!',
        secretIds: [
          'bp-01',
          'bp-02',
          'bp-03',
          'bp-04',
          'bp-05',
          'bp-06',
          'bp-07',
          'bp-08',
          'bp-09',
          'bp-10',
        ],
        requiredIds: ['era-adult', 'epona', 'bow', 'bottle'],
      },
      {
        id: 'ch-09-step-08',
        title: '500-Point Empty Bottle #5 & Prelude of Light (Unlock Time Travel)',
        regionId: 'market',
        era: 'adult',
        kind: 'story',
        instructions:
          'Sell your bottled Big Poes to the cloaked Poe Collector inside the ruined Castle Town Guardhouse to claim Empty Bottle #5 (all 5 Bottles complete!) plus 700 total Rupees. Walk north into the Temple of Time so Sheik teaches you the Prelude of Light (X → A → X → A → Y → X), unlocking Child ↔ Adult Time Travel at the Pedestal of Time!',
        secretIds: ['bottle-05', 'song-prelude'],
        requiredIds: ['era-adult', 'epona', 'bow', 'bottle'],
        unlocksRequirementIds: ['song-prelude', 'time-travel'],
      },
    ],
  },
  {
    id: 'ch-10',
    number: 10,
    title: 'Master Sword Time-Travel: Cross-Era Puzzles & Bottom of the Well',
    subtitle: 'Switch 2 Fairy\'s Thoughts, Lens of Truth, 40 Deku Nuts, Frog Choir & Scarecrow\'s Song',
    era: 'cross-era',
    primaryRegionId: 'bottom-of-the-well',
    estimatedMinutes: 40,
    summary:
      'Use your newly unlocked Pedestal of Time to solve all three brand-new Switch 2 Hyrule Field cross-era puzzles, drain the Kakariko Well for the Lens of Truth, finish the Lost Woods 40-Nut upgrade & Zora\'s River Frogs, and activate Pierre\'s Scarecrow\'s Song.',
    steps: [
      {
        id: 'ch-10-step-01',
        title: 'Adult Phase: Inspect Both Hyrule Field \'Fairy\'s Thoughts\' Clues',
        regionId: 'hyrule-field',
        era: 'adult',
        kind: 'switch2',
        instructions:
          'Before returning the Master Sword, ride Epona into Hyrule Field as Adult Link to prime Switch 2\'s two new cross-era Heart Pieces: (1) Inspect the note carved on the lonely tree near the northern Castle Town moat to learn the password "Sell somethin\', will ya?". (2) Ride west to the red canyon overhang before Gerudo Valley, open/inspect the looted chest, and read the glowing Fairy\'s Thoughts wall message promising to unlock it in the past. Warp back via Prelude of Light and place the Master Sword in the pedestal to become Child Link!',
        proTip:
          'Both old Stone of Agony grotto Heart Pieces in Hyrule Field were replaced by these two cross-era Fairy\'s Thoughts puzzles in the Switch 2 Remake.',
        secretIds: [],
        requiredIds: ['era-adult', 'epona', 'song-prelude', 'time-travel'],
      },
      {
        id: 'ch-10-step-02',
        title: 'Lost Woods Forest Stage: Mask of Truth 40-Nut Upgrade',
        regionId: 'lost-woods',
        era: 'child',
        kind: 'sweep',
        instructions:
          'Warp via Minuet of Forest (or walk from Kokiri Forest) one screen back into the Lost Woods Forest Stage butterfly clearing as Child Link, drop into the hidden grass grotto wearing the Mask of Truth, and receive Deku Nut Upgrade #2 (40)!',
        proTip:
          'Switch 2 patched the infamous 1998 Poacher\'s Saw glitch—so this 40-Nut Forest Stage upgrade never permanently breaks anymore, even later in the game!',
        secretIds: ['cap-nuts-40'],
        requiredIds: ['era-child', 'mask-of-truth'],
      },
      {
        id: 'ch-10-step-03',
        title: 'Kakariko Owl Scene (Unlock Hall of Fallen Foes) & Drain the Well',
        regionId: 'kakariko-village',
        era: 'child',
        kind: 'switch2',
        instructions:
          'Enter Kakariko Village as Child Link to view Kaepora Gaebora\'s cutscene—this activates the green-glowing dream beds in Link\'s House, Kakariko, and Lake Hylia leading to Switch 2\'s new Hall of Fallen Foes! Next, step inside the Kakariko Windmill and play the Song of Storms (L → R → X → L → R → X) to drain the village well.',
        secretIds: [],
        requiredIds: ['era-child', 'time-travel', 'song-storms'],
      },
      {
        id: 'ch-10-step-04',
        title: 'Bottom of the Well: Lens of Truth & All 3 Gold Skulltulas',
        regionId: 'bottom-of-the-well',
        era: 'child',
        kind: 'dungeon',
        instructions:
          'Climb down the empty well and walk straight through the illusory northern skull wall! Play Zelda\'s Lullaby on the Triforce tile at the top of the inner ring to drain the water trench, crawl into the front pit, and defeat Dead Hand for the Lens of Truth. Before exiting, use your new Lens and Small Keys from the side coffins to Boomerang all 3 Gold Skulltulas: #88 (West Inner Door), #89 (East Inner Door), and #90 (NE Like-Like Cage).',
        proTip:
          'Let Dead Hand\'s Pale Hands grab you once to summon Dead Hand immediately, mash out, and crouch-stab his lowered head with a Deku Stick!',
        secretIds: ['eq-lens-of-truth', 'gs-088', 'gs-089', 'gs-090'],
        requiredIds: ['era-child', 'song-storms', 'song-lullaby', 'boomerang', 'magic-meter'],
        unlocksRequirementIds: ['lens-of-truth'],
      },
      {
        id: 'ch-10-step-05',
        title: 'Market Night: Lens Treasure Chest Shop Prize',
        regionId: 'market',
        era: 'child',
        kind: 'quest',
        instructions:
          'Head to Castle Town Market at night as Child Link, pay 10 Rupees at the Treasure Chest Shop, and flick the Lens of Truth on/off in each of the 5 rooms to spot every Small Key chest and claim Piece of Heart #22 from the final room.',
        proTip:
          'Switch 2 fixed old N64 camera-clipping exploits here, making the Lens of Truth the intended 10-Rupee one-shot clear.',
        secretIds: ['hp-04'],
        requiredIds: ['era-child', 'time-night', 'lens-of-truth', 'magic-meter'],
      },
      {
        id: 'ch-10-step-06',
        title: 'Hyrule Castle Moat: Song of Storms Grotto Skulltula',
        regionId: 'hyrule-castle',
        era: 'child',
        kind: 'sweep',
        instructions:
          'Walk north to the lone tree beside the outer corner of the Hyrule Castle moat, play the Song of Storms to open the hidden grotto, bomb the fragile mud wall inside, and Boomerang Gold Skulltula #16.',
        secretIds: ['gs-016'],
        requiredIds: ['era-child', 'song-storms', 'bombs', 'boomerang'],
      },
      {
        id: 'ch-10-step-07',
        title: 'Child Phase: Claim Both Switch 2 Hyrule Field Heart Pieces & Seed SE Grotto',
        regionId: 'hyrule-field',
        era: 'cross-era',
        kind: 'switch2',
        instructions:
          'Sweep Hyrule Field as Child Link: (1) Bomb the cracked rocks on the grass bank east of the Castle Town drawbridge moat, defeat the Business Scrub inside, give the Adult-era password "Sell somethin\', will ya?", and buy Piece of Heart #23 for 100 Rupees! (2) Run to the western red canyon overhang and open the now-unlocked Time-Locked Chest for Piece of Heart #24! (3) Bomb the cracked stone in the SE Peahat Wetland, read the fairy wall message, and slay the ordinary Skullwalltula inside so a Gold Skulltula spawns in the future!',
        secretIds: ['hp-05', 'hp-06'],
        requiredIds: ['era-child', 'era-adult', 'time-travel', 'bombs', 'rupees-100'],
      },
      {
        id: 'ch-10-step-08',
        title: 'Zora\'s River Frog Choir (Both Heart Pieces) & Bonooru Child Tune',
        regionId: 'zoras-river',
        era: 'child',
        kind: 'quest',
        instructions:
          'Stop at the submerged wooden log halfway up Zora\'s River as Child Link: play the Song of Storms for Piece of Heart #25, then play all 5 remaining Child songs (Lullaby, Epona\'s, Saria\'s, Sun\'s, and Song of Time) to grow all 5 frogs and beat their fly-eating minigame for Piece of Heart #26! Afterward, step into Lake Hylia and play an easy 8-note melody (e.g. Y, X, Y, X, Y, X, Y, X) to Bonooru the lower scarecrow.',
        secretIds: ['hp-24', 'hp-25'],
        requiredIds: [
          'era-child',
          'ocarina',
          'song-lullaby',
          'song-epona',
          'song-saria',
          'song-sun',
          'song-time',
          'song-storms',
        ],
      },
      {
        id: 'ch-10-step-09',
        title: 'Adult Return: SE Wetland Cross-Era Skulltula',
        regionId: 'hyrule-field',
        era: 'cross-era',
        kind: 'switch2',
        instructions:
          'Warp via Prelude of Light to the Temple of Time, pull the Master Sword to return to Adult Link, and ride Epona to the SE Peahat Wetland grotto you seeded as a child—Hookshot the newly evolved Gold Skulltula #10 inside!',
        secretIds: ['gs-010'],
        requiredIds: ['era-child', 'bombs', 'time-travel', 'era-adult', 'hookshot'],
      },
      {
        id: 'ch-10-step-10',
        title: 'Lake Hylia: Lab Rooftop Heart Piece & Activate Scarecrow\'s Song',
        regionId: 'lake-hylia',
        era: 'cross-era',
        kind: 'quest',
        instructions:
          'Continue south from SE Hyrule Field into Lake Hylia as Adult Link: ride your grown Magic Bean leaf up to the Lakeside Laboratory roof and climb the watchtower ladder for Piece of Heart #27, then play your exact 8-note melody back to Bonooru to permanently activate the Scarecrow\'s Song right before the Fire Temple!',
        proTip:
          'Registering Scarecrow\'s Song right now lets you clear 100% of Dodongo\'s Cavern AND the Fire Temple in Chapter 11 with zero return trips!',
        secretIds: ['hp-30', 'song-scarecrow'],
        requiredIds: ['era-child', 'ocarina', 'era-adult', 'magic-beans'],
        unlocksRequirementIds: ['song-scarecrow'],
      },
    ],
  },
  {
    id: 'ch-11',
    number: 11,
    title: 'Goron Tunic, Bolero of Fire & Fire Temple',
    subtitle: 'Goron Tunic, Cross-Era Crater Bean #9, Megaton Hammer, Double Magic & Volvagia',
    era: 'cross-era',
    primaryRegionId: 'fire-temple',
    estimatedMinutes: 45,
    summary:
      'Claim the Goron Tunic, learn Bolero of Fire to plant Cross-Era Magic Bean #9, clear all 5 Fire Temple Gold Skulltulas in a single pass with Scarecrow\'s Song and Megaton Hammer, unlock Double Magic, and finish Death Mountain\'s Adult Skulltulas.',
    steps: [
      {
        id: 'ch-11-step-01',
        title: 'Goron City: Free Goron Tunic & Suspended Platform Skulltula',
        regionId: 'goron-city',
        era: 'adult',
        kind: 'story',
        instructions:
          'Enter Goron City as Adult Link: detonate a Bomb (or shoot an arrow) ahead of rolling Goron Link on 2F and talk to him to receive the heat-proof Goron Tunic for free! Before heading into Darunia\'s chamber, climb to the top floor, cross the rope bridges to the central suspended stone platform, and Hookshot Gold Skulltula #31 behind the stone arch.',
        secretIds: ['eq-goron-tunic', 'gs-031'],
        requiredIds: ['era-adult', 'bombs', 'hookshot'],
        unlocksRequirementIds: ['goron-tunic'],
      },
      {
        id: 'ch-11-step-02',
        title: 'Bolero of Fire, Cross-Era Crater Bean #9, Soil Skulltula & Spire Heart Piece',
        regionId: 'death-mountain-crater',
        era: 'cross-era',
        kind: 'quest',
        instructions:
          'Equip the Goron Tunic, pull the statue inside Darunia\'s room to enter Death Mountain Crater, and Hookshot across the broken bridge so Sheik teaches you the Bolero of Fire (R → L → R → L → A → R → A → R). Immediately warp via Prelude of Light → Pedestal → Child Link → Bolero of Fire: drop Bottled Bugs into the warp-pad soil for Gold Skulltula #33 AND plant Magic Bean #9 (90 Rupees) before the heat timer expires! Warp back to Adult Link via Prelude → Master Sword → Bolero of Fire and ride the grown leaf straight up the central volcanic spire for Piece of Heart #28!',
        proTip:
          'Knocking out this quick 2-minute Prelude ↔ Bolero hop right before entering the Fire Temple means you never have to backtrack to the Crater warp pad again!',
        secretIds: ['song-bolero', 'gs-033', 'bean-09', 'hp-20'],
        requiredIds: [
          'era-adult',
          'goron-tunic',
          'hookshot',
          'time-travel',
          'era-child',
          'bottle',
          'bottled-bug',
          'magic-beans',
        ],
        unlocksRequirementIds: ['song-bolero'],
      },
      {
        id: 'ch-11-step-03',
        title: 'Fire Temple Ascent: Lava Room, Boulder Maze & 2 Scarecrow Skulltulas',
        regionId: 'fire-temple',
        era: 'adult',
        kind: 'dungeon',
        instructions:
          'Descend the steps behind the Bolero pad into the Fire Temple: (1) Across the 1F lava bridge room, play the Song of Time to raise the blue block and Hookshot Gold Skulltula #75 inside the Tile room. (2) On the 3F rolling-boulder maze floor, bomb the hollow eastern stone wall for Gold Skulltula #76. (3) From the upper 3F boulder ledge, play your Scarecrow\'s Song to grapple Pierre onto the hidden 4F elevator and claim BOTH Gold Skulltulas #77 and #78 (+ 200 Rupees) on 5F!',
        secretIds: ['gs-075', 'gs-076', 'gs-077', 'gs-078'],
        requiredIds: ['era-adult', 'goron-tunic', 'song-time', 'bombs', 'song-scarecrow', 'hookshot'],
      },
      {
        id: 'ch-11-step-04',
        title: 'Fire Dancer, Megaton Hammer & 1F Totem Skulltula',
        regionId: 'fire-temple',
        era: 'adult',
        kind: 'dungeon',
        instructions:
          'Defeat Flare Dancer, ascend to the 5F ring switch, and sprint the narrow curved rim around the lava pit to open the Megaton Hammer chest! Smash down through the floor pedestals back to the 1F entrance staircase: hammer the stone totem blocking the left door to free the Goron (Boss Key) and clear the side rooms behind the totem for Gold Skulltula #79 (all 5/5 Fire Temple Skulltulas done!).',
        secretIds: ['eq-megaton-hammer', 'gs-079'],
        requiredIds: ['era-adult', 'goron-tunic', 'hookshot'],
        unlocksRequirementIds: ['megaton-hammer'],
      },
      {
        id: 'ch-11-step-05',
        title: 'Boss: Volvagia & Fire Medallion',
        regionId: 'fire-temple',
        era: 'adult',
        kind: 'boss',
        instructions:
          'Drop the central pillar into the 1F lava hall and enter Volvagia\'s chamber. Watch the glowing lava pits, slam Volvagia\'s head with the Megaton Hammer the moment she pokes out, follow immediately with a jump-slash, and hang over the outer platform ledge whenever she rains boulders from the ceiling to claim Boss Heart Container #5 and the Fire Medallion!',
        secretIds: ['boss-hc-fire', 'medallion-fire'],
        requiredIds: ['era-adult', 'goron-tunic', 'megaton-hammer'],
      },
      {
        id: 'ch-11-step-06',
        title: 'Crater Great Fairy #3: Double Magic Meter',
        regionId: 'death-mountain-crater',
        era: 'adult',
        kind: 'switch2',
        instructions:
          'Warp back to Death Mountain Crater via Bolero of Fire (or re-enter via Goron City\'s west bridge), smash the two red boulders sealing the western cavern with the Megaton Hammer, play Zelda\'s Lullaby, and offer 200 Rupees to Great Fairy #3 to permanently double your Magic Meter!',
        secretIds: ['gf-04'],
        requiredIds: ['era-adult', 'goron-tunic', 'megaton-hammer', 'song-lullaby', 'rupees-100'],
      },
      {
        id: 'ch-11-step-07',
        title: 'Death Mountain Trail Night Hammer Boulders',
        regionId: 'death-mountain-trail',
        era: 'adult',
        kind: 'sweep',
        instructions:
          'Step out onto Death Mountain Trail at night with your new Megaton Hammer: smash the red boulder on the upper volcanic rockfall path for Gold Skulltula #29, then drop to the ledge above Dodongo\'s Cavern and smash the red boulder there for Gold Skulltula #28.',
        secretIds: ['gs-028', 'gs-029'],
        requiredIds: ['era-adult', 'time-night', 'megaton-hammer'],
      },
      {
        id: 'ch-11-step-08',
        title: 'Dodongo\'s Cavern 2-Minute Adult Cleanup (Final 2 Skulltulas)',
        regionId: 'dodongos-cavern',
        era: 'adult',
        kind: 'sweep',
        instructions:
          'Pop straight inside Dodongo\'s Cavern right below you as Adult Link: in the 1F east Baby Dodongo corridor, play Scarecrow\'s Song to Hookshot Pierre into the 2F vine alcove for Gold Skulltula #62, then step into the 1F west rising-fire-pillar room and Hookshot straight into the high Armos alcove for Gold Skulltula #65—completing Dodongo\'s Cavern and all of Death Mountain 100%!',
        secretIds: ['gs-062', 'gs-065'],
        requiredIds: ['era-adult', 'song-scarecrow', 'hookshot'],
      },
    ],
  },
  {
    id: 'ch-12',
    number: 12,
    title: 'Ice Cavern, Zora Tunic & Water Temple',
    subtitle: 'Farore\'s Wind, Iron Boots, Serenade of Water, Longshot, Morpha & Unfrozen Zora\'s Domain',
    era: 'adult',
    primaryRegionId: 'water-temple',
    estimatedMinutes: 45,
    summary:
      'Brave frozen Zora\'s Fountain for Farore\'s Wind, the Ice Cavern\'s Iron Boots and Blue Fire, and two Fountain Heart Pieces, then clear the Water Temple for the Longshot—unfreezing all of Zora\'s Domain in the Switch 2 Remake!',
    steps: [
      {
        id: 'ch-12-step-01',
        title: 'Zora\'s Fountain: Floating Iceberg Heart Piece & Farore\'s Wind Fairy',
        regionId: 'zoras-fountain',
        era: 'adult',
        kind: 'switch2',
        instructions:
          'Ascend Zora\'s River through frozen Zora\'s Domain into Zora\'s Fountain. Hop across the spinning icebergs on the water to grab Piece of Heart #29, then detour to the SE island, bomb the gray boulder, play Zelda\'s Lullaby, and pay 100 Rupees to Great Fairy #4 for Farore\'s Wind.',
        secretIds: ['hp-27', 'gf-03'],
        requiredIds: ['era-adult', 'bombs', 'magic-meter', 'song-lullaby', 'rupees-100'],
      },
      {
        id: 'ch-12-step-02',
        title: 'Ice Cavern: All 3 Skulltulas, Blue Fire, Iron Boots & Serenade of Water',
        regionId: 'ice-cavern',
        era: 'adult',
        kind: 'dungeon',
        instructions:
          'Hop from the icebergs into the Ice Cavern: (1) Hookshot Gold Skulltula #80 among the east icicles in the spinning-blade room. (2) Melt the east red-ice wall to bottle 2–3 jars of free Blue Fire and Hookshot Gold Skulltula #81 (remember Switch 2 moved the old Red Ice Heart Piece to Death Mountain Crater!). (3) Hookshot Gold Skulltula #82 on the west wall of the ice-block puzzle room, defeat the White Wolfos for the Iron Boots, and learn the Serenade of Water (L → R → A → A → Y) from Sheik!',
        proTip:
          'Switch 2 maps the Iron Boots as an instant quick-equip toggle—no menu pausing required inside the Water Temple!',
        secretIds: ['gs-080', 'gs-081', 'gs-082', 'eq-iron-boots', 'song-serenade'],
        requiredIds: ['era-adult', 'hookshot', 'bottle'],
        unlocksRequirementIds: ['blue-fire', 'iron-boots', 'song-serenade'],
      },
      {
        id: 'ch-12-step-03',
        title: 'Lakebed of Zora\'s Fountain Heart Piece',
        regionId: 'zoras-fountain',
        era: 'adult',
        kind: 'sweep',
        instructions:
          'Step right outside the Ice Cavern, toggle on your new Iron Boots, and sink to the deepest center floor of Zora\'s Fountain to walk over Piece of Heart #30.',
        secretIds: ['hp-28'],
        requiredIds: ['era-adult', 'iron-boots'],
      },
      {
        id: 'ch-12-step-04',
        title: 'Zora\'s Domain: Thaw King Zora for the Zora Tunic',
        regionId: 'zoras-domain',
        era: 'adult',
        kind: 'story',
        instructions:
          'Walk back into frozen Zora\'s Domain and pour bottled Blue Fire onto the red ice encasing King Zora to receive the Zora Tunic for free.',
        secretIds: ['eq-zora-tunic'],
        requiredIds: ['era-adult', 'bottle', 'blue-fire'],
        unlocksRequirementIds: ['zora-tunic'],
      },
      {
        id: 'ch-12-step-05',
        title: 'Water Temple First Half: B1 South Grate Skulltula & Dark Link\'s Longshot',
        regionId: 'water-temple',
        era: 'adult',
        kind: 'dungeon',
        instructions:
          'Warp to Lake Hylia via Serenade of Water, equip Zora Tunic + Iron Boots, and Hookshot into the Water Temple. Follow Princess Ruto up the 1F east tower to drain the temple: bomb the cracked floor in the 1F south torch corridor and use Din\'s Fire / Spin Attack behind the gate for Gold Skulltula #83. Raise water to 2F (grabbing the hidden Small Key under the floating central-tower block!) and then 3F, cross the 3F west waterfalls, and defeat Dark Link (using Din\'s Fire or Megaton Hammer) to claim the Longshot!',
        proTip:
          'Never miss the Small Key underneath the rising stone block inside the 1F central tower right after playing Zelda\'s Lullaby at the 2F plaque!',
        secretIds: ['gs-083', 'eq-longshot'],
        requiredIds: ['era-adult', 'iron-boots', 'zora-tunic', 'hookshot', 'bombs', 'dins-fire'],
        unlocksRequirementIds: ['longshot'],
      },
      {
        id: 'ch-12-step-06',
        title: 'Water Temple Second Half: Final 4 Longshot Skulltulas & Boss Key',
        regionId: 'water-temple',
        era: 'adult',
        kind: 'dungeon',
        instructions:
          'Sweep the remaining 4 Water Temple Gold Skulltulas with your Longshot\'s doubled range: (1) Behind Dark Link\'s chest, play Song of Time and sink in the whirlpool river to Longshot #86 on the wall grate. (2) Inside the central tower at mid-water, Longshot #84 near the 3F ceiling. (3) In the 2F moving-platform chasm room, Longshot #85 high on the far right wall. (4) Drain to 1F, push through the northern boulder channel, and Longshot #87 on the falling-boulder waterfall en route to the Boss Key.',
        secretIds: ['gs-086', 'gs-084', 'gs-085', 'gs-087'],
        requiredIds: ['era-adult', 'iron-boots', 'zora-tunic', 'longshot', 'song-time'],
      },
      {
        id: 'ch-12-step-07',
        title: 'Boss: Morpha, Water Medallion & Zora\'s Domain Unfrozen!',
        regionId: 'water-temple',
        era: 'adult',
        kind: 'boss',
        instructions:
          'Longshot across the spike slope into Morpha\'s chamber. Stand in a corner of the outer walkway, yank Morpha\'s red nucleus out of its water tentacle with the Longshot, and trap it against the corner wall with repeated slashes for Boss Heart Container #6 and the Water Medallion!',
        proTip:
          'LANDMARK SWITCH 2 REMAKE CHANGE: Clearing the Water Temple doesn\'t just refill Lake Hylia—it completely UNFREEZES Zora\'s Domain, restoring every Zora NPC and reopening the Zora\'s Domain ↔ Lake Hylia underwater shortcut for Chapter 13\'s Biggoron Sword quest!',
        secretIds: ['boss-hc-water', 'medallion-water'],
        requiredIds: ['era-adult', 'longshot'],
        unlocksRequirementIds: ['zora-thawed'],
      },
    ],
  },
  {
    id: 'ch-13',
    number: 13,
    title: 'Thawed Zora\'s Domain, Biggoron\'s Sword & Lake Hylia Adult Sweep',
    subtitle: 'Fire Arrows, Golden Scale, Lab Dive, Kakariko Rooftop & 25-Second Biggoron Quest',
    era: 'adult',
    primaryRegionId: 'death-mountain-trail',
    estimatedMinutes: 40,
    summary:
      'Sweep refilled Lake Hylia for Fire Arrows and the Golden Scale, then complete all 12 steps of the Biggoron\'s Sword trading sequence—exploiting Switch 2\'s newly unfrozen Zora\'s Domain ↔ Lake Hylia underwater shortcut!',
    steps: [
      {
        id: 'ch-13-step-01',
        title: 'Refilled Lake Hylia: Dawn Fire Arrows, Golden Scale & Lab Pool Sweep',
        regionId: 'lake-hylia',
        era: 'adult',
        kind: 'sweep',
        instructions:
          'Standing on the Water Temple warp island as Lake Hylia refills at dawn, step onto the stone plaque and shoot an arrow straight into the rising sun—swim to the twin-pillar island to claim the Fire Arrows! Next, visit the Fishing Pond as Adult Link and reel in a 15+ pound lunker for the Golden Scale. Finally, enter the Lakeside Laboratory: dive naturally (no Iron Boots!) to touch the 8-meter floor grates for Piece of Heart #31, then put on Iron Boots, smash the underwater wooden crate, and Hookshot Gold Skulltula #45.',
        proTip:
          'Look along the Fishing Pond\'s mossy logs and stream inlet if you want the hidden Sinking Lure—it hooks the 20-pound pond monster almost instantly!',
        secretIds: ['eq-fire-arrows', 'eq-golden-scale', 'hp-31', 'gs-045'],
        requiredIds: ['era-adult', 'bow', 'longshot', 'iron-boots', 'hookshot', 'rupees-100'],
        unlocksRequirementIds: ['fire-arrows', 'golden-scale'],
      },
      {
        id: 'ch-13-step-02',
        title: 'Kakariko Rooftop Man & Biggoron Steps #1–#3 (Pocket Egg → Cojiro)',
        regionId: 'kakariko-village',
        era: 'adult',
        kind: 'quest',
        instructions:
          'Travel to Kakariko Village: climb the wooden watchtower and Hookshot onto the Potion Shop roof to talk to the rooftop man for Piece of Heart #32. Kick off the Biggoron trading chain right below: (1) Talk to Anju by the Graveyard gate for the Pocket Egg, (2) play Sun\'s Song to hatch the Pocket Cucco and wake Talon inside the lower house, and (3) show Anju to receive her blue Cucco, Cojiro!',
        secretIds: ['hp-08', 'biggoron-step-1', 'biggoron-step-2', 'biggoron-step-3'],
        requiredIds: ['era-adult', 'hookshot', 'song-sun'],
      },
      {
        id: 'ch-13-step-03',
        title: 'Biggoron Step #4: Wake Grog in Lost Woods (4:00 Odd Mushroom)',
        regionId: 'lost-woods',
        era: 'adult',
        kind: 'quest',
        instructions:
          'Warp via Minuet of Forest (or ride to Kokiri Forest), enter the Lost Woods, turn Left from the Kokiri entrance, and crow Cojiro beside gloomy Grog sitting against the stump. He hands you the Odd Mushroom on a 4:00 timer—do NOT play any warp songs while a timer is active!',
        secretIds: ['biggoron-step-4'],
        requiredIds: ['era-adult'],
      },
      {
        id: 'ch-13-step-04',
        title: 'Biggoron Step #5: Deliver Odd Mushroom to Granny in Kakariko',
        regionId: 'kakariko-village',
        era: 'adult',
        kind: 'quest',
        instructions:
          'Sprint straight through the Lost Woods → Goron City → Death Mountain Trail shortcut (or gallop Epona across Hyrule Field) into Kakariko Village, walk through the main Potion Shop\'s back exit (or Hookshot over the roof), and hand the Odd Mushroom to Granny for the Odd Poultice.',
        secretIds: ['biggoron-step-5'],
        requiredIds: ['era-adult', 'hookshot'],
      },
      {
        id: 'ch-13-step-05',
        title: 'Biggoron Step #6: Trade Odd Poultice for Fado\'s Poacher\'s Saw',
        regionId: 'lost-woods',
        era: 'adult',
        kind: 'quest',
        instructions:
          'Return to Grog\'s stump (Left from the Kokiri entrance into the Lost Woods) and hand the Odd Poultice to the Kokiri girl Fado in exchange for the Poacher\'s Saw.',
        proTip:
          'You already claimed the 40-Nut Forest Stage upgrade in Chapter 10, and Switch 2 fixed N64\'s Poacher\'s Saw flag bug anyway—zero worries!',
        secretIds: ['biggoron-step-6'],
        requiredIds: ['era-adult', 'bow'],
      },
      {
        id: 'ch-13-step-06',
        title: 'Biggoron Step #7: Mutoh\'s Broken Goron\'s Sword in Gerudo Valley',
        regionId: 'gerudo-valley',
        era: 'adult',
        kind: 'quest',
        instructions:
          'Gallop Epona across Hyrule Field into Gerudo Valley, jump the broken wooden bridge (or grapple the carpenter\'s post with your Longshot), and trade the Poacher\'s Saw to boss carpenter Mutoh outside the tent for the Broken Goron\'s Sword.',
        secretIds: ['biggoron-step-7'],
        requiredIds: ['era-adult', 'epona'],
      },
      {
        id: 'ch-13-step-07',
        title: 'Biggoron Step #8: Summit Biggoron\'s Prescription',
        regionId: 'death-mountain-trail',
        era: 'adult',
        kind: 'quest',
        instructions:
          'Warp via Bolero of Fire (since there is no active timer!) and exit the Crater summit onto Death Mountain Trail. Show the Broken Goron\'s Sword to giant Biggoron outside the Great Fairy Fountain to receive his Prescription.',
        secretIds: ['biggoron-step-8'],
        requiredIds: ['era-adult', 'epona'],
      },
      {
        id: 'ch-13-step-08',
        title: 'Thawed Zora\'s Domain: Waterfall Skulltula & Biggoron Step #9 (Eyeball Frog)',
        regionId: 'zoras-domain',
        era: 'adult',
        kind: 'switch2',
        instructions:
          'Visit lively, newly unfrozen Zora\'s Domain! At night, look left from the top of the restored waterfall and Hookshot Gold Skulltula #38. Then show the Prescription to King Zora—he hands you the Eyeball Frog on a strict 2:30 timer (NO warp songs!).',
        secretIds: ['gs-038', 'biggoron-step-9'],
        requiredIds: ['era-adult', 'zora-thawed', 'time-night', 'hookshot'],
      },
      {
        id: 'ch-13-step-09',
        title: 'Switch 2 25-Second Dive Shortcut & Biggoron Step #10 (Eye Drops)',
        regionId: 'lake-hylia',
        era: 'adult',
        kind: 'switch2',
        instructions:
          'SWITCH 2 GAME-CHANGER: Instead of sprinting down Zora\'s River and across Hyrule Field on Epona, jump off King Zora\'s throne platform and dive straight through the reopened Zora\'s Domain → Lake Hylia underwater tunnel! You\'ll surface Steps away from the Lakeside Laboratory with 2:00+ to spare—hand the Eyeball Frog to the Professor to start the 3:30 World\'s Finest Eye Drops timer!',
        proTip:
          'In N64 and 3DS, Adult Zora\'s Domain stayed frozen solid so this tunnel remained blocked behind ice—Switch 2\'s post-Water Temple thaw turns the hardest timed run in OoT into a breezy 25-second swim!',
        secretIds: ['biggoron-step-10'],
        requiredIds: ['era-adult', 'zora-thawed'],
      },
      {
        id: 'ch-13-step-10',
        title: 'Biggoron Steps #11–#12: Claim Check & Unbreakable Biggoron\'s Sword!',
        regionId: 'death-mountain-trail',
        era: 'adult',
        kind: 'quest',
        instructions:
          'Without touching warp songs, either swim Lake Hylia → thawed Zora\'s Domain → Lost Woods → Goron City → Crater/Trail OR mount Epona outside Lake Hylia and gallop through Kakariko up Death Mountain Trail to hand Biggoron the Eye Drops for the Claim Check! Play the Sun\'s Song 6 times (3 full days) right in front of him and present the Claim Check to wield the unbreakable, 2x-damage Biggoron\'s Sword!',
        secretIds: ['biggoron-step-11', 'biggoron-step-12', 'eq-biggoron-sword'],
        requiredIds: ['era-adult', 'zora-thawed', 'epona', 'blue-fire', 'song-sun'],
      },
    ],
  },
  {
    id: 'ch-14',
    number: 14,
    title: 'Nocturne of Shadow & Shadow Temple',
    subtitle: 'Nocturne Cutscene, 40-Arrow Quiver, Hover Boots, 5 Skulltulas & Bongo Bongo',
    era: 'adult',
    primaryRegionId: 'shadow-temple',
    estimatedMinutes: 40,
    summary:
      'Trigger the Nocturne of Shadow in Kakariko Village, win the 40-Arrow Quiver, and pierce the illusions of the Shadow Temple with the Lens of Truth and Hover Boots to defeat Bongo Bongo.',
    steps: [
      {
        id: 'ch-14-step-01',
        title: 'Kakariko Village: Nocturne of Shadow & 40-Arrow Shooting Gallery',
        regionId: 'kakariko-village',
        era: 'adult',
        kind: 'story',
        instructions:
          'Enter Kakariko Village holding the Forest, Fire, and Water Medallions to witness Bongo Bongo\'s escape from the well and learn the Nocturne of Shadow (Y → A → A → L → Y → A → R) from Sheik. Before warping up to the Graveyard cliff, step into the completed Kakariko Shooting Gallery during the day and score 10/10 Rupees (using Switch 2 gyro aiming) for the Bigger Quiver (40).',
        secretIds: ['song-nocturne', 'cap-quiver-40'],
        requiredIds: ['era-adult', 'bow', 'megaton-hammer', 'longshot', 'rupees-100'],
        unlocksRequirementIds: ['song-nocturne'],
      },
      {
        id: 'ch-14-step-02',
        title: 'Shadow Temple Entry, Dead Hand Rematch & Hover Boots',
        regionId: 'shadow-temple',
        era: 'adult',
        kind: 'dungeon',
        instructions:
          'Play the Nocturne of Shadow, stand on the stone pedestal inside the Graveyard torch chamber, and cast Din\'s Fire (with your Double Magic Meter!) to ignite all 24 torches at once. Hookshot into the Shadow Temple, use the Lens of Truth to rotate the B1 skull pointer toward the genuine skull ("he who speaks the truth"), navigate the illusory B1 maze, and defeat Adult Dead Hand with Biggoron\'s Sword to claim the Hover Boots!',
        secretIds: ['eq-hover-boots'],
        requiredIds: ['era-adult', 'song-nocturne', 'dins-fire', 'magic-meter', 'lens-of-truth', 'hookshot'],
        unlocksRequirementIds: ['hover-boots'],
      },
      {
        id: 'ch-14-step-03',
        title: 'B2–B3 Scythe Trap, Falling Spikes & Flaming Skull Pot Skulltulas',
        regionId: 'shadow-temple',
        era: 'adult',
        kind: 'dungeon',
        instructions:
          'Bomb the B2 Beamos and float across the chasm with your Hover Boots: (1) Clear the B2 invisible spinning-scythe room to unlock the cell holding Gold Skulltula #91. (2) Pass the B3 guillotines and invisible spikes (using Lens of Truth) into the falling-spike ceiling room, using Iron/Hover Boots and Hookshot to grab Gold Skulltula #92 inside the left cell. (3) In the side room with the single flaming skull pot, toss a Bomb into the pot for a Small Key and Hookshot Gold Skulltula #93 behind it.',
        secretIds: ['gs-091', 'gs-092', 'gs-093'],
        requiredIds: ['era-adult', 'lens-of-truth', 'hover-boots', 'hookshot', 'bombs'],
      },
      {
        id: 'ch-14-step-04',
        title: 'B4 Phantom Ship Scarecrow Ledge & Triple Skulls Skulltulas',
        regionId: 'shadow-temple',
        era: 'adult',
        kind: 'dungeon',
        instructions:
          'Pull the block under the B3 ladder to reach the B4 Phantom Ship dock. BEFORE boarding, play your Scarecrow\'s Song on the dock and Longshot Pierre on the high left ledge for Gold Skulltula #94! Play Zelda\'s Lullaby on the deck to sail across, leap off before the ship sinks, clear the invisible-wall maze for the Boss Key, shoot a Fire Arrow at the Bomb Flowers across the chasm to topple the bird statue bridge, and Longshot Gold Skulltula #95 behind the three spinning flaming skulls (5/5 Shadow Temple Skulltulas!).',
        secretIds: ['gs-094', 'gs-095'],
        requiredIds: ['era-adult', 'lens-of-truth', 'hover-boots', 'song-scarecrow', 'longshot', 'song-lullaby'],
      },
      {
        id: 'ch-14-step-05',
        title: 'Boss: Bongo Bongo & Shadow Medallion',
        regionId: 'shadow-temple',
        era: 'adult',
        kind: 'boss',
        instructions:
          'Float across the final gap in Hover Boots and drop onto the giant bongo drum! Shoot both severed hands with the Fairy Bow (wearing Hover Boots dampens the drum bounce!), flick on the Lens of Truth, put one arrow into Bongo Bongo\'s charging red eye, and deliver 2–3 Biggoron\'s Sword jump-slashes to claim Boss Heart Container #7 and the Shadow Medallion!',
        secretIds: ['boss-hc-shadow', 'medallion-shadow'],
        requiredIds: ['era-adult', 'hover-boots', 'bow', 'lens-of-truth'],
      },
    ],
  },
  {
    id: 'ch-15',
    number: 15,
    title: 'Gerudo\'s Fortress, Haunted Wasteland & Gerudo Training Ground',
    subtitle: '4 Carpenters, 50-Arrow Quiver, 7-Key Ice Arrows & Wasteland Crossing',
    era: 'adult',
    primaryRegionId: 'gerudo-fortress',
    estimatedMinutes: 40,
    summary:
      'Free the four imprisoned Carpenters for the Gerudo Membership Card, sweep Gerudo\'s Fortress and Horseback Archery, raid the Gerudo Training Ground for the Ice Arrows, and cross the Haunted Wasteland.',
    steps: [
      {
        id: 'ch-15-step-01',
        title: 'Thieves\' Hideout: Rescue All 4 Carpenters & Earn Gerudo Card',
        regionId: 'gerudo-fortress',
        era: 'adult',
        kind: 'story',
        instructions:
          'Gallop Epona into Gerudo\'s Fortress and infiltrate Thieves\' Hideout (stunning sentries from afar with the Fairy Bow). Defeat the four dual-scimitar Gerudo guards—avoiding their spinning jump-chop and punishing with Biggoron\'s Sword—to free Ichiro, Jiro, Saburo, and Shiro and earn the Gerudo Membership Card!',
        secretIds: ['eq-gerudo-card'],
        requiredIds: ['era-adult', 'epona', 'bow', 'hookshot'],
        unlocksRequirementIds: ['gerudo-card'],
      },
      {
        id: 'ch-15-step-02',
        title: 'Fortress Rooftop Chest & Both Fortress Night Skulltulas',
        regionId: 'gerudo-fortress',
        era: 'adult',
        kind: 'sweep',
        instructions:
          'Climb to the top exterior terrace of Thieves\' Hideout and Longshot directly onto the large rooftop chest (or float across in Hover Boots / summon Pierre!) for Piece of Heart #33. Play Sun\'s Song for nightfall: Hookshot Gold Skulltula #51 high on the central fortress cliff face, then walk east to the Archery Range and Hookshot Gold Skulltula #52 on the back of the northernmost target pole.',
        secretIds: ['hp-34', 'gs-051', 'gs-052'],
        requiredIds: ['era-adult', 'longshot', 'hookshot', 'time-night'],
      },
      {
        id: 'ch-15-step-03',
        title: 'Horseback Archery: 1,000-Pt Heart Piece & 1,500-Pt Biggest Quiver (50)',
        regionId: 'gerudo-fortress',
        era: 'adult',
        kind: 'quest',
        instructions:
          'Play Sun\'s Song for daytime, mount Epona at the Horseback Archery Range, and pay 20 Rupees with your 40-Arrow Quiver stocked. Use Switch 2 gyro aiming to shatter all 4 outer clay pots on the pass out and loose rapid bullseyes into the large end target on the turn: score 1,000+ points on Round 1 for Piece of Heart #34, and 1,500+ points on Round 2 for the Biggest Quiver (50)!',
        secretIds: ['hp-35', 'cap-quiver-50'],
        requiredIds: ['era-adult', 'gerudo-card', 'epona', 'bow', 'rupees-100'],
      },
      {
        id: 'ch-15-step-04',
        title: 'Gerudo Training Ground: 7-Key West Chain & Ice Arrows',
        regionId: 'gerudo-training-ground',
        era: 'adult',
        kind: 'dungeon',
        instructions:
          'Pay 10 Rupees to open the Gerudo Training Ground. Collect 7 Small Keys in one loop (Entrance Stalfos room, timed Boulder corridor, Wolfos/illusory wall room, Like-Like invisible chest via Lens of Truth, Hammer statue room, Fire-circle room, and Song of Time underwater Silver Rupee room—skipping the optional Silver Gauntlets block key!). Enter the left/west locked-door chain, DO NOT climb into the hidden ceiling alcove above the 4th room (save that key!), and unlock the central vault for the Ice Arrows!',
        proTip:
          'Skipping the false ceiling lock inside the west key chain lets you claim the Ice Arrows with just 7 Small Keys right now—zero backtracking after Spirit Temple!',
        secretIds: ['eq-ice-arrows'],
        requiredIds: [
          'era-adult',
          'gerudo-card',
          'bow',
          'longshot',
          'megaton-hammer',
          'iron-boots',
          'hover-boots',
          'lens-of-truth',
          'song-time',
        ],
        unlocksRequirementIds: ['ice-arrows'],
      },
      {
        id: 'ch-15-step-05',
        title: 'Haunted Wasteland: River of Sand & Poe Shelter Skulltula',
        regionId: 'haunted-wasteland',
        era: 'adult',
        kind: 'sweep',
        instructions:
          'Ask the gatekeeper atop the western watchtower to open the desert gate. Longshot the crate across the River of Sand (or sprint across in Hover Boots), follow the wooden flagpoles through the sandstorm (passing the Flying Carpet Bombchu merchant) to the stone shelter, climb down inside to Hookshot Gold Skulltula #53, then step onto the roof with the Lens of Truth active and follow the friendly Poe Guide into Desert Colossus.',
        secretIds: ['gs-053'],
        requiredIds: ['era-adult', 'gerudo-card', 'longshot', 'hookshot', 'lens-of-truth'],
      },
    ],
  },
  {
    id: 'ch-16',
    number: 16,
    title: 'Desert Colossus & Spirit Temple (Child & Adult Halves)',
    subtitle: 'Requiem of Spirit, Nayru\'s Love, Bean #10, Silver Gauntlets, Mirror Shield & Twinrova',
    era: 'cross-era',
    primaryRegionId: 'spirit-temple',
    estimatedMinutes: 45,
    summary:
      'Learn Requiem of Spirit to bridge Child and Adult eras at Desert Colossus, unlock Nayru\'s Love and Magic Bean #10, claim the Silver Gauntlets as Child Link, and return as Adult Link for the Mirror Shield and Twinrova.',
    steps: [
      {
        id: 'ch-16-step-01',
        title: 'Requiem of Spirit, Oasis Pond, Palm Skulltula & Nayru\'s Love Fairy',
        regionId: 'desert-colossus',
        era: 'adult',
        kind: 'switch2',
        instructions:
          'Walk inside the Spirit Temple foyer as Adult Link and step right back out so Sheik teaches you the Requiem of Spirit (L → R → L → A → R → L). Before time-traveling: (1) Stand on the stone block beside the dry southern basin and play the Song of Storms to permanently fill the Oasis Fairy Pond, then Hookshot Gold Skulltula #55 on the palm tree at night. (2) Bomb the cracked rock wall between the two NE palm trees, play Zelda\'s Lullaby, and pay 300 Rupees (using your 500-Rupee Adult\'s Wallet!) to Great Fairy #5 for Nayru\'s Love!',
        secretIds: ['song-requiem', 'grotto-oasis-fairies', 'gs-055', 'gf-05'],
        requiredIds: [
          'era-adult',
          'longshot',
          'lens-of-truth',
          'song-storms',
          'bottle',
          'time-night',
          'hookshot',
          'bombs',
          'magic-meter',
          'song-lullaby',
          'adults-wallet',
        ],
        unlocksRequirementIds: ['song-requiem'],
      },
      {
        id: 'ch-16-step-02',
        title: 'Child Warp: Colossus Soil Skulltula & Final Magic Bean #10',
        regionId: 'desert-colossus',
        era: 'cross-era',
        kind: 'quest',
        instructions:
          'Warp via Prelude of Light to the Temple of Time, return the Master Sword to become Child Link, and play Requiem of Spirit to warp straight to Desert Colossus! Walk right of the Spirit Temple stairs, release Bottled Bugs into the soft soil for Gold Skulltula #54, and plant your 10th and final Magic Bean (100 Rupees—all 10/10 Magic Beans planted!).',
        secretIds: ['gs-054', 'bean-10'],
        requiredIds: ['era-child', 'song-requiem', 'bottle', 'bottled-bug', 'magic-beans'],
      },
      {
        id: 'ch-16-step-03',
        title: 'Spirit Temple Child Wing: Nabooru & All 3 Child Skulltulas',
        regionId: 'spirit-temple',
        era: 'child',
        kind: 'dungeon',
        instructions:
          'Enter the Spirit Temple as Child Link, promise Nabooru to retrieve the Silver Gauntlets, and crawl through the left tunnel: (1) Defeat the Keese and Armos/Stalfos across the pit and Boomerang Gold Skulltula #96 through the metal fence. (2) Bombchu the sunlit boulder in the Lizalfos room, climb the vertical brick shaft while Boomeranging Gold Skulltula #97 on the wall, and push the sun block into the light beam on 2F. (3) Ascend the stairs before the Iron Knuckle door and Boomerang Gold Skulltula #98 high above the arch.',
        secretIds: ['gs-096', 'gs-097', 'gs-098'],
        requiredIds: ['era-child', 'song-requiem', 'boomerang', 'bombs'],
      },
      {
        id: 'ch-16-step-04',
        title: 'Child Iron Knuckle & the Silver Gauntlets',
        regionId: 'spirit-temple',
        era: 'child',
        kind: 'dungeon',
        instructions:
          'Challenge the Child-wing Iron Knuckle: bait a vertical axe chop, backflip out, and punish with jump-slashes (and let him smash the throne pillars if you need recovery hearts!). Step out onto the giant colossus\'s left hand in the desert sun to claim the Silver Gauntlets!',
        secretIds: ['eq-silver-gauntlets'],
        requiredIds: ['era-child', 'song-requiem', 'kokiri-sword'],
        unlocksRequirementIds: ['silver-gauntlets'],
      },
      {
        id: 'ch-16-step-05',
        title: 'Adult Return: Colossus Archway Heart Piece & Night Mesa Skulltula',
        regionId: 'desert-colossus',
        era: 'cross-era',
        kind: 'sweep',
        instructions:
          'Warp via Prelude of Light, pull the Master Sword to return to Adult Link, warp back via Requiem of Spirit, and play Sun\'s Song for nightfall! Hop onto your grown Magic Bean leaf beside the stairs: leap onto the top of the central stone archway on Pass 1 for Piece of Heart #35, then ride Pass 2 onto the flat western mesa to slash Gold Skulltula #56!',
        secretIds: ['hp-36', 'gs-056'],
        requiredIds: ['era-adult', 'song-requiem', 'time-travel', 'era-child', 'magic-beans', 'time-night'],
      },
      {
        id: 'ch-16-step-06',
        title: 'Spirit Temple Adult Wing: Final 2 Dungeon Skulltulas & Mirror Shield',
        regionId: 'spirit-temple',
        era: 'adult',
        kind: 'dungeon',
        instructions:
          'Push the heavy silver block in the right wing with your Silver Gauntlets: (1) In the 1F rolling-boulder Silver Rupee room, play the Song of Time to move the blue block and Hookshot Gold Skulltula #99. (2) In the grand 3F Colossus Statue chamber, play Zelda\'s Lullaby on the west Triforce hand, then play your Scarecrow\'s Song and Longshot Pierre across the hall for Gold Skulltula #100 (all 44/44 Dungeon Skulltulas complete!). Climb 4F past the Anubis traps, defeat the Adult Iron Knuckle, and open the exterior right-hand chest for the Mirror Shield!',
        secretIds: ['gs-099', 'gs-100', 'eq-mirror-shield'],
        requiredIds: ['era-adult', 'silver-gauntlets', 'song-time', 'song-scarecrow', 'longshot', 'hookshot'],
        unlocksRequirementIds: ['mirror-shield'],
      },
      {
        id: 'ch-16-step-07',
        title: 'Statue Face Puzzle & Boss: Sorceress Sisters Twinrova',
        regionId: 'spirit-temple',
        era: 'adult',
        kind: 'boss',
        instructions:
          'Reflect light onto the 4F sun wall with your Mirror Shield, claim the Boss Key (using Hover Boots/Bow past the fake chest), shatter the giant statue\'s face from the upper mirror room, and Longshot onto the chains. Defeat Brainwashed Nabooru\'s Iron Knuckle armor, then battle Twinrova: in Phase 1 bounce Koume\'s fire beam into Kotake (or vice versa); in Phase 2 absorb THREE consecutive blasts of the SAME element into your Mirror Shield to unleash a reflected torrent and carve Twinrova down with Biggoron\'s Sword for Boss Heart Container #8 and the Spirit Medallion!',
        secretIds: ['boss-hc-spirit', 'medallion-spirit'],
        requiredIds: ['era-adult', 'silver-gauntlets', 'mirror-shield', 'longshot', 'bombs'],
      },
    ],
  },
  {
    id: 'ch-17',
    number: 17,
    title: '100% Overworld Final Cleanup & House of Skulltula Rewards',
    subtitle: 'Light Arrows, Golden Gauntlets, Double Defense, 100/100 Skulltulas & All 20 Heart Containers',
    era: 'cross-era',
    primaryRegionId: 'kakariko-village',
    estimatedMinutes: 35,
    summary:
      'Receive the Light Arrows, dip into Ganon\'s Castle for the Golden Gauntlets to unlock Great Fairy #6 (Double Defense), sweep the final 6 Adult Nighttime Skulltulas, and claim every remaining House of Skulltula reward including Heart Piece #36 and the Echo Gem.',
    steps: [
      {
        id: 'ch-17-step-01',
        title: 'Temple of Time: All 6 Medallions & the Light Arrows',
        regionId: 'market',
        era: 'adult',
        kind: 'story',
        instructions:
          'Play the Prelude of Light with all 6 Sage Medallions in hand to meet Sheik—revealed as Princess Zelda—inside the Temple of Time and receive the sacred Light Arrows before Ganondorf seals her inside his crystal.',
        secretIds: ['eq-light-arrows'],
        requiredIds: ['era-adult', 'bow', 'megaton-hammer', 'longshot', 'hover-boots', 'mirror-shield'],
        unlocksRequirementIds: ['light-arrows'],
      },
      {
        id: 'ch-17-step-02',
        title: 'Ganon\'s Castle Dip: Shadow Trial for the Golden Gauntlets',
        regionId: 'ganons-castle',
        era: 'adult',
        kind: 'dungeon',
        instructions:
          'Cross the Rainbow Bridge into Inside Ganon\'s Castle and enter the purple Shadow Trial door on the right first! Shoot the unlit torch with a Fire Arrow to spawn temporary white platforms, Longshot to the chest switch, use the Lens of Truth and Hover Boots to reach the big chest containing the Golden Gauntlets, and immediately step back outside Ganon\'s Castle!',
        proTip:
          'Grabbing the Golden Gauntlets right away lets you unlock Double Defense outside before tackling the remaining five elemental barrier trials in Chapter 18!',
        secretIds: ['eq-golden-gauntlets'],
        requiredIds: ['era-adult', 'light-arrows', 'fire-arrows', 'longshot', 'hover-boots', 'lens-of-truth'],
        unlocksRequirementIds: ['golden-gauntlets'],
      },
      {
        id: 'ch-17-step-03',
        title: 'Outside Ganon\'s Castle: Ruined Arch Skulltula & Great Fairy #6 (Double Defense)',
        regionId: 'outside-ganons-castle',
        era: 'adult',
        kind: 'switch2',
        instructions:
          'Outside Ganon\'s Castle, turn around and Hookshot Gold Skulltula #17 on the ruined stone archway above the lava moat. Then run left to the dead-end cliff, hurl the massive black obelisk aside with your Golden Gauntlets, play Zelda\'s Lullaby inside, and offer 500 Rupees (your full Adult\'s Wallet!) to Great Fairy #6 for Double Defense (white heart outlines cutting all incoming damage in half)!',
        secretIds: ['gs-017', 'gf-06'],
        requiredIds: ['era-adult', 'hookshot', 'golden-gauntlets', 'song-lullaby', 'adults-wallet'],
      },
      {
        id: 'ch-17-step-04',
        title: 'Zora\'s Fountain Night: Silver Gauntlets Secret Tunnel Skulltula',
        regionId: 'zoras-fountain',
        era: 'adult',
        kind: 'sweep',
        instructions:
          'Head to Zora\'s Fountain at night with your Gauntlets and Lens of Truth: lift the heavy gray boulder right outside the SE Great Fairy Fountain, drop into the hidden subterranean passage, fight/run past the invisible Skulltulas, and Hookshot Gold Skulltula #41 on the high ceiling.',
        secretIds: ['gs-041'],
        requiredIds: ['era-adult', 'time-night', 'silver-gauntlets', 'hookshot'],
      },
      {
        id: 'ch-17-step-05',
        title: 'Zora\'s River Night Sweep: Both High Canyon Skulltulas',
        regionId: 'zoras-river',
        era: 'adult',
        kind: 'sweep',
        instructions:
          'Walk back down Zora\'s River at night: stand on the wooden bridge below the waterfall and Hookshot Gold Skulltula #37 high on the west cliff wall, then hop onto the elevated Fairy Grotto plateau halfway down the river and Hookshot Gold Skulltula #36 on the high south wall.',
        secretIds: ['gs-036', 'gs-037'],
        requiredIds: ['era-adult', 'time-night', 'hookshot'],
      },
      {
        id: 'ch-17-step-06',
        title: 'Lake Hylia Night: Giant Dead Tree Crown Longshot Skulltula',
        regionId: 'lake-hylia',
        era: 'adult',
        kind: 'sweep',
        instructions:
          'Warp via Serenade of Water to Lake Hylia at night, aim your Longshot high up at the thick branch of the dead tree above the warp island, grapple onto the branch, and slash Gold Skulltula #46!',
        secretIds: ['gs-046'],
        requiredIds: ['era-adult', 'time-night', 'longshot'],
      },
      {
        id: 'ch-17-step-07',
        title: 'Gerudo Valley Night: Final 2 Gold Skulltulas (100/100 Complete!)',
        regionId: 'gerudo-valley',
        era: 'adult',
        kind: 'sweep',
        instructions:
          'Ride Epona across the Gerudo Valley bridge at night to claim the final two tokens in all of Hyrule: Hookshot Gold Skulltula #49 on the rock wall directly behind the Carpenters\' Tent, then turn around and Hookshot Gold Skulltula #50 on the underside of the natural stone arch pillar—hitting 100/100 Gold Skulltulas across both Child and Adult eras!',
        proTip:
          'Open the Switch 2 World Map and toggle Child/Adult regional counters (plus Threads of Time via - then Y) to admire green 100% checkmarks across every province and dungeon!',
        secretIds: ['gs-049', 'gs-050'],
        requiredIds: ['era-adult', 'epona', 'time-night', 'hookshot'],
        unlocksRequirementIds: ['tokens-100'],
      },
      {
        id: 'ch-17-step-08',
        title: 'House of Skulltula Grand Finale: Echo Gem, Giant\'s Wallet, Heart Piece #36 & Gold Rupees',
        regionId: 'kakariko-village',
        era: 'both',
        kind: 'switch2',
        instructions:
          'Enter the House of Skulltula in Kakariko Village (as either Child or Adult Link) to break the family\'s curse completely and claim every remaining milestone reward: 20 Tokens = NEW Switch 2 Echo Gem (HD Rumble 2 & glowing Skulltula radar), 30 Tokens = 1,000-Rupee Giant\'s Wallet, 40 Tokens = 20 Bombchus, 50 Tokens = final Piece of Heart #36 (completing all 20 Heart Containers!), and 100 Tokens = Unlimited 200-Rupee Gold Rupees from the wealthy father in the center!',
        secretIds: ['skr-20', 'skr-30', 'skr-40', 'hp-10', 'skr-50', 'skr-100'],
        requiredIds: ['tokens-20', 'tokens-30', 'tokens-40', 'tokens-50', 'tokens-100'],
        unlocksRequirementIds: ['echo-gem', 'giants-wallet'],
      },
    ],
  },
  {
    id: 'ch-18',
    number: 18,
    title: 'Ganon\'s Castle & Hall of Fallen Foes (100% Finale)',
    subtitle: 'All 6 Barrier Trials, Ganondorf & Ganon, and All 84 Hall of Fallen Foes Statues',
    era: 'adult',
    primaryRegionId: 'ganons-castle',
    estimatedMinutes: 45,
    summary:
      'Shatter all six elemental barriers inside Ganon\'s Castle, triumph over Ganondorf and Dark Beast Ganon at full 20-Heart Double-Defense power, and enter Link\'s green-glowing dream bed to complete all 84 statues and Boss Rush medals in the Hall of Fallen Foes!',
    steps: [
      {
        id: 'ch-18-step-01',
        title: 'Ganon\'s Castle Part 1: Forest, Water & Light Barrier Trials',
        regionId: 'ganons-castle',
        era: 'adult',
        kind: 'dungeon',
        instructions:
          'Return to Inside Ganon\'s Castle at absolute peak power (20 Double-Defense Hearts, Double Magic, Biggoron\'s Sword, 1,000-Rupee Giant\'s Wallet, and 5 Bottled Fairies/Milk!): (1) Forest Trial: ignite the torches with Din\'s Fire + Fire Arrow, then ride the Hover Boots fan wind paths to shoot the Forest core with a Light Arrow. (2) Water Trial: bottle free Blue Fire from the Ice Wolfos room, solve the sliding ice-block pit puzzle to melt the red-ice grate, and dispel the Water core. (3) Light Trial: hurl the massive outer Light Trial boulder with your Golden Gauntlets, use Lens of Truth in the invisible skull room, and play Zelda\'s Lullaby for the hidden Small Key to dispel the Light core.',
        secretIds: ['trial-forest', 'trial-water', 'trial-light'],
        requiredIds: [
          'era-adult',
          'light-arrows',
          'golden-gauntlets',
          'dins-fire',
          'fire-arrows',
          'hover-boots',
          'blue-fire',
          'lens-of-truth',
          'song-lullaby',
        ],
      },
      {
        id: 'ch-18-step-02',
        title: 'Ganon\'s Castle Part 2: Fire, Shadow & Spirit Barrier Trials',
        regionId: 'ganons-castle',
        era: 'adult',
        kind: 'dungeon',
        instructions:
          'Clear the final three barrier seals: (1) Fire Trial: wear the Goron Tunic across the sinking lava platforms, hurl the giant black pillar with your Golden Gauntlets to create a bridge, and Longshot to the Fire core. (2) Shadow Trial: return to the end of the Shadow Trial path you opened in Chapter 17, smash the rusty switch with the Megaton Hammer, and dispel the Shadow core. (3) Spirit Trial: Hookshot around the Beamos for Silver Rupees, detonate a Bombchu over the iron grate switch, and reflect ceiling sunlight with your Mirror Shield onto the genuine sun face to shatter the central Ganon\'s Tower barrier!',
        secretIds: ['trial-fire', 'trial-shadow', 'trial-spirit'],
        requiredIds: [
          'era-adult',
          'goron-tunic',
          'golden-gauntlets',
          'longshot',
          'megaton-hammer',
          'mirror-shield',
          'light-arrows',
        ],
      },
      {
        id: 'ch-18-step-03',
        title: 'Ascend Ganon\'s Tower: Dinolfos, Stalfos & Twin Iron Knuckles',
        regionId: 'ganons-castle',
        era: 'adult',
        kind: 'dungeon',
        instructions:
          'Climb the spiral stairs of Ganon\'s Tower, cutting through the dual Dinolfos, paired Stalfos knights, and the final Black & White Iron Knuckle duo with Biggoron\'s Sword (automatically logging any remaining armored enemy variants for the Hall of Fallen Foes!). Grab the Boss Key and smash the pots outside the organ chamber to top up arrows, magic, and fairies.',
        secretIds: [],
        requiredIds: ['era-adult', 'light-arrows'],
      },
      {
        id: 'ch-18-step-04',
        title: 'Final Boss: Great King of Evil Ganondorf & Dark Beast Ganon',
        regionId: 'ganons-castle',
        era: 'adult',
        kind: 'boss',
        instructions:
          'Cast Nayru\'s Love or stand on an outer tile as Ganondorf shatters the floor! Bat his single energy spheres back with sword slashes, unleash a Charged Spin Attack to reflect his 5-orb dark volley all at once, shoot him immediately with a Light Arrow while stunned, and Longshot across to carve him with Biggoron\'s Sword! Follow Princess Zelda down the collapsing tower in under 3:00. When Ganon rises from the rubble and knocks away the Master Sword, roll right between his legs (or stun his face with Light Arrows) and pummel his glowing tail with Biggoron\'s Sword—never breaking!—until the flames drop, reclaim the Master Sword, and deliver the final blow to seal Ganon!',
        proTip:
          'Because Biggoron\'s Sword is a separate item from the Master Sword, you keep your full double-damage blade during Ganon\'s opening phase when the Master Sword is pinned behind the fire ring!',
        secretIds: [],
        requiredIds: ['era-adult', 'light-arrows', 'longshot'],
      },
      {
        id: 'ch-18-step-05',
        title: 'Hall of Fallen Foes: All 84 Statues & Master Boss Rush (100% Complete!)',
        regionId: 'hall-of-fallen-foes',
        era: 'both',
        kind: 'switch2',
        instructions:
          'After the credits (or right from your cleared save), rest in the green-glowing bed inside Link\'s House in Kokiri Forest (or Kakariko / Lake Hylia) to enter Kaepora Gaebora\'s dream-realm museum: the Hall of Fallen Foes! Walk the galleries to verify all 84 Enemy & Boss Statues stand unlocked (if any rare overworld variant like a Peahat Larva, White Wolfos, or Flying Pot was skipped, Kaepora\'s pedestals tell you its exact habitat!), replay Dark Link and your favorite bosses on demand, and conquer the timed Boss Rush Gauntlets for Gold & Master Medals synced to Zelda Notes—crowning your 100% completion of Ocarina of Time (Switch 2 Remake)!',
        secretIds: ['sw2-hall-of-fallen-foes'],
        requiredIds: ['era-adult', 'bow', 'time-travel'],
      },
    ],
  },
];

export const ROUTE_CHAPTER_BY_ID: Record<string, RouteChapter> = Object.fromEntries(
  OPTIMAL_ROUTE_CHAPTERS.map((chapter) => [chapter.id, chapter]),
);

export const ALL_ROUTE_STEPS: RouteStep[] = OPTIMAL_ROUTE_CHAPTERS.flatMap(
  (chapter) => chapter.steps,
);

export const ROUTE_STEP_BY_ID: Record<string, RouteStep> = Object.fromEntries(
  ALL_ROUTE_STEPS.map((step) => [step.id, step]),
);

export const STEP_TO_CHAPTER_ID: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const chapter of OPTIMAL_ROUTE_CHAPTERS) {
    for (const step of chapter.steps) {
      map[step.id] = chapter.id;
    }
  }
  return map;
})();
