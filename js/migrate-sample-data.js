const DataMigrator = require('./data-migrator');
const LocalSearchEngine = require('./local-search-engine');

class SampleDataMigrator {
    constructor() {
        this.migrator = new DataMigrator();
        this.searchEngine = new LocalSearchEngine();
    }

    // Migrar datos de ejemplo
    async migrateSampleData() {
        try {
            console.log('🚀 Iniciando migración de datos de ejemplo...');
            
            // Inicializar migrador
            await this.migrator.init();
            
            // Crear datos de ejemplo
            await this.createSampleSets();
            await this.createSampleCards();
            
            // Crear índices de búsqueda
            await this.migrator.createSearchIndexes();
            
            // Probar motor de búsqueda
            await this.testSearchEngine();
            
            console.log('✅ Migración de datos de ejemplo completada');
            
        } catch (error) {
            console.error('❌ Error en migración de datos de ejemplo:', error);
        } finally {
            await this.cleanup();
        }
    }

    // Crear sets de ejemplo
    async createSampleSets() {
        console.log('📚 Creando sets de ejemplo...');
        
        const sampleSets = [
            {
                id: 'base1',
                name: 'Base Set',
                series: 'Base',
                printed_total: 102,
                total: 102,
                legalities: { unlimited: 'Legal' },
                ptcgo_code: 'BS',
                release_date: '1999-01-09',
                updated_at: new Date().toISOString(),
                images: { symbol: 'https://images.pokemontcg.io/base1/symbol.png' }
            },
            {
                id: 'base2',
                name: 'Jungle',
                series: 'Base',
                printed_total: 64,
                total: 64,
                legalities: { unlimited: 'Legal' },
                ptcgo_code: 'JU',
                release_date: '1999-06-16',
                updated_at: new Date().toISOString(),
                images: { symbol: 'https://images.pokemontcg.io/base2/symbol.png' }
            },
            {
                id: 'base3',
                name: 'Fossil',
                series: 'Base',
                printed_total: 62,
                total: 62,
                legalities: { unlimited: 'Legal' },
                ptcgo_code: 'FO',
                release_date: '1999-10-10',
                updated_at: new Date().toISOString(),
                images: { symbol: 'https://images.pokemontcg.io/base3/symbol.png' }
            },
            {
                id: 'gym1',
                name: 'Gym Heroes',
                series: 'Gym',
                printed_total: 132,
                total: 132,
                legalities: { unlimited: 'Legal' },
                ptcgo_code: 'GH',
                release_date: '2000-08-14',
                updated_at: new Date().toISOString(),
                images: { symbol: 'https://images.pokemontcg.io/gym1/symbol.png' }
            },
            {
                id: 'gym2',
                name: 'Gym Challenge',
                series: 'Gym',
                printed_total: 132,
                total: 132,
                legalities: { unlimited: 'Legal' },
                ptcgo_code: 'GC',
                release_date: '2000-10-16',
                updated_at: new Date().toISOString(),
                images: { symbol: 'https://images.pokemontcg.io/gym2/symbol.png' }
            }
        ];

        for (const set of sampleSets) {
            await this.migrator.saveSet(set);
        }

        console.log(`✅ ${sampleSets.length} sets de ejemplo creados`);
    }

