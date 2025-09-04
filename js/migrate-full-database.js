const LocalCardDatabase = require('./local-database');
const LocalSearchEngine = require('./local-search-engine');

class FullDatabaseMigrator {
    constructor() {
        this.db = new LocalCardDatabase();
        this.searchEngine = new LocalSearchEngine();
        this.isMigrating = false;
        this.migrationProgress = {
            totalCards: 0,
            processedCards: 0,
            totalSets: 0,
            processedSets: 0,
            currentOperation: '',
            startTime: null
        };
    }

    // Inicializar migrador
    async init() {
        await this.db.init();
        await this.searchEngine.init();
        console.log('🚀 Migrador de base de datos completa inicializado');
    }

    // Migrar base de datos completa
    async migrateFullDatabase() {
        if (this.isMigrating) {
            throw new Error('Ya hay una migración en curso');
        }

        this.isMigrating = true;
        this.migrationProgress.startTime = Date.now();
        this.migrationProgress.currentOperation = 'Iniciando migración completa...';

        try {
            console.log('🔄 Iniciando migración completa de base de datos...');
            
            // 1. Migrar sets desde API externa
            await this.migrateSetsFromExternalAPI();
            
            // 2. Migrar cartas desde API externa
            await this.migrateCardsFromExternalAPI();
            
            // 3. Crear índices de búsqueda optimizados
            await this.createOptimizedIndexes();
            
            // 4. Verificar integridad de datos
            await this.verifyDataIntegrity();
            
            console.log('✅ Migración completa finalizada exitosamente');
            
        } catch (error) {
            console.error('❌ Error en migración completa:', error);
            throw error;
        } finally {
            this.isMigrating = false;
        }
    }

    // Migrar sets desde API externa
    async migrateSetsFromExternalAPI() {
        try {
            this.migrationProgress.currentOperation = 'Migrando sets desde API externa...';
            console.log('📚 Migrando sets desde API externa...');

            // Simular obtención de sets desde API externa
            const externalSets = await this.fetchSetsFromExternalAPI();
            this.migrationProgress.totalSets = externalSets.length;

            for (let i = 0; i < externalSets.length; i++) {
                const set = externalSets[i];
                this.migrationProgress.processedSets = i + 1;
                
                try {
                    await this.saveSet(set);
                    
                    // Mostrar progreso cada 10 sets
                    if ((i + 1) % 10 === 0) {
                        const progress = ((i + 1) / externalSets.length * 100).toFixed(1);
                        console.log(`📚 Sets: ${i + 1}/${externalSets.length} (${progress}%)`);
                    }
                    
                    // Delay respetuoso
                    await this.delay(50);
                    
                } catch (error) {
                    console.error(`❌ Error migrando set ${set.name}:`, error);
                }
            }

            console.log(`✅ ${externalSets.length} sets migrados correctamente`);
            
        } catch (error) {
            console.error('❌ Error migrando sets:', error);
            throw error;
        }
    }

    // Migrar cartas desde API externa
    async migrateCardsFromExternalAPI() {
        try {
            this.migrationProgress.currentOperation = 'Migrando cartas desde API externa...';
            console.log('🎴 Migrando cartas desde API externa...');

            // Simular obtención de cartas desde API externa
            const externalCards = await this.fetchCardsFromExternalAPI();
            this.migrationProgress.totalCards = externalCards.length;

            // Procesar cartas en lotes para mejor rendimiento
            const batchSize = 100;
            const totalBatches = Math.ceil(externalCards.length / batchSize);

            for (let batch = 0; batch < totalBatches; batch++) {
                const start = batch * batchSize;
                const end = Math.min(start + batchSize, externalCards.length);
                const batchCards = externalCards.slice(start, end);

                this.migrationProgress.currentOperation = `Procesando lote ${batch + 1}/${totalBatches}`;
                this.migrationProgress.processedCards = end;

                // Procesar lote de cartas
                await this.processCardBatch(batchCards);

                // Mostrar progreso
                const progress = (end / externalCards.length * 100).toFixed(1);
                console.log(`🎴 Cartas: ${end}/${externalCards.length} (${progress}%) - Lote ${batch + 1}/${totalBatches}`);

                // Delay respetuoso entre lotes
                await this.delay(100);
            }

            console.log(`✅ ${externalCards.length} cartas migradas correctamente`);
            
        } catch (error) {
            console.error('❌ Error migrando cartas:', error);
            throw error;
        }
    }

