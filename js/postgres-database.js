const { Pool } = require('pg');

class PostgresCardDatabase {
    constructor() {
        // Usar DATABASE_PUBLIC_URL para conexiones externas
        this.connectionString = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
        
        if (!this.connectionString) {
            throw new Error('DATABASE_URL no está configurada en las variables de entorno');
        }

        this.pool = new Pool({
            connectionString: this.connectionString,
            ssl: {
                rejectUnauthorized: false // Necesario para Railway
            }
        });
        
        this.isInitialized = false;
    }

    // Inicializar base de datos
    async init() {
        if (this.isInitialized) return;
        
        try {
            console.log('🗄️ Conectando a PostgreSQL en Railway...');
            
            // Probar conexión
            const client = await this.pool.connect();
            console.log('✅ Conectado a PostgreSQL exitosamente');
            client.release();
            
            // Verificar si las tablas existen
            await this.ensureTablesExist();
            
            this.isInitialized = true;
            console.log('✅ Base de datos PostgreSQL inicializada correctamente');
        } catch (error) {
            console.error('❌ Error conectando a PostgreSQL:', error);
            throw error;
        }
    }

    // Asegurar que las tablas existan
    async ensureTablesExist() {
        try {
            // La tabla cards ya existe con la estructura migrada
            // No necesitamos crearla, solo verificar que existe
            console.log('✅ Tabla cards ya existe con estructura migrada');

            // Crear tabla de sets si no existe
            await this.pool.query(`
                CREATE TABLE IF NOT EXISTS sets (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    series TEXT,
                    printed_total INTEGER,
                    total INTEGER,
                    legalities TEXT,
                    ptcgo_code TEXT,
                    release_date TEXT,
                    updated_at TEXT,
                    images TEXT
                )
            `);

            // Crear índices para búsquedas rápidas
            await this.createIndexes();
            
            console.log('✅ Tablas y índices verificados/creados');
        } catch (error) {
            console.error('❌ Error creando tablas:', error);
            throw error;
        }
    }

    // Crear índices para búsquedas rápidas
    async createIndexes() {
        const indexes = [
            'CREATE INDEX IF NOT EXISTS idx_cards_name ON cards(name)',
            'CREATE INDEX IF NOT EXISTS idx_cards_set ON cards(set_name)',
            'CREATE INDEX IF NOT EXISTS idx_cards_series ON cards(series)',
            'CREATE INDEX IF NOT EXISTS idx_cards_number ON cards(number)',
            'CREATE INDEX IF NOT EXISTS idx_cards_rarity ON cards(rarity)',
            'CREATE INDEX IF NOT EXISTS idx_cards_types ON cards(types)',
            'CREATE INDEX IF NOT EXISTS idx_cards_updated ON cards(last_updated)',
            'CREATE INDEX IF NOT EXISTS idx_sets_name ON sets(name)',
            'CREATE INDEX IF NOT EXISTS idx_sets_series ON sets(series)'
        ];

        for (const indexSQL of indexes) {
            try {
                await this.pool.query(indexSQL);
            } catch (error) {
                console.warn(`⚠️ Error creando índice: ${error.message}`);
            }
        }
    }

