const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class LocalCardDatabase {
    constructor() {
        this.dbPath = path.join(__dirname, '../data/cards.db');
        this.ensureDataDirectory();
        this.db = new sqlite3.Database(this.dbPath);
        this.init();
    }

    ensureDataDirectory() {
        const dataDir = path.dirname(this.dbPath);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
    }

    async init() {
        return new Promise((resolve, reject) => {
            console.log('🗄️ Inicializando base de datos local...');
            
            // Crear tabla de cartas
            this.db.run(`
                CREATE TABLE IF NOT EXISTS cards (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    set_name TEXT,
                    set_id TEXT,
                    series TEXT,
                    number TEXT,
                    rarity TEXT,
                    types TEXT,
                    subtypes TEXT,
                    images TEXT,
                    tcgplayer TEXT,
                    cardmarket TEXT,
                    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
                    search_vector TEXT
                )
            `, (err) => {
                if (err) {
                    console.error('❌ Error creando tabla cards:', err);
                    reject(err);
                    return;
                }

                // Crear tabla de sets
                this.db.run(`
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
                `, (err) => {
                    if (err) {
                        console.error('❌ Error creando tabla sets:', err);
                        reject(err);
                        return;
                    }

                    // Crear índices para búsquedas rápidas
                    this.createIndexes().then(() => {
                        console.log('✅ Base de datos local inicializada correctamente');
                        resolve();
                    }).catch(reject);
                });
            });
        });
    }

    async createIndexes() {
        return new Promise((resolve, reject) => {
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

            let completed = 0;
            const total = indexes.length;

            indexes.forEach((indexSQL, i) => {
                this.db.run(indexSQL, (err) => {
                    if (err) {
                        console.error(`❌ Error creando índice ${i + 1}:`, err);
                    }
                    
                    completed++;
                    if (completed === total) {
                        console.log('✅ Índices creados correctamente');
                        resolve();
                    }
                });
            });
        });
    }

    // Función para ejecutar queries con promesas
    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, changes: this.changes });
            });
        });
    }

    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    // Búsqueda de cartas optimizada con soporte para categorías especiales
    async searchCards(query, page = 1, pageSize = 20, filters = {}) {
        try {
            // Asegurar que los parámetros sean del tipo correcto
            const queryStr = String(query || '').toLowerCase();
            const queryLower = `%${queryStr}%`;
            const pageNum = parseInt(page) || 1;
            const pageSizeNum = parseInt(pageSize) || 20;
            const offset = (pageNum - 1) * pageSizeNum;
            
            let whereClause = '';
            let params = [];
            
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
            const hasFilters = filters.series || filters.set || filters.rarity || filters.type || filters.language;
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
                const subtypeConditions = subtypes.map(() => 'subtypes LIKE ?').join(' OR ');
                whereClause = `WHERE (${subtypeConditions})`;
                params = subtypes.map(subtype => `%${subtype}%`);
            } else {
                // Búsqueda normal - usar WHERE clause para búsquedas específicas
                whereClause = 'WHERE (name LIKE ? OR set_name LIKE ? OR series LIKE ? OR subtypes LIKE ?)';
                params = [queryLower, queryLower, queryLower, queryLower];
            }
            
            // Aplicar filtros adicionales
            if (filters.series) {
                if (whereClause) {
                    whereClause += ' AND series = ?';
                } else {
                    whereClause = 'WHERE series = ?';
                }
                params.push(String(filters.series));
            }
            
            if (filters.set) {
                if (whereClause) {
                    whereClause += ' AND set_name = ?';
                } else {
                    whereClause = 'WHERE set_name = ?';
                }
                params.push(String(filters.set));
            }
            
            if (filters.rarity) {
                if (whereClause) {
                    whereClause += ' AND rarity = ?';
                } else {
                    whereClause = 'WHERE rarity = ?';
                }
                params.push(String(filters.rarity));
            }
            
            if (filters.type) {
                if (whereClause) {
                    whereClause += ' AND types LIKE ?';
                } else {
                    whereClause = 'WHERE types LIKE ?';
                }
                params.push(`%${String(filters.type)}%`);
            }
            
            if (filters.language) {
                if (whereClause) {
                    whereClause += ' AND id LIKE ?';
                } else {
                    whereClause = 'WHERE id LIKE ?';
                }
                params.push(`%-${String(filters.language)}`);
            }

            // Obtener cartas (priorizar cartas asiáticas o aleatorias)
            const orderClause = isRandomSearch ? 'ORDER BY RANDOM()' : `
                ORDER BY 
                    CASE 
                        WHEN id LIKE '%-ja' THEN 1
                        WHEN id LIKE '%-zh-cn' THEN 2
                        WHEN id LIKE '%-zh-tw' THEN 3
                        WHEN id LIKE '%-ko' THEN 4
                        ELSE 5
                    END,
                    name`;
            
            const cards = await this.all(`
                SELECT * FROM cards 
                ${whereClause}
                ${orderClause}
                LIMIT ? OFFSET ?
            `, [...params, pageSizeNum, offset]);

            // Obtener total de resultados
            const totalResult = await this.get(`
                SELECT COUNT(*) as count FROM cards 
                ${whereClause}
            `, params);

            // Procesar imágenes JSON y formatear para compatibilidad con API externa
            const processedCards = cards.map(card => {
                // Procesar imágenes
                let images = null;
                try {
                    images = card.images ? JSON.parse(card.images) : null;
                } catch (e) {
                    images = null;
                }
                
                // Procesar set_id (evitar "undefined-ja")
                let setId = card.set_id;
                if (setId && setId.includes('undefined')) {
                    setId = card.id.split('-').slice(0, -1).join('-');
                }
                
                return {
                    id: card.id,
                    name: card.name || 'Carta sin nombre',
                    number: card.number || '',
                    rarity: card.rarity || 'Common',
                    types: card.types ? card.types.split(',').filter(t => t.trim()) : [],
                    subtypes: card.subtypes ? card.subtypes.split(',').filter(t => t.trim()) : [],
                    images: images && images.small ? images : { 
                        small: '/images/card-placeholder.svg', 
                        large: '/images/card-placeholder.svg' 
                    },
                    tcgplayer: card.tcgplayer ? JSON.parse(card.tcgplayer) : {},
                    cardmarket: card.cardmarket ? JSON.parse(card.cardmarket) : {},
                    set: {
                        id: setId || '',
                        name: card.set_name || 'Set desconocido',
                        series: card.series || ''
                    }
                };
            });

            return {
                data: processedCards,
                totalCount: totalResult.count,
                page,
                pageSize,
                totalPages: Math.ceil(totalResult.count / pageSize)
            };
        } catch (error) {
            console.error('❌ Error en búsqueda local:', error);
            throw error;
        }
    }

    // Agregar carta a la base de datos
    async addCard(cardData) {
        try {
            const sql = `
                INSERT OR REPLACE INTO cards (
                    id, name, set_name, set_id, series, number, rarity, 
                    types, subtypes, images, tcgplayer, cardmarket, last_updated
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            `;
            
            const params = [
                cardData.id,
                cardData.name,
                cardData.set_name || '',
                cardData.set_id || '',
                cardData.series || '',
                cardData.number || '',
                cardData.rarity || '',
                cardData.types || '',
                cardData.subtypes || '',
                cardData.images || '',
                cardData.tcgplayer || '',
                cardData.cardmarket || ''
            ];
            
            await this.run(sql, params);
            return true;
        } catch (error) {
            console.error('❌ Error agregando carta:', error);
            throw error;
        }
    }

    // Obtener carta por ID
    async getCardById(id) {
        try {
            const card = await this.get('SELECT * FROM cards WHERE id = ?', [id]);
            if (card) {
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
            const sets = await this.all('SELECT * FROM sets ORDER BY name');
            return sets.map(set => ({
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
            const cardCount = await this.get('SELECT COUNT(*) as count FROM cards');
            const setCount = await this.get('SELECT COUNT(*) as count FROM sets');
            const lastUpdate = await this.get('SELECT MAX(last_updated) as last FROM cards');
            
            return {
                totalCards: cardCount.count,
                totalSets: setCount.count,
                lastUpdated: lastUpdate.last,
                databaseSize: await this.getDatabaseSize()
            };
        } catch (error) {
            console.error('❌ Error obteniendo estadísticas:', error);
            throw error;
        }
    }

    // Obtener tamaño de la base de datos
    async getDatabaseSize() {
        try {
            const stats = fs.statSync(this.dbPath);
            const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
            return `${sizeInMB} MB`;
        } catch (error) {
            return 'N/A';
        }
    }

    // Cerrar conexión
    close() {
        return new Promise((resolve) => {
            this.db.close((err) => {
                if (err) {
                    console.error('❌ Error cerrando base de datos:', err);
                } else {
                    console.log('✅ Base de datos cerrada correctamente');
                }
                resolve();
            });
        });
    }
}

// Exportar la clase
module.exports = LocalCardDatabase;

// Si se ejecuta directamente, crear una instancia de prueba
if (require.main === module) {
    (async () => {
        try {
            const db = new LocalCardDatabase();
            await db.init();
            
            const stats = await db.getStats();
            console.log('📊 Estadísticas de la base de datos:');
            console.log(stats);
            
            await db.close();
        } catch (error) {
            console.error('❌ Error en prueba:', error);
        }
    })();
}