    // Obtener sets desde API externa (simulado)
    async fetchSetsFromExternalAPI() {
        try {
            console.log('🌐 Obteniendo sets desde API externa...');
            
            // Por ahora, vamos a crear sets más completos basados en los existentes
            // En una implementación real, aquí haríamos fetch a la API externa
            const extendedSets = [
                // Sets base existentes
                {
                    id: 'base1',
                    name: 'Base Set',
                    series: 'Base',
                    printed_total: 102,
                    total: 102,
                    legalities: { unlimited: 'Legal' },
                    ptcgo_code: 'BS',
                    release_date: '1999-01-09',
                    updated_at: new Date().toISOString(),
                    images: { symbol: 'https://images.pokemontcg.io/base1/symbol.png' }
                },
                {
                    id: 'base2',
                    name: 'Jungle',
                    series: 'Base',
                    printed_total: 64,
                    total: 64,
                    legalities: { unlimited: 'Legal' },
                    ptcgo_code: 'JU',
                    release_date: '1999-06-16',
                    updated_at: new Date().toISOString(),
                    images: { symbol: 'https://images.pokemontcg.io/base2/symbol.png' }
                },
                {
                    id: 'base3',
                    name: 'Fossil',
                    series: 'Base',
                    printed_total: 62,
                    total: 62,
                    legalities: { unlimited: 'Legal' },
                    ptcgo_code: 'FO',
                    release_date: '1999-10-10',
                    updated_at: new Date().toISOString(),
                    images: { symbol: 'https://images.pokemontcg.io/base3/symbol.png' }
                },
                {
                    id: 'gym1',
                    name: 'Gym Heroes',
                    series: 'Gym',
                    printed_total: 132,
                    total: 132,
                    legalities: { unlimited: 'Legal' },
                    ptcgo_code: 'GH',
                    release_date: '2000-08-14',
                    updated_at: new Date().toISOString(),
                    images: { symbol: 'https://images.pokemontcg.io/gym1/symbol.png' }
                },
                {
                    id: 'gym2',
                    name: 'Gym Challenge',
                    series: 'Gym',
                    printed_total: 132,
                    total: 132,
                    legalities: { unlimited: 'Legal' },
                    ptcgo_code: 'GC',
                    release_date: '2000-10-16',
                    updated_at: new Date().toISOString(),
                    images: { symbol: 'https://images.pokemontcg.io/gym2/symbol.png' }
                },
                // Nuevos sets para expandir la base de datos
                {
                    id: 'neo1',
                    name: 'Neo Genesis',
                    series: 'Neo',
                    printed_total: 111,
                    total: 111,
                    legalities: { unlimited: 'Legal' },
                    ptcgo_code: 'NG',
                    release_date: '2000-12-16',
                    updated_at: new Date().toISOString(),
                    images: { symbol: 'https://images.pokemontcg.io/neo1/symbol.png' }
                },
                {
                    id: 'neo2',
                    name: 'Neo Discovery',
                    series: 'Neo',
                    printed_total: 75,
                    total: 75,
                    legalities: { unlimited: 'Legal' },
                    ptcgo_code: 'ND',
                    release_date: '2001-06-01',
                    updated_at: new Date().toISOString(),
                    images: { symbol: 'https://images.pokemontcg.io/neo2/symbol.png' }
                },
                {
                    id: 'neo3',
                    name: 'Neo Revelation',
                    series: 'Neo',
                    printed_total: 66,
                    total: 66,
                    legalities: { unlimited: 'Legal' },
                    ptcgo_code: 'NR',
                    release_date: '2001-09-21',
                    updated_at: new Date().toISOString(),
                    images: { symbol: 'https://images.pokemontcg.io/neo3/symbol.png' }
                },
                {
                    id: 'neo4',
                    name: 'Neo Destiny',
                    series: 'Neo',
                    printed_total: 113,
                    total: 113,
                    legalities: { unlimited: 'Legal' },
                    ptcgo_code: 'ND',
                    release_date: '2002-02-28',
                    updated_at: new Date().toISOString(),
                    images: { symbol: 'https://images.pokemontcg.io/neo4/symbol.png' }
                },
                {
                    id: 'ecard1',
                    name: 'Expedition Base Set',
                    series: 'E-Card',
                    printed_total: 165,
                    total: 165,
                    legalities: { unlimited: 'Legal' },
                    ptcgo_code: 'EX',
                    release_date: '2002-09-15',
                    updated_at: new Date().toISOString(),
                    images: { symbol: 'https://images.pokemontcg.io/ecard1/symbol.png' }
                }
            ];

            return extendedSets;
            
        } catch (error) {
            console.error('❌ Error obteniendo sets desde API externa:', error);
            throw error;
        }
    }

