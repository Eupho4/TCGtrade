// Traducciones de nombres de Pokémon para búsquedas en idiomas asiáticos
// Importar todas las traducciones existentes
import { pokemonNameTranslations } from './pokemon-name-translations.js';
import { pokemonNameTranslationsKO } from './pokemon-name-translations-ko.js';
import { pokemonNameTranslationsZH } from './pokemon-name-translations-zh.js';

// Crear un diccionario consolidado de traducciones
export const pokemonTranslations = {};

// Construir el diccionario a partir de los archivos existentes
for (const [ja, en] of Object.entries(pokemonNameTranslations)) {
  const key = en.toLowerCase();
  if (!pokemonTranslations[key]) {
    pokemonTranslations[key] = {};
  }
  pokemonTranslations[key].ja = ja;
}

// Agregar traducciones coreanas
for (const [ko, en] of Object.entries(pokemonNameTranslationsKO)) {
  const key = en.toLowerCase();
  if (!pokemonTranslations[key]) {
    pokemonTranslations[key] = {};
  }
  pokemonTranslations[key].ko = ko;
}

// Agregar traducciones chinas
for (const [zh, en] of Object.entries(pokemonNameTranslationsZH)) {
  const key = en.toLowerCase();
  if (!pokemonTranslations[key]) {
    pokemonTranslations[key] = {};
  }
  pokemonTranslations[key].zh = zh;
}

// Agregar manualmente algunos que podrían faltar
Object.assign(pokemonTranslations, {
  'pikachu': {
    ja: 'ピカチュウ',
    ko: '피카츄',
    zh: '皮卡丘'
  },
  'charizard': {
    ja: 'リザードン',
    ko: '리자몽',
    zh: '喷火龙'
  },
  'mewtwo': {
    ja: 'ミュウツー',
    ko: '뮤츠',
    zh: '超梦'
  },
  'eevee': {
    ja: 'イーブイ',
    ko: '이브이',
    zh: '伊布'
  },
  'snorlax': {
    ja: 'カビゴン',
    ko: '잠만보',
    zh: '卡比兽'
  },
  'dragonite': {
    ja: 'カイリュー',
    ko: '망나뇽',
    zh: '快龙'
  },
  'gengar': {
    ja: 'ゲンガー',
    ko: '팬텀',
    zh: '耿鬼'
  },
  'blastoise': {
    ja: 'カメックス',
    ko: '거북왕',
    zh: '水箭龟'
  },
  'venusaur': {
    ja: 'フシギバナ',
    ko: '이상해꽃',
    zh: '妙蛙花'
  },
  'rayquaza': {
    ja: 'レックウザ',
    ko: '레쿠쟈',
    zh: '烈空坐'
  },
  'lugia': {
    ja: 'ルギア',
    ko: '루기아',
    zh: '洛奇亚'
  },
  'umbreon': {
    ja: 'ブラッキー',
    ko: '블래키',
    zh: '月亮伊布'
  },
  'sylveon': {
    ja: 'ニンフィア',
    ko: '님피아',
    zh: '仙子伊布'
  },
  'garchomp': {
    ja: 'ガブリアス',
    ko: '한카리아스',
    zh: '烈咬陆鲨'
  },
  'lucario': {
    ja: 'ルカリオ',
    ko: '루카리오',
    zh: '路卡利欧'
  },
  'arceus': {
    ja: 'アルセウス',
    ko: '아르세우스',
    zh: '阿尔宙斯'
  },
  'mew': {
    ja: 'ミュウ',
    ko: '뮤',
    zh: '梦幻'
  },
  'gyarados': {
    ja: 'ギャラドス',
    ko: '갸라도스',
    zh: '暴鲤龙'
  },
  'alakazam': {
    ja: 'フーディン',
    ko: '후딘',
    zh: '胡地'
  },
  'machamp': {
    ja: 'カイリキー',
    ko: '괴력몬',
    zh: '怪力'
  }
});

// Función para obtener todas las variantes de un nombre
export function getPokemonNameVariants(name) {
  const lowerName = name.toLowerCase().trim();
  const variants = [name];
  
  // Buscar en el diccionario consolidado
  if (pokemonTranslations[lowerName]) {
    const translations = pokemonTranslations[lowerName];
    if (translations.ja) variants.push(translations.ja);
    if (translations.ko) variants.push(translations.ko);
    if (translations.zh) variants.push(translations.zh);
  }
  
  // También buscar si el nombre ya está en un idioma asiático
  // y obtener las otras variantes
  for (const [enName, translations] of Object.entries(pokemonTranslations)) {
    if (translations.ja === name || translations.ko === name || translations.zh === name) {
      variants.push(enName);
      if (translations.ja && translations.ja !== name) variants.push(translations.ja);
      if (translations.ko && translations.ko !== name) variants.push(translations.ko);
      if (translations.zh && translations.zh !== name) variants.push(translations.zh);
      break;
    }
  }
  
  // Eliminar duplicados
  return [...new Set(variants)];
}

// Función para detectar si un texto contiene caracteres asiáticos
export function containsAsianCharacters(text) {
  // Rangos Unicode para japonés, coreano y chino
  const asianRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\uAC00-\uD7AF]/;
  return asianRegex.test(text);
}

// Función para obtener el nombre en inglés de un nombre asiático
export function getEnglishName(asianName) {
  for (const [enName, translations] of Object.entries(pokemonTranslations)) {
    if (translations.ja === asianName || 
        translations.ko === asianName || 
        translations.zh === asianName) {
      return enName;
    }
  }
  return null;
}