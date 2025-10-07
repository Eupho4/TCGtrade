/**
 * Servicio para la API de Pokémon TCG
 */

import { API_CONFIG } from '../constants/config.js';
import { showError, showInfo } from '../utils/notifications.js';

class PokemonAPIService {
    constructor() {
        this.cache = new Map();
        this.requestQueue = [];
        this.isProcessingQueue = false;
    }

    /**
     * Realiza una petición a la API con manejo de cola y cache
     */
    async makeRequest(endpoint, params = {}) {
        const cacheKey = `${endpoint}_${JSON.stringify(params)}`;
        
        // Verificar cache
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < API_CONFIG.CACHE_DURATION) {
                console.log('📦 Datos obtenidos del cache');
                return { success: true, data: cached.data };
            }
        }

        // Añadir a cola de requests
        return new Promise((resolve) => {
            this.requestQueue.push({
                endpoint,
                params,
                resolve,
                cacheKey
            });
            this.processQueue();
        });
    }

    /**
     * Procesa la cola de requests con rate limiting
     */
    async processQueue() {
        if (this.isProcessingQueue || this.requestQueue.length === 0) return;
        
        this.isProcessingQueue = true;
        
        while (this.requestQueue.length > 0) {
            const request = this.requestQueue.shift();
            
            try {
                const result = await this.executeRequest(request.endpoint, request.params);
                
                // Guardar en cache
                this.cache.set(request.cacheKey, {
                    data: result,
                    timestamp: Date.now()
                });
                
                request.resolve({ success: true, data: result });
            } catch (error) {
                console.error('❌ Error en request:', error);
                request.resolve({ success: false, error: error.message });
            }
            
            // Rate limiting
            if (this.requestQueue.length > 0) {
                await new Promise(resolve => setTimeout(resolve, API_CONFIG.RATE_LIMIT_DELAY));
            }
        }
        
        this.isProcessingQueue = false;
    }

    /**
     * Ejecuta la petición HTTP real
     */
    async executeRequest(endpoint, params) {
        const url = new URL(`${API_CONFIG.POKEMON_TCG_BASE_URL}${endpoint}`, window.location.origin);
        
        // Añadir parámetros
        Object.keys(params).forEach(key => {
            if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
                url.searchParams.append(key, params[key]);
            }
        });

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    }

    /**
     * Busca cartas con filtros
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
     * Obtiene todos los sets disponibles
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
     * Busca cartas por nombre con debounce
     */
    searchCardsDebounced(query, filters = {}, delay = 500) {
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
     * Limpia el cache
     */
    clearCache() {
        this.cache.clear();
        console.log('🗑️ Cache limpiado');
    }

    /**
     * Obtiene estadísticas del cache
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}

// Crear instancia singleton
const pokemonAPIService = new PokemonAPIService();

export default pokemonAPIService;