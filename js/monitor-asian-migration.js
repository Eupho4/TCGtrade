const AsianMigration = require('./asian-migration');

class AsianMigrationMonitor {
    constructor() {
        this.migration = new AsianMigration();
        this.startTime = Date.now();
        this.logFile = 'asian-migration.log';
    }

    log(message) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${message}`;
        console.log(logMessage);
        
        // También escribir a archivo de log
        const fs = require('fs');
        fs.appendFileSync(this.logFile, logMessage + '\n');
    }

    async start() {
        this.log('🚀 Iniciando monitoreo de migración asiática...');
        this.log(`📋 Idiomas objetivo: ${this.migration.asianLanguages.join(', ')}`);
        
        try {
            await this.migration.start();
            
            const endTime = Date.now();
            const duration = Math.round((endTime - this.startTime) / 1000);
            
            this.log(`✅ Migración completada en ${duration} segundos`);
            this.log(`📊 Total de cartas procesadas: ${this.migration.totalCards}`);
            this.log(`📦 Total de sets procesados: ${this.migration.totalSets}`);
            
        } catch (error) {
            this.log(`❌ Error en migración: ${error.message}`);
            throw error;
        }
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    const monitor = new AsianMigrationMonitor();
    monitor.start().catch(console.error);
}

module.exports = AsianMigrationMonitor;