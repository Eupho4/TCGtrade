/**
 * Servicio para la API de Pokémon TCG - Optimizado
 */

import { API_CONFIG, PERFORMANCE_CONFIG } from '../constants/config.js';
import { showError, showInfo } from '../utils/notifications.js';

class PokemonAPIService {
    constructor() {
        this.cache = new Map();
        this.requestQueue = [];
        this.isProcessingQueue = false;
        this.concurrentRequests = 0;
        this.requestHistory = [];
        this.retryAttempts = new Map();
    }

    /**
     * Realiza una petición a la API con manejo de cola, cache y rate limiting optimizado
     */
    async makeRequest(endpoint, params = {}) {
        const cacheKey = `${endpoint}_${JSON.stringify(params)}`;
        
        // Verificar cache
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < API_CONFIG.CACHE_DURATION) {
                console.log('📦 Datos obtenidos del cache');
                return { success: true, data: cached.data };
            } else {
                // Cache expirado, remover
                this.cache.delete(cacheKey);
            }
        }

        // Verificar límite de cache
        if (this.cache.size >= API_CONFIG.MAX_CACHE_SIZE) {
            this.cleanOldestCache();
        }

        // Añadir a cola de requests
        return new Promise((resolve) => {
            this.requestQueue.push({
                endpoint,
                params,
                resolve,
                cacheKey,
                timestamp: Date.now()
            });
            this.processQueue();
        });
    }

    /**
     * Procesa la cola de requests con rate limiting y control de concurrencia
     */
    async processQueue() {
        if (this.isProcessingQueue || this.requestQueue.length === 0) return;
        
        this.isProcessingQueue = true;
        
        while (this.requestQueue.length > 0 && this.concurrentRequests < PERFORMANCE_CONFIG.MAX_CONCURRENT_REQUESTS) {
            const request = this.requestQueue.shift();
            this.concurrentRequests++;
            
            this.executeRequest(request).finally(() => {
                this.concurrentRequests--;
            });
            
            // Rate limiting
            if (this.requestQueue.length > 0) {
                await new Promise(resolve => setTimeout(resolve, API_CONFIG.RATE_LIMIT_DELAY));
            }
        }
        
        this.isProcessingQueue = false;
    }

    /**
     * Ejecuta la petición HTTP real con reintentos
     */
    async executeRequest(request) {
        const { endpoint, params, resolve, cacheKey } = request;
        const maxRetries = API_CONFIG.RETRY_ATTEMPTS;
        let lastError = null;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const result = await this.performHttpRequest(endpoint, params);
                
                // Guardar en cache
                this.cache.set(cacheKey, {
                    data: result,
                    timestamp: Date.now()
                });
                
                // Registrar en historial
                this.requestHistory.push({
                    endpoint,
                    timestamp: Date.now(),
                    success: true
                });
                
                resolve({ success: true, data: result });
                return;
                
            } catch (error) {
                lastError = error;
                console.error(`❌ Intento ${attempt} fallido para ${endpoint}:`, error);
                
                if (attempt < maxRetries) {
                    // Esperar antes del siguiente intento
                    const delay = API_CONFIG.RETRY_DELAY * Math.pow(2, attempt - 1); // Exponential backoff
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        
        // Todos los intentos fallaron
        this.requestHistory.push({
            endpoint,
            timestamp: Date.now(),
            success: false,
            error: lastError.message
        });
        
        resolve({ success: false, error: lastError.message });
    }

    /**
     * Realiza la petición HTTP real
     */
    async performHttpRequest(endpoint, params) {
        const url = new URL(`${API_CONFIG.POKEMON_TCG_BASE_URL}${endpoint}`, window.location.origin);
        
        // Añadir parámetros
        Object.keys(params).forEach(key => {
            if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
                url.searchParams.append(key, params[key]);
            }
        });

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), PERFORMANCE_CONFIG.REQUEST_TIMEOUT);

        try {
            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'TCGtrade-App/1.0'
                },
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } finally {
            clearTimeout(timeoutId);
        }
    }

    /**
     * Busca cartas con filtros optimizados
     */
    async searchCards(query = '', filters = {}) {
        try {
            const params = {
                q: query,
                page: filters.page || 1,
                pageSize: filters.pageSize || 20
            };

            // Añadir filtros específicos
            if (filters.set) params.set = filters.set;
            if (filters.series) params.series = filters.series;
            if (filters.type) params.type = filters.type;
            if (filters.rarity) params.rarity = filters.rarity;
            if (filters.hp) params.hp = filters.hp;
            if (filters.weakness) params.weakness = filters.weakness;
            if (filters.resistance) params.resistance = filters.resistance;
            if (filters.retreatCost) params.retreatCost = filters.retreatCost;

            const result = await this.makeRequest('/cards', params);
            
            if (result.success) {
                console.log(`✅ ${result.data.data.length} cartas encontradas`);
                return {
                    success: true,
                    cards: result.data.data,
                    totalCount: result.data.totalCount,
                    page: result.data.page,
                    pageSize: result.data.pageSize,
                    hasMore: result.data.page * result.data.pageSize < result.data.totalCount
                };
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('❌ Error al buscar cartas:', error);
            showError('Error al buscar cartas. Intenta nuevamente.');
            return { success: false, error: error.message };
        }
    }

    /**
     * Obtiene todos los sets disponibles con cache persistente
     */
    async getAllSets() {
        try {
            const result = await this.makeRequest('/sets');
            
            if (result.success) {
                console.log(`✅ ${result.data.data.length} sets cargados`);
                return {
                    success: true,
                    sets: result.data.data
                };
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('❌ Error al cargar sets:', error);
            showError('Error al cargar expansiones. Intenta nuevamente.');
            return { success: false, error: error.message };
        }
    }

    /**
     * Obtiene los tipos de cartas
     */
    async getCardTypes() {
        try {
            const result = await this.makeRequest('/types');
            
            if (result.success) {
                return {
                    success: true,
                    types: result.data.data
                };
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('❌ Error al cargar tipos:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Obtiene los supertipos
     */
    async getSupertypes() {
        try {
            const result = await this.makeRequest('/supertypes');
            
            if (result.success) {
                return {
                    success: true,
                    supertypes: result.data.data
                };
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('❌ Error al cargar supertipos:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Obtiene los subtipos
     */
    async getSubtypes() {
        try {
            const result = await this.makeRequest('/subtypes');
            
            if (result.success) {
                return {
                    success: true,
                    subtypes: result.data.data
                };
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('❌ Error al cargar subtipos:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Obtiene una carta específica por ID
     */
    async getCardById(cardId) {
        try {
            const result = await this.makeRequest(`/cards/${cardId}`);
            
            if (result.success) {
                return {
                    success: true,
                    card: result.data.data
                };
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('❌ Error al cargar carta:', error);
            showError('Error al cargar los detalles de la carta');
            return { success: false, error: error.message };
        }
    }

    /**
     * Obtiene cartas de un set específico
     */
    async getCardsBySet(setId, page = 1, pageSize = 20) {
        try {
            const result = await this.makeRequest('/cards', {
                set: setId,
                page,
                pageSize
            });
            
            if (result.success) {
                return {
                    success: true,
                    cards: result.data.data,
                    totalCount: result.data.totalCount,
                    page: result.data.page,
                    pageSize: result.data.pageSize,
                    hasMore: result.data.page * result.data.pageSize < result.data.totalCount
                };
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('❌ Error al cargar cartas del set:', error);
            showError('Error al cargar cartas de la expansión');
            return { success: false, error: error.message };
        }
    }

    /**
     * Busca cartas por nombre con debounce optimizado
     */
    searchCardsDebounced(query, filters = {}, delay = 300) {
        return new Promise((resolve) => {
            // Cancelar búsqueda anterior si existe
            if (this.searchTimeout) {
                clearTimeout(this.searchTimeout);
            }
            
            this.searchTimeout = setTimeout(async () => {
                const result = await this.searchCards(query, filters);
                resolve(result);
            }, delay);
        });
    }

    /**
     * Prefetch de datos para mejor performance
     */
    async prefetchData() {
        try {
            const [setsResult, typesResult] = await Promise.all([
                this.getAllSets(),
                this.getCardTypes()
            ]);
            
            if (setsResult.success && typesResult.success) {
                console.log('✅ Datos prefetch completados');
                return { success: true };
            }
        } catch (error) {
            console.error('❌ Error en prefetch:', error);
        }
    }

    /**
     * Limpia el cache eliminando las entradas más antiguas
     */
    cleanOldestCache() {
        const entries = Array.from(this.cache.entries());
        entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
        
        // Eliminar el 20% más antiguo
        const toRemove = Math.ceil(entries.length * 0.2);
        for (let i = 0; i < toRemove; i++) {
            this.cache.delete(entries[i][0]);
        }
        
        console.log(`🧹 Cache limpiado: ${toRemove} entradas eliminadas`);
    }

    /**
     * Limpia todo el cache
     */
    clearCache() {
        this.cache.clear();
        console.log('🗑️ Cache limpiado completamente');
    }

    /**
     * Obtiene estadísticas del servicio
     */
    getStats() {
        const now = Date.now();
        const recentRequests = this.requestHistory.filter(req => 
            now - req.timestamp < 60000 // Último minuto
        );
        
        return {
            cacheSize: this.cache.size,
            queueLength: this.requestQueue.length,
            concurrentRequests: this.concurrentRequests,
            recentRequests: recentRequests.length,
            successRate: recentRequests.length > 0 ? 
                recentRequests.filter(req => req.success).length / recentRequests.length : 0
        };
    }

    /**
     * Obtiene estadísticas del cache
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys()),
            oldestEntry: Math.min(...Array.from(this.cache.values()).map(v => v.timestamp)),
            newestEntry: Math.max(...Array.from(this.cache.values()).map(v => v.timestamp))
        };
    }
}

// Crear instancia singleton
const pokemonAPIService = new PokemonAPIService();

export default pokemonAPIService;