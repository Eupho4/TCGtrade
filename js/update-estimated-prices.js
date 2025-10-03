/**
 * Script para actualizar la base de datos con precios estimados
 * Ejecutar con: node js/update-estimated-prices.js
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Importar funciones de estimación de precios
// Nota: Usamos require ya que estamos en CommonJS
const {
    BASE_PRICES,
    CONDITION_MULTIPLIERS,
    LANGUAGE_MULTIPLIERS
} = {
    BASE_PRICES: {
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
    },
    CONDITION_MULTIPLIERS: {
        'M': 1.5, 'NM': 1.0, 'EX': 0.8, 'GD': 0.6,
        'LP': 0.4, 'PL': 0.3, 'PO': 0.1
    },
    LANGUAGE_MULTIPLIERS: {
        'English': 1.2, 'Inglés': 1.2, 'Japonés': 1.1, '日本語': 1.1,
        'Español': 1.0, 'Français': 0.9, 'Deutsch': 0.9, 'Italiano': 0.9,
        'Português': 0.9, '한국어': 1.0, '中文': 1.0, 'Ruso': 0.8
    }
};

const DB_PATH = path.join(__dirname, '..', 'pokemon_cards.db');

function generateTCGPlayerPrices(rarity) {
    const basePrice = BASE_PRICES[rarity] || BASE_PRICES['Common'];
    
    const prices = {
        normal: {
            low: Math.round((basePrice * 0.8) * 100) / 100,
            mid: Math.round(basePrice * 100) / 100,
            high: Math.round((basePrice * 1.3) * 100) / 100,
            market: Math.round((basePrice * 0.95) * 100) / 100,
            directLow: null
        },
        updatedAt: new Date().toISOString(),
        isEstimated: true
    };
    
    if (rarity && rarity.includes('Holo')) {
        prices.holofoil = {
            low: Math.round((basePrice * 1.2 * 0.8) * 100) / 100,
            mid: Math.round((basePrice * 1.2) * 100) / 100,
            high: Math.round((basePrice * 1.2 * 1.3) * 100) / 100,
            market: Math.round((basePrice * 1.2 * 0.95) * 100) / 100,
            directLow: null
        };
    }
    
    prices.reverseHolofoil = {
        low: Math.round((basePrice * 1.1 * 0.8) * 100) / 100,
        mid: Math.round((basePrice * 1.1) * 100) / 100,
        high: Math.round((basePrice * 1.1 * 1.3) * 100) / 100,
        market: Math.round((basePrice * 1.1 * 0.95) * 100) / 100,
        directLow: null
    };
    
    return prices;
}

function generateCardMarketPrices(rarity) {
    const basePrice = BASE_PRICES[rarity] || BASE_PRICES['Common'];
    
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

async function updateDatabaseWithEstimatedPrices() {
    return new Promise((resolve, reject) => {
        console.log('🔧 Iniciando actualización de precios estimados...');
        console.log(`📂 Base de datos: ${DB_PATH}`);
        
        if (!fs.existsSync(DB_PATH)) {
            console.error('❌ Error: No se encontró la base de datos');
            reject(new Error('Database not found'));
            return;
        }
        
        const db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error('❌ Error al conectar con la base de datos:', err);
                reject(err);
                return;
            }
            console.log('✅ Conectado a la base de datos');
        });
        
        // Obtener todas las cartas
        db.all('SELECT id, name, rarity, tcgplayer, cardmarket FROM cards', [], (err, cards) => {
            if (err) {
                console.error('❌ Error al obtener cartas:', err);
                db.close();
                reject(err);
                return;
            }
            
            console.log(`📊 Total de cartas a actualizar: ${cards.length}`);
            
            let updatedCount = 0;
            let errorCount = 0;
            let skippedCount = 0;
            
            const updatePromises = cards.map((card, index) => {
                return new Promise((resolveCard) => {
                    // Verificar si ya tiene precios (no estimados)
                    let hasTCGPlayer = false;
                    let hasCardMarket = false;
                    
                    try {
                        if (card.tcgplayer && card.tcgplayer !== '{}' && card.tcgplayer !== 'null') {
                            const tcgData = JSON.parse(card.tcgplayer);
                            if (tcgData.prices && !tcgData.prices.isEstimated) {
                                hasTCGPlayer = true;
                            }
                        }
                        if (card.cardmarket && card.cardmarket !== '{}' && card.cardmarket !== 'null') {
                            const cmData = JSON.parse(card.cardmarket);
                            if (cmData.prices && !cmData.prices.isEstimated) {
                                hasCardMarket = true;
                            }
                        }
                    } catch (e) {
                        // Ignorar errores de parsing
                    }
                    
                    // Si ya tiene precios reales, skip
                    if (hasTCGPlayer && hasCardMarket) {
                        skippedCount++;
                        if ((index + 1) % 1000 === 0) {
                            console.log(`⏩ Procesadas ${index + 1}/${cards.length} cartas...`);
                        }
                        resolveCard();
                        return;
                    }
                    
                    // Generar precios estimados
                    const tcgplayerPrices = generateTCGPlayerPrices(card.rarity);
                    const cardmarketPrices = generateCardMarketPrices(card.rarity);
                    
                    const tcgplayerJSON = JSON.stringify({ prices: tcgplayerPrices });
                    const cardmarketJSON = JSON.stringify({ prices: cardmarketPrices });
                    
                    // Actualizar en la base de datos
                    db.run(
                        'UPDATE cards SET tcgplayer = ?, cardmarket = ? WHERE id = ?',
                        [tcgplayerJSON, cardmarketJSON, card.id],
                        function(updateErr) {
                            if (updateErr) {
                                console.error(`❌ Error al actualizar carta ${card.id}:`, updateErr);
                                errorCount++;
                            } else {
                                updatedCount++;
                                if ((index + 1) % 1000 === 0) {
                                    console.log(`✅ Actualizadas ${updatedCount} cartas...`);
                                }
                            }
                            resolveCard();
                        }
                    );
                });
            });
            
            // Esperar a que todas las actualizaciones terminen
            Promise.all(updatePromises).then(() => {
                console.log('\n📊 Resumen de actualización:');
                console.log(`✅ Cartas actualizadas: ${updatedCount}`);
                console.log(`⏩ Cartas omitidas (ya tienen precios reales): ${skippedCount}`);
                console.log(`❌ Errores: ${errorCount}`);
                console.log(`📈 Total procesado: ${cards.length}`);
                
                db.close((closeErr) => {
                    if (closeErr) {
                        console.error('❌ Error al cerrar la base de datos:', closeErr);
                        reject(closeErr);
                    } else {
                        console.log('\n✅ Base de datos actualizada correctamente');
                        resolve({
                            updated: updatedCount,
                            skipped: skippedCount,
                            errors: errorCount,
                            total: cards.length
                        });
                    }
                });
            });
        });
    });
}

// Ejecutar si se llama directamente
if (require.main === module) {
    updateDatabaseWithEstimatedPrices()
        .then(result => {
            console.log('\n🎉 ¡Actualización completada exitosamente!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n❌ Error durante la actualización:', error);
            process.exit(1);
        });
}

module.exports = { updateDatabaseWithEstimatedPrices };
