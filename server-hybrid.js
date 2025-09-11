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
                const { 
                    q: searchTerm, 
                    page = 1, 
                    pageSize = 20,
                    series,
                    set,
                    rarity,
                    type,
                    language
                } = req.query;
                
                if (!searchTerm) {
                    return res.status(400).json({
                        error: 'Parámetro de búsqueda requerido',
                        message: 'Debes especificar un parámetro de búsqueda ?q='
                    });
                }

                // Construir filtros
                const filters = {};
                if (series) filters.series = series;
                if (set) filters.set = set;
                if (rarity) filters.rarity = rarity;
                if (type) filters.type = type;
                if (language) filters.language = language;

                console.log('🔍 Búsqueda con filtros:', { searchTerm, filters, page, pageSize });

                const results = await this.searchEngine.searchCards(searchTerm, {
                    page: parseInt(page),
                    pageSize: parseInt(pageSize),
                    filters: filters
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