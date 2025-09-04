const LocalCardDatabase = require('./local-database');
const LocalSearchEngine = require('./local-search-engine');

class RealAPIMigrator {
    constructor() {
        this.db = new LocalCardDatabase();
        this.searchEngine = new LocalSearchEngine();
        this.apiBaseUrl = 'https://api.pokemontcg.io/v2';
        this.apiKey = process.env.POKEMON_TCG_API_KEY || ''; // Opcional, para más requests
        this.migrationStats = {
            totalSets: 0,
            totalCards: 0,
            setsMigrated: 0,
            cardsMigrated: 0,
            errors: 0,
            startTime: null,
            endTime: null
        };
    }

    async init() {
        console.log('🗄️ Inicializando migrador de API real...');
        await this.db.init();
        await this.searchEngine.init();
        console.log('✅ Migrador inicializado correctamente');
    }

    async migrateRealAPI() {
        try {
            console.log('🚀 Iniciando migración REAL de la API de Pokémon TCG...');
            this.migrationStats.startTime = new Date();
            
            // 1. Migrar todos los sets
            console.log('📚 Migrando sets desde API real...');
            await this.migrateAllSets();
            
            // 2. Migrar todas las cartas
            console.log('🎴 Migrando cartas desde API real...');
            await this.migrateAllCards();
            
            // 3. Crear índices optimizados
            console.log('🔍 Creando índices de búsqueda optimizados...');
            await this.createOptimizedIndexes();
            
            // 4. Verificar integridad
            console.log('🔍 Verificando integridad de datos...');
            await this.verifyDataIntegrity();
            
            this.migrationStats.endTime = new Date();
            this.printFinalStats();
            
            console.log('🎉 Migración REAL completada exitosamente');
            
        } catch (error) {
            console.error('❌ Error en migración real:', error);
            throw error;
        }
    }

    async migrateAllSets() {
        try {
            console.log('🌐 Obteniendo sets desde API real...');
            
            let page = 1;
            let hasMore = true;
            let totalSets = 0;
            
            while (hasMore) {
                const url = `${this.apiBaseUrl}/sets?page=${page}&pageSize=250`;
                console.log(`📄 Obteniendo página ${page} de sets...`);
                
                const response = await this.fetchWithRetry(url);
                const data = await response.json();
                
                if (data.data && data.data.length > 0) {
                    console.log(`📚 Procesando ${data.data.length} sets de la página ${page}...`);
                    
                    for (const set of data.data) {
                        await this.saveSet(set);
                        totalSets++;
                    }
                    
                    console.log(`✅ ${totalSets} sets migrados hasta ahora`);
                    page++;
                    
                    // Pequeña pausa para no sobrecargar la API
                    await this.delay(100);
                } else {
                    hasMore = false;
                }
            }
            
            this.migrationStats.totalSets = totalSets;
            console.log(`✅ ${totalSets} sets migrados correctamente`);
            
        } catch (error) {
            console.error('❌ Error migrando sets:', error);
            throw error;
        }
    }