    // Crear cartas de ejemplo
    async createSampleCards() {
        console.log('🎴 Creando cartas de ejemplo...');
        
        const sampleCards = [
            {
                id: 'base1-4',
                name: 'Charizard',
                set: { name: 'Base Set', series: 'Base' },
                number: '4/102',
                rarity: 'Holo Rare',
                types: ['Fire'],
                images: {
                    small: 'https://images.pokemontcg.io/base1/4.png',
                    large: 'https://images.pokemontcg.io/base1/4_hires.png'
                }
            },
            {
                id: 'base1-25',
                name: 'Pikachu',
                set: { name: 'Base Set', series: 'Base' },
                number: '58/102',
                rarity: 'Common',
                types: ['Lightning'],
                images: {
                    small: 'https://images.pokemontcg.io/base1/58.png',
                    large: 'https://images.pokemontcg.io/base1/58_hires.png'
                }
            },
            {
                id: 'base1-2',
                name: 'Blastoise',
                set: { name: 'Base Set', series: 'Base' },
                number: '2/102',
                rarity: 'Holo Rare',
                types: ['Water'],
                images: {
                    small: 'https://images.pokemontcg.io/base1/2.png',
                    large: 'https://images.pokemontcg.io/base1/2_hires.png'
                }
            },
            {
                id: 'base1-15',
                name: 'Venusaur',
                set: { name: 'Base Set', series: 'Base' },
                number: '15/102',
                rarity: 'Holo Rare',
                types: ['Grass'],
                images: {
                    small: 'https://images.pokemontcg.io/base1/15.png',
                    large: 'https://images.pokemontcg.io/base1/15_hires.png'
                }
            },
            {
                id: 'base2-3',
                name: 'Clefable',
                set: { name: 'Jungle', series: 'Base' },
                number: '3/64',
                rarity: 'Holo Rare',
                types: ['Colorless'],
                images: {
                    small: 'https://images.pokemontcg.io/base2/3.png',
                    large: 'https://images.pokemontcg.io/base2/3_hires.png'
                }
            },
            {
                id: 'base2-6',
                name: 'Flareon',
                set: { name: 'Jungle', series: 'Base' },
                number: '6/64',
                rarity: 'Holo Rare',
                types: ['Fire'],
                images: {
                    small: 'https://images.pokemontcg.io/base2/6.png',
                    large: 'https://images.pokemontcg.io/base2/6_hires.png'
                }
            },
            {
                id: 'base2-8',
                name: 'Jolteon',
                set: { name: 'Jungle', series: 'Base' },
                number: '8/64',
                rarity: 'Holo Rare',
                types: ['Lightning'],
                images: {
                    small: 'https://images.pokemontcg.io/base2/8.png',
                    large: 'https://images.pokemontcg.io/base2/8_hires.png'
                }
            },
            {
                id: 'base2-12',
                name: 'Mr. Mime',
                set: { name: 'Jungle', series: 'Base' },
                number: '12/64',
                rarity: 'Holo Rare',
                types: ['Psychic'],
                images: {
                    small: 'https://images.pokemontcg.io/base2/12.png',
                    large: 'https://images.pokemontcg.io/base2/12_hires.png'
                }
            },
            {
                id: 'base2-15',
                name: 'Nidoqueen',
                set: { name: 'Jungle', series: 'Base' },
                number: '15/64',
                rarity: 'Holo Rare',
                types: ['Grass'],
                images: {
                    small: 'https://images.pokemontcg.io/base2/15.png',
                    large: 'https://images.pokemontcg.io/base2/15_hires.png'
                }
            },
            {
                id: 'base2-18',
                name: 'Pidgeot',
                set: { name: 'Jungle', series: 'Base' },
                number: '18/64',
                rarity: 'Holo Rare',
                types: ['Colorless'],
                images: {
                    small: 'https://images.pokemontcg.io/base2/18.png',
                    large: 'https://images.pokemontcg.io/base2/18_hires.png'
                }
            },
            {
                id: 'base2-20',
                name: 'Pinsir',
                set: { name: 'Jungle', series: 'Base' },
                number: '20/64',
                rarity: 'Holo Rare',
                types: ['Grass'],
                images: {
                    small: 'https://images.pokemontcg.io/base2/20.png',
                    large: 'https://images.pokemontcg.io/base2/20_hires.png'
                }
            },
            {
                id: 'base2-22',
                name: 'Scyther',
                set: { name: 'Jungle', series: 'Base' },
                number: '22/64',
                rarity: 'Holo Rare',
                types: ['Grass'],
                images: {
                    small: 'https://images.pokemontcg.io/base2/22.png',
                    large: 'https://images.pokemontcg.io/base2/22_hires.png'
                }
            },
            {
                id: 'base2-25',
                name: 'Snorlax',
                set: { name: 'Jungle', series: 'Base' },
                number: '25/64',
                rarity: 'Holo Rare',
                types: ['Colorless'],
                images: {
                    small: 'https://images.pokemontcg.io/base2/25.png',
                    large: 'https://images.pokemontcg.io/base2/25_hires.png'
                }
            },
            {
                id: 'base2-27',
                name: 'Vaporeon',
                set: { name: 'Jungle', series: 'Base' },
                number: '27/64',
                rarity: 'Holo Rare',
                types: ['Water'],
                images: {
                    small: 'https://images.pokemontcg.io/base2/27.png',
                    large: 'https://images.pokemontcg.io/base2/27_hires.png'
                }
            },
            {
                id: 'base2-30',
                name: 'Victreebel',
                set: { name: 'Jungle', series: 'Base' },
                number: '30/64',
                rarity: 'Holo Rare',
                types: ['Grass'],
                images: {
                    small: 'https://images.pokemontcg.io/base2/30.png',
                    large: 'https://images.pokemontcg.io/base2/30_hires.png'
                }
            },
            {
                id: 'base2-32',
                name: 'Wigglytuff',
                set: { name: 'Jungle', series: 'Base' },
                number: '32/64',
                rarity: 'Holo Rare',
                types: ['Colorless'],
                images: {
                    small: 'https://images.pokemontcg.io/base2/32.png',
                    large: 'https://images.pokemontcg.io/base2/32_hires.png'
                }
            }
        ];

        for (const card of sampleCards) {
            await this.migrator.saveCard(card);
        }

        console.log(`✅ ${sampleCards.length} cartas de ejemplo creadas`);
    }

