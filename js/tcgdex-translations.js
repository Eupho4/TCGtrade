// Traducciones manuales de sets de TCGdex
const setTranslations = {
  // Sets japoneses clásicos (PMCG - Primera generación)
  'pmcg1': 'Base Set',
  'pmcg2': 'Jungle',
  'pmcg3': 'Fossil',
  'pmcg4': 'Team Rocket',
  'pmcg5': 'Gym Leaders Stadium',
  'pmcg6': 'Challenge from the Darkness',
  
  // Neo Series
  'neo1': 'Gold, Silver, New World',
  'neo2': 'Crossing the Ruins',
  'neo3': 'Awakening Legends',
  'neo4': 'Darkness, and to Light',
  
  // VS y Web
  'vs1': 'Pokemon Card VS',
  'web1': 'Pokemon Card Web',
  
  // E-Card Series
  'e1': 'Base Expansion Pack',
  'e2': 'The Town on No Map',
  'e3': 'Wind from the Sea',
  'e4': 'Split Earth',
  'e5': 'Mysterious Mountains',
  
  // ADV (Advance) Series
  'adv1': 'Expansion Pack',
  'adv2': 'Desert Miracle',
  'adv3': 'Sky-Splitting Deoxys',
  'adv4': 'Magma vs Aqua Dual Ambition',
  'adv5': 'Unsealed Chamber',
  
  // PCG Series
  'pcg1': 'Legend Maker',
  'pcg2': 'Offense and Defense of the Sky Ridge',
  'pcg3': 'Rocket Gang Strikes Back',
  'pcg4': 'Golden Sky, Silvery Ocean',
  'pcg5': 'Mirage Forest',
  'pcg6': 'Holon Research Tower',
  'pcg7': 'Holon Phantom',
  'pcg8': 'Miracle Crystal',
  'pcg9': 'Offense and Defense of the Furthest Ends',
  'pcg10': 'World Champions Pack',
  
  // Legend Series (L)
  'l1a': 'HeartGold Collection',
  'l1b': 'SoulSilver Collection',
  'l2': 'Reviving Legends',
  'll': 'Lost Link',
  'l3': 'Clash at the Summit',
  
  // Scarlet & Violet
  'sv1s': 'Scarlet ex',
  'sv1v': 'Violet ex',
  'sv1a': 'Triplet Beat',
  'sv2p': 'Snow Hazard',
  'sv2d': 'Clay Burst',
  'sv2a': 'Pokemon Card 151',
  'sv3': 'Ruler of the Black Flame',
  'sv3a': 'Raging Surf',
  'sv4k': 'Ancient Roar',
  'sv4m': 'Future Flash',
  'sv4a': 'Shiny Treasure ex',
  'sv5k': 'Wild Force',
  'sv5m': 'Cyber Judge',
  'sv5a': 'Crimson Haze',
  'sv6': 'Mask of Change',
  'sv6a': 'Night Wanderer',
  'sv7': 'Stellar Miracle',
  'sv7a': 'Paradise Dragona',
  'sv8': 'Super Electric Breaker',
  'sv8a': 'Terastal Fest ex',
  'sv9': 'Battle Partners',
  'sv9a': 'Heat Wave Arena',
  'sv10': 'Glory of the Rocket Gang',
  'sv10a': 'Rocket\'s Glory (Special)',
  'svln': 'Starter Set Tera Stellar Sylveon ex',
  'svls': 'Starter Set Tera Stellar Ceruledge ex',
  'svk': 'Deck Build Box Stellar Miracle',
  
  // Sword & Shield
  's1w': 'Sword',
  's1h': 'Shield',
  's1a': 'VMAX Rising',
  's2': 'Rebellion Crash',
  's2a': 'Explosive Walker',
  's3': 'Infinity Zone',
  's3a': 'Legendary Heartbeat',
  's4': 'Astonishing Volt Tackle',
  's4a': 'Shiny Star V',
  's5i': 'Single Strike Master',
  's5r': 'Rapid Strike Master',
  's5a': 'Twin Fighters',
  's6h': 'Silver Lance',
  's6k': 'Jet-Black Spirit',
  's6a': 'Eevee Heroes',
  's7r': 'Blue Sky Stream',
  's7d': 'Skyscraping Perfect',
  's8': 'Fusion Arts',
  's8a': '25th Anniversary Collection',
  's8b': 'VMAX Climax',
  's9': 'Star Birth',
  's9a': 'Battle Region',
  's10p': 'Space Juggler',
  's10d': 'Time Gazer',
  's10a': 'Dark Phantasma',
  's10b': 'Pokemon GO',
  's11': 'Lost Abyss',
  's11a': 'Incandescent Arcana',
  's12': 'Paradigm Trigger',
  's12a': 'VSTAR Universe',
  
  // Sun & Moon
  'sm0': 'Pikachu and New Friends',
  'sm1s': 'Collection Sun',
  'sm1m': 'Collection Moon', 
  'sm1+': 'Sun & Moon Strengthening',
  'sm2k': 'Islands Await You',
  'sm2l': 'Alolan Moonlight',
  'sm2+': 'New Challengers',
  'sm3n': 'Darkness that Consumes Light',
  'sm3h': 'To Have Seen the Battle Rainbow',
  'sm3+': 'Shining Legends',
  'sm4a': 'Ultradimensional Beasts',
  'sm4s': 'Awakening Hero',
  'sm4+': 'GX Battle Boost',
  'sm5s': 'Ultra Sun',
  'sm5m': 'Ultra Moon',
  'sm5+': 'Ultra Force',
  'sm6': 'Forbidden Light',
  'sm6a': 'Dragon Storm',
  'sm6b': 'Champion Road',
  'sm7': 'Sky-Splitting Charisma',
  'sm7a': 'Thunderclap Spark',
  'sm7b': 'Fairy Rise',
  'sm8': 'Super-Burst Impact',
  'sm8a': 'Dark Order',
  'sm8b': 'GX Ultra Shiny',
  'sm9': 'Tag Bolt',
  'sm9a': 'Night Unison',
  'sm9b': 'Full Metal Wall',
  'sm10': 'Double Blaze',
  'sm10a': 'GG End',
  'sm10b': 'Sky Legend',
  'sm11': 'Miracle Twin',
  'sm11a': 'Remix Bout',
  'sm11b': 'Dream League',
  'sm12': 'Alter Genesis',
  'sm12a': 'TAG TEAM GX All Stars',
  'smp2': 'Detective Pikachu',
  
  // XY Series
  'xy1a': 'Collection X',
  'xy1b': 'Collection Y',
  'xy2': 'Wild Blaze',
  'xy3': 'Rising Fist',
  'xy4': 'Phantom Gate',
  'xy5a': 'Gaia Volcano',
  'xy5b': 'Tidal Storm',
  'xy6': 'Emerald Break',
  'xy7': 'Bandit Ring',
  'xy8a': 'Blue Shock',
  'xy8b': 'Red Flash',
  'xy9': 'Rage of the Broken Sky',
  'xy10': 'Awakening Psychic King',
  'xy11a': 'Explosive Fighter',
  'xy11b': 'Cruel Traitor',
  'xy12': 'Evolutions (20th Anniversary)',
  
  // Special/Promo sets
  'cp1': 'Magma vs Aqua Double Crisis',
  'cp2': 'Legendary Shine Collection',
  'cp3': 'Pokekyun Collection',
  'cp4': 'Premium Champion Pack',
  'cp5': 'Mythical & Legendary Dream Shine',
  'cp6': '20th Anniversary',
  
  // Classic sets
  'neo1': 'Gold, Silver, New World',
  'neo2': 'Crossing the Ruins',
  'neo3': 'Awakening Legends',
  'neo4': 'Darkness, and to Light',
  'e1': 'Base Expansion Pack',
  'e2': 'The Town on No Map',
  'e3': 'Wind from the Sea',
  'e4': 'Split Earth',
  'e5': 'Mysterious Mountains',
  
  // Más recientes
  'svp': 'Scarlet & Violet Promo',
  'swshp': 'Sword & Shield Promo',
  'smp': 'Sun & Moon Promo',
  
  // Black & White Series
  'bw1': 'Black Collection/White Collection',
  'bw2': 'Red Collection',
  'bw3': 'Psycho Drive/Hail Blizzard',
  'bw4': 'Dark Rush',
  'bw5': 'Dragon Blast/Dragon Blade',
  'bw6': 'Freeze Bolt/Cold Flare',
  'bw7': 'Plasma Gale',
  'bw8': 'Spiral Force/Thunder Knuckle',
  'bw9': 'Megalo Cannon',
  
  // Additional XY sets
  'cp1': 'Magma vs Aqua Double Crisis',
  'cp2': 'Legendary Shine Collection',
  'cp3': 'Pokekyun Collection',
  'cp4': 'Premium Champion Pack',
  'cp5': 'Mythical & Legendary Dream Shine',
  'cp6': '20th Anniversary',
  
  // Scarlet & Violet (adicionales)
  'sv3': 'Ruler of the Black Flame',
  'sv3a': 'Raging Surf',
  'sv4': 'Ancient Roar & Future Flash',
  'sv4a': 'Shiny Treasure ex',
  'sv4k': 'Ancient Roar',
  'sv4m': 'Future Flash',
  'sv5': 'Wild Force & Cyber Judge',
  'sv5a': 'Crimson Haze',
  'sv5k': 'Wild Force',
  'sv5m': 'Cyber Judge',
  'sv6': 'Transformation Mask',
  'sv6a': 'Night Wanderer',
  'sv7': 'Stellar Crown',
  'sv7a': 'Paradise Dragona',
  'sv8': 'Supercharged Breaker',
  'sv8a': 'Terastal Festival ex',
  'sv9': 'Cyber Phantasm',
  'sv9a': 'Heat Wave Arena',
  
  // Promocionales y especiales
  'promo': 'Promo',
  'svp': 'Scarlet & Violet Promo',
  'swshp': 'Sword & Shield Promo',
  'smp': 'Sun & Moon Promo',
  'xyp': 'XY Promo',
  'bwp': 'Black & White Promo',
  'dp-p': 'Diamond & Pearl Promo',
  'adv-p': 'ADV Promo',
  'pcg-p': 'PCG Promo',
  
  // Special sets
  'si': 'Southern Islands',
  'w': 'Wizards Promo',
  'pop': 'POP Series',
  'np': 'Nintendo Promo',
  
  // Gym sets
  'gym1': 'Gym Heroes',
  'gym2': 'Gym Challenge',
  'vs': 'VS Series',
  
  // e-Card adicionales
  'ecard1': 'Base e-Card',
  'ecard2': 'Expedition',
  'ecard3': 'Aquapolis',
  'ecard4': 'Skyridge',
  'ecard5': 'Mysterious Mountains',
  
  // Platinum adicionales
  'dpt1': 'Galactic Conquest',
  'dpt2': 'Bonds to the End of Time',
  'dpt3': 'Pulse of the Frontier',
  'dpt4': 'Advent of Arceus',
  'dpt-p': 'DPt-P Promotional cards',
  
  // HGSS adicionales
  'hgss1': 'HeartGold Collection',
  'hgss2': 'SoulSilver Collection',
  'hgss3': 'Clash at the Summit',
  'hgss4': 'Triumphant',
  'l1': 'Legend HeartGold',
  'l2': 'Legend SoulSilver',
  'l3': 'Legend Clash at the Summit',
  
  // BW adicionales
  'bw10': 'Plasma Blast',
  'bw11': 'Legendary Treasures',
  'bw-p': 'BW-P Promotional cards',
  
  // XY adicionales
  'xy10': 'Fates Collide',
  'xy11': 'Steam Siege',
  'xy12': 'Evolutions',
  'xy-p': 'XY-P Promotional cards',
  
  // SM adicionales
  'sm8': 'Lost Thunder',
  'sm9': 'Team Up',
  'sm10': 'Unbroken Bonds',
  'sm11': 'Unified Minds',
  'sm12': 'Cosmic Eclipse',
  'sm-p': 'SM-P Promotional cards',
  
  // SWSH adicionales
  's10': 'Space Juggler',
  's10a': 'Dark Phantasma',
  's10b': 'Pokemon GO',
  's10p': 'Mysterious Box',
  's11': 'Lost Abyss',
  's11a': 'Incandescent Arcana',
  's12': 'Paradigm Trigger',
  's12a': 'VSTAR Universe',
  
  // Sets adicionales SWSH que faltaban
  'swsh1': 'Sword & Shield',
  'swsh2': 'Rebel Clash',
  'swsh3': 'Darkness Ablaze',
  'swsh4': 'Vivid Voltage',
  'swsh5': 'Battle Styles',
  'swsh6': 'Chilling Reign',
  'swsh7': 'Evolving Skies',
  'swsh8': 'Fusion Strike',
  'swsh9': 'Brilliant Stars',
  'swsh10': 'Astral Radiance',
  'swsh11': 'Lost Origin',
  'swsh12': 'Silver Tempest',
  'swsh12pt5': 'Crown Zenith',
  
  // BW adicionales que faltaban
  'bw1': 'Black & White',
  'bw2': 'Emerging Powers',
  'bw3': 'Noble Victories',
  'bw4': 'Next Destinies',
  'bw5': 'Dark Explorers',
  'bw6': 'Dragons Exalted',
  'bw7': 'Boundaries Crossed',
  'bw8': 'Plasma Storm',
  'bw9': 'Plasma Freeze',
  
  // DP adicionales
  'dp1': 'Diamond & Pearl',
  'dp2': 'Mysterious Treasures',
  'dp3': 'Secret Wonders',
  'dp4': 'Great Encounters',
  'dp5': 'Majestic Dawn',
  'dp6': 'Legends Awakened',
  'dp7': 'Stormfront',
  
  // Sets antiguos adicionales
  'basep': 'Wizards Black Star Promos',
  'pop1': 'POP Series 1',
  'pop2': 'POP Series 2',
  'pop3': 'POP Series 3',
  'pop4': 'POP Series 4',
  'pop5': 'POP Series 5',
  'pop6': 'POP Series 6',
  'pop7': 'POP Series 7',
  'pop8': 'POP Series 8',
  'pop9': 'POP Series 9',
  
  // McDonald's Collections
  'mcd11': 'McDonald\'s Collection 2011',
  'mcd12': 'McDonald\'s Collection 2012',
  'mcd14': 'McDonald\'s Collection 2014',
  'mcd15': 'McDonald\'s Collection 2015',
  'mcd16': 'McDonald\'s Collection 2016',
  'mcd17': 'McDonald\'s Collection 2017',
  'mcd18': 'McDonald\'s Collection 2018',
  'mcd19': 'McDonald\'s Collection 2019',
  'mcd21': 'McDonald\'s 25th Anniversary',
  'mcd22': 'McDonald\'s Match Battle 2022',
  
  // Detective Pikachu
  'det1': 'Detective Pikachu',
  
  // Dragon Vault
  'dv1': 'Dragon Vault',
  
  // Futsal Collection
  'fut20': 'Futsal Collection 2020',
  
  // Radiant Collection
  'rc1': 'Radiant Collection',
  
  // Southern Islands
  'si1': 'Southern Islands',
  
  // Mini sets y especiales
  'sma': 'Shining Legends',
  'xyp': 'XY Black Star Promos',
  'smp': 'Sun & Moon Black Star Promos',
  'swshp': 'Sword & Shield Black Star Promos',
  's10b': 'Time Gazer',
  's10p': 'Space Juggler',
  's10d': 'Time Gazer',
  's11': 'Lost Abyss',
  's11a': 'Incandescent Arcana',
  's12': 'Paradigm Trigger',
  's12a': 'VSTAR Universe',
  's-p': 'Sword & Shield Promotional cards',
  
  // Starter sets
  'sta': 'Starter Set V',
  'stb': 'Starter Set VMAX',
  'stc': 'Starter Set VSTAR',
  'std': 'Starter Deck & Build Sets',
  
  // Battle Decks
  'sva': 'Battle Academy',
  'svb': 'Battle Master Decks',
  'svc': 'Challenger Decks',
  'svd': 'League Battle Decks',
  
  // Sets faltantes encontrados
  'sn10a': 'GG End',
  'sn11': 'Miracle Twin',
  
  // Series names
  'sv': 'Scarlet & Violet',
  'swsh': 'Sword & Shield',
  'sm': 'Sun & Moon',
  'xy': 'XY',
  'bw': 'Black & White',
  'hgss': 'HeartGold SoulSilver',
  'dp': 'Diamond & Pearl',
  'plt': 'Platinum',
  'ex': 'EX Series',
  'adv': 'ADV Series',
  'pcg': 'PCG Series'
};

// Función para obtener traducción de un set
function getSetTranslation(setId) {
  const id = setId?.toLowerCase();
  return setTranslations[id] || null;
}

// Función para formatear nombre de set con traducción
function formatSetName(setName, setId) {
  const translation = getSetTranslation(setId);
  if (translation && setName !== translation) {
    return `${setName} (${translation})`;
  }
  return setName;
}

// Exportar para uso en Node.js
module.exports = {
  setTranslations,
  getSetTranslation,
  formatSetName
};