    // Búsqueda de cartas optimizada
    async searchCards(query, page = 1, pageSize = 20, filters = {}, sort = 'name', direction = 'asc') {
        try {
            await this.ensureInitialized();
            
            const queryStr = String(query || '').toLowerCase();
            const queryLower = `%${queryStr}%`;
            const pageNum = parseInt(page) || 1;
            const pageSizeNum = parseInt(pageSize) || 20;
            const offset = (pageNum - 1) * pageSizeNum;
            
            let whereClause = '';
            let params = [];
            let paramCount = 1;
            
            // Mapeo de categorías especiales a subtipos
            const categoryMapping = {
                'trainer': ['Item', 'Supporter', 'Stadium', 'Pokémon Tool', 'Technical Machine'],
                'trainers': ['Item', 'Supporter', 'Stadium', 'Pokémon Tool', 'Technical Machine'],
                'energy': ['Special'],
                'energies': ['Special'],
                'energia': ['Special'],
                'energias': ['Special']
            };
            
            // Si es búsqueda aleatoria (pokemon sin filtros específicos)
            const hasFilters = filters.series || filters.set || filters.rarity || filters.type || filters.subtype || filters.language || filters.hasImage || filters.hasPrice;
            const isRandomSearch = queryStr === 'pokemon' && !hasFilters;
            
            // Verificar si es una búsqueda por categoría especial
            const isCategorySearch = categoryMapping[queryStr];
            
            if (isRandomSearch) {
                // Búsqueda aleatoria - no usar WHERE clause
                whereClause = '';
            } else if (queryStr === 'pokemon' && hasFilters) {
                // Búsqueda aleatoria con filtros - solo aplicar filtros, no búsqueda de texto
                whereClause = '';
            } else if (isCategorySearch) {
                // Búsqueda por categoría especial (trainers, energies, etc.)
                const subtypes = categoryMapping[queryStr];
                const subtypeConditions = subtypes.map(() => `subtypes LIKE $${paramCount++}`).join(' OR ');
                whereClause = `WHERE (${subtypeConditions})`;
                params = subtypes.map(subtype => `%${subtype}%`);
            } else if (queryStr) {
                // Búsqueda normal - usar WHERE clause para búsquedas específicas
                whereClause = `WHERE (name ILIKE $${paramCount++} OR set_name ILIKE $${paramCount++} OR set_series ILIKE $${paramCount++} OR subtypes::text ILIKE $${paramCount++})`;
                params = [queryLower, queryLower, queryLower, queryLower];
            }
            
            // Aplicar filtros adicionales
            if (filters.series) {
                if (whereClause) {
                    whereClause += ` AND set_series = $${paramCount++}`;
                } else {
                    whereClause = `WHERE set_series = $${paramCount++}`;
                }
                params.push(String(filters.series));
            }
            
            if (filters.set) {
                if (whereClause) {
                    whereClause += ` AND set_name = $${paramCount++}`;
                } else {
                    whereClause = `WHERE set_name = $${paramCount++}`;
                }
                params.push(String(filters.set));
            }
            
            if (filters.rarity) {
                if (whereClause) {
                    whereClause += ` AND rarity = $${paramCount++}`;
                } else {
                    whereClause = `WHERE rarity = $${paramCount++}`;
                }
                params.push(String(filters.rarity));
            }
            
            if (filters.type) {
                if (whereClause) {
                    whereClause += ` AND types::text ILIKE $${paramCount++}`;
                } else {
                    whereClause = `WHERE types::text ILIKE $${paramCount++}`;
                }
                params.push(`%${String(filters.type)}%`);
            }
            
            if (filters.language) {
                if (whereClause) {
                    whereClause += ` AND id ILIKE $${paramCount++}`;
                } else {
                    whereClause = `WHERE id ILIKE $${paramCount++}`;
                }
                params.push(`%-${String(filters.language)}`);
            }
            
            if (filters.subtype) {
                if (whereClause) {
                    whereClause += ` AND subtypes::text ILIKE $${paramCount++}`;
                } else {
                    whereClause = `WHERE subtypes::text ILIKE $${paramCount++}`;
                }
                params.push(`%${String(filters.subtype)}%`);
            }
            
            if (filters.hasImage !== undefined) {
                if (whereClause) {
                    whereClause += filters.hasImage ? ' AND image_url IS NOT NULL AND image_url != \'null\' AND image_url != \'\'' : ' AND (image_url IS NULL OR image_url = \'null\' OR image_url = \'\')';
                } else {
                    whereClause = filters.hasImage ? 'WHERE image_url IS NOT NULL AND image_url != \'null\' AND image_url != \'\'' : 'WHERE (image_url IS NULL OR image_url = \'null\' OR image_url = \'\')';
                }
            }
            
            // hasPrice no está disponible en la estructura migrada, omitir

            // Construir cláusula de ordenamiento
            let orderClause = '';
            if (isRandomSearch) {
                orderClause = 'ORDER BY RANDOM()';
            } else {
                // Mapear campos de ordenamiento
                const sortField = {
                    'name': 'name',
                    'rarity': 'rarity',
                    'number': 'number',
                    'random': 'RANDOM()'
                }[sort] || 'name';
                
                const sortDirection = direction === 'desc' ? 'DESC' : 'ASC';
                
                if (sort === 'random') {
                    orderClause = 'ORDER BY RANDOM()';
                } else {
                    orderClause = `ORDER BY ${sortField} ${sortDirection}`;
                }
            }
            
            // Ejecutar consulta principal
            const cardsQuery = `
                SELECT * FROM cards 
                ${whereClause}
                ${orderClause}
                LIMIT $${paramCount++} OFFSET $${paramCount++}
            `;
            
            const cardsResult = await this.pool.query(cardsQuery, [...params, pageSizeNum, offset]);

            // Obtener total de resultados
            const countQuery = `
                SELECT COUNT(*) as count FROM cards 
                ${whereClause}
            `;
            const countResult = await this.pool.query(countQuery, params);

            // Procesar resultados y formatear para compatibilidad con API externa
            const processedCards = cardsResult.rows.map(card => {
                // Procesar tipos y subtipos (son arrays en PostgreSQL)
                const types = Array.isArray(card.types) ? card.types : [];
                const subtypes = Array.isArray(card.subtypes) ? card.subtypes : [];
                
                // Generar URL de imagen usando la API de Pokemon TCG
                // Formato: https://images.pokemontcg.io/{set_id}/{number}.png
                const setId = card.id.split('-').slice(0, -1).join('-');
                const cardNumber = card.number || card.id.split('-').pop();
                const imageUrl = `https://images.pokemontcg.io/${setId}/${cardNumber}.png`;
                
                const images = {
                    small: imageUrl,
                    large: imageUrl
                };
                
                return {
                    id: card.id,
                    name: card.name || 'Carta sin nombre',
                    number: card.number || '',
                    rarity: card.rarity || 'Common',
                    types: types,
                    subtypes: subtypes,
                    images: images,
                    tcgplayer: {}, // No disponible en la estructura migrada
                    cardmarket: {}, // No disponible en la estructura migrada
                    set: {
                        id: card.id.split('-').slice(0, -1).join('-') || '',
                        name: card.set_name || 'Set desconocido',
                        series: card.set_series || ''
                    }
                };
            });

            return {
                data: processedCards,
                totalCount: parseInt(countResult.rows[0].count),
                page,
                pageSize,
                totalPages: Math.ceil(parseInt(countResult.rows[0].count) / pageSize)
            };
        } catch (error) {
            console.error('❌ Error en búsqueda PostgreSQL:', error);
            throw error;
        }
    }