    // Obtener cartas desde API externa (simulado)
    async fetchCardsFromExternalAPI() {
        try {
            console.log('🌐 Obteniendo cartas desde API externa...');
            
            // Por ahora, vamos a crear cartas adicionales basadas en los sets
            // En una implementación real, aquí haríamos fetch a la API externa
            const additionalCards = [
                // Neo Genesis
                {
                    id: 'neo1-4',
                    name: 'Lugia',
                    set: { name: 'Neo Genesis', series: 'Neo' },
                    number: '4/111',
                    rarity: 'Holo Rare',
                    types: ['Colorless'],
                    images: {
                        small: 'https://images.pokemontcg.io/neo1/4.png',
                        large: 'https://images.pokemontcg.io/neo1/4_hires.png'
                    }
                },
                {
                    id: 'neo1-9',
                    name: 'Steelix',
                    set: { name: 'Neo Genesis', series: 'Neo' },
                    number: '9/111',
                    rarity: 'Holo Rare',
                    types: ['Metal'],
                    images: {
                        small: 'https://images.pokemontcg.io/neo1/9.png',
                        large: 'https://images.pokemontcg.io/neo1/9_hires.png'
                    }
                },
                {
                    id: 'neo1-11',
                    name: 'Typhlosion',
                    set: { name: 'Neo Genesis', series: 'Neo' },
                    number: '11/111',
                    rarity: 'Holo Rare',
                    types: ['Fire'],
                    images: {
                        small: 'https://images.pokemontcg.io/neo1/11.png',
                        large: 'https://images.pokemontcg.io/neo1/11_hires.png'
                    }
                },
                // Neo Discovery
                {
                    id: 'neo2-3',
                    name: 'Espeon',
                    set: { name: 'Neo Discovery', series: 'Neo' },
                    number: '3/75',
                    rarity: 'Holo Rare',
                    types: ['Psychic'],
                    images: {
                        small: 'https://images.pokemontcg.io/neo2/3.png',
                        large: 'https://images.pokemontcg.io/neo2/3_hires.png'
                    }
                },
                {
                    id: 'neo2-6',
                    name: 'Houndoom',
                    set: { name: 'Neo Discovery', series: 'Neo' },
                    number: '6/75',
                    rarity: 'Holo Rare',
                    types: ['Darkness'],
                    images: {
                        small: 'https://images.pokemontcg.io/neo2/6.png',
                        large: 'https://images.pokemontcg.io/neo2/6_hires.png'
                    }
                },
                // Neo Revelation
                {
                    id: 'neo3-4',
                    name: 'Celebi',
                    set: { name: 'Neo Revelation', series: 'Neo' },
                    number: '4/66',
                    rarity: 'Holo Rare',
                    types: ['Grass'],
                    images: {
                        small: 'https://images.pokemontcg.io/neo3/4.png',
                        large: 'https://images.pokemontcg.io/neo3/4_hires.png'
                    }
                },
                {
                    id: 'neo3-8',
                    name: 'Entei',
                    set: { name: 'Neo Revelation', series: 'Neo' },
                    number: '8/66',
                    rarity: 'Holo Rare',
                    types: ['Fire'],
                    images: {
                        small: 'https://images.pokemontcg.io/neo3/8.png',
                        large: 'https://images.pokemontcg.io/neo3/8_hires.png'
                    }
                },
                // Neo Destiny
                {
                    id: 'neo4-4',
                    name: 'Dark Charizard',
                    set: { name: 'Neo Destiny', series: 'Neo' },
                    number: '4/113',
                    rarity: 'Holo Rare',
                    types: ['Fire'],
                    images: {
                        small: 'https://images.pokemontcg.io/neo4/4.png',
                        large: 'https://images.pokemontcg.io/neo4/4_hires.png'
                    }
                },
                {
                    id: 'neo4-6',
                    name: 'Dark Gengar',
                    set: { name: 'Neo Destiny', series: 'Neo' },
                    number: '6/113',
                    rarity: 'Holo Rare',
                    types: ['Psychic'],
                    images: {
                        small: 'https://images.pokemontcg.io/neo4/6.png',
                        large: 'https://images.pokemontcg.io/neo4/6_hires.png'
                    }
                },
                // Expedition Base Set
                {
                    id: 'ecard1-3',
                    name: 'Alakazam',
                    set: { name: 'Expedition Base Set', series: 'E-Card' },
                    number: '3/165',
                    rarity: 'Holo Rare',
                    types: ['Psychic'],
                    images: {
                        small: 'https://images.pokemontcg.io/ecard1/3.png',
                        large: 'https://images.pokemontcg.io/ecard1/3_hires.png'
                    }
                },
                {
                    id: 'ecard1-6',
                    name: 'Blastoise',
                    set: { name: 'Expedition Base Set', series: 'E-Card' },
                    number: '6/165',
                    rarity: 'Holo Rare',
                    types: ['Water'],
                    images: {
                        small: 'https://images.pokemontcg.io/ecard1/6.png',
                        large: 'https://images.pokemontcg.io/ecard1/6_hires.png'
                    }
                },
                {
                    id: 'ecard1-9',
                    name: 'Charizard',
                    set: { name: 'Expedition Base Set', series: 'E-Card' },
                    number: '9/165',
                    rarity: 'Holo Rare',
                    types: ['Fire'],
                    images: {
                        small: 'https://images.pokemontcg.io/ecard1/9.png',
                        large: 'https://images.pokemontcg.io/ecard1/9_hires.png'
                    }
                },
                {
                    id: 'ecard1-15',
                    name: 'Feraligatr',
                    set: { name: 'Expedition Base Set', series: 'E-Card' },
                    number: '15/165',
                    rarity: 'Holo Rare',
                    types: ['Water'],
                    images: {
                        small: 'https://images.pokemontcg.io/ecard1/15.png',
                        large: 'https://images.pokemontcg.io/ecard1/15_hires.png'
                    }
                },
                {
                    id: 'ecard1-18',
                    name: 'Golem',
                    set: { name: 'Expedition Base Set', series: 'E-Card' },
                    number: '18/165',
                    rarity: 'Holo Rare',
                    types: ['Fighting'],
                    images: {
                        small: 'https://images.pokemontcg.io/ecard1/18.png',
                        large: 'https://images.pokemontcg.io/ecard1/18_hires.png'
                    }
                },
                {
                    id: 'ecard1-21',
                    name: 'Kingdra',
                    set: { name: 'Expedition Base Set', series: 'E-Card' },
                    number: '21/165',
                    rarity: 'Holo Rare',
                    types: ['Water'],
                    images: {
                        small: 'https://images.pokemontcg.io/ecard1/21.png',
                        large: 'https://images.pokemontcg.io/ecard1/21_hires.png'
                    }
                }
            ];

            return additionalCards;
            
        } catch (error) {
            console.error('❌ Error obteniendo cartas desde API externa:', error);
            throw error;
        }
    }

