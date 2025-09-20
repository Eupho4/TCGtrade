// TCGtrade - Funciones de Búsqueda Avanzada
// JavaScript extraído del HTML para mejor organización

// Clase para búsqueda avanzada
class AdvancedSearch {
    constructor() {
        this.filters = {
            name: '',
            set: '',
            type: '',
            rarity: '',
            minPrice: '',
            maxPrice: '',
            language: '',
            condition: ''
        };
        this.results = [];
        this.isOpen = false;
    }

    // Inicializar la búsqueda avanzada
    async init() {
        console.log('🔍 Inicializando búsqueda avanzada...');
        await this.loadFilterOptions();
        console.log('✅ Búsqueda avanzada inicializada');
    }

    // Cargar opciones de filtros
    async loadFilterOptions() {
        try {
            // Cargar sets disponibles
            const setsResponse = await fetch('/api/sets');
            if (setsResponse.ok) {
                const sets = await setsResponse.json();
                this.populateSetFilter(sets);
            }

            // Cargar tipos disponibles
            const typesResponse = await fetch('/api/types');
            if (typesResponse.ok) {
                const types = await typesResponse.json();
                this.populateTypeFilter(types);
            }

            // Cargar rarezas disponibles
            const raritiesResponse = await fetch('/api/rarities');
            if (raritiesResponse.ok) {
                const rarities = await raritiesResponse.json();
                this.populateRarityFilter(rarities);
            }
        } catch (error) {
            console.error('Error cargando opciones de filtros:', error);
        }
    }

    // Poblar filtro de sets
    populateSetFilter(sets) {
        const setSelect = document.getElementById('advancedSetFilter');
        if (setSelect) {
            setSelect.innerHTML = '<option value="">Todos los sets</option>';
            sets.forEach(set => {
                const option = document.createElement('option');
                option.value = set.id;
                option.textContent = set.name;
                setSelect.appendChild(option);
            });
        }
    }

    // Poblar filtro de tipos
    populateTypeFilter(types) {
        const typeSelect = document.getElementById('advancedTypeFilter');
        if (typeSelect) {
            typeSelect.innerHTML = '<option value="">Todos los tipos</option>';
            types.forEach(type => {
                const option = document.createElement('option');
                option.value = type;
                option.textContent = type;
                typeSelect.appendChild(option);
            });
        }
    }

    // Poblar filtro de rarezas
    populateRarityFilter(rarities) {
        const raritySelect = document.getElementById('advancedRarityFilter');
        if (raritySelect) {
            raritySelect.innerHTML = '<option value="">Todas las rarezas</option>';
            rarities.forEach(rarity => {
                const option = document.createElement('option');
                option.value = rarity;
                option.textContent = rarity;
                raritySelect.appendChild(option);
            });
        }
    }

    // Realizar búsqueda avanzada
    async search() {
        try {
            console.log('🔍 Realizando búsqueda avanzada...');
            
            // Recopilar filtros
            this.collectFilters();
            
            // Construir query
            const query = this.buildQuery();
            
            // Realizar búsqueda
            const response = await fetch(`/api/search?${query}`);
            if (response.ok) {
                const data = await response.json();
                this.results = data.cards || [];
                this.displayResults();
            } else {
                console.error('Error en búsqueda avanzada:', response.statusText);
            }
        } catch (error) {
            console.error('Error en búsqueda avanzada:', error);
        }
    }

    // Recopilar filtros del formulario
    collectFilters() {
        this.filters.name = document.getElementById('advancedNameFilter')?.value || '';
        this.filters.set = document.getElementById('advancedSetFilter')?.value || '';
        this.filters.type = document.getElementById('advancedTypeFilter')?.value || '';
        this.filters.rarity = document.getElementById('advancedRarityFilter')?.value || '';
        this.filters.minPrice = document.getElementById('advancedMinPriceFilter')?.value || '';
        this.filters.maxPrice = document.getElementById('advancedMaxPriceFilter')?.value || '';
        this.filters.language = document.getElementById('advancedLanguageFilter')?.value || '';
        this.filters.condition = document.getElementById('advancedConditionFilter')?.value || '';
    }

    // Construir query de búsqueda
    buildQuery() {
        const params = new URLSearchParams();
        
        if (this.filters.name) params.append('name', this.filters.name);
        if (this.filters.set) params.append('set', this.filters.set);
        if (this.filters.type) params.append('type', this.filters.type);
        if (this.filters.rarity) params.append('rarity', this.filters.rarity);
        if (this.filters.minPrice) params.append('minPrice', this.filters.minPrice);
        if (this.filters.maxPrice) params.append('maxPrice', this.filters.maxPrice);
        if (this.filters.language) params.append('language', this.filters.language);
        if (this.filters.condition) params.append('condition', this.filters.condition);
        
        return params.toString();
    }

