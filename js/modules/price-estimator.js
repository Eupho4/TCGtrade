/**
 * Price Estimator Module
 * Sistema de estimación de precios para cartas Pokémon TCG
 * Como medida previa hasta obtener precios reales de APIs
 */

/**
 * Precios base por rareza (en EUR)
 * Basados en promedios de mercado de CardMarket
 */
const BASE_PRICES = {
    'Common': 0.10,
    'Uncommon': 0.25,
    'Rare': 1.50,
    'Rare Holo': 3.00,
    'Rare Ultra': 8.00,
    'Rare Rainbow': 15.00,
    'Rare Secret': 20.00,
    'Rare Holo EX': 12.00,
    'Rare Holo GX': 10.00,
    'Rare Holo V': 8.00,
    'Rare Holo VMAX': 15.00,
    'Rare Holo VSTAR': 12.00,
    'Amazing Rare': 10.00,
    'Radiant Rare': 6.00,
    'Illustration Rare': 25.00,
    'Special Illustration Rare': 40.00,
    'Hyper Rare': 35.00,
    'Promo': 2.00
};

/**
 * Multiplicadores por condición de la carta
 */
const CONDITION_MULTIPLIERS = {
    'M': 1.5,    // Mint - 50% más
    'NM': 1.0,   // Near Mint - precio base
    'EX': 0.8,   // Excellent - 20% menos
    'GD': 0.6,   // Good - 40% menos
    'LP': 0.4,   // Light Played - 60% menos
    'PL': 0.3,   // Played - 70% menos
    'PO': 0.1    // Poor - 90% menos
};

/**
 * Multiplicadores por idioma
 */
const LANGUAGE_MULTIPLIERS = {
    'Inglés': 1.2,    // Inglés - 20% más (idioma estándar internacional)
    'English': 1.2,
    'Japonés': 1.1,   // Japonés - 10% más (coleccionable)
    '日本語': 1.1,
    'Español': 1.0,   // Español - precio base
    'Francés': 0.9,   // Francés - 10% menos
    'Français': 0.9,
    'Alemán': 0.9,    // Alemán - 10% menos
    'Deutsch': 0.9,
    'Italiano': 0.9,  // Italiano - 10% menos
    'Italiano': 0.9,
    'Portugués': 0.9, // Portugués - 10% menos
    'Português': 0.9,
    'Coreano': 1.0,   // Coreano - precio base
    '한국어': 1.0,
    'Chino': 1.0,     // Chino - precio base
    '中文': 1.0,
    'Ruso': 0.8       // Ruso - 20% menos
};

/**
 * Estima el precio de una carta individual
 * @param {Object} card - Objeto de carta con propiedades: rarity, condition, language
 * @returns {Object} - Objeto con precio estimado y desglose
 */
export function estimateCardPrice(card) {
    const rarity = card.rarity || 'Common';
    const condition = card.condition || 'NM';
    const language = card.language || 'Español';
    
    // Obtener precio base por rareza
    const basePrice = BASE_PRICES[rarity] || BASE_PRICES['Common'];
    
    // Aplicar multiplicadores
    const conditionMultiplier = CONDITION_MULTIPLIERS[condition] || 1.0;
    const languageMultiplier = LANGUAGE_MULTIPLIERS[language] || 1.0;
    
    // Calcular precio final
    const estimatedPrice = basePrice * conditionMultiplier * languageMultiplier;
    
    return {
        basePrice,
        conditionMultiplier,
        languageMultiplier,
        estimatedPrice: Math.round(estimatedPrice * 100) / 100, // Redondear a 2 decimales
        currency: 'EUR',
        isEstimated: true
    };
}

/**
 * Calcula el valor total de una colección de cartas
 * @param {Array} cards - Array de cartas
 * @returns {Object} - Objeto con valor total y estadísticas
 */
export function calculateCollectionValue(cards) {
    let totalValue = 0;
    const breakdown = {
        byRarity: {},
        byCondition: {},
        byLanguage: {},
        totalCards: cards.length
    };
    
    cards.forEach(card => {
        const priceInfo = estimateCardPrice(card);
        totalValue += priceInfo.estimatedPrice;
        
        // Agrupar por rareza
        const rarity = card.rarity || 'Common';
        if (!breakdown.byRarity[rarity]) {
            breakdown.byRarity[rarity] = { count: 0, value: 0 };
        }
        breakdown.byRarity[rarity].count++;
        breakdown.byRarity[rarity].value += priceInfo.estimatedPrice;
        
        // Agrupar por condición
        const condition = card.condition || 'NM';
        if (!breakdown.byCondition[condition]) {
            breakdown.byCondition[condition] = { count: 0, value: 0 };
        }
        breakdown.byCondition[condition].count++;
        breakdown.byCondition[condition].value += priceInfo.estimatedPrice;
        
        // Agrupar por idioma
        const language = card.language || 'Español';
        if (!breakdown.byLanguage[language]) {
            breakdown.byLanguage[language] = { count: 0, value: 0 };
        }
        breakdown.byLanguage[language].count++;
        breakdown.byLanguage[language].value += priceInfo.estimatedPrice;
    });
    
    return {
        totalValue: Math.round(totalValue * 100) / 100,
        currency: 'EUR',
        breakdown,
        isEstimated: true
    };
}

