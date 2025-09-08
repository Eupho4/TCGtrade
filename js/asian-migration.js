const LocalCardDatabase = require('./local-database');

class AsianMigration {
    constructor() {
        this.db = new LocalCardDatabase();
        this.asianLanguages = ['ja', 'ko', 'zh-cn', 'zh-tw']; // Japonés, Coreano, Chino simplificado, Chino tradicional
        this.batchSize = 10;
        this.maxRetries = 5;
        this.timeout = 30000; // 30 segundos
        this.totalCards = 0;
        this.totalSets = 0;
        this.processedSets = new Set();
    }

    async init() {
        console.log('🗄️ Inicializando migración asiática...');
        await this.db.init();
        console.log('✅ Base de datos inicializada');
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async fetchWithRetry(url, maxRetries = 5) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`📡 Intento ${attempt}/${maxRetries}: ${url}`);
                
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.timeout);
                
                const response = await fetch(url, {
                    signal: controller.signal,
                    headers: {
                        'User-Agent': 'TCGtrade-Asian-Migration/1.0'
                    }
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                return response;
            } catch (error) {
                console.log(`⚠️ Intento ${attempt} falló: ${error.message}`);
                if (attempt === maxRetries) {
                    throw error;
                }
                
                const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
                console.log(`⏳ Esperando ${delay/1000}s antes del siguiente intento...`);
                await this.delay(delay);
            }
        }
    }

    async migrateSets() {
        console.log('🎌 Iniciando migración de sets asiáticos...');
        
        for (const lang of this.asianLanguages) {
            try {
                console.log(`\n📦 Procesando sets en ${lang.toUpperCase()}...`);
                
                // Importar TCGdx SDK
                const TCGdx = require('@tcgdx/sdk');
                const tcgdx = new TCGdx(lang);
                
                const sets = await tcgdx.fetchSets();
                console.log(`📊 Encontrados ${sets.length} sets en ${lang}`);
                
                // Filtrar sets válidos (excluir Pocket, etc.)
                const validSets = sets.filter(set => 
                    !set.id?.includes('pocket') && 
                    !set.name?.toLowerCase().includes('pocket') &&
                    set.cardCount?.total > 0
                );
                
                console.log(`✅ ${validSets.length} sets válidos en ${lang}`);
                
                // Procesar sets en lotes
                for (let i = 0; i < validSets.length; i += this.batchSize) {
                    const batch = validSets.slice(i, i + this.batchSize);
                    await this.processSetBatch(batch, lang);
                    console.log(`✅ Lote de sets procesado: ${i + batch.length}/${validSets.length} en ${lang}`);
                    await this.delay(1000); // 1 segundo entre lotes
                }
                
            } catch (error) {
                console.error(`❌ Error procesando sets en ${lang}:`, error.message);
            }
        }
        
        console.log(`\n🎉 Migración de sets completada! Total de sets procesados: ${this.totalSets}`);
    }

    async processSetBatch(sets, language) {
        for (const set of sets) {
            try {
                // Evitar duplicados
                const setKey = `${set.id}-${language}`;
                if (this.processedSets.has(setKey)) {
                    continue;
                }
                
                await this.db.run(`
                    INSERT OR REPLACE INTO sets (
                        id, name, series, printed_total, total, 
                        release_date, updated_at, images
                    ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)
                `, [
                    `${set.id}-${language}`, // ID único por idioma
                    set.name,
                    set.serie?.name || '',
                    set.cardCount?.total || 0,
                    set.cardCount?.total || 0,
                    set.releaseDate || '',
                    JSON.stringify({
                        symbol: set.symbol,
                        logo: set.logo
                    })
                ]);
                
                this.processedSets.add(setKey);
                this.totalSets++;
                
            } catch (error) {
                console.log(`⚠️ Error procesando set ${set.id} en ${language}: ${error.message}`);
            }
        }
    }

    async migrateCards() {
        console.log('🎴 Iniciando migración de cartas asiáticas...');
        
        for (const lang of this.asianLanguages) {
            try {
                console.log(`\n🎌 Procesando cartas en ${lang.toUpperCase()}...`);
                
                // Importar TCGdx SDK
                const TCGdx = require('@tcgdx/sdk');
                const tcgdx = new TCGdx(lang);
                
                const cards = await tcgdx.fetchCards();
                console.log(`📊 Encontradas ${cards.length} cartas en ${lang}`);
                
                // Filtrar cartas válidas (excluir Pocket, etc.)
                const validCards = cards.filter(card => 
                    !card.set?.id?.includes('pocket') && 
                    !card.set?.name?.toLowerCase().includes('pocket')
                );
                
                console.log(`✅ ${validCards.length} cartas válidas en ${lang}`);
                
                // Procesar cartas en lotes
                for (let i = 0; i < validCards.length; i += this.batchSize) {
                    const batch = validCards.slice(i, i + this.batchSize);
                    await this.processCardBatch(batch, lang);
                    this.totalCards += batch.length;
                    console.log(`✅ Lote procesado: ${this.totalCards} cartas totales en ${lang}`);
                    await this.delay(1000); // 1 segundo entre lotes
                }
                
            } catch (error) {
                console.error(`❌ Error procesando cartas en ${lang}:`, error.message);
            }
        }
        
        console.log(`\n🎉 Migración de cartas completada! Total de cartas procesadas: ${this.totalCards}`);
    }

    async processCardBatch(cards, language) {
        for (const card of cards) {
            try {
                // Crear ID único por idioma
                const uniqueId = `${card.id}-${language}`;
                
                // Construir URL de imagen correctamente
                let imageUrl = card.image;
                if (!imageUrl) {
                    imageUrl = null; // Sin imagen disponible
                } else if (!imageUrl.startsWith('http')) {
                    imageUrl = `https://assets.tcgdx.net${imageUrl}`;
                }
                
                await this.db.addCard({
                    id: uniqueId,
                    name: card.localName || card.name,
                    set_name: card.set?.localName || card.set?.name || '',
                    set_id: `${card.set?.id}-${language}`,
                    series: card.set?.serie?.name || '',
                    number: card.localId || '',
                    rarity: card.rarity || '',
                    types: card.types ? card.types.join(',') : '',
                    subtypes: card.subtypes ? card.subtypes.join(',') : '',
                    images: JSON.stringify({
                        small: imageUrl ? `${imageUrl}/low.webp` : null,
                        large: imageUrl ? `${imageUrl}/high.webp` : null,
                        language: language
                    }),
                    tcgplayer: JSON.stringify({}), // TCGdx no tiene datos de TCGPlayer
                    cardmarket: JSON.stringify({}) // TCGdx no tiene datos de CardMarket
                });
                
            } catch (error) {
                console.log(`⚠️ Error procesando carta ${card.id} en ${language}: ${error.message}`);
            }
        }
    }

    async getMigrationStats() {
        try {
            const stats = await this.db.getStats();
            console.log('\n📊 Estadísticas de migración asiática:');
            console.log(`- Total de cartas en BD: ${stats.totalCards}`);
            console.log(`- Total de sets en BD: ${stats.totalSets}`);
            console.log(`- Última actualización: ${stats.lastUpdated}`);
            console.log(`- Tamaño de BD: ${stats.databaseSize}`);
            
            // Contar cartas por idioma
            for (const lang of this.asianLanguages) {
                const langCards = await this.db.get(
                    'SELECT COUNT(*) as count FROM cards WHERE id LIKE ?', 
                    [`%-${lang}`]
                );
                console.log(`- Cartas en ${lang.toUpperCase()}: ${langCards.count}`);
            }
            
        } catch (error) {
            console.error('❌ Error obteniendo estadísticas:', error);
        }
    }

    async start() {
        try {
            await this.init();
            
            console.log('🚀 Iniciando migración completa asiática...');
            console.log(`📋 Idiomas objetivo: ${this.asianLanguages.join(', ')}`);
            
            // Migrar sets primero
            await this.migrateSets();
            
            // Migrar cartas
            await this.migrateCards();
            
            // Mostrar estadísticas finales
            await this.getMigrationStats();
            
            console.log('\n🎉 ¡Migración asiática completada exitosamente!');
            
        } catch (error) {
            console.error('❌ Error fatal en migración asiática:', error);
        } finally {
            // Cerrar la base de datos
            console.log('🔒 Cerrando base de datos...');
            await this.db.close();
            console.log('✅ Base de datos cerrada correctamente');
        }
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    const migration = new AsianMigration();
    migration.start().catch(console.error);
}

module.exports = AsianMigration;