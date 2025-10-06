// Parche final para precios estimados en TCGtrade

// 1. Agregar estas funciones después de formatPrice:

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

// 2. En renderCardsFromData, agregar después de safeImageUrl:
// const bestPrice = getBestPrice(card);

// 3. Reemplazar el info.innerHTML con:
/*
const info = document.createElement('div');
info.className = 'flex-1 min-w-0 pl-16';

// Crear sección de precio
let priceSection = '';
if (bestPrice && bestPrice.price) {
    const priceColor = bestPrice.price >= 50 ? 'text-red-600 font-bold' : 
                     bestPrice.price >= 20 ? 'text-orange-600 font-semibold' : 
                     bestPrice.price >= 5 ? 'text-yellow-600' : 'text-green-600';
    
    priceSection = `
        <div class="flex flex-col items-end text-right">
            <div class="text-xs text-gray-500 mb-1">${bestPrice.source}</div>
            <div class="text-sm font-semibold ${priceColor}">
                ${formatPrice(bestPrice.price)}
            </div>
            <div class="text-xs text-gray-400">${bestPrice.condition}</div>
        </div>
    `;
} else {
    priceSection = `
        <div class="flex items-center gap-2">
            <div class="text-xs text-gray-400">💰 Precio no disponible</div>
        </div>
    `;
}

info.innerHTML = `
    <div class="flex items-center justify-between">
        <div class="truncate flex-1">
            <div class="font-semibold text-gray-900 dark:text-white truncate">${card.name || 'Nombre no disponible'}</div>
            <div class="text-xs text-gray-600 dark:text-gray-300 truncate">Set: ${card.set?.name || 'N/A'} · Serie: ${card.set?.series || 'N/A'} · Nº: ${card.number || 'N/A'}</div>
        </div>
        <div class="flex gap-3 items-center">
            ${priceSection}
            <div class="flex gap-2">
                <button class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
                    onclick="showCardDetailsOnly('${safeCardId}', '${safeCardName}', '${safeImageUrl}', '${safeSetName}', '${safeSeries}', '${safeNumber}')">Ver Detalles</button>
                <button class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs"
                    onclick="addCardDirectly('${safeCardId}', '${safeCardName}', '${safeImageUrl}', '${safeSetName}', '${safeSeries}', '${safeNumber}')">+ Añadir</button>
            </div>
        </div>
    </div>
`;
*/