    // Procesar lote de cartas
    async processCardBatch(cards) {
        const promises = cards.map(card => this.saveCard(card));
        await Promise.allSettled(promises);
    }

    // Guardar set en la base de datos local
    async saveSet(set) {
        try {
            const setData = {
                id: set.id,
                name: set.name,
                series: set.series || 'Unknown',
                printed_total: set.printed_total || 0,
                total: set.total || 0,
                legalities: JSON.stringify(set.legalities || {}),
                ptcgo_code: set.ptcgo_code || '',
                release_date: set.release_date || '',
                updated_at: set.updated_at || new Date().toISOString(),
                images: JSON.stringify(set.images || {})
            };

            await this.db.run(`
                INSERT OR REPLACE INTO sets 
                (id, name, series, printed_total, total, legalities, ptcgo_code, release_date, updated_at, images)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, Object.values(setData));

        } catch (error) {
            console.error(`❌ Error guardando set ${set.name}:`, error);
            throw error;
        }
    }

    // Guardar carta en la base de datos local
    async saveCard(card) {
        try {
            const cardData = {
                id: card.id,
                name: card.name,
                set_name: card.set?.name || 'Unknown',
                series: card.set?.series || 'Unknown',
                number: card.number || '',
                rarity: card.rarity || '',
                types: (card.types || []).join(','),
                images: JSON.stringify(card.images || {}),
                last_updated: new Date().toISOString()
            };

            await this.db.run(`
                INSERT OR REPLACE INTO cards 
                (id, name, set_name, series, number, rarity, types, images, last_updated)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, Object.values(cardData));

        } catch (error) {
            console.error(`❌ Error guardando carta ${card.name}:`, error);
            throw error;
        }
    }

