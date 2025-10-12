/**
 * Constantes para condiciones de cartas (CardMarket) - Optimizadas
 */

export const CARD_CONDITIONS = {
    MINT: {
        name: 'Mint',
        value: 'mint',
        description: 'Perfecta, sin defectos visibles',
        multiplier: 1.0,
        color: '#10B981'
    },
    NEAR_MINT: {
        name: 'Near Mint',
        value: 'near_mint',
        description: 'Casi perfecta, defectos mínimos',
        multiplier: 0.9,
        color: '#34D399'
    },
    EXCELLENT: {
        name: 'Excellent',
        value: 'excellent',
        description: 'Muy buena, defectos menores',
        multiplier: 0.8,
        color: '#6EE7B7'
    },
    GOOD: {
        name: 'Good',
        value: 'good',
        description: 'Buena, algunos defectos visibles',
        multiplier: 0.7,
        color: '#FCD34D'
    },
    LIGHT_PLAYED: {
        name: 'Light Played',
        value: 'light_played',
        description: 'Jugada, desgaste ligero',
        multiplier: 0.6,
        color: '#F59E0B'
    },
    PLAYED: {
        name: 'Played',
        value: 'played',
        description: 'Jugada, desgaste moderado',
        multiplier: 0.5,
        color: '#EF4444'
    },
    POOR: {
        name: 'Poor',
        value: 'poor',
        description: 'Muy jugada, desgaste severo',
        multiplier: 0.3,
        color: '#DC2626'
    }
};

export const CARD_LANGUAGES = [
    { value: 'es', label: 'Español', flag: '🇪🇸' },
    { value: 'en', label: 'Inglés', flag: '🇺🇸' },
    { value: 'ja', label: 'Japonés', flag: '🇯🇵' },
    { value: 'fr', label: 'Francés', flag: '🇫🇷' },
    { value: 'de', label: 'Alemán', flag: '🇩🇪' },
    { value: 'it', label: 'Italiano', flag: '🇮🇹' },
    { value: 'pt', label: 'Portugués', flag: '🇵🇹' },
    { value: 'ko', label: 'Coreano', flag: '🇰🇷' },
    { value: 'zh', label: 'Chino', flag: '🇨🇳' }
];

export const CARD_RARITIES = [
    { value: 'Common', label: 'Común', color: '#6B7280' },
    { value: 'Uncommon', label: 'Poco Común', color: '#10B981' },
    { value: 'Rare', label: 'Rara', color: '#3B82F6' },
    { value: 'Rare Holo', label: 'Rara Holo', color: '#8B5CF6' },
    { value: 'Rare Ultra', label: 'Rara Ultra', color: '#F59E0B' },
    { value: 'Rare Secret', label: 'Rara Secreta', color: '#EF4444' },
    { value: 'Rare Rainbow', label: 'Rara Arcoíris', color: '#EC4899' },
    { value: 'Rare Shiny', label: 'Rara Brillante', color: '#06B6D4' },
    { value: 'Rare Shiny GX', label: 'Rara Brillante GX', color: '#84CC16' },
    { value: 'Rare Shiny V', label: 'Rara Brillante V', color: '#F97316' },
    { value: 'Rare Shiny VMAX', label: 'Rara Brillante VMAX', color: '#DC2626' }
];

// Configuración de filtros optimizada
export const FILTER_CONFIG = {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
    SORT_OPTIONS: [
        { value: 'name', label: 'Nombre A-Z' },
        { value: 'name_desc', label: 'Nombre Z-A' },
        { value: 'set', label: 'Set' },
        { value: 'rarity', label: 'Rareza' },
        { value: 'hp', label: 'HP' },
        { value: 'newest', label: 'Más Recientes' }
    ]
};