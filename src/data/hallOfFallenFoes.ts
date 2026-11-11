import type {
  BossRushGauntlet,
  FoeGalleryWing,
  FoeStatueEntry,
} from '../types/zelda';

export const FOE_GALLERY_WINGS: ReadonlyArray<{
  id: FoeGalleryWing;
  label: string;
  shortLabel: string;
  description: string;
}> = [
  {
    id: 'overworld',
    label: 'Overworld & Field Foes',
    shortLabel: 'Overworld',
    description: 'Creatures roaming Hyrule Field, forests, waterways, mountains, and desert.',
  },
  {
    id: 'child-dungeon',
    label: 'Child Dungeon Foes',
    shortLabel: 'Child Dungeons',
    description: 'Denizens of the Great Deku Tree, Dodongo’s Cavern, and Jabu-Jabu’s Belly.',
  },
  {
    id: 'adult-temple',
    label: 'Adult Temple & Crypt Foes',
    shortLabel: 'Adult Temples',
    description: 'Undead, elemental guardians, and traps across the Adult Temples and mini-dungeons.',
  },
  {
    id: 'mini-boss',
    label: 'Mini-Bosses & Wardens',
    shortLabel: 'Mini-Bosses',
    description: 'Mid-dungeon champions, the four Poe Sisters, Thieves’ Hideout guards, and Dark Link.',
  },
  {
    id: 'boss',
    label: 'Dungeon & Final Bosses',
    shortLabel: 'Bosses',
    description: 'All eight dungeon guardians plus Great King of Evil Ganondorf and Dark Beast Ganon.',
  },
];

/**
 * Canonical 84-statue roster for the Nintendo Switch 2 Remake's Hall of Fallen Foes
 * (`METADATA.expectedCounts.hallOfFallenFoesStatues === 84`).
 * Defeating each foe once anywhere in Child or Adult Hyrule automatically sculpts its
 * rotatable 3D pedestal in Kaepora Gaebora's dream gallery.
 */
