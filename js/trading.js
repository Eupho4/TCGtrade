// TCGtrade - Funciones de Intercambios
// JavaScript extraído del HTML para mejor organización

// Función de búsqueda de cartas para intercambios con debounce
let searchTimeout;
window.searchCardForTrade = async function(input, type, cardIndex) {
    const query = input.value.trim();
    const resultsContainer = input.parentElement.nextElementSibling;
    
    // Limpiar timeout anterior
    clearTimeout(searchTimeout);
    
    if (query.length < 2) {
        resultsContainer.classList.add('hidden');
        resultsContainer.innerHTML = '';
        return;
    }
    
    // Mostrar loading
    resultsContainer.innerHTML = `
        <div class="p-3 text-center text-gray-500 dark:text-gray-400">
            <div class="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
            <span class="ml-2">Buscando...</span>
        </div>
    `;
    resultsContainer.classList.remove('hidden');
    
    // Debounce de 300ms
    searchTimeout = setTimeout(async () => {
        try {
            // Usar el proxy en lugar de la API directa
            const encodedQuery = encodeURIComponent(query);
            const response = await fetch(`https://tcgtrade-production.up.railway.app/api/pokemontcg/cards?q=${encodedQuery}&pageSize=10`, {
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            
            if (data.data && data.data.length > 0) {
                // Función para escapar caracteres especiales en onclick
                const escapeForOnclick = (str) => {
                    return String(str || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"');
                };
                
                resultsContainer.innerHTML = data.data.map(card => `
                    <div class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2 border-b border-gray-200 dark:border-gray-600 last:border-0"
                         onclick="selectCardForTrade('${type}', ${cardIndex}, '${escapeForOnclick(card.id)}', '${escapeForOnclick(card.name)}', '${escapeForOnclick(card.images.small)}', '${escapeForOnclick(card.set?.name || '')}', '${escapeForOnclick(card.number || '')}')">
                        <img src="${card.images.small}" alt="${card.name}" class="w-10 h-14 object-contain">
                        <div class="flex-1">
                            <div class="font-medium text-sm text-gray-900 dark:text-white">${card.name}</div>
                            <div class="text-xs text-gray-500 dark:text-gray-400">${card.set?.name || 'Set desconocido'} - ${card.number || 'N/A'}</div>
                        </div>
                    </div>
                `).join('');
            } else {
                resultsContainer.innerHTML = `
                    <div class="p-3 text-center text-gray-500 dark:text-gray-400">
                        No se encontraron cartas
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error buscando cartas:', error);
            resultsContainer.innerHTML = `
                <div class="p-3 text-center text-red-500">
                    Error al buscar cartas. Intenta de nuevo.
                </div>
            `;
            // Reintentar con timeout más largo
            setTimeout(() => {
                resultsContainer.classList.add('hidden');
            }, 3000);
        }
    }, 500); // Aumentar debounce a 500ms para evitar demasiadas peticiones
};

// Función para seleccionar una carta del autocompletado
window.selectCardForTrade = function(type, cardIndex, cardId, cardName, cardImage, setName, cardNumber, shouldLock = false) {
    console.log('🎯 selectCardForTrade llamado:', { type, cardIndex, cardName, shouldLock });
    console.log('📍 Llamado desde:', shouldLock ? 'MIS CARTAS' : 'BUSCADOR API');
    
    // Usar el ID correcto del contenedor
    const containerId = type === 'offered' ? 'offeredCardsContainer' : 'wantedCardsContainer';
    const container = document.getElementById(containerId);
    
    if (!container) {
        console.error('❌ selectCardForTrade: No se encontró el contenedor:', containerId);
        alert('Error: No se pudo encontrar el contenedor de cartas. Recarga la página.');
        return;
    }
    
    const cardElement = container.querySelectorAll('.trade-card')[cardIndex];
    
    if (cardElement) {
        console.log('✅ Elemento de carta encontrado en índice:', cardIndex);
        
        // Actualizar el input visible
        const nameInput = cardElement.querySelector(`input[name="${type}_name_${cardIndex}"]`);
        if (nameInput) {
            nameInput.value = cardName;
            
            // Solo bloquear si viene de "Mis Cartas" (shouldLock = true)
            if (shouldLock) {
                nameInput.readOnly = true;
                nameInput.classList.add('bg-gray-100', 'dark:bg-gray-700', 'cursor-not-allowed');
                nameInput.classList.remove('bg-white', 'dark:bg-gray-700');
                console.log('✅ Carta seleccionada desde Mis Cartas y BLOQUEADA:', cardName);
                
                // Bloquear también los selectores
                const conditionSelect = cardElement.querySelector('select[name*="_condition_"]');
                const languageSelect = cardElement.querySelector('select[name*="_language_"]');
                if (conditionSelect) {
                    conditionSelect.disabled = true;
                    conditionSelect.classList.add('bg-gray-100', 'dark:bg-gray-700', 'cursor-not-allowed');
                }
                if (languageSelect) {
                    languageSelect.disabled = true;
                    languageSelect.classList.add('bg-gray-100', 'dark:bg-gray-700', 'cursor-not-allowed');
                }
                
                // SOLO desde Mis Cartas: Añadir nueva fila vacía después de bloquear
                setTimeout(() => {
                    if (typeof addCardToTrade === 'function') {
                        addCardToTrade(type);
                    }
                }, 100);
            } else {
                // Desde el buscador API - NO bloquear y NO crear nueva línea
                console.log('✅ Carta seleccionada desde buscador (sin bloquear, sin nueva línea):', cardName);
                // NO hacer nada más, solo llenar los datos
            }
        } else {
            console.error('❌ No se encontró el input de nombre');
        }
        
        // Actualizar los campos ocultos
        const idInput = cardElement.querySelector(`input[name="${type}_id_${cardIndex}"]`);
        const imageInput = cardElement.querySelector(`input[name="${type}_image_${cardIndex}"]`);
        const setInput = cardElement.querySelector(`input[name="${type}_set_${cardIndex}"]`);
        const numberInput = cardElement.querySelector(`input[name="${type}_number_${cardIndex}"]`);
        
        if (idInput) idInput.value = cardId;
        if (imageInput) imageInput.value = cardImage;
        if (setInput) setInput.value = setName;
        if (numberInput) numberInput.value = cardNumber;
        
        // Ocultar resultados (solo si existe nameInput)
        if (nameInput && nameInput.parentElement && nameInput.parentElement.nextElementSibling) {
            const resultsContainer = nameInput.parentElement.nextElementSibling;
            resultsContainer.classList.add('hidden');
            resultsContainer.innerHTML = '';
        }
        
        // Solo mostrar miniatura si viene de "Mis Cartas" (cuando se bloquea)
        if (shouldLock) {
            showCardThumbnail(cardElement, cardImage, cardName);
        }
        
        // Actualizar título generado
        if (typeof updateGeneratedTitle === 'function') {
            updateGeneratedTitle();
        }
    }
};

// Función para mostrar miniatura de carta seleccionada
function showCardThumbnail(cardElement, imageUrl, cardName) {
    if (!imageUrl) {
        console.log('⚠️ No hay URL de imagen para mostrar miniatura');
        return;
    }
    
    // Buscar el input de nombre
    const nameInput = cardElement.querySelector('.card-name-input');
    if (!nameInput) return;
    
    // Buscar o crear contenedor de miniatura al lado del input
    let thumbnailContainer = cardElement.querySelector('.card-thumbnail-inline');
    
    if (!thumbnailContainer) {
        // Crear contenedor inline para el icono con hover
        thumbnailContainer = document.createElement('div');
        thumbnailContainer.className = 'card-thumbnail-inline absolute right-2 top-1/2 -translate-y-1/2 z-10';
        nameInput.parentElement.style.position = 'relative';
        nameInput.parentElement.appendChild(thumbnailContainer);
        
        // Ajustar padding del input para hacer espacio al icono
        nameInput.style.paddingRight = '2.5rem';
    }
    
    // Usar un ID único en lugar del índice para evitar problemas
    const uniqueId = `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    thumbnailContainer.setAttribute('data-card-id', uniqueId);
    
    thumbnailContainer.innerHTML = `
        <div class="relative group">
            <button type="button" 
                    class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                    title="Ver carta">
                <span class="text-xl">🖼️</span>
            </button>
            <!-- Preview on hover - Tamaño grande y centrado -->
            <div class="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
                <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl p-2">
                    <img src="${imageUrl}" alt="${cardName}" class="w-32 h-44 object-contain">
                    <div class="text-xs text-center mt-1 text-gray-600 dark:text-gray-300 max-w-32 truncate">${cardName}</div>
                </div>
            </div>
        </div>
    `;
}

// Exportar funciones para uso global
window.searchCardForTrade = window.searchCardForTrade;
window.selectCardForTrade = window.selectCardForTrade;
window.showCardThumbnail = showCardThumbnail;

console.log('🚀 Módulo de intercambios cargado');