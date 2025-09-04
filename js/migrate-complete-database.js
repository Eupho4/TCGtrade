const LocalCardDatabase = require('./local-database');
const LocalSearchEngine = require('./local-search-engine');

class CompleteDatabaseMigrator {
    constructor() {
        this.db = new LocalCardDatabase();
        this.searchEngine = new LocalSearchEngine();
        this.apiBaseUrl = 'https://api.pokemontcg.io/v2';
        this.apiKey = process.env.POKEMON_TCG_API_KEY || '';
        this.migrationStats = {
            totalSets: 0,
            totalCards: 0,
            setsMigrated: 0,
            cardsMigrated: 0,
            errors: 0,
            startTime: null,
            endTime: null,
            lastSuccessfulPage: 0
        };
        this.isRunning = true;
    }

    async init() {
        console.log('🗄️ Inicializando migrador completo...');
        await this.db.init();
        await this.searchEngine.init();
        console.log('✅ Migrador inicializado correctamente');
    }

    async migrateCompleteDatabase() {
        try {
            console.log('🚀 Iniciando MIGRACIÓN COMPLETA de la API de Pokémon TCG...');
            console.log('📊 Objetivo: 19,500+ cartas y 168+ sets');
            this.migrationStats.startTime = new Date();
            
            // 1. Migrar TODOS los sets primero
            console.log('\n📚 FASE 1: Migrando TODOS los sets...');
            await this.migrateAllSetsComplete();
            
            // 2. Migrar TODAS las cartas
            console.log('\n🎴 FASE 2: Migrando TODAS las cartas...');
            await this.migrateAllCardsComplete();
            
            // 3. Crear índices optimizados
            console.log('\n🔍 FASE 3: Creando índices optimizados...');
            await this.createOptimizedIndexes();
            
            // 4. Verificar integridad completa
            console.log('\n🔍 FASE 4: Verificando integridad completa...');
            await this.verifyCompleteIntegrity();
            
            this.migrationStats.endTime = new Date();
            this.printFinalStats();
            
            console.log('🎉 MIGRACIÓN COMPLETA FINALIZADA EXITOSAMENTE');
            
        } catch (error) {
            console.error('❌ Error en migración completa:', error);
            this.printProgress();
            throw error;
        }
    }