export const HALL_OF_FALLEN_FOES_STATUES: readonly FoeStatueEntry[] = [
  // ==========================================================================
  // WING 1: OVERWORLD & FIELD FOES (20 Statues: #1–#20)
  // ==========================================================================
  {
    id: 'foe-01',
    number: 1,
    name: 'Deku Baba',
    wing: 'overworld',
    era: 'both',
    primaryRegionId: 'kokiri-forest',
    otherLocations: ['Deku Tree', 'Forest Temple'],
    weakness: 'Deku Nut / Boomerang stun or Sword slash while lunging flat',
    howToLog:
      'Wait for the snapping plant to lunge horizontally and slice its extended stem for Deku Nuts, or strike it upright with a Boomerang or Slingshot.',
    isRareOrMissable: false,
  },
  {
    id: 'foe-02',
    number: 2,
    name: 'Withered Deku Baba',
    wing: 'overworld',
    era: 'both',
    primaryRegionId: 'kokiri-forest',
    otherLocations: ['Deku Tree', 'Lost Woods'],
    weakness: 'Any Sword slash',
    howToLog:
      'Slash the motionless brown-headed plant along the path to the Great Deku Tree to log its statue and harvest a guaranteed Deku Stick.',
    isRareOrMissable: false,
  },
  {
    id: 'foe-03',
    number: 3,
    name: 'Big Deku Baba',
    wing: 'overworld',
    era: 'adult',
    primaryRegionId: 'kokiri-forest',
    otherLocations: ['Forest Temple Courtyard'],
    weakness: 'Hookshot stun + Master Sword jump-slash',
    howToLog:
      'Visit monster-overrun Kokiri Forest (before beating the Forest Temple) or the Forest Temple courtyards as Adult Link and cut down the oversized snapping plant.',
    isRareOrMissable: false,
  },
  {
    id: 'foe-04',
    number: 4,
    name: 'Mad Scrub',
    wing: 'overworld',
    era: 'child',
    primaryRegionId: 'sacred-forest-meadow',
    otherLocations: ['Kokiri Forest', 'Lost Woods'],
    weakness: 'Shield-deflect Deku Nut + chase slash',
    howToLog:
      'Hold up your Deku or Hylian Shield in the Sacred Forest Meadow hedge maze to bounce its Deku Nut right back into its snout, then tag it as it flees.',
    isRareOrMissable: false,
  },
  {
    id: 'foe-05',
    number: 5,
    name: 'Business Scrub',
    wing: 'overworld',
    era: 'both',
    primaryRegionId: 'hyrule-field',
    otherLocations: ['Death Mountain Crater', 'Lost Woods', 'Desert Colossus'],
    weakness: 'Shield-deflect Deku Nut to force surrender',
    howToLog:
      'Deflect a Deku Nut back at any merchant Scrub inside a hidden grotto or on the lower-left summit ledge of Death Mountain Crater.',
    isRareOrMissable: false,
  },
  {
    id: 'foe-06',
    number: 6,
    name: 'Peahat',
    wing: 'overworld',
    era: 'child',
    primaryRegionId: 'hyrule-field',
    weakness: 'Slingshot / Boomerang into exposed root bulb during daytime flight',
    howToLog:
      'Approach a buried rotor plant across southern Child Hyrule Field during the day so it lifts off, dodge its spinning blades, and pelt its pale underside bulb.',
    isRareOrMissable: false,
  },
  {
    id: 'foe-07',
    number: 7,
    name: 'Peahat Larva',
    wing: 'overworld',
    era: 'child',
    primaryRegionId: 'hyrule-field',
    weakness: 'Hylian Shield block (auto-destroys on impact) or Kokiri Sword slash',
    howToLog:
      'Walk right up to a sleeping Peahat in Child Hyrule Field AT NIGHT—instead of flying, it shakes and launches three tiny helicopter larvae. Block or slash one.',
    isRareOrMissable: true,
    rareTip:
      'Spawns ONLY at night in Child Hyrule Field when disturbing a grounded Peahat; one of the #1 missed statues on 100% files!',
  },
  {
    id: 'foe-08',
    number: 8,
    name: 'Stalchild',
    wing: 'overworld',
    era: 'child',
    primaryRegionId: 'hyrule-field',
    weakness: 'Two Kokiri Sword slashes or Sun’s Song',
    howToLog:
      'Step off the stone road onto the grass in Child Hyrule Field at night and strike down any rising skeleton.',
    isRareOrMissable: true,
    rareTip:
      'Appears strictly in Child-era Hyrule Field at night—players who cross before dusk and ride Epona everywhere as Adult Link can skip them.',
  },
  {
    id: 'foe-09',
    number: 9,
    name: 'Giant Stalchild',
    wing: 'overworld',
    era: 'child',
    primaryRegionId: 'hyrule-field',
    weakness: 'Deku Stick jump-slash or Bombs',
    howToLog:
      'Remain on the grass in Child Hyrule Field at night and defeat 10 regular Stalchildren in a single night without zoning out to summon the giant captain.',
    isRareOrMissable: true,
    rareTip:
      'Requires slaying 10 regular Stalchildren consecutively in Child Hyrule Field before dawn breaks.',
  },
  {
    id: 'foe-10',
    number: 10,
    name: 'Leever',
    wing: 'overworld',
    era: 'both',
    primaryRegionId: 'desert-colossus',
    otherLocations: ['Haunted Wasteland'],
    weakness: 'Sword slashes or Bow',
    howToLog:
      'Walk across the open sand in Desert Colossus or Haunted Wasteland and cut down one of the spinning green cactus burrowers.',
    isRareOrMissable: false,
  },
  {
    id: 'foe-11',
    number: 11,
    name: 'Purple Leever',
    wing: 'overworld',
    era: 'both',
    primaryRegionId: 'desert-colossus',
    otherLocations: ['Haunted Wasteland'],
    weakness: 'Biggoron’s Sword jump-slash or Hylian/Mirror Shield block + counter',
    howToLog:
      'Defeat 10 green Leevers in a row on the Desert Colossus sands without entering the Spirit Temple to make the fast, high-damage Purple Leever surface.',
    isRareOrMissable: true,
    rareTip:
      'Hidden streak spawn: only surfaces after defeating 10 green Leevers consecutively in Desert Colossus or Haunted Wasteland.',
  },
  {
    id: 'foe-12',
    number: 12,
    name: 'Red Tektite',
    wing: 'overworld',
    era: 'both',
    primaryRegionId: 'death-mountain-trail',
    otherLocations: ['Hyrule Field Grotto'],
    weakness: 'Sword jump-slash, Slingshot, or Hookshot',
    howToLog:
      'Climb the rocky switchbacks of Death Mountain Trail above Kakariko gate and defeat any bounding red four-legged spider crab.',
    isRareOrMissable: false,
  },
  {
    id: 'foe-13',
    number: 13,
    name: 'Blue Tektite',
    wing: 'overworld',
    era: 'both',
    primaryRegionId: 'lake-hylia',
    otherLocations: ['Zora’s Fountain', 'Water Temple'],
    weakness: 'Fairy Bow, Hookshot, or Slingshot',
    howToLog:
      'Target one of the water-skating blue Tektites skimming across Lake Hylia’s shallows or inside the Water Temple.',
    isRareOrMissable: false,
  },
  {
    id: 'foe-14',
    number: 14,
    name: 'Octorok',
    wing: 'overworld',
    era: 'both',
    primaryRegionId: 'zoras-river',
    otherLocations: ['Lake Hylia', 'Jabu-Jabu’s Belly'],
    weakness: 'Shield-reflect rock projectile, Slingshot, or Boomerang',
    howToLog:
      'Lock onto a surfacing red Octorok in Zora’s River or Jabu-Jabu’s Belly and bounce its spat rock right back at its snout with your Shield.',
    isRareOrMissable: false,
  },
  {
    id: 'foe-15',
    number: 15,
    name: 'Guay',
    wing: 'overworld',
    era: 'both',
    primaryRegionId: 'lake-hylia',
    otherLocations: ['Lon Lon Ranch', 'Desert Colossus'],
    weakness: 'Slingshot, Fairy Bow, or Hookshot',
    howToLog:
      'Snipe one of the circling crows over Lake Hylia’s bridges or perched around Lon Lon Ranch.',
    isRareOrMissable: false,
  },
  {
    id: 'foe-16',
    number: 16,
    name: 'Giant Guay',
    wing: 'overworld',
    era: 'both',
    primaryRegionId: 'lake-hylia',
    weakness: 'Fairy Bow / Slingshot or Timed Sword slash',
    howToLog:
      'Stand near the Lake Hylia bridges and shoot down 10 regular Guays without leaving the region to summon the oversized Giant Guay.',
    isRareOrMissable: true,
    rareTip:
      'Hidden streak spawn: shoot 10 regular Guays around Lake Hylia in one visit until the Giant Guay swoops in (drops 50+ Rupees!).',
  },
  {
    id: 'foe-17',
    number: 17,
    name: 'Wolfos',
    wing: 'overworld',
    era: 'both',
    primaryRegionId: 'sacred-forest-meadow',
    otherLocations: ['Forest Temple Foyer', 'Hyrule Field Grotto'],
    weakness: 'Block/backstep claw swipe + counter-slash exposed tail (instant kill)',
    howToLog:
      'Hold your Shield outside the Sacred Forest Meadow maze or in the Forest Temple 1F entrance hall, bait its double swipe, and slash its tail.',
    isRareOrMissable: false,
  },
  {
    id: 'foe-18',
    number: 18,
    name: 'Poe',
    wing: 'overworld',
    era: 'both',
    primaryRegionId: 'graveyard',
    otherLocations: ['Hyrule Field', 'Shadow Temple'],
    weakness: 'Un-targeted slashes or Bow (avoid Z-locking too long so it stays tangible)',
    howToLog:
      'Strike a grave marker in Kakariko Graveyard or ride across Hyrule Field and cut down a lantern-carrying spirit without holding lock-on while it turns invisible.',
    isRareOrMissable: false,
  },
  {
    id: 'foe-19',
    number: 19,
    name: 'Big Poe',
    wing: 'overworld',
    era: 'adult',
    primaryRegionId: 'hyrule-field',
    weakness: 'Two Fairy Bow arrows fired exclusively from horseback on Epona',
    howToLog:
      'Gallop Epona past any of the 10 fixed Hyrule Field Big Poe landmarks (such as the Castle Town drawbridge tree or Lon Lon T-junction sign) and land two arrows before it vanishes.',
    isRareOrMissable: true,
    rareTip:
      'Spawns ONLY while riding Epona in Adult Hyrule Field and flees within seconds—use Switch 2 gyro aiming to land two quick arrows!',
  },
  {
    id: 'foe-20',
    number: 20,
    name: 'Skull Kid',
    wing: 'overworld',
    era: 'adult',
    primaryRegionId: 'lost-woods',
    weakness: 'Master Sword / Biggoron’s Sword jump-slashes or Fairy Bow',
    howToLog:
      'Enter the Lost Woods as Adult Link and turn Left from the Kokiri entrance onto the tree stump—the frightened Skull Kid attacks with blowgun darts and drops an Orange/Gold 200-Rupee gem when defeated.',
    isRareOrMissable: true,
    rareTip:
      'Hostile only in the Adult era inside Lost Woods (Left from Kokiri entrance); most players only visit him as Child Link for the Heart Piece!',
  },

  // ==========================================================================
  // WING 2: CHILD DUNGEON FOES (18 Statues: #21–#38)
  // ==========================================================================
  {
    id: 'foe-21',
    number: 21,
    name: 'Gohma Larva',
    wing: 'child-dungeon',
    era: 'child',
    primaryRegionId: 'deku-tree',
    weakness: 'Slingshot (destroy ceiling egg first) or Kokiri Sword',
    howToLog:
      'Enter the 3F Compass room or B1 dark torch room of the Great Deku Tree (or let Queen Gohma drop an egg) and slay the one-eyed hatchling.',
    isRareOrMissable: false,
  },
  {
    id: 'foe-22',
    number: 22,
    name: 'Deku Scrub',
    wing: 'child-dungeon',
    era: 'child',
    primaryRegionId: 'deku-tree',
    otherLocations: ['Dodongo’s Cavern', 'Jabu-Jabu’s Belly'],
    weakness: 'Shield-deflect Deku Nut',
    howToLog:
      'Bounce a Deku Nut off your Deku Shield inside the Great Deku Tree (including the 2-3-1 pre-boss trio) and catch the Scrub as it pops out of its flower.',
    isRareOrMissable: false,
  },
  {
    id: 'foe-23',
    number: 23,
    name: 'Skulltula',
    wing: 'child-dungeon',
    era: 'both',
    primaryRegionId: 'deku-tree',
    otherLocations: ['Bottom of the Well', 'Forest Temple', 'Shadow Temple'],
    weakness: 'Slash soft orange belly when it spins around, or Hookshot/Bow straight through armor',
    howToLog:
      'Drop any ceiling Skulltula inside the Great Deku Tree, wait half a second for it to rotate its unarmored abdomen toward you, and slash.',
    isRareOrMissable: false,
  },
  {
    id: 'foe-24',
    number: 24,
    name: 'Big Skulltula',
    wing: 'child-dungeon',
    era: 'both',
    primaryRegionId: 'deku-tree',
    otherLocations: ['Dodongo’s Cavern', 'Forest Temple', 'Water Temple'],
    weakness: 'Two slashes to soft rear or single Deku Stick jump-slash / Hookshot + Bow',
    howToLog:
      'Encounter the larger ceiling-ambush spider on 2F/B1 of the Great Deku Tree or Adult Temples and strike its exposed back.',
    isRareOrMissable: false,
  },
  {
    id: 'foe-25',
    number: 25,
    name: 'Skullwalltula',
    wing: 'child-dungeon',
    era: 'both',
    primaryRegionId: 'deku-tree',
    otherLocations: ['Dodongo’s Cavern', 'Forest Temple'],
    weakness: 'Slingshot, Boomerang, Hookshot, or Fairy Bow before climbing vines',
    howToLog:
      'Shoot any small spider patrolling the climbable ivy walls of the Great Deku Tree 1F trunk before climbing.',
    isRareOrMissable: false,
  },
  {
    id: 'foe-26',
    number: 26,
    name: 'Gold Skulltula',
    wing: 'child-dungeon',
    era: 'both',
    primaryRegionId: 'deku-tree',
    otherLocations: ['All Overworld Provinces & Dungeons (100 Total)'],
    weakness: 'Any weapon + Boomerang / Hookshot to collect token',
    howToLog:
      'Defeat any one of the 100 Gold Skulltulas hidden across Hyrule and its dungeons to unlock its golden gallery pedestal.',
    isRareOrMissable: false,
  },
  {
    id: 'foe-27',
    number: 27,
    name: 'Keese',
    wing: 'child-dungeon',
    era: 'both',
    primaryRegionId: 'deku-tree',
    otherLocations: ['Dodongo’s Cavern', 'Graveyard', 'Shadow Temple'],
    weakness: 'Slingshot, Sword, Boomerang, or Hookshot',
    howToLog:
      'Swat or shoot a standard cave bat inside the Great Deku Tree, Royal Family’s Tomb, or Dodongo’s Cavern.',
    isRareOrMissable: false,
  },
  {
    id: 'foe-28',
    number: 28,
    name: 'Fire Keese',
    wing: 'child-dungeon',
    era: 'both',
    primaryRegionId: 'dodongos-cavern',
    otherLocations: ['Fire Temple', 'Bottom of the Well', 'Shadow Temple'],
    weakness: 'Hylian Shield block, Slingshot, or Hookshot (unequip Deku Shield!)',
    howToLog:
      'Switch off your wooden Deku Shield inside Dodongo’s Cavern or the Fire Temple and shoot or slash a flame-wreathed bat.',
    isRareOrMissable: false,
  },
  {
    id: 'foe-29',
    number: 29,
    name: 'Baby Dodongo',
    wing: 'child-dungeon',
    era: 'child',
    primaryRegionId: 'dodongos-cavern',
    weakness: 'Single Sword slash (step back before it explodes!)',
    howToLog:
      'Walk down the 1F east corridor of Dodongo’s Cavern so the burrowing lava grubs pop up, slash one, and backflip clear of its blast.',
    isRareOrMissable: false,
  },
  {
    id: 'foe-30',
    number: 30,
    name: 'Dodongo',
    wing: 'child-dungeon',
    era: 'child',
    primaryRegionId: 'dodongos-cavern',
    weakness: 'Bomb tossed near mouth or Deku Nut stun + tail jump-slash',
    howToLog:
      'Defeat one of the adult fire-breathing Dodongos inside the 1F east torch room of Dodongo’s Cavern using a Bomb or tail slashes.',
    isRareOrMissable: false,
  },
  {
    id: 'foe-31',
    number: 31,
    name: 'Lizalfos',
    wing: 'child-dungeon',
    era: 'both',
    primaryRegionId: 'dodongos-cavern',
    otherLocations: ['Spirit Temple'],
    weakness: 'Shield block leap + counter-slash or Deku Stick jump-slash',
    howToLog:
      'Clear the mandatory paired Lizalfos arenas inside Dodongo’s Cavern (en route to the Bomb Bag) or the Child/Adult wings of the Spirit Temple.',
    isRareOrMissable: false,
  },
  {
    id: 'foe-32',
    number: 32,
    name: 'Armos',
    wing: 'child-dungeon',
    era: 'both',
    primaryRegionId: 'dodongos-cavern',
    otherLocations: ['Spirit Temple'],
    weakness: 'Bomb / Bomb Flower or Deku Nut stun + Sword slash',
    howToLog:
      'Touch a living stone statue in Dodongo’s Cavern or the Spirit Temple to wake it, toss a Bomb to shatter it, and dodge its final hop before it detonates.',
    isRareOrMissable: false,
  },
  {
    id: 'foe-33',
    number: 33,
    name: 'Shabom',
    wing: 'child-dungeon',
    era: 'child',
    primaryRegionId: 'jabu-jabus-belly',
    weakness: 'Any Sword slash, Slingshot, or Boomerang pop',
    howToLog:
      'Pop one of the bouncing pink soap bubbles in the opening chambers of Inside Jabu-Jabu’s Belly as Child Link.',
    isRareOrMissable: true,
    rareTip:
      'Exclusive to Child-only Jabu-Jabu’s Belly! If skipped, return to Child Link via the Pedestal of Time and step inside Jabu-Jabu’s mouth.',
  },
  {
    id: 'foe-34',
    number: 34,
    name: 'Biri',
    wing: 'child-dungeon',
    era: 'child',
    primaryRegionId: 'jabu-jabus-belly',
    weakness: 'Boomerang, Deku Sticks, or throwing Princess Ruto (never bare Kokiri Sword!)',
    howToLog:
      'Defeat any small floating jellyfish inside Jabu-Jabu’s Belly using the Boomerang or a Deku Stick so you avoid electric shock.',
    isRareOrMissable: true,
    rareTip:
      'Exclusive to Child-only Jabu-Jabu’s Belly—if you ran past them before getting the Boomerang, toss the Boomerang at one on your way out.',
  },
  {
    id: 'foe-35',
    number: 35,
    name: 'Bari',
    wing: 'child-dungeon',
    era: 'child',
    primaryRegionId: 'jabu-jabus-belly',
    weakness: 'Boomerang (splits into smaller Biri, then Boomerang again)',
    howToLog:
      'Walk beneath the ceiling in the B1/1F chambers of Jabu-Jabu’s Belly to drop a giant electric jellyfish, then strike it and its split Biri with the Boomerang.',
    isRareOrMissable: true,
    rareTip:
      'Exclusive to Child-only Jabu-Jabu’s Belly (though Barinade’s spinning jellyfish ring also counts if destroyed during the boss fight!).',
  },
  {
    id: 'foe-36',
    number: 36,
    name: 'Stinger',
    wing: 'child-dungeon',
    era: 'both',
    primaryRegionId: 'jabu-jabus-belly',
    otherLocations: ['Water Temple'],
    weakness: 'Slingshot, Boomerang, Fairy Bow, or Hookshot while airborne',
    howToLog:
      'Clear the four water-skimming manta rays in the 1F east room of Jabu-Jabu’s Belly to spawn the Boomerang chest (also found in the Water Temple).',
    isRareOrMissable: false,
  },
  {
    id: 'foe-37',
    number: 37,
    name: 'Tailpasaran',
    wing: 'child-dungeon',
    era: 'child',
    primaryRegionId: 'jabu-jabus-belly',
    weakness: 'Boomerang lock-on to head segment',
    howToLog:
      'Drop into the B1 eastern side room (or pit alcoves) of Jabu-Jabu’s Belly and lock your Boomerang onto the electric segmented worm.',
    isRareOrMissable: true,
    rareTip:
      'Easy to miss! Appears only in optional side chambers of Child-only Jabu-Jabu’s Belly.',
  },
  {
    id: 'foe-38',
    number: 38,
    name: 'Parasitic Tentacle',
    wing: 'child-dungeon',
    era: 'child',
    primaryRegionId: 'jabu-jabus-belly',
    weakness: 'Repeated Boomerang hits while Z/ZL-targeted',
    howToLog:
      'Sever the Red, Blue/Yellow, and Green fleshy ceiling tentacles inside Jabu-Jabu’s Belly with the Boomerang to clear the path to Big Octo and Barinade.',
    isRareOrMissable: false,
  },

  // ==========================================================================
  // WING 3: ADULT TEMPLE & CRYPT FOES (25 Statues: #39–#63)
  // ==========================================================================
  {
    id: 'foe-39',
    number: 39,
    name: 'Stalfos',
    wing: 'adult-temple',
    era: 'adult',
    primaryRegionId: 'forest-temple',
    otherLocations: ['Shadow Temple', 'Spirit Temple', 'Gerudo Training Ground', 'Ganon’s Castle'],
    weakness: 'Deku Nut stun or counter-slash right as its shield drops to swing',
    howToLog:
      'Defeat the armored skeletal knights inside the Forest Temple (mandatory for the Small Key and Fairy Bow).',
    isRareOrMissable: false,
  },
  {
    id: 'foe-40',
    number: 40,
    name: 'Blue Bubble',
    wing: 'adult-temple',
    era: 'both',
    primaryRegionId: 'forest-temple',
    otherLocations: ['Bottom of the Well', 'Shadow Temple'],
    weakness: 'Hylian Shield bump / Hookshot / Deku Nut to extinguish blue flame, then slash',
    howToLog:
      'Knock the cursed blue fire off a winged skull in the Forest Temple courtyards or hallways with your Hookshot or Shield, then cut it down.',
    isRareOrMissable: false,
  },
  {
    id: 'foe-41',
    number: 41,
    name: 'Green Bubble',
    wing: 'adult-temple',
    era: 'both',
    primaryRegionId: 'forest-temple',
    otherLocations: ['Spirit Temple', 'Bottom of the Well'],
    weakness: 'Hookshot / Bow or Sword slash once green flame cycles off',
    howToLog:
      'Wait for the hovering skull’s green fire aura to wink out (or pierce it immediately with the Hookshot/Boomerang) in the Forest or Spirit Temple.',
    isRareOrMissable: false,
  },
  {
    id: 'foe-42',
    number: 42,
    name: 'White Bubble',
    wing: 'adult-temple',
    era: 'both',
    primaryRegionId: 'spirit-temple',
    otherLocations: ['Forest Temple Twisted Hallway'],
    weakness: 'Sword slash or Hookshot once it pauses along its floor track',
    howToLog:
      'Intercept one of the pale, flame-free skulls racing rapidly around the floor perimeter in the Forest Temple or Spirit Temple boulder rooms.',
    isRareOrMissable: true,
    rareTip:
      'Races harmlessly around room edges rather than chasing Link—make sure to slash one instead of running straight through the door!',
  },
  {
    id: 'foe-43',
    number: 43,
    name: 'Red Bubble',
    wing: 'adult-temple',
    era: 'adult',
    primaryRegionId: 'fire-temple',
    otherLocations: ['Death Mountain Crater', 'Ganon’s Castle'],
    weakness: 'Hylian Shield block on bridge or Hookshot / Ice Arrow',
    howToLog:
      'Hold up your Hylian Shield on the 1F lava bridge in the Fire Temple or Death Mountain Crater so a leaping magma skull bounces onto stone, then slash it.',
    isRareOrMissable: false,
  },
  {
    id: 'foe-44',
    number: 44,
    name: 'Wallmaster',
    wing: 'adult-temple',
    era: 'both',
    primaryRegionId: 'forest-temple',
    otherLocations: ['Bottom of the Well', 'Shadow Temple', 'Spirit Temple'],
    weakness: 'Roll clear of growing floor shadow, then jump-slash landed hand',
    howToLog:
      'Listen for the descending whoosh in the Forest Temple twisted hallway, dodge the shadow, and carve up the giant hand before it rises back to the ceiling.',
    isRareOrMissable: false,
  },
  {
    id: 'foe-45',
    number: 45,
    name: 'Floormaster',
    wing: 'adult-temple',
    era: 'both',
    primaryRegionId: 'forest-temple',
    otherLocations: ['Bottom of the Well', 'Shadow Temple', 'Spirit Temple'],
    weakness: 'Din’s Fire or rapid Spin Attack to wipe all 3 split mini-hands before they regrow',
    howToLog:
      'Slash a floor-crawling hand (use Lens of Truth for invisible ones in Shadow/Spirit Temple) so it splits into three tiny hands, then destroy all three quickly before one grabs you and regenerates.',
    isRareOrMissable: false,
  },
  {
    id: 'foe-46',
    number: 46,
    name: 'Moblin',
    wing: 'adult-temple',
    era: 'adult',
    primaryRegionId: 'sacred-forest-meadow',
    weakness: 'Hookshot stun + Master Sword slash or Fairy Bow from behind',
    howToLog:
      'Enter the Adult Sacred Forest Meadow hedge maze BEFORE completing the Forest Temple, freeze a spear-charging bulldog guard with your Hookshot, and defeat it.',
    isRareOrMissable: true,
    rareTip:
      'Spear Moblins patrol Sacred Forest Meadow ONLY until you clear the Forest Temple—slay at least one on your walk in (if missed, check the Forest Trial / Hall hint pedestal)!',
  },
  {
    id: 'foe-47',
    number: 47,
    name: 'Torch Slug',
    wing: 'adult-temple',
    era: 'adult',
    primaryRegionId: 'fire-temple',
    otherLocations: ['Ganon’s Castle Fire Trial'],
    weakness: 'Megaton Hammer shockwave or Master Sword slashes (extinguishes fire coat first)',
    howToLog:
      'Slam the Megaton Hammer beside a flaming magma slug on 3F–5F of the Fire Temple or slash it twice once its flame snuffs out and it flees.',
    isRareOrMissable: false,
  },
  {
    id: 'foe-48',
    number: 48,
    name: 'Like Like',
    wing: 'adult-temple',
    era: 'both',
    primaryRegionId: 'fire-temple',
    otherLocations: ['Bottom of the Well', 'Water Temple', 'Shadow Temple', 'Spirit Temple', 'Gerudo Training Ground'],
    weakness: 'Fairy Bow, Bombs, or Din’s Fire from safe range (protects Tunics & Shield!)',
    howToLog:
      'Pelt a wobbling cylindrical tube monster with arrows or Bombs from afar inside Bottom of the Well or the Fire Temple so it never swallows your gear.',
    isRareOrMissable: false,
  },
  {
    id: 'foe-49',
    number: 49,
    name: 'Flying Floor Tile',
    wing: 'adult-temple',
    era: 'adult',
    primaryRegionId: 'fire-temple',
    otherLocations: ['Spirit Temple'],
    weakness: 'Timed horizontal Sword slash mid-flight (Shield block does NOT count as a kill!)',
    howToLog:
      'Step into the 1F Song of Time tile chamber in the Fire Temple or the Spirit Temple tile trap room and actively slash a launching ceramic tile out of the air.',
    isRareOrMissable: true,
    rareTip:
      'Holding up your Shield shatters tiles defensively without registering a kill—swing your Sword to slice at least one tile mid-flight!',
  },
  {
    id: 'foe-50',
    number: 50,
    name: 'Flying Pot',
    wing: 'adult-temple',
    era: 'both',
    primaryRegionId: 'shadow-temple',
    otherLocations: ['Dodongo’s Cavern', 'Forest Temple', 'Spirit Temple'],
    weakness: 'Sword slash, Hookshot, or Bow shot as the mimic pot lifts off',
    howToLog:
      'Watch for trembling clay pots inside the Shadow Temple, Spirit Temple, or Dodongo’s Cavern side rooms and smash one with your blade as it hurls itself at you.',
    isRareOrMissable: true,
    rareTip:
      'Easy to ignore or block with your Shield—make sure to actively strike a shaking mimic pot with your Sword or Hookshot!',
  },
  {
    id: 'foe-51',
    number: 51,
    name: 'Door Mimic',
    wing: 'adult-temple',
    era: 'adult',
    primaryRegionId: 'fire-temple',
    otherLocations: ['Water Temple'],
    weakness: 'Plant a Bomb directly in front of the fake wooden door',
    howToLog:
      'Spot the slightly off-color, knob-shifting fake wooden doors on 3F/4F of the Fire Temple (or Water Temple) and blow one apart with a Bomb.',
    isRareOrMissable: true,
    rareTip:
      'Most players either get flattened once and run past or never open decoy doors—drop a Bomb in front of a fake Fire Temple door to log its statue!',
  },
  {
    id: 'foe-52',
    number: 52,
    name: 'Freezard',
    wing: 'adult-temple',
    era: 'adult',
    primaryRegionId: 'ice-cavern',
    otherLocations: ['Ganon’s Castle Water Trial'],
    weakness: 'Din’s Fire, Fire Arrows, Hookshot, or Master Sword jump-slashes',
    howToLog:
      'Shatter the frost-breathing ice statues in the opening halls of the Ice Cavern (mandatory to unbar the spinning-blade room).',
    isRareOrMissable: false,
  },
  {
    id: 'foe-53',
    number: 53,
    name: 'Ice Keese',
    wing: 'adult-temple',
    era: 'adult',
    primaryRegionId: 'ice-cavern',
    otherLocations: ['Ganon’s Castle Water Trial'],
    weakness: 'Hookshot, Fairy Bow, or Din’s Fire before they swoop close',
    howToLog:
      'Snipe the frost-aura bats inside the Ice Cavern Compass/Blue Fire chamber or Ganon’s Water Trial from range so they cannot freeze Link solid.',
    isRareOrMissable: false,
  },
  {
    id: 'foe-54',
    number: 54,
    name: 'Shell Blade',
    wing: 'adult-temple',
    era: 'adult',
    primaryRegionId: 'water-temple',
    weakness: 'Hookshot / Longshot or Fairy Bow strictly into open red inner muscle',
    howToLog:
      'Sink with Iron Boots in the 1F SE torch room of the Water Temple, bait a snapping giant clam to open its shell, and Hookshot its red core.',
    isRareOrMissable: false,
  },
  {
    id: 'foe-55',
    number: 55,
    name: 'Spike',
    wing: 'adult-temple',
    era: 'adult',
    primaryRegionId: 'water-temple',
    weakness: 'Hookshot / Longshot stun (makes spikes retract into smooth stone) + Sword slash',
    howToLog:
      'Grapple a spiked stone sea-urchin ball inside the Water Temple 2F/3F platforms with your Hookshot to force its spikes inward, then finish it with your Sword.',
    isRareOrMissable: false,
  },
  {
    id: 'foe-56',
    number: 56,
    name: 'White Wolfos',
    wing: 'adult-temple',
    era: 'adult',
    primaryRegionId: 'ice-cavern',
    otherLocations: ['Gerudo Training Ground', 'Ganon’s Castle Water Trial'],
    weakness: 'Shield block double lunge + Master Sword jump-slash to back/tail, or Din’s Fire',
    howToLog:
      'Defeat the giant snow-furred Wolfos guarding the Iron Boots chest at the end of the Ice Cavern.',
    isRareOrMissable: true,
    rareTip:
      'Only three fixed encounters exist in Hyrule (Ice Cavern Iron Boots room, Gerudo Training Ground illusory room, and Ganon’s Water Trial).',
  },
  {
    id: 'foe-57',
    number: 57,
    name: 'ReDead',
    wing: 'adult-temple',
    era: 'both',
    primaryRegionId: 'bottom-of-the-well',
    otherLocations: ['Graveyard Royal Tomb', 'Adult Market', 'Shadow Temple'],
    weakness: 'Sun’s Song freezes all ReDeads in the room! Slash from behind',
    howToLog:
      'Play the Sun’s Song inside Kakariko Graveyard crypts, Bottom of the Well, or the Shadow Temple to paralyze a ReDead and cut it down safely.',
    isRareOrMissable: false,
  },
  {
    id: 'foe-58',
    number: 58,
    name: 'Gibdo',
    wing: 'adult-temple',
    era: 'both',
    primaryRegionId: 'bottom-of-the-well',
    otherLocations: ['Shadow Temple'],
    weakness: 'Sun’s Song stun + Sword slashes, or Din’s Fire / Fire Arrows to burn bandages',
    howToLog:
      'Defeat a bandage-wrapped mummy in the B3 key chambers of the Shadow Temple or Bottom of the Well crypts.',
    isRareOrMissable: false,
  },
  {
    id: 'foe-59',
    number: 59,
    name: "Dead Hand's Hand",
    wing: 'adult-temple',
    era: 'both',
    primaryRegionId: 'bottom-of-the-well',
    otherLocations: ['Shadow Temple'],
    weakness: 'Un-targeted horizontal Sword slashes or Din’s Fire',
    howToLog:
      'During the Dead Hand fight in Bottom of the Well or Shadow Temple, slice all the way through one of the pale floor-grasping arms before finishing Dead Hand.',
    isRareOrMissable: true,
    rareTip:
      'Separate Navi & Gallery entry from Dead Hand itself! Make sure to destroy at least one Pale Hand arm rather than only hitting Dead Hand’s head.',
  },
  {
    id: 'foe-60',
    number: 60,
    name: 'Beamos',
    wing: 'adult-temple',
    era: 'both',
    primaryRegionId: 'shadow-temple',
    otherLocations: ['Dodongo’s Cavern', 'Spirit Temple', 'Gerudo Training Ground', 'Ganon’s Castle'],
    weakness: 'Toss a Bomb or send a Bombchu directly into its eye tower',
    howToLog:
      'Throw a Bomb at any rotating one-eyed laser statue (mandatory on B2 of the Shadow Temple and in Gerudo Training Ground).',
    isRareOrMissable: true,
    rareTip:
      'Many players sprint past Beamos turrets thinking they are indestructible traps—one Bomb shatters them and logs Statue #60!',
  },
  {
    id: 'foe-61',
    number: 61,
    name: 'Anubis',
    wing: 'adult-temple',
    era: 'both',
    primaryRegionId: 'spirit-temple',
    weakness: 'Immune to blades! Cast Din’s Fire, shoot a Fire Arrow, or lure into a fire ring',
    howToLog:
      'Inside the Spirit Temple, mirror-step the floating jackal sarcophagus into a ring of fire (Child wing) or roast it immediately with Din’s Fire / Fire Arrows (Adult wing).',
    isRareOrMissable: false,
  },
  {
    id: 'foe-62',
    number: 62,
    name: 'Dinolfos',
    wing: 'adult-temple',
    era: 'adult',
    primaryRegionId: 'gerudo-training-ground',
    otherLocations: ['Ganon’s Castle Tower'],
    weakness: 'Deku Nut / Hookshot stun during fire breath + Biggoron’s Sword jump-slash',
    howToLog:
      'Defeat the armored veteran lizard warriors inside Gerudo Training Ground or on the opening floor of Ganon’s Tower.',
    isRareOrMissable: false,
  },
  {
    id: 'foe-63',
    number: 63,
    name: 'Composer Brothers (Flat & Sharp)',
    wing: 'adult-temple',
    era: 'child',
    primaryRegionId: 'graveyard',
    weakness: 'Kokiri Sword slashes or Deku Sticks while tangible',
    howToLog:
      'At night in Kakariko Graveyard as Child Link, pull back the two small graves flanking the Royal Family’s Tomb courtyard, drop inside each, and defeat Flat and Sharp to hear their backstory.',
    isRareOrMissable: true,
    rareTip:
      'Completely optional Graveyard crypt encounters! Pull back both rear corner graves in front of the Royal Family’s Tomb to log them.',
  },

  // ==========================================================================
  // WING 4: MINI-BOSSES & WARDENS (11 Statues: #64–#74)
  // ==========================================================================
  {
    id: 'foe-64',
    number: 64,
    name: 'Big Octo',
    wing: 'mini-boss',
    era: 'child',
    primaryRegionId: 'jabu-jabus-belly',
    weakness: 'Boomerang from behind to reverse spin + Kokiri Sword / Deku Stick into green back orb',
    howToLog:
      'Mandatory mini-boss inside Child-only Jabu-Jabu’s Belly after Princess Ruto rides the Zora’s Sapphire platform upward.',
    isRareOrMissable: false,
  },
  {
    id: 'foe-65',
    number: 65,
    name: 'Dead Hand',
    wing: 'mini-boss',
    era: 'both',
    primaryRegionId: 'bottom-of-the-well',
    otherLocations: ['Shadow Temple (Hover Boots Arena)'],
    weakness: 'Wiggle free from Pale Hand grab to bait lowered jaw + Jump-Slash / Crouch-Stabs',
    howToLog:
      'Defeat Dead Hand inside Bottom of the Well (guards the Lens of Truth) or on B1 of the Shadow Temple (guards the Hover Boots).',
    isRareOrMissable: false,
  },
  {
    id: 'foe-66',
    number: 66,
    name: 'Club Moblin',
    wing: 'mini-boss',
    era: 'adult',
    primaryRegionId: 'sacred-forest-meadow',
    weakness: 'Side-hop ground shockwaves, sprint behind, and slash back (or snipe with Hookshot/Bow)',
    howToLog:
      'Defeat the towering club-wielding giant Moblin guarding the stone staircase to the Forest Temple in Adult Sacred Forest Meadow.',
    isRareOrMissable: true,
    rareTip:
      'Easy to run right past on the steps! Vanishes from Sacred Forest Meadow once the Forest Temple is cleared—make sure to fell him before beating Phantom Ganon!',
  },
  {
    id: 'foe-67',
    number: 67,
    name: 'Poe Sister: Joelle',
    wing: 'mini-boss',
    era: 'adult',
    primaryRegionId: 'forest-temple',
    weakness: 'Snipe red-flame portrait from afar with Fairy Bow, then shoot materialized ghost',
    howToLog:
      'Mandatory Forest Temple red-torch guardian in the 2F eastern portrait stairwell.',
    isRareOrMissable: false,
  },
  {
    id: 'foe-68',
    number: 68,
    name: 'Poe Sister: Beth',
    wing: 'mini-boss',
    era: 'adult',
    primaryRegionId: 'forest-temple',
    weakness: 'Snipe blue-flame portrait from afar with Fairy Bow, then shoot materialized ghost',
    howToLog:
      'Mandatory Forest Temple blue-torch guardian in the 2F western portrait stairwell.',
    isRareOrMissable: false,
  },
  {
    id: 'foe-69',
    number: 69,
    name: 'Poe Sister: Amy',
    wing: 'mini-boss',
    era: 'adult',
    primaryRegionId: 'forest-temple',
    weakness: 'Solve sliding portrait blocks under 1:00, then Fairy Bow',
    howToLog:
      'Mandatory Forest Temple green-torch guardian awakened after completing her five-piece sliding block puzzle.',
    isRareOrMissable: false,
  },
  {
    id: 'foe-70',
    number: 70,
    name: 'Poe Sister: Meg',
    wing: 'mini-boss',
    era: 'adult',
    primaryRegionId: 'forest-temple',
    weakness: 'Watch all 4 clones appear and shoot the ONE clone that twirls once in place',
    howToLog:
      'Mandatory fourth Poe Sister battle in the 1F central Forest Temple hall unlocking the B2 boss elevator.',
    isRareOrMissable: false,
  },
  {
    id: 'foe-71',
    number: 71,
    name: 'Flare Dancer',
    wing: 'mini-boss',
    era: 'adult',
    primaryRegionId: 'fire-temple',
    weakness: 'Hookshot or Bomb core out of flame coat + sprint-slash fleeing dancer',
    howToLog:
      'Defeat Flare Dancer on 4F (en route to the Megaton Hammer) or on 1F west (en route to the Boss Key) inside the Fire Temple.',
    isRareOrMissable: false,
  },
  {
    id: 'foe-72',
    number: 72,
    name: 'Dark Link',
    wing: 'mini-boss',
    era: 'adult',
    primaryRegionId: 'water-temple',
    weakness: 'Din’s Fire, Megaton Hammer, or un-targeted Biggoron’s Sword diagonal slashes',
    howToLog:
      'Duel your reflection across the misty island on 3F of the Water Temple to claim the Longshot (and unlock on-demand Dark Link rematches in the Hall!).',
    isRareOrMissable: false,
  },
  {
    id: 'foe-73',
    number: 73,
    name: 'Gerudo Fighter',
    wing: 'mini-boss',
    era: 'adult',
    primaryRegionId: 'gerudo-fortress',
    weakness: 'Side-hop spinning jump-chop (instant capture if hit!) + Biggoron’s Sword or Bow',
    howToLog:
      'Defeat the four twin-scimitar Gerudo wardens inside Thieves’ Hideout to rescue Ichiro, Jiro, Saburo, and Shiro and earn the Gerudo Membership Card.',
    isRareOrMissable: false,
  },
  {
    id: 'foe-74',
    number: 74,
    name: 'Iron Knuckle',
    wing: 'mini-boss',
    era: 'both',
    primaryRegionId: 'spirit-temple',
    otherLocations: ['Gerudo Training Ground', 'Ganon’s Castle Tower'],
    weakness: 'Bait axe swing, backflip clear, and counter with Jump-Slashes (shatters armor at 50% HP)',
    howToLog:
      'Defeat the armored juggernauts guarding the Silver Gauntlets, Mirror Shield, and Twinrova antechamber in the Spirit Temple (also replayable solo in the Hall!).',
    isRareOrMissable: false,
  },

  // ==========================================================================
  // WING 5: DUNGEON & FINAL BOSSES (10 Statues: #75–#84)
  // ==========================================================================
  {
    id: 'foe-75',
    number: 75,
    name: 'Queen Gohma',
    wing: 'boss',
    era: 'child',
    primaryRegionId: 'deku-tree',
    weakness: 'Slingshot / Deku Nut into red eye + Deku Stick Jump-Slash & Crouch-Stabs',
    howToLog:
      'Defeat Parasitic Armored Arachnid Queen Gohma at the bottom of Inside the Great Deku Tree.',
    isRareOrMissable: false,
  },
  {
    id: 'foe-76',
    number: 76,
    name: 'King Dodongo',
    wing: 'boss',
    era: 'child',
    primaryRegionId: 'dodongos-cavern',
    weakness: 'Toss Bomb / Bomb Flower into inhaling jaws + Deku Stick Jump-Slash',
    howToLog:
      'Defeat Infernal Dinosaur King Dodongo in the lava caldera of Dodongo’s Cavern.',
    isRareOrMissable: false,
  },
  {
    id: 'foe-77',
    number: 77,
    name: 'Barinade',
    wing: 'boss',
    era: 'child',
    primaryRegionId: 'jabu-jabus-belly',
    weakness: 'Boomerang ceiling tentacles & Bari shield + Sword combos',
    howToLog:
      'Defeat Bio-Electric Anemone Barinade inside Jabu-Jabu’s Belly.',
    isRareOrMissable: false,
  },
  {
    id: 'foe-78',
    number: 78,
    name: 'Phantom Ganon',
    wing: 'boss',
    era: 'adult',
    primaryRegionId: 'forest-temple',
    weakness: 'Fairy Bow into purple-swirling portrait + Master Sword energy-orb rally',
    howToLog:
      'Defeat Evil Spirit from Beyond Phantom Ganon in the B2 gallery of the Forest Temple.',
    isRareOrMissable: false,
  },
  {
    id: 'foe-79',
    number: 79,
    name: 'Volvagia',
    wing: 'boss',
    era: 'adult',
    primaryRegionId: 'fire-temple',
    weakness: 'Megaton Hammer concuss on emerging head + Master Sword Jump-Slash',
    howToLog:
      'Defeat Subterranean Lava Dragon Volvagia inside the Fire Temple.',
    isRareOrMissable: false,
  },
  {
    id: 'foe-80',
    number: 80,
    name: 'Morpha',
    wing: 'boss',
    era: 'adult',
    primaryRegionId: 'water-temple',
    weakness: 'Longshot red nucleus onto dry corner stone + continuous horizontal slashes',
    howToLog:
      'Defeat Giant Aquatic Amoeba Morpha in the Water Temple (unfreezing Zora’s Domain in Switch 2!).',
    isRareOrMissable: false,
  },
  {
    id: 'foe-81',
    number: 81,
    name: 'Bongo Bongo',
    wing: 'boss',
    era: 'adult',
    primaryRegionId: 'shadow-temple',
    weakness: 'Fairy Bow into both hands + Lens of Truth arrow into charging eye + Sword',
    howToLog:
      'Defeat Phantom Shadow Beast Bongo Bongo on the subterranean drum of the Shadow Temple.',
    isRareOrMissable: false,
  },
  {
    id: 'foe-82',
    number: 82,
    name: 'Twinrova',
    wing: 'boss',
    era: 'adult',
    primaryRegionId: 'spirit-temple',
    weakness: 'Mirror Shield cross-beam (Phase 1) + absorb 3 matching elements (Phase 2)',
    howToLog:
      'Defeat Sorceress Sisters Koume & Kotake / Twinrova atop the Spirit Temple.',
    isRareOrMissable: false,
  },
  {
    id: 'foe-83',
    number: 83,
    name: 'Ganondorf',
    wing: 'boss',
    era: 'adult',
    primaryRegionId: 'ganons-castle',
    weakness: 'Sword / Spin Attack orb reflection + Light Arrow stun + Longshot & Blade',
    howToLog:
      'Triumph over Great King of Evil Ganondorf at the summit of Ganon’s Tower.',
    isRareOrMissable: false,
  },
  {
    id: 'foe-84',
    number: 84,
    name: 'Ganon',
    wing: 'boss',
    era: 'adult',
    primaryRegionId: 'ganons-castle',
    weakness: 'Light Arrow stun / roll under legs + Biggoron’s Sword -> Master Sword tail finish',
    howToLog:
      'Seal Dark Beast Ganon in the blazing ruins of Ganon’s Castle (automatically saved to your cleared file for the Hall of Fallen Foes!).',
    isRareOrMissable: false,
  },
];