    // Probar motor de búsqueda
    async testSearchEngine() {
        console.log('🔍 Probando motor de búsqueda...');
        
        try {
            await this.searchEngine.init();
            
            // Prueba 1: Búsqueda básica
            console.log('\n📊 Prueba 1: Búsqueda básica "pikachu"');
            const results1 = await this.searchEngine.searchCards('pikachu', 1, 5);
            console.log(`- Total encontrado: ${results1.totalCount}`);
            console.log(`- Resultados: ${results1.data.length}`);
            
            // Prueba 2: Búsqueda por tipo
            console.log('\n📊 Prueba 2: Búsqueda por tipo "Fire"');
            const results2 = await this.searchEngine.searchCards('', 1, 10, { type: 'Fire' });
            console.log(`- Total encontrado: ${results2.totalCount}`);
            console.log(`- Resultados: ${results2.data.length}`);
            
            // Prueba 3: Búsqueda por set
            console.log('\n📊 Prueba 3: Búsqueda en set "Base Set"');
            const results3 = await this.searchEngine.searchCards('', 1, 10, { set: 'Base Set' });
            console.log(`- Total encontrado: ${results3.totalCount}`);
            console.log(`- Resultados: ${results3.data.length}`);
            
            // Prueba 4: Sugerencias
            console.log('\n📊 Prueba 4: Sugerencias para "char"');
            const suggestions = await this.searchEngine.getSuggestions('char', 5);
            console.log(`- Sugerencias encontradas: ${suggestions.length}`);
            suggestions.forEach(s => console.log(`  - ${s.display}`));
            
            // Prueba 5: Estadísticas
            console.log('\n📊 Prueba 5: Estadísticas del motor');
            const stats = await this.searchEngine.getSearchStats();
            console.log(`- Total de cartas: ${stats.totalCards}`);
            console.log(`- Total de sets: ${stats.totalSets}`);
            console.log(`- Tamaño de base de datos: ${stats.databaseSize}`);
            console.log(`- Motor: ${stats.searchEngine}`);
            console.log(`- Rendimiento: ${stats.performance}`);
            
        } catch (error) {
            console.error('❌ Error probando motor de búsqueda:', error);
        }
    }

    // Limpieza
    async cleanup() {
        try {
            await this.migrator.close();
            await this.searchEngine.close();
        } catch (error) {
            console.error('❌ Error en limpieza:', error);
        }
    }
}

// Ejecutar migración si se llama directamente
if (require.main === module) {
    const sampleMigrator = new SampleDataMigrator();
    sampleMigrator.migrateSampleData().then(() => {
        console.log('🎉 Migración de datos de ejemplo completada exitosamente');
        process.exit(0);
    }).catch(error => {
        console.error('💥 Error fatal en migración:', error);
        process.exit(1);
    });
}

module.exports = SampleDataMigrator;