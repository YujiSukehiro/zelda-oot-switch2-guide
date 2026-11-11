import type {
  FishingGuideData,
  GrottoOpenMethod,
  HiddenGrottoEntry,
  MandatoryRupeeBudgetEntry,
  ScarecrowSpotEntry,
  ShopVsFreeGearEntry,
} from '../types/zelda';

// ============================================================================
// 1. Pierre Scarecrow's Song Summon Directory (Overworld & Dungeons)
// ============================================================================

export const SCARECROW_SPOTS: readonly ScarecrowSpotEntry[] = [
  {
    id: 'pierre-lake-hylia-lab',
    title: 'Lakeside Laboratory Rooftop Watchtower',
    regionId: 'lake-hylia',
    zoneKind: 'overworld',
    era: 'adult',
    hookshotTier: 'Hookshot',
    reward: 'Piece of Heart #30 (Lab Watchtower Ladder)',
    whereToStand:
      'After playing your saved 8-note melody back to Bonooru by the Fishing Pond as Adult Link, stand near the east railing of the Lakeside Laboratory bridge/walkway, play your Scarecrow’s Song to summon Pierre on the lower roof, and Hookshot up (alternative to riding the grown Magic Bean leaf).',
  },
  {
    id: 'pierre-fire-temple-boulder-maze',
    title: 'Fire Temple 3F Rolling Boulder Maze -> 4F/5F Secret Tower',
    regionId: 'fire-temple',
    zoneKind: 'dungeon',
    era: 'adult',
    hookshotTier: 'Hookshot',
    reward: 'Gold Skulltula #77, Gold Skulltula #78 & 200-Rupee Huge Chest',
    whereToStand:
      'Climb atop the stone divider walls of the 3F Rolling Boulder Maze and step onto the northern ledge where Navi flies high toward an unreachable 4F platform and turns green. Play your Scarecrow’s Song to summon Pierre, Hookshot up, ride the chain elevator to 5F for Gold Skulltula #77 on the grate, and enter the circular 5F bonus room for Gold Skulltula #78 and a 200-Rupee chest.',
  },
  {
    id: 'pierre-dodongos-cavern-alcove',
    title: 'Dodongo’s Cavern 1F East Baby Dodongo Vine Alcove',
    regionId: 'dodongos-cavern',
    zoneKind: 'dungeon',
    era: 'adult',
    hookshotTier: 'Hookshot',
    reward: 'Gold Skulltula #62 (Adult Backtrack Token)',
    whereToStand:
      'Enter Dodongo’s Cavern as Adult Link and step into the 1F east corridor where Baby Dodongos emerge beside the climbable vines. Stand beneath the high sealed 2F side alcove where Navi turns green, play your Scarecrow’s Song, and Hookshot Pierre straight inside.',
  },
  {
    id: 'pierre-shadow-temple-dock',
    title: 'Shadow Temple B4 Phantom Ship Ferry Dock',
    regionId: 'shadow-temple',
    zoneKind: 'dungeon',
    era: 'adult',
    hookshotTier: 'Longshot',
    reward: 'Gold Skulltula #94',
    whereToStand:
      'On B4 right BEFORE boarding the Phantom Ship and playing Zelda’s Lullaby, stand on the front-left corner of the stone ferry dock, play your Scarecrow’s Song to summon Pierre high on the distant left cliff ledge, and Longshot across.',
  },
  {
    id: 'pierre-spirit-temple-colossus',
    title: 'Spirit Temple 3F Grand Colossus Statue Chamber',
    regionId: 'spirit-temple',
    zoneKind: 'dungeon',
    era: 'adult',
    hookshotTier: 'Longshot',
    reward: 'Gold Skulltula #100 & Southwest Balcony Shortcut',
    whereToStand:
      'Stand near the 3F west Triforce hand or upper west staircase landing inside the central Colossus Statue chamber, play your Scarecrow’s Song to summon Pierre in the opposite high southwest alcove, and Longshot across.',
  },
  {
    id: 'pierre-gerudo-fortress-rooftop',
    title: 'Thieves’ Hideout Upper Terrace Rooftop Chest',
    regionId: 'gerudo-fortress',
    zoneKind: 'overworld',
    era: 'adult',
    hookshotTier: 'Hookshot',
    reward: 'Piece of Heart #34 (Fortress Rooftop Chest)',
    whereToStand:
      'Climb through Thieves’ Hideout to the upper exterior terrace overlooking the lower roof holding the large wooden chest. Play your Scarecrow’s Song to summon Pierre beside the chest and Hookshot across (or Longshot directly onto the chest / float over in Hover Boots).',
  },
  {
    id: 'pierre-zoras-river-plateau',
    title: 'Zora’s River Elevated Fairy Grotto Plateau',
    regionId: 'zoras-river',
    zoneKind: 'overworld',
    era: 'adult',
    hookshotTier: 'Hookshot',
    reward: 'Fast Climb to Open Fairy Grotto & Night Gold Skulltula #36',
    whereToStand:
      'Stand along the mid-canyon riverbank below the high flat stone plateau halfway up Zora’s River. Summon Pierre on the plateau rim to Hookshot straight up without backtracking to the lower ramp.',
  },
  {
    id: 'pierre-death-mountain-crater',
    title: 'Death Mountain Crater Broken Bridge & Upper Rim',
    regionId: 'death-mountain-crater',
    zoneKind: 'overworld',
    era: 'adult',
    hookshotTier: 'Longshot',
    reward: 'Shortcut from Bolero Island / Lava Ledges to Upper Crater Rim',
    whereToStand:
      'From the broken bridge pillars or central caldera ledges in Death Mountain Crater (wearing the Goron Tunic), play your Scarecrow’s Song where Navi turns green up on the cliff rim and Longshot Pierre to ascend cleanly.',
  },
  {
    id: 'pierre-gerudo-valley-gorge',
    title: 'Gerudo Valley Gorge Outcrops & Canyon Return',
    regionId: 'gerudo-valley',
    zoneKind: 'overworld',
    era: 'adult',
    hookshotTier: 'Longshot',
    reward: 'Canyon Ledge Traversal (Switch 2 Note: Gorge Heart Piece is now a Hookshot Chest!)',
    whereToStand:
      'Along the Gerudo Valley canyon ledges and bridge approaches, Navi highlights high cliff perches in green where Pierre can be summoned for Longshot traversal across the gorge.',
  },
  {
    id: 'pierre-desert-colossus-oasis',
    title: 'Desert Colossus Southern Oasis Rock Perch',
    regionId: 'desert-colossus',
    zoneKind: 'overworld',
    era: 'adult',
    hookshotTier: 'Hookshot',
    reward: 'Elevated Oasis Vantage & Recovery Cache',
    whereToStand:
      'Stand beside the stone Song of Storms block at the southern Desert Colossus Fairy Oasis, wait for Navi to fly up to the palm rock outcrop and turn green, and play your Scarecrow’s Song.',
  },
  {
    id: 'pierre-ganons-castle-fire-trial',
    title: 'Inside Ganon’s Castle — Fire Trial Lava Platform Shortcut',
    regionId: 'ganons-castle',
    zoneKind: 'dungeon',
    era: 'adult',
    hookshotTier: 'Longshot',
    reward: 'Fast Exit Ledge to Dispel the Fire Barrier Core',
    whereToStand:
      'Inside Ganon’s Castle Fire Trial after collecting the Silver Rupees across the sinking lava platforms, summon Pierre on the distant exit ledge (or hurl the giant black pillar with Golden Gauntlets) and Longshot straight to the Light Arrow door.',
  },
];

