const LocalCardDatabase = require('./local-database');

class SchemaMigrator {
    constructor() {
        this.db = new LocalCardDatabase();
    }

    async init() {
        await this.db.init();
    }

    async migrateSchema() {
        try {
            console.log('🔧 Migrando esquema de base de datos...');
            
            // Agregar columnas faltantes a la tabla cards
            const alterStatements = [
                'ALTER TABLE cards ADD COLUMN set_id TEXT',
                'ALTER TABLE cards ADD COLUMN subtypes TEXT',
                'ALTER TABLE cards ADD COLUMN tcgplayer TEXT',
                'ALTER TABLE cards ADD COLUMN cardmarket TEXT'
            ];

            for (const statement of alterStatements) {
                try {
                    await this.db.run(statement);
                    console.log(`✅ Ejecutado: ${statement}`);
                } catch (error) {
                    if (error.message.includes('duplicate column name')) {
                        console.log(`ℹ️ Columna ya existe: ${statement}`);
                    } else {
                        console.error(`❌ Error ejecutando ${statement}:`, error.message);
                    }
                }
            }

            console.log('✅ Migración de esquema completada');
            
        } catch (error) {
            console.error('❌ Error en migración de esquema:', error);
            throw error;
        }
    }

    async close() {
        await this.db.close();
    }
}

module.exports = SchemaMigrator;

// Si se ejecuta directamente, iniciar migración
if (require.main === module) {
    const migrator = new SchemaMigrator();
    
    migrator.init()
        .then(() => migrator.migrateSchema())
        .then(() => migrator.close())
        .catch(error => {
            console.error('💥 Error fatal en migración de esquema:', error);
            process.exit(1);
        });
}