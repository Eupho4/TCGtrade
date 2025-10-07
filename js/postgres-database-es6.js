import pkg from 'pg';
const { Pool } = pkg;

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

    async initialize() {
        try {
            if (this.isInitialized) return;
            
            // Probar conexión
            const client = await this.pool.connect();
            await client.query('SELECT NOW()');
            client.release();
            
            this.isInitialized = true;
            console.log('✅ Conexión PostgreSQL establecida');
        } catch (error) {
            console.error('❌ Error al conectar con PostgreSQL:', error);
            throw error;
        }
    }

    async searchCards(query, page = 1, limit = 20) {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            const offset = (page - 1) * limit;
            
            // Búsqueda en múltiples campos
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
                    name ILIKE $1 OR
                    set_name ILIKE $1 OR
                    series ILIKE $1 OR
                    types::text ILIKE $1
                ORDER BY 
                    CASE 
                        WHEN name ILIKE $2 THEN 1
                        WHEN set_name ILIKE $2 THEN 2
                        ELSE 3
                    END,
                    name
                LIMIT $3 OFFSET $4
            `;
            
            const searchTerm = `%${query}%`;
            const exactTerm = `${query}%`;
            
            const result = await this.pool.query(searchQuery, [searchTerm, exactTerm, limit, offset]);
            
            // Contar total de resultados
            const countQuery = `
                SELECT COUNT(*) as total
                FROM cards 
                WHERE 
                    name ILIKE $1 OR
                    set_name ILIKE $1 OR
                    series ILIKE $1 OR
                    types::text ILIKE $1
            `;
            
            const countResult = await this.pool.query(countQuery, [searchTerm]);
            const total = parseInt(countResult.rows[0].total);
            
            return {
                data: result.rows.map(row => ({
                    id: row.id,
                    name: row.name,
                    imageUrl: row.image_url,
                    set: row.set_name,
                    series: row.series,
                    number: row.number,
                    rarity: row.rarity,
                    hp: row.hp,
                    types: row.types,
                    attacks: row.attacks,
                    weaknesses: row.weaknesses,
                    resistances: row.resistances,
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
            };
        } catch (error) {
            console.error('❌ Error en búsqueda PostgreSQL:', error);
            throw error;
        }
    }

    async getCardById(id) {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            const query = `
                SELECT * FROM cards WHERE id = $1
            `;
            
            const result = await this.pool.query(query, [id]);
            
            if (result.rows.length === 0) {
                return null;
            }
            
            const row = result.rows[0];
            return {
                id: row.id,
                name: row.name,
                imageUrl: row.image_url,
                set: row.set_name,
                series: row.series,
                number: row.number,
                rarity: row.rarity,
                hp: row.hp,
                types: row.types,
                attacks: row.attacks,
                weaknesses: row.weaknesses,
                resistances: row.resistances,
                retreatCost: row.retreat_cost,
                createdAt: row.created_at
            };
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

            const query = `
                SELECT DISTINCT 
                    set_name,
                    series,
                    COUNT(*) as card_count
                FROM cards 
                GROUP BY set_name, series
                ORDER BY series, set_name
            `;
            
            const result = await this.pool.query(query);
            
            return result.rows.map(row => ({
                name: row.set_name,
                series: row.series,
                cardCount: parseInt(row.card_count)
            }));
        } catch (error) {
            console.error('❌ Error al obtener sets:', error);
            throw error;
        }
    }

    async close() {
        try {
            await this.pool.end();
            console.log('✅ Conexión PostgreSQL cerrada');
        } catch (error) {
            console.error('❌ Error al cerrar conexión PostgreSQL:', error);
        }
    }
}

export default PostgresCardDatabase;