export const PIERRE_SETUP_REMINDER = {
  childStep:
    'Child Link (Lake Hylia): Stand before Bonooru—the lower scarecrow beside the Fishing Pond—pull out your Ocarina, and play any 8-note custom melody that is not an existing song (for example: Y, X, Y, X, Y, X, Y, X) using at least two distinct notes.',
  adultStep:
    'Adult Link (Lake Hylia): Return seven years later, pull out your Ocarina in front of Bonooru again, and play that exact 8-note melody back to him so his wandering twin Pierre recognizes it anywhere Navi flies to an unreachable ledge and turns green!',
  jabuNote:
    'Child-Dungeon Note (Jabu-Jabu’s Belly): Because Pierre only responds in the Adult era and Lord Jabu-Jabu is Child-only, Jabu-Jabu’s Belly uses wooden crates and the Boomerang rather than Pierre.',
};

// ============================================================================
// 2. Hidden Grottos & Switch 2 Echo Gem Directory
// ============================================================================

export const GROTTO_OPEN_METHODS: readonly GrottoOpenMethod[] = [
  'Bombs',
  'Song of Storms',
  'Megaton Hammer',
  'Open Grass/Dive',
];

export const ECHO_GEM_GUIDE = {
  title: 'How the Switch 2 Echo Gem Works (20 Gold Skulltulas Reward)',
  summary:
    'Earned at 20 Gold Skulltula Tokens inside Kakariko’s House of Skulltula (replacing N64’s Stone of Agony), the Echo Gem differentiates between uncollected Gold Skulltulas and sealed Hidden Grottos using distinct audio, HUD glow, and HD Rumble 2 signatures:',
  skulltulaSignal:
    'Gold Skulltula Nearby: Crystalline high-pitched chime + warm gold HUD pulse + rapid directional HD Rumble 2 heartbeat that speeds up as Link faces the hidden spider (works through bombable walls, crates, and trees).',
  grottoSignal:
    'Hidden Grotto Underfoot: Deep resonant stone hum + teal-green HUD ripple + low-frequency HD Rumble 2 thud directly over bombable ground seams, circle-of-stones rings, Megaton Hammer plates, and Song of Storms fairy circles.',
};

