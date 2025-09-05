const LocalCardDatabase = require('./local-database');
const LocalSearchEngine = require('./local-search-engine');

class UltraRobustMigration {
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
            lastSuccessfulPage: 0,
            skippedPages: [],
            retryCount: 0
        };
        this.isRunning = true;
        this.maxRetries = 15; // Más reintentos
        this.timeoutMs = 90000; // 90 segundos de timeout
        this.currentPage = 65; // Empezar desde página 65 (aproximadamente donde se quedó)
    }

    async init() {
        console.log('🗄️ Inicializando migración ULTRA-ROBUSTA...');
        await this.db.init();
        await this.searchEngine.init();
        console.log('✅ Migración ultra-robusta inicializada');
    }

    async migrateUltraRobustly() {
        try {
            console.log('🚀 Iniciando MIGRACIÓN ULTRA-ROBUSTA de la API de Pokémon TCG...');
            console.log('🛡️ Configurado para ser EXTREMADAMENTE persistente');
            console.log('⚡ Timeouts: 90 segundos, Reintentos: 15, Páginas: desde 65');
            this.migrationStats.startTime = new Date();
            
            // 1. Migrar TODOS los sets primero
            console.log('\n📚 FASE 1: Migrando TODOS los sets...');
            await this.migrateAllSetsUltraRobustly();
            
            // 2. Migrar TODAS las cartas restantes
            console.log('\n🎴 FASE 2: Migrando TODAS las cartas restantes...');
            await this.migrateAllCardsUltraRobustly();
            
            // 3. Crear índices optimizados
            console.log('\n🔍 FASE 3: Creando índices optimizados...');
            await this.createOptimizedIndexes();
            
            // 4. Verificar integridad completa
            console.log('\n🔍 FASE 4: Verificando integridad completa...');
            await this.verifyCompleteIntegrity();
            
            this.migrationStats.endTime = new Date();
            this.printFinalStats();
            
            console.log('🎉 MIGRACIÓN ULTRA-ROBUSTA COMPLETADA');
            
        } catch (error) {
            console.error('❌ Error en migración ultra-robusta:', error);
            this.printProgress();
            throw error;
        }
    }

    async migrateAllSetsUltraRobustly() {
        try {
            console.log('🌐 Obteniendo TODOS los sets con manejo ULTRA-ROBUSTO...');
            
            let page = 1;
            let hasMore = true;
            let totalSets = 0;
            let consecutiveErrors = 0;
            const maxConsecutiveErrors = 10;
            
            while (hasMore && this.isRunning && consecutiveErrors < maxConsecutiveErrors) {
                try {
                    const url = `${this.apiBaseUrl}/sets?page=${page}&pageSize=250`;
                    console.log(`📄 Obteniendo página ${page} de sets...`);
                    
                    const response = await this.fetchWithUltraRobustRetry(url);
                    const data = await response.json();
                    
                    if (data.data && data.data.length > 0) {
                        console.log(`📚 Procesando ${data.data.length} sets de la página ${page}...`);
                        
                        for (const set of data.data) {
                            await this.saveSet(set);
                            totalSets++;
                        }
                        
                        console.log(`✅ ${totalSets} sets migrados hasta ahora`);
                        page++;
                        consecutiveErrors = 0;
                        
                        // Pausa más larga para sets
                        await this.delay(1000);
                    } else {
                        hasMore = false;
                    }
                } catch (error) {
                    consecutiveErrors++;
                    console.error(`❌ Error en página ${page} de sets (${consecutiveErrors}/${maxConsecutiveErrors}):`, error.message);
                    
                    if (consecutiveErrors < maxConsecutiveErrors) {
                        const waitTime = Math.min(30000 * consecutiveErrors, 300000); // Hasta 5 minutos
                        console.log(`⏳ Esperando ${waitTime/1000} segundos antes del siguiente intento...`);
                        await this.delay(waitTime);
                        // No incrementar page, reintentar
                    } else {
                        console.log(`⚠️ Demasiados errores consecutivos en sets, continuando con cartas...`);
                        this.migrationStats.skippedPages.push(`sets-page-${page}`);
                        hasMore = false;
                    }
                }
            }
            
            this.migrationStats.totalSets = totalSets;
            console.log(`✅ ${totalSets} sets migrados correctamente`);
            
        } catch (error) {
            console.error('❌ Error migrando sets:', error);
            throw error;
        }
    }

    async migrateAllCardsUltraRobustly() {
        try {
            console.log('🌐 Obteniendo TODAS las cartas con manejo ULTRA-ROBUSTO...');
            console.log(`📄 Empezando desde página ${this.currentPage}...`);
            
            let page = this.currentPage;
            let hasMore = true;
            let totalCards = 0;
            let batchSize = 15; // Lotes muy pequeños
            let consecutiveErrors = 0;
            const maxConsecutiveErrors = 12;
            
            while (hasMore && this.isRunning && consecutiveErrors < maxConsecutiveErrors) {
                try {
                    const url = `${this.apiBaseUrl}/cards?page=${page}&pageSize=250`;
                    console.log(`📄 Obteniendo página ${page} de cartas...`);
                    
                    const response = await this.fetchWithUltraRobustRetry(url);
                    const data = await response.json();
                    
                    if (data.data && data.data.length > 0) {
                        console.log(`🎴 Procesando ${data.data.length} cartas de la página ${page}...`);
                        
                        // Procesar en lotes muy pequeños
                        for (let i = 0; i < data.data.length; i += batchSize) {
                            if (!this.isRunning) break;
                            
                            const batch = data.data.slice(i, i + batchSize);
                            await this.processCardBatchUltraRobustly(batch);
                            totalCards += batch.length;
                            
                            const progress = ((page - 65) / 15) * 100; // Estimación de 15 páginas más
                            console.log(`🎴 Cartas: ${totalCards} migradas - Página ${page} - Progreso: ${progress.toFixed(1)}%`);
                            
                            // Pausa entre lotes
                            await this.delay(300);
                        }
                        
                        this.migrationStats.lastSuccessfulPage = page;
                        page++;
                        consecutiveErrors = 0;
                        
                        // Pausa más larga entre páginas
                        await this.delay(2000);
                    } else {
                        hasMore = false;
                    }
                } catch (error) {
                    consecutiveErrors++;
                    console.error(`❌ Error en página ${page} (intento ${consecutiveErrors}/${maxConsecutiveErrors}):`, error.message);
                    
                    if (consecutiveErrors < maxConsecutiveErrors) {
                        const waitTime = Math.min(60000 * consecutiveErrors, 600000); // Hasta 10 minutos
                        console.log(`⏳ Esperando ${waitTime/1000} segundos antes del siguiente intento...`);
                        await this.delay(waitTime);
                        // No incrementar page, reintentar la misma página
                    } else {
                        console.log(`⚠️ Demasiados errores consecutivos, saltando página ${page}...`);
                        this.migrationStats.skippedPages.push(`cards-page-${page}`);
                        page++; // Saltar esta página y continuar
                        consecutiveErrors = 0;
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

    async processCardBatchUltraRobustly(cards) {
        try {
            for (const card of cards) {
                if (!this.isRunning) break;
                await this.saveCardUltraRobustly(card);
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

    async saveCardUltraRobustly(card) {
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

            console.log('✅ Verificación de integridad completada');
        } catch (error) {
            console.error('❌ Error verificando integridad:', error);
            throw error;
        }
    }

    async fetchWithUltraRobustRetry(url, maxRetries = null) {
        const retries = maxRetries || this.maxRetries;
        
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const headers = {
                    'User-Agent': 'TCGtrade-Ultra-Robust-Migration/1.0',
                    'Accept': 'application/json'
                };

                if (this.apiKey) {
                    headers['X-Api-Key'] = this.apiKey;
                }

                // Timeout ultra-largo
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

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
                this.migrationStats.retryCount++;
                console.log(`⚠️ Intento ${attempt}/${retries} falló: ${error.message}`);
                
                if (attempt === retries) {
                    throw error;
                }
                
                // Backoff exponencial ultra-agresivo
                const delay = Math.min(5000 * Math.pow(2, attempt - 1), 120000); // Hasta 2 minutos
                console.log(`⏳ Esperando ${delay/1000}s antes del siguiente intento...`);
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
        console.log(`🔄 Reintentos: ${this.migrationStats.retryCount}`);
        console.log(`📄 Última página exitosa: ${this.migrationStats.lastSuccessfulPage}`);
        console.log(`⏭️ Páginas saltadas: ${this.migrationStats.skippedPages.length}`);
        console.log(`⏱️ Tiempo transcurrido: ${durationMinutes}m ${durationSeconds}s`);
        console.log('==================\n');
    }

    printFinalStats() {
        const duration = this.migrationStats.endTime - this.migrationStats.startTime;
        const durationMinutes = Math.floor(duration / 60000);
        const durationSeconds = Math.floor((duration % 60000) / 1000);

        console.log('\n🎉 MIGRACIÓN ULTRA-ROBUSTA COMPLETADA');
        console.log('=====================================');
        console.log(`📚 Sets migrados: ${this.migrationStats.setsMigrated}`);
        console.log(`🎴 Cartas migradas: ${this.migrationStats.cardsMigrated}`);
        console.log(`❌ Errores: ${this.migrationStats.errors}`);
        console.log(`🔄 Reintentos: ${this.migrationStats.retryCount}`);
        console.log(`⏭️ Páginas saltadas: ${this.migrationStats.skippedPages.length}`);
        console.log(`⏱️ Tiempo total: ${durationMinutes}m ${durationSeconds}s`);
        console.log(`📊 Tasa promedio: ${Math.round(this.migrationStats.cardsMigrated / (duration / 1000))} cartas/segundo`);
        console.log('=====================================\n');
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

module.exports = UltraRobustMigration;

// Si se ejecuta directamente, iniciar migración
if (require.main === module) {
    const migrator = new UltraRobustMigration();
    
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
        .then(() => migrator.migrateUltraRobustly())
        .then(() => migrator.close())
        .catch(error => {
            console.error('💥 Error fatal en migración ultra-robusta:', error);
            migrator.printProgress();
            process.exit(1);
        });
}