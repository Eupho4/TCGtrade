const LocalCardDatabase = require('./local-database');

class AsianMigrationSDK {
    constructor() {
        this.db = new LocalCardDatabase();
        this.asianLanguages = ['ja', 'ko', 'zh-cn', 'zh-tw'];
        this.totalCards = 0;
        this.totalSets = 0;
        this.batchSize = 10;
    }

    async init() {
        console.log('🗄️ Inicializando migración asiática via SDK...');
        await this.db.init();
        console.log('✅ Base de datos inicializada');
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async processSetBatch(sets, language) {
        for (const set of sets) {
            try {
                const setId = `${set.id}-${language}`;
                
                await this.db.run(`
                    INSERT OR REPLACE INTO sets (
                        id, name, series, printed_total, total, 
                        release_date, updated_at, images
                    ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)
                `, [
                    setId,
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
                
                this.totalSets++;
                
            } catch (error) {
                console.log(`⚠️ Error procesando set ${set.id}: ${error.message}`);
            }
        }
    }

    async processCardBatch(cards, language) {
        for (const card of cards) {
            try {
                const cardId = `${card.id}-${language}`;
                
                // Construir URL de imagen
                let imageUrl = card.image;
                if (imageUrl && !imageUrl.startsWith('http')) {
                    imageUrl = `https://assets.tcgdex.net${imageUrl}`;
                }
                
                await this.db.addCard({
                    id: cardId,
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
                    tcgplayer: JSON.stringify({}),
                    cardmarket: JSON.stringify({})
                });
                
            } catch (error) {
                console.log(`⚠️ Error procesando carta ${card.id}: ${error.message}`);
            }
        }
    }

    async migrateSets() {
        console.log('🎌 Iniciando migración de sets asiáticos via SDK...');
        
        for (const lang of this.asianLanguages) {
            try {
                console.log(`\n📦 Procesando sets en ${lang.toUpperCase()}...`);
                
                // Importar TCGdex SDK dinámicamente
                const { default: TCGdex } = await import('@tcgdex/sdk');
                const tcgdex = new TCGdex(lang);
                
                const sets = await tcgdex.fetchSets();
                console.log(`📊 Encontrados ${sets.length} sets en ${lang}`);
                
                // Filtrar sets válidos
                const validSets = sets.filter(set => 
                    set.id && 
                    !set.id.includes('pocket') && 
                    !set.name?.toLowerCase().includes('pocket') &&
                    set.cardCount?.total > 0
                );
                
                console.log(`✅ ${validSets.length} sets válidos en ${lang}`);
                
                // Procesar en lotes
                for (let i = 0; i < validSets.length; i += this.batchSize) {
                    const batch = validSets.slice(i, i + this.batchSize);
                    await this.processSetBatch(batch, lang);
                    console.log(`✅ Lote de sets procesado: ${i + batch.length}/${validSets.length} en ${lang}`);
                    await this.delay(1000);
                }
                
            } catch (error) {
                console.error(`❌ Error procesando sets en ${lang}:`, error.message);
            }
        }
        
        console.log(`\n🎉 Migración de sets completada! Total: ${this.totalSets}`);
    }

    async migrateCards() {
        console.log('🎴 Iniciando migración de cartas asiáticas via SDK...');
        
        for (const lang of this.asianLanguages) {
            try {
                console.log(`\n🎌 Procesando cartas en ${lang.toUpperCase()}...`);
                
                // Importar TCGdex SDK dinámicamente
                const { default: TCGdex } = await import('@tcgdex/sdk');
                const tcgdex = new TCGdex(lang);
                
                // Obtener sets primero
                const sets = await tcgdex.fetchSets();
                
                const validSets = sets.filter(set => 
                    set.id && 
                    !set.id.includes('pocket') && 
                    set.cardCount?.total > 0
                ).slice(0, 3); // Solo los primeros 3 sets para prueba
                
                console.log(`📦 Procesando cartas de ${validSets.length} sets en ${lang}...`);
                
                for (const set of validSets) {
                    try {
                        console.log(`\n🎯 Procesando set: ${set.name} (${set.id})`);
                        
                        const setWithCards = await tcgdex.fetchSet(set.id);
                        const cards = setWithCards.cards || [];
                        
                        console.log(`📊 Encontradas ${cards.length} cartas en ${set.name}`);
                        
                        // Procesar cartas en lotes
                        for (let i = 0; i < cards.length; i += this.batchSize) {
                            const batch = cards.slice(i, i + this.batchSize);
                            await this.processCardBatch(batch, lang);
                            this.totalCards += batch.length;
                            console.log(`✅ Procesadas ${this.totalCards} cartas totales`);
                            await this.delay(1000);
                        }
                        
                        await this.delay(2000); // 2 segundos entre sets
                        
                    } catch (error) {
                        console.error(`❌ Error procesando set ${set.id}:`, error.message);
                    }
                }
                
            } catch (error) {
                console.error(`❌ Error procesando cartas en ${lang}:`, error.message);
            }
        }
        
        console.log(`\n🎉 Migración de cartas completada! Total: ${this.totalCards}`);
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
            
            console.log('🚀 Iniciando migración asiática via TCGDEX SDK...');
            console.log(`📋 Idiomas objetivo: ${this.asianLanguages.join(', ')}`);
            
            // Migrar sets primero
            await this.migrateSets();
            
            // Migrar cartas (muestra)
            await this.migrateCards();
            
            // Mostrar estadísticas finales
            await this.getMigrationStats();
            
            console.log('\n🎉 ¡Migración asiática completada exitosamente!');
            
        } catch (error) {
            console.error('❌ Error fatal en migración asiática:', error);
        } finally {
            console.log('🔒 Cerrando base de datos...');
            await this.db.close();
            console.log('✅ Base de datos cerrada correctamente');
        }
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    const migration = new AsianMigrationSDK();
    migration.start().catch(console.error);
}

module.exports = AsianMigrationSDK;