export const HIDDEN_GROTTOS_DIRECTORY: readonly HiddenGrottoEntry[] = [
  {
    id: 'grotto-dir-hf-moat-scrub',
    title: 'Castle Town Moat Bank — Password Business Scrub',
    regionId: 'hyrule-field',
    era: 'cross-era',
    openMethod: 'Bombs',
    rewardSummary: 'Piece of Heart #5 (100 Rupees with Adult Tree Password)',
    locationAndSteps:
      'NEW IN SWITCH 2: First read the password ("Sell somethin\', will ya?") carved into the lonely tree by the northern Castle Town moat as Adult Link. Return as Child Link, bomb the cracked stones on the eastern moat grass bank, defeat the Business Scrub inside, give the password, and pay 100 Rupees.',
    isSwitch2Changed: true,
  },
  {
    id: 'grotto-dir-hf-wetland-gs',
    title: 'SE Peahat Wetland — Cross-Era Evolution Grotto',
    regionId: 'hyrule-field',
    era: 'cross-era',
    openMethod: 'Bombs',
    rewardSummary: 'Gold Skulltula #10 (Replaces 4th Lon Lon Ranch Skulltula)',
    locationAndSteps:
      'NEW IN SWITCH 2: Bomb the cracked stone block in the marshy SE corner of Hyrule Field near the Peahats as Child Link, read the Fairy’s Thoughts wall message, and slay the regular Skullwalltula. Return to this exact grotto as Adult Link and Hookshot Gold Skulltula #10.',
    isSwitch2Changed: true,
  },
  {
    id: 'grotto-dir-hf-gerudo-cow',
    title: 'Western Gerudo Approach — Webbed Cow & Skulltula Cavern',
    regionId: 'hyrule-field',
    era: 'both',
    openMethod: 'Bombs',
    rewardSummary: 'Gold Skulltula #9 + Free Lon Lon Milk Cow',
    locationAndSteps:
      'Bomb the circle of small stones just east of the Gerudo Valley canyon entrance as Child Link (or smash the boulder with the Megaton Hammer as Adult Link). Burn the inner spiderwebs with Din’s Fire or Fire Arrows, play Epona’s Song for the Cow, and Boomerang/Hookshot Gold Skulltula #9.',
  },
  {
    id: 'grotto-dir-hc-moat-storms',
    title: 'Hyrule Castle Outer Moat Corner — Bomb-Wall Grotto',
    regionId: 'hyrule-castle',
    era: 'child',
    openMethod: 'Song of Storms',
    rewardSummary: 'Gold Skulltula #16 + Bomb/Nut Refills',
    locationAndSteps:
      'Stand beside the lone tree at the northern outer corner of the Hyrule Castle moat as Child Link and play the Song of Storms to open the hole. Bomb the fragile mud walls inside and Boomerang Gold Skulltula #16.',
  },
  {
    id: 'grotto-dir-lw-forest-stage',
    title: 'Lost Woods Butterfly Clearing — Forest Stage Theater',
    regionId: 'lost-woods',
    era: 'child',
    openMethod: 'Open Grass/Dive',
    rewardSummary: 'Deku Stick Capacity (30) + Deku Nut Capacity (40)',
    locationAndSteps:
      'From the Kokiri entrance into Lost Woods go Right, Left, Right, Left, Straight, Left to the butterfly meadow and step into the tall grass patch hiding an open hole. Wear the Skull Mask for 30 Deku Sticks and the Mask of Truth for 40 Deku Nuts (Poacher’s Saw bug fixed in Switch 2!).',
    isSwitch2Changed: true,
  },
  {
    id: 'grotto-dir-lw-goron-scrubs',
    title: 'Lost Woods Near Goron Shortcut — Bomb Boulder Scrub Grotto',
    regionId: 'lost-woods',
    era: 'both',
    openMethod: 'Bombs',
    rewardSummary: 'Deku Nut Capacity (30) for 40 Rupees',
    locationAndSteps:
      'Right outside the bombed tunnel shortcut connecting Lost Woods to Goron City, blow up the flat gray boulder, drop in, deflect the left-hand Business Scrub’s nut, and pay 40 Rupees for your first Deku Nut upgrade.',
  },
  {
    id: 'grotto-dir-sfm-fairy',
    title: 'Sacred Forest Meadow Maze — Wolfos / Fairy Fountain',
    regionId: 'sacred-forest-meadow',
    era: 'both',
    openMethod: 'Open Grass/Dive',
    rewardSummary: 'Bottled Fairies right outside the Forest Temple',
    locationAndSteps:
      'Halfway through the Sacred Forest Meadow hedge labyrinth, climb the central ladder or check the open hole tucked inside the north hedge corner for free Bottled Fairies before tackling Phantom Ganon.',
  },
  {
    id: 'grotto-dir-sfm-storms',
    title: 'Sacred Forest Meadow Temple Terrace — Scrub Merchants',
    regionId: 'sacred-forest-meadow',
    era: 'both',
    openMethod: 'Song of Storms',
    rewardSummary: 'Red & Green Potions at Discount Scrub Prices',
    locationAndSteps:
      'Stand in the center of the ruined stone terrace directly outside the Forest Temple warp pad and play the Song of Storms to reveal two friendly Potion Scrubs.',
  },
  {
    id: 'grotto-dir-kf-storms',
    title: 'Kokiri Forest Gossip Stone — Forest Fairy Spring',
    regionId: 'kokiri-forest',
    era: 'both',
    openMethod: 'Song of Storms',
    rewardSummary: 'Free Bottled Fairies in Kokiri Forest',
    locationAndSteps:
      'Walk up to the Gossip Stone beside the Deku Tree path / Saria’s bridge end in Kokiri Forest and play the Song of Storms to open a hidden Fairy Fountain.',
  },
  {
    id: 'grotto-dir-kak-open',
    title: 'Kakariko Village Backyard — Open Redead / Rupee Grotto',
    regionId: 'kakariko-village',
    era: 'both',
    openMethod: 'Bombs',
    rewardSummary: '200-Rupee Gold Chest (Defeat Two ReDeads)',
    locationAndSteps:
      'Bomb the flat ground in the central open patch between the Kakariko construction site and Granny’s Potion Shop, freeze the two ReDeads inside with Sun’s Song, and open the chest for a 200-Rupee Gold Rupee!',
  },
  {
    id: 'grotto-dir-dmt-cow',
    title: 'Death Mountain Trail Upper Ring — Mountain Cow Grotto',
    regionId: 'death-mountain-trail',
    era: 'both',
    openMethod: 'Song of Storms',
    rewardSummary: 'Free Lon Lon Milk Cow + Recovery Hearts',
    locationAndSteps:
      'Stand inside the ring of small stones outside Goron City / before the falling-rock climb on Death Mountain Trail and play the Song of Storms to open a Cow grotto.',
  },
  {
    id: 'grotto-dir-dmt-boulder',
    title: 'Death Mountain Trail Rockfall Path — Hammer Treasure Grotto',
    regionId: 'death-mountain-trail',
    era: 'adult',
    openMethod: 'Megaton Hammer',
    rewardSummary: '50-Rupee Purple Rupee Chest',
    locationAndSteps:
      'Smash the lone boulder along the upper volcanic rockfall stretch of Death Mountain Trail as Adult Link with the Megaton Hammer.',
  },
  {
    id: 'grotto-dir-dmc-scrubs',
    title: 'Death Mountain Crater — Triple Business Scrub Trio',
    regionId: 'death-mountain-crater',
    era: 'adult',
    openMethod: 'Megaton Hammer',
    rewardSummary: 'Bomb / Arrow / Deku Seed Restock before Fire Temple',
    locationAndSteps:
      'Right inside Death Mountain Crater from the Death Mountain Trail summit entrance, smash the boulder on your left with the Megaton Hammer to drop into a 3-Scrub supply cave.',
  },
  {
    id: 'grotto-dir-gc-lava-hammer',
    title: 'Goron City 1F Lava Room — Hammer Block Grotto',
    regionId: 'goron-city',
    era: 'adult',
    openMethod: 'Megaton Hammer',
    rewardSummary: '150 Rupees Total (Three 50-Rupee Chests!)',
    locationAndSteps:
      'Cross the lava pool in the 1F northeast side room of Goron City (using Goron Tunic + Hookshot or Hover Boots) and smash the stone block with the Megaton Hammer for a fast 150-Rupee haul.',
  },
  {
    id: 'grotto-dir-zr-fairy',
    title: 'Zora’s River High Plateau — Open Fairy Fountain',
    regionId: 'zoras-river',
    era: 'both',
    openMethod: 'Open Grass/Dive',
    rewardSummary: 'Free Bottled Fairies halfway up Zora’s River',
    locationAndSteps:
      'Climb (or Hookshot Pierre) onto the elevated flat stone plateau halfway up Zora’s River—an always-open grotto hole sits right next to the circle of stones.',
  },
  {
    id: 'grotto-dir-zd-storms',
    title: 'Zora’s Domain Entrance Island — Fairy Fountain',
    regionId: 'zoras-domain',
    era: 'both',
    openMethod: 'Song of Storms',
    rewardSummary: 'Free Bottled Fairies before Jabu-Jabu / Ice Cavern',
    locationAndSteps:
      'Step onto the small stone island inside Zora’s Domain near the stair base and play the Song of Storms inside the stone ring.',
  },
  {
    id: 'grotto-dir-lh-grave-tree',
    title: 'Lake Hylia Warp Island — Graveyard-Style Tree Grotto',
    regionId: 'lake-hylia',
    era: 'both',
    openMethod: 'Bombs',
    rewardSummary: 'Water Octorok / Deku Scrub Supply Cave',
    locationAndSteps:
      'Bomb beside the lone dead tree on the central Serenade of Water warp island in Lake Hylia (or push the gravestone/stone marker) to drop inside.',
  },
  {
    id: 'grotto-dir-llr-open',
    title: 'Lon Lon Ranch Southeast Corner — Open Meadow Grotto',
    regionId: 'lon-lon-ranch',
    era: 'child',
    openMethod: 'Open Grass/Dive',
    rewardSummary: 'Deku Nuts, Bombs & Arrows from Three Business Scrubs',
    locationAndSteps:
      'Walk into the open southeast pasture corner of Lon Lon Ranch as Child Link to drop straight into an unsealed 3-Scrub supply grotto.',
  },
  {
    id: 'grotto-dir-gv-storms',
    title: 'Gerudo Valley Behind Carpenters’ Tent — Silver Boulder / Storms Grotto',
    regionId: 'gerudo-valley',
    era: 'adult',
    openMethod: 'Song of Storms',
    rewardSummary: 'Iron Knuckle Combat Challenge / Rupee Chest',
    locationAndSteps:
      'Cross the Gerudo Valley bridge as Adult Link, walk directly behind the Carpenters’ Tent, and play the Song of Storms between the rocks.',
  },
  {
    id: 'grotto-dir-dc-oasis',
    title: 'Desert Colossus SE Basin — Song of Storms Oasis Pond & Silver Boulder Grotto',
    regionId: 'desert-colossus',
    era: 'both',
    openMethod: 'Song of Storms',
    rewardSummary: 'Permanent Outdoor Fairy Oasis + Silver Gauntlets 2-Scrub Grotto nearby',
    locationAndSteps:
      'Stand on the small stone block beside the dried-up southern oasis basin in Desert Colossus and play the Song of Storms to permanently refill the pond and spawn Bottled Fairies (plus lift the nearby silver boulder with Silver Gauntlets for a bonus grotto!).',
  },
];

