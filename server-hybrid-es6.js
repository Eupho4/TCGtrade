import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import PostgresSearchEngine from './js/postgres-search-engine-es6.js';
import LocalSearchEngine from './js/local-search-engine-es6.js';
import DataMigrator from './js/data-migrator-es6.js';

// Configurar __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

class HybridAPIServer {
    constructor() {
        this.app = express();
        
        // Usar PostgreSQL si está disponible, sino SQLite local
        if (process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL) {
            console.log('🗄️ Usando PostgreSQL en Railway');
            this.searchEngine = new PostgresSearchEngine();
        } else {
            console.log('🗄️ Usando SQLite local (fallback)');
            this.searchEngine = new LocalSearchEngine();
        }
        
        this.dataMigrator = new DataMigrator();
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
    }
    
    setupMiddleware() {
        // CORS
        this.app.use(cors({
            origin: true,
            credentials: true
        }));
        
        // Parse JSON
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        
        // Servir archivos estáticos
        this.app.use(express.static(path.join(__dirname)));
        
        // Headers de seguridad
        this.app.use((req, res, next) => {
            res.header('X-Content-Type-Options', 'nosniff');
            res.header('X-Frame-Options', 'DENY');
            res.header('X-XSS-Protection', '1; mode=block');
            next();
        });
    }
    
    setupRoutes() {
        // Ruta principal
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, 'html', 'index.html'));
        });
        
        // API de Pokémon TCG (proxy)
        this.app.get('/api/pokemontcg/*', async (req, res) => {
            try {
                const apiPath = req.path.replace('/api/pokemontcg', '');
                const apiUrl = `https://api.pokemontcg.io/v2${apiPath}`;
                
                // Añadir API key si está disponible
                const params = new URLSearchParams(req.query);
                if (process.env.POKEMON_TCG_API_KEY) {
                    params.append('X-Api-Key', process.env.POKEMON_TCG_API_KEY);
                }
                
                const fullUrl = `${apiUrl}?${params.toString()}`;
                
                console.log(`🔍 Proxying request to: ${fullUrl}`);
                
                const response = await fetch(fullUrl, {
                    headers: {
                        'User-Agent': 'TCGtrade-App/1.0',
                        'Accept': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`API Error: ${response.status} ${response.statusText}`);
                }
                
                const data = await response.json();
                res.json(data);
                
            } catch (error) {
                console.error('❌ Error en proxy Pokémon TCG:', error);
                res.status(500).json({
                    error: 'Error al conectar con la API de Pokémon TCG',
                    details: error.message
                });
            }
        });
        
        // API de búsqueda local
        this.app.get('/api/search', async (req, res) => {
            try {
                const { q, page = 1, limit = 20 } = req.query;
                
                if (!q) {
                    return res.status(400).json({ error: 'Query parameter "q" is required' });
                }
                
                const results = await this.searchEngine.search(q, parseInt(page), parseInt(limit));
                res.json(results);
                
            } catch (error) {
                console.error('❌ Error en búsqueda local:', error);
                res.status(500).json({
                    error: 'Error en búsqueda local',
                    details: error.message
                });
            }
        });
        
        // API de migración de datos
        this.app.post('/api/migrate', async (req, res) => {
            try {
                const { source, target } = req.body;
                
                if (!source || !target) {
                    return res.status(400).json({ 
                        error: 'Source and target parameters are required' 
                    });
                }
                
                const result = await this.dataMigrator.migrate(source, target);
                res.json(result);
                
            } catch (error) {
                console.error('❌ Error en migración:', error);
                res.status(500).json({
                    error: 'Error en migración de datos',
                    details: error.message
                });
            }
        });
        
        // Health check
        this.app.get('/api/health', (req, res) => {
            res.json({
                status: 'OK',
                timestamp: new Date().toISOString(),
                environment: process.env.NODE_ENV || 'development',
                database: this.searchEngine.constructor.name
            });
        });
    }
    
    setupErrorHandling() {
        // 404 handler
        this.app.use((req, res) => {
            res.status(404).json({
                error: 'Not Found',
                message: `Route ${req.method} ${req.path} not found`
            });
        });
        
        // Global error handler
        this.app.use((error, req, res, next) => {
            console.error('❌ Unhandled error:', error);
            res.status(500).json({
                error: 'Internal Server Error',
                message: process.env.NODE_ENV === 'production' 
                    ? 'Something went wrong' 
                    : error.message
            });
        });
    }
    
    async start(port = process.env.PORT || 3000) {
        try {
            // Inicializar motor de búsqueda
            await this.searchEngine.initialize();
            console.log('✅ Motor de búsqueda inicializado');
            
            // Iniciar servidor
            this.app.listen(port, () => {
                console.log(`🚀 Servidor híbrido iniciado en puerto ${port}`);
                console.log(`📱 Aplicación disponible en: http://localhost:${port}`);
                console.log(`🔍 API de búsqueda: http://localhost:${port}/api/search`);
                console.log(`🎮 API Pokémon TCG: http://localhost:${port}/api/pokemontcg/*`);
            });
            
        } catch (error) {
            console.error('❌ Error al iniciar servidor:', error);
            process.exit(1);
        }
    }
}

// Iniciar servidor
const server = new HybridAPIServer();
server.start();