export const FOE_STATUE_BY_ID: Record<string, FoeStatueEntry> = Object.fromEntries(
  HALL_OF_FALLEN_FOES_STATUES.map((statue) => [statue.id, statue]),
);

export const BOSS_RUSH_GAUNTLETS: readonly BossRushGauntlet[] = [
  {
    id: 'gauntlet-child',
    title: 'Child Dungeon Boss Rush',
    subtitle: '3-Bout Spiritual Stone Sprint',
    unlockCondition:
      'Defeat Queen Gohma, King Dodongo, and Barinade, and unlock the Hall of Fallen Foes post-Forest Temple.',
    arenaLoadout:
      'Kokiri Sword, Deku & Hylian Shields, Fairy Slingshot (30 Seeds), Bomb Bag (20 Bombs), Boomerang, 10 Deku Sticks, 10 Deku Nuts, 6 Hearts',
    lineup: ['Queen Gohma', 'King Dodongo', 'Barinade'],
    targetTimes: {
      bronze: '05:00',
      silver: '03:15',
      gold: '02:00',
      master: '01:15',
    },
    strategyTip:
      'Stun Queen Gohma before she climbs and one-cycle her with a Deku Stick jump-slash plus crouch-stabs; hug the inner lava bevel against King Dodongo; and circle-strafe Barinade while sweeping her Bari ring with the Boomerang.',
  },
  {
    id: 'gauntlet-adult-sages',
    title: 'Adult Sage Boss Rush',
    subtitle: '5-Bout Temple Guardians Endurance',
    unlockCondition:
      'Awaken all five Temple Sages (Forest, Fire, Water, Shadow, and Spirit Medallions).',
    arenaLoadout:
      'Master Sword, Mirror Shield, Longshot, Fairy Bow (40 Arrows), Megaton Hammer, Hover & Iron Boots, Lens of Truth, Goron & Zora Tunics, Din’s Fire, Magic Meter, 12 Hearts',
    lineup: ['Phantom Ganon', 'Volvagia', 'Morpha', 'Bongo Bongo', 'Twinrova'],
    targetTimes: {
      bronze: '14:00',
      silver: '09:30',
      gold: '06:30',
      master: '04:30',
    },
    strategyTip:
      'Snap-aim Phantom Ganon’s purple-vortex portrait with Switch 2 gyro controls, pin Morpha’s nucleus into an outer stone corner with the Longshot, pulse Lens of Truth for just a split second on Bongo Bongo, and side-hop mismatched Twinrova elements.',
  },
  {
    id: 'gauntlet-master',
    title: 'Master All-Bosses + Dark Link Gauntlet',
    subtitle: '11-Bout Ultimate Dream Trial (Zelda Notes Leaderboard)',
    unlockCondition:
      'Defeat Dark Beast Ganon and log all 10 Bosses plus Dark Link in the Hall of Fallen Foes.',
    arenaLoadout:
      'Master Sword, Biggoron’s Sword, Mirror Shield, Full Child & Adult Dungeon Arsenal, Fire / Ice / Light Arrows, Din’s Fire, Double Magic Meter, 16 Hearts (1 Bottled Fairy at Midpoint)',
    lineup: [
      'Queen Gohma',
      'King Dodongo',
      'Barinade',
      'Phantom Ganon',
      'Volvagia',
      'Dark Link',
      'Morpha',
      'Bongo Bongo',
      'Twinrova',
      'Ganondorf',
      'Ganon',
    ],
    targetTimes: {
      bronze: '25:00',
      silver: '18:00',
      gold: '12:30',
      master: '09:00',
    },
    strategyTip:
      'Save half a bar of Magic through Volvagia to melt Dark Link in seconds with Din’s Fire, reflect Ganondorf’s 5-orb dark volley with a single Charged Spin Attack, and equip Biggoron’s Sword immediately when Ganon knocks away the Master Sword.',
  },
];

export const BOSS_RUSH_GAUNTLET_BY_ID: Record<string, BossRushGauntlet> = Object.fromEntries(
  BOSS_RUSH_GAUNTLETS.map((gauntlet) => [gauntlet.id, gauntlet]),
);
