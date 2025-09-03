// Traducciones de sets chinos a inglés (Simplificado y Tradicional)
const setTranslationsZH = {
  // Sun & Moon Series (Chino)
  'SM-SC': 'Sun Collection',
  'SM-MC': 'Moon Collection',
  'SM1': 'Sun & Moon Base',
  'SM2': 'Guardians Rising',
  'SM3': 'Burning Shadows',
  'SM4': 'Crimson Invasion',
  'SM5': 'Ultra Prism',
  'SM6': 'Forbidden Light',
  'SM7': 'Celestial Storm',
  'SM8': 'Lost Thunder',
  'SM9': 'Team Up',
  'SM10': 'Unbroken Bonds',
  'SM11': 'Unified Minds',
  'SM12': 'Cosmic Eclipse',
  
  // Sword & Shield Series (Chino)
  'SWSH1': 'Sword & Shield Base',
  'SWSH2': 'Rebel Clash',
  'SWSH3': 'Darkness Ablaze',
  'SWSH4': 'Vivid Voltage',
  'SWSH5': 'Battle Styles',
  'SWSH6': 'Chilling Reign',
  'SWSH7': 'Evolving Skies',
  'SWSH8': 'Fusion Strike',
  'SWSH9': 'Brilliant Stars',
  'SWSH10': 'Astral Radiance',
  'SWSH11': 'Lost Origin',
  'SWSH12': 'Silver Tempest',
  'SWSH-V': 'V Starter Decks',
  'SWSH-VMAX': 'VMAX Special Set',
  
  // Scarlet & Violet Series (Chino)
  'SV1': 'Scarlet & Violet Base',
  'SV2': 'Paldea Evolved',
  'SV3': 'Obsidian Flames',
  'SV4': 'Paradox Rift',
  'SV5': 'Temporal Forces',
  'SV6': 'Twilight Masquerade',
  'SV-151': 'Pokémon Card 151',
  
  // Special Chinese Sets
  'CS1a': 'Legendary Starter Set',
  'CS1b': 'Amazing Volt Tackle',
  'CS2a': 'Explosive Walker',
  'CS2b': 'Legendary Heartbeat',
  'CS3a': 'Dragon King',
  'CS3b': 'Phoenix King',
  'CS4a': 'Sword & Shield Enhanced',
  'CS5a': 'Battle Academy',
  'CS6a': 'Trainer Toolkit',
  
  // Hong Kong/Taiwan Exclusive
  'AS1a': 'Beginning Set',
  'AS1b': 'Adventure Set',
  'AS2a': 'Dragon Storm',
  'AS2b': 'Champion Path',
  'AS3a': 'Legendary Collection',
  'AS3b': 'Master Collection',
  'AS4a': 'Battle Arena',
  'AS4b': 'Tournament Collection',
  'AS5a': 'Elite Trainer',
  'AS5b': 'Gym Heroes',
  'AS6a': 'Tag Team Powers',
  'AS6b': 'GX Ultra Shiny',
  'AS7a': 'High Class Pack',
  'AS7b': 'Anniversary Box',
  'AS8a': 'Shiny Star',
  'AS8b': 'Amazing Rare',
  
  // Black & White Chinese
  'BW-CN1': 'Black & White Base',
  'BW-CN2': 'Emerging Powers',
  'BW-CN3': 'Noble Victories',
  'BW-CN4': 'Next Destinies',
  'BW-CN5': 'Dark Explorers',
  'BW-CN6': 'Dragons Exalted',
  
  // XY Chinese
  'XY-CN1': 'XY Base',
  'XY-CN2': 'Flashfire',
  'XY-CN3': 'Furious Fists',
  'XY-CN4': 'Phantom Forces',
  'XY-CN5': 'Primal Clash',
  'XY-CN6': 'Roaring Skies',
  'XY-CN7': 'Ancient Origins',
  'XY-CN8': 'BREAKthrough',
  'XY-CN9': 'BREAKpoint',
  'XY-CN10': 'Fates Collide',
  'XY-CN11': 'Steam Siege',
  'XY-CN12': 'Evolutions',
  
  // Promotional
  'promo-cn': 'Chinese Promo Cards',
  'promo-tw': 'Taiwan Promo Cards',
  'promo-hk': 'Hong Kong Promo Cards',
  'svp-cn': 'Scarlet & Violet Chinese Promo',
  'swshp-cn': 'Sword & Shield Chinese Promo',
  'smp-cn': 'Sun & Moon Chinese Promo',
  'xyp-cn': 'XY Chinese Promo',
  'bwp-cn': 'Black & White Chinese Promo',
  
  // Tournament and Special
  'tour-cn': 'Tournament Pack',
  'gym-cn': 'Gym Challenge',
  'league-cn': 'League Battle Deck',
  'trainer-cn': 'Trainer Kit',
  'starter-cn': 'Starter Set',
  'theme-cn': 'Theme Deck'
};

// Función para obtener traducción de un set chino
function getSetTranslationZH(setId) {
  const id = setId?.toUpperCase();
  // Intentar con mayúsculas primero
  if (setTranslationsZH[id]) {
    return setTranslationsZH[id];
  }
  // Intentar con el ID original
  return setTranslationsZH[setId] || null;
}

// Función para formatear nombre de set con traducción
function formatSetNameZH(setName, setId) {
  const translation = getSetTranslationZH(setId);
  if (translation && setName !== translation) {
    return `${setName} (${translation})`;
  }
  return setName;
}

// Exportar para uso en Node.js
module.exports = {
  setTranslationsZH,
  getSetTranslationZH,
  formatSetNameZH
};