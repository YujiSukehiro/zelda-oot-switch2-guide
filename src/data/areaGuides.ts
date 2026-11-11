import type { AreaWalkthroughGuide } from '../types/zelda';

/**
 * Tactical area-by-area walkthrough guides for all 34 canonical regions in
 * The Legend of Zelda: Ocarina of Time (Switch 2 Remake — Patch 1.1.1).
 *
 * Ordered identically to `data/regions.json` (21 Overworld provinces followed
 * by 13 Dungeons, Mini-Dungeons, and the Hall of Fallen Foes).
 */
export const AREA_GUIDES: AreaWalkthroughGuide[] = [
  // ==========================================================================
  // 1. KOKIRI FOREST
  // ==========================================================================
  {
    regionId: 'kokiri-forest',
    tagline:
      "Claim your starting sword and shield, plant an early soil patch, and return as Adult Link to clear the Forest Temple curse and access Link's dream bed.",
    recommendedVisitOrder:
      'Visit 1: Child Start -> Visit 2: Child Post-Bottle & Beans -> Visit 3: Adult Post-Forest Temple & Epona',
    entrancesAndShortcuts: [
      'West Bridge to Hyrule Field: Unlocks permanently once you clear Inside the Great Deku Tree and receive the Fairy Ocarina from Saria.',
      'North Tree Trunk to Lost Woods: Climb the vine-covered hill behind Mido’s house for direct access to Goron City and Zora’s River warp tunnels.',
      'Link’s House Glowing Bed (Switch 2): After beating the Forest Temple and viewing Kaepora Gaebora’s Kakariko scene as Child Link, sleep in Link’s bed to enter the Hall of Fallen Foes.',
      'Kokiri Shop Magic Bean Lift: Plant Magic Bean #2 behind the shop as Child Link to ride a floating leaf across the upper forest canopy as Adult Link.',
    ],
    phases: [
      {
        id: 'kokiri-forest-phase-1',
        title: 'Child Link — Sword, Shield & Soil Sweep',
        era: 'child',
        steps: [
          'Crawl through the fenced training hole in SW Kokiri Forest, time your run past the rolling boulder, and open the chest for the Kokiri Sword.',
          'Farm 40 Rupees (hop across the river stepping stones, grab the Blue Rupee behind Mido’s house, and clear thrown rocks for Kokiri kids in Switch 2) to buy the Deku Shield at the Kokiri Shop.',
          'At night after obtaining the Kokiri Sword, slip behind the Know-It-All Brothers’ House (tucked slightly deeper against the back treehouse wall in Switch 2) and jump-slash Gold Skulltula #1.',
          'After clearing Inside the Great Deku Tree for the Kokiri’s Emerald, exit across the western bridge toward Hyrule Field to receive the Fairy Ocarina from Saria.',
          'Once you hold an Empty Bottle with Bugs and Magic Beans from Zora’s River, visit the soft soil patch directly behind the Kokiri Shop to release Bottled Bugs for Gold Skulltula #2 and plant Magic Bean #2 (20 Rupees).',
        ],
        secretIds: ['eq-kokiri-sword', 'eq-deku-shield', 'gs-001', 'eq-ocarina', 'gs-002', 'bean-02'],
      },
      {
        id: 'kokiri-forest-phase-2',
        title: 'Adult Link — Rooftop Token & Personal Cow',
        era: 'adult',
        steps: [
          'Visit SE Kokiri Forest at night with the Hookshot, Z/ZL-target the Gold Skulltula nestled between the twin roof peaks of the House of Twins, and grapple the token.',
          'After freeing Epona at Lon Lon Ranch and beating Malon’s obstacle course record (< 0:50), enter Link’s House to find your personal Cow—play Epona’s Song anytime to fill all 5 Bottles with free Lon Lon Milk.',
        ],
        secretIds: ['gs-003', 'cow-links-house'],
      },
    ],
    proTips: [
      'Switch 2 starts your Kokiri Wallet at 200 Rupees instead of 99, so farm extra Rupees from Mido’s 4 chests before leaving to afford early Market minigames and Magic Beans.',
      'Scoop wandering Bugs from under small rocks around Kokiri Forest into a single Bottle—re-catching one of the three scurrying bugs lets you reuse a single bug charge across all 9 Skulltula soil patches.',
      'Link’s House becomes the fastest healing + rest station in Hyrule once you unlock the Cow and the green-glowing Hall of Fallen Foes bed.',
    ],
  },

  // ==========================================================================
  // 2. LOST WOODS
  // ==========================================================================
  {
    regionId: 'lost-woods',
    tagline:
      'Navigate acoustic mist tunnels to unlock Goron and Zora shortcuts, stack Deku capacity upgrades, and trade masks and Biggoron items.',
    recommendedVisitOrder:
      'Visit 1: Child Post-Slingshot & Saria’s Song -> Visit 2: Child Happy Mask Sweep -> Visit 3: Adult Night & Biggoron Trade',
    entrancesAndShortcuts: [
      'Sacred Forest Meadow Path: From the Kokiri Forest entrance, follow the louder flute melody: Right -> Left -> Right -> Left -> Straight -> Left -> Right.',
      'Goron City Shortcut Tunnel: Go Left -> Right -> Bomb the boulder (or enter from Goron City) for an instant two-way warp to Death Mountain.',
      'Zora’s River Underwater Shortcut: Go Right -> Dive through the submerged pool (requires Silver Scale as Child; reopens for Adult Link in Switch 2 once Water Temple thaws Zora’s Domain!).',
      'Hyrule Field Bridge Bean Lift: Go Left -> Left and plant Magic Bean #3 to create a direct Adult elevator up to the Kokiri <-> Hyrule Field bridge.',
    ],
    phases: [
      {
        id: 'lost-woods-phase-1',
        title: 'Child Link — Musical Games, Target Bag & Soil Patches',
        era: 'child',
        steps: [
          'From the Kokiri entrance go Right: shoot the hanging target bullseye 3 times in a row (100, 100, 100) with the Fairy Slingshot to earn the Bigger Bullet Bag (40).',
          'Go Left from the entrance, hop onto the short stump facing the lone Skull Kid, and play Saria’s Song (R -> A -> Y -> R -> A -> Y) for a Piece of Heart.',
          'Continue Left again into the lower bridge clearing: deflect the Business Scrub’s nut to buy Deku Stick Upgrade #1 (20) for 40 Rupees, drop Bottled Bugs into the soft soil for Gold Skulltula #4, and plant Magic Bean #3 (30 Rupees).',
          'Take Right -> Left -> Right -> Left -> Left down to the two Skull Kids and repeat all 3 Ocarina memory rounds (5, 6, and 8 notes) for a second Piece of Heart.',
          'Navigate to the butterfly clearing (Right -> Left -> Right -> Left -> Straight -> Left), release Bottled Bugs into the soft soil for Gold Skulltula #5, and plant Magic Bean #4 (40 Rupees).',
        ],
        secretIds: [
          'cap-seeds-40',
          'hp-15',
          'cap-sticks-20',
          'gs-004',
          'bean-03',
          'hp-16',
          'gs-005',
          'bean-04',
        ],
      },
      {
        id: 'lost-woods-phase-2',
        title: 'Child Link — Forest Stage Masks & Nut/Stick Upgrades',
        era: 'child',
        steps: [
          'Borrow the Skull Mask from the Market Happy Mask Shop: BEFORE selling it, drop into the hidden grass grotto in the butterfly clearing (Forest Stage) wearing the Skull Mask to receive Deku Stick Upgrade #2 (30), then sell the Skull Mask to the lone Skull Kid (Left from entrance; bring 10 extra Rupees to cover the 20-Rupee shop fee).',
          'Right outside Sacred Forest Meadow (Right -> Left -> Right -> Left -> Straight -> Right), bomb the boulder, deflect the right-hand Business Scrub, and buy Deku Nut Upgrade #1 (30) for 40 Rupees.',
          'After completing all 4 Happy Mask trades to unlock the Mask of Truth, return to the Forest Stage grotto wearing the Mask of Truth for Deku Nut Upgrade #2 (40).',
        ],
        secretIds: ['cap-sticks-30', 'mask-step-2', 'cap-nuts-30', 'cap-nuts-40'],
      },
      {
        id: 'lost-woods-phase-3',
        title: 'Adult Link — Forest Stage Ledge & Biggoron Sequence',
        era: 'adult',
        steps: [
          'Visit the butterfly clearing at night as Adult Link and ride the Magic Bean #4 leaf platform onto the high ledge to slay Gold Skulltula #6.',
          'Go Left from the entrance with Cojiro (Biggoron Trade #3) to wake Grog for the Odd Mushroom—immediately dash through the Lost Woods -> Goron City shortcut without playing warp songs to beat the 4:00 timer!',
          'Return to Grog’s stump with Granny’s Odd Poultice and hand it to Fado to receive the Poacher’s Saw.',
        ],
        secretIds: ['gs-006', 'biggoron-step-4', 'biggoron-step-6'],
      },
    ],
    proTips: [
      'MAJOR SWITCH 2 BUG FIX: Claiming the Poacher’s Saw as Adult Link NO LONGER permanently breaks the Forest Stage Mask of Truth reward—you can grab Deku Nut Upgrade #2 (40) in any order!',
      'Listen to Saria’s flute stereo pan (or watch the darkness inside doorway arches): real doorways show mist/fade while wrong exits pitch-black warp you back to Kokiri Forest.',
      'During the Odd Mushroom 4:00 timed run, cut Left -> Right through the bombed Goron City tunnel and down Death Mountain Trail into Kakariko to arrive with over 2 minutes to spare.',
    ],
  },

  // ==========================================================================
  // 3. SACRED FOREST MEADOW
  // ==========================================================================
  {
    regionId: 'sacred-forest-meadow',
    tagline:
      'Clear the Wolfos and Moblin hedge maze to learn Saria’s Song as a child and unlock the Forest Temple warp hub as an adult.',
    recommendedVisitOrder:
      'Visit 1: Child Post-Zelda’s Letter -> Visit 2: Adult With Hookshot (Pre-Forest Temple)',
    entrancesAndShortcuts: [
      'Lost Woods Maze Exit: Enter from NE Lost Woods (Right -> Left -> Right -> Left -> Straight -> Left -> Right).',
      'Minuet of Forest Warp Pad: Play L -> X -> Y -> A -> Y -> A in either era to warp straight to the Forest Temple Triforce pad, bypassing the Moblin maze completely.',
      'Hidden Fairy Grotto: Climb the ladder halfway through the hedge maze to find a hole dropping into a free Fairy Fountain before tackling the Forest Temple.',
    ],
    phases: [
      {
        id: 'sacred-forest-meadow-phase-1',
        title: 'Child Link — Hedge Maze & Saria’s Song',
        era: 'child',
        steps: [
          'After receiving Zelda’s Letter at Hyrule Castle, defeat the entrance Wolfos (wait for its claw swipe and counter-slash its tail for double damage).',
          'Deflect or dodge the Mad Scrubs through the hedge labyrinth to reach the inner sanctum stump where Saria teaches you Saria’s Song (R -> A -> Y -> R -> A -> Y).',
        ],
        secretIds: ['song-saria'],
      },
      {
        id: 'sacred-forest-meadow-phase-2',
        title: 'Adult Link — Minuet of Forest, Night Wall & Saria’s Thread of Time',
        era: 'adult',
        steps: [
          'Sprint past the charging spear Moblins (and stun the giant club Moblin on the temple approach with the Hookshot) to trigger Sheik’s cutscene and learn the Minuet of Forest (L -> X -> Y -> A -> Y -> A).',
          'At night (play Sun’s Song if needed), stand atop the ladder platform overlooking the hedge maze and Hookshot Gold Skulltula #7 high on the eastern stone wall.',
          'After clearing the Forest Temple with the Fairy Bow and unlocking Time Travel via Prelude of Light, play Saria’s Song on the quiet tree stump outside the Forest Temple to complete Threads of Time: Saria’s Eternal Forest.',
        ],
        secretIds: ['song-minuet', 'gs-007', 'sw2-thread-saria'],
      },
    ],
    proTips: [
      'Learn Saria’s Song immediately after Hyrule Castle so you can grab the Lost Woods Heart Piece, Goron’s Bracelet, and Skull Mask in one seamless loop.',
      'Hookshotting Moblins freezes them in place without consuming arrows or magic, making the maze corridor risk-free.',
    ],
  },

  // ==========================================================================
  // 4. HYRULE FIELD
  // ==========================================================================
  {
    regionId: 'hyrule-field',
    tagline:
      'Master Hyrule’s central crossroads to solve three brand-new Switch 2 cross-era Fairy’s Thoughts puzzles and hunt Big Poes on Epona.',
    recommendedVisitOrder:
      'Visit 1: Child First Crossing -> Visit 2: Child Post-3 Stones (Bunny Hood & Cow Grotto) -> Visit 3: Adult Epona + Bow + Cross-Era Cleanup',
    entrancesAndShortcuts: [
      'Seven Provincial Exits: Connects directly to Kokiri Forest (E), Zora’s River (NE), Kakariko Village (N-NE), Castle Town Market (N), Lon Lon Ranch (Center), Gerudo Valley (W), and Lake Hylia (S).',
      'Running Drawbridge Timing: Roll or Hold-A Dash on your initial Kokiri exit to reach Castle Town before nightfall raises the drawbridge.',
      'Epona Field Summon: Play Epona’s Song (X -> Y -> A -> X -> Y -> A) anywhere in Hyrule Field as Adult Link to mount Epona instantly.',
    ],
    phases: [
      {
        id: 'hyrule-field-phase-1',
        title: 'Child Link — Zelda Notes, Lone Tree, Cow Grotto & Bunny Hood',
        era: 'child',
        steps: [
          'Link your optional Zelda Notes mobile companion module (Patch 1.1.1) for live map sync and Hyrule Field Gossip Quests.',
          'Roll into the softly glowing lone tree just west of the Kokiri Forest bridge to knock down Gold Skulltula #8.',
          'Once you have Bombs, Din’s Fire, and the Boomerang, bomb the circle of small stones before the western Gerudo Valley bridge: burn the webs inside with Din’s Fire, grab Gold Skulltula #9 with the Boomerang, and play Epona’s Song for the Cow.',
          'After collecting all 3 Spiritual Stones, borrow the Bunny Hood from the Happy Mask Shop, track down the Running Man resting along the Lon Lon Ranch perimeter path at night, and sell it to fill your entire Wallet and unlock the Mask of Truth!',
        ],
        secretIds: [
          'sw2-zelda-notes',
          'gs-008',
          'gs-009',
          'cow-hyrule-field',
          'mask-step-4',
        ],
      },
      {
        id: 'hyrule-field-phase-2',
        title: 'Adult Link — All 10 Big Poe Spawns on Epona',
        era: 'adult',
        steps: [
          'Ride Epona with the Fairy Bow and Empty Bottles (day or night) to snipe Big Poes (2 arrows each before they vanish)—note that only 5 Big Poes (500 pts) are needed for the Market Empty Bottle in Switch 2, while all 10 (1,000 pts) earn a bonus Gold Rupee!',
          'Northern & Eastern Circuit: Snipe Big Poe #1 (lone tree west of Castle Town drawbridge), #2 (northern Lon Lon Ranch T-junction signpost), #3 (stone ledge west of Kakariko stairs), #4 (gray boulder on hill east of Lon Lon), and #5 (bush cluster along eastern Kokiri wall).',
          'Southern & Western Circuit: Snipe Big Poe #6 (SE Peahat wetland grove), #7 (boulder north of Lake Hylia fences), #8 (western V-junction river fork), #9 (red canyon overhang before Gerudo Valley), and #10 (lone tree in far NW Gerudo approach).',
          'Before returning to the past, inspect TWO new Switch 2 Fairy’s Thoughts clues as Adult Link: (1) read the password "Sell somethin\', will ya?" carved into the lonely tree by the ruined northern Castle Town moat, and (2) examine the looted chest + glowing fairy wall scribble under the western red canyon overhang before Gerudo Valley.',
        ],
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
      },
      {
        id: 'hyrule-field-phase-3',
        title: 'Cross-Era Cleanup — Switch 2 Fairy’s Thoughts & Wetland Grotto',
        era: 'both',
        steps: [
          'Travel back to Child Link via the Pedestal of Time: bomb the cracked rocks on the grass bank east of the Castle Town drawbridge moat, enter the grotto, give the Business Scrub the password ("Sell somethin\', will ya?"), and buy Heart Piece #5 for 100 Rupees.',
          'Still as Child Link, run west to the red canyon overhang before Gerudo Valley and open the newly unlocked time-shifted chest for Heart Piece #6.',
          'Bomb the cracked stone near the Peahats in SE Hyrule Field as Child Link, read the fairy wall message, and slay the ordinary Skullwalltula; then return to the exact grotto as Adult Link and Hookshot Gold Skulltula #10!',
        ],
        secretIds: ['hp-05', 'hp-06', 'gs-010'],
      },
    ],
    proTips: [
      'MAJOR SWITCH 2 RELOCATION: Do NOT waste bombs searching for the old N64 Lake Hylia fence Scrub or NW Diving Tektite grottos—both Stone of Agony Heart Pieces were replaced by the two cross-era Fairy’s Thoughts puzzles!',
      'Wait to sell the Bunny Hood until you have upgraded to the 500-Rupee Adult’s Wallet (10 Skulltulas)—the Running Man tops off your entire wallet capacity for free.',
      'Enable gyro aiming in Settings when hunting Big Poes on horseback to land consecutive two-arrow kills before they veer through walls.',
    ],
  },

  // ==========================================================================
  // 5. LON LON RANCH
  // ==========================================================================
  {
    regionId: 'lon-lon-ranch',
    tagline:
      'Befriend Malon for Epona’s Song and an early Milk Bottle as Child Link, then outrace Ingo as Adult Link to liberate Epona.',
    recommendedVisitOrder:
      'Visit 1: Child Post-Hyrule Castle -> Visit 2: Child Night With Boomerang -> Visit 3: Adult With 60+ Rupees',
    entrancesAndShortcuts: [
      'Northern Gate off Central Hyrule Field: Single main entrance right in the heart of Hyrule Field.',
      'Epona Gate Jump (Adult): During your second race win against Ingo, gallop Epona straight over the locked northern gate (or side perimeter walls) to escape permanently.',
      'Free 4-Cow Refill Station: Two Cows in the stables + two Cows inside the SW shed crawlspace refill all 5 Empty Bottles via Epona’s Song.',
    ],
    phases: [
      {
        id: 'lon-lon-ranch-phase-1',
        title: 'Child Link — Storage Shed, Super Cuccos & Epona’s Song',
        era: 'child',
        steps: [
          'Enter the SW brick storage shed, pull/push the milk crates to uncover the hidden back-right crawlspace, and grab Heart Piece #1.',
          'Roll into the lone glowing tree in the NE yard behind Talon’s farmhouse for Gold Skulltula #11.',
          'After waking Talon at Hyrule Castle, enter the farmhouse and pay 10 Rupees to spot his 3 Super Cuccos within 30 seconds (throw regular Cuccos into a corner first if needed!) to win Empty Bottle #2 filled with Lon Lon Milk.',
          'Walk out to the central corral during the day, pull out your Ocarina in front of Malon to learn Epona’s Song (X -> Y -> A -> X -> Y -> A), and play it beside the Stables/Shed Cows whenever you need free milk.',
        ],
        secretIds: ['hp-01', 'gs-011', 'bottle-02', 'song-epona', 'cow-lon-lon'],
      },
      {
        id: 'lon-lon-ranch-phase-2',
        title: 'Child Link — Nighttime Boomerang Skulltula Sweep',
        era: 'child',
        steps: [
          'Return at night after clearing Jabu-Jabu’s Belly (no bats/Malon must be asleep—enter after 18:00) and Boomerang Gold Skulltula #12 on the upper corral-facing window of Talon’s farmhouse.',
          'Walk to the SW storage shed exterior wall and use the Boomerang to snag Gold Skulltula #13 high on the crumbling brick masonry.',
        ],
        secretIds: ['gs-012', 'gs-013'],
      },
      {
        id: 'lon-lon-ranch-phase-3',
        title: 'Adult Link — Rescuing Epona & Malon’s Ranch Song Thread',
        era: 'adult',
        steps: [
          'Arrive with at least 60 Rupees: pay Ingo 10 Rupees to enter the corral, play Epona’s Song immediately to mount Epona instead of the slow horse, and speak to Ingo from horseback to wager 50 Rupees.',
          'Hug the inside fence rail, space your carrots (never burn the final carrot unless sprinting the finish line), beat Ingo in two consecutive races, and jump the locked front gate to claim Epona permanently!',
          'Once you unlock Time Travel via Prelude of Light, speak with Malon beside the corral fence with Epona freed to perform a duet of Epona’s Song and stamp Threads of Time: Malon’s Ranch Song COMPLETE.',
        ],
        secretIds: ['eq-epona', 'sw2-thread-malon'],
      },
    ],
    proTips: [
      'SWITCH 2 TALLY NOTE: Lon Lon Ranch has 3 Gold Skulltulas in the Switch 2 Remake (all Child-era), down from 4 in N64—the 4th shifted to Hyrule Field’s new SE Peahat Wetland grotto.',
      'Right after rescuing Epona, ride back into Lon Lon Ranch and beat Malon’s obstacle course in under 0:50 so she delivers a personal Cow to Link’s House in Kokiri Forest!',
    ],
  },

  // ==========================================================================
  // 6. HYRULE CASTLE TOWN MARKET
  // ==========================================================================
  {
    regionId: 'market',
    tagline:
      'Scoop the brand-new Switch 2 5th Bottle right away, sweep minigame upgrades as a child, and unlock Time Travel and the Big Poe Bottle as an adult.',
    recommendedVisitOrder:
      'Visit 1: Child First Arrival -> Visit 2: Child Post-Bombs & 3 Stones -> Visit 3: Adult Post-Forest Temple & Child Post-Lens',
    entrancesAndShortcuts: [
      'Southern Drawbridge to Hyrule Field: Open 06:00–18:00 in the Child era (always passable across the ruined bridge in the Adult era).',
      'Northern Road to Hyrule Castle / Outside Ganon’s Castle: Connects Market Square to the royal grounds and endgame fortress.',
      'Prelude of Light Warp Pad (Temple of Time): Play X -> A -> X -> A -> Y -> X after beating the Forest Temple to warp straight to the Master Sword pedestal from anywhere in Hyrule.',
    ],
    phases: [
      {
        id: 'market-phase-1',
        title: 'Child Link — New 5th Bottle, Minigames & Song of Time',
        era: 'child',
        steps: [
          'Open the Threads of Time journal (- button, then Y for Tapestry view) anytime to track your six character-focused side-quest arcs across Hyrule.',
          'IMMEDIATE STOP: Enter the Market Potion Shop (east side), speak to the panicked shopkeeper, scoop up the escaped Golden Bug skittering across the floor with his loaner bottle, and keep Empty Bottle #1 + a free Red Potion!',
          'Step into the Guardhouse ("Lots O\' Pots" right inside the drawbridge) and roll into the corner crate for Gold Skulltula #14 (smash the pots too for easy early Rupees).',
          'Play the daytime Shooting Gallery (20 Rupees; use Switch 2 gyro aiming!) and hit 10/10 targets for the Biggest Bullet Bag (50); then at night, lead Richard the white dog from behind the Bazaar stall to the illuminated Back Alley house for Heart Piece #2.',
          'Once you earn the Bomb Bag from Dodongo’s Cavern, play the Bombchu Bowling Alley (30 Rupees per try; re-enter to cycle prizes) to win both Heart Piece #3 and the Biggest Bomb Bag (40).',
          'Return to the Castle Town moat after clearing all 3 Child Dungeons, dive for the Ocarina of Time to learn the Song of Time (A -> L -> R -> A -> L -> R), and open the Door of Time in the Temple of Time.',
        ],
        secretIds: [
          'bottle-01',
          'gs-014',
          'cap-seeds-50',
          'hp-02',
          'hp-03',
          'cap-bombs-40',
          'song-time',
        ],
      },
      {
        id: 'market-phase-2',
        title: 'Adult Link — Light Medallion, Prelude, Big Poe Bottle & Light Arrows',
        era: 'adult',
        steps: [
          'Pull the Master Sword inside the Temple of Time to awaken in the Adult era and receive the Light Medallion from Sage Rauru.',
          'Return to the Temple of Time right after defeating Phantom Ganon in the Forest Temple—Sheik teaches you the Prelude of Light (X -> A -> X -> A -> Y -> X), unlocking Child <-> Adult Time Travel AND the Hall of Fallen Foes questline!',
          'Enter the ruined Guardhouse near the entrance bridge and sell 5 bottled Big Poes from Hyrule Field (500 points total—cut in half from N64’s 1,000!) to claim Empty Bottle #5.',
          'Once you hold all 6 Sage Medallions, return to the Temple of Time to witness Princess Zelda’s reveal and receive the Light Arrows.',
        ],
        secretIds: ['medallion-light', 'song-prelude', 'bottle-05', 'eq-light-arrows'],
      },
      {
        id: 'market-phase-3',
        title: 'Child Cleanup — Nighttime Treasure Chest Shop (With Lens)',
        era: 'child',
        steps: [
          'Once you acquire the Lens of Truth from Bottom of the Well, enter the Market Treasure Chest Shop at night as Child Link (10 Rupees), peek through all 5 rooms’ chests with the Lens to grab every Small Key, and open the final chest for Heart Piece #4.',
        ],
        secretIds: ['hp-04'],
      },
    ],
    proTips: [
      'NEW SWITCH 2 BOTTLE: Catching the Golden Bug in the Market Potion Shop gives you a 5th Empty Bottle minutes after leaving Kokiri Forest—meaning you can carry Bottled Bugs + Fairy + Milk simultaneously!',
      'Switch 2 patched old N64 camera/door-frame peeking exploits in the Treasure Chest Shop; wait five minutes until you get the Lens of Truth rather than gambling 1-in-32 odds.',
      'Selling all 10 Big Poes (1,000 points) to the Poe Collector after getting Bottle #5 rewards a 200-Rupee Gold Rupee.',
    ],
  },

  // ==========================================================================
  // 7. HYRULE CASTLE GROUNDS (CHILD)
  // ==========================================================================
  {
    regionId: 'hyrule-castle',
    tagline:
      'Sneak into the royal courtyard to earn Zelda’s Letter and Zelda’s Lullaby, then return with Bombs and Song of Storms for the Charged Spin Attack and Moat Grotto.',
    recommendedVisitOrder:
      'Visit 1: Child Daytime Infiltration -> Visit 2: Child Post-Bombs (50 Rupees) -> Visit 3: Child Post-Song of Storms',
    entrancesAndShortcuts: [
      'Northern Road from Castle Town Market: Accessible exclusively in the Child era (replaced by Outside Ganon’s Castle in the Adult era).',
      'Vine Gate Bypass: Climb the vines on the right side of the closed gatehouse so you never get turned away by the front guard.',
    ],
    phases: [
      {
        id: 'hyrule-castle-phase-1',
        title: 'Child Link — Waking Talon & Courtyard Stealth',
        era: 'child',
        steps: [
          'Climb over the vine gatehouse and immediately roll into the first tree along the path to knock down Gold Skulltula #15.',
          'Receive the Weird Egg from Malon along the vine wall, pass time until morning (or play Sun’s Song later) to hatch the Pocket Cucco, wake sleeping Talon by the castle drain, and push the two milk crates into the moat channel to climb inside.',
          'Slip past the daytime courtyard guards (follow their clockwise blind spots without crossing red sight cones) to meet Princess Zelda for Zelda’s Letter and learn Zelda’s Lullaby (Y -> X -> A -> Y -> X -> A) from Impa.',
        ],
        secretIds: ['gs-015', 'song-lullaby'],
      },
      {
        id: 'hyrule-castle-phase-2',
        title: 'Child Link — Great Fairy #2 & Song of Storms Moat Grotto',
        era: 'child',
        steps: [
          'After earning Bombs and the Magic Meter on Death Mountain, follow the right-hand cul-de-sac past Talon’s spot, bomb the boulder, crawl inside, play Zelda’s Lullaby, and offer 50 Rupees for the Charged Spin Attack.',
          'Once you learn Song of Storms + own Bombs & Boomerang, play Song of Storms beside the lone tree at the outer moat corner to open a hidden grotto, bomb the fragile inner wall, and Boomerang Gold Skulltula #16.',
        ],
        secretIds: ['gf-02', 'gs-016'],
      },
    ],
    proTips: [
      'SWITCH 2 REWARD SWAP & FEE: Hyrule Castle’s Great Fairy now charges 50 Rupees and grants the Charged Spin Attack (while Death Mountain Summit grants Magic Meter + Din’s Fire for 25 Rupees—visit Death Mountain Summit first so you already have a Magic Meter!).',
      'Shoot the framing portraits through the right-hand courtyard window with your Slingshot for a fun Mario Easter egg and free Red Rupee.',
    ],
  },

  // ==========================================================================
  // 8. OUTSIDE GANON'S CASTLE (ADULT)
  // ==========================================================================
  {
    regionId: 'outside-ganons-castle',
    tagline:
      'Snag an easy Adult Gold Skulltula early and step out mid-Ganon’s Castle with the Golden Gauntlets and 500 Rupees to unlock Double Defense.',
    recommendedVisitOrder:
      'Visit 1: Adult With Hookshot -> Visit 2: Adult Endgame (After Shadow Trial Golden Gauntlets + 500 Rupees)',
    entrancesAndShortcuts: [
      'North Exit from Ruined Market: Directly replaces Hyrule Castle Grounds in the Adult era.',
      'Rainbow Bridge (6 Medallions): Materializes across the lava moat once you hold all 6 Sage Medallions.',
    ],
    phases: [
      {
        id: 'outside-ganons-castle-phase-1',
        title: 'Adult Link — Ruined Archway Skulltula',
        era: 'adult',
        steps: [
          'Step through the ruined gate into Outside Ganon’s Castle (day or night), turn around to face the crumbling stone arch above the lava moat, and Hookshot Gold Skulltula #17.',
        ],
        secretIds: ['gs-017'],
      },
      {
        id: 'outside-ganons-castle-phase-2',
        title: 'Adult Endgame — Golden Gauntlets Obelisk & Double Defense',
        era: 'adult',
        steps: [
          'Enter Inside Ganon’s Castle, clear ONLY up to the Golden Gauntlets chest inside the Shadow Trial, then immediately walk back outside!',
          'Heave the massive black obelisk blocking the NE cliffside cave, step onto the Triforce pad, play Zelda’s Lullaby, and pay 500 Rupees (requires the 500-Rupee Adult’s Wallet or 1,000-Rupee Giant’s Wallet!) to earn Double Defense (white heart outlines).',
        ],
        secretIds: ['gf-06'],
      },
    ],
    proTips: [
      'SWITCH 2 RUPEE GATE: Great Fairy #6 costs 500 Rupees—make sure your Adult’s Wallet is completely full (or bring the 1,000-Rupee Giant’s Wallet from 30 Skulltulas) so you don’t have to farm Rupees before fighting Ganondorf!',
      'Unlocking Double Defense BEFORE climbing Ganon’s Tower halves all damage from the Dual Iron Knuckles, Ganondorf, and Ganon.',
    ],
  },

  // ==========================================================================
  // 9. KAKARIKO VILLAGE
  // ==========================================================================
  {
    regionId: 'kakariko-village',
    tagline:
      'Hyrule’s premier side-quest hub: cash in Gold Skulltulas for the new Echo Gem and bigger Wallets, learn Song of Storms, and kick off the Biggoron’s Sword trade.',
    recommendedVisitOrder:
      'Visit 1: Child Post-Castle -> Visit 2: Adult Fresh Arrival -> Visit 3: Ongoing Token Turn-Ins (10 / 20 / 30 / 40 / 50 / 100)',
    entrancesAndShortcuts: [
      'Four Physical Gateways: Connects to Hyrule Field (W stairs), Kakariko Graveyard (SE path), Death Mountain Trail (N gate—show Zelda’s Letter as Child), and Bottom of the Well (central well, drained via Song of Storms).',
      'Nocturne of Shadow Adjacent Warp: Warping to the upper Graveyard pad places you seconds above Kakariko Village.',
      'Kaepora Gaebora Owl Drop: Ride the owl down from Death Mountain Summit to land directly atop Impa’s House roof right above Heart Piece #7!',
      'Glowing Dream Bed (Switch 2): Contains a green-glowing bed connecting directly to the Hall of Fallen Foes after clearing the Forest Temple.',
    ],
    phases: [
      {
        id: 'kakariko-village-phase-1',
        title: 'Child Link — 7 Cuccos Bottle, Keaton Mask, Rooftops & 5 Night Tokens',
        era: 'child',
        steps: [
          'During the day, gather all 7 scattered Cuccos into Anju’s pen near the Graveyard exit (entrance, Skulltula gate, stairs crate, Potion Shop, pen, Cucco-glide over Windmill fence, and ladder behind Windmill fence) for Empty Bottle #3.',
          'Carry a Cucco up the unfinished brick scaffolding + slanted wooden ramp and glide onto the narrow back ledge of Impa’s House (or ride the Owl from Death Mountain Summit!) to crawl inside the cow cage for Heart Piece #7.',
          'Show Zelda’s Letter to the Death Mountain gate guard to open the mountain trail AND unlock the Happy Mask Shop; immediately return to sell him the Keaton Mask (Mask #1).',
          'Roll into the village entrance tree for Gold Skulltula #18, then sweep Kakariko at night for 4 more Child tokens: #19 (House of Skulltula outer wall), #20 (unfinished brick pile), #21 (house wall by Cucco pen), and #22 (shoot high watchtower ladder with Slingshot).',
          'Once you hold the Boomerang, step inside the Windmill and throw the Boomerang from the rotating platform to pluck Heart Piece #9 off the upper stone ledge.',
        ],
        secretIds: [
          'bottle-03',
          'hp-07',
          'mask-step-1',
          'gs-018',
          'gs-019',
          'gs-020',
          'gs-021',
          'gs-022',
          'hp-09',
        ],
      },
      {
        id: 'kakariko-village-phase-2',
        title: 'Adult Link — Song of Storms, Quiver, Biggoron Opener & Nocturne',
        era: 'adult',
        steps: [
          'Enter the Windmill right after pulling the Master Sword and pull out your Ocarina before Guru-Guru to learn the Song of Storms (L -> R -> X -> L -> R -> X).',
          'Climb the watchtower and Hookshot onto the blue Dodongo Potion Shop roof to talk to the rooftop man for Heart Piece #8; at night from that same roof, Hookshot Gold Skulltula #23 on the wall above Impa’s House.',
          'Once you earn the Fairy Bow, score 10/10 at the completed Kakariko Shooting Gallery (20 Rupees; gyro aiming makes the final fast Rupee easy) for the Bigger Quiver (40).',
          'Start the Biggoron’s Sword quest: talk to Anju for the Pocket Egg (#1) -> play Sun’s Song to hatch the Pocket Cucco and wake Talon in the lower house (#2) -> show Anju for Cojiro (#3) -> after waking Grog in Lost Woods, rush through the Potion Shop back door before the 4:00 timer expires to hand Granny the Odd Mushroom for the Odd Poultice (#5).',
          'Re-enter Kakariko after clearing the Forest, Fire, and Water Temples to watch the Bongo Bongo cutscene and learn the Nocturne of Shadow (Y -> A -> A -> L -> Y -> A -> R) from Sheik.',
          'After earning the Hover Boots and awakening Impa in the Shadow Temple (with the Lens of Truth and Time Travel unlocked), enter Impa’s House and inspect her Sheikah chronicle with the Lens of Truth to complete Threads of Time: Impa’s Sheikah Legacy.',
        ],
        secretIds: [
          'song-storms',
          'hp-08',
          'gs-023',
          'cap-quiver-40',
          'biggoron-step-1',
          'biggoron-step-2',
          'biggoron-step-3',
          'biggoron-step-5',
          'song-nocturne',
          'sw2-thread-impa',
        ],
      },
      {
        id: 'kakariko-village-phase-3',
        title: 'Both Eras — House of Skulltula Milestones (10 to 100 Tokens)',
        era: 'both',
        steps: [
          '10 Tokens: Claim the boosted 500-Rupee Adult’s Wallet (mandatory before paying 300R / 500R at late-game Great Fairies!).',
          '20 Tokens: Claim the brand-new Switch 2 Echo Gem—equip it for dynamic glow, audio chimes, and HD Rumble 2 pulses near uncollected Gold Skulltulas!',
          '30 & 40 Tokens: Claim the boosted 1,000-Rupee Giant’s Wallet at 30 tokens and 20 Bombchus (doubled from N64!) at 40 tokens.',
          '50 & 100 Tokens: Claim Piece of Heart #10 at 50 tokens, and break the father’s curse at all 100 tokens for unlimited repeatable 200-Rupee Gold Rupees.',
        ],
        secretIds: [
          'skr-10',
          'skr-20',
          'skr-30',
          'skr-40',
          'skr-50',
          'hp-10',
          'skr-100',
        ],
      },
    ],
    proTips: [
      'NEW SWITCH 2 RELIC: Rush 20 Gold Skulltulas early in Child Link’s journey—the Echo Gem replaces the old Stone of Agony and acts as a real-time Skulltula radar inside every dungeon!',
      'With Switch 2’s dedicated manual Jump button (X), you can actually leap from the watchtower railing onto the Kakariko rooftop man’s roof early as Child Link.',
      'After beating the Forest Temple, visit Kakariko as Child Link to trigger Kaepora Gaebora’s intro scene unlocking the Hall of Fallen Foes across all glowing beds.',
    ],
  },

  // ==========================================================================
  // 10. KAKARIKO GRAVEYARD
  // ==========================================================================
  {
    regionId: 'graveyard',
    tagline:
      'Raid royal crypts for a free Hylian Shield, the Sun’s Song, and the Hookshot—three of the highest-leverage utility unlocks in Hyrule.',
    recommendedVisitOrder:
      'Visit 1: Child Post-Lullaby (Day & Night) -> Visit 2: Child Post-Boomerang -> Visit 3: Adult First Stop (Hookshot + Double Dampé Race)',
    entrancesAndShortcuts: [
      'East Gate from Kakariko Village: Open 24/7 in both eras.',
      'Nocturne of Shadow Warp Pad: Play Y -> A -> A -> L -> Y -> A -> R to warp straight onto the high Shadow Temple cliff overlooking the Graveyard.',
      'Dampé’s Catacomb -> Kakariko Windmill Exit: Finishing Dampé’s Ghost Race deposits you onto the upper ledge inside the Kakariko Windmill (instant alt route for Heart Piece #9!).',
      'West Cliff Magic Bean Lift: Plant Magic Bean #5 (50 Rupees) as Child Link to ride straight up to the high cliff Heart Piece crate as Adult Link.',
    ],
    phases: [
      {
        id: 'graveyard-phase-1',
        title: 'Child Link — Free Hylian Shield, Sun’s Song, Dampé Dig & Spooky Mask',
        era: 'child',
        steps: [
          'During the day (06:00–18:00), sell the Spooky Mask (Mask #3) to the patrolling Graveyard Boy; drop Bottled Bugs into the west cliff soft soil for Gold Skulltula #24 and plant Magic Bean #5 (50 Rupees).',
          'Play Zelda’s Lullaby on the Triforce slab at the back of the Graveyard to strike open the Royal Family’s Tomb: slay the Keese in the first hall to open the door, sprint past the ReDeads, and read the stone tablet for the Sun’s Song (A -> R -> X -> A -> R -> X).',
          'Pull back the front-row flower grave at night for a FREE Hylian Shield (saving 80 Rupees!), then pull back the 4th grave from the right in the front row, defeat the ReDead, and play Sun’s Song for Heart Piece #11.',
          'Between 18:00 and 21:00 as Child Link, pay Dampé 10 Rupees whenever he steps directly onto a soft dirt patch along his patrol loop until he digs up Heart Piece #12 (~10% chance per patch).',
          'At night with the Boomerang, stand past the graves and snag Gold Skulltula #25 off the high eastern stone wall.',
        ],
        secretIds: [
          'mask-step-3',
          'gs-024',
          'bean-05',
          'song-sun',
          'eq-hylian-shield',
          'hp-11',
          'hp-12',
          'gs-025',
        ],
      },
      {
        id: 'graveyard-phase-2',
        title: 'Adult Link — Hookshot, Sub-1:00 Dampé Rematch & Cliff Crate',
        era: 'adult',
        steps: [
          'MAKE THIS YOUR FIRST STOP AS ADULT LINK: Pull back Dampé’s flower grave on the west side and follow his ghost through the flame-throwing catacombs to earn the Hookshot!',
          'Immediately re-enter Dampé’s grave and race him a second time—roll continuously, cut inside corners, and Hold-A dash (or Longshot the end torch later) to finish in 1:00 or under for Heart Piece #14.',
          'Ride your grown Magic Bean #5 leaf platform up the west cliff wall and roll into the wooden crate to claim Heart Piece #13.',
        ],
        secretIds: ['eq-hookshot', 'hp-14', 'hp-13'],
      },
    ],
    proTips: [
      'Grab the Sun’s Song on your very first visit to Kakariko—toggling Day <-> Night on command eliminates all waiting for nighttime Gold Skulltulas across Hyrule!',
      'During Dampé’s Gravedigging Tour, never pay him when he stands on stone walkways; wait until both of his feet are centered on a brown dirt patch.',
    ],
  },

  // ==========================================================================
  // 11. DEATH MOUNTAIN TRAIL
  // ==========================================================================
  {
    regionId: 'death-mountain-trail',
    tagline:
      'Scale the volcanic switchbacks to unlock Magic Meter + Din’s Fire at the summit and forge the unbreakable Biggoron’s Sword.',
    recommendedVisitOrder:
      'Visit 1: Child Dodongo Ascent (25 Rupees Ready!) -> Visit 2: Adult Post-Hammer -> Visit 3: Adult Post-Water Temple (Biggoron Finale)',
    entrancesAndShortcuts: [
      'Kakariko North Gate: Show Zelda’s Letter to the guard as Child Link to unlock permanently.',
      'Goron City <-> Lost Woods Bomb Tunnel: Connects mid-trail Goron City directly back to Kokiri/Lost Woods.',
      'Kaepora Gaebora Summit Flight: Talk to the owl outside the Summit Great Fairy Fountain as Child Link for a one-way express glide onto Impa’s roof in Kakariko.',
      'Dodongo’s Cavern Magic Bean Lift: Plant Magic Bean #6 (60 Rupees) outside Dodongo’s Cavern for an Adult lift to Heart Piece #18 and the upper trail.',
    ],
    phases: [
      {
        id: 'death-mountain-trail-phase-1',
        title: 'Child Link — Dodongo Soil, Summit Din’s Fire & Bomb Alcove',
        era: 'child',
        steps: [
          'Right outside Dodongo’s Cavern (after tossing a Bomb Flower down from the upper ledge to open the cave), release Bottled Bugs into the soft soil for Gold Skulltula #26 and plant Magic Bean #6 (60 Rupees).',
          'Once you earn the Bomb Bag inside Dodongo’s Cavern, bomb through the boulder-strewn rockfall climb to the volcano summit, bomb the doorway boulder on the left, play Zelda’s Lullaby, and offer 25 Rupees to Great Fairy #1 for BOTH the Magic Meter AND Din’s Fire!',
          'On your way back down (with Boomerang or later with Hookshot), bomb the discolored brown rock wall just above the Kakariko gate to reveal Gold Skulltula #27.',
        ],
        secretIds: ['gs-026', 'bean-06', 'gf-01', 'gs-027'],
      },
      {
        id: 'death-mountain-trail-phase-2',
        title: 'Adult Link — Bean Cliff, Red Hammer Boulders & Storm Cow',
        era: 'adult',
        steps: [
          'Ride the Magic Bean #6 leaf outside Dodongo’s Cavern onto the stone overhang above the dungeon mouth for Heart Piece #18 (or backflip carefully off the upper switchback fence as Child).',
          'At night with the Megaton Hammer, smash TWO red boulders hiding Gold Skulltulas: #28 on the ledge overlooking Dodongo’s Cavern and #29 halfway up the volcanic rockfall climb.',
          'Play Song of Storms inside the stone ring near the upper Goron City / Summit climb to open a hidden Cow Grotto for free Lon Lon Milk before entering Death Mountain Crater.',
        ],
        secretIds: ['hp-18', 'gs-028', 'gs-029', 'cow-dmt'],
      },
      {
        id: 'death-mountain-trail-phase-3',
        title: 'Adult Link — Forging the Unbreakable Biggoron’s Sword',
        era: 'adult',
        steps: [
          'Show the Broken Goron’s Sword (from Gerudo Valley’s Mutoh) to giant Biggoron at the trail summit to receive the Prescription (#8).',
          'After getting King Zora’s Eyeball Frog -> Lake Hylia Professor’s World’s Finest Eye Drops (3:30 timer—NO warp songs!), sprint back up Death Mountain Trail and hand Biggoron the Eye Drops for the Claim Check (#11).',
          'Play the Sun’s Song 6 times right in front of Biggoron (passing 3 full days) and present the Claim Check (#12) to claim the double-damage, unbreakable Biggoron’s Sword!',
        ],
        secretIds: [
          'biggoron-step-8',
          'biggoron-step-11',
          'biggoron-step-12',
          'eq-biggoron-sword',
        ],
      },
    ],
    proTips: [
      'HUGE SWITCH 2 UPGRADE: The Death Mountain Summit Great Fairy costs just 25 Rupees and grants BOTH your Magic Meter AND Din’s Fire immediately (swapped with Hyrule Castle’s Spin Attack)—grab it the moment you finish Dodongo’s Cavern!',
      'Hold your Hylian Shield overhead (ZL/R crouch) while climbing the erupting rockfall corridor as Child Link so flaming boulders bounce harmlessly off your back.',
      'Wait until AFTER beating the Water Temple to run the Biggoron’s Sword timed legs—Switch 2 thaws Zora’s Domain, letting you swim Lake Hylia <-> Zora’s Domain <-> Lost Woods <-> Goron City in seconds!',
    ],
  },

  // ==========================================================================
  // 12. GORON CITY
  // ==========================================================================
  {
    regionId: 'goron-city',
    tagline:
      'Cheer up Darunia for Goron’s Bracelet and Bomb upgrades as Child Link, then stop rolling Link-Goron as Adult Link for a free Goron Tunic and Crater shortcut.',
    recommendedVisitOrder:
      'Visit 1: Child Pre-Dodongo -> Visit 2: Child Post-Dodongo (With Bombs) -> Visit 3: Adult Pre-Fire Temple',
    entrancesAndShortcuts: [
      'Death Mountain Trail Main Archway: Enters on the top (4F) tier of Goron City.',
      'Lost Woods Bomb Tunnel (3F/2F): Bomb the twin boulders blocking the tunnel for an instant two-way warp to Lost Woods.',
      'Darunia’s Statue -> Death Mountain Crater (1F Adult): Pull/push the rear pedestal statue inside Darunia’s chamber as Adult Link to step straight onto the Crater’s broken bridge!',
    ],
    phases: [
      {
        id: 'goron-city-phase-1',
        title: 'Child Link — Goron’s Bracelet, Spinning Urn, Bomb Bag 30 & Maze Crate',
        era: 'child',
        steps: [
          'Drop to 1F, play Zelda’s Lullaby on the rug before Darunia’s sealed door, and play Saria’s Song inside to cheer him up and earn Goron’s Bracelet.',
          'Light a Deku Stick on Darunia’s brazier, ignite all 4 torches around the giant Goron Urn to start it spinning, then climb to 2F and toss Bombs (or Bomb Flowers) into the mouth until it stops on the smiling face for Heart Piece #17.',
          'On 3F with Bombs, detonate a Bomb inside the rock tunnel right as Hot Rodder Goron rolls through to win the Bigger Bomb Bag (30).',
          'On 4F (top floor NW door), bomb through the gray boulders in the maze room to the back-left corner and roll into the wooden crate for Gold Skulltula #30.',
        ],
        secretIds: ['eq-goron-bracelet', 'hp-17', 'cap-bombs-30', 'gs-030'],
      },
      {
        id: 'goron-city-phase-2',
        title: 'Adult Link — Free Goron Tunic, Rope Platform & Darunia’s Heirloom',
        era: 'adult',
        steps: [
          'Time a Bomb (or Bow shot) to stop young Link the Goron rolling around 2F, talk to him twice to receive the heat-proof Goron Tunic for free, and pull the statue inside Darunia’s 1F room to unlock the Death Mountain Crater shortcut.',
          'Walk across the 4F rope bridges onto the central suspended stone platform and Hookshot Gold Skulltula #31 on the back of the stone arch (day or night).',
          'After clearing the Fire Temple with the Megaton Hammer, return to Darunia’s 1F chamber and speak with young Link the Goron to inspect Darunia’s Sworn-Brother Heirloom and complete Threads of Time: Darunia’s Goron Heirloom.',
        ],
        secretIds: ['eq-goron-tunic', 'gs-031', 'sw2-thread-darunia'],
      },
    ],
    proTips: [
      'Open the Lost Woods bomb shortcut on your first Child visit—both Adult Link (Odd Mushroom timed run) and Child Link can traverse it instantly.',
      'Never waste 200 Rupees buying the Goron Tunic at the shop; stopping rolling Link-Goron on 2F takes one Bomb and unlocks Darunia’s Crater passage at the same time.',
    ],
  },

  // ==========================================================================
  // 13. DEATH MOUNTAIN CRATER
  // ==========================================================================
  {
    regionId: 'death-mountain-crater',
    tagline:
      'Brave the volcanic caldera for a brand-new Switch 2 Business Scrub Heart Piece as Child Link, then claim Bolero of Fire and Double Magic as Adult Link.',
    recommendedVisitOrder:
      'Visit 1: Child Post-Dodongo (100 Rupees + Slingshot) -> Visit 2: Adult Pre/Post-Fire Temple (200 Rupees) -> Visit 3: Child + Adult Bolero Bean Cleanup',
    entrancesAndShortcuts: [
      'Summit Rim Entrance (Both Eras): Connects from the top of Death Mountain Trail beside the Great Fairy Fountain.',
      'Goron City Darunia Passage (Adult): Exits directly beside the broken bridge leading to the Fire Temple.',
      'Bolero of Fire Warp Pad: Play R -> L -> R -> L -> A -> R -> A -> R to warp either Child or Adult Link onto the central lava island (the ONLY way Child Link can reach the Crater soft soil!).',
    ],
    phases: [
      {
        id: 'death-mountain-crater-phase-1',
        title: 'Child Link — Crate, Rim Alcove & NEW Switch 2 Scrub Heart Piece',
        era: 'child',
        steps: [
          'Step into Death Mountain Crater from the summit entrance (watch the heat countdown timer!) and immediately roll into the wooden crate on your right for Gold Skulltula #32.',
          'Drop onto the lower-left rock ledge right inside the summit entrance, deflect/shoot the NEW Switch 2 Business Scrub with your Slingshot or Shield, and pay 100 Rupees for Heart Piece #21 (replaces the removed N64 Ice Cavern piece!).',
          'Re-enter from the summit with full hearts, run straight ahead to the cliff edge, climb partway down the scalable rock wall into the hidden alcove for Heart Piece #19, and climb back out before the heat timer expires.',
        ],
        secretIds: ['gs-032', 'hp-21', 'hp-19'],
      },
      {
        id: 'death-mountain-crater-phase-2',
        title: 'Adult Link — Bolero of Fire & Double Magic Great Fairy',
        era: 'adult',
        steps: [
          'Equip the Goron Tunic, enter from Goron City’s Darunia passage, and Hookshot across the broken wooden bridge stub so Sheik teaches you the Bolero of Fire (R -> L -> R -> L -> A -> R -> A -> R).',
          'After earning the Megaton Hammer inside the Fire Temple, cross the west bridge from Goron City’s exit, smash the twin red boulders, play Zelda’s Lullaby inside, and offer 200 Rupees to Great Fairy #4 for the Double Magic Meter!',
        ],
        secretIds: ['song-bolero', 'gf-04'],
      },
      {
        id: 'death-mountain-crater-phase-3',
        title: 'Cross-Era Cleanup — Bolero Warp Soil, Bean #9 & Volcano Spire',
        era: 'both',
        steps: [
          'Play Bolero of Fire as Child Link (bring Bottled Bugs + Magic Bean #9 costing 90 Rupees): before the heat timer drains your hearts, release Bugs into the soft soil beside the pad for Gold Skulltula #33, then re-warp if needed and plant Magic Bean #9.',
          'Warp back to the Crater pad as Adult Link (with Goron Tunic), ride the grown leaf platform around the caldera, and hop atop the tall central volcanic spire for Heart Piece #20.',
        ],
        secretIds: ['gs-033', 'bean-09', 'hp-20'],
      },
    ],
    proTips: [
      'NEW IN SWITCH 2: Heart Piece #21 (the 100-Rupee Business Scrub on the lower-left summit ledge) replaces the deleted Ice Cavern Red Ice Heart Piece—bring 100 Rupees right after Dodongo’s Cavern!',
      'Child Link cannot plant a Magic Bean while Gold Skulltula #33 is emerging from the same soil patch; grab the token, play Bolero of Fire again to reset the room, and plant the bean cleanly.',
      'Great Fairy #4 charges 200 Rupees in Switch 2—your starting 200-Rupee Kokiri Wallet can just barely cover it if completely full, or grab the 500-Rupee Adult’s Wallet first.',
    ],
  },

  // ==========================================================================
  // 14. ZORA'S RIVER
  // ==========================================================================
  {
    regionId: 'zoras-river',
    tagline:
      'Stock up on all 10 Magic Beans, Cucco-glide across canyon pillars, and conduct the five musical frogs for two Pieces of Heart.',
    recommendedVisitOrder:
      'Visit 1: Child Post-Dodongo -> Visit 2: Child Post-Song of Storms -> Visit 3: Adult Night With Hookshot',
    entrancesAndShortcuts: [
      'Eastern Hyrule Field Canyon Mouth: Blast the entrance boulders with Bombs (or Silver Gauntlets/Hammer later).',
      'Waterfall Entrance to Zora’s Domain: Stand on the stone crest before the roaring waterfall and play Zelda’s Lullaby (or leap through with Hover Boots as Adult).',
      'Lost Woods Underwater Pool: Right below the waterfall bridge, dive into the pool for an instant shortcut to Lost Woods.',
      'Entrance Magic Bean Lift: Plant Magic Bean #1 (10 Rupees) beside the Bean Seller to create an Adult hover ferry partway up the canyon.',
    ],
    phases: [
      {
        id: 'zoras-river-phase-1',
        title: 'Child Link — Magic Beans, Cucco Pillar Glides & Frog Minigame',
        era: 'child',
        steps: [
          'Bomb the entrance boulders, roll into the lone tree right inside the canyon for Gold Skulltula #34, buy Magic Beans from the Bean Seller (10 -> 20 -> ... -> 100 Rupees; 550 total across all 10), and plant Magic Bean #1 immediately in the adjacent soil.',
          'Pick up the entrance Cucco, carry it to the elevated bank, and glide onto the freestanding lower pillar for Heart Piece #22; grab a fresh Cucco and carry it all the way up to the waterfall ledge (toss onto dry banks before climbing ladders) to glide onto the high corner pillar for Heart Piece #23.',
          'At night, knock Gold Skulltula #35 off the wooden ladder at the base of the Zora’s Domain waterfall pool.',
          'Stand on the submerged log halfway up the river once you know all 5 standard melodies (Lullaby, Epona, Saria, Sun, Song of Time): play all 5 to grow every frog (+250 Rupees!), then pull out your Ocarina again and press each Switch 2 note (L / R / A / Y / X) as the bug appears over its frog for Heart Piece #25.',
        ],
        secretIds: ['gs-034', 'bean-01', 'hp-22', 'hp-23', 'gs-035', 'hp-25'],
      },
      {
        id: 'zoras-river-phase-2',
        title: 'Adult Link — Nighttime High Canyon Hookshot Sweep',
        era: 'adult',
        steps: [
          'Climb onto the elevated Fairy Grotto plateau halfway up Zora’s River at night and Hookshot Gold Skulltula #36 high on the southern cliff wall.',
          'Walk onto the narrow wooden bridge just below the Zora’s Domain waterfall at night, look high up the western cliff face, and Hookshot Gold Skulltula #37.',
        ],
        secretIds: ['gs-036', 'gs-037'],
      },
      {
        id: 'zoras-river-phase-3',
        title: 'Cross-Era Cleanup — Song of Storms for the Frog Choir',
        era: 'child',
        steps: [
          'After learning the Song of Storms in the Adult Windmill, return to the submerged frog log as Child Link and play Song of Storms (L -> R -> X -> L -> R -> X) for Heart Piece #24.',
        ],
        secretIds: ['hp-24'],
      },
    ],
    proTips: [
      'Growing the 5 frogs with Zelda’s Lullaby, Epona’s Song, Saria’s Song, Sun’s Song, and Song of Time pays out 50 Rupees per frog (250 Rupees total)—use those exact earnings to buy your next 3–4 Magic Beans right down the river!',
      'Memorize or screenshot the fixed frog bug-eating sequence if you miss a beat: A -> Y -> R -> Y -> A -> X -> Y -> L -> X -> L -> R -> X -> L -> A.',
    ],
  },

  // ==========================================================================
  // 15. ZORA'S DOMAIN
  // ==========================================================================
  {
    regionId: 'zoras-domain',
    tagline:
      'Win the Silver Scale and light the waterfall torches as Child Link, then witness Zora’s Domain actually thaw out after clearing the Water Temple in Switch 2!',
    recommendedVisitOrder:
      'Visit 1: Child Pre-Jabu -> Visit 2: Adult Post-Ice Cavern (Blue Fire) -> Visit 3: Adult Post-Water Temple (Thawed Domain & Biggoron Run!)',
    entrancesAndShortcuts: [
      'Zora’s River Waterfall Crest: Play Zelda’s Lullaby on the stone seal outside the waterfall.',
      'Throne Room -> Zora’s Fountain: Show Ruto’s Letter to King Zora as Child Link so he scoots aside permanently.',
      'Zora’s Domain <-> Lake Hylia Underwater Tunnel (UPDATED IN SWITCH 2!): Dive with the Silver Scale as Child Link—AND in Switch 2, beating the Water Temple thaws Zora’s Domain so Adult Link can use this underwater warp again!',
    ],
    phases: [
      {
        id: 'zoras-domain-phase-1',
        title: 'Child Link — Silver Scale Diving Game & Waterfall Torches',
        era: 'child',
        steps: [
          'Climb to the top waterfall ledge, pay the Zora 20 Rupees, and dive to collect all 5 sunken Rupees in 50 seconds for the Silver Scale—immediately dive into the underwater Lake Hylia warp tunnel at the bottom pool to grab Ruto’s Letter.',
          'Light a Deku Stick on the Zora Shop brazier (or bring Din’s Fire!) and ignite all 4 unlit torches in one brisk chain: (1) bottom of stairs, (2) shallow water torch, and (3 & 4) both torches behind the waterfall to spawn Heart Piece #26.',
        ],
        secretIds: ['eq-silver-scale', 'hp-26'],
      },
      {
        id: 'zoras-domain-phase-2',
        title: 'Adult Link — Zora Tunic, Waterfall Skulltula, Ruto’s Thread & Eyeball Frog',
        era: 'adult',
        steps: [
          'Bring Bottled Blue Fire from the Ice Cavern and pour it onto frozen King Zora in the throne room to receive a free Zora Tunic.',
          'At night, stand beside the frozen (or post-Water Temple thawed!) waterfall crest, look left, and Hookshot Gold Skulltula #38.',
          'After beating the Water Temple (which thaws the entire Domain in Switch 2!), celebrate with King Zora and the restored Zora court to complete Threads of Time: Ruto & the Unfrozen Domain, then hand Biggoron’s Prescription to King Zora for the Eyeball Frog (#9) and dive straight down into the reopened Lake Hylia underwater shortcut!',
        ],
        secretIds: ['eq-zora-tunic', 'gs-038', 'sw2-thread-ruto', 'biggoron-step-9'],
      },
    ],
    proTips: [
      'LANDMARK SWITCH 2 CHANGE: Unlike N64/3DS where Zora’s Domain stayed frozen forever, defeating Morpha in the Water Temple completely unfreezes Zora’s Domain, restores every Zora NPC, and reopens the Lake Hylia diving warp!',
      'Using the post-Water Temple thawed diving shortcut turns the notorious 2:30 Eyeball Frog timer into an effortless 25-second swim without ever needing Epona down Zora’s River.',
    ],
  },

  // ==========================================================================
  // 16. ZORA'S FOUNTAIN
  // ==========================================================================
  {
    regionId: 'zoras-fountain',
    tagline:
      'Feed Lord Jabu-Jabu and claim Farore’s Wind in the Child era, then hop Adult icebergs, sink to the lakebed, and raid the Silver Gauntlets tunnel.',
    recommendedVisitOrder:
      'Visit 1: Child Pre/Post-Jabu (Bombs + 100 Rupees) -> Visit 2: Adult Pre/Post-Ice Cavern -> Visit 3: Adult Post-Spirit Temple (Silver Gauntlets)',
    entrancesAndShortcuts: [
      'Behind King Zora’s Throne: Accessible after delivering Ruto’s Letter (Child) or walking past frozen/thawed King Zora across the icebergs to Ice Cavern (Adult).',
      'Jabu-Jabu’s Belly (Child Only) & Ice Cavern (Adult Only): Both dungeon mouths sit directly inside Zora’s Fountain.',
    ],
    phases: [
      {
        id: 'zoras-fountain-phase-1',
        title: 'Child Link — SE Tree, Farore’s Wind & Night Log Wall',
        era: 'child',
        steps: [
          'Swim to the small SE corner island and roll into the tree for Gold Skulltula #39 (scoop a Fish in the shallow water near the shore if you still need to open Jabu-Jabu’s Belly!).',
          'Once you have Bombs, Magic Meter, and 100 Rupees, bomb the gray boulder on that same SE island, play Zelda’s Lullaby inside, and pay 100 Rupees to Great Fairy #3 for Farore’s Wind.',
          'Return at night after earning the Boomerang inside Jabu-Jabu’s Belly, walk onto the partially submerged fallen log in the SW corner, and Boomerang Gold Skulltula #40 off the stone wall.',
        ],
        secretIds: ['gs-039', 'gf-03', 'gs-040'],
      },
      {
        id: 'zoras-fountain-phase-2',
        title: 'Adult Link — Iceberg Hop, Deep Lakebed & Silver Gauntlets Tunnel',
        era: 'adult',
        steps: [
          'Hop across the floating icebergs toward the Ice Cavern mouth and collect the exposed Heart Piece #27 resting on the outer ice floe.',
          'Right after claiming the Iron Boots inside Ice Cavern, sink straight to the deepest center floor of Zora’s Fountain to walk over Heart Piece #28 (quick-equip Iron Boots off to resurface cleanly!).',
          'At night after earning the Silver Gauntlets in the Spirit Temple, lift the heavy gray boulder on the SE Great Fairy island, drop into the secret tunnel past the invisible Skulltulas, and Hookshot Gold Skulltula #41 at the top.',
        ],
        secretIds: ['hp-27', 'hp-28', 'gs-041'],
      },
    ],
    proTips: [
      'Cast Farore’s Wind (100 Rupees) inside sprawling dungeons like the Water, Fire, or Shadow Temple to set an instant return warp point at key forks.',
      'You do not even need the Zora Tunic to grab Heart Piece #28 on the lakebed—with 8+ hearts you have over a minute of breath to sink with Iron Boots, grab it, and unequip.',
    ],
  },

  // ==========================================================================
  // 17. LAKE HYLIA
  // ==========================================================================
  {
    regionId: 'lake-hylia',
    tagline:
      'Dive for Ruto’s Letter, compose your Scarecrow’s Song, land prize lunkers at the Fishing Pond, and fire into the rising sun to awaken the Fire Arrows.',
    recommendedVisitOrder:
      'Visit 1: Child Silver Scale Dive -> Visit 2: Child Night + Boomerang -> Visit 3: Adult Pre & Post-Water Temple',
    entrancesAndShortcuts: [
      'Southern Hyrule Field Fences: Hop the staggered gates with Epona or climb the side ladder.',
      'Zora’s Domain Underwater Warp Tunnel: Instant Child warp—and reopens for Adult Link in Switch 2 after beating the Water Temple!',
      'Gerudo Valley River Plunge: Jumping into the Gerudo Valley canyon river washes Link directly out into western Lake Hylia.',
      'Serenade of Water Warp Pad + Lab Bean Lift: Play L -> R -> A -> A -> Y to warp to the central island, and ride Magic Bean #7 outside the Lakeside Lab straight to its roof.',
    ],
    phases: [
      {
        id: 'lake-hylia-phase-1',
        title: 'Child Link — Ruto’s Letter, Fishing, Scarecrow Tune & 3 Skulltulas',
        era: 'child',
        steps: [
          'Emerging from the Zora’s Domain underwater tunnel with the Silver Scale, dive straight down to retrieve Empty Bottle #4 (containing Ruto’s Letter).',
          'BEFORE leaving as Child Link, pull out your Ocarina in front of Bonooru (the lower scarecrow by the Fishing Pond dock) and play an easy 8-note melody (e.g., Y -> X -> Y -> X -> Y -> X -> Y -> X) to prime the Scarecrow’s Song!',
          'Pay 20 Rupees at the Fishing Pond and cast near the submerged middle-right log to land a 10+ lb lunker for Heart Piece #29.',
          'Beside the Lakeside Laboratory, drop Bottled Bugs into the soft soil for Gold Skulltula #44 and plant Magic Bean #7 (70 Rupees).',
          'At night, swim to the twin-pillar southern island to slash Gold Skulltula #42, then Boomerang Gold Skulltula #43 off the back exterior wall of the Lakeside Laboratory.',
        ],
        secretIds: [
          'bottle-04',
          'hp-29',
          'gs-044',
          'bean-07',
          'gs-042',
          'gs-043',
        ],
      },
      {
        id: 'lake-hylia-phase-2',
        title: 'Adult Link — Scarecrow’s Song, Golden Scale, Lab Dive & Fire Arrows',
        era: 'adult',
        steps: [
          'Play your saved 8-note Scarecrow’s Song back to Bonooru by the Fishing Pond to activate Pierre across all of Hyrule!',
          'Ride the Magic Bean #7 leaf (or summon Pierre and Hookshot) onto the Lakeside Lab roof and climb the watchtower ladder for Heart Piece #30; inside the Lab pool, sink with Iron Boots, roll into the underwater crate, and Hookshot Gold Skulltula #45.',
          'Win the Golden Scale at the Adult Fishing Pond by landing a 15+ lb fish (check around the stream inlet, rocks, and logs if hunting the optional Sinking Lure), then dive WITHOUT Iron Boots to the 8-meter grate floor of the Lakeside Lab pool and speak to the Professor for Heart Piece #31.',
          'Right after clearing the Water Temple (refilling Lake Hylia!), stand on the inscribed stone slab above the Water Temple island at dawn, shoot an arrow into the rising sun, and swim to the twin-pillar island for the Fire Arrows; at night, Longshot up into the giant dead tree crown on the warp island for Gold Skulltula #46.',
          'During the Biggoron’s Sword quest, swim through the thawed Zora’s Domain -> Lake Hylia tunnel to hand the Eyeball Frog to the Lab Professor for the World’s Finest Eye Drops (#10—starts a 3:30 timer back to Biggoron!).',
        ],
        secretIds: [
          'song-scarecrow',
          'hp-30',
          'gs-045',
          'eq-golden-scale',
          'hp-31',
          'eq-fire-arrows',
          'gs-046',
          'biggoron-step-10',
        ],
      },
    ],
    proTips: [
      'Register your 8-note Scarecrow’s Song as early as your first Adult trip to Lake Hylia—having Pierre active lets you clear Dodongo’s Cavern, Fire Temple, Shadow Temple, and Spirit Temple Skulltulas with zero backtracking!',
      'Inside the Lakeside Lab pool, sinking with Iron Boots does NOT trigger Heart Piece #31—you must dive naturally using `A` with the Golden Scale until your feet touch the bottom.',
      'Lake Hylia features one of the three green-glowing beds connecting to the Hall of Fallen Foes post-Forest Temple.',
    ],
  },

  // ==========================================================================
  // 18. GERUDO VALLEY
  // ==========================================================================
  {
    regionId: 'gerudo-valley',
    tagline:
      'Cucco-glide into hidden gorge alcoves as Child Link, then leap the shattered bridge on Epona as Adult Link to reach the carpenters and thieves’ stronghold.',
    recommendedVisitOrder:
      'Visit 1: Child Post-Jabu (Boomerang + Bugs + Bean) -> Visit 2: Adult With Epona or Longshot',
    entrancesAndShortcuts: [
      'Western Hyrule Field Sand Bridge: Direct canyon entrance west of the river fork.',
      'Broken Canyon Bridge (Adult): Jump the gap at full gallop on Epona—or grapple the carpenter’s signpost/post across the chasm with the Longshot! Rescuing all 4 Carpenters repairs the bridge permanently.',
      'Canyon River -> Lake Hylia Current: Diving into the bottom river sweeps Link straight out into Lake Hylia (super fast exit after planting Magic Bean #8!).',
    ],
    phases: [
      {
        id: 'gerudo-valley-phase-1',
        title: 'Child Link — Cucco Glides, Waterfall Ladder, Soil & Night Cascade',
        era: 'child',
        steps: [
          'Pick up the Cucco near the eastern plank entrance and glide diagonally across the gorge onto the narrow cliff ledge to open the NEW Switch 2 Treasure Chest for Heart Piece #33 (or Hookshot straight onto the chest later as Adult Link!).',
          'Jump into the canyon river (or glide down), swim north right through the roaring waterfall curtain, and climb the hidden wooden ladder for Heart Piece #32.',
          'Grab a fresh Cucco and glide down to the grassy cow ledge at the canyon floor: drop Bottled Bugs into the soft soil for Gold Skulltula #48, plant Magic Bean #8 (80 Rupees), and ride the river current out to Lake Hylia.',
          'At night with the Boomerang, stand on the wooden plank bridge at the valley entrance and throw the Boomerang into the small right-hand waterfall cascade for Gold Skulltula #47.',
        ],
        secretIds: ['hp-33', 'hp-32', 'gs-048', 'bean-08', 'gs-047'],
      },
      {
        id: 'gerudo-valley-phase-2',
        title: 'Adult Link — Broken Goron’s Sword & Nighttime Tent/Arch Tokens',
        era: 'adult',
        steps: [
          'Leap the broken bridge on Epona (or Longshot across) and hand the Poacher’s Saw to Mutoh, the boss carpenter outside the tent, to receive the Broken Goron’s Sword (#7).',
          'At night on the west side of the bridge, Hookshot TWO Gold Skulltulas: #49 on the rock wall directly behind the Carpenters’ Tent and #50 clinging to the underside of the natural stone arch pillar across the gorge.',
        ],
        secretIds: ['biggoron-step-7', 'gs-049', 'gs-050'],
      },
    ],
    proTips: [
      'SWITCH 2 QUALITY-OF-LIFE: Heart Piece #33 on the narrow canyon ledge was upgraded from a wooden crate to a Treasure Chest—meaning Adult Link can now Hookshot directly onto the chest without needing a Child Cucco glide!',
      'Play Epona’s Song beside the Cow at the bottom of Gerudo Valley canyon if you need a free milk refill before riding the river current to Lake Hylia.',
    ],
  },

  // ==========================================================================
  // 19. GERUDO'S FORTRESS
  // ==========================================================================
  {
    regionId: 'gerudo-fortress',
    tagline:
      'Free all four imprisoned Carpenters to earn Gerudo membership, then use Switch 2 gyro aiming to dominate the Horseback Archery Range.',
    recommendedVisitOrder:
      'Visit 1: Adult With Epona, Bow & Hookshot/Longshot -> Visit 2: Nighttime Token & Training Ground Cleanup',
    entrancesAndShortcuts: [
      'West Ascent from Gerudo Valley: Accessible in the Adult era after crossing the canyon bridge.',
      'Haunted Wasteland Gate (NW): Opens permanently once a guard opens it after you earn the Gerudo Membership Card.',
      'Gerudo Training Ground Gate (Center): Costs 10 Rupees per entry once you hold the Gerudo Membership Card.',
    ],
    phases: [
      {
        id: 'gerudo-fortress-phase-1',
        title: 'Adult Link — Rescuing All 4 Carpenters & Rooftop Chest',
        era: 'adult',
        steps: [
          'Stun patrolling Gerudo guards silently with the Bow or Hookshot and rescue all 4 Carpenters inside Thieves’ Hideout (defeating a twin-scimitar Gerudo Fighter for each Small Key) to earn the Gerudo Membership Card.',
          'Climb through the upper hideout exits to the highest fortress roof overlooking the isolated wooden chest: summon Pierre with the Scarecrow’s Song + Hookshot across (or Longshot straight onto the chest / float with Hover Boots!) for Heart Piece #34.',
          'At night, climb to the middle exterior fortress tier and Hookshot Gold Skulltula #51 clinging high on the central cliff face.',
        ],
        secretIds: ['eq-gerudo-card', 'hp-34', 'gs-051'],
      },
      {
        id: 'gerudo-fortress-phase-2',
        title: 'Adult Link — Horseback Archery, Target Pole Token & Nabooru’s Accord',
        era: 'adult',
        steps: [
          'Ride Epona east to the Horseback Archery Range (20 Rupees per round; daylight only): use Switch 2 gyro aiming to hit pots and bullseyes for 1,000+ points to claim Heart Piece #35.',
          'Play a second Horseback Archery round and score 1,500+ points (draw your next arrow while turning around at the end post to rapid-fire the central bullseye!) to win the Biggest Quiver (50).',
          'Return to the Archery Range at night on foot and Hookshot the back of the northernmost wooden target pole for Gold Skulltula #52.',
          'Once you hold both the Gerudo Membership Card and the Mirror Shield after awakening Nabooru in the Spirit Temple, speak with Nabooru’s lieutenant overlooking the repaired canyon bridge to complete Threads of Time: Nabooru’s Desert Accord.',
        ],
        secretIds: ['hp-35', 'cap-quiver-50', 'gs-052', 'sw2-thread-nabooru'],
      },
    ],
    proTips: [
      'Switch 2 gyro aiming transforms Horseback Archery from one of N64’s hardest minigames into a reliable two-run sweep—hold `ZR`/Bow aim and tilt gently as Epona auto-gallops along the track.',
      'If you already own the Longshot from the Water Temple, you can grapple directly onto the Heart Piece #34 rooftop chest without needing Pierre or Hover Boots.',
    ],
  },

  // ==========================================================================
  // 20. HAUNTED WASTELAND (MIRAGE DESERT)
  // ==========================================================================
  {
    regionId: 'haunted-wasteland',
    tagline:
      'Cross the sinking River of Sand, raid the lone stone bunker for its Gold Skulltula, and follow the phantom Poe Guide through the blinding sandstorm.',
    recommendedVisitOrder:
      'Adult Pre-Spirit Temple — Required: Gerudo Membership Card + Longshot (or Hover Boots) + Lens of Truth',
    entrancesAndShortcuts: [
      'Eastern Gate from Gerudo’s Fortress: Speak to the guard atop the gatehouse post to raise the iron portcullis.',
      'Requiem of Spirit Bypass: Once you emerge into Desert Colossus and learn Requiem of Spirit outside the Spirit Temple, you NEVER have to walk through Haunted Wasteland again!',
    ],
    phases: [
      {
        id: 'haunted-wasteland-phase-1',
        title: 'Adult Link — River of Sand & Stone Shelter Skulltula',
        era: 'adult',
        steps: [
          'Cross the quicksand River of Sand by grappling the wooden crate on the far bank with the Longshot (or sprinting across the narrowest seam with the Hover Boots).',
          'Follow the line of wooden flagpoles through the sandstorm (rolling from post to post; ignore the detour sign leading to Leevers unless visiting the Magic Carpet Bombchu Merchant) until you reach the square stone structure.',
          'Climb down the ladder inside the stone shelter, Hookshot Gold Skulltula #53 off the interior wall, and read the inscription warning that you will need the "Eye of Truth" ahead.',
        ],
        secretIds: ['gs-053'],
      },
      {
        id: 'haunted-wasteland-phase-2',
        title: 'Adult Link — Lens of Truth Poe Guide Trek',
        era: 'adult',
        steps: [
          'Climb atop the stone shelter and toggle the Lens of Truth (pulse it on and off every few seconds to conserve magic!) to spot the friendly Poe Guide hovering above.',
          'Stay close behind the Poe’s erratic path through the howling sandstorm—if you lose sight of it, immediately toggle the Lens before drifting into the warp sand—until the storm clears at the entrance to Desert Colossus.',
        ],
        secretIds: [],
      },
    ],
    proTips: [
      'On Switch 2’s world map collectible tally, this province is listed as Haunted Wasteland / Mirage Desert with 1 Adult Gold Skulltula and 0 Heart Pieces—grab Gold Skulltula #53 on your first crossing so the region turns 100% complete immediately!',
      'Tap the Lens of Truth on and off rhythmically while trailing the Poe Guide—toggling faster than 1 second barely drains your Magic Meter at all.',
    ],
  },

  // ==========================================================================
  // 21. DESERT COLOSSUS
  // ==========================================================================
  {
    regionId: 'desert-colossus',
    tagline:
      'Learn Requiem of Spirit to bridge both eras across the desert, claim Nayru’s Love, and ride the final Magic Bean across the stone arch and mesa.',
    recommendedVisitOrder:
      'Visit 1: Adult Arrival (300 Rupees + Adult’s Wallet!) -> Visit 2: Child Requiem Warp (Bug + 100R Bean) -> Visit 3: Adult Night Bean Cleanup',
    entrancesAndShortcuts: [
      'Haunted Wasteland East Canyon: One-time Adult entry on foot.',
      'Requiem of Spirit Warp Pad: Play L -> R -> L -> A -> R -> L to warp straight to the Spirit Temple plaza—this is the ONLY way Child Link can ever reach Desert Colossus!',
      'Spirit Temple Stairs Magic Bean Lift: Plant Magic Bean #10 (100 Rupees) as Child Link to unlock both the central Stone Arch Heart Piece and the SW Mesa Gold Skulltula.',
    ],
    phases: [
      {
        id: 'desert-colossus-phase-1',
        title: 'Adult Link — Requiem of Spirit, Nayru’s Love & Oasis Pond',
        era: 'adult',
        steps: [
          'Walk up into the Spirit Temple foyer, read the twin inscriptions, and step right back outside so Sheik descends and teaches you the Requiem of Spirit (L -> R -> L -> A -> R -> L).',
          'Head to the NE cliff wall nestled between two palm trees, bomb the cracked rock face, play Zelda’s Lullaby inside, and offer 300 Rupees (requires the 500-Rupee Adult’s Wallet!) to Great Fairy #5 for Nayru’s Love.',
          'In the SE corner, stand on the stone block beside the dry oasis crater and play the Song of Storms to refill the Desert Oasis Pond permanently with Bottled Fairies; at night, Hookshot Gold Skulltula #55 off the oasis palm tree.',
        ],
        secretIds: [
          'song-requiem',
          'gf-05',
          'grotto-oasis-fairies',
          'gs-055',
        ],
      },
      {
        id: 'desert-colossus-phase-2',
        title: 'Child Link — Requiem Warp Soil Skulltula & Final Magic Bean',
        era: 'child',
        steps: [
          'Return to the Temple of Time, become Child Link, and play Requiem of Spirit with Bottled Bugs + Magic Bean #10 (100 Rupees) in your inventory.',
          'Drop Bottled Bugs into the soft soil patch right beside the Spirit Temple stairs for Gold Skulltula #54, re-warp via Requiem (or enter/exit the Spirit Temple) to clear the patch, and plant Magic Bean #10 (before entering the Child wing of the Spirit Temple!).',
        ],
        secretIds: ['gs-054', 'bean-10'],
      },
      {
        id: 'desert-colossus-phase-3',
        title: 'Adult Link — Stone Archway Heart Piece & Nighttime Mesa Token',
        era: 'adult',
        steps: [
          'Warp back to Desert Colossus as Adult Link at night and step onto your grown Magic Bean #10 leaf platform.',
          'Hop atop the tall central stone archway as the leaf glides past for Heart Piece #36 (final overworld Heart Piece!), then ride the leaf’s loop over to the flat SW stone mesa at night to slash Gold Skulltula #56.',
        ],
        secretIds: ['hp-36', 'gs-056'],
      },
    ],
    proTips: [
      'SWITCH 2 WALLET CHECK: Great Fairy #5 (Nayru’s Love) charges 300 Rupees—make sure you turned in at least 10 Gold Skulltulas in Kakariko for the 500-Rupee Adult’s Wallet and arrived with 300+ Rupees before trekking across the desert!',
      'Refilling the SE Oasis with Song of Storms spawns free fairies right outside the Spirit Temple boss run.',
    ],
  },

  // ==========================================================================
  // 22. INSIDE THE GREAT DEKU TREE (DUNGEON #1)
  // ==========================================================================
  {
    regionId: 'deku-tree',
    tagline:
      'Your inaugural Child dungeon: claim the Fairy Slingshot, shatter the central spiderweb into the flooded basement, and dethrone Queen Gohma.',
    recommendedVisitOrder:
      'Child Dungeon #1 — Required: Kokiri Sword & Deku Shield (Quick backtrack post-Jabu with Bombs + Boomerang for 4th Skulltula)',
    entrancesAndShortcuts: [
      'East Kokiri Forest Meadow: Show Mido your equipped Kokiri Sword and Deku Shield to open the path.',
      '3F -> B1 Web Plunge: Jump directly off the 3F upper landing onto the center of the 1F floor web to smash straight into the B1 basement.',
      'B1 Block Shortcut: Push the movable stone block off the B1 south ledge once lit so you can climb straight out of the water if you fall.',
    ],
    phases: [
      {
        id: 'deku-tree-phase-1',
        title: 'Preparation & Required Loadout',
        era: 'child',
        steps: [
          'Equip the Kokiri Sword and Deku Shield, and slice the Withered Deku Babas right inside the 1F trunk to stock up on Deku Sticks (essential for torch puzzles and melting Queen Gohma!).',
          'Note that Inside the Great Deku Tree uses 0 Small Keys—every locked door opens via switches, torches, or enemy clears.',
        ],
        secretIds: [],
      },
      {
        id: 'deku-tree-phase-2',
        title: 'Room-by-Room Slingshot & 2-3-1 Scrub Route',
        era: 'child',
        steps: [
          '1F -> 2F: Climb the central ladder to 2F, enter the west door, deflect the Deku Scrub’s nut with your Shield, hop the timed platform, and open the chest for the Fairy Slingshot (shoot the ladder above the door to exit).',
          '2F -> 3F -> B1: Climb the 2F vines to 3F, grab the Compass in the side room (defeat Gohma Larvae + boulder), then leap off the 3F railing squarely onto the 1F center floor web to plunge into B1.',
          'B1 Basement Loop: Step on the floor button to ignite the torch, burn the east spiderweb with a Deku Stick, shoot the eye switch above the door with your Slingshot, dive onto the underwater switch on the west side, and ride the floating platform across.',
          'Pre-Boss Sequence: Defeat the Gohma Larvae in the dark torch room -> burn the ceiling web in the spike-roller room -> push the B1 shortcut block -> carry a lit Deku Stick across the shallow pool from the main brazier to burn the lower web -> deflect the three Deku Scrubs in exact **2 -> 3 -> 1** order (Middle, Right, Left!) to unseal Queen Gohma’s lair.',
        ],
        secretIds: ['eq-slingshot', 'boss-hc-deku', 'stone-emerald'],
      },
      {
        id: 'deku-tree-phase-3',
        title: 'Gold Skulltula & Collectible Sweep (4 Tokens)',
        era: 'child',
        steps: [
          'Gold Skulltula #57 (First Visit): Inside the 3F Compass room, climb the left-hand stone blocks and slash the spider on the wall.',
          'Gold Skulltula #58 & #59 (First Visit): On B1 right after plunging through the web, jump-slash #58 on the metal sewer grate, then shoot #59 on the climbable vines behind the torch switch with your Slingshot.',
          'Gold Skulltula #60 (Backtrack w/ Bombs + Boomerang): Return to B1 behind the 3-Scrub room, burn the side web to crawl into the Skullwalltula room, bomb the cracked stone wall on the far ledge, and Boomerang the high token inside.',
        ],
        secretIds: ['gs-057', 'gs-058', 'gs-059', 'gs-060'],
      },
    ],
    bossStrategy: {
      bossName: 'Queen Gohma',
      weakness: 'Fairy Slingshot / Deku Nuts (Red Eye) + Deku Stick Jump-Slash',
      strategy:
        'Look up at the ceiling to trigger the fight, then wait for Queen Gohma’s eye to flash bright red (in Switch 2 she feints once before locking in!). Stun her immediately with a Slingshot seed or Deku Nut when she lands or clings low, run up holding a Deku Stick, and land a Deku Stick jump-slash followed by rapid crouch-stabs (`ZL/R + B`) to defeat her in 1–2 cycles before she hatches eggs.',
    },
    proTips: [
      'Memorize "Twenty-three is number one!" (`2 -> 3 -> 1`, i.e., Center -> Right -> Left) for the B1 Scrub trio.',
      'A single Deku Stick jump-slash deals 4x the damage of a regular Kokiri Sword swing—keep your stick intact so you don’t waste sticks on regular Skullwalltulas.',
    ],
  },

  // ==========================================================================
  // 23. DODONGO'S CAVERN (DUNGEON #2)
  // ==========================================================================
  {
    regionId: 'dodongos-cavern',
    tagline:
      'Blast through volcanic stone halls with Bomb Flowers to claim your Bomb Bag, light the giant Dodongo skull’s eyes, and topple King Dodongo.',
    recommendedVisitOrder:
      'Child Dungeon #2 — Required: Goron’s Bracelet (Quick Adult backtrack with Scarecrow’s Song + Hookshot for 2 high Skulltulas)',
    entrancesAndShortcuts: [
      'Death Mountain Trail Plaza: Toss a Bomb Flower from the ledge directly above Dodongo’s Cavern as Child Link to shatter the sealed rock entrance permanently.',
      '1F -> 2F Rising Pillar Elevator: Stand on the central stone pillar in the west hall to ride straight between 1F and 2F once unlocked.',
    ],
    phases: [
      {
        id: 'dodongos-cavern-phase-1',
        title: 'Preparation & Required Loadout',
        era: 'both',
        steps: [
          'Obtain Goron’s Bracelet from Darunia in Goron City first so Child Link can uproot Bomb Flowers, and bring your free Hylian Shield from Kakariko Graveyard so Fire Keese cannot burn up your wooden Deku Shield!',
          'Like the Deku Tree, Dodongo’s Cavern requires 0 Small Keys—Bomb Flowers and your mid-dungeon Bomb Bag open every sealed wall.',
        ],
        secretIds: [],
      },
      {
        id: 'dodongos-cavern-phase-2',
        title: 'Room-by-Room Bomb Bag & Giant Skull Route',
        era: 'child',
        steps: [
          '1F Main Hall -> East Wing: Toss Bomb Flowers to shatter the center rock wall and east cracked wall -> push the Armos statue onto the blue floor switch in the Baby Dodongo corridor -> duel the two Lizalfos -> light all 3 torches in the Dodongo room -> hit the 1F south switch to unseal the west door.',
          '1F West Wing -> 2F Bomb Bag: Plant a Bomb Flower squarely between the row of dormant Bomb Flowers at the base of the stone staircase to chain-detonate and lower the stairs -> climb to 2F -> shoot the eye switch above the fire platform -> defeat the second Lizalfos pair -> open the big chest for the Bomb Bag (20)!',
          'Giant Skull Bridge -> King Dodongo: Step on the 2F switch, cross the high suspension bridge, and drop one Bomb into EACH eye socket of the giant stone Dodongo skull below -> enter its open jaws on 1F -> navigate the east/north block corridor, pull the center block into the floor socket, and bomb the cracked floor tile in the boss antechamber to plunge into King Dodongo’s lava pit.',
        ],
        secretIds: ['eq-bomb-bag', 'boss-hc-dodongo', 'stone-ruby'],
      },
      {
        id: 'dodongos-cavern-phase-3',
        title: 'Gold Skulltula & Collectible Sweep (3 Child + 2 Adult)',
        era: 'both',
        steps: [
          'Child Pass (#61, #63, #64): Lure a Baby Dodongo (or drop a Bomb) against the cracked side wall in the 1F east corridor for #61; slash #63 on the upper vines right after lowering the 1F/2F Bomb-Flower staircase; and bomb the cracked wall behind the lone Armos statue in the 1F/2F north pre-boss room for #64.',
          'Adult Backtrack (#62 & #65): Return in the Adult era with Hookshot + Scarecrow’s Song: summon Pierre in the 1F east Baby Dodongo vine corridor to Hookshot into the 2F alcove for #62, and Hookshot into the high side alcove of the 1F west rising-pillar room for #65!',
        ],
        secretIds: ['gs-061', 'gs-063', 'gs-064', 'gs-062', 'gs-065'],
      },
    ],
    bossStrategy: {
      bossName: 'King Dodongo',
      weakness: 'Bombs / Bomb Flowers tossed into inhaling jaws + Jump-Slash',
      strategy:
        'Stand near the inner sloped rim bordering the lava—King Dodongo’s rolling boulder charge misses completely if you hug that inner bevel (or crouch under your Hylian Shield!). The instant he stops and inhales deeply for fire breath, toss a Bomb (or arena Bomb Flower) into his open mouth, then rush in with a Deku Stick jump-slash to finish him in 2–3 cycles.',
    },
    proTips: [
      'Equip your Graveyard Hylian Shield whenever Fire Keese swoop in—pressing `R` (crouch-turtle) makes Child Link completely immune to fire bats and rolling Dodongo charges.',
      'Grab the Death Mountain Summit Great Fairy (25 Rupees -> Magic Meter + Din’s Fire) immediately upon exiting Dodongo’s Cavern!',
    ],
  },

  // ==========================================================================
  // 24. INSIDE JABU-JABU'S BELLY (DUNGEON #3)
  // ==========================================================================
  {
    regionId: 'jabu-jabus-belly',
    tagline:
      'Escort Princess Ruto through electrified flesh caverns, claim the Boomerang, sever the parasitic tentacles, and vanquish Barinade in one complete sweep.',
    recommendedVisitOrder:
      'Child Dungeon #3 (CHILD-ONLY!) — Required: Bottled Fish + Fairy Slingshot (Collect all 4 Skulltulas on Visit 1!)',
    entrancesAndShortcuts: [
      'Zora’s Fountain Mouth (Child Only): Release a Bottled Fish directly in front of Lord Jabu-Jabu’s jaws to get vacuumed inside (Lord Jabu-Jabu vanishes in the Adult era—return via Pedestal of Time if you ever miss a Skulltula!).',
      '1F Pit Drop Shortcut: Dropping down the rightmost pit in the 1F forked pit room lands you directly in front of the B1 twin switches.',
    ],
    phases: [
      {
        id: 'jabu-jabus-belly-phase-1',
        title: 'Preparation & Required Loadout',
        era: 'child',
        steps: [
          'Catch a Fish in the shallow shore of Zora’s Domain or Zora’s Fountain using an Empty Bottle, stock up on Deku Seeds and Deku Sticks, and remember that 0 Small Keys exist here.',
          'Never attack electrical Bari jellyfish or Stingers with your bare Kokiri Sword—use your Slingshot, carried Ruto, or the Boomerang so you never take shock damage!',
        ],
        secretIds: [],
      },
      {
        id: 'jabu-jabus-belly-phase-2',
        title: 'Room-by-Room Boomerang, Tentacles & Big Octo Route',
        era: 'child',
        steps: [
          'Finding Ruto & Boomerang: Shoot the ceiling uvula switch with your Slingshot -> follow Princess Ruto down the pit in the forked hall -> talk to her twice and carry her (`A`) through the B1 door -> toss Ruto across the water channel, step on the ceiling/water switch, and carry her to the B1 rooms -> ride the rising elevator back to 1F -> hold down the yellow floor switch with Ruto, clear the 4 Stingers in the east wing, and claim the Boomerang!',
          'Severing the 3 Tentacles: Lock onto and stun/sever the Red Tentacle (west room), Yellow/Blue Tentacle (center-east room), and Green Tentacle (north room) with repeated Boomerang throws—each vanished tentacle clears its corresponding fleshy barrier elsewhere in the dungeon.',
          'Big Octo & Pre-Boss Hall: Toss Ruto onto the Zora’s Sapphire pedestal on B1 to trigger the **Big Octo** mini-boss: chase it clockwise, stun it from behind with the Boomerang so it spins around, and slash the glowing green orb on its back! Next, stun the red wobbly platforms with your Boomerang to cross 1F west, carry a wooden crate onto the blue switch, and climb the pre-boss room vines.',
        ],
        secretIds: ['eq-boomerang', 'boss-hc-jabu', 'stone-sapphire'],
      },
      {
        id: 'jabu-jabus-belly-phase-3',
        title: 'Gold Skulltula & Collectible Sweep (All 4 in One Visit)',
        era: 'child',
        steps: [
          'Gold Skulltula #66: In the B1 water-switch corridor right after dropping down with Ruto, shoot the ceiling switch to raise the water level and slash/Boomerang the spider on the vine wall.',
          'Gold Skulltula #67 & #68: Right where Ruto drops onto B1 before the Zora’s Sapphire room, use your newly acquired Boomerang to snag BOTH tokens (#67 and #68) clinging to the adjacent fleshy walls.',
          'Gold Skulltula #69: In the final 1F room right before Barinade’s boss door, drop the wooden crate onto the switch, climb the vines to the upper ledge, and throw the Boomerang through the web gap.',
        ],
        secretIds: ['gs-066', 'gs-067', 'gs-068', 'gs-069'],
      },
    ],
    bossStrategy: {
      bossName: 'Barinade',
      weakness: 'Boomerang (sever tentacles, sweep Bari ring & stun core) + Jump-Slash',
      strategy:
        'Keep Z/ZL-targeted and circle-strafe continuously so Barinade’s lightning bolts miss behind you. Phase 1: Boomerang the 3 fleshy ceiling tentacles attaching Barinade to the roof. Phase 2: Throw the Boomerang at Barinade’s central body to stun the core and slice away the spinning ring of Bari jellyfish. Phase 3: Once naked and zipping across the floor, stun Barinade with the Boomerang and finish with Deku Stick or Kokiri Sword jump-slashes.',
    },
    proTips: [
      'Jabu-Jabu’s Belly is the ONLY dungeon completely inaccessible to Adult Link—double-check your map’s golden skulltula emblem next to the dungeon name before leaving!',
      'Throwing Princess Ruto directly at Bubble skulls or Octoroks damages them for free without spending ammo.',
    ],
  },

  // ==========================================================================
  // 25. FOREST TEMPLE (ADULT DUNGEON #1)
  // ==========================================================================
  {
    regionId: 'forest-temple',
    tagline:
      'Hunt the four Poe Sisters through twisted hallways and overgrown courtyards to claim the Fairy Bow and unlock both Time Travel and the Hall of Fallen Foes.',
    recommendedVisitOrder:
      'Adult Dungeon #1 — Required: Hookshot & Song of Time (All 5 Gold Skulltulas obtainable in Visit 1!)',
    entrancesAndShortcuts: [
      'Sacred Forest Meadow Warp Pad: Play Minuet of Forest (L -> X -> Y -> A -> Y -> A) and Hookshot the high tree branch above the ruined terrace to pull yourself onto the entrance ledge.',
      'Central 4-Torch Elevator: Restoring all 4 Poe flames lowers the central B2 elevator straight to Phantom Ganon.',
    ],
    phases: [
      {
        id: 'forest-temple-phase-1',
        title: 'Preparation & Required Loadout',
        era: 'adult',
        steps: [
          'Grab the Hookshot from Dampé’s Grave in Kakariko Graveyard first, and stock a Bottled Fairy from the hidden grotto inside the Sacred Forest Meadow maze.',
          'CRITICAL KEY #1 CHECK: In the very first 1F entrance hall (with two Wolfos), climb the right-hand vines into the tree canopy to grab Small Key #1 BEFORE entering the central chamber—missing this key is the #1 cause of getting stuck mid-dungeon!',
        ],
        secretIds: [],
      },
      {
        id: 'forest-temple-phase-2',
        title: 'Room-by-Room 5 Keys, Fairy Bow & 4 Poe Sisters Route',
        era: 'adult',
        steps: [
          'Keys #2 & #3 + Block Push: Watch the 4 Poe Sisters steal the central hall flames -> defeat the two Blue Stalfos in 1F west (**Key #2**) -> play Song of Time on the blue block into the NE courtyard, climb the vines (unlocked by shooting the drainage eye switch from the balcony -> **Key #3** in drained well!), and push the colored blocks up the 2F west ladder shaft (follow the floor arrows!).',
          'Fairy Bow & Boss Key: Traverse the twisted west corridor, leap across to grab **Key #4**, unlock the upper door, and defeat the 3-Stalfos arena to claim the **Fairy Bow**! Shoot the portrait ghosts in the east/west stairwells (**Joelle** & **Beth**, yielding **Key #5**), then shoot the golden eye switch outside the west twisted corridor to untwist the room and drop into the **Boss Key** chest!',
          'Final 2 Poes & B2 Rotation: Drop through the floor hole after the Boss Key, defeat the Green Bubble, climb into **Amy**’s room (reassemble her sliding block puzzle under 1:00 and shoot her), then drop back to the 1F central hall to face **Meg**: spin your camera around all 4 clones and shoot ONLY the clone that spins once as she appears! Ride the restored elevator to B2 and push the rotating gallery walls to hit the hidden switches opening Phantom Ganon’s door.',
        ],
        secretIds: ['eq-bow', 'boss-hc-forest', 'medallion-forest'],
      },
      {
        id: 'forest-temple-phase-3',
        title: 'Gold Skulltula & Collectible Sweep (All 5 in One Pass)',
        era: 'adult',
        steps: [
          'Gold Skulltula #70 & #71: Climb/Hookshot the right-hand vines in the 1F entrance Wolfos hall (#70), then Hookshot #71 right beside the north staircase doorway in the 1F central 4-torch hall.',
          'Gold Skulltula #72 & #73: From the 2F balcony overlooking the NE courtyard, Hookshot the chest on the stone island and Hookshot #72 on the ruin arch; later on the upper stone walkway of the NW courtyard, Hookshot #73 behind the hearts pillar.',
          'Gold Skulltula #74: Down in the B2 rotating pre-boss chamber, push the rotating walls counterclockwise until the hidden side alcove reveals the final token.',
        ],
        secretIds: ['gs-070', 'gs-071', 'gs-072', 'gs-073', 'gs-074'],
      },
    ],
    bossStrategy: {
      bossName: 'Phantom Ganon',
      weakness: 'Fairy Bow (Phase 1 paintings) + Master Sword Dead Man’s Volley (Phase 2)',
      strategy:
        'Phase 1: Stand in the center of the Triforce floor with your Bow drawn (use Switch 2 gyro aiming for rapid snaps). Two riders charge down opposite paintings—ignore the pale decoy that turns back and loose an arrow into the darker, purple-swirling real Phantom Ganon just as he leaps into the room (3 hits). Phase 2: Lock onto floating Phantom Ganon and bat his electric energy spheres back with timed Master Sword slashes (stand closer as the rally speeds up!), then sprint in for jump-slashes while he writhes on the floor.',
    },
    proTips: [
      'DOUBLE MILESTONE UNLOCK: Immediately after beating the Forest Temple, warp/walk to the Temple of Time to learn Prelude of Light (unlocking Time Travel) AND visit Kakariko as Child Link to unlock the Switch 2 Hall of Fallen Foes!',
      'Watch out for Wallmasters’ expanding floor shadows in twisted corridors—roll away as soon as you hear the descending whoosh, then slash the landed hand for easy magic/arrows.',
    ],
  },

  // ==========================================================================
  // 26. FIRE TEMPLE (ADULT DUNGEON #2)
  // ==========================================================================
  {
    regionId: 'fire-temple',
    tagline:
      'Free eight imprisoned Goron elders across five volcanic stories, wield the Megaton Hammer, and smash the ancient dragon Volvagia.',
    recommendedVisitOrder:
      'Adult Dungeon #2 — Required: Goron Tunic + Hookshot + Bombs (Bring Scarecrow’s Song registered to grab all 5 Skulltulas in one pass!)',
    entrancesAndShortcuts: [
      'Bolero of Fire Crater Pad: Play R -> L -> R -> L -> A -> R -> A -> R and climb down the ladder behind the central Crater shrine into the Fire Temple.',
      '1F Central Pillar Smash: Once you claim the Megaton Hammer on 5F, drop to the 1F entrance hall and smash the tall stone pillar in front of the boss bridge so you can reach Volvagia directly from 1F if needed.',
    ],
    phases: [
      {
        id: 'fire-temple-phase-1',
        title: 'Preparation & Required Loadout',
        era: 'adult',
        steps: [
          'Equip the Goron Tunic (free from rolling Link-Goron in Goron City) and verify you already activated Pierre’s Scarecrow’s Song at Lake Hylia—2 of the Fire Temple’s 5 Gold Skulltulas sit up a secret 4F->5F Scarecrow climb!',
          'Bring 15+ Bombs and your Fairy Bow for eye switches and hidden cracked walls along the 3F boulder maze.',
        ],
        secretIds: [],
      },
      {
        id: 'fire-temple-phase-2',
        title: 'Room-by-Room 8 Goron Keys, Megaton Hammer & Boss Key Route',
        era: 'adult',
        steps: [
          '1F -> 3F Keys (#1–#6): Enter the 1F left door near Darunia to free Goron #1 (**Key #1**) -> enter the large 1F east Lava Bridge chamber to free Goron #2 (south alcove, **Key #2**) and Goron #3 (bomb cracked wall on north/east side, **Key #3**) -> push the metal block onto the flame geyser to ride up to 2F -> navigate the 3F Rolling Boulder Maze to rescue Gorons #4 & #5 (**Keys #4 & #5**), shoot the eye switch / climb above the maze, and bomb the cracked floor tile to drop into Goron #6’s cell (**Key #6**).',
          '4F -> 5F Megaton Hammer: Outrun the chasing wall of fire across the wire grates -> hit the crystal switch on 4F (or bomb the fake door) to defeat **Flare Dancer #1** (Hookshot its core out of its fire coat and slash!) -> climb to 5F, step on the floor switch, and sprint counterclockwise around the narrow crescent rim before the fire ring returns to claim the **Megaton Hammer**!',
          'Descent & Boss Key (#7–#8): Pound the 5F/4F floor pillars and rusted switches down the west wing (freeing Gorons #7 & #8 if grabbing all keys) -> back in the 1F entrance hall, smash the stone totem blocking the left door with the Megaton Hammer, defeat **Flare Dancer #2**, and pound the floor switch/totems through the B1 cells to free the final Goron guarding the **Boss Key** -> smash the 1F central boss-room pillar to reach Volvagia!',
        ],
        secretIds: ['eq-megaton-hammer', 'boss-hc-fire', 'medallion-fire'],
      },
      {
        id: 'fire-temple-phase-3',
        title: 'Gold Skulltula & Collectible Sweep (All 5 in One Pass)',
        era: 'adult',
        steps: [
          'Gold Skulltula #75: In the 1F Lava Bridge chamber, cross to the blue block alcove, play the Song of Time, climb up into the Like-Like/flying-tile room, and Hookshot the token.',
          'Gold Skulltula #76: On the ground floor of the 3F Rolling Boulder Maze, listen for the hollow stone wall (or check your Echo Gem pulse!) along the eastern passage and bomb it open.',
          'Gold Skulltula #77 & #78 (Scarecrow Climb): From the northern ledge of the 3F Boulder Maze, play the Scarecrow’s Song to summon Pierre on 4F, Hookshot up, ride the chain platform to 5F, slash #77 on the climbable wire wall, and continue into the 5F circular 200-Rupee chest room for #78!',
          'Gold Skulltula #79: Behind the 1F entrance staircase’s left stone totem (smashed with the Megaton Hammer en route to the Boss Key), Hookshot the spider inside the side cell.',
        ],
        secretIds: ['gs-075', 'gs-076', 'gs-077', 'gs-078', 'gs-079'],
      },
    ],
    bossStrategy: {
      bossName: 'Volvagia',
      weakness: 'Megaton Hammer (concuss emerging head) + Master Sword Jump-Slash',
      strategy:
        'Keep your Megaton Hammer and Fairy Bow ready on the central lava island. Watch the 9 bubbling pits—sparks rise first from a decoy hole, then brighter magma erupts from Volvagia’s true hole: dodge his initial flame swipe, slam his head with the Megaton Hammer to stun him flat, and follow with a Master Sword jump-slash + crouch-stabs! Whenever Volvagia flies up to rain boulders across the platform, simply climb partway down the platform’s outer cliff edge—every falling rock sails harmlessly over your head.',
    },
    proTips: [
      'Having the Switch 2 Echo Gem (20 Skulltulas) equipped inside the 3F Rolling Boulder Maze pulses directly in front of the uncracked bomb wall hiding Gold Skulltula #76.',
      'Step outside into Death Mountain Crater right after beating Volvagia with 200 Rupees to unlock Double Magic behind the two red Hammer boulders!',
    ],
  },

  // ==========================================================================
  // 27. ICE CAVERN (ADULT MINI-DUNGEON)
  // ==========================================================================
  {
    regionId: 'ice-cavern',
    tagline:
      'Harvest free Bottled Blue Fire, solve the sliding ice block puzzle, and defeat the White Wolfos for the Iron Boots and Serenade of Water.',
    recommendedVisitOrder:
      'Adult Mini-Dungeon (Pre-Water Temple) — Required: Hookshot + 3–4 Empty Bottles',
    entrancesAndShortcuts: [
      'Zora’s Fountain Floating Icebergs: Hop across the spinning ice floes in front of frozen Jabu-Jabu’s cove as Adult Link.',
      'Exit Pit Drop Shortcut: Dropping down the pit behind the Iron Boots chest returns you directly to the Ice Cavern foyer above Zora’s Fountain (and unlocks Serenade of Water for Lake Hylia!).',
    ],
    phases: [
      {
        id: 'ice-cavern-phase-1',
        title: 'Preparation & Required Loadout',
        era: 'adult',
        steps: [
          'Arrive with the Hookshot (mandatory for all 3 Gold Skulltulas here!) and empty out 3–4 of your Bottles so you can scoop free Blue Fire for Ice Cavern’s Red Ice walls PLUS frozen King Zora outside.',
          'SWITCH 2 HEADS-UP: Do NOT search for the old N64 Red Ice Piece of Heart—Switch 2 removed all Heart Pieces inside dungeons and moved that piece to the Death Mountain Crater Business Scrub!',
        ],
        secretIds: [],
      },
      {
        id: 'ice-cavern-phase-2',
        title: 'Silver Rupee Chambers, Blue Fire, Iron Boots & Serenade',
        era: 'adult',
        steps: [
          'Spinning Blade Hall -> Blue Fire Font: Shatter the Freezards at the entrance -> collect all 5 Silver Rupees in the spinning-scythe chamber to unbar the south corridor, then visit the east/north alcoves (icicle switch + boiling water) to open the Compass cavern and fill EVERY Empty Bottle at the Blue Fire pedestal!',
          'Sliding Ice Block Puzzle: Return to the central hub, melt the western Red Ice barrier with Blue Fire, and push the respawning ice block between stone stops (`East -> South -> West -> North` loops) to gather all 5 Silver Rupees (including the submerged Rupee!) and melt the exit Red Ice wall.',
          'White Wolfos Arena: Defeat the **White Wolfos** mini-boss in the final chamber -> open the chest for the **Iron Boots** -> watch Sheik’s scene to learn the **Serenade of Water** (L -> R -> A -> A -> Y), then drop down the exit shaft.',
        ],
        secretIds: ['eq-iron-boots', 'song-serenade'],
      },
      {
        id: 'ice-cavern-phase-3',
        title: 'Gold Skulltula Sweep (All 3 With Hookshot)',
        era: 'adult',
        steps: [
          'Gold Skulltula #80: In the first Silver Rupee room with the spinning ice blade, Z/ZL-target and Hookshot the spider tucked behind the icicles on the east wall.',
          'Gold Skulltula #81: Inside the eastern Compass / Blue Fire font room, Hookshot the Gold Skulltula clinging to the icy cavern wall.',
          'Gold Skulltula #82: Inside the western Sliding Ice Block puzzle room, look high up the west wall and Hookshot the final token.',
        ],
        secretIds: ['gs-080', 'gs-081', 'gs-082'],
      },
    ],
    bossStrategy: {
      bossName: 'White Wolfos (Mini-Boss)',
      weakness: 'Shield/Backflip bait + Counter Jump-Slash to back (or Din’s Fire)',
      strategy:
        'Stay near the center of the icy floor so a stray knockback never drops you into the perimeter pits (which reset you outside the door). Hold `ZL` + Shield without swinging first—as soon as the White Wolfos lunges with its double claw swipe, backstep or block and immediately counter with a Master Sword jump-slash into its exposed spine or tail (2 jump-slashes finish it cleanly).',
    },
    proTips: [
      'Top off at least one leftover Bottle of Blue Fire before dropping out the exit hole so you can immediately thaw King Zora in Zora’s Domain for your free Zora Tunic (saving 300 Rupees!).',
      'Right after stepping back out into Zora’s Fountain with the Iron Boots, sink to the bottom of the fountain to pick up Heart Piece #28 on the spot.',
    ],
  },

  // ==========================================================================
  // 28. WATER TEMPLE (ADULT DUNGEON #3)
  // ==========================================================================
  {
    regionId: 'water-temple',
    tagline:
      'Cycle three color-coded water levels with Switch 2 quick-equip Iron Boots, duel Dark Link for the Longshot, and slay Morpha to thaw Zora’s Domain!',
    recommendedVisitOrder:
      'Adult Dungeon #3 — Required: Iron Boots + Zora Tunic + Hookshot + Fairy Bow + Din’s Fire',
    entrancesAndShortcuts: [
      'Lake Hylia Lakebed Gate: Sink below the central island with the Iron Boots, Hookshot the diamond crystal above the iron gate, and step inside.',
      'Color-Coded Water Plaques (Switch 2): Follow the illuminated corridor trim—1F South/East Ruto shaft drains to **Low (1F)**, Central Tower interior raises to **Mid (2F)**, and 2F West ledge raises to **High (3F)**.',
    ],
    phases: [
      {
        id: 'water-temple-phase-1',
        title: 'Preparation & Required Loadout',
        era: 'adult',
        steps: [
          'Equip the Zora Tunic (from thawing King Zora with Blue Fire), assign Iron Boots to Switch 2’s quick-equip slot, and bring Din’s Fire + Magic Meter (both speed up 1F torch gates AND trivialize Dark Link!).',
          'GOLDEN RULE OF WATER TEMPLE: The moment you raise the water to **Mid (2F)** inside the Central Tower, DO NOT walk out the door—immediately sink under the floating block that just rose off the Central Tower floor to grab the most commonly missed Small Key in Zelda history!',
        ],
        secretIds: [],
      },
      {
        id: 'water-temple-phase-2',
        title: 'Single-Loop 6 Keys, Dark Link, Longshot & Boss Key Route',
        era: 'adult',
        steps: [
          'Cycle 1 — Low (1F) -> Mid (2F) (Keys #1–#4): Sink to 1F SE, follow **Princess Ruto** up to 3F, and play Zelda’s Lullaby to drain water to **1F** (drop to 2F in Ruto’s shaft and bomb the cracked wall later at 2F!). On 1F SE, light the 2 side torches with Bow/Din’s Fire and beat the Shell Blades (**Key #1**); push the stone block partway in 1F South. Unlock the **Central Tower** (1F), Hookshot up to the **2F** plaque, play Lullaby to raise water to **2F**, and IMMEDIATELY sink to B1 inside the Central Tower under the risen block for **Key #2**! Swim to Ruto’s shaft at 2F to bomb the cracked wall (**Key #3**), then ride the 1F->2F West geyser (shoot crystal) up to **Key #4**.',
          'Cycle 2 — High (3F) -> Dark Link & Longshot (Key #5): Play Lullaby at the 3F West plaque to raise water to **3F**, Hookshot across the 3F West moving platforms, navigate the rising dragon-statue room, and step across the misty island in the illusion room until **Dark Link** spawns behind you (defeat him with Din’s Fire, Megaton Hammer, or un-targeted diagonal slashes!) -> open the **Longshot** chest! Play Song of Time on the blue block behind the chest, swim the B1 Whirlpool River, shoot the eye switch through the dragon’s jaws, and claim **Key #5**.',
          'Cycle 3 — Boss Key & Morpha: Cycle water back through **1F -> 2F**: push the 1F West/South underwater block all the way from behind (**Key #6**), then enter the **1F North** corridor (at 2F water), Longshot across the spikes, dodge the cascading boulders + whirlpools, bomb the side walls to push the block onto the submerged switch, and climb to the **Boss Key** chest! Raise water back to **3F** one final time and Longshot the dragon statue up the 3F North blade ramp into Morpha’s chamber.',
        ],
        secretIds: ['eq-longshot', 'boss-hc-water', 'medallion-water'],
      },
      {
        id: 'water-temple-phase-3',
        title: 'Gold Skulltula & Collectible Sweep (All 5 Tokens)',
        era: 'adult',
        steps: [
          'Gold Skulltula #83 (Water at 1F): Bomb the cracked floor in the 1F South corridor, swim underneath, hit the crystal switch through the grate using Din’s Fire or a Spin Attack, and slash the spider.',
          'Gold Skulltula #84 & #85 (After Longshot): Inside the Central Tower (water at 2F or 3F), Longshot #84 high near the 3F ceiling; in the 2F/3F West moving-platform waterfall chasm, Longshot #85 high on the right wall.',
          'Gold Skulltula #86 & #87 (Iron Boots + Longshot): In the B1 Whirlpool River behind Dark Link’s room, sink with Iron Boots and Longshot #86 off the wall grate; in the 1F North cascading-boulder channel en route to the Boss Key, stand in the water with Iron Boots and Longshot #87 high on the waterfall face.',
        ],
        secretIds: ['gs-083', 'gs-084', 'gs-085', 'gs-086', 'gs-087'],
      },
    ],
    bossStrategy: {
      bossName: 'Morpha',
      weakness: 'Longshot (extract red nucleus from water) + Corner Slash Lock',
      strategy:
        'Immediately hop onto one of the four outer stone corners of the arena—Morpha’s thrashing water tentacles cannot reach the extreme corners! Hold `ZL` to lock onto the bouncing red nucleus inside the water tentacle, yank it onto dry stone with your Longshot, and pin it into the corner with continuous horizontal Master Sword or Biggoron’s Sword slashes to eliminate it in a single trap.',
    },
    proTips: [
      'HUGE SWITCH 2 PAYOFF: Clearing the Water Temple refills Lake Hylia (shoot the rising sun immediately for Fire Arrows!), unlocks the Dark Link rematch in the Hall of Fallen Foes, AND completely unfreezes Zora’s Domain!',
      'Against Dark Link, never Z/ZL-target stab (`Forward + B`)—he stands on your blade and counters! Cast Din’s Fire 3–4 times or swing the Megaton Hammer un-targeted to bypass his AI cleanly.',
    ],
  },

  // ==========================================================================
  // 29. BOTTOM OF THE WELL (CHILD MINI-DUNGEON)
  // ==========================================================================
  {
    regionId: 'bottom-of-the-well',
    tagline:
      'Drain Kakariko’s cursed well with the Song of Storms, slip through illusion walls to seize the Lens of Truth, and sweep three hidden Gold Skulltulas.',
    recommendedVisitOrder:
      'Child Mini-Dungeon (Immediately Post-Forest Temple / Time Travel!) — Required: Song of Storms + Zelda’s Lullaby + Boomerang',
    entrancesAndShortcuts: [
      'Kakariko Village Central Well: Play Song of Storms (`L -> R -> X -> L -> R -> X`) to Guru-Guru inside the Windmill as Child Link to drain the well water permanently.',
      'Entrance Fake Wall -> Dead Hand Trench: Walk straight through the illusion wall at the entrance, play Zelda’s Lullaby at the north Triforce seal, and drop into the drained front trench to reach the Lens of Truth in under 90 seconds.',
    ],
    phases: [
      {
        id: 'bottom-of-the-well-phase-1',
        title: 'Preparation & Required Loadout',
        era: 'child',
        steps: [
          'Tackle Bottom of the Well the moment you unlock Time Travel after the Forest Temple—earning the Lens of Truth early unlocks the Market Treasure Chest Shop, Haunted Wasteland, Shadow Temple, and Gerudo Training Ground!',
          'Bring the Boomerang (mandatory for the 3 Gold Skulltulas here!), Deku Sticks, Bombs, and an Empty Bottle in case a Like-Like swallows your Deku Shield.',
        ],
        secretIds: [],
      },
      {
        id: 'bottom-of-the-well-phase-2',
        title: 'Fastest Express Route to the Lens of Truth (0 Keys Required!)',
        era: 'child',
        steps: [
          'Climb down the well ladder, crawl through the small tunnel past the Skulltula, and walk STRAIGHT THROUGH the fake mud wall directly ahead (ignoring the visible floor pit in front of it!).',
          'Follow the outer ring corridor all the way to the northern Triforce floor seal and play Zelda’s Lullaby (`Y -> X -> A -> Y -> X -> A`) to drain the poison/water trench.',
          'Walk right back to the southern entrance wall, drop into the newly drained floor trench in front of the fake wall, crawl through the low hole, and defeat **Dead Hand** to open the chest containing the **Lens of Truth**!',
        ],
        secretIds: ['eq-lens-of-truth'],
      },
      {
        id: 'bottom-of-the-well-phase-3',
        title: '3 Small Keys & Gold Skulltula Sweep (With Lens + Boomerang)',
        era: 'child',
        steps: [
          'Activate your new Lens of Truth to scoop all 3 Small Keys in 2 minutes: (1) false wall at the very south center of the outer ring, (2) left-row torch coffin inside the NW crypt room, and (3) hidden hole under bombable rubble / crawlspace in the SW/SE corner.',
          'Gold Skulltula #88 & #89: Step into the central cross-shaped hub, unlock BOTH the West inner door (#88—watch the invisible floor pit and Like-Like; use Boomerang!) and the East inner door (#89—Boomerang off wall).',
          'Gold Skulltula #90: Crawl into the small NE corner hole off the outer ring, slay the Fire Keese and Like-Like (keep distance so you keep your Shield/Tunic!), unlock the barred cell door with Key #3, and slash the final spider.',
        ],
        secretIds: ['gs-088', 'gs-089', 'gs-090'],
      },
    ],
    bossStrategy: {
      bossName: 'Dead Hand (Mini-Boss)',
      weakness: 'Intentional Pale Hand grab to bait lowered head + Deku Stick Jump-Slash',
      strategy:
        'Dead Hand’s head stays out of reach until one of its Pale Hands snares you: deliberately brush against a single isolated hand (away from the others so you aren’t chain-grabbed), mash buttons to wiggle free right as Dead Hand waddles close and drops its jaw, and unleash 2 Deku Stick jump-slashes to fell it in two grabs!',
    },
    proTips: [
      'Grab the Lens of Truth FIRST in 90 seconds before hunting Small Keys—having the Lens already in hand reveals every fake wall and invisible floor pit while sweeping the 3 Gold Skulltulas!',
      'Avoid falling into green B3 basement acid/pits unless exploring; climb the ladder along the wall immediately if an invisible pit drops you.',
    ],
  },

  // ==========================================================================
  // 30. SHADOW TEMPLE (ADULT DUNGEON #4)
  // ==========================================================================
  {
    regionId: 'shadow-temple',
    tagline:
      'Pierce Kakariko’s house of illusions with the Lens of Truth, claim the Hover Boots, sail the Phantom Ship across the Styx, and silence Bongo Bongo.',
    recommendedVisitOrder:
      'Adult Dungeon #4 — Required: Nocturne of Shadow + Din’s Fire + Lens of Truth + Longshot + Fairy Bow',
    entrancesAndShortcuts: [
      'Nocturne of Shadow Graveyard Ledge: Play Y -> A -> A -> L -> Y -> A -> R, stand on the central stone dais ringed by 24 torches, and cast Din’s Fire once to ignite every torch and raise the gate.',
      'B4 Ferryman Block Bridge: After crossing the chasm from the Phantom Ship landing, push the tall stone block on the west side to create a permanent shortcut bridge back to the ferry dock.',
    ],
    phases: [
      {
        id: 'shadow-temple-phase-1',
        title: 'Preparation & Required Loadout',
        era: 'adult',
        steps: [
          'Bring a full Magic Meter (upgrade to Double Magic in Death Mountain Crater for 200 Rupees if you haven’t yet—it makes Lens of Truth + Din’s Fire effortless!), Fairy Bow, Bombs, Longshot, and Scarecrow’s Song.',
          'Toggle the Lens of Truth briefly whenever entering a new room rather than leaving it switched on continuously.',
        ],
        secretIds: [],
      },
      {
        id: 'shadow-temple-phase-2',
        title: 'Room-by-Room Hover Boots, 5 Keys, Phantom Ship & Boss Key Route',
        era: 'adult',
        steps: [
          'B1 Hover Boots: Hookshot across the entrance pit right through the fake Whispering Wall -> check the side rooms for Map & Compass -> rotate the central Bird Statue so its beak faces the ONE real talking skull (revealed by Lens of Truth; fake skulls drop you into a pit!) -> walk through the opposite fake wall and defeat **Dead Hand** for the **Hover Boots**!',
          'B2 -> B3 Gauntlet (Keys #1–#3): Bomb the B2 Beamos -> float across the guillotine chasm to the Invisible Spinning Scythe room (5 Silver Rupees) -> bomb/open the Falling Spike Ceiling cell (**Key #1**) -> collect 5 Silver Rupees in the Invisible Spikes room (use Hover + Hookshot) to reach the Stalfos cage (**Key #2**) -> cross the B3 Giant Wind Fans (equip Iron Boots against side gusts, then Hover Boots to glide across into the right-hand bombed rubble door!) -> clear Gibdos (**Key #3** hidden inside the Single Flaming Skull Pot—toss a Bomb into the pot!).',
          'B4 Phantom Ship & Boss Key (Keys #4–#5): Pull the block under the ladder to board the **Phantom Ship**, play Zelda’s Lullaby on the deck Triforce, fend off two Stalfos, and leap off onto the port-side ledge before the ship plunges! Shoot the Bomb Flower cluster across the chasm with your Bow (or Fire Arrows) to topple the giant Bird Statue bridge; first clear the B4 west maze—Invisible Floormaster room (**Key #4**) and Burning Wooden Spike Walls room (cast Din’s Fire to burn the closing walls -> **Boss Key** + **Key #5**)—then Hover-glide across the invisible B4 platforms to Bongo Bongo.',
        ],
        secretIds: ['eq-hover-boots', 'boss-hc-shadow', 'medallion-shadow'],
      },
      {
        id: 'shadow-temple-phase-3',
        title: 'Gold Skulltula & Collectible Sweep (All 5 in One Pass)',
        era: 'adult',
        steps: [
          'Gold Skulltula #91: Defeat the Keese and Silver Blade trap in the B2 side chamber off the guillotine chasm to open the barred cell.',
          'Gold Skulltula #92 & #93: On B3, Hookshot #92 inside the left iron cell of the Falling Spike Ceiling room, and Hookshot #93 directly behind the Single Flaming Skull Pot.',
          'Gold Skulltula #94 (Scarecrow): BEFORE riding the B4 Phantom Ship, stand on the dock, play the Scarecrow’s Song to summon Pierre high on the left cliff, and Longshot across.',
          'Gold Skulltula #95: Across the chasm from the Phantom Ship landing, enter the north room with three spinning flaming skull pots and Longshot the spider behind them.',
        ],
        secretIds: ['gs-091', 'gs-092', 'gs-093', 'gs-094', 'gs-095'],
      },
    ],
    bossStrategy: {
      bossName: 'Bongo Bongo',
      weakness: 'Fairy Bow (stun both hands) + Lens of Truth (reveal eye) + Bow & Master Sword',
      strategy:
        'Keep the Hover Boots equipped (or unequip once stunned for faster sprinting—either works great!) and center your gyro Bow aim. Shoot each giant severed hand with 2 arrows until both turn blue and curl into fists, then immediately click on the **Lens of Truth** as Bongo Bongo’s invisible body rushes straight at you: loose one arrow into his open red eye before he rams you, switch off the Lens, and unleash jump-slashes + crouch-stabs (or Biggoron’s Sword swings) into his eye on the drumhead!',
    },
    proTips: [
      'Do NOT forget Gold Skulltula #94 on the Phantom Ship dock before sailing—playing Scarecrow’s Song on the dock saves having to re-run the B3 wind fans later.',
      'Equipping Ice Arrows (if visiting after Gerudo Training Ground) freezes one of Bongo Bongo’s hands solid, forcing the other hand to stop drumming and try to shatter the ice!',
    ],
  },

  // ==========================================================================
  // 31. SPIRIT TEMPLE (ADULT / DUAL-ERA DUNGEON #5)
  // ==========================================================================
  {
    regionId: 'spirit-temple',
    tagline:
      'Conquer Hyrule’s grand dual-era temple: raid the west wing as Child Link for the Silver Gauntlets, then return as Adult Link for the Mirror Shield and Twinrova.',
    recommendedVisitOrder:
      'Dual-Era Dungeon #5 — Phase A: Child Link (Requiem + Boomerang + Bombchus) -> Phase B: Adult Link (Longshot + Lens + Bow)',
    entrancesAndShortcuts: [
      'Requiem of Spirit Plaza: Warp both Child Link and Adult Link straight to the Spirit Temple steps.',
      'Colossus Statue Hand Exits: Both the Silver Gauntlets (Child left hand) and Mirror Shield (Adult right hand) chests rest outside on the giant Desert Colossus palms!',
      '3F Laser Elevator Platform: Stepping on the upper 4F crystal switch lowers a permanent stone elevator connecting the 1F Colossus Statue floor straight to the 3F/4F boss wing.',
    ],
    phases: [
      {
        id: 'spirit-temple-phase-1',
        title: 'Preparation & Dual-Era Loadout',
        era: 'both',
        steps: [
          'First learn Requiem of Spirit as Adult Link outside the temple, warp back as Child Link, and make sure you carry the Boomerang, Bombs/Bombchus (40-Skulltula reward gives 20 free Bombchus!), Deku Sticks, and Din’s Fire.',
          'When returning for the Adult wing, bring Longshot, Fairy Bow, Megaton Hammer, Lens of Truth, Song of Time, Zelda’s Lullaby, and Scarecrow’s Song.',
        ],
        secretIds: [],
      },
      {
        id: 'spirit-temple-phase-2',
        title: 'Child Wing (Silver Gauntlets) & Adult Wing (Mirror Shield + Boss Key)',
        era: 'both',
        steps: [
          'Child Wing (2 Small Keys -> Silver Gauntlets): Speak to Nabooru and crawl through the left tunnel -> defeat Green Bubble + Stalfos (east wing) and lure Anubis into the fire ring (**Key #1**) -> crawl through the locked tunnel, climb 2F, send a Bombchu into the cracked skylight boulder, and push the sun block (**Key #2** in 2F torch chest after Silver Rupee climb) -> duel the **Child Iron Knuckle** and step onto the exterior Colossus palm for the **Silver Gauntlets**!',
          'Adult Wing (3 Small Keys -> Mirror Shield): Return as Adult Link and push the heavy 1F right Silver Block -> dodge rolling boulders for 5 Silver Rupees (**Key #3**) -> rotate the cobra mirrors + lure Armos onto the sun button to enter the grand Colossus Statue Hall -> play Zelda’s Lullaby on the east hand and Hookshot the high chest (**Key #4**) -> climb 3F/4F east past Anubis + Beamos (**Key #5** via invisible Floormaster + sun door) -> defeat **Adult Iron Knuckle #1** and claim the **Mirror Shield** outside!',
          'Boss Key & Crumbling Face: Reflect sunlight onto the 4F sun switch for the **Boss Key** (Hookshot past the fire wall; watch the fake chest!), rotate the twin 4F mirrors to beam sunlight down onto the 3F platform, stand in the beam with your Mirror Shield to melt the giant statue’s face, Hookshot inside, defeat **Nabooru Iron Knuckle #2**, and enter Twinrova’s chamber.',
        ],
        secretIds: [
          'eq-silver-gauntlets',
          'eq-mirror-shield',
          'boss-hc-spirit',
          'medallion-spirit',
        ],
      },
      {
        id: 'spirit-temple-phase-3',
        title: 'Gold Skulltula & Collectible Sweep (3 Child + 2 Adult)',
        era: 'both',
        steps: [
          'Child Wing (#96, #97, #98): Throw the Boomerang through the 1F east metal fence after clearing the Keese/Bat room (#96); Boomerang the opposite brick wall halfway up the 1F->2F vertical climb shaft (#97); and Boomerang high above the doorway on 2F right before the Child Iron Knuckle throne room (#98).',
          'Adult Wing (#99 & #100): In the 1F rolling-boulder Silver Rupee room, play the Song of Time to move the blue block and Hookshot #99; in the grand 3F Colossus Statue chamber, stand near the west Triforce hand, play the Scarecrow’s Song to summon Pierre across the hall, and Longshot over for Gold Skulltula #100!',
        ],
        secretIds: ['gs-096', 'gs-097', 'gs-098', 'gs-099', 'gs-100'],
      },
    ],
    bossStrategy: {
      bossName: 'Twinrova (Koume & Kotake)',
      weakness: 'Mirror Shield (cross-reflect Phase 1 beams; absorb 3 matching elements in Phase 2)',
      strategy:
        'Phase 1: Stand on the central pedestal holding `ZL` (Shield raise) without Z-targeting a witch—tilt your Mirror Shield to deflect Koume’s fire beam directly into hovering Kotake, or Kotake’s ice beam into Koume (4 hits). Phase 2: Once they fuse into Twinrova, hold up your Mirror Shield to absorb **3 blasts of the EXACT SAME element** (3 Fire OR 3 Ice; side-hop away if she fires the opposite element so your shield doesn’t discharge early!). Unleash the supercharged shield beam into Twinrova, bridge/jump to her side platform while she’s stunned, and slash away.',
    },
    proTips: [
      'Before leaving Zora’s Fountain off your checklist, remember that your new Silver Gauntlets unlock Gold Skulltula #41 under the gray boulder outside Zora’s Fountain Great Fairy!',
      'Return to the Temple of Time with all 6 Medallions once Twinrova falls to trigger Zelda’s reveal and receive the Light Arrows.',
    ],
  },

  // ==========================================================================
  // 32. GERUDO TRAINING GROUND (OPTIONAL ADULT MINI-DUNGEON)
  // ==========================================================================
  {
    regionId: 'gerudo-training-ground',
    tagline:
      'Test your full Adult arsenal across timed combat and puzzle trials to unlock the central vault holding the Ice Arrows.',
    recommendedVisitOrder:
      'Optional Adult Mini-Dungeon (Post-Spirit Temple) — Required: Gerudo Card, Silver Gauntlets, Hammer, Longshot, Hover/Iron Boots, Lens & Bow',
    entrancesAndShortcuts: [
      'Gerudo’s Fortress Central Courtyard Gate: Pay the guard 10 Rupees once you hold the Gerudo Membership Card.',
      '7-Key Optimal Left-Door Chain: You only need 7 of the 9 Small Keys to reach the Ice Arrows if you follow the outer left key-door chain and skip the hidden ceiling lock until afterward!',
    ],
    phases: [
      {
        id: 'gerudo-training-ground-phase-1',
        title: 'Preparation & Required Loadout',
        era: 'adult',
        steps: [
          'Wait to enter until AFTER getting the Silver Gauntlets in the Spirit Temple so you can clear all 9 Small Keys in a single clean 15-minute run without ever running short on keys.',
          'Bring full Arrows, Bombs, Magic (for Lens of Truth + Din’s Fire), Song of Time, Longshot, Megaton Hammer, Iron Boots, and Hover Boots.',
        ],
        secretIds: [],
      },
      {
        id: 'gerudo-training-ground-phase-2',
        title: 'Clockwise Trial Loop — Collecting All 9 Small Keys',
        era: 'adult',
        steps: [
          'East Wing (Keys #1–#6): Slay two Stalfos under 1:00 (**Key #1**) -> Hookshot + Hover Boots for 5 Silver Rupees in the boulder hall (**Key #2**) -> slay White Wolfos (**Key #3**? Chest holds Arrows; look UP with **Lens of Truth** to climb into the fake ceiling wall, hit the switch, and drop down to shoot the real Ice Eye Switch for **Key #3**!) -> defeat Dinolfos & Beamos (**Key #4**) -> Hover Boots + Song of Time across sinking lava platforms for 5 Silver Rupees (**Key #5**), then play Song of Time on the side blue block and dive with Iron Boots + Hookshot for 5 underwater Silver Rupees (**Key #6**).',
          'Center & West Wing (Keys #7–#9): Enter the central door (or loop from behind) to smash statues with the Megaton Hammer, hit the rusted switch, and light torches (**Key #7**) -> drop into the rotating 4-eye statue pit, stun with crystal/shoot all 4 eyes in one rotation with Bow (**Key #8**) -> in the West Silver Block room, push the heavy block, defeat Beamos/enemies, and look UP with the Lens of Truth inside the key maze to climb the hidden ceiling grate for **Key #9**!',
        ],
        secretIds: [],
      },
      {
        id: 'gerudo-training-ground-phase-3',
        title: 'West Key Maze & Claiming the Ice Arrows',
        era: 'adult',
        steps: [
          'Enter the West door off the entrance lobby and unlock the chain of consecutive left-hand doors wrapping into the central vault (with all 9 keys you cannot soft-lock; if entering early with only 7 keys, stay strictly on the ground-floor left door chain and ignore the ceiling room!).',
          'Step into the central treasure chamber and open the ornate gold chest to claim the **Ice Arrows**!',
        ],
        secretIds: ['eq-ice-arrows'],
      },
    ],
    bossStrategy: {
      bossName: 'Armored Iron Knuckles & Dinolfos Gauntlet',
      weakness: 'Backflip axe-bait + Biggoron / Master Sword Jump-Slash',
      strategy:
        'Gerudo Training Ground pits you against tight-quarters Iron Knuckles and dual Dinolfos: against Iron Knuckles, walk into melee range to bait a vertical or horizontal axe cleave, backflip (`ZL + Down + X`), and immediately answer with a jump-slash (twice as fast with Biggoron’s Sword!). Against Dinolfos, block their jump-slash or stun their fire-breath windup with a Deku Nut / Hookshot and counter-slash.',
    },
    proTips: [
      'Clearing the Iron Knuckles, White Wolfos, and Dinolfos inside Gerudo Training Ground logs key late-game entries toward your 84 statues in the Switch 2 Hall of Fallen Foes.',
      'Zero Gold Skulltulas or Heart Pieces exist inside Gerudo Training Ground—once the Ice Arrows are checked off, the mini-dungeon is 100% complete!',
    ],
  },

  // ==========================================================================
  // 33. INSIDE GANON'S CASTLE (FINAL DUNGEON)
  // ==========================================================================
  {
    regionId: 'ganons-castle',
    tagline:
      'Shatter the six elemental sage barriers, step outside mid-run with the Golden Gauntlets for Double Defense, and defeat Ganondorf and Ganon.',
    recommendedVisitOrder:
      'Final Dungeon — Required: All 6 Medallions + Light Arrows + 500 Rupees in Wallet (Do Shadow Trial FIRST!)',
    entrancesAndShortcuts: [
      'Rainbow Bridge Entrance: Cross the Rainbow Bridge from Outside Ganon’s Castle after receiving the Light Arrows in the Temple of Time.',
      'Shadow Trial -> Double Defense Detour: Grab the Golden Gauntlets inside the Shadow Trial FIRST, then walk right back out the front entrance with 500 Rupees to claim Double Defense before clearing the remaining 5 barriers!',
    ],
    phases: [
      {
        id: 'ganons-castle-phase-1',
        title: 'Preparation & Optimal Loadout',
        era: 'adult',
        steps: [
          'Stock 2–3 Bottled Fairies + 1–2 Blue Potions (or Château/Lon Lon Milk), max Arrows/Bombs, Biggoron’s Sword, Mirror Shield, Hover/Iron Boots, Lens of Truth, and 500 Rupees in your Adult’s/Giant’s Wallet.',
          'Note that Inside Ganon’s Castle holds 0 Gold Skulltulas and 0 Heart Pieces—track the **Golden Gauntlets** plus all **6 Elemental Barrier Trials** here to complete the castle 100%.',
        ],
        secretIds: [],
      },
      {
        id: 'ganons-castle-phase-2',
        title: 'All 6 Elemental Barrier Trials (Light Arrow Orbs)',
        era: 'adult',
        steps: [
          '1. Shadow Trial (DO FIRST!): Longshot the chest -> shoot unlit torch with a Fire Arrow to reveal temporary platforms -> toggle **Lens of Truth** + Hover Boots to reach the left switch -> open the chest for the **Golden Gauntlets**, smash the rusted switch with the Megaton Hammer, dispel the Shadow Orb with a **Light Arrow**, and **STEP OUTSIDE GANON’S CASTLE NOW** to lift the black obelisk and pay 500 Rupees for Double Defense!',
          '2. Forest & Water Trials: In **Forest**, cast Din’s Fire (or Fire Arrows) on the unlit torches, then ride the wind fans with Hover Boots + Song of Time for 5 Silver Rupees -> Light Arrow. In **Water**, defeat the Freezards, scoop **Blue Fire** into a Bottle, melt the Red Ice, push one ice block into the floor hole and the second across onto the rusted switch alcove, smash with Megaton Hammer -> Light Arrow.',
          '3. Fire, Light & Spirit Trials: In **Fire**, wear Goron Tunic + Hover Boots, hurl the giant black obelisk with your **Golden Gauntlets** to bridge the lava, collect 5 Silver Rupees, and Longshot out -> Light Arrow. In **Light**, heave the Golden Gauntlets boulder, clear invisible Skulltulas/bats for keys, play Zelda’s Lullaby on the Triforce for a key, collect 5 Silver Rupees, and walk through the **fake wall** at the end (Lens of Truth!) -> Light Arrow. In **Spirit**, Hookshot around spike rollers for 5 Silver Rupees, toss a Bombchu over the iron grate to hit the switch, shoot a Fire Arrow through the ceiling cobweb skylight, and reflect sunlight onto the ONE real sun face with your Mirror Shield -> Light Arrow!',
        ],
        secretIds: [
          'eq-golden-gauntlets',
          'trial-shadow',
          'trial-forest',
          'trial-water',
          'trial-fire',
          'trial-light',
          'trial-spirit',
        ],
      },
      {
        id: 'ganons-castle-phase-3',
        title: 'Ganon’s Tower Ascent & 3:00 Castle Collapse',
        era: 'adult',
        steps: [
          'Climb the unsealed central Ganon’s Tower: defeat 2 Dinolfos -> defeat 2 Stalfos and open the **Boss Key** chest -> defeat **2 Armored Iron Knuckles** (lure one forward at a time so you never fight both simultaneously!) -> top off hearts/magic in the pot antechamber before confronting Ganondorf.',
          'After defeating Ganondorf, follow Princess Zelda down the collapsing tower under the generous 3:00 timer (defeat the two Stalfos on the bridge when gates lock, never run ahead of Zelda) to trigger the final battle in the ruins!',
        ],
        secretIds: [],
      },
    ],
    bossStrategy: {
      bossName: 'Ganondorf & Ganon',
      weakness: 'Light Arrows + Biggoron’s Sword / Hammer (Ganon Phase 1) + Master Sword (Final Blow)',
      strategy:
        'Ganondorf: Immediately hop onto an outer corner ledge so his floor-shattering punch leaves you safe; rally single energy bolts back with Master Sword slashes (when he charges a black 5-orb cluster, release a **Charged Spin Attack** right as the orbs reach you to reflect all 5 at once!), pierce him with a **Light Arrow**, and Longshot across to slash his chest. Ganon: With the Master Sword knocked beyond the fire ring, equip **Biggoron’s Sword** (or Megaton Hammer), stun Ganon’s face with a Light Arrow (or roll cleanly between his legs as he swings!), and slash his glowing tail; once the fire barrier drops after two phases, retrieve the **Master Sword** and deliver the cinematic finishing blow to his tail.',
    },
    proTips: [
      'Stepping outside right after the Shadow Trial to buy Double Defense (500 Rupees) cuts Ganondorf and Ganon’s heavy 2–4 heart blows in half.',
      'If you run low on Magic or Light Arrows during Ganon, lure Ganon into smashing the crumbling stone pillars around the ruins—they drop fresh Magic Jars, Arrows, and Hearts!',
    ],
  },

  // ==========================================================================
  // 34. HALL OF FALLEN FOES (NEW SWITCH 2 DREAM HUB)
  // ==========================================================================
  {
    regionId: 'hall-of-fallen-foes',
    tagline:
      'Enter Kaepora Gaebora’s brand-new Switch 2 dream museum to curate 84 enemy statues, rematch Dark Link and every boss, and conquer Boss Rush Gauntlets.',
    recommendedVisitOrder:
      'Switch 2 Post-Forest Temple Hub — Unlocks after Prelude of Light + Child Kakariko Owl Scene (Revisit after Ganon’s Castle for 84/84 Statues)',
    entrancesAndShortcuts: [
      'Three Green-Glowing Beds Across Hyrule: Sleep in the green-shimmering bed inside **Link’s House** (Kokiri Forest), **Kakariko Village**, or **Lake Hylia** in either era.',
      'Instant Wake Exit: Speak to Kaepora Gaebora or interact with the dream portal bed to wake right back where you fell asleep with full hearts!',
    ],
    phases: [
      {
        id: 'hall-of-fallen-foes-phase-1',
        title: 'Unlocking the Dream Hub & Green-Bed Portals',
        era: 'both',
        steps: [
          'Defeat Phantom Ganon in the Forest Temple and visit the Temple of Time to learn the Prelude of Light from Sheik.',
          'Place the Master Sword back into the Pedestal of Time to become Child Link, enter Kakariko Village to view Kaepora Gaebora’s special cutscene, and sleep in any green-glowing bed (Link’s House, Kakariko, or Lake Hylia) to enter the Hall of Fallen Foes.',
        ],
        secretIds: ['sw2-hall-of-fallen-foes'],
      },
      {
        id: 'hall-of-fallen-foes-phase-2',
        title: 'Completing All 84 Automatic Enemy & Boss Statues',
        era: 'both',
        steps: [
          'Explore the gallery wings—every standard foe, mini-boss, and dungeon boss you defeat at least once anywhere in Hyrule is logged automatically as a rotatable 3D statue (no camera item needed!).',
          'Check empty pedestals’ silhouettes before finishing your 100% file: common stragglers include **Dead Hand** (Bottom of the Well / Shadow Temple), **Big Octo** (Jabu-Jabu), **White Wolfos** (Ice Cavern / GTG), **Flare Dancer** (Fire Temple), **Dark Link** (Water Temple), **Shabom / Tailpasaran**, and rare field **Peahat Larvae / Big Poes**.',
        ],
        secretIds: [],
      },
      {
        id: 'hall-of-fallen-foes-phase-3',
        title: 'Timed Rematches, Boss Rush Gauntlets & Zelda Notes Medals',
        era: 'both',
        steps: [
          'Interact with any boss or mini-boss pedestal (including standalone **Dark Link** and **Armored Iron Knuckle** duels!) to practice single timed rematches with standardized arena loadouts.',
          'Speak to Kaepora Gaebora at the central dais to launch the multi-stage **Boss Rush Gauntlets**, earning Bronze, Silver, Gold, and **Master** time medals that sync directly with global **Zelda Notes** leaderboards.',
        ],
        secretIds: [],
      },
    ],
    bossStrategy: {
      bossName: 'Master Boss Rush Gauntlet (All Bosses + Dark Link)',
      weakness: 'Deku Stick Child One-Cycles + Din’s Fire (Dark Link) + Gyro Bow Snipes',
      strategy:
        'Because Boss Rush uses curated arena loadouts with shared recovery stations between bouts, front-load Deku Stick jump-slashes + crouch-stabs to one-cycle Queen Gohma, King Dodongo, and Barinade in under 25 seconds each. Save your Magic Meter specifically for 3–4 Din’s Fire casts against Dark Link and quick Lens of Truth flashes against Bongo Bongo, and rely on Switch 2 gyro Bow aiming to snipe Phantom Ganon’s paintings and Ganondorf’s Light Arrow stuns without wasting frames.',
    },
    proTips: [
      'Unlike Wind Waker’s Nintendo Gallery, you NEVER need to snap photos—defeating an enemy once anywhere in Child or Adult Hyrule permanently sculpts its statue!',
      'Resting in any glowing bed (even if you exit immediately) fully restores Link’s hearts, doubling as a free inn in Kokiri Forest, Kakariko, and Lake Hylia.',
    ],
  },
];

export const AREA_GUIDE_BY_REGION_ID: Record<string, AreaWalkthroughGuide> = Object.fromEntries(
  AREA_GUIDES.map((guide) => [guide.regionId, guide]),
);