    async migrateAllSetsComplete() {
        try {
            console.log('🌐 Obteniendo TODOS los sets desde API real...');
            
            let page = 1;
            let hasMore = true;
            let totalSets = 0;
            
            while (hasMore && this.isRunning) {
                try {
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
                        
                        // Pausa para no sobrecargar la API
                        await this.delay(200);
                    } else {
                        hasMore = false;
                    }
                } catch (error) {
                    console.error(`❌ Error en página ${page} de sets:`, error.message);
                    await this.delay(2000);
                    page++; // Continuar con la siguiente página
                }
            }
            
            this.migrationStats.totalSets = totalSets;
            console.log(`✅ ${totalSets} sets migrados correctamente`);
            
        } catch (error) {
            console.error('❌ Error migrando sets:', error);
            throw error;
        }
    }

    async migrateAllCardsComplete() {
        try {
            console.log('🌐 Obteniendo TODAS las cartas desde API real...');
            
            // Empezar desde la página 20 (donde se quedó)
            let page = 20;
            let hasMore = true;
            let totalCards = 0;
            let batchSize = 25; // Lotes más pequeños para mejor manejo
            let consecutiveErrors = 0;
            const maxConsecutiveErrors = 5;
            
            while (hasMore && this.isRunning && consecutiveErrors < maxConsecutiveErrors) {
                try {
                    const url = `${this.apiBaseUrl}/cards?page=${page}&pageSize=250`;
                    console.log(`📄 Obteniendo página ${page} de cartas...`);
                    
                    const response = await this.fetchWithRetry(url, 5);
                    const data = await response.json();
                    
                    if (data.data && data.data.length > 0) {
                        console.log(`🎴 Procesando ${data.data.length} cartas de la página ${page}...`);
                        
                        // Procesar en lotes pequeños
                        for (let i = 0; i < data.data.length; i += batchSize) {
                            if (!this.isRunning) break;
                            
                            const batch = data.data.slice(i, i + batchSize);
                            await this.processCardBatch(batch);
                            totalCards += batch.length;
                            
                            const progress = ((page - 20) / 60) * 100; // Estimación de 60 páginas más
                            console.log(`🎴 Cartas: ${totalCards} migradas - Página ${page} - Progreso: ${progress.toFixed(1)}%`);
                            
                            // Pausa entre lotes
                            await this.delay(150);
                        }
                        
                        this.migrationStats.lastSuccessfulPage = page;
                        page++;
                        consecutiveErrors = 0;
                        
                        // Pausa entre páginas
                        await this.delay(800);
                    } else {
                        hasMore = false;
                    }
                } catch (error) {
                    consecutiveErrors++;
                    console.error(`❌ Error en página ${page} (intento ${consecutiveErrors}/${maxConsecutiveErrors}):`, error.message);
                    
                    if (consecutiveErrors < maxConsecutiveErrors) {
                        console.log(`⏳ Esperando 10 segundos antes del siguiente intento...`);
                        await this.delay(10000);
                        // No incrementar page, reintentar la misma página
                    } else {
                        console.log(`⚠️ Demasiados errores consecutivos, guardando progreso...`);
                        this.printProgress();
                        hasMore = false;
                    }
                }
            }
            
            this.migrationStats.totalCards = totalCards;
            console.log(`✅ ${totalCards} cartas adicionales migradas correctamente`);
            
        } catch (error) {
            console.error('❌ Error migrando cartas:', error);
            throw error;
        }
    }

    async processCardBatch(cards) {
        try {
            for (const card of cards) {
                if (!this.isRunning) break;
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
            console.log('🔍 Creando índices optimizados para búsqueda ultra rápida...');
            
            const indexes = [
                'CREATE INDEX IF NOT EXISTS idx_cards_name_lower ON cards(LOWER(name))',
                'CREATE INDEX IF NOT EXISTS idx_cards_set_series ON cards(set_name, series)',
                'CREATE INDEX IF NOT EXISTS idx_cards_rarity_type ON cards(rarity, types)',
                'CREATE INDEX IF NOT EXISTS idx_cards_search ON cards(name, set_name, rarity)',
                'CREATE INDEX IF NOT EXISTS idx_cards_types_search ON cards(types)',
                'CREATE INDEX IF NOT EXISTS idx_cards_set_id ON cards(set_id)',
                'CREATE INDEX IF NOT EXISTS idx_cards_number ON cards(number)',
                'CREATE INDEX IF NOT EXISTS idx_sets_name ON sets(name)',
                'CREATE INDEX IF NOT EXISTS idx_sets_series ON sets(series)',
                'CREATE INDEX IF NOT EXISTS idx_sets_release_date ON sets(release_date)'
            ];

            for (const index of indexes) {
                await this.db.run(index);
            }

            console.log('✅ Índices optimizados creados correctamente');
        } catch (error) {
            console.error('❌ Error creando índices:', error);
            throw error;
        }
    }

    async verifyCompleteIntegrity() {
        try {
            const stats = await this.db.getStats();
            console.log('📊 Estadísticas FINALES de la base de datos:');
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

            // Verificar integridad de referencias
            const orphanCards = await this.db.get(`
                SELECT COUNT(*) as count 
                FROM cards c 
                LEFT JOIN sets s ON c.set_name = s.name 
                WHERE s.name IS NULL
            `);

            console.log(`- Cartas huérfanas: ${orphanCards.count}`);

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
                    'User-Agent': 'TCGtrade-Complete-Migration/1.0',
                    'Accept': 'application/json'
                };

                if (this.apiKey) {
                    headers['X-Api-Key'] = this.apiKey;
                }

                // Timeout de 45 segundos
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 45000);

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
                
                // Backoff exponencial
                const delay = Math.min(2000 * Math.pow(2, attempt - 1), 30000);
                await this.delay(delay);
            }
        }
    }

    printProgress() {
        const duration = new Date() - this.migrationStats.startTime;
        const durationMinutes = Math.floor(duration / 60000);
        const durationSeconds = Math.floor((duration % 60000) / 1000);

        console.log('\n📊 PROGRESO ACTUAL:');
        console.log('==================');
        console.log(`📚 Sets migrados: ${this.migrationStats.setsMigrated}`);
        console.log(`🎴 Cartas migradas: ${this.migrationStats.cardsMigrated}`);
        console.log(`❌ Errores: ${this.migrationStats.errors}`);
        console.log(`📄 Última página exitosa: ${this.migrationStats.lastSuccessfulPage}`);
        console.log(`⏱️ Tiempo transcurrido: ${durationMinutes}m ${durationSeconds}s`);
        console.log('==================\n');
    }

    printFinalStats() {
        const duration = this.migrationStats.endTime - this.migrationStats.startTime;
        const durationMinutes = Math.floor(duration / 60000);
        const durationSeconds = Math.floor((duration % 60000) / 1000);

        console.log('\n🎉 MIGRACIÓN COMPLETA FINALIZADA');
        console.log('==================================');
        console.log(`📚 Sets migrados: ${this.migrationStats.setsMigrated}`);
        console.log(`🎴 Cartas migradas: ${this.migrationStats.cardsMigrated}`);
        console.log(`❌ Errores: ${this.migrationStats.errors}`);
        console.log(`⏱️ Tiempo total: ${durationMinutes}m ${durationSeconds}s`);
        console.log(`📊 Tasa promedio: ${Math.round(this.migrationStats.cardsMigrated / (duration / 1000))} cartas/segundo`);
        console.log('==================================\n');
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async close() {
        this.isRunning = false;
        await this.db.close();
        await this.searchEngine.close();
    }
}

module.exports = CompleteDatabaseMigrator;

// Si se ejecuta directamente, iniciar migración
if (require.main === module) {
    const migrator = new CompleteDatabaseMigrator();
    
    // Manejo de señales para cierre graceful
    process.on('SIGINT', async () => {
        console.log('\n🛑 Recibida señal SIGINT, guardando progreso...');
        migrator.printProgress();
        await migrator.close();
        process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
        console.log('\n🛑 Recibida señal SIGTERM, guardando progreso...');
        migrator.printProgress();
        await migrator.close();
        process.exit(0);
    });
    
    migrator.init()
        .then(() => migrator.migrateCompleteDatabase())
        .then(() => migrator.close())
        .catch(error => {
            console.error('💥 Error fatal en migración completa:', error);
            migrator.printProgress();
            process.exit(1);
        });
}