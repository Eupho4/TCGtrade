/**
 * Script para actualizar la base de datos PostgreSQL con precios estimados
 * Ejecutar con: node js/update-estimated-prices-postgres.js
 */

require('dotenv').config();
const { Pool } = require('pg');

// Precios base por rareza (en EUR)
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
    const connectionString = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
    
    if (!connectionString) {
        console.error('❌ ERROR: DATABASE_URL no está configurada');
        console.log('💡 Asegúrate de tener un archivo .env con DATABASE_URL o DATABASE_PUBLIC_URL');
        process.exit(1);
    }
    
    const pool = new Pool({
        connectionString: connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    });
    
    try {
        console.log('🔧 Iniciando actualización de precios estimados...');
        console.log('📂 Conectando a PostgreSQL en Railway...');
        
        // Probar conexión
        const client = await pool.connect();
        console.log('✅ Conectado a PostgreSQL exitosamente');
        
        // Obtener todas las cartas
        const result = await client.query('SELECT id, name, rarity, tcgplayer, cardmarket FROM cards');
        const cards = result.rows;
        console.log(`📊 Total de cartas a actualizar: ${cards.length}`);
        
        let updatedCount = 0;
        let errorCount = 0;
        let skippedCount = 0;
        
        // Actualizar en lotes para mejor rendimiento
        const BATCH_SIZE = 100;
        
        for (let i = 0; i < cards.length; i += BATCH_SIZE) {
            const batch = cards.slice(i, i + BATCH_SIZE);
            console.log(`\n📦 Procesando lote ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(cards.length / BATCH_SIZE)}...`);
            
            for (const card of batch) {
                try {
                    // Verificar si ya tiene precios reales (no estimados)
                    let hasTCGPlayer = false;
                    let hasCardMarket = false;
                    
                    if (card.tcgplayer && card.tcgplayer !== '{}' && card.tcgplayer !== 'null' && typeof card.tcgplayer === 'object') {
                        const tcgData = card.tcgplayer;
                        if (tcgData.prices && !tcgData.prices.isEstimated) {
                            hasTCGPlayer = true;
                        }
                    }
                    
                    if (card.cardmarket && card.cardmarket !== '{}' && card.cardmarket !== 'null' && typeof card.cardmarket === 'object') {
                        const cmData = card.cardmarket;
                        if (cmData.prices && !cmData.prices.isEstimated) {
                            hasCardMarket = true;
                        }
                    }
                    
                    // Si ya tiene precios reales, skip
                    if (hasTCGPlayer && hasCardMarket) {
                        skippedCount++;
                        continue;
                    }
                    
                    // Generar precios estimados
                    const tcgplayerPrices = generateTCGPlayerPrices(card.rarity);
                    const cardmarketPrices = generateCardMarketPrices(card.rarity);
                    
                    // Actualizar en la base de datos
                    await client.query(
                        'UPDATE cards SET tcgplayer = $1, cardmarket = $2 WHERE id = $3',
                        [
                            JSON.stringify({ prices: tcgplayerPrices }),
                            JSON.stringify({ prices: cardmarketPrices }),
                            card.id
                        ]
                    );
                    
                    updatedCount++;
                } catch (updateErr) {
                    console.error(`❌ Error al actualizar carta ${card.id}:`, updateErr.message);
                    errorCount++;
                }
            }
            
            console.log(`   ✅ ${updatedCount} cartas actualizadas hasta ahora...`);
        }
        
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📊 RESUMEN DE ACTUALIZACIÓN');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`✅ Cartas actualizadas: ${updatedCount}`);
        console.log(`⏩ Cartas omitidas (precios reales): ${skippedCount}`);
        console.log(`❌ Errores: ${errorCount}`);
        console.log(`📈 Total procesado: ${cards.length}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        client.release();
        await pool.end();
        
        console.log('✅ Base de datos actualizada correctamente');
        return {
            updated: updatedCount,
            skipped: skippedCount,
            errors: errorCount,
            total: cards.length
        };
    } catch (error) {
        console.error('❌ Error durante la actualización:', error);
        await pool.end();
        throw error;
    }
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