    // Mostrar resultados
    displayResults() {
        const resultsContainer = document.getElementById('advancedSearchResults');
        if (!resultsContainer) return;

        if (this.results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="text-center text-gray-500 dark:text-gray-400 py-8">
                    <span class="text-4xl">🔍</span>
                    <p class="mt-2">No se encontraron cartas con los filtros aplicados</p>
                </div>
            `;
            return;
        }

        resultsContainer.innerHTML = this.results.map(card => `
            <div class="card-item bg-white dark:bg-gray-700 rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
                <div class="flex items-center gap-4">
                    ${card.image ? `
                        <img src="${card.image}" alt="${card.name}" class="w-16 h-20 object-contain rounded">
                    ` : `
                        <div class="w-16 h-20 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                            <span class="text-2xl">🎴</span>
                        </div>
                    `}
                    <div class="flex-1">
                        <h3 class="font-semibold text-gray-900 dark:text-white">${card.name}</h3>
                        <p class="text-sm text-gray-600 dark:text-gray-400">${card.set || 'Set desconocido'}</p>
                        <div class="flex gap-2 mt-2">
                            ${card.type ? `<span class="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">${card.type}</span>` : ''}
                            ${card.rarity ? `<span class="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded text-xs">${card.rarity}</span>` : ''}
                        </div>
                    </div>
                    <button onclick="selectCardFromAdvancedSearch('${card.id}', '${card.name}', '${card.image || ''}', '${card.set || ''}', '${card.number || ''}')"
                            class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded text-sm">
                        Seleccionar
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Limpiar filtros
    clearFilters() {
        this.filters = {
            name: '',
            set: '',
            type: '',
            rarity: '',
            minPrice: '',
            maxPrice: '',
            language: '',
            condition: ''
        };

        // Limpiar formulario
        const form = document.getElementById('advancedSearchForm');
        if (form) {
            form.reset();
        }
    }

    // Cerrar búsqueda avanzada
    close() {
        this.isOpen = false;
        const modal = document.getElementById('advancedSearchModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }
}

// Variable global para la instancia
let advancedSearch = null;

// Función para inicializar búsqueda avanzada
async function initAdvancedSearch() {
    try {
        console.log('🔍 Inicializando búsqueda avanzada...');
        
        advancedSearch = new AdvancedSearch();
        window.advancedSearch = advancedSearch;
        
        await advancedSearch.init();
        
        console.log('✅ Búsqueda avanzada inicializada');
    } catch (error) {
        console.error('❌ Error inicializando búsqueda avanzada:', error);
        // No bloquear la aplicación si falla la búsqueda avanzada
    }
}

// Función para toggle de búsqueda avanzada
function toggleAdvancedSearch() {
    const modal = document.getElementById('advancedSearchModal');
    if (!modal) return;

    if (modal.classList.contains('hidden')) {
        modal.classList.remove('hidden');
        if (advancedSearch) {
            advancedSearch.isOpen = true;
        }
    } else {
        modal.classList.add('hidden');
        if (advancedSearch) {
            advancedSearch.isOpen = false;
        }
    }
}

// Función para realizar búsqueda avanzada
async function performAdvancedSearch() {
    console.log('🚀 performAdvancedSearch() ejecutándose...');
    
    if (!advancedSearch) {
        console.error('❌ Búsqueda avanzada no inicializada');
        return;
    }

    await advancedSearch.search();
}

// Función para seleccionar carta desde búsqueda avanzada
function selectCardFromAdvancedSearch(cardId, cardName, cardImage, setName, cardNumber) {
    console.log('🎴 Seleccionando carta desde búsqueda avanzada:', { cardId, cardName, cardImage, setName, cardNumber });
    
    // Cerrar modal de búsqueda avanzada
    if (advancedSearch) {
        advancedSearch.close();
    }
    
    // Aquí puedes implementar la lógica para usar la carta seleccionada
    // Por ejemplo, añadirla a un intercambio, colección, etc.
    if (typeof showNotification === 'function') {
        showNotification(`Carta "${cardName}" seleccionada`, 'success');
    }
}

// Función para limpiar filtros de búsqueda avanzada
function clearAdvancedSearchFilters() {
    if (advancedSearch) {
        advancedSearch.clearFilters();
    }
}

// Exportar funciones para uso global
window.AdvancedSearch = AdvancedSearch;
window.initAdvancedSearch = initAdvancedSearch;
window.toggleAdvancedSearch = toggleAdvancedSearch;
window.performAdvancedSearch = performAdvancedSearch;
window.selectCardFromAdvancedSearch = selectCardFromAdvancedSearch;
window.clearAdvancedSearchFilters = clearAdvancedSearchFilters;

console.log('🚀 Módulo de búsqueda avanzada cargado');