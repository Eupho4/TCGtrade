// Funciones de precios estimados para TCGtrade

// Función para formatear precios
function formatPrice(price) {
    return price ? `$${parseFloat(price).toFixed(2)}` : 'N/A';
}

// Función para generar precios estimados
function generateEstimatedPrice(card) {
    const rarity = card.rarity || 'Common';
    const rarityPrices = {
        'Common': { min: 0.10, max: 0.50 },
        'Uncommon': { min: 0.25, max: 1.00 },
        'Rare': { min: 0.50, max: 3.00 },
        'Rare Holo': { min: 1.00, max: 8.00 },
        'Rare Ultra': { min: 2.00, max: 15.00 },
        'Rare Secret': { min: 5.00, max: 50.00 },
        'Rare Rainbow': { min: 10.00, max: 100.00 },
        'Rare Shiny': { min: 3.00, max: 25.00 },
        'Rare V': { min: 6.00, max: 45.00 },
        'Rare VMAX': { min: 12.00, max: 90.00 },
        'Rare ex': { min: 8.00, max: 60.00 },
        'Rare Tera ex': { min: 15.00, max: 120.00 }
    };
    
    const priceRange = rarityPrices[rarity] || rarityPrices['Common'];
    let basePrice = priceRange.min + Math.random() * (priceRange.max - priceRange.min);
    
    // Multiplicador por popularidad
    const popularPokemon = ['Pikachu', 'Charizard', 'Blastoise', 'Venusaur', 'Mewtwo', 'Mew'];
    const isPopular = popularPokemon.some(pokemon => card.name?.toLowerCase().includes(pokemon.toLowerCase()));
    if (isPopular) basePrice *= 1.5;
    
    // Multiplicador por cartas especiales
    const specialTypes = ['VMAX', 'Tera ex', 'VSTAR', 'GX', 'V', 'ex'];
    const isSpecial = specialTypes.some(type => card.name?.includes(type));
    if (isSpecial) basePrice *= 1.3;
    
    return Math.round(basePrice * 100) / 100;
}

// Función para obtener el mejor precio
function getBestPrice(card) {
    // Buscar precios reales primero
    const tcgplayerPrices = card.tcgplayer?.prices || {};
    if (tcgplayerPrices.normal?.market) return { price: tcgplayerPrices.normal.market, source: 'TCGPlayer', condition: 'Normal' };
    if (tcgplayerPrices.normal?.mid) return { price: tcgplayerPrices.normal.mid, source: 'TCGPlayer', condition: 'Normal' };
    
    const cardmarketPrices = card.cardmarket?.prices || {};
    if (cardmarketPrices.averageSellPrice) return { price: cardmarketPrices.averageSellPrice, source: 'Cardmarket', condition: 'Promedio' };
    
    // Si no hay precios reales, usar estimación
    return { price: generateEstimatedPrice(card), source: 'Estimado', condition: 'Promedio' };
}