    async migrateAllCards() {
        try {
            console.log('🌐 Obteniendo cartas desde API real...');
            
            let page = 1;
            let hasMore = true;
            let totalCards = 0;
            let batchSize = 50; // Reducido para mejor manejo de memoria
            let consecutiveErrors = 0;
            const maxConsecutiveErrors = 3;
            
            while (hasMore && consecutiveErrors < maxConsecutiveErrors) {
                try {
                    const url = `${this.apiBaseUrl}/cards?page=${page}&pageSize=250`;
                    console.log(`📄 Obteniendo página ${page} de cartas...`);
                    
                    const response = await this.fetchWithRetry(url, 5); // Más reintentos
                    const data = await response.json();
                    
                    if (data.data && data.data.length > 0) {
                        console.log(`🎴 Procesando ${data.data.length} cartas de la página ${page}...`);
                        
                        // Procesar en lotes para mejor rendimiento
                        for (let i = 0; i < data.data.length; i += batchSize) {
                            const batch = data.data.slice(i, i + batchSize);
                            await this.processCardBatch(batch);
                            totalCards += batch.length;
                            
                            console.log(`🎴 Cartas: ${totalCards} migradas - Lote ${Math.floor(i/batchSize) + 1}/${Math.ceil(data.data.length/batchSize)}`);
                            
                            // Pausa entre lotes para no sobrecargar
                            await this.delay(100);
                        }
                        
                        page++;
                        consecutiveErrors = 0; // Reset contador de errores
                        
                        // Pausa más larga entre páginas
                        await this.delay(500);
                    } else {
                        hasMore = false;
                    }
                } catch (error) {
                    consecutiveErrors++;
                    console.error(`❌ Error en página ${page} (intento ${consecutiveErrors}/${maxConsecutiveErrors}):`, error.message);
                    
                    if (consecutiveErrors < maxConsecutiveErrors) {
                        console.log(`⏳ Esperando 5 segundos antes del siguiente intento...`);
                        await this.delay(5000);
                        // No incrementar page, reintentar la misma página
                    } else {
                        console.log(`⚠️ Demasiados errores consecutivos, continuando con las cartas migradas hasta ahora...`);
                        hasMore = false;
                    }
                }
            }
            
            this.migrationStats.totalCards = totalCards;
            console.log(`✅ ${totalCards} cartas migradas correctamente`);
            
        } catch (error) {
            console.error('❌ Error migrando cartas:', error);
            throw error;
        }
    }

    async processCardBatch(cards) {
        try {
            for (const card of cards) {
                await this.saveCard(card);
            }
        } catch (error) {
            console.error('❌ Error procesando lote de cartas:', error);
            this.migrationStats.errors++;
        }
    }

    async saveSet(set) {
        try {
            const setData = {
                id: set.id,
                name: set.name,
                series: set.series || 'Unknown',
                total: set.total || 0,
                release_date: set.releaseDate || null,
                images: JSON.stringify(set.images || {}),
                legalities: JSON.stringify(set.legalities || {}),
                ptcgo_code: set.ptcgoCode || null,
                last_updated: new Date().toISOString()
            };

            await this.db.run(`
                INSERT OR REPLACE INTO sets (
                    id, name, series, total, release_date, 
                    images, legalities, ptcgo_code, last_updated
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                setData.id, setData.name, setData.series, setData.total,
                setData.release_date, setData.images, setData.legalities,
                setData.ptcgo_code, setData.last_updated
            ]);

            this.migrationStats.setsMigrated++;
        } catch (error) {
            console.error(`❌ Error guardando set ${set.id}:`, error);
            this.migrationStats.errors++;
        }
    }

    async saveCard(card) {
        try {
            const cardData = {
                id: card.id,
                name: card.name,
                set_name: card.set?.name || 'Unknown',
                set_id: card.set?.id || null,
                number: card.number || null,
                rarity: card.rarity || 'Unknown',
                types: JSON.stringify(card.types || []),
                subtypes: JSON.stringify(card.subtypes || []),
                images: JSON.stringify(card.images || {}),
                tcgplayer: JSON.stringify(card.tcgplayer || {}),
                cardmarket: JSON.stringify(card.cardmarket || {}),
                last_updated: new Date().toISOString()
            };

            await this.db.run(`
                INSERT OR REPLACE INTO cards (
                    id, name, set_name, set_id, number, rarity,
                    types, subtypes, images, tcgplayer, cardmarket, last_updated
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                cardData.id, cardData.name, cardData.set_name, cardData.set_id,
                cardData.number, cardData.rarity, cardData.types, cardData.subtypes,
                cardData.images, cardData.tcgplayer, cardData.cardmarket, cardData.last_updated
            ]);

            this.migrationStats.cardsMigrated++;
        } catch (error) {
            console.error(`❌ Error guardando carta ${card.id}:`, error);
            this.migrationStats.errors++;
        }
    }