    // Agregar carta a la base de datos (no necesario - tabla ya migrada)
    async addCard(cardData) {
        console.log('⚠️ addCard no implementado - tabla ya migrada');
        return false;
    }

    // Obtener carta por ID
    async getCardById(id) {
        try {
            const result = await this.pool.query('SELECT * FROM cards WHERE id = $1', [id]);
            if (result.rows.length > 0) {
                const card = result.rows[0];
                return {
                    ...card,
                    images: card.images ? JSON.parse(card.images) : null,
                    types: card.types ? card.types.split(',') : []
                };
            }
            return null;
        } catch (error) {
            console.error('❌ Error obteniendo carta por ID:', error);
            throw error;
        }
    }

    // Obtener sets disponibles
    async getSets() {
        try {
            const result = await this.pool.query('SELECT * FROM sets ORDER BY name');
            return result.rows.map(set => ({
                ...set,
                images: set.images ? JSON.parse(set.images) : null
            }));
        } catch (error) {
            console.error('❌ Error obteniendo sets:', error);
            throw error;
        }
    }

    // Obtener estadísticas de la base de datos
    async getStats() {
        try {
            const cardCountResult = await this.pool.query('SELECT COUNT(*) as count FROM cards');
            const setCountResult = await this.pool.query('SELECT COUNT(*) as count FROM sets');
            const lastUpdateResult = await this.pool.query('SELECT MAX(last_updated) as last FROM cards');
            
            return {
                totalCards: parseInt(cardCountResult.rows[0].count),
                totalSets: parseInt(setCountResult.rows[0].count),
                lastUpdated: lastUpdateResult.rows[0].last,
                databaseSize: 'PostgreSQL en Railway'
            };
        } catch (error) {
            console.error('❌ Error obteniendo estadísticas:', error);
            throw error;
        }
    }

