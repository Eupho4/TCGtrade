// Traducciones de sets coreanos a inglés
const setTranslationsKO = {
  // Sun & Moon Series
  'SM1S': 'Sun Collection',
  'SM1M': 'Moon Collection',
  'SM1+': 'Sun & Moon',
  'SM2K': 'Alola Moonlight',
  'SM2L': 'Alola Sunshine',
  'SM3N': 'Darkness That Consumes Light',
  'SM3H': 'To Have Seen the Battle Rainbow',
  'SM3+': 'Shining Legends',
  'SM4A': 'Crimson Invasion',
  'SM4S': 'Awakened Heroes',
  'SM4+': 'GX Battle Boost',
  'SM5S': 'Ultra Sun',
  'SM5M': 'Ultra Moon',
  'SM5+': 'Ultra Force',
  'SM6': 'Forbidden Light',
  'SM6a': 'Dragon Storm',
  'SM6b': 'Champion Road',
  'SM7': 'Sky-Splitting Charisma',
  'SM7a': 'Plasma Gale',
  'SM7b': 'Fairy Rise',
  'SM8': 'Burst Impact',
  'SM8a': 'Dark Order',
  'SM8b': 'GX Ultra Shiny',
  'SM9': 'Tag Bolt',
  'SM9a': 'Night Unison',
  'SM9b': 'Full Metal Wall',
  'SM10': 'Double Blaze',
  'SM10a': 'GG End',
  'SM10b': 'Sky Legend',
  'SM11': 'Miracle Twin',
  'SM11a': 'Remix Bout',
  'SM11b': 'Dream League',
  'SM12': 'Alter Genesis',
  'SM12a': 'TAG TEAM GX All Stars',
  'SMP2': 'Detective Pikachu',
  
  // Sword & Shield Series
  'S1W': 'Sword',
  'S1H': 'Shield',
  'S1a': 'VMAX Rising',
  'S2': 'Rebel Clash',
  'S2a': 'Explosive Walker',
  'S3': 'Infinity Zone',
  'S3a': 'Legendary Heartbeat',
  'S4': 'Astonishing Volt Tackle',
  'S4a': 'Shiny Star V',
  'S5I': 'Single Strike Master',
  'S5R': 'Rapid Strike Master',
  'S5a': 'Matchless Fighters',
  'S6H': 'Silver Lance',
  'S6K': 'Jet-Black Spirit',
  'S6a': 'Eevee Heroes',
  'S7D': 'Perfect Sky',
  'S7R': 'Blue Sky Stream',
  'S8': 'Fusion Arts',
  'S8a': '25th Anniversary Collection',
  'S8b': 'VMAX Climax',
  'S9': 'Star Birth',
  'S9a': 'Battle Region',
  'S10D': 'Time Gazer',
  'S10P': 'Space Juggler',
  'S10a': 'Dark Phantasma',
  'S10b': 'Pokémon GO',
  'S11': 'Lost Abyss',
  'S11a': 'Incandescent Arcana',
  'S12': 'Paradigm Trigger',
  'S12a': 'VSTAR Universe',
  
  // Scarlet & Violet Series
  'SV1S': 'Scarlet ex',
  'SV1V': 'Violet ex',
  'SV1a': 'Triplet Beat',
  'SV2D': 'Clay Burst',
  'SV2P': 'Snow Hazard',
  'SV2a': 'Pokémon Card 151',
  'SV3': 'Ruler of the Black Flame',
  'SV3a': 'Raging Surf',
  'SV4K': 'Ancient Roar',
  'SV4M': 'Future Flash',
  'SV4a': 'Shiny Treasure ex',
  'SV5K': 'Wild Force',
  'SV5M': 'Cyber Judge',
  'SV5a': 'Crimson Haze',
  'SV6': 'Transformation Mask',
  'SV6a': 'Night Wanderer',
  
  // Black & White Series
  'BW1': 'Black Collection',
  'BW2': 'White Collection',
  'BW3': 'Red Collection',
  'BW4': 'Psycho Drive',
  'BW5': 'Hail Blizzard',
  'BW6': 'Dark Rush',
  'BW7': 'Dragon Selection',
  'BW8': 'Dragon Blast',
  'BW9': 'Dragon Blade',
  'BW10': 'Plasma Gale',
  'BW11': 'Plasma Blast',
  
  // XY Series
  'XY1': 'Collection X',
  'XY2': 'Collection Y',
  'XY3': 'Wild Blaze',
  'XY4': 'Phantom Gate',
  'XY5': 'Gaia Volcano',
  'XY6': 'Tidal Storm',
  'XY7': 'Emerald Break',
  'XY8': 'Bandit Ring',
  'XY9': 'Blue Impact',
  'XY10': 'Red Flash',
  'XY11': 'Rage of the Broken Sky',
  'XY12': 'Awakening Psychic King',
  'XY13': 'Cruel Traitor',
  'XY14': 'Explosive Fighter',
  'XY15': 'Evolutions',
  
  // Promotional
  'promo': 'Promo Cards',
  'svp': 'Scarlet & Violet Promo',
  'swshp': 'Sword & Shield Promo',
  'smp': 'Sun & Moon Promo',
  'xyp': 'XY Promo',
  'bwp': 'Black & White Promo'
};

// Función para obtener traducción de un set coreano
function getSetTranslationKO(setId) {
  // Primero intentar con el ID tal cual
  if (setTranslationsKO[setId]) {
    return setTranslationsKO[setId];
  }
  
  // Luego intentar en minúsculas
  const idLower = setId?.toLowerCase();
  for (const key in setTranslationsKO) {
    if (key.toLowerCase() === idLower) {
      return setTranslationsKO[key];
    }
  }
  
  // Luego intentar en mayúsculas
  const idUpper = setId?.toUpperCase();
  if (setTranslationsKO[idUpper]) {
    return setTranslationsKO[idUpper];
  }
  
  return null;
}

// Función para formatear nombre de set con traducción
function formatSetNameKO(setName, setId) {
  const translation = getSetTranslationKO(setId);
  if (translation && setName !== translation) {
    return `${setName} (${translation})`;
  }
  return setName;
}

// Exportar para uso en Node.js
module.exports = {
  setTranslationsKO,
  getSetTranslationKO,
  formatSetNameKO
};