// ============================================================================
// 3. Lake Hylia Fishing Pond & Legendary Hylian Loach Guide
// ============================================================================

export const FISHING_GUIDE_DATA: FishingGuideData = {
  prizes: [
    {
      era: 'child',
      label: 'Child Link Record (10+ lbs)',
      targetWeight: '10 to 14 lbs',
      entryFeeRupees: 20,
      reward: 'Piece of Heart #29',
      bestCastSpot:
        'Wade out toward the submerged middle-right mossy log facing the deep center of the pond. Cast just past the tip of the log and twitch your lure once to attract the largest bass.',
    },
    {
      era: 'adult',
      label: 'Adult Link Record (15+ lbs)',
      targetWeight: '15 to 22 lbs',
      entryFeeRupees: 20,
      reward: 'Golden Scale (8-Meter Dive + Lab Heart Piece #31!)',
      bestCastSpot:
        'Return seven years later—the exact same center-log lunker has grown past 15 lbs! Cast parallel to the submerged log or beneath the overhanging stream branch during dawn or dusk for maximum bite aggression.',
    },
  ],
  sinkingLureUnlock:
    'Unlock Condition: Earn the Golden Scale first as Adult Link (or hold the Child Heart Piece and ask the Fisherman to "Talk about something" until he mentions a banned lure). Walk slowly around the 4 hidden spots below until Link automatically scoops up the Sinking Lure! Tip: Show the Sinking Lure to the owner afterward—in Switch 2 he grumbles and lets you keep using it officially!',
  sinkingLureSpots: [
    {
      id: 'lure-spot-1',
      title: 'Spot 1 — Stream Inlet Arch Log',
      landmark: 'Northeast shallow stream mouth',
      howToSpot:
        'Climb and walk slowly across the curved mossy log arching directly over the babbling stream inlet in the back-right corner.',
    },
    {
      id: 'lure-spot-2',
      title: 'Spot 2 — Outer Wall Grass Tufts / Hollow',
      landmark: 'Perimeter dirt bank & tree roots',
      howToSpot:
        'Walk through every small patch of tall shoreline grass bordering the outer wall and tree trunks without slashing the grass first.',
    },
    {
      id: 'lure-spot-3',
      title: 'Spot 3 — Dense Floating Lily Pads',
      landmark: 'Shallow reed & lily-pad cove',
      howToSpot:
        'Wade gently among the green lily pads near the shallow edge (stop swimming so Link’s feet touch bottom to trigger the pickup).',
    },
    {
      id: 'lure-spot-4',
      title: 'Spot 4 — Submerged Stream Stepping Stones',
      landmark: 'Shallow pebble bed beside stream outflow',
      howToSpot:
        'Step onto the three submerged rocks resting along the shallow stream channel leading into the main pond.',
    },
  ],
  loachGuide: {
    weightRange: '30 to 35 lbs (Pond Monster)',
    spawnConditions:
      'Spawns in roughly 1 out of 4 entries at the deepest center floor of the pond. Re-enter Lake Hylia until you hear distant frog croaks or light rain before opening the Fishing Pond door for the highest spawn rate!',
    visualCue:
      'Unlike green Hylian Pike/Bass that hover mid-water, the Hylian Loach is a long, dark-brown whiskered eel resting flat on the sandy bottom and surfacing briefly every ~45 seconds to gulp air.',
    reward: '50-Rupee Purple Rupee + Permanent Tank Display & Zelda Notes Trophy Stamp',
    switch2GyroTips: [
      'Equip the Sinking Lure (or sink your standard lure after waiting for the Loach to surface for air) so the hook settles right in front of its whiskers on the pond floor.',
      'Give tiny rhythmic twitches with B or subtle Joy-Con 2 wrist tilts—the Loach ignores fast-moving lures!',
      'The instant the Loach lunges and bites, flick the controller upward (or pull Down + A) to set the hook firmly.',
      'Hold A + R to power-reel ONLY while the Loach swims toward Link or rests; the moment HD Rumble 2 spikes into sharp line-tension pulses as it bolts sideways, release A for a beat and tilt the rod toward the fish so the line never snaps!',
    ],
  },
};

