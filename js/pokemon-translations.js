// Traducciones de nombres de Pokémon para búsquedas en idiomas asiáticos
export const pokemonTranslations = {
  // Formato: nombreEnIngles: { ja: japonés, ko: coreano, zh: chino }
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
};

// Función para obtener todas las variantes de un nombre
export function getPokemonNameVariants(name) {
  const lowerName = name.toLowerCase().trim();
  const variants = [name];
  
  if (pokemonTranslations[lowerName]) {
    const translations = pokemonTranslations[lowerName];
    if (translations.ja) variants.push(translations.ja);
    if (translations.ko) variants.push(translations.ko);
    if (translations.zh) variants.push(translations.zh);
  }
  
  return variants;
}

// Función para detectar si un texto contiene caracteres asiáticos
export function containsAsianCharacters(text) {
  // Rangos Unicode para japonés, coreano y chino
  const asianRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\uAC00-\uD7AF]/;
  return asianRegex.test(text);
}