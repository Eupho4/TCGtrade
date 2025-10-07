import PostgresCardDatabase from './postgres-database-es6.js';

class PostgresSearchEngine {
    constructor() {
        this.db = new PostgresCardDatabase();
        this.searchCache = new Map(); // Cache para resultados de búsqueda
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
        this.isInitialized = false;
    }

    async initialize() {
        try {
            if (this.isInitialized) return;
            
            await this.db.initialize();
            this.isInitialized = true;
            console.log('✅ PostgresSearchEngine inicializado');
        } catch (error) {
            console.error('❌ Error al inicializar PostgresSearchEngine:', error);
            throw error;
        }
    }

    async search(query, page = 1, limit = 20) {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            const cacheKey = `${query}_${page}_${limit}`;
            const cached = this.searchCache.get(cacheKey);
            
            if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
                console.log('📦 Resultado obtenido del cache');
                return cached.data;
            }

            const results = await this.db.searchCards(query, page, limit);
            
            // Guardar en cache
            this.searchCache.set(cacheKey, {
                data: results,
                timestamp: Date.now()
            });

            return results;
        } catch (error) {
            console.error('❌ Error en búsqueda PostgreSQL:', error);
            throw error;
        }
    }

    clearCache() {
        this.searchCache.clear();
        console.log('🗑️ Cache de búsqueda limpiado');
    }

    getCacheStats() {
        return {
            size: this.searchCache.size,
            keys: Array.from(this.searchCache.keys())
        };
    }
}

export default PostgresSearchEngine;