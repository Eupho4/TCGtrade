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
        
        // Servir archivos JavaScript desde la raíz
        this.app.use('/js', express.static('js'));
        
        // Servir archivos exportados
        this.app.use('/exports', express.static('exported_data'));
        
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
                let { 
                    q: searchTerm, 
                    page = 1, 
                    pageSize = 20,
                    series,
                    set,
                    rarity,
                    type,
                    language
                } = req.query;
                
                // Si no hay término de búsqueda, usar búsqueda aleatoria
                if (!searchTerm) {
                    searchTerm = 'pokemon'; // Búsqueda amplia para obtener cartas aleatorias
                }

                // Construir filtros
                const filters = {};
                if (series) filters.series = series;
                if (set) filters.set = set;
                if (rarity) filters.rarity = rarity;
                if (type) filters.type = type;
                if (language) filters.language = language;

                console.log('🔍 Búsqueda con filtros:', { searchTerm, filters, page, pageSize });

                const results = await this.searchEngine.searchCards(
                    searchTerm, 
                    parseInt(page), 
                    parseInt(pageSize), 
                    filters
                );

                res.json(results);
            } catch (error) {
                console.error('Error en búsqueda de cartas:', error);
                res.status(500).json({
                    error: 'Error en búsqueda',
                    message: error.message
                });
            }
        });

        // Endpoint para listar archivos exportados
        this.app.get('/api/exports', (req, res) => {
            const fs = require('fs');
            const path = require('path');
            
            try {
                const exportsDir = path.join(__dirname, 'exported_data');
                const files = fs.readdirSync(exportsDir);
                
                const fileInfo = files.map(file => {
                    const filePath = path.join(exportsDir, file);
                    const stats = fs.statSync(filePath);
                    return {
                        name: file,
                        size: stats.size,
                        sizeFormatted: this.formatFileSize(stats.size),
                        lastModified: stats.mtime,
                        downloadUrl: `/exports/${file}`
                    };
                });
                
                res.json({
                    message: 'Archivos exportados disponibles',
                    totalFiles: files.length,
                    files: fileInfo
                });
            } catch (error) {
                res.status(500).json({
                    error: 'Error al listar archivos exportados',
                    message: error.message
                });
            }
        });

        // Endpoint para descargar archivos específicos
        this.app.get('/api/exports/:filename', (req, res) => {
            const fs = require('fs');
            const path = require('path');
            
            try {
                const filename = req.params.filename;
                const filePath = path.join(__dirname, 'exported_data', filename);
                
                if (!fs.existsSync(filePath)) {
                    return res.status(404).json({
                        error: 'Archivo no encontrado',
                        message: `El archivo ${filename} no existe`
                    });
                }
                
                // Configurar headers para descarga
                res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
                res.setHeader('Content-Type', 'application/octet-stream');
                
                // Enviar archivo
                res.sendFile(filePath);
            } catch (error) {
                res.status(500).json({
                    error: 'Error al descargar archivo',
                    message: error.message
                });
            }
        });

    }

    // Función para formatear tamaño de archivo
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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