/**
 * Search Page Component
 */

import { searchCards, renderCardsInGrid, renderCardsInList } from '../modules/search.js';
import { showNotification } from '../modules/utils.js';

let currentView = 'grid';
let currentResults = [];
let currentFilters = {};

export default {
    render: async () => {
        return `
            <!-- Search Header -->
            <div class="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-lg mb-8">
                <h1 class="text-4xl font-bold mb-4">
                    <span class="icon">🔍</span> Buscar Cartas
                </h1>
                <div class="max-w-3xl mx-auto">
                    <div class="relative">
                        <input type="text" 
                               id="pageSearchInput"
                               placeholder="Busca por nombre de carta (ej: Charizard, Pikachu...)"
                               class="w-full px-6 py-4 rounded-lg text-gray-900 text-lg focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50">
                        <button id="searchButton" 
                                class="absolute right-2 top-1/2 transform -translate-y-1/2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
                            Buscar
                        </button>
                    </div>
                </div>
            </div>

            <!-- Filters Section -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-white">
                        <span class="icon">⚙️</span> Filtros
                    </h3>
                    <button id="toggleFilters" class="text-blue-500 hover:text-blue-600">
                        Mostrar/Ocultar
                    </button>
                </div>
                
                <div id="filtersContainer" class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <!-- Series Filter -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Serie
                        </label>
                        <select id="seriesFilter" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                            <option value="">Todas las series</option>
                        </select>
                    </div>
                    
                    <!-- Set Filter -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Set
                        </label>
                        <select id="setFilter" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                            <option value="">Todos los sets</option>
                        </select>
                    </div>
                    
                    <!-- Rarity Filter -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Rareza
                        </label>
                        <select id="rarityFilter" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                            <option value="">Todas las rarezas</option>
                            <option value="common">Común</option>
                            <option value="uncommon">Poco común</option>
                            <option value="rare">Rara</option>
                            <option value="rare holo">Rara Holo</option>
                        </select>
                    </div>
                    
                    <!-- Type Filter -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Tipo
                        </label>
                        <select id="typeFilter" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                            <option value="">Todos los tipos</option>
                            <option value="fire">🔥 Fuego</option>
                            <option value="water">💧 Agua</option>
                            <option value="grass">🌿 Planta</option>
                            <option value="electric">⚡ Eléctrico</option>
                            <option value="psychic">🔮 Psíquico</option>
                            <option value="fighting">👊 Lucha</option>
                            <option value="dark">🌑 Siniestro</option>
                            <option value="steel">⚙️ Acero</option>
                            <option value="fairy">🧚 Hada</option>
                            <option value="dragon">🐉 Dragón</option>
                            <option value="normal">⚪ Normal</option>
                        </select>
                    </div>
                </div>
                
                <div class="mt-4 flex gap-2">
                    <button id="applyFilters" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold">
                        Aplicar Filtros
                    </button>
                    <button id="clearFilters" class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold">
                        Limpiar
                    </button>
                </div>
            </div>

            <!-- Results Header -->
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h2 class="text-2xl font-bold text-gray-800 dark:text-white">
                        Resultados
                    </h2>
                    <p id="resultsCount" class="text-gray-600 dark:text-gray-400"></p>
                </div>
                
                <!-- View Toggle -->
                <div class="flex gap-2">
                    <button id="gridViewBtn" class="px-4 py-2 rounded-lg font-semibold ${currentView === 'grid' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700'}">
                        <span class="icon">⊞</span> Grid
                    </button>
                    <button id="listViewBtn" class="px-4 py-2 rounded-lg font-semibold ${currentView === 'list' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700'}">
                        <span class="icon">☰</span> Lista
                    </button>
                </div>
            </div>

            <!-- Loading Spinner -->
            <div id="loadingSpinner" class="hidden text-center py-12">
                <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                <p class="mt-4 text-gray-600 dark:text-gray-400">Buscando cartas...</p>
            </div>

            <!-- Results Container -->
            <div id="cardsContainer" class="${currentView === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6' : 'space-y-4'}">
                <!-- Initial message -->
                <div class="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
                    <div class="text-6xl mb-4">🎴</div>
                    <p class="text-xl">Usa el buscador para encontrar cartas</p>
                    <p class="mt-2">Puedes buscar por nombre o aplicar filtros</p>
                </div>
            </div>

            <!-- No Results Message -->
            <div id="noResultsMessage" class="hidden text-center py-12">
                <div class="text-6xl mb-4">😕</div>
                <p class="text-xl text-gray-600 dark:text-gray-400">No se encontraron cartas</p>
                <p class="mt-2 text-gray-500 dark:text-gray-500">Intenta con otros términos de búsqueda</p>
            </div>

            <!-- Pagination -->
            <div id="pagination" class="flex justify-center gap-2 mt-8 hidden">
                <!-- Pagination buttons will be added here -->
            </div>
        `;
    },

    afterRender: async () => {
        
        // Get elements
        const searchInput = document.getElementById('pageSearchInput');
        const searchButton = document.getElementById('searchButton');
        const gridViewBtn = document.getElementById('gridViewBtn');
        const listViewBtn = document.getElementById('listViewBtn');
        const toggleFiltersBtn = document.getElementById('toggleFilters');
        const filtersContainer = document.getElementById('filtersContainer');
        const applyFiltersBtn = document.getElementById('applyFilters');
        const clearFiltersBtn = document.getElementById('clearFilters');
        const cardsContainer = document.getElementById('cardsContainer');
        
        // Search functionality
        const performSearch = async () => {
            const query = searchInput.value.trim();
            if (query.length < 2) {
                showNotification('Por favor ingresa al menos 2 caracteres', 'warning');
                return;
            }
            
            // Show loading
            document.getElementById('loadingSpinner').classList.remove('hidden');
            cardsContainer.innerHTML = '';
            
            try {
                currentResults = await searchCards(query, currentFilters);
                
                // Update results count
                document.getElementById('resultsCount').textContent = 
                    `${currentResults.length} carta${currentResults.length !== 1 ? 's' : ''} encontrada${currentResults.length !== 1 ? 's' : ''}`;
                
                // Render results
                if (currentView === 'grid') {
                    renderCardsInGrid(currentResults, cardsContainer);
                } else {
                    renderCardsInList(currentResults, cardsContainer);
                }
                
                // Show/hide no results message
                document.getElementById('noResultsMessage').classList.toggle('hidden', currentResults.length > 0);
                
            } catch (error) {
                showNotification('Error al buscar cartas', 'error');
            } finally {
                document.getElementById('loadingSpinner').classList.add('hidden');
            }
        };
        
        // Event listeners
        searchButton?.addEventListener('click', performSearch);
        searchInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        
        // View toggle
        gridViewBtn?.addEventListener('click', () => {
            currentView = 'grid';
            gridViewBtn.classList.add('bg-orange-500', 'text-white');
            gridViewBtn.classList.remove('bg-gray-200', 'text-gray-700');
            listViewBtn.classList.remove('bg-orange-500', 'text-white');
            listViewBtn.classList.add('bg-gray-200', 'text-gray-700');
            
            // Update container classes
            cardsContainer.className = 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6';
            
            // Re-render if there are results
            if (currentResults.length > 0) {
                renderCardsInGrid(currentResults, cardsContainer);
            }
        });
        
        listViewBtn?.addEventListener('click', () => {
            currentView = 'list';
            listViewBtn.classList.add('bg-orange-500', 'text-white');
            listViewBtn.classList.remove('bg-gray-200', 'text-gray-700');
            gridViewBtn.classList.remove('bg-orange-500', 'text-white');
            gridViewBtn.classList.add('bg-gray-200', 'text-gray-700');
            
            // Update container classes
            cardsContainer.className = 'space-y-4';
            
            // Re-render if there are results
            if (currentResults.length > 0) {
                renderCardsInList(currentResults, cardsContainer);
            }
        });
        
        // Toggle filters
        toggleFiltersBtn?.addEventListener('click', () => {
            filtersContainer.classList.toggle('hidden');
        });
        
        // Apply filters
        applyFiltersBtn?.addEventListener('click', () => {
            currentFilters = {
                series: document.getElementById('seriesFilter').value,
                set: document.getElementById('setFilter').value,
                rarity: document.getElementById('rarityFilter').value,
                type: document.getElementById('typeFilter').value
            };
            
            if (searchInput.value.trim()) {
                performSearch();
            }
        });
        
        // Clear filters
        clearFiltersBtn?.addEventListener('click', () => {
            document.getElementById('seriesFilter').value = '';
            document.getElementById('setFilter').value = '';
            document.getElementById('rarityFilter').value = '';
            document.getElementById('typeFilter').value = '';
            currentFilters = {};
            
            if (searchInput.value.trim()) {
                performSearch();
            }
        });
        
        // Load sets and series for filters (placeholder)
        // This would be loaded from API
    }
};