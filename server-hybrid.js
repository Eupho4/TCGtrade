require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const https = require('https');
const LocalSearchEngine = require('./js/local-search-engine');
const DataMigrator = require('./js/data-migrator');

class HybridAPIServer {
    constructor() {
        this.app = express();
        this.searchEngine = new LocalSearchEngine();
        this.migrator = new DataMigrator();
        this.port = process.env.PORT || 3000;
        this.isInitialized = false;
        
        // Cache para eBay
        this.ebayCache = new Map();
        this.EBAY_CACHE_TTL_MS = 60 * 1000; // 1 minuto
        
        this.setupMiddleware();
        this.setupRoutes();
    }

    // Función fetch usando https nativo
    async fetch(url) {
        return new Promise((resolve, reject) => {
            https.get(url, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    try {
                        const jsonData = JSON.parse(data);
                        resolve({
                            json: () => Promise.resolve(jsonData),
                            status: res.statusCode,
                            ok: res.statusCode >= 200 && res.statusCode < 300
                        });
                    } catch (error) {
                        reject(error);
                    }
                });
            }).on('error', (error) => {
                reject(error);
            });
        });
    }

    // Configurar middleware
    setupMiddleware() {
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.static('html'));
        
        // Middleware de logging
        this.app.use((req, res, next) => {
            console.log(`🌐 ${req.method} ${req.path} - ${new Date().toISOString()}`);
            next();
        });
    }

    // Configurar rutas
    setupRoutes() {
        // Ruta principal
        this.app.get('/', (req, res) => {
            res.json({
                message: 'TCGtrade Hybrid API Server',
                version: '1.0.0',
                status: 'running',
                searchEngine: 'Local SQLite + eBay Prices',
                performance: 'Ultra Fast'
            });
        });

        // Endpoint de estado del sistema
        this.app.get('/api/status', async (req, res) => {
            try {
                const stats = await this.searchEngine.getSearchStats();
                res.json({
                    status: 'online',
                    timestamp: new Date().toISOString(),
                    searchEngine: 'Local SQLite',
                    totalCards: stats.totalCards,
                    ebayIntegration: !!process.env.EBAY_APP_ID,
                    pokemonApiKey: !!process.env.POKEMON_TCG_API_KEY
                });
            } catch (error) {
                console.error('Error obteniendo estadísticas:', error);
                res.status(500).json({
                    error: 'Error interno del servidor',
                    message: error.message
                });
            }
        });

        // Endpoint de búsqueda de cartas (usando base de datos local)
        this.app.get('/api/pokemontcg/cards', async (req, res) => {
            try {
                const { q: searchTerm, page = 1, pageSize = 20 } = req.query;
                
                if (!searchTerm) {
                    return res.status(400).json({
                        error: 'Parámetro de búsqueda requerido',
                        message: 'Debes especificar un parámetro de búsqueda ?q='
                    });
                }

                const results = await this.searchEngine.searchCards(searchTerm, {
                    page: parseInt(page),
                    pageSize: parseInt(pageSize)
                });

                res.json(results);
            } catch (error) {
                console.error('Error en búsqueda de cartas:', error);
                res.status(500).json({
                    error: 'Error en búsqueda',
                    message: error.message
                });
            }
        });

        // Endpoint de búsqueda en eBay para precios
        this.app.get('/api/ebay/search', async (req, res) => {
            try {
                const appId = process.env.EBAY_APP_ID;
                if (!appId) {
                    return res.status(500).json({
                        error: 'EBAY_APP_ID not configured',
                        message: 'Configura la variable de entorno EBAY_APP_ID en Railway'
                    });
                }

                const query = (req.query.q || '').toString().trim();
                if (!query) {
                    return res.status(400).json({
                        error: 'Missing query',
                        message: 'Debes especificar un parámetro de búsqueda ?q='
                    });
                }

                // Verificar cache
                const cacheKey = `ebay:${query}`;
                const cached = this.ebayCache.get(cacheKey);
                if (cached && (Date.now() - cached.timestamp) < this.EBAY_CACHE_TTL_MS) {
                    return res.json({ ...cached.data, _cached: true });
                }

                // Buscar en eBay
                const params = new URLSearchParams({
                    'OPERATION-NAME': 'findItemsByKeywords',
                    'SERVICE-VERSION': '1.13.0',
                    'SECURITY-APPNAME': appId,
                    'RESPONSE-DATA-FORMAT': 'JSON',
                    'REST-PAYLOAD': 'true',
                    'GLOBAL-ID': 'EBAY-ES',
                    keywords: query,
                    'paginationInput.entriesPerPage': '24',
                    'paginationInput.pageNumber': '1'
                });

                const apiUrl = `https://svcs.ebay.com/services/search/FindingService/v1?${params.toString()}`;
                const response = await this.fetch(apiUrl);
                const data = await response.json();

                // Guardar en cache
                this.ebayCache.set(cacheKey, {
                    data: data,
                    timestamp: Date.now()
                });

                res.json(data);
            } catch (error) {
                console.error('Error en búsqueda de eBay:', error);
                res.status(500).json({
                    error: 'Error en búsqueda de eBay',
                    message: error.message
                });
            }
        });

        // Endpoint para obtener precios de una carta específica
        this.app.get('/api/prices/:cardId', async (req, res) => {
            try {
                const { cardId } = req.params;
                const { condition = 'Near Mint' } = req.query;
                
                // Buscar la carta en la base de datos local
                const card = await this.searchEngine.getCardById(cardId);
                if (!card) {
                    return res.status(404).json({
                        error: 'Carta no encontrada',
                        message: 'La carta especificada no existe en la base de datos'
                    });
                }

                // Buscar precios en eBay
                const searchQuery = `${card.name} pokemon card ${condition}`;
                const ebayResults = await this.searchEbayPrices(searchQuery);

                res.json({
                    cardId,
                    cardName: card.name,
                    condition,
                    prices: ebayResults,
                    lastUpdated: new Date().toISOString()
                });
            } catch (error) {
                console.error('Error obteniendo precios:', error);
                res.status(500).json({
                    error: 'Error al obtener precios',
                    message: error.message
                });
            }
        });

        // Endpoint para actualizar precios de una carta
        this.app.post('/api/prices/:cardId/update', async (req, res) => {
            try {
                const { cardId } = req.params;
                const { cardName, setName } = req.body;
                
                // Buscar la carta
                const card = await this.searchEngine.getCardById(cardId);
                if (!card) {
                    return res.status(404).json({
                        error: 'Carta no encontrada',
                        message: 'La carta especificada no existe en la base de datos'
                    });
                }

                // Buscar precios en eBay
                const searchQuery = `${card.name} pokemon card`;
                const ebayResults = await this.searchEbayPrices(searchQuery);

                res.json({
                    cardId,
                    cardName: card.name,
                    setName: card.set?.name,
                    pricesUpdated: ebayResults.length,
                    prices: ebayResults,
                    lastUpdated: new Date().toISOString()
                });
            } catch (error) {
                console.error('Error actualizando precios:', error);
                res.status(500).json({
                    error: 'Error al actualizar precios',
                    message: error.message
                });
            }
        });

        // Endpoint para actualizar precios de cartas populares
        this.app.get('/api/prices/popular/update', async (req, res) => {
            try {
                const popularCards = ['Pikachu', 'Charizard', 'Blastoise', 'Venusaur'];
                const results = [];

                for (const cardName of popularCards) {
                    try {
                        const searchQuery = `${cardName} pokemon card`;
                        const prices = await this.searchEbayPrices(searchQuery);
                        results.push({
                            cardName,
                            pricesFound: prices.length,
                            prices: prices.slice(0, 3) // Solo los primeros 3
                        });
                    } catch (error) {
                        console.error(`Error actualizando precios para ${cardName}:`, error);
                        results.push({
                            cardName,
                            error: error.message
                        });
                    }
                }

                res.json({
                    message: 'Actualización de precios populares completada',
                    totalCards: popularCards.length,
                    results
                });
            } catch (error) {
                console.error('Error actualizando precios populares:', error);
                res.status(500).json({
                    error: 'Error al actualizar precios populares',
                    message: error.message
                });
            }
        });
    }

    // Método auxiliar para buscar precios en eBay
    async searchEbayPrices(query) {
        const appId = process.env.EBAY_APP_ID;
        console.log('🔍 eBay searchEbayPrices called with query:', query);
        console.log('🔑 EBAY_APP_ID configured:', !!appId);
        console.log('🔑 EBAY_APP_ID value:', appId ? `${appId.substring(0, 10)}...` : 'NOT SET');
        
        if (!appId) {
            return [{
                priceUsd: 0,
                condition: 'N/A',
                source: 'eBay (No configurado)',
                message: 'EBAY_APP_ID no configurado'
            }];
        }

        try {
            const params = new URLSearchParams({
                'OPERATION-NAME': 'findItemsByKeywords',
                'SERVICE-VERSION': '1.13.0',
                'SECURITY-APPNAME': appId,
                'RESPONSE-DATA-FORMAT': 'JSON',
                'REST-PAYLOAD': 'true',
                'GLOBAL-ID': 'EBAY-ES',
                keywords: query,
                'paginationInput.entriesPerPage': '10',
                'paginationInput.pageNumber': '1'
            });

            const apiUrl = `https://svcs.ebay.com/services/search/FindingService/v1?${params.toString()}`;
            console.log('🌐 eBay API URL:', apiUrl);
            const response = await this.fetch(apiUrl);
            const data = await response.json();
            console.log('📡 eBay API Response:', JSON.stringify(data, null, 2));

            // Verificar si hay errores de eBay
            if (data.errorMessage) {
                const errorMsg = data.errorMessage[0]?.error?.[0]?.message?.[0] || 'Error desconocido';
                if (errorMsg.includes('exceeded') || errorMsg.includes('RateLimiter')) {
                    throw new Error('Rate limit exceeded - eBay API limit reached');
                }
                throw new Error(`eBay API error: ${errorMsg}`);
            }

            if (data.findItemsByKeywordsResponse && data.findItemsByKeywordsResponse[0].searchResult) {
                const items = data.findItemsByKeywordsResponse[0].searchResult[0].item || [];
                return items.map(item => ({
                    priceUsd: parseFloat(item.sellingStatus[0].currentPrice[0].__value__),
                    condition: item.condition ? item.condition[0].conditionDisplayName[0] : 'N/A',
                    source: 'eBay',
                    ebayItemId: item.itemId[0],
                    ebayListingUrl: item.viewItemURL[0],
                    title: item.title[0]
                }));
            }

            return [];
        } catch (error) {
            console.error('Error buscando precios en eBay:', error);
            return [{
                priceUsd: 0,
                condition: 'N/A',
                source: 'eBay (Error)',
                message: error.message
            }];
        }
    }

    // Inicializar servidor
    async init() {
        if (this.isInitialized) return;
        
        try {
            console.log('🔄 Inicializando servidor híbrido...');
            await this.migrator.init();
            await this.searchEngine.init();
            this.isInitialized = true;
            console.log('✅ Servidor híbrido inicializado correctamente');
        } catch (error) {
            console.error('❌ Error inicializando servidor:', error);
            throw error;
        }
    }

    // Iniciar servidor
    async start() {
        try {
            await this.init();
            
            this.app.listen(this.port, '0.0.0.0', () => {
                console.log(`🚀 Servidor híbrido ejecutándose en puerto ${this.port}`);
                console.log(`🌐 URL: http://localhost:${this.port}`);
                console.log(`📊 Estado: http://localhost:${this.port}/api/status`);
                console.log(`🔍 Búsqueda: http://localhost:${this.port}/api/pokemontcg/cards?q=pikachu`);
                console.log(`💰 Precios eBay: http://localhost:${this.port}/api/ebay/search?q=pokemon cards`);
                console.log(`🔑 eBay configurado: ${!!process.env.EBAY_APP_ID ? 'SÍ' : 'NO'}`);
            });
        } catch (error) {
            console.error('💥 Error iniciando servidor:', error);
            throw error;
        }
    }

    // Detener servidor
    async stop() {
        console.log('🛑 Deteniendo servidor híbrido...');
        // Aquí podrías agregar lógica de limpieza si es necesario
    }
}

// Inicializar servidor si se ejecuta directamente
if (require.main === module) {
    const server = new HybridAPIServer();
    
    // Manejar señales de terminación
    process.on('SIGINT', async () => {
        console.log('\n🛑 Recibida señal SIGINT, cerrando servidor...');
        await server.stop();
        process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
        console.log('\n🛑 Recibida señal SIGTERM, cerrando servidor...');
        await server.stop();
        process.exit(0);
    });
    
    server.start().catch(error => {
        console.error('💥 Error fatal iniciando servidor:', error);
        process.exit(1);
    });
}

module.exports = HybridAPIServer;