    async createOptimizedIndexes() {
        try {
            const indexes = [
                'CREATE INDEX IF NOT EXISTS idx_cards_name_lower ON cards(LOWER(name))',
                'CREATE INDEX IF NOT EXISTS idx_cards_set_series ON cards(set_name, series)',
                'CREATE INDEX IF NOT EXISTS idx_cards_rarity_type ON cards(rarity, types)',
                'CREATE INDEX IF NOT EXISTS idx_cards_search ON cards(name, set_name, rarity)',
                'CREATE INDEX IF NOT EXISTS idx_cards_types_search ON cards(types)',
                'CREATE INDEX IF NOT EXISTS idx_sets_name ON sets(name)',
                'CREATE INDEX IF NOT EXISTS idx_sets_series ON sets(series)'
            ];

            for (const index of indexes) {
                await this.db.run(index);
            }

            console.log('✅ Índices de búsqueda optimizados creados correctamente');
        } catch (error) {
            console.error('❌ Error creando índices:', error);
            throw error;
        }
    }

    async verifyDataIntegrity() {
        try {
            const stats = await this.db.getStats();
            console.log('📊 Estadísticas finales de la base de datos:');
            console.log(`- Total de cartas: ${stats.totalCards}`);
            console.log(`- Total de sets: ${stats.totalSets}`);
            console.log(`- Tamaño de base de datos: ${stats.databaseSize}`);
            console.log(`- Última actualización: ${stats.lastUpdated}`);

            // Verificar duplicados
            const duplicates = await this.db.get(`
                SELECT id, COUNT(*) as count 
                FROM cards 
                GROUP BY id 
                HAVING COUNT(*) > 1
            `);

            if (duplicates) {
                console.log('⚠️ Se encontraron cartas duplicadas:', duplicates);
            } else {
                console.log('✅ No se encontraron cartas duplicadas');
            }

            console.log('✅ Verificación de integridad completada');
        } catch (error) {
            console.error('❌ Error verificando integridad:', error);
            throw error;
        }
    }

    async fetchWithRetry(url, maxRetries = 3) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const headers = {
                    'User-Agent': 'TCGtrade-Local-API/1.0',
                    'Accept': 'application/json'
                };

                if (this.apiKey) {
                    headers['X-Api-Key'] = this.apiKey;
                }

                // Timeout de 30 segundos
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 30000);

                const response = await fetch(url, { 
                    headers,
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                return response;
            } catch (error) {
                console.log(`⚠️ Intento ${attempt}/${maxRetries} falló: ${error.message}`);
                
                if (attempt === maxRetries) {
                    throw error;
                }
                
                // Esperar antes del siguiente intento (backoff exponencial)
                const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
                await this.delay(delay);
            }
        }
    }

    printFinalStats() {
        const duration = this.migrationStats.endTime - this.migrationStats.startTime;
        const durationMinutes = Math.floor(duration / 60000);
        const durationSeconds = Math.floor((duration % 60000) / 1000);

        console.log('\n🎉 MIGRACIÓN REAL COMPLETADA');
        console.log('================================');
        console.log(`📚 Sets migrados: ${this.migrationStats.setsMigrated}`);
        console.log(`🎴 Cartas migradas: ${this.migrationStats.cardsMigrated}`);
        console.log(`❌ Errores: ${this.migrationStats.errors}`);
        console.log(`⏱️ Tiempo total: ${durationMinutes}m ${durationSeconds}s`);
        console.log(`📊 Tasa de migración: ${Math.round(this.migrationStats.cardsMigrated / (duration / 1000))} cartas/segundo`);
        console.log('================================\n');
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async close() {
        await this.db.close();
        await this.searchEngine.close();
    }
}

module.exports = RealAPIMigrator;

// Si se ejecuta directamente, iniciar migración
if (require.main === module) {
    const migrator = new RealAPIMigrator();
    
    migrator.init()
        .then(() => migrator.migrateRealAPI())
        .then(() => migrator.close())
        .catch(error => {
            console.error('💥 Error fatal en migración:', error);
            process.exit(1);
        });
}