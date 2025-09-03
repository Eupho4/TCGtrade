// Traducciones manuales de sets de TCGdex
const setTranslations = {
  // Sets japoneses clásicos
  'PMCG1': 'Base Set',
  'PMCG2': 'Jungle',
  'PMCG3': 'Fossil',
  'PMCG4': 'Team Rocket',
  'PMCG5': 'Gym Heroes',
  'PMCG6': 'Gym Challenge',
  
  // Scarlet & Violet
  'sv2a': 'Pokemon Card 151',
  'sv1a': 'Triplet Beat',
  'sv3a': 'Raging Surf',
  'sv4a': 'Shiny Treasure ex',
  'sv5a': 'Crimson Haze',
  'sv6a': 'Night Wanderer',
  'sv7a': 'Paradise Dragona',
  'sv8a': 'Terastal Fest ex',
  'sv9a': 'Heat Wave Arena',
  'sv10a': 'Rocket\'s Return',
  
  // Sword & Shield
  's1a': 'VMAX Rising',
  's2a': 'Explosive Walker',
  's3a': 'Legendary Heartbeat',
  's4a': 'Shiny Star V',
  's5a': 'Twin Fighters',
  's6a': 'Eevee Heroes',
  's7a': 'Blue Sky Stream',
  's8a': '25th Anniversary Collection',
  's9a': 'Battle Region',
  's10a': 'Dark Phantasma',
  's11a': 'Incandescent Arcana',
  's12a': 'VSTAR Universe',
  
  // Sun & Moon
  'sm1+': 'Sun & Moon Strengthening',
  'sm2+': 'New Challengers',
  'sm3+': 'Shining Legends',
  'sm4+': 'GX Battle Boost',
  'sm5+': 'Ultra Force',
  'sm6a': 'Dragon Storm',
  'sm6b': 'Champion Road',
  'sm7a': 'Thunderclap Spark',
  'sm7b': 'Fairy Rise',
  'sm8a': 'Dark Order',
  'sm8b': 'GX Ultra Shiny',
  'sm9a': 'Night Unison',
  'sm9b': 'Full Metal Wall',
  'sm10a': 'GG End',
  'sm10b': 'Sky Legend',
  'sm11a': 'Remix Bout',
  'sm11b': 'Dream League',
  'sm12a': 'TAG TEAM GX All Stars',
  
  // XY Series
  'xy1a': 'Collection X',
  'xy1b': 'Collection Y',
  'xy5a': 'Gaia Volcano',
  'xy5b': 'Tidal Storm',
  'xy8a': 'Blue Shock',
  'xy8b': 'Red Flash',
  'xy11a': 'Explosive Fighter',
  'xy11b': 'Cruel Traitor',
  
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
  
  // Series names
  'sv': 'Scarlet & Violet',
  'swsh': 'Sword & Shield',
  'sm': 'Sun & Moon',
  'xy': 'XY',
  'bw': 'Black & White',
  'hgss': 'HeartGold SoulSilver',
  'dp': 'Diamond & Pearl'
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