/**
 * Formatea un precio para mostrar
 * @param {number} price - Precio numérico
 * @param {string} currency - Moneda (EUR, USD, etc.)
 * @returns {string} - Precio formateado
 */
export function formatPrice(price, currency = 'EUR') {
    const symbols = {
        'EUR': '€',
        'USD': '$',
        'GBP': '£',
        'JPY': '¥'
    };
    
    const symbol = symbols[currency] || currency;
    return `${symbol}${price.toFixed(2)}`;
}

/**
 * Genera precios estimados en formato TCGPlayer compatible
 * @param {Object} card - Objeto de carta
 * @returns {Object} - Objeto con estructura de precios TCGPlayer
 */
export function generateTCGPlayerPrices(card) {
    const baseEstimate = estimateCardPrice(card);
    const basePrice = baseEstimate.estimatedPrice;
    
    return {
        normal: {
            low: Math.round((basePrice * 0.8) * 100) / 100,
            mid: Math.round(basePrice * 100) / 100,
            high: Math.round((basePrice * 1.3) * 100) / 100,
            market: Math.round((basePrice * 0.95) * 100) / 100,
            directLow: null
        },
        holofoil: card.rarity?.includes('Holo') ? {
            low: Math.round((basePrice * 1.2 * 0.8) * 100) / 100,
            mid: Math.round((basePrice * 1.2) * 100) / 100,
            high: Math.round((basePrice * 1.2 * 1.3) * 100) / 100,
            market: Math.round((basePrice * 1.2 * 0.95) * 100) / 100,
            directLow: null
        } : null,
        reverseHolofoil: {
            low: Math.round((basePrice * 1.1 * 0.8) * 100) / 100,
            mid: Math.round((basePrice * 1.1) * 100) / 100,
            high: Math.round((basePrice * 1.1 * 1.3) * 100) / 100,
            market: Math.round((basePrice * 1.1 * 0.95) * 100) / 100,
            directLow: null
        },
        updatedAt: new Date().toISOString(),
        isEstimated: true
    };
}

/**
 * Genera precios estimados en formato CardMarket compatible
 * @param {Object} card - Objeto de carta
 * @returns {Object} - Objeto con estructura de precios CardMarket
 */
export function generateCardMarketPrices(card) {
    const baseEstimate = estimateCardPrice(card);
    const basePrice = baseEstimate.estimatedPrice;
    
    return {
        averageSellPrice: Math.round(basePrice * 100) / 100,
        lowPrice: Math.round((basePrice * 0.75) * 100) / 100,
        trendPrice: Math.round((basePrice * 1.05) * 100) / 100,
        germanProLow: null,
        suggestedPrice: Math.round((basePrice * 1.1) * 100) / 100,
        reverseHoloSell: Math.round((basePrice * 1.15) * 100) / 100,
        reverseHoloLow: Math.round((basePrice * 1.15 * 0.75) * 100) / 100,
        reverseHoloTrend: Math.round((basePrice * 1.15 * 1.05) * 100) / 100,
        lowPriceExPlus: Math.round((basePrice * 0.85) * 100) / 100,
        avg1: Math.round((basePrice * 0.95) * 100) / 100,
        avg7: Math.round(basePrice * 100) / 100,
        avg30: Math.round((basePrice * 1.02) * 100) / 100,
        reverseHoloAvg1: Math.round((basePrice * 1.15 * 0.95) * 100) / 100,
        reverseHoloAvg7: Math.round((basePrice * 1.15) * 100) / 100,
        reverseHoloAvg30: Math.round((basePrice * 1.15 * 1.02) * 100) / 100,
        updatedAt: new Date().toISOString(),
        isEstimated: true
    };
}

/**
 * Actualiza una carta con precios estimados
 * @param {Object} card - Objeto de carta
 * @returns {Object} - Carta con precios estimados añadidos
 */
export function addEstimatedPrices(card) {
    return {
        ...card,
        tcgplayer: {
            ...card.tcgplayer,
            prices: generateTCGPlayerPrices(card)
        },
        cardmarket: {
            ...card.cardmarket,
            prices: generateCardMarketPrices(card)
        }
    };
}

// Exportar también los datos de referencia para uso externo
export { BASE_PRICES, CONDITION_MULTIPLIERS, LANGUAGE_MULTIPLIERS };