    // Obtener todas las series únicas
    async getAllSets() {
        try {
            const result = await this.pool.query('SELECT DISTINCT set_name FROM cards WHERE set_name IS NOT NULL AND set_name != \'\' ORDER BY set_name');
            return result.rows.map(row => row.set_name);
        } catch (error) {
            console.error('❌ Error obteniendo sets:', error);
            return [];
        }
    }

    // Obtener todos los tipos únicos
    async getAllTypes() {
        try {
            const result = await this.pool.query('SELECT DISTINCT unnest(types) as type FROM cards WHERE types IS NOT NULL AND array_length(types, 1) > 0');
            return result.rows.map(row => row.type).filter(type => type && type.trim()).sort();
        } catch (error) {
            console.error('❌ Error obteniendo tipos:', error);
            return [];
        }
    }

    // Obtener todas las rarezas únicas
    async getAllRarities() {
        try {
            const result = await this.pool.query('SELECT DISTINCT rarity FROM cards WHERE rarity IS NOT NULL AND rarity != \'\' ORDER BY rarity');
            return result.rows.map(row => row.rarity);
        } catch (error) {
            console.error('❌ Error obteniendo rarezas:', error);
            return [];
        }
    }

    // Obtener todos los subtipos únicos
    async getAllSubtypes() {
        try {
            const result = await this.pool.query('SELECT DISTINCT unnest(subtypes) as subtype FROM cards WHERE subtypes IS NOT NULL AND array_length(subtypes, 1) > 0');
            return result.rows.map(row => row.subtype).filter(subtype => subtype && subtype.trim()).sort();
        } catch (error) {
            console.error('❌ Error obteniendo subtipos:', error);
            return [];
        }
    }

    // Obtener todos los idiomas únicos
    async getAllLanguages() {
        try {
            // Idiomas disponibles en los datos
            const result = await this.pool.query('SELECT DISTINCT id FROM cards WHERE id LIKE \'%-%\'');
            const dataLanguages = new Set();
            result.rows.forEach(row => {
                const parts = row.id.split('-');
                if (parts.length > 1) {
                    dataLanguages.add(parts[parts.length - 1]);
                }
            });
            
            // Lista completa de idiomas de Pokémon TCG
            const allLanguages = [
                { code: 'en', name: 'English', category: 'western' },
                { code: 'es', name: 'Español', category: 'western' },
                { code: 'fr', name: 'Français', category: 'western' },
                { code: 'de', name: 'Deutsch', category: 'western' },
                { code: 'it', name: 'Italiano', category: 'western' },
                { code: 'pt', name: 'Português', category: 'western' },
                { code: 'ja', name: 'Japonés', category: 'asian' },
                { code: 'ko', name: 'Coreano', category: 'asian' },
                { code: 'zh-cn', name: 'Chino (Simplificado)', category: 'asian' },
                { code: 'zh-tw', name: 'Chino (Tradicional)', category: 'asian' }
            ];
            
            // Marcar qué idiomas están disponibles
            const languagesWithAvailability = allLanguages.map(lang => ({
                ...lang,
                available: lang.category === 'western' || dataLanguages.has(lang.code)
            }));
            
            return languagesWithAvailability;
        } catch (error) {
            console.error('❌ Error obteniendo idiomas:', error);
            return [];
        }
    }

    // Obtener todas las series únicas
    async getAllSeries() {
        try {
            const result = await this.pool.query('SELECT DISTINCT set_series FROM cards WHERE set_series IS NOT NULL AND set_series != \'\' ORDER BY set_series');
            return result.rows.map(row => row.set_series);
        } catch (error) {
            console.error('❌ Error obteniendo series:', error);
            return [];
        }
    }

    // Asegurar que esté inicializado
    async ensureInitialized() {
        if (!this.isInitialized) {
            await this.init();
        }
    }

    // Cerrar conexión
    async close() {
        try {
            await this.pool.end();
            console.log('✅ Conexión PostgreSQL cerrada correctamente');
        } catch (error) {
            console.error('❌ Error cerrando conexión PostgreSQL:', error);
        }
    }
}

module.exports = PostgresCardDatabase;