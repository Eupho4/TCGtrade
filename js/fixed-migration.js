const LocalCardDatabase = require('./local-database');

class FixedMigration {
    constructor() {
        this.db = new LocalCardDatabase();
        this.apiBaseUrl = 'https://api.pokemontcg.io/v2';
        this.currentPage = 65; // Continuar desde donde se quedó
        this.batchSize = 20;
        this.maxRetries = 10;
        this.timeout = 60000; // 1 minuto
    }

    async init() {
        console.log('🗄️ Inicializando migración corregida...');
        await this.db.init();
        console.log('✅ Base de datos inicializada');
    }

    async fetchWithRetry(url, maxRetries = 10) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`📡 Intento ${attempt}/${maxRetries}: ${url}`);
                
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.timeout);
                
                const response = await fetch(url, {
                    signal: controller.signal,
                    headers: {
                        'User-Agent': 'TCGtrade-Migration/1.0'
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
                
                const delay = Math.min(1000 * Math.pow(2, attempt - 1), 30000);
                console.log(`⏳ Esperando ${delay/1000}s antes del siguiente intento...`);
                await this.delay(delay);
            }
        }
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async processCardBatch(cards) {
        for (const card of cards) {
            try {
                await this.db.addCard({
                    id: card.id,
                    name: card.name,
                    set_name: card.set?.name || '',
                    set_id: card.set?.id || '',
                    series: card.set?.series || '',
                    number: card.number || '',
                    rarity: card.rarity || '',
                    types: card.types ? card.types.join(',') : '',
                    subtypes: card.subtypes ? card.subtypes.join(',') : '',
                    images: JSON.stringify(card.images || {}),
                    tcgplayer: JSON.stringify(card.tcgplayer || {}),
                    cardmarket: JSON.stringify(card.cardmarket || {})
                });
            } catch (error) {
                console.log(`⚠️ Error procesando carta ${card.id}: ${error.message}`);
            }
        }
    }

    async migrateCards() {
        console.log('🎴 Iniciando migración de cartas...');
        let page = this.currentPage;
        let hasMore = true;
        let totalCards = 0;
        let consecutiveErrors = 0;
        const maxConsecutiveErrors = 5;

        while (hasMore && consecutiveErrors < maxConsecutiveErrors) {
            try {
                const url = `${this.apiBaseUrl}/cards?page=${page}&pageSize=250`;
                console.log(`\n📄 Procesando página ${page}...`);
                
                const response = await this.fetchWithRetry(url);
                const data = await response.json();
                
                if (data.data && data.data.length > 0) {
                    console.log(`🎴 Procesando ${data.data.length} cartas...`);
                    
                    // Procesar en lotes pequeños
                    for (let i = 0; i < data.data.length; i += this.batchSize) {
                        const batch = data.data.slice(i, i + this.batchSize);
                        await this.processCardBatch(batch);
                        totalCards += batch.length;
                        console.log(`✅ Lote procesado: ${totalCards} cartas totales`);
                        await this.delay(1000); // 1 segundo entre lotes
                    }
                    
                    page++;
                    consecutiveErrors = 0;
                    await this.delay(2000); // 2 segundos entre páginas
                } else {
                    hasMore = false;
                    console.log('✅ No hay más cartas para migrar');
                }
            } catch (error) {
                consecutiveErrors++;
                console.error(`❌ Error en página ${page} (${consecutiveErrors}/${maxConsecutiveErrors}): ${error.message}`);
                
                if (consecutiveErrors < maxConsecutiveErrors) {
                    console.log('⏳ Esperando 10 segundos antes del siguiente intento...');
                    await this.delay(10000);
                } else {
                    console.log('⚠️ Demasiados errores consecutivos, deteniendo migración');
                    hasMore = false;
                }
            }
        }

        console.log(`\n🎉 Migración completada! Total de cartas procesadas: ${totalCards}`);
    }

    async start() {
        try {
            await this.init();
            await this.migrateCards();
        } catch (error) {
            console.error('❌ Error fatal en migración:', error);
        } finally {
            // 🔥 CRÍTICO: Cerrar la base de datos para confirmar transacciones
            console.log('🔒 Cerrando base de datos...');
            await this.db.close();
            console.log('✅ Base de datos cerrada correctamente');
        }
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    const migration = new FixedMigration();
    migration.start().catch(console.error);
}

module.exports = FixedMigration;