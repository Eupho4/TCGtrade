const LocalCardDatabase = require('./local-database');

class SimpleAsianMigration {
    constructor() {
        this.db = new LocalCardDatabase();
        this.asianLanguages = ['ja', 'ko', 'zh-cn', 'zh-tw'];
        this.totalCards = 0;
        this.totalSets = 0;
        const fetch = require('node-fetch');
    }

    async init() {
        console.log('🗄️ Inicializando migración asiática simple...');
        await this.db.init();
        console.log('✅ Base de datos inicializada');
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async migrateSetsViaAPI() {
        console.log('🎌 Migrando sets desde API local...');
        
        try {
            // Usar el endpoint TCGdex que ya funciona en el servidor
            const fetch = (await import('node-fetch')).default;
            const response = await fetch('http://localhost:3000/api/tcgdx/sets');
            const data = await response.json();
            
            console.log(`📊 Encontrados ${data.data.length} sets asiáticos`);
            
            // Procesar cada set
            for (const set of data.data) {
                try {
                    await this.db.run(`
                        INSERT OR REPLACE INTO sets (
                            id, name, series, printed_total, total, 
                            release_date, updated_at, images
                        ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)
                    `, [
                        set.id,
                        set.name,
                        set.series || '',
                        set.total || 0,
                        set.total || 0,
                        set.releaseDate || '',
                        JSON.stringify(set.images || {})
                    ]);
                    
                    this.totalSets++;
                    
                } catch (error) {
                    console.log(`⚠️ Error procesando set ${set.id}: ${error.message}`);
                }
            }
            
            console.log(`✅ Sets procesados: ${this.totalSets}`);
            
        } catch (error) {
            console.error('❌ Error migrando sets:', error.message);
        }
    }

    async migrateCardsViaAPI() {
        console.log('🎴 Migrando cartas desde API local...');
        
        try {
            // Obtener primero los sets para luego obtener sus cartas
            const fetch = (await import('node-fetch')).default;
            const setsResponse = await fetch('http://localhost:3000/api/tcgdx/sets');
            const setsData = await setsResponse.json();
            
            console.log(`📦 Procesando cartas de ${setsData.data.length} sets...`);
            
            for (const set of setsData.data.slice(0, 10)) { // Procesar solo los primeros 10 sets para prueba
                try {
                    console.log(`\n🎯 Procesando set: ${set.displayName} (${set.id})`);
                    
                    // Obtener cartas del set
                    const cardsResponse = await fetch(`http://localhost:3000/api/tcgdx/cards?set=${set.id}&pageSize=1000`);
                    const cardsData = await cardsResponse.json();
                    
                    console.log(`📊 Encontradas ${cardsData.data.length} cartas en ${set.displayName}`);
                    
                    // Procesar cada carta
                    for (const card of cardsData.data) {
                        try {
                            await this.db.addCard({
                                id: card.id,
                                name: card.displayName || card.name,
                                set_name: card.set?.displayName || card.set?.name || '',
                                set_id: card.set?.id || '',
                                series: card.set?.series || '',
                                number: card.number || '',
                                rarity: card.rarity || '',
                                types: card.types ? card.types.join(',') : '',
                                subtypes: card.subtypes ? card.subtypes.join(',') : '',
                                images: JSON.stringify(card.images || {}),
                                tcgplayer: JSON.stringify({}),
                                cardmarket: JSON.stringify({})
                            });
                            
                            this.totalCards++;
                            
                        } catch (error) {
                            console.log(`⚠️ Error procesando carta ${card.id}: ${error.message}`);
                        }
                    }
                    
                    console.log(`✅ Cartas procesadas del set: ${cardsData.data.length}`);
                    await this.delay(2000); // 2 segundos entre sets
                    
                } catch (error) {
                    console.error(`❌ Error procesando set ${set.id}:`, error.message);
                }
            }
            
            console.log(`\n🎉 Total de cartas procesadas: ${this.totalCards}`);
            
        } catch (error) {
            console.error('❌ Error migrando cartas:', error.message);
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
                    'SELECT COUNT(*) as count FROM cards WHERE id LIKE ? OR images LIKE ?', 
                    [`%-${lang}`, `%"language":"${lang}"%`]
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
            
            console.log('🚀 Iniciando migración asiática simple...');
            console.log('📋 Usando API local del servidor');
            
            // Migrar sets
            await this.migrateSetsViaAPI();
            
            // Migrar cartas (muestra)
            await this.migrateCardsViaAPI();
            
            // Mostrar estadísticas finales
            await this.getMigrationStats();
            
            console.log('\n🎉 ¡Migración asiática simple completada!');
            
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
    const migration = new SimpleAsianMigration();
    migration.start().catch(console.error);
}

module.exports = SimpleAsianMigration;