// ============================================================================
// 4. Smart Rupee & Free-Gear Cheat Sheet
// ============================================================================

export const SHOP_VS_FREE_GEAR: readonly ShopVsFreeGearEntry[] = [
  {
    id: 'gear-hylian-shield',
    item: 'Hylian Shield',
    shopPriceLabel: '80 Rupees (Market Bazaar)',
    freeOrSmartAlternative: 'FREE in Kakariko Graveyard',
    howToClaimFree:
      'Enter Kakariko Graveyard at night (or dusk) as Child Link, pull back the front-row grave with flowers planted in front of it, drop in, and open the chest.',
    regionId: 'graveyard',
    savingsNote: 'Saves 80 early Child Rupees—and Fire Keese in Dodongo’s Cavern can never burn it!',
  },
  {
    id: 'gear-goron-tunic',
    item: 'Goron Tunic',
    shopPriceLabel: '200 Rupees (Goron Shop)',
    freeOrSmartAlternative: 'FREE from Rolling Link-Goron',
    howToClaimFree:
      'On 2F of Goron City as Adult Link, detonate one Bomb (or shoot one Arrow) in front of young Link the Goron rolling around the track and talk to him.',
    regionId: 'goron-city',
    savingsNote: 'Saves 200 Rupees AND opens Darunia’s 1F Death Mountain Crater shortcut at the same time!',
  },
  {
    id: 'gear-zora-tunic',
    item: 'Zora Tunic',
    shopPriceLabel: '300 Rupees (Zora Shop)',
    freeOrSmartAlternative: 'FREE from Frozen King Zora',
    howToClaimFree:
      'Scoop free Blue Fire into an Empty Bottle inside the Ice Cavern and pour it onto the red ice encasing King Zora in Zora’s Domain.',
    regionId: 'zoras-domain',
    savingsNote: 'Saves 300 Rupees—leaving your wallet full for Nayru’s Love & Double Defense!',
  },
  {
    id: 'gear-blue-fire',
    item: 'Bottled Blue Fire',
    shopPriceLabel: '300 Rupees / Bottle (Medicine Shop)',
    freeOrSmartAlternative: 'FREE Unlimited Font in Ice Cavern',
    howToClaimFree:
      'Visit the eastern Compass room of the Ice Cavern (or Ganon’s Castle Water Trial) with 3–4 Empty Bottles and scoop unlimited Blue Fire from the altar.',
    regionId: 'ice-cavern',
    savingsNote: 'Saves 300 to 900 Rupees across Ice Cavern, King Zora, and Zora Shop red ice!',
  },
  {
    id: 'gear-bombchus',
    item: 'Bombchus (20-Pack)',
    shopPriceLabel: '60–180 Rupees (Back Alley / Carpet Shop)',
    freeOrSmartAlternative: 'FREE 20-Pack at 40 Gold Skulltulas',
    howToClaimFree:
      'Turn in 40 Gold Skulltula Tokens inside Kakariko’s House of Skulltula for 20 free Bombchus (doubled from N64’s 10!), plus free chests in Spirit Temple & GTG.',
    regionId: 'kakariko-village',
    savingsNote: 'More than covers Child Bombchu Bowling backup, Spirit Temple, and Ganon’s Spirit Trial!',
  },
  {
    id: 'gear-deku-shield',
    item: 'Deku Shield',
    shopPriceLabel: '40 Rupees (Kokiri Shop)',
    freeOrSmartAlternative: 'Buy Once (40R) -> Free Dungeon Chests',
    howToClaimFree:
      'Buy your first Deku Shield in Kokiri Forest to pass Mido; if a Fire Keese or Like Like ever claims it later, free replacements sit in Deku Tree & Spirit Temple chests.',
    regionId: 'kokiri-forest',
    savingsNote: 'Switch to your free Graveyard Hylian Shield right after Hyrule Castle so it never burns!',
  },
];

