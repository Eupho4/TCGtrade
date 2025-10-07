/**
 * Constantes para condiciones de cartas (CardMarket)
 */

export const CARD_CONDITIONS = {
    MINT: {
        name: 'Mint',
        value: 'mint',
        description: 'Perfecta, sin defectos visibles',
        multiplier: 1.0
    },
    NEAR_MINT: {
        name: 'Near Mint',
        value: 'near_mint',
        description: 'Casi perfecta, defectos mínimos',
        multiplier: 0.9
    },
    EXCELLENT: {
        name: 'Excellent',
        value: 'excellent',
        description: 'Muy buena, defectos menores',
        multiplier: 0.8
    },
    GOOD: {
        name: 'Good',
        value: 'good',
        description: 'Buena, algunos defectos visibles',
        multiplier: 0.7
    },
    LIGHT_PLAYED: {
        name: 'Light Played',
        value: 'light_played',
        description: 'Jugada, desgaste ligero',
        multiplier: 0.6
    },
    PLAYED: {
        name: 'Played',
        value: 'played',
        description: 'Jugada, desgaste moderado',
        multiplier: 0.5
    },
    POOR: {
        name: 'Poor',
        value: 'poor',
        description: 'Muy jugada, desgaste severo',
        multiplier: 0.3
    }
};

export const CARD_LANGUAGES = [
    'Español',
    'Inglés',
    'Japonés',
    'Francés',
    'Alemán',
    'Italiano',
    'Portugués',
    'Coreano',
    'Chino'
];

export const CARD_RARITIES = [
    'Common',
    'Uncommon',
    'Rare',
    'Rare Holo',
    'Rare Ultra',
    'Rare Secret',
    'Rare Rainbow',
    'Rare Shiny',
    'Rare Shiny GX',
    'Rare Shiny V',
    'Rare Shiny VMAX'
];