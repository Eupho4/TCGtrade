#!/usr/bin/env node

const sqlite3 = require('sqlite3').verbose();
const https = require('https');

class SetsMigrator {
    constructor() {
        this.apiBaseUrl = 'https://api.pokemontcg.io/v2';
        this.apiKey = process.env.POKEMON_TCG_API_KEY || null;
        this.db = new sqlite3.Database('./data/cards.db');
        this.migrationStats = {
            startTime: new Date(),
            totalSets: 0,
            migratedSets: 0,
            currentPage: 1,
            consecutiveErrors: 0,
            maxConsecutiveErrors: 5,
            maxRetriesPerPage: 10,
            requestTimeout: 30000,
            delayBetweenRequests: 1000,
            delayBetweenRetries: 5000
        };
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async fetchWithRetry(url, maxRetries = 3) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.migrationStats.requestTimeout);

                const response = await fetch(url, {
                    signal: controller.signal,
                    headers: {
                        'User-Agent': 'TCGtrade-Migrator/1.0',
                        ...(this.apiKey && { 'X-Api-Key': this.apiKey })
                    }
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
                const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
                await this.delay(delay);
            }
        }
    }

    async migrateAllSets() {
        console.log('🚀 Iniciando migración de sets...');
        console.log(`📅 Inicio: ${this.migrationStats.startTime.toISOString()}`);
        
        let page = 1;
        let hasMore = true;
        let totalSets = 0;

        while (hasMore && this.migrationStats.consecutiveErrors < this.migrationStats.maxConsecutiveErrors) {
            try {
                const url = `${this.apiBaseUrl}/sets?page=${page}&pageSize=250`;
                console.log(`📄 Obteniendo página ${page} de sets...`);
                
                const response = await this.fetchWithRetry(url, this.migrationStats.maxRetriesPerPage);
                const data = await response.json();
                
                if (data.data && data.data.length > 0) {
                    console.log(`📦 Procesando ${data.data.length} sets de la página ${page}...`);
                    
                    for (const set of data.data) {
                        await this.processSet(set);
                        totalSets++;
                        this.migrationStats.migratedSets++;
                        
                        if (totalSets % 10 === 0) {
                            console.log(`📦 Sets: ${totalSets} migrados`);
                        }
                    }
                    
                    page++;
                    this.migrationStats.consecutiveErrors = 0;
                    await this.delay(this.migrationStats.delayBetweenRequests);
                } else {
                    hasMore = false;
                }
            } catch (error) {
                this.migrationStats.consecutiveErrors++;
                console.error(`❌ Error en página ${page} (intento ${this.migrationStats.consecutiveErrors}/${this.migrationStats.maxConsecutiveErrors}):`, error.message);
                
                if (this.migrationStats.consecutiveErrors < this.migrationStats.maxConsecutiveErrors) {
                    console.log(`⏳ Esperando ${this.migrationStats.delayBetweenRetries/1000} segundos antes del siguiente intento...`);
                    await this.delay(this.migrationStats.delayBetweenRetries);
                } else {
                    console.log(`⚠️ Demasiados errores consecutivos, continuando con los sets migrados hasta ahora...`);
                    hasMore = false;
                }
            }
        }

        this.migrationStats.endTime = new Date();
        this.migrationStats.totalSets = totalSets;
        
        console.log('\n🎉 Migración de sets completada!');
        console.log(`📊 Estadísticas finales:`);
        console.log(`   - Sets migrados: ${this.migrationStats.migratedSets}`);
        console.log(`   - Tiempo total: ${this.migrationStats.endTime - this.migrationStats.startTime}ms`);
        console.log(`   - Errores consecutivos: ${this.migrationStats.consecutiveErrors}`);
        
        await this.createOptimizedIndexes();
    }

    async processSet(set) {
        return new Promise((resolve, reject) => {
            const setData = {
                id: set.id,
                name: set.name,
                series: set.series,
                total: set.total,
                legalities: JSON.stringify(set.legalities || {}),
                ptcgo_code: set.ptcgoCode || null,
                release_date: set.releaseDate || null,
                updated_at: set.updatedAt || null,
                images: JSON.stringify(set.images || {}),
                last_updated: new Date().toISOString()
            };

            const sql = `
                INSERT OR REPLACE INTO sets (
                    id, name, series, total, legalities, ptcgo_code, 
                    release_date, updated_at, images, last_updated
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            this.db.run(sql, [
                setData.id, setData.name, setData.series, setData.total,
                setData.legalities, setData.ptcgo_code, setData.release_date,
                setData.updated_at, setData.images, setData.last_updated
            ], function(err) {
                if (err) {
                    console.error(`❌ Error insertando set ${set.name}:`, err.message);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    async createOptimizedIndexes() {
        console.log('🔧 Creando índices optimizados para sets...');
        
        const indexes = [
            'CREATE INDEX IF NOT EXISTS idx_sets_name ON sets(name)',
            'CREATE INDEX IF NOT EXISTS idx_sets_series ON sets(series)',
            'CREATE INDEX IF NOT EXISTS idx_sets_release_date ON sets(release_date)',
            'CREATE INDEX IF NOT EXISTS idx_sets_total ON sets(total)'
        ];

        for (const indexSql of indexes) {
            await new Promise((resolve, reject) => {
                this.db.run(indexSql, (err) => {
                    if (err) {
                        console.error(`❌ Error creando índice:`, err.message);
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        }

        console.log('✅ Índices de sets creados correctamente');
    }

    async close() {
        return new Promise((resolve) => {
            this.db.close((err) => {
                if (err) {
                    console.error('❌ Error cerrando base de datos:', err.message);
                } else {
                    console.log('✅ Base de datos cerrada correctamente');
                }
                resolve();
            });
        });
    }
}

// Ejecutar migración
async function main() {
    const migrator = new SetsMigrator();
    
    try {
        await migrator.migrateAllSets();
    } catch (error) {
        console.error('❌ Error en migración:', error);
    } finally {
        await migrator.close();
    }
}

if (require.main === module) {
    main();
}

module.exports = SetsMigrator;