export const MANDATORY_RUPEE_BUDGETS: readonly MandatoryRupeeBudgetEntry[] = [
  {
    id: 'budget-magic-beans',
    title: 'All 10 Magic Beans (Zora’s River Seller)',
    totalRupees: 550,
    regionId: 'zoras-river',
    breakdown: '10 + 20 + 30 + 40 + 50 + 60 + 70 + 80 + 90 + 100 = 550 Rupees total across Child Link’s campaign.',
    smartTip:
      'Playing all 5 standard melodies to grow the Zora’s River frogs just upslope pays out 250 Rupees (50R x 5) on the spot—funding nearly half your entire Magic Bean budget!',
  },
  {
    id: 'budget-great-fairies',
    title: 'All 6 Switch 2 Great Fairy Offerings',
    totalRupees: 1175,
    regionId: 'outside-ganons-castle',
    breakdown:
      'Death Mountain Summit (25R: Magic + Din’s Fire) + Hyrule Castle (50R: Spin Attack) + Zora’s Fountain (100R: Farore’s Wind) + Crater (200R: Double Magic) + Desert Colossus (300R: Nayru’s Love) + Outside Ganon’s Castle (500R: Double Defense) = 1,175 Rupees.',
    smartTip:
      'Unlock the 500-Rupee Adult’s Wallet (10 Skulltulas) before Desert Colossus (300R) and Outside Ganon’s Castle (500R), and sell the Bunny Hood to the Running Man to fill all 500 Rupees in one click!',
  },
  {
    id: 'budget-switch2-scrubs',
    title: 'Both Switch 2 Business Scrub Heart Pieces',
    totalRupees: 200,
    regionId: 'death-mountain-crater',
    breakdown:
      '100 Rupees at Death Mountain Crater’s lower-left summit ledge Scrub + 100 Rupees at Hyrule Field’s Castle Moat password Scrub ("Sell somethin\', will ya?").',
    smartTip:
      'Switch 2 boosted the starting Kokiri Wallet from 99 to 200 Rupees—meaning Child Link can afford either 100-Rupee Scrub Heart Piece immediately without any wallet upgrade!',
  },
];
