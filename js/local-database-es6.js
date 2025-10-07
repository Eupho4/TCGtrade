import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class LocalCardDatabase {
    constructor() {
        this.dbPath = path.join(__dirname, '../data/cards.db');
        this.ensureDataDirectory();
        this.db = new sqlite3.Database(this.dbPath);
        this.isInitialized = false;
        this.init();
    }

    ensureDataDirectory() {
        const dataDir = path.dirname(this.dbPath);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
    }

    async init() {
        try {
            await this.createTables();
            this.isInitialized = true;
            console.log('✅ Base de datos SQLite inicializada');
        } catch (error) {
            console.error('❌ Error al inicializar SQLite:', error);
            throw error;
        }
    }

    async initialize() {
        if (this.isInitialized) return;
        await this.init();
    }

    createTables() {
        return new Promise((resolve, reject) => {
            const createTableSQL = `
                CREATE TABLE IF NOT EXISTS cards (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    image_url TEXT,
                    set_name TEXT,
                    series TEXT,
                    number TEXT,
                    rarity TEXT,
                    hp INTEGER,
                    types TEXT,
                    attacks TEXT,
                    weaknesses TEXT,
                    resistances TEXT,
                    retreat_cost TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `;

            this.db.run(createTableSQL, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    async searchCards(query, page = 1, limit = 20) {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            const offset = (page - 1) * limit;
            
            return new Promise((resolve, reject) => {
                const searchQuery = `
                    SELECT 
                        id,
                        name,
                        image_url,
                        set_name,
                        series,
                        number,
                        rarity,
                        hp,
                        types,
                        attacks,
                        weaknesses,
                        resistances,
                        retreat_cost,
                        created_at
                    FROM cards 
                    WHERE 
                        name LIKE ? OR
                        set_name LIKE ? OR
                        series LIKE ? OR
                        types LIKE ?
                    ORDER BY 
                        CASE 
                            WHEN name LIKE ? THEN 1
                            WHEN set_name LIKE ? THEN 2
                            ELSE 3
                        END,
                        name
                    LIMIT ? OFFSET ?
                `;
                
                const searchTerm = `%${query}%`;
                const exactTerm = `${query}%`;
                
                this.db.all(searchQuery, [searchTerm, searchTerm, searchTerm, searchTerm, exactTerm, exactTerm, limit, offset], (err, rows) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    // Contar total de resultados
                    const countQuery = `
                        SELECT COUNT(*) as total
                        FROM cards 
                        WHERE 
                            name LIKE ? OR
                            set_name LIKE ? OR
                            series LIKE ? OR
                            types LIKE ?
                    `;
                    
                    this.db.get(countQuery, [searchTerm, searchTerm, searchTerm, searchTerm], (err, countRow) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        const total = countRow.total;
                        
                        resolve({
                            data: rows.map(row => ({
                                id: row.id,
                                name: row.name,
                                imageUrl: row.image_url,
                                set: row.set_name,
                                series: row.series,
                                number: row.number,
                                rarity: row.rarity,
                                hp: row.hp,
                                types: row.types ? JSON.parse(row.types) : [],
                                attacks: row.attacks ? JSON.parse(row.attacks) : [],
                                weaknesses: row.weaknesses ? JSON.parse(row.weaknesses) : [],
                                resistances: row.resistances ? JSON.parse(row.resistances) : [],
                                retreatCost: row.retreat_cost,
                                createdAt: row.created_at
                            })),
                            pagination: {
                                page,
                                limit,
                                total,
                                totalPages: Math.ceil(total / limit),
                                hasNext: page * limit < total,
                                hasPrev: page > 1
                            }
                        });
                    });
                });
            });
        } catch (error) {
            console.error('❌ Error en búsqueda SQLite:', error);
            throw error;
        }
    }

    async getCardById(id) {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            return new Promise((resolve, reject) => {
                const query = `SELECT * FROM cards WHERE id = ?`;
                
                this.db.get(query, [id], (err, row) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    
                    if (!row) {
                        resolve(null);
                        return;
                    }
                    
                    resolve({
                        id: row.id,
                        name: row.name,
                        imageUrl: row.image_url,
                        set: row.set_name,
                        series: row.series,
                        number: row.number,
                        rarity: row.rarity,
                        hp: row.hp,
                        types: row.types ? JSON.parse(row.types) : [],
                        attacks: row.attacks ? JSON.parse(row.attacks) : [],
                        weaknesses: row.weaknesses ? JSON.parse(row.weaknesses) : [],
                        resistances: row.resistances ? JSON.parse(row.resistances) : [],
                        retreatCost: row.retreat_cost,
                        createdAt: row.created_at
                    });
                });
            });
        } catch (error) {
            console.error('❌ Error al obtener carta por ID:', error);
            throw error;
        }
    }

    async getAllSets() {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            return new Promise((resolve, reject) => {
                const query = `
                    SELECT DISTINCT 
                        set_name,
                        series,
                        COUNT(*) as card_count
                    FROM cards 
                    GROUP BY set_name, series
                    ORDER BY series, set_name
                `;
                
                this.db.all(query, [], (err, rows) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    
                    resolve(rows.map(row => ({
                        name: row.set_name,
                        series: row.series,
                        cardCount: parseInt(row.card_count)
                    })));
                });
            });
        } catch (error) {
            console.error('❌ Error al obtener sets:', error);
            throw error;
        }
    }

    async close() {
        return new Promise((resolve) => {
            this.db.close((err) => {
                if (err) {
                    console.error('❌ Error al cerrar SQLite:', err);
                } else {
                    console.log('✅ Conexión SQLite cerrada');
                }
                resolve();
            });
        });
    }
}

export default LocalCardDatabase;