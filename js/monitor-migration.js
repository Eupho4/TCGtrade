const LocalCardDatabase = require('./local-database');

class MigrationMonitor {
    constructor() {
        this.db = new LocalCardDatabase();
        this.lastCardCount = 0;
        this.lastSetCount = 0;
        this.startTime = new Date();
    }

    async init() {
        await this.db.init();
    }

    async startMonitoring() {
        console.log('🔍 Iniciando monitoreo de migración...');
        console.log('📊 Presiona Ctrl+C para detener el monitoreo\n');
        
        let iteration = 0;
        
        while (true) {
            try {
                iteration++;
                const stats = await this.db.getStats();
                const currentTime = new Date();
                const elapsed = Math.floor((currentTime - this.startTime) / 1000);
                
                // Calcular progreso
                const cardsProgress = ((stats.totalCards / 19500) * 100).toFixed(1);
                const setsProgress = ((stats.totalSets / 168) * 100).toFixed(1);
                
                // Calcular velocidad
                const cardsPerSecond = this.lastCardCount > 0 ? 
                    ((stats.totalCards - this.lastCardCount) / 10).toFixed(1) : 0;
                const setsPerSecond = this.lastSetCount > 0 ? 
                    ((stats.totalSets - this.lastSetCount) / 10).toFixed(1) : 0;
                
                // Tiempo estimado restante
                const remainingCards = 19500 - stats.totalCards;
                const remainingSets = 168 - stats.totalSets;
                const etaCards = cardsPerSecond > 0 ? Math.floor(remainingCards / cardsPerSecond) : 0;
                const etaSets = setsPerSecond > 0 ? Math.floor(remainingSets / setsPerSecond) : 0;
                
                console.clear();
                console.log('🚀 MIGRACIÓN COMPLETA EN PROGRESO');
                console.log('==================================');
                console.log(`⏱️  Tiempo transcurrido: ${Math.floor(elapsed / 60)}m ${elapsed % 60}s`);
                console.log(`🔄 Iteración: ${iteration}`);
                console.log('');
                console.log('📊 PROGRESO ACTUAL:');
                console.log(`🎴 Cartas: ${stats.totalCards.toLocaleString()} / 19,500 (${cardsProgress}%)`);
                console.log(`📚 Sets: ${stats.totalSets} / 168 (${setsProgress}%)`);
                console.log(`💾 Tamaño DB: ${stats.databaseSize}`);
                console.log('');
                console.log('⚡ VELOCIDAD:');
                console.log(`🎴 Cartas/seg: ${cardsPerSecond}`);
                console.log(`📚 Sets/seg: ${setsPerSecond}`);
                console.log('');
                console.log('⏳ TIEMPO ESTIMADO RESTANTE:');
                console.log(`🎴 Cartas: ${Math.floor(etaCards / 60)}m ${etaCards % 60}s`);
                console.log(`📚 Sets: ${Math.floor(etaSets / 60)}m ${etaSets % 60}s`);
                console.log('');
                console.log('📈 ÚLTIMA ACTUALIZACIÓN:');
                console.log(`🕐 ${stats.lastUpdated}`);
                console.log('');
                console.log('💡 Presiona Ctrl+C para detener el monitoreo');
                
                // Actualizar contadores
                this.lastCardCount = stats.totalCards;
                this.lastSetCount = stats.totalSets;
                
                // Verificar si la migración está completa
                if (stats.totalCards >= 19500 && stats.totalSets >= 168) {
                    console.log('\n🎉 ¡MIGRACIÓN COMPLETA FINALIZADA!');
                    break;
                }
                
                // Esperar 10 segundos antes del siguiente check
                await this.delay(10000);
                
            } catch (error) {
                console.error('❌ Error en monitoreo:', error);
                await this.delay(5000);
            }
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async close() {
        await this.db.close();
    }
}

// Si se ejecuta directamente
if (require.main === module) {
    const monitor = new MigrationMonitor();
    
    monitor.init()
        .then(() => monitor.startMonitoring())
        .then(() => monitor.close())
        .catch(error => {
            console.error('💥 Error en monitoreo:', error);
            process.exit(1);
        });
}

module.exports = MigrationMonitor;