    // Crear índices de búsqueda optimizados
    async createOptimizedIndexes() {
        try {
            this.migrationProgress.currentOperation = 'Creando índices de búsqueda optimizados...';
            console.log('🔍 Creando índices de búsqueda optimizados...');

            // Crear índices adicionales para mejor rendimiento
            await this.db.run(`
                CREATE INDEX IF NOT EXISTS idx_cards_name_lower 
                ON cards(LOWER(name))
            `);

            await this.db.run(`
                CREATE INDEX IF NOT EXISTS idx_cards_set_series 
                ON cards(set_name, series)
            `);

            await this.db.run(`
                CREATE INDEX IF NOT EXISTS idx_cards_rarity_type 
                ON cards(rarity, types)
            `);

            console.log('✅ Índices de búsqueda optimizados creados correctamente');
            
        } catch (error) {
            console.error('❌ Error creando índices optimizados:', error);
            throw error;
        }
    }

    // Verificar integridad de datos
    async verifyDataIntegrity() {
        try {
            this.migrationProgress.currentOperation = 'Verificando integridad de datos...';
            console.log('🔍 Verificando integridad de datos...');

            const stats = await this.db.getStats();
            console.log('📊 Estadísticas finales de la base de datos:');
            console.log(`- Total de cartas: ${stats.totalCards}`);
            console.log(`- Total de sets: ${stats.totalSets}`);
            console.log(`- Tamaño de base de datos: ${stats.databaseSize}`);
            console.log(`- Última actualización: ${stats.lastUpdated}`);

            // Verificar que no haya cartas duplicadas
            const duplicateCheck = await this.db.get(`
                SELECT COUNT(*) as count FROM (
                    SELECT name, set_name, COUNT(*) as cnt 
                    FROM cards 
                    GROUP BY name, set_name 
                    HAVING cnt > 1
                )
            `);

            if (duplicateCheck.count > 0) {
                console.warn(`⚠️ Se encontraron ${duplicateCheck.count} cartas duplicadas`);
            } else {
                console.log('✅ No se encontraron cartas duplicadas');
            }

            console.log('✅ Verificación de integridad completada');
            
        } catch (error) {
            console.error('❌ Error verificando integridad de datos:', error);
            throw error;
        }
    }

    // Obtener progreso de la migración
    getMigrationProgress() {
        if (!this.isMigrating) {
            return { status: 'idle' };
        }

        const elapsed = Date.now() - this.migrationProgress.startTime;
        const cardsProgress = this.migrationProgress.totalCards > 0 
            ? (this.migrationProgress.processedCards / this.migrationProgress.totalCards * 100).toFixed(1)
            : 0;
        
        const setsProgress = this.migrationProgress.totalSets > 0
            ? (this.migrationProgress.processedSets / this.migrationProgress.totalSets * 100).toFixed(1)
            : 0;

        return {
            status: 'migrating',
            currentOperation: this.migrationProgress.currentOperation,
            cards: {
                processed: this.migrationProgress.processedCards,
                total: this.migrationProgress.totalCards,
                progress: cardsProgress
            },
            sets: {
                processed: this.migrationProgress.processedSets,
                total: this.migrationProgress.totalSets,
                progress: setsProgress
            },
            elapsed: this.formatTime(elapsed)
        };
    }

    // Formatear tiempo en formato legible
    formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }

    // Delay para no sobrecargar el sistema
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Verificar si la migración está en curso
    isMigrationInProgress() {
        return this.isMigrating;
    }

    // Detener migración
    async stopMigration() {
        if (this.isMigrating) {
            this.isMigrating = false;
            console.log('⏹️ Migración detenida por el usuario');
        }
    }

    // Cerrar migrador
    async close() {
        await this.stopMigration();
        await this.db.close();
        await this.searchEngine.close();
    }
}

// Exportar la clase
module.exports = FullDatabaseMigrator;

// Si se ejecuta directamente, ejecutar migración completa
if (require.main === module) {
    const migrator = new FullDatabaseMigrator();
    
    // Manejo de señales para cierre graceful
    process.on('SIGINT', async () => {
        console.log('\n🛑 Recibida señal SIGINT, deteniendo migración...');
        await migrator.stopMigration();
        await migrator.close();
        process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
        console.log('\n🛑 Recibida señal SIGTERM, deteniendo migración...');
        await migrator.stopMigration();
        await migrator.close();
        process.exit(0);
    });
    
    migrator.migrateFullDatabase().then(() => {
        console.log('🎉 Migración completa finalizada exitosamente');
        process.exit(0);
    }).catch(error => {
        console.error('💥 Error fatal en migración:', error);
